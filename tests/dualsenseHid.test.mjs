import assert from "node:assert/strict";
import test from "node:test";
import "./helpers/registerTsAliases.mjs";

const tick = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
};

class Device extends EventTarget {
    vendorId = 0x054c;
    productId = 0x0ce6;
    productName = "Test DualSense";
    opened = false;
    opens = 0;
    closes = 0;
    opening = null;

    async open() {
        this.opens++;
        if (this.opening) await this.opening.promise;
        this.opened = true;
    }
    async close() {
        this.closes++;
        this.opened = false;
    }
    async receiveFeatureReport() { return new DataView(new ArrayBuffer(41)); }
    report() {
        const bytes = new Uint8Array(63);
        bytes.set([128, 128, 128, 128]);
        bytes[4] = 128;
        bytes[7] = 0x28; // Cross, neutral D-pad.
        bytes[8] = 0x04; // L2.
        bytes[52] = 0x16;
        const event = new Event("inputreport");
        Object.assign(event, { reportId: 1, data: new DataView(bytes.buffer) });
        this.dispatchEvent(event);
    }
}

class Hid extends EventTarget {
    devices = [];
    selection = [];
    requests = 0;
    enumeration = null;
    async getDevices() { return this.enumeration ? this.enumeration.promise : this.devices; }
    async requestDevice() {
        this.requests++;
        return this.selection;
    }
    emit(type, device) {
        const event = new Event(type);
        Object.assign(event, { device });
        this.dispatchEvent(event);
    }
}

let instance = 0;
async function setup(t, { secure = true, available = true } = {}) {
    const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    const hid = new Hid();
    Object.defineProperty(globalThis, "navigator", {
        configurable: true, value: available ? { hid } : {},
    });
    Object.defineProperty(globalThis, "window", { configurable: true, value: { isSecureContext: secure } });
    const api = await import(`../src/lib/dualsenseHid.ts?test=${instance++}`);
    t.after(async () => {
        await api.disconnectDualSenseHid();
        if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator);
        else delete globalThis.navigator;
        if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
        else delete globalThis.window;
    });
    return { api, hid };
}

test("initialization reuses permission without prompting and maps HID inputs", async (t) => {
    const { api, hid } = await setup(t);
    const device = new Device();
    hid.devices = [device];
    api.initializeDualSenseHid();
    api.initializeDualSenseHid();
    await tick();
    assert.equal(device.opens, 1);
    assert.equal(hid.requests, 0);
    assert.equal(api.getDualSenseHidState().connected, true);
    device.report();
    const gamepad = api.getDualSenseHidGamepad();
    assert.equal(gamepad.mapping, "standard");
    assert.equal(gamepad.buttons[0].pressed, true);
    assert.equal(gamepad.buttons[6].value, 128 / 255);
    assert.equal(gamepad.buttons[12].pressed, false);
    assert.deepEqual(gamepad.battery, { level: 0.65, charging: true });
    assert.equal(api.getDualSenseHidServerState().supported, false);
    assert.equal(api.getDualSenseHidServerState().report, null);
});

test("physical disconnect clears input and a permitted reconnect opens once", async (t) => {
    const { api, hid } = await setup(t);
    const device = new Device();
    hid.devices = [device];
    api.initializeDualSenseHid();
    await tick();
    device.report();
    hid.emit("disconnect", device);
    assert.equal(api.getDualSenseHidState().connected, false);
    assert.equal(api.getDualSenseHidGamepad(), null);
    device.report(); // Detached devices must not repopulate input.
    assert.equal(api.getDualSenseHidState().report, null);
    hid.emit("connect", device);
    hid.emit("connect", device);
    await tick();
    assert.equal(device.opens, 2);
    assert.equal(api.getDualSenseHidState().connected, true);
});

test("manual disconnect stays disconnected until another explicit request", async (t) => {
    const { api, hid } = await setup(t);
    const device = new Device();
    hid.devices = [device];
    hid.selection = [device];
    api.initializeDualSenseHid();
    await tick();
    await api.disconnectDualSenseHid();
    hid.emit("connect", device);
    await tick();
    assert.equal(api.getDualSenseHidState().connected, false);
    await api.requestDualSenseHid();
    assert.equal(api.getDualSenseHidState().connected, true);
    assert.equal(hid.requests, 1);
});

test("disconnect cancels an in-flight open and closes the late device", async (t) => {
    const { api, hid } = await setup(t);
    const device = new Device();
    device.opening = deferred();
    hid.devices = [device];
    api.initializeDualSenseHid();
    await tick();
    assert.equal(api.getDualSenseHidState().connecting, true);
    await api.disconnectDualSenseHid();
    device.opening.resolve();
    await tick();
    assert.equal(device.opened, false);
    assert.equal(api.getDualSenseHidState().connected, false);
    assert.equal(api.getDualSenseHidState().connecting, false);
});

test("a cancelled old open cannot overwrite a newer connection", async (t) => {
    const { api, hid } = await setup(t);
    const old = new Device();
    old.opening = deferred();
    hid.devices = [old];
    api.initializeDualSenseHid();
    await tick();
    await api.disconnectDualSenseHid();
    const current = new Device();
    current.productName = "Current controller";
    hid.selection = [current];
    await api.requestDualSenseHid();
    old.opening.resolve();
    await tick();
    assert.equal(old.opened, false);
    assert.equal(current.opened, true);
    assert.equal(api.getDualSenseHidState().deviceName, "Current controller");
});

test("permission selection blocks duplicate prompts and clears cancellation", async (t) => {
    const { api, hid } = await setup(t);
    const selection = deferred();
    hid.selection = selection.promise;
    const request = api.requestDualSenseHid();
    await api.requestDualSenseHid();
    assert.equal(hid.requests, 1);
    assert.equal(api.getDualSenseHidState().connecting, true);
    selection.resolve([]);
    await request;
    assert.equal(api.getDualSenseHidState().connecting, false);
    assert.equal(api.getDualSenseHidState().error, "");
});

test("late enumeration cannot reconnect after a manual disconnect", async (t) => {
    const { api, hid } = await setup(t);
    hid.enumeration = deferred();
    api.initializeDualSenseHid();
    await api.disconnectDualSenseHid();
    const device = new Device();
    hid.enumeration.resolve([device]);
    await tick();
    assert.equal(device.opens, 0);
    assert.equal(api.getDualSenseHidState().connected, false);
});

test("failed opens release the connecting state and allow retry", async (t) => {
    const { api, hid } = await setup(t);
    const device = new Device();
    device.opening = deferred();
    hid.selection = [device];
    const request = api.requestDualSenseHid();
    device.opening.reject(new Error("Device busy"));
    await request;
    assert.equal(api.getDualSenseHidState().error, "Device busy");
    assert.equal(api.getDualSenseHidState().connecting, false);
    device.opening = null;
    await api.requestDualSenseHid();
    assert.equal(api.getDualSenseHidState().connected, true);
    assert.equal(api.getDualSenseHidState().error, "");
});

test("unsupported and insecure contexts never request permission", async (t) => {
    for (const options of [{ available: false }, { secure: false }]) {
        await t.test(JSON.stringify(options), async (t) => {
            const { api, hid } = await setup(t, options);
            api.initializeDualSenseHid();
            await api.requestDualSenseHid();
            assert.equal(api.getDualSenseHidState().supported, false);
            assert.equal(hid.requests, 0);
            assert.match(api.getDualSenseHidState().error, /HTTPS or localhost/);
        });
    }
});
