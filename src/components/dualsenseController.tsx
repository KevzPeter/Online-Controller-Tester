"use client";

import { useEffect, useMemo, useState } from "react";
import { useGLTF, Line } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { useCalibrationSettings } from "@/hooks/useCalibrationSettings";
import { detectControllerType, getActiveGamepad } from "@/lib/gamepad";
import { animateDualSense, DUALSENSE_BUTTONS, type AnimatedControl } from "@/lib/dualsenseAnimation";

export default function DualSenseController({ acceptXboxInput = false }: { acceptXboxInput?: boolean }) {
    const { scene } = useGLTF("/dualsense-animated.glb");
    const settings = useCalibrationSettings();
    const [reducedMotion, setReducedMotion] = useState(false);
    const { model, controls } = useMemo(() => {
        const model = scene.clone(true);
        const controls: AnimatedControl[] = [];
        model.traverse((object) => {
            if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial)) return;
            object.material = object.material.clone();
            if (object.name in DUALSENSE_BUTTONS) {
                object.material.emissive.set("#168cff");
                object.material.emissiveIntensity = 0;
                controls.push({ mesh: object, origin: object.position.clone(), material: object.material, pressure: 0 });
            }
        });
        return { model, controls };
    }, [scene]);

    useEffect(() => {
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotion(preference.matches);
        update();
        preference.addEventListener("change", update);
        return () => preference.removeEventListener("change", update);
    }, []);

    useEffect(() => () => {
        model.traverse((object) => {
            if (object instanceof Mesh && object.material instanceof MeshStandardMaterial) object.material.dispose();
        });
    }, [model]);

    useFrame((_, delta) => {
        const pad = getActiveGamepad();
        const inputType = pad ? detectControllerType(pad.id) : "";
        const supportedInput = inputType === "dualsense" || (acceptXboxInput && inputType === "xbox");
        animateDualSense(controls, pad && supportedInput ? pad : null,
            settings, delta, reducedMotion);
    });

    return (
        <group position={[0, 0, -.6]}>
            <primitive object={model} dispose={null} />
            {/* The STL has blank face caps. Symbols follow their animated meshes. */}
            {controls.filter(({ mesh }) => ["cross", "circle", "square", "triangle"].includes(mesh.name)).map(({ mesh }) => (
                <FaceSymbol key={mesh.name} mesh={mesh} />
            ))}
        </group>
    );
}

function FaceSymbol({ mesh }: { mesh: Mesh }) {
    const { points, color } = useMemo(() => {
        const size = .045;
        const points: [number, number, number][] = mesh.name === "circle"
            ? Array.from({ length: 33 }, (_, i) => [Math.cos(i / 32 * Math.PI * 2) * size, Math.sin(i / 32 * Math.PI * 2) * size, .065])
            : mesh.name === "triangle" ? [[0,size,.065],[-size,-size,.065],[size,-size,.065],[0,size,.065]]
            : mesh.name === "square" ? [[-size,size,.065],[size,size,.065],[size,-size,.065],[-size,-size,.065],[-size,size,.065]]
            : [[-size,-size,.065],[size,size,.065]];
        return { points, color: { cross: "#88baff", circle: "#ff889a", square: "#eaa4ec", triangle: "#83e5ce" }[mesh.name] };
    }, [mesh.name]);
    // Parenting makes the markings travel with the original STL button.
    return <ButtonMark mesh={mesh} points={points} color={color} />;
}

function ButtonMark({ mesh, points, color }: {
    mesh: Mesh; points: [number, number, number][]; color: string | undefined;
}) {
    return createPortal(<>
        <Line points={points} color={color} lineWidth={1.5} />
        {mesh.name === "cross" && <Line points={[[-.045,.045,.065],[.045,-.045,.065]]} color={color} lineWidth={1.5} />}
    </>, mesh);
}
