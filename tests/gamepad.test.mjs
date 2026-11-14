import assert from "node:assert/strict";
import test from "node:test";
import "./helpers/registerTsAliases.mjs";

const { detectControllerType, getActiveGamepad } = await import("../src/lib/gamepad.ts");
const { requestDualSenseHid, disconnectDualSenseHid } = await import("../src/lib/dualsenseHid.ts");

test("detects supported controller names and Sony product IDs", () => {
    for (const id of ["Xbox Wireless Controller", "X-Box Controller", "XInput STANDARD GAMEPAD"]) {
        assert.equal(detectControllerType(id), "xbox");
    }
    for (const id of ["DualSense Wireless Controller", "054c-0ce6", "Vendor: 054c Product: 0df2"]) {
        assert.equal(detectControllerType(id), "dualsense");
    }
    assert.equal(detectControllerType("Other controller"), "");
});

test("native selection and HID fallback stay consistent", async (t) => {
    const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    let pads = [];
    let denied = false;
    let getGamepadsAvailable = true;
    const device = new EventTarget();
    Object.assign(device, {
        vendorId: 0x054c, productId: 0x0df2, productName: "DualSense Edge", opened: false,
        async open() { this.opened = true; },
        async close() { this.opened = false; },
        async receiveFeatureReport() { return new DataView(new ArrayBuffer(41)); },
    });
    const browser = {
        hid: { requestDevice: async () => [device] },
        get getGamepads() {
            if (!getGamepadsAvailable) return undefined;
            return () => {
                if (denied) throw new DOMException("Denied", "SecurityError");
                return pads;
            };
        },
    };
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: browser });
    Object.defineProperty(globalThis, "window", { configurable: true, value: { isSecureContext: true } });
    t.after(async () => {
        await disconnectDualSenseHid();
        if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator);
        else delete globalThis.navigator;
        if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
        else delete globalThis.window;
    });

    assert.equal(getActiveGamepad(), null);
    const native = { id: "DualSense Wireless Controller", connected: true };
    pads = [null, { connected: false }, native];
    assert.equal(getActiveGamepad(), native);
    await requestDualSenseHid();
    assert.equal(getActiveGamepad(), native); // No full report yet.
    const event = new Event("inputreport");
    Object.assign(event, { reportId: 1, data: new DataView(new ArrayBuffer(63)) });
    device.dispatchEvent(event);
    assert.match(getActiveGamepad().id, /DualSense WebHID.*0df2/);

    const xbox = { id: "Xbox Wireless Controller", connected: true };
    pads = [xbox, native];
    assert.equal(getActiveGamepad(), xbox); // HID must not steal input from Xbox.
    const other = { id: "Other controller", connected: true };
    pads = [other];
    assert.equal(getActiveGamepad(), other);
    pads = [];
    assert.match(getActiveGamepad().id, /DualSense WebHID/);
    denied = true;
    assert.match(getActiveGamepad().id, /DualSense WebHID/);
    denied = false;
    getGamepadsAvailable = false;
    assert.match(getActiveGamepad().id, /DualSense WebHID/);
    await disconnectDualSenseHid();
    assert.equal(getActiveGamepad(), null);
    delete globalThis.navigator;
    assert.equal(getActiveGamepad(), null);
});
