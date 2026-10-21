"use client";

import { Suspense } from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import RenderController from "./renderController";
import type { ControllerType } from "@/lib/gamepad";

export default function SceneContainer({ controllerType, acceptCrossModelInput = false }: {
    controllerType: ControllerType;
    acceptCrossModelInput?: boolean;
}) {
    return (
        <>
            <PerspectiveCamera key={controllerType} makeDefault position={[0, 2.1, 4.8]} fov={45} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 6]} intensity={2.5} />
            <directionalLight position={[-4, 1, -2]} intensity={1.5} color="#9cbfff" />
            <OrbitControls key={`orbit-${controllerType}`} makeDefault enablePan={false}
                minDistance={2.8} maxDistance={8} />
            <Suspense fallback={null}>
                <RenderController controllerType={controllerType} acceptCrossModelInput={acceptCrossModelInput} />
            </Suspense>
        </>
    );
}
