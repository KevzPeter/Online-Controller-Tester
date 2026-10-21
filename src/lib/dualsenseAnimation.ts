import { MathUtils, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { applyAxisCalibration, type CalibrationSettings } from "./calibration";

export const DUALSENSE_BUTTONS: Record<string, number> = {
    cross: 0, circle: 1, square: 2, triangle: 3,
    l1: 4, r1: 5, l2: 6, r2: 7, create: 8, options: 9,
    leftStick: 10, rightStick: 11, up: 12, down: 13, left: 14, right: 15,
    ps: 16, touchpad: 17,
};

export type AnimatedControl = {
    mesh: Mesh;
    origin: Vector3;
    material: MeshStandardMaterial;
    pressure: number;
};

export function animateDualSense(
    controls: AnimatedControl[],
    gamepad: Gamepad | null,
    settings: CalibrationSettings,
    delta: number,
    reducedMotion: boolean,
) {
    // Time-based damping keeps travel consistent on 60 Hz and 144 Hz displays.
    const blend = reducedMotion ? 1 : 1 - Math.exp(-35 * Math.min(delta, .1));
    for (const control of controls) {
        const { mesh, origin, material } = control;
        const button = gamepad?.buttons[DUALSENSE_BUTTONS[mesh.name]];
        const trigger = mesh.name === "l2" || mesh.name === "r2";
        const target = trigger
            ? MathUtils.clamp((button?.value ?? (button?.pressed ? 1 : 0)) * settings.triggerSensitivity, 0, 1)
            : button?.pressed ? 1 : 0;
        control.pressure = MathUtils.lerp(control.pressure, target, blend);
        const pressure = control.pressure;
        mesh.position.copy(origin);
        if (mesh.name.endsWith("Stick")) {
            const left = mesh.name === "leftStick";
            const index = left ? 0 : 2;
            const sensitivity = left ? settings.leftSensitivity : settings.rightSensitivity;
            const x = applyAxisCalibration(gamepad?.axes[index] ?? 0, sensitivity,
                left ? settings.invertLeftX : settings.invertRightX, settings.deadzone);
            const y = applyAxisCalibration(gamepad?.axes[index + 1] ?? 0, sensitivity,
                left ? settings.invertLeftY : settings.invertRightY, settings.deadzone);
            mesh.rotation.x = MathUtils.lerp(mesh.rotation.x, y * .35, blend);
            mesh.rotation.y = MathUtils.lerp(mesh.rotation.y, x * .35, blend);
            mesh.position.z -= .035 * pressure;
            material.emissiveIntensity = Math.max(pressure, Math.hypot(x, y) * .35);
        } else {
            mesh.rotation.x = trigger ? -.45 * pressure : 0;
            if (!trigger) {
                if (mesh.name === "l1" || mesh.name === "r1") mesh.position.y -= .035 * pressure;
                else mesh.position.z -= .025 * pressure;
            }
            material.emissiveIntensity = pressure * .85;
        }
    }
}
