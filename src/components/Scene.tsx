"use client";
import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import PS5Controller from "../../public/Ps5-controller";

const Scene = () => {
    return (
        <div className="container basis-1/2 border-2 rounded-lg border-solid border-slate-800">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 2.5]} />
                <ambientLight />
                <OrbitControls />
                <Suspense fallback={null}>
                    <PS5Controller />
                    <Environment preset="sunset" />
                </Suspense>
            </Canvas>
        </div>
    )
}

export default Scene;