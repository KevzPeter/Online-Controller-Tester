"use client";

import { Suspense, useRef } from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Quaternion, type Group } from "three";
import RenderController from "./renderController";
import type { ControllerType } from "@/lib/gamepad";
import { dualSenseOrientation } from "@/lib/dualsenseOrientation";

const restingOrientation = new Quaternion();

export default function SceneContainer({ controllerType, acceptCrossModelInput = false, trackMotion = false }: {
    controllerType: ControllerType;
    acceptCrossModelInput?: boolean;
    trackMotion?: boolean;
}) {
    const pose = useRef<Group>(null);

    useFrame((_, delta) => {
        if (pose.current) {
            pose.current.quaternion.slerp(trackMotion ? dualSenseOrientation.quaternion : restingOrientation, 1 - Math.exp(-18 * delta));
        }
    });

    return (
        <>
            <PerspectiveCamera key={controllerType} makeDefault position={[0, 2.1, 4.8]} fov={45} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 6]} intensity={2.5} />
            <directionalLight position={[-4, 1, -2]} intensity={1.5} color="#9cbfff" />
            <OrbitControls key={`orbit-${controllerType}`} makeDefault enablePan={false}
                minDistance={2.8} maxDistance={8} />
            <Suspense fallback={null}>
                <group ref={pose}>
                    <RenderController controllerType={controllerType} acceptCrossModelInput={acceptCrossModelInput} />
                </group>
            </Suspense>
        </>
    );
}
