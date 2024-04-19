"use client";
import { useState, Suspense, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import PS5Controller from "../../public/Ps5-controller";
import { degreesToRadians, roundToOneDecimalPlace } from "@/lib/inputMapper";

const SceneContainer = () => {

    const [scaleFactor, setScaleFactor] = useState(0.9);

    const orbitControlsRef: any = useRef(null);
    useFrame(() => {
        if (orbitControlsRef.current) {
            const controller = navigator.getGamepads()[0];
            if (controller) {
                const x = controller.axes[2];
                const y = controller.axes[3];
                if (controller.buttons[6].pressed) {
                    setScaleFactor(Math.max(0.5, scaleFactor - 0.005));
                    console.log(scaleFactor);
                }
                if (controller.buttons[7].pressed) {
                    setScaleFactor(Math.min(0.9, scaleFactor + 0.005));
                    console.log(scaleFactor);
                }
                orbitControlsRef.current.setAzimuthalAngle(-x * degreesToRadians(180));
                orbitControlsRef.current.setPolarAngle((y + 1) * degreesToRadians(90));
                orbitControlsRef.current.update();
            }
        }
    })

    useEffect(() => {
        if (orbitControlsRef.current) {
            console.log(orbitControlsRef.current);
        }
    }, [orbitControlsRef.current]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 2.5]} />
            <ambientLight />
            <OrbitControls ref={orbitControlsRef} minPolarAngle={degreesToRadians(0)} maxPolarAngle={degreesToRadians(180)} enablePan={false} enableRotate={false} enableZoom={false} />
            <Suspense fallback={null}>
                <PS5Controller scaleFactor={scaleFactor} />
                <Environment preset="sunset" />
            </Suspense>
        </>
    )
}

export default SceneContainer;