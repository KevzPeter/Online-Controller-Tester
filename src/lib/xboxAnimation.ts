import { Color, MathUtils, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { applyAxisCalibration, type CalibrationSettings } from "./calibration";

export const XBOX_BUTTONS: Record<string, number> = {
    a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7,
    view: 8, menu: 9, leftStick: 10, rightStick: 11, guide: 16,
};
export const XBOX_DPAD: Record<string, number> = { up: 12, down: 13, left: 14, right: 15 };
type Highlight = { value: number };
export type XboxControl = {
    object: Object3D;
    origin: Vector3;
    pressure: number;
    highlights: Highlight[];
};
export type XboxRig = {
    model: Object3D;
    controls: XboxControl[];
    dpad: Object3D;
    dpadOrigin: Vector3;
    directions: Record<string, Highlight>;
    materials: MeshStandardMaterial[];
};

// Preserve the atlas's original emissive details at rest. A uniform overlays
// the WHOLE active surface, including regions blacked out in the emissive map.
export function addXboxHighlight(
    material: MeshStandardMaterial,
    highlight: Highlight,
    directions?: Record<string, Highlight>,
) {
    material.onBeforeCompile = (shader) => {
        shader.uniforms.inputHighlight = highlight;
        shader.uniforms.inputHighlightColor = { value: new Color("#22c55e").multiplyScalar(1.8) };
        let amount = "inputHighlight";
        if (directions) {
            for (const direction of Object.keys(XBOX_DPAD)) {
                shader.uniforms[`input_${direction}`] = directions[direction];
            }
            // Per-fragment sectors avoid jagged edges from the source's irregular
            // triangulation. All sectors remain part of the same moving dish.
            shader.vertexShader = `varying vec2 inputDpadPosition;\n${shader.vertexShader}`
                .replace("#include <begin_vertex>", "#include <begin_vertex>\ninputDpadPosition = position.xy;");
            shader.fragmentShader = `varying vec2 inputDpadPosition;
uniform float input_up, input_down, input_left, input_right;
${shader.fragmentShader}`;
            amount = "(abs(inputDpadPosition.x) > abs(inputDpadPosition.y) ? (inputDpadPosition.x > 0.0 ? input_right : input_left) : (inputDpadPosition.y > 0.0 ? input_up : input_down))";
        }
        shader.fragmentShader = `uniform float inputHighlight;\nuniform vec3 inputHighlightColor;\n${shader.fragmentShader}`
            .replace("#include <emissivemap_fragment>",
                `#include <emissivemap_fragment>\ntotalEmissiveRadiance = mix(totalEmissiveRadiance, inputHighlightColor, ${amount});`);
    };
    material.customProgramCacheKey = () => directions ? "xbox-dpad-highlight-v1" : "xbox-input-highlight-v1";
}

export function createXboxRig(source: Object3D): XboxRig {
    const model = source.clone(true);
    const dpad = model.getObjectByName("dpad");
    if (!dpad) throw new Error("Xbox asset is missing the D-pad");
    const controls: XboxControl[] = [];
    const materials: MeshStandardMaterial[] = [];
    const directions: Record<string, Highlight> = {};
    for (const name of Object.keys(XBOX_BUTTONS)) {
        const object = model.getObjectByName(name);
        if (!object) throw new Error(`Xbox asset is missing ${name}`);
        const highlights: Highlight[] = [];
        object.traverse((child) => {
            if (!(child instanceof Mesh)) return;
            const originals = Array.isArray(child.material) ? child.material : [child.material];
            const clones = originals.map((original) => {
                if (!(original instanceof MeshStandardMaterial)) throw new Error("Unsupported Xbox material");
                const material = original.clone();
                const highlight = { value: 0 };
                addXboxHighlight(material, highlight);
                materials.push(material);
                highlights.push(highlight);
                return material;
            });
            child.material = Array.isArray(child.material) ? clones : clones[0];
        });
        controls.push({ object, origin: object.position.clone(), pressure: 0, highlights });
    }
    for (const direction of Object.keys(XBOX_DPAD)) {
        const sector = dpad.getObjectByName(`dpad_${direction}`);
        if (!(sector instanceof Mesh) || !(sector.material instanceof MeshStandardMaterial)) {
            throw new Error(`Xbox asset is missing the ${direction} D-pad sector`);
        }
        const material = sector.material.clone();
        const highlight = { value: 0 };
        sector.material = material;
        addXboxHighlight(material, highlight, directions);
        materials.push(material);
        directions[direction] = highlight;
    }
    return { model, controls, dpad, dpadOrigin: dpad.position.clone(), directions, materials };
}

export function animateXbox(
    rig: XboxRig,
    gamepad: Gamepad | null,
    settings: CalibrationSettings,
    delta: number,
    reducedMotion: boolean,
) {
    const blend = reducedMotion ? 1 : 1 - Math.exp(-35 * Math.min(delta, .1));
    for (const control of rig.controls) {
        const { object, origin } = control;
        const button = gamepad?.buttons[XBOX_BUTTONS[object.name]];
        const trigger = object.name === "lt" || object.name === "rt";
        const target = trigger
            ? MathUtils.clamp((button?.value ?? (button?.pressed ? 1 : 0)) * settings.triggerSensitivity, 0, 1)
            : button?.pressed ? 1 : 0;
        control.pressure = MathUtils.lerp(control.pressure, target, blend);
        const pressure = control.pressure;
        let highlight = pressure;
        object.position.copy(origin);
        if (object.name.endsWith("Stick")) {
            const left = object.name === "leftStick";
            const index = left ? 0 : 2;
            const sensitivity = left ? settings.leftSensitivity : settings.rightSensitivity;
            const x = applyAxisCalibration(gamepad?.axes[index] ?? 0, sensitivity,
                left ? settings.invertLeftX : settings.invertRightX, settings.deadzone);
            const y = applyAxisCalibration(gamepad?.axes[index + 1] ?? 0, sensitivity,
                left ? settings.invertLeftY : settings.invertRightY, settings.deadzone);
            object.rotation.x = MathUtils.lerp(object.rotation.x, y * .3, blend);
            object.rotation.y = MathUtils.lerp(object.rotation.y, x * .3, blend);
            object.position.z -= .025 * pressure;
            highlight = Math.max(pressure, Math.min(1, Math.hypot(x, y)) * .45);
        } else if (trigger) {
            object.rotation.x = -.4 * pressure;
        } else if (object.name === "lb" || object.name === "rb") {
            object.position.y -= .025 * pressure;
        } else {
            object.position.z -= .02 * pressure;
        }
        for (const uniform of control.highlights) uniform.value = highlight;
    }
    for (const [direction, index] of Object.entries(XBOX_DPAD)) {
        const state = rig.directions[direction];
        state.value = MathUtils.lerp(state.value, gamepad?.buttons[index]?.pressed ? 1 : 0, blend);
    }
    const { up, down, left, right } = rig.directions;
    rig.dpad.rotation.x = (down.value - up.value) * .12;
    rig.dpad.rotation.y = (right.value - left.value) * .12;
    rig.dpad.position.copy(rig.dpadOrigin);
    rig.dpad.position.z -= Math.max(up.value, down.value, left.value, right.value) * .012;
}
