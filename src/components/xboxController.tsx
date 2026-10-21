"use client";

import { useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCalibrationSettings } from "@/hooks/useCalibrationSettings";
import { detectControllerType, getActiveGamepad } from "@/lib/gamepad";
import { animateXbox, createXboxRig } from "@/lib/xboxAnimation";

export default function XboxController({ acceptDualSenseInput = false }: { acceptDualSenseInput?: boolean }) {
    const { scene } = useGLTF("/xbox-elite-animated.gltf");
    const settings = useCalibrationSettings();
    const [reducedMotion, setReducedMotion] = useState(false);
    const rig = useMemo(() => createXboxRig(scene), [scene]);

    useEffect(() => {
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotion(preference.matches);
        update();
        preference.addEventListener("change", update);
        return () => preference.removeEventListener("change", update);
    }, []);

    useEffect(() => () => {
        // Geometry, original materials, and atlas textures belong to useGLTF's cache.
        for (const material of rig.materials) material.dispose();
    }, [rig]);

    useFrame((_, delta) => {
        const pad = getActiveGamepad();
        const inputType = pad ? detectControllerType(pad.id) : "";
        const supportedInput = inputType === "xbox" || (acceptDualSenseInput && inputType === "dualsense");
        animateXbox(rig, pad && supportedInput ? pad : null,
            settings, delta, reducedMotion);
    });

    return <primitive object={rig.model} dispose={null} />;
}
