import { DUALSENSE_PRODUCT_IDS, DUALSENSE_VENDOR_ID, parseDualSenseReport, type DualSenseReport } from "@/lib/dualsenseHidProtocol";
import { dualSenseOrientation } from "@/lib/dualsenseOrientation";

type HIDReportEvent = Event & { reportId: number; data: DataView };
type HIDDevice = {
    vendorId: number;
    productId: number;
    productName: string;
    opened: boolean;
    open(): Promise<void>;
    close(): Promise<void>;
    receiveFeatureReport(reportId: number): Promise<DataView>;
    addEventListener(type: "inputreport", listener: (event: HIDReportEvent) => void): void;
    removeEventListener(type: "inputreport", listener: (event: HIDReportEvent) => void): void;
};
type HID = {
    getDevices(): Promise<HIDDevice[]>;
    requestDevice(options: { filters: { vendorId: number; productId: number }[] }): Promise<HIDDevice[]>;
    addEventListener(type: "disconnect" | "connect", listener: (event: Event & { device: HIDDevice }) => void): void;
};

export type DualSenseHidState = {
    supported: boolean;
    connected: boolean;
    connecting: boolean;
    deviceName: string;
    error: string;
    report: DualSenseReport | null;
    reportRate: number;
};

const serverState: DualSenseHidState = {
    supported: false, connected: false, connecting: false,
    deviceName: "", error: "", report: null, reportRate: 0,
};
let state = serverState;
let device: HIDDevice | null = null;
let pendingDevice: HIDDevice | null = null;
let connectionVersion = 0;
let choosingDevice = false;
let autoReconnect = true;
let initialized = false;
let lastReportTime = 0;
let publishTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
const closingDevices = new WeakMap<HIDDevice, Promise<void>>();
const openingDevices = new WeakMap<HIDDevice, Promise<void>>();

const isSecureContext = () => typeof window !== "undefined" && window.isSecureContext;

const getHid = (): HID | null => {
    if (typeof navigator === "undefined") return null;
    return (navigator as Navigator & { hid?: HID }).hid ?? null;
};

const isDualSense = (candidate: HIDDevice) => candidate.vendorId === DUALSENSE_VENDOR_ID
    && DUALSENSE_PRODUCT_IDS.some((id) => candidate.productId === id);

function publish() {
    publishTimer = null;
    for (const listener of listeners) listener();
}

function notify(throttled = false) {
    if (!throttled) {
        if (publishTimer) clearTimeout(publishTimer);
        publish();
    } else if (!publishTimer) {
        publishTimer = setTimeout(publish, 100);
    }
}

function readReport(event: HIDReportEvent) {
    if (event.currentTarget !== device) return;
    const report = parseDualSenseReport(event.reportId, event.data);
    if (!report) return;
    const now = performance.now();
    dualSenseOrientation.update(report, now);
    const sampleRate = lastReportTime ? 1000 / Math.max(1, now - lastReportTime) : 0;
    lastReportTime = now;
    state = {
        ...state, report,
        reportRate: sampleRate ? (state.reportRate ? state.reportRate * 0.8 + sampleRate * 0.2 : sampleRate) : 0,
    };
    notify(true);
}

function closeDevice(candidate: HIDDevice): Promise<void> {
    const existing = closingDevices.get(candidate);
    if (existing) return existing;
    const closing = candidate.close().catch(() => {}).finally(() => {
        closingDevices.delete(candidate);
    });
    closingDevices.set(candidate, closing);
    return closing;
}

async function ensureOpen(candidate: HIDDevice) {
    await closingDevices.get(candidate);
    const existing = openingDevices.get(candidate);
    if (existing) return existing;
    if (candidate.opened) return;
    const opening = candidate.open().finally(() => {
        openingDevices.delete(candidate);
    });
    openingDevices.set(candidate, opening);
    return opening;
}

function detach(message = "") {
    dualSenseOrientation.reset();
    device?.removeEventListener("inputreport", readReport);
    device = null;
    lastReportTime = 0;
    state = {
        ...state, connected: false, connecting: false, deviceName: "",
        report: null, reportRate: 0, error: message,
    };
    notify();
}

