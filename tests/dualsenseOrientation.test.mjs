import assert from "node:assert/strict";
import test from "node:test";
import { Quaternion, Vector3 } from "three";
import { DualSenseOrientation } from "../src/lib/dualsenseOrientation.ts";
import { parseDualSenseReport } from "../src/lib/dualsenseHidProtocol.ts";

const sample = (gyro, accel) => ({ gyro, accel });
const flat = { x: 0, y: 0, z: -1 };
const zero = { x: 0, y: 0, z: 0 };
const angleFrom = (actual, expected) => actual.angleTo(expected) * 180 / Math.PI;
const gravityFor = (pose) => new Vector3(0, 0, -1).applyQuaternion(pose.clone().invert());
const rawGyroFor = ({ x, y, z }) => ({ x, y: z, z: -y });

test("a face-up controller on a table keeps the model front-facing", () => {
    const tracker = new DualSenseOrientation();
    for (let step = 0; step <= 200; step++) {
        tracker.update(sample(zero, flat), step * 10);
    }
    assert.ok(angleFrom(tracker.quaternion, new Quaternion()) < 0.1);
    tracker.recenterHeading();
    assert.ok(angleFrom(tracker.quaternion, new Quaternion()) < 0.1);
});

for (const axis of ["x", "y"]) {
    for (const direction of [-1, 1]) {
        test(`starts with the correct ${direction * 90}-degree ${axis} tilt`, () => {
            const tracker = new DualSenseOrientation();
            const expected = new Quaternion().setFromAxisAngle(
                new Vector3(axis === "x" ? 1 : 0, axis === "y" ? 1 : 0, 0),
                direction * Math.PI / 2
            );
            tracker.update(sample(zero, gravityFor(expected)), 0);
            assert.ok(angleFrom(tracker.quaternion, expected) < 0.1);
        });
    }
}

for (const axis of ["x", "y", "z"]) {
    test(`gyro and accelerometer agree during a quarter turn about ${axis}`, () => {
        const tracker = new DualSenseOrientation();
        const unitAxis = new Vector3(axis === "x" ? 1 : 0, axis === "y" ? 1 : 0, axis === "z" ? 1 : 0);
        tracker.update(sample(zero, flat), 0);
        for (let step = 1; step <= 100; step++) {
            const expected = new Quaternion().setFromAxisAngle(unitAxis, step * Math.PI / 200);
            tracker.update(sample(rawGyroFor({ ...zero, [axis]: 90 }), gravityFor(expected)), step * 10);
        }
        const quarterTurn = new Quaternion().setFromAxisAngle(unitAxis, Math.PI / 2);
        assert.ok(angleFrom(tracker.quaternion, quarterTurn) < 1);
        tracker.update(sample(zero, gravityFor(quarterTurn)), 1100);
        assert.ok(angleFrom(tracker.quaternion, quarterTurn) < 1);
    });
}

test("heading reset removes relative yaw without losing tilt", () => {
    const tracker = new DualSenseOrientation();
    const tilt = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 4);
    const gravity = gravityFor(tilt);
    tracker.update(sample(zero, gravity), 0);
    // World heading expressed in the tilted controller's local frame.
    const yaw = new Vector3(0, 0, 90).applyQuaternion(tilt.clone().invert());
    for (let step = 1; step <= 100; step++) {
        tracker.update(sample(rawGyroFor(yaw), gravity), step * 10);
    }
    assert.ok(angleFrom(tracker.quaternion, tilt) > 80);
    tracker.recenterHeading();
    assert.ok(angleFrom(tracker.quaternion, tilt) < 0.1);
});

for (const transport of ["usb", "bluetooth"]) {
    test(`${transport} raw face-up reports stay neutral and rotate around Z for heading`, () => {
        const offset = transport === "usb" ? 0 : 1;
        const reportId = transport === "usb" ? 1 : 0x31;
        const view = new DataView(new ArrayBuffer(transport === "usb" ? 63 : 77));
        view.setInt16(25 + offset, -8192, true); // Face-up: -1 g on Z, not -Y.
        const tracker = new DualSenseOrientation();
        tracker.update(parseDualSenseReport(reportId, view), 0);
        assert.ok(angleFrom(tracker.quaternion, new Quaternion()) < 0.1);
        view.setInt16(17 + offset, 90 * 16, true); // Raw gyro Y is heading around model Z.
        for (let step = 1; step <= 100; step++) {
            tracker.update(parseDualSenseReport(reportId, view), step * 10);
        }
        const expected = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
        assert.ok(angleFrom(tracker.quaternion, expected) < 1);
    });
}

test("ignores invalid gravity and resets orientation on disconnect", () => {
    const tracker = new DualSenseOrientation();
    tracker.update(sample(zero, zero), 0);
    tracker.update(sample(zero, { x: 3, y: 0, z: 0 }), 10);
    assert.ok(angleFrom(tracker.quaternion, new Quaternion()) < 0.1);
    tracker.update(sample(zero, { x: 0, y: 1, z: 0 }), 20);
    assert.ok(angleFrom(tracker.quaternion, new Quaternion()) > 80);
    tracker.reset();
    tracker.update(sample(zero, flat), 30);
    assert.ok(angleFrom(tracker.quaternion, new Quaternion()) < 0.1);
});

test("face-up keeps buttons toward the viewer and shoulders away, face-down does not", () => {
    const tracker = new DualSenseOrientation();
    tracker.update(sample(zero, flat), 0);
    const faceNormal = new Vector3(0, 0, 1).applyQuaternion(tracker.quaternion);
    const shoulders = new Vector3(0, 1, 0).applyQuaternion(tracker.quaternion);
    assert.ok(faceNormal.z > 0.999, "face-up must not turn the joysticks toward the floor");
    assert.ok(shoulders.y > 0.999, "neutral must not reverse the shoulder-button direction");

    tracker.reset();
    tracker.update(sample(zero, { x: 0, y: 0, z: 1 }), 0);
    assert.ok(new Vector3(0, 0, 1).applyQuaternion(tracker.quaternion).z < -0.999);
});

for (const { name, rawGyro, modelAxis } of [
    { name: "pitch", rawGyro: { x: 90, y: 0, z: 0 }, modelAxis: new Vector3(1, 0, 0) },
    { name: "yaw", rawGyro: { x: 0, y: 90, z: 0 }, modelAxis: new Vector3(0, 0, 1) },
    { name: "roll", rawGyro: { x: 0, y: 0, z: 90 }, modelAxis: new Vector3(0, -1, 0) },
]) {
    test(`raw gyro ${name} drives the matching model axis without gravity masking it`, () => {
        const tracker = new DualSenseOrientation();
        tracker.update(sample(zero, flat), 0);
        for (let step = 1; step <= 100; step++) {
            tracker.update(sample(rawGyro, zero), step * 10);
        }
        const expected = new Quaternion().setFromAxisAngle(modelAxis, Math.PI / 2);
        assert.ok(angleFrom(tracker.quaternion, expected) < 0.1);
    });
}
