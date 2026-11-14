import assert from "node:assert/strict";
import test from "node:test";
import { Quaternion, Vector3 } from "three";
import { DualSenseOrientation } from "../src/lib/dualsenseOrientation.ts";
import { parseDualSenseReport } from "../src/lib/dualsenseHidProtocol.ts";

const sample = (gyro, accel) => ({ gyro, accel });
const flat = { x: 0, y: -1, z: 0 };
const angleFrom = (actual, expected) => actual.angleTo(expected) * 180 / Math.PI;

test("starts level and uses gravity to show an already tilted controller", () => {
    const tracker = new DualSenseOrientation();
    tracker.update(sample({ x: 0, y: 0, z: 0 }, flat), 0);
    assert.ok(angleFrom(tracker.quaternion, new Quaternion()) < 0.1);
    tracker.reset();
    tracker.update(sample({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }), 0);
    const expected = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
    assert.ok(angleFrom(tracker.quaternion, expected) < 0.1);
});

test("integrates gyro rotation and holds gravity-corrected tilt", () => {
    const tracker = new DualSenseOrientation();
    tracker.update(sample({ x: 0, y: 0, z: 0 }, flat), 0);
    const gravity = new Vector3(0, 0, -1);
    for (let step = 1; step <= 100; step++) {
        const expected = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), step * Math.PI / 200);
        const localGravity = gravity.clone().applyQuaternion(expected.clone().invert());
        tracker.update(sample(
            { x: 90, y: 0, z: 0 },
            { x: localGravity.x, y: localGravity.z, z: -localGravity.y }
        ), step * 10);
    }
    const quarterTurn = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
    assert.ok(angleFrom(tracker.quaternion, quarterTurn) < 1);
    tracker.update(sample({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }), 1100);
    assert.ok(angleFrom(tracker.quaternion, quarterTurn) < 1);
});

test("keeps relative heading until reset, then retains gravity tilt", () => {
    const tracker = new DualSenseOrientation();
    tracker.update(sample({ x: 0, y: 0, z: 0 }, flat), 0);
    for (let step = 1; step <= 100; step++) {
        tracker.update(sample({ x: 0, y: 90, z: 0 }, flat), step * 10);
    }
    const heading = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
    assert.ok(angleFrom(tracker.quaternion, heading) < 1);
    tracker.recenterHeading();
    assert.ok(angleFrom(tracker.quaternion, new Quaternion()) < 0.1);
});

test("raw nominal gyro reports produce a quarter turn in one second", () => {
    const bytes = new Uint8Array(63);
    const view = new DataView(bytes.buffer);
    view.setInt16(23, -8192, true); // Flat controller.
    const tracker = new DualSenseOrientation();
    tracker.update(parseDualSenseReport(1, view), 0);
    view.setInt16(17, 90 * 16, true); // 90 degrees/second about the heading axis.
    for (let step = 1; step <= 100; step++) {
        tracker.update(parseDualSenseReport(1, view), step * 10);
    }
    const expected = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
    assert.ok(angleFrom(tracker.quaternion, expected) < 1);
});
