// DualSense report layout follows Sony's hid-playstation driver:
// https://github.com/torvalds/linux/blob/master/drivers/hid/hid-playstation.c
// WebHID strips the report ID from inputreport data.
export const DUALSENSE_VENDOR_ID = 0x054c;
export const DUALSENSE_PRODUCT_IDS = [0x0ce6, 0x0df2] as const;

export type Vector3 = { x: number; y: number; z: number };

export type DualSenseReport = {
    axes: { leftStick: { x: number; y: number }; rightStick: { x: number; y: number } };
    triggers: { left: number; right: number };
    buttons: {
        x: boolean; circle: boolean; square: boolean; triangle: boolean;
        l1: boolean; r1: boolean; l2: boolean; r2: boolean; l3: boolean; r3: boolean;
        create: boolean; options: boolean; power: boolean; touchpad: boolean;
        dpad: { up: boolean; down: boolean; left: boolean; right: boolean };
    };
    batteryLevel: number | null;
    batteryCharging: boolean | null;
    batteryStatus: "charging" | "discharging" | "full" | "error" | "unknown";
    gyro: Vector3;
    accel: Vector3;
    transport: "usb" | "bluetooth";
};

const axis = (value: number) => Math.max(-1, Math.min(1, (value - 127.5) / 127.5));

export function parseDualSenseReport(reportId: number, data: DataView): DualSenseReport | null {
    const transport = reportId === 0x01 && data.byteLength >= 63
        ? "usb"
        : reportId === 0x31 && data.byteLength >= 77 ? "bluetooth" : null;
    if (!transport) return null;

    const offset = transport === "bluetooth" ? 1 : 0;
    const byte = (index: number) => data.getUint8(index + offset);
    const hat = byte(7) & 0x0f;
    const face = byte(7);
    const shoulders = byte(8);
    const system = byte(9);
    const battery = byte(52);
    const batteryCode = battery >> 4;
    const batteryLevel = batteryCode <= 2
        ? (batteryCode === 2 ? 1 : Math.min(1, ((battery & 0x0f) * 10 + 5) / 100))
        : null;
    const batteryStatus = batteryCode === 0 ? "discharging"
        : batteryCode === 1 ? "charging" : batteryCode === 2 ? "full"
            : batteryCode === 0x0a || batteryCode === 0x0b || batteryCode === 0x0f ? "error" : "unknown";
    const vector = (start: number, scale: number): Vector3 => ({
        x: data.getInt16(start + offset, true) / scale,
        y: data.getInt16(start + offset + 2, true) / scale,
        z: data.getInt16(start + offset + 4, true) / scale,
    });

    return {
        axes: {
            leftStick: { x: axis(byte(0)), y: axis(byte(1)) },
            rightStick: { x: axis(byte(2)), y: axis(byte(3)) },
        },
        triggers: { left: byte(4) / 255, right: byte(5) / 255 },
        buttons: {
            x: Boolean(face & 0x20), circle: Boolean(face & 0x40),
            square: Boolean(face & 0x10), triangle: Boolean(face & 0x80),
            l1: Boolean(shoulders & 0x01), r1: Boolean(shoulders & 0x02),
            l2: Boolean(shoulders & 0x04), r2: Boolean(shoulders & 0x08),
            create: Boolean(shoulders & 0x10), options: Boolean(shoulders & 0x20),
            l3: Boolean(shoulders & 0x40), r3: Boolean(shoulders & 0x80),
            power: Boolean(system & 0x01), touchpad: Boolean(system & 0x02),
            dpad: {
                up: hat === 0 || hat === 1 || hat === 7,
                right: hat === 1 || hat === 2 || hat === 3,
                down: hat === 3 || hat === 4 || hat === 5,
                left: hat === 5 || hat === 6 || hat === 7,
            },
        },
        batteryLevel,
        batteryCharging: batteryStatus === "charging" ? true
            : batteryStatus === "discharging" || batteryStatus === "full" ? false : null,
        batteryStatus,
        // Nominal raw scales; calibration feature report is not applied.
        // SDL's uncalibrated conversion is raw * 64 / 1024 degrees/second:
        // https://github.com/libsdl-org/SDL/blob/main/src/joystick/hidapi/SDL_hidapi_ps5.c
        gyro: vector(15, 16), // degrees/second
        accel: vector(21, 8192), // g
        transport,
    };
}