async function openDevice(candidate: HIDDevice) {
    if (!isDualSense(candidate)) return;
    if (device === candidate && candidate.opened) return;
    if (pendingDevice === candidate) return;
    const version = ++connectionVersion;
    const previous = device;
    detach();
    if (previous) void closeDevice(previous);
    pendingDevice = candidate;
    state = { ...state, connecting: true, error: "" };
    notify();
    try {
        await ensureOpen(candidate);
        if (version !== connectionVersion) {
            // A disconnect or a newer connection wins, even if open() resolves late.
            if (candidate !== device && candidate !== pendingDevice) await closeDevice(candidate);
            return;
        }
        pendingDevice = null;
        device = candidate;
        candidate.addEventListener("inputreport", readReport);
        state = {
            ...state, connecting: false, connected: true,
            deviceName: candidate.productName || "DualSense controller", error: "",
            report: null, reportRate: 0,
        };
        notify();
        // On Bluetooth, requesting calibration can enable full 0x31 reports.
        void candidate.receiveFeatureReport(0x05).catch(() => {});
    } catch (error) {
        if (version !== connectionVersion) return;
        pendingDevice = null;
        detach(error instanceof Error ? error.message : "Could not open the DualSense HID device.");
    }
}

export function initializeDualSenseHid() {
    if (initialized) return;
    const hid = getHid();
    state = { ...state, supported: Boolean(hid && isSecureContext()) };
    notify();
    if (!hid || !isSecureContext()) return;
    initialized = true;
    hid.addEventListener("disconnect", (event) => {
        if (event.device === device || event.device === pendingDevice) {
            connectionVersion++;
            pendingDevice = null;
            const previous = device;
            detach("DualSense disconnected.");
            if (previous) void closeDevice(previous);
        }
    });
    hid.addEventListener("connect", (event) => {
        if (autoReconnect && !choosingDevice && !device && !pendingDevice && isDualSense(event.device)) {
            void openDevice(event.device);
        }
    });
    const version = connectionVersion;
    void hid.getDevices().then((devices) => {
        const existing = devices.find(isDualSense);
        if (existing && autoReconnect && !choosingDevice && !device && !pendingDevice && version === connectionVersion) {
            void openDevice(existing);
        }
    }).catch(() => {});
}

export async function requestDualSenseHid() {
    const hid = getHid();
    if (!hid || !isSecureContext()) {
        state = { ...state, error: "WebHID requires a supported desktop browser and HTTPS or localhost." };
        notify();
        return;
    }
    if (choosingDevice || pendingDevice) return;
    const version = ++connectionVersion;
    choosingDevice = true;
    state = { ...state, connecting: true, error: "" };
    notify();
    try {
        // Must run directly in a click handler for the browser's permission prompt.
        const devices = await hid.requestDevice({
            filters: DUALSENSE_PRODUCT_IDS.map((productId) => ({ vendorId: DUALSENSE_VENDOR_ID, productId })),
        });
        if (version !== connectionVersion) return;
        choosingDevice = false;
        if (devices[0]) {
            autoReconnect = true;
            await openDevice(devices[0]);
        }
    } catch (error) {
        if (version !== connectionVersion) return;
        if (error instanceof DOMException && error.name === "NotFoundError") return;
        state = { ...state, error: error instanceof Error ? error.message : "Could not connect to WebHID." };
        notify();
    } finally {
        if (version === connectionVersion) {
            choosingDevice = false;
            state = { ...state, connecting: false };
            notify();
        }
    }
}

export async function disconnectDualSenseHid() {
    autoReconnect = false;
    connectionVersion++;
    choosingDevice = false;
    pendingDevice = null;
    const current = device;
    detach();
    if (current) await closeDevice(current);
}

export function getDualSenseHidState(): DualSenseHidState { return state; }
export function getDualSenseHidServerState(): DualSenseHidState { return serverState; }

export function getDualSenseHidGamepad(): Gamepad | null {
    const report = state.connected ? state.report : null;
    if (!report) return null;
    const button = (pressed: boolean, value = pressed ? 1 : 0): GamepadButton => ({
        pressed, touched: pressed || value > 0, value,
    });
    const { buttons, axes, triggers } = report;
    // Gamepad consumers use only standard input fields; HID has no browser haptic actuator.
    return {
        id: `DualSense WebHID (054c:${device?.productId.toString(16).padStart(4, "0") ?? "0ce6"})`,
        connected: true,
        index: 0,
        mapping: "standard",
        timestamp: lastReportTime,
        axes: [axes.leftStick.x, axes.leftStick.y, axes.rightStick.x, axes.rightStick.y],
        buttons: [
            button(buttons.x), button(buttons.circle), button(buttons.square), button(buttons.triangle),
            button(buttons.l1), button(buttons.r1), button(buttons.l2, triggers.left),
            button(buttons.r2, triggers.right), button(buttons.create), button(buttons.options),
            button(buttons.l3), button(buttons.r3), button(buttons.dpad.up), button(buttons.dpad.down),
            button(buttons.dpad.left), button(buttons.dpad.right), button(buttons.power), button(buttons.touchpad),
        ],
        battery: { level: report.batteryLevel, charging: report.batteryCharging },
    } as unknown as Gamepad;
}

export function subscribeDualSenseHid(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}
