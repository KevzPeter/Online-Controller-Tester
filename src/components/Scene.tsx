"use client";
import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import PS5Controller from "../../public/Ps5-controller";
import XboxController from "../../public/Xbox-controller";
import { degreesToRadians, roundToOneDecimalPlace } from "@/lib/inputMapper";

const SceneContainer = () => {

    const [scaleFactor, setScaleFactor] = useState(0.9);
    const [controllerType, setControllerType] = useState("");

    const orbitControlsRef: any = useRef(null);

    useFrame(() => {
        if (orbitControlsRef.current) {
            const controller = navigator.getGamepads()[0];
            if (controller) {
                const x = controller.axes[2];
                const y = controller.axes[3];
                if (controller.buttons[6]?.pressed) {
                    setScaleFactor(Math.max(0.5, scaleFactor - 0.005));
                }
                if (controller.buttons[7]?.pressed) {
                    setScaleFactor(Math.min(0.9, scaleFactor + 0.005));
                }
                if (controller.id) {
                    if (controller.id.toLowerCase().startsWith("xbox")) {
                        setControllerType("xbox")
                    }
                    else if (controller.id.toLowerCase().startsWith("dualsense")) {
                        setControllerType("dualsense")
                    }
                    else {
                        setControllerType("");
                    }
                }
                orbitControlsRef.current.setAzimuthalAngle(-x * degreesToRadians(180));
                orbitControlsRef.current.setPolarAngle((y + 1) * degreesToRadians(90));
                orbitControlsRef.current.update();
            }
        }
    })

    useEffect(() => {
    }, [orbitControlsRef.current]);

    const RenderController = () => {
        if (controllerType === 'xbox') {
            return (
                <XboxController scaleFactor={scaleFactor} />
            )
        }
        else if (controllerType === 'dualsense') {
            return (
                <PS5Controller scaleFactor={scaleFactor} />
            )
        }
        else return null;
    }

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, (controllerType ? (controllerType === "xbox" ? 20 : 2.5) : 0)]} />
            <ambientLight />
            <OrbitControls ref={orbitControlsRef} minPolarAngle={degreesToRadians(0)} maxPolarAngle={degreesToRadians(180)} enablePan={false} enableRotate={false} enableZoom={false} />
            <RenderController />
            <Environment preset="sunset" />
        </>
    )
}

export default SceneContainer;