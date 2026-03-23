"use client";
import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import RenderController from "./renderController";
import { degreesToRadians } from "@/lib/inputMapper";
import {
    applyAxisCalibration,
    DEFAULT_CALIBRATION_SETTINGS,
    loadCalibrationSettings,
    type CalibrationSettings,
} from "@/lib/calibration";

const SceneContainer = () => {

    const [scaleFactor, setScaleFactor] = useState(0.9);
    const [controllerType, setControllerType] = useState("");
    const [isControllerConnected, setIsControllerConnected] = useState(false);

    const orbitControlsRef: any = useRef(null);
    const calibrationRef = useRef<CalibrationSettings>(DEFAULT_CALIBRATION_SETTINGS);

    const getControllerType = (controllerId: string) => {
        const normalizedId = controllerId.toLowerCase();
        if (normalizedId.startsWith("xbox")) {
            return "xbox";
        }
        if (normalizedId.startsWith("dualsense")) {
            return "dualsense";
        }
        return "";
    };

    const getActiveController = () => {
        if (typeof navigator === "undefined") return null;
        return navigator.getGamepads().find((gamepad) => gamepad);
    };

    useEffect(() => {
        calibrationRef.current = loadCalibrationSettings();

        const onCalibrationChanged = (event: Event) => {
            const customEvent = event as CustomEvent<CalibrationSettings>;
            if (customEvent.detail) {
                calibrationRef.current = customEvent.detail;
                return;
            }
            calibrationRef.current = loadCalibrationSettings();
        };

        window.addEventListener("controller-calibration-changed", onCalibrationChanged as EventListener);

        return () => {
            window.removeEventListener("controller-calibration-changed", onCalibrationChanged as EventListener);
        };
    }, []);

    useEffect(() => {
        const updateConnectionState = () => {
            const controller = getActiveController();
            if (!controller) {
                setIsControllerConnected(false);
                setControllerType("");
                return;
            }

            setIsControllerConnected(true);
            setControllerType(getControllerType(controller.id));
        };

        updateConnectionState();

        const interval = setInterval(() => {
            updateConnectionState();
        }, 120);

        const onGamepadConnected = () => {
            updateConnectionState();
        };

        const onGamepadDisconnected = () => {
            updateConnectionState();
        };

        window.addEventListener("gamepadconnected", onGamepadConnected);
        window.addEventListener("gamepaddisconnected", onGamepadDisconnected);

        return () => {
            clearInterval(interval);
            window.removeEventListener("gamepadconnected", onGamepadConnected);
            window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
        };
    }, []);

    useFrame(() => {
        if (!orbitControlsRef.current) {
            return;
        }

        const controller = getActiveController();
        if (controller) {
            const settings = calibrationRef.current;

            const x = applyAxisCalibration(
                controller.axes[2] ?? 0,
                settings.rightSensitivity,
                settings.invertRightX,
                settings.deadzone,
            );
            const y = applyAxisCalibration(
                controller.axes[3] ?? 0,
                settings.rightSensitivity,
                settings.invertRightY,
                settings.deadzone,
            );

            const leftTrigger = controller.buttons[6]?.value ?? (controller.buttons[6]?.pressed ? 1 : 0);
            const rightTrigger = controller.buttons[7]?.value ?? (controller.buttons[7]?.pressed ? 1 : 0);
            const zoomStep = 0.005 * settings.triggerSensitivity;

            if (leftTrigger > 0.01) {
                setScaleFactor((prev) => Math.max(0.5, prev - zoomStep * leftTrigger));
            }
            if (rightTrigger > 0.01) {
                setScaleFactor((prev) => Math.min(0.9, prev + zoomStep * rightTrigger));
            }

            orbitControlsRef.current.setAzimuthalAngle(-x * degreesToRadians(180));
            orbitControlsRef.current.setPolarAngle((y + 1) * degreesToRadians(90));
            orbitControlsRef.current.update();
        }
    });


    const calculateZAxisPosition = () => {
        if (!controllerType) return 0;
        if (controllerType === 'xbox') {
            return 20;
        }
        else if (controllerType === 'dualsense') {
            return 30;
        }
        else return 0;
    }

    const noModelForController = isControllerConnected && !controllerType;

    return (
        <>
            <PerspectiveCamera makeDefault position={[1, 0, calculateZAxisPosition()]} />
            <ambientLight />
            <OrbitControls ref={orbitControlsRef} minPolarAngle={degreesToRadians(0)} maxPolarAngle={degreesToRadians(180)} enablePan={false} enableRotate={false} enableZoom={false} />
            <RenderController controllerType={controllerType} scaleFactor={scaleFactor} />
            {!isControllerConnected && (
                <Html fullscreen>
                    <div className="pointer-events-none flex h-full w-full items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-xl border border-slate-300/80 bg-white/90 px-5 py-4 text-center text-sm font-medium leading-relaxed text-slate-700 shadow-lg backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100">
                            Connect a controller to interact with the 3D model.
                        </div>
                    </div>
                </Html>
            )}
            {noModelForController && (
                <Html fullscreen>
                    <div className="pointer-events-none flex h-full w-full items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-xl border border-slate-300/80 bg-white/90 px-5 py-4 text-center text-sm font-medium leading-relaxed text-slate-700 shadow-lg backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100">
                            Controller connected, model not available for this type.
                        </div>
                    </div>
                </Html>
            )}
            <Environment preset="sunset" />
        </>
    )
}

export default SceneContainer;