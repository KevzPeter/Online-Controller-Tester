import { Quaternion, Vector3 } from "three";
import type { DualSenseReport, Vector3 as SensorVector } from "@/lib/dualsenseHidProtocol";

// PlayStation motion uses X right, Y out of the face, Z toward the grips.
// The rendered controller uses X right, Y toward the shoulder buttons, Z out of the face.
const toModelAxes = ({ x, y, z }: SensorVector) => new Vector3(x, -z, y);
const levelGravity = new Vector3(0, 0, -1);

export class DualSenseOrientation {
    readonly quaternion = new Quaternion();
    private lastTime: number | null = null;
    private latestGravity: Vector3 | null = null;
    private initialized = false;

    reset() {
        this.quaternion.identity();
        this.lastTime = null;
        this.latestGravity = null;
        this.initialized = false;
    }

    recenterHeading() {
        if (this.latestGravity) {
            // Gravity fixes tilt, but cannot reveal compass heading.
            this.quaternion.setFromUnitVectors(this.latestGravity, levelGravity);
        }
    }

    update(report: Pick<DualSenseReport, "gyro" | "accel">, timestamp: number) {
        const acceleration = toModelAxes(report.accel);
        const magnitude = acceleration.length();
        const gravityValid = magnitude > 0.75 && magnitude < 1.25;
        if (gravityValid) {
            acceleration.divideScalar(magnitude);
            this.latestGravity = acceleration.clone();
            if (!this.initialized) {
                this.quaternion.setFromUnitVectors(acceleration, levelGravity);
                this.initialized = true;
            }
        }

        const delta = this.lastTime === null ? 0 : Math.min(0.05, Math.max(0, (timestamp - this.lastTime) / 1000));
        this.lastTime = timestamp;
        if (!this.initialized || !delta) return;

        const angularVelocity = toModelAxes(report.gyro);
        const speed = angularVelocity.length();
        if (speed > 0.08) {
            const step = new Quaternion().setFromAxisAngle(
                angularVelocity.divideScalar(speed), speed * Math.PI / 180 * delta
            );
            this.quaternion.multiply(step).normalize();
        }

        if (gravityValid) {
            // Correct pitch and roll drift gently; yaw remains gyro-relative.
            const measuredInWorld = acceleration.applyQuaternion(this.quaternion);
            const correction = new Quaternion().setFromUnitVectors(measuredInWorld, levelGravity);
            const target = correction.multiply(this.quaternion);
            this.quaternion.slerp(target, 1 - Math.exp(-2 * delta)).normalize();
        }
    }
}

export const dualSenseOrientation = new DualSenseOrientation();
