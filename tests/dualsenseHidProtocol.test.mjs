import assert from "node:assert/strict";
import test from "node:test";
import { parseDualSenseReport } from "../src/lib/dualsenseHidProtocol.ts";

const fullReport = () => {
    const bytes = new Uint8Array(63);
    bytes.set([128, 128, 128, 128], 0);
    bytes[7] = 0x21; // Cross and north-east hat.
    bytes[8] = 0x85; // L1, L2, R3.
    bytes[9] = 0x03; // PS and touchpad.
    bytes[52] = 0x16; // Charging, 60-69%.
    const view = new DataView(bytes.buffer);
    view.setInt16(15, 1024, true);
    view.setInt16(17, -512, true);
    view.setInt16(21, 8192, true);
    view.setInt16(25, -4096, true);
    return bytes;
};

test("parses USB buttons, motion, and charging state", () => {
    const bytes = fullReport();
    const result = parseDualSenseReport(0x01, new DataView(bytes.buffer));
    assert.equal(result?.transport, "usb");
    assert.equal(result?.buttons.x, true);
    assert.equal(result?.buttons.l2, true);
    assert.equal(result?.buttons.r3, true);
    assert.deepEqual(result?.buttons.dpad, { up: true, right: true, down: false, left: false });
    assert.equal(result?.batteryLevel, 0.65);
    assert.equal(result?.batteryCharging, true);
    assert.deepEqual(result?.gyro, { x: 64, y: -32, z: 0 });
    assert.deepEqual(result?.accel, { x: 1, y: 0, z: -0.5 });
});

test("parses Bluetooth full report and ignores its short report", () => {
    const bytes = new Uint8Array(77);
    bytes.set(fullReport(), 1);
    const result = parseDualSenseReport(0x31, new DataView(bytes.buffer));
    assert.equal(result?.transport, "bluetooth");
    assert.equal(result?.batteryLevel, 0.65);
    assert.equal(result?.gyro.x, 64);
    assert.equal(parseDualSenseReport(0x01, new DataView(new ArrayBuffer(9))), null);
});

test("unknown battery state does not claim a charge level", () => {
    const bytes = fullReport();
    bytes[52] = 0xf6;
    const result = parseDualSenseReport(0x01, new DataView(bytes.buffer));
    assert.equal(result?.batteryLevel, null);
    assert.equal(result?.batteryCharging, null);
    assert.equal(result?.batteryStatus, "error");
});

test("rejects unknown and truncated reports", () => {
    assert.equal(parseDualSenseReport(0x02, new DataView(new ArrayBuffer(77))), null);
    assert.equal(parseDualSenseReport(0x01, new DataView(new ArrayBuffer(62))), null);
    assert.equal(parseDualSenseReport(0x31, new DataView(new ArrayBuffer(76))), null);
});

test("reads a DataView slice and clamps full batteries", () => {
    const storage = new Uint8Array(100);
    storage.set(fullReport(), 11);
    storage[11 + 52] = 0x2f;
    const result = parseDualSenseReport(1, new DataView(storage.buffer, 11, 63));
    assert.equal(result.batteryLevel, 1);
    assert.equal(result.batteryStatus, "full");
    assert.equal(result.batteryCharging, false);
    assert.equal(result.gyro.x, 64);
});

test("maps all eight hat directions and neutral", () => {
    const expected = [
        [true, false, false, false], [true, true, false, false],
        [false, true, false, false], [false, true, true, false],
        [false, false, true, false], [false, false, true, true],
        [false, false, false, true], [true, false, false, true],
        [false, false, false, false],
    ];
    expected.forEach(([up, right, down, left], hat) => {
        const bytes = fullReport();
        bytes[7] = hat;
        assert.deepEqual(parseDualSenseReport(1, new DataView(bytes.buffer)).buttons.dpad,
            { up, right, down, left });
    });
});
