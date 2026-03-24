"use client";

import { useState, useEffect, useCallback } from "react";
import { Battery, BatteryCharging, Gauge } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import ControllerAlert from "./controllerAlert";
import AnalogStickViz from "./analogStickViz";
import { useGamepadState } from "@/hooks/useGamepadState";
import {
    applyAxisCalibration,
    DEFAULT_CALIBRATION_SETTINGS,
    loadCalibrationSettings,
    saveCalibrationSettings,
    type CalibrationSettings,
} from "@/lib/calibration";
import DPad from "../../public/assets/Buttons Outline/Black/SVG/D-Pad.svg";
import DPadUp from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Up.svg";
import DPadDown from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Down.svg";
import DPadLeft from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Left.svg";
import DPadRight from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Right.svg";
import Square from "../../public/assets/Buttons Outline/Black/SVG/Square.svg";
import Circle from "../../public/assets/Buttons Outline/Black/SVG/Circle.svg";
import Triangle from "../../public/assets/Buttons Outline/Black/SVG/Triangle.svg";
import Cross from "../../public/assets/Buttons Outline/Black/SVG/Cross.svg";
import L1 from "../../public/assets/Buttons Outline/Black/SVG/L1.svg";
import R1 from "../../public/assets/Buttons Outline/Black/SVG/R1.svg";
import L2 from "../../public/assets/Buttons Outline/Black/SVG/L2.svg";
import R2 from "../../public/assets/Buttons Outline/Black/SVG/R2.svg";
import L3 from "../../public/assets/Buttons Outline/Black/SVG/Left Stick Click.svg";
import R3 from "../../public/assets/Buttons Outline/Black/SVG/Right Stick Click.svg";
import Create from "../../public/assets/Buttons Outline/Black/SVG/Create.svg";
import Options from "../../public/assets/Buttons Outline/Black/SVG/Options.svg";
import TouchPad from "../../public/assets/Buttons Outline/Black/SVG/Touch Pad Press.svg";
import Home from "../../public/assets/Buttons Outline/Black/SVG/Home.svg";

const GamePad = () => {
    // Use modular gamepad state hook
    const gamepadState = useGamepadState();

    // Local state for UI concerns
    const [calibration, setCalibration] = useState<CalibrationSettings>(DEFAULT_CALIBRATION_SETTINGS);
    const [hapticsMessage, setHapticsMessage] = useState("");

    // Destructure for cleaner template access
    const { controller, axes, buttons, telemetry } = gamepadState;

    // Apply calibration to axis values
    const calibratedX1 = applyAxisCalibration(
        axes.leftStick.x,
        calibration.leftSensitivity,
        calibration.invertLeftX,
        calibration.deadzone
    );
    const calibratedY1 = applyAxisCalibration(
        axes.leftStick.y,
        calibration.leftSensitivity,
        calibration.invertLeftY,
        calibration.deadzone
    );
    const calibratedX2 = applyAxisCalibration(
        axes.rightStick.x,
        calibration.rightSensitivity,
        calibration.invertRightX,
        calibration.deadzone
    );
    const calibratedY2 = applyAxisCalibration(
        axes.rightStick.y,
        calibration.rightSensitivity,
        calibration.invertRightY,
        calibration.deadzone
    );

    const updateCalibrationSetting = <K extends keyof CalibrationSettings>(
        key: K,
        value: CalibrationSettings[K]
    ) => {
        setCalibration((prev) => {
            const next = { ...prev, [key]: value };
            saveCalibrationSettings(next);
            window.dispatchEvent(new CustomEvent("controller-calibration-changed", { detail: next }));
            return next;
        });
    };

    const resetCalibration = useCallback(() => {
        setCalibration(DEFAULT_CALIBRATION_SETTINGS);
        saveCalibrationSettings(DEFAULT_CALIBRATION_SETTINGS);
        window.dispatchEvent(
            new CustomEvent("controller-calibration-changed", { detail: DEFAULT_CALIBRATION_SETTINGS })
        );
    }, []);

    const runVibrationTest = useCallback(async () => {
        if (!controller.connected) {
            setHapticsMessage("Connect a controller first.");
            return;
        }

        try {
            const gamepad = navigator.getGamepads().find((gp) => gp?.id === controller.name);
            if (!gamepad) throw new Error("Controller not found");

            const gamepadWithHaptics = gamepad as Gamepad & {
                vibrationActuator?: {
                    playEffect?: (
                        type: string,
                        params: {
                            startDelay: number;
                            duration: number;
                            weakMagnitude: number;
                            strongMagnitude: number;
                        }
                    ) => Promise<unknown>;
                };
                hapticActuators?: Array<{
                    pulse?: (value: number, duration: number) => Promise<boolean>;
                }>;
            };

            if (gamepadWithHaptics.vibrationActuator?.playEffect) {
                await gamepadWithHaptics.vibrationActuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 220,
                    weakMagnitude: 0.45,
                    strongMagnitude: 0.85,
                });
                setHapticsMessage("Vibration test sent.");
                return;
            }

            if (gamepadWithHaptics.hapticActuators?.[0]?.pulse) {
                await gamepadWithHaptics.hapticActuators[0].pulse(0.8, 220);
                setHapticsMessage("Vibration test sent.");
                return;
            }

            setHapticsMessage("Haptics are not available on this controller/browser.");
        } catch {
            setHapticsMessage("Vibration test failed.");
        }
    }, [controller.connected, controller.name]);

    useEffect(() => {
        const storedCalibration = loadCalibrationSettings();
        setCalibration(storedCalibration);
    }, []);

    return (
        <div className="basis-1/2 container flex flex-col mx-auto gap-y-4 text-slate-900 dark:text-slate-50">
            <ControllerAlert controllerName={controller.name} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AnalogStickViz label="Left Stick" x={calibratedX1} y={calibratedY1} />
                <AnalogStickViz label="Right Stick" x={calibratedX2} y={calibratedY2} />
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold tracking-wide">Calibration</h3>
                    <Button variant="outline" size="sm" onClick={resetCalibration}>Reset Defaults</Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">Deadzone: {calibration.deadzone.toFixed(2)}</p>
                        <Slider value={[calibration.deadzone]} min={0} max={0.3} step={0.01} onValueChange={(value) => updateCalibrationSetting("deadzone", value[0] ?? calibration.deadzone)} />
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">Trigger Sensitivity: {calibration.triggerSensitivity.toFixed(2)}</p>
                        <Slider value={[calibration.triggerSensitivity]} min={0.5} max={2} step={0.05} onValueChange={(value) => updateCalibrationSetting("triggerSensitivity", value[0] ?? calibration.triggerSensitivity)} />
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">Left Stick Sensitivity: {calibration.leftSensitivity.toFixed(2)}</p>
                        <Slider value={[calibration.leftSensitivity]} min={0.5} max={2} step={0.05} onValueChange={(value) => updateCalibrationSetting("leftSensitivity", value[0] ?? calibration.leftSensitivity)} />
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">Right Stick Sensitivity: {calibration.rightSensitivity.toFixed(2)}</p>
                        <Slider value={[calibration.rightSensitivity]} min={0.5} max={2} step={0.05} onValueChange={(value) => updateCalibrationSetting("rightSensitivity", value[0] ?? calibration.rightSensitivity)} />
                    </div>
                </div>

                {/* <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">Axis Inversion</p>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant={calibration.invertLeftX ? "default" : "outline"} onClick={() => updateCalibrationSetting("invertLeftX", !calibration.invertLeftX)}>Invert Left X</Button>
                        <Button size="sm" variant={calibration.invertLeftY ? "default" : "outline"} onClick={() => updateCalibrationSetting("invertLeftY", !calibration.invertLeftY)}>Invert Left Y</Button>
                        <Button size="sm" variant={calibration.invertRightX ? "default" : "outline"} onClick={() => updateCalibrationSetting("invertRightX", !calibration.invertRightX)}>Invert Right X</Button>
                        <Button size="sm" variant={calibration.invertRightY ? "default" : "outline"} onClick={() => updateCalibrationSetting("invertRightY", !calibration.invertRightY)}>Invert Right Y</Button>
                    </div>
                </div> */}

                {/* <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={runVibrationTest} disabled={!controller.name}>Run Vibration Test</Button>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Haptics: {telemetry.hapticsSupported ? "Supported" : "Unavailable"}</span>
                    {hapticsMessage && <span className="text-xs text-slate-500 dark:text-slate-400">{hapticsMessage}</span>}
                </div> */}

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                        {telemetry.batteryCharging ? <BatteryCharging size={14} /> : <Battery size={14} />}
                        <span>
                            Battery: {telemetry.batteryLevel !== null ? `${Math.round(telemetry.batteryLevel * 100)}%${telemetry.batteryCharging === true ? " (Charging)" : ""}` : "Unavailable"}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Gauge size={14} />
                        <span>Polling: {telemetry.pollingRate ? `${telemetry.pollingRate.toFixed(0)} Hz` : "--"}</span>
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-x-4">
                {buttons.dpad.up && <DPadUp height={128} width={128} fill={"#0070f3"} />}
                {buttons.dpad.down && <DPadDown height={128} width={128} fill={"#0070f3"} />}
                {buttons.dpad.left && <DPadLeft height={128} width={128} fill={"#0070f3"} />}
                {buttons.dpad.right && <DPadRight height={128} width={128} fill={"#0070f3"} />}
                {(!buttons.dpad.up && !buttons.dpad.down && !buttons.dpad.left && !buttons.dpad.right) && <DPad height={128} width={128} fill="grey" />}
                <Cross height={buttons.x ? 60 : 64} width={64} fill={buttons.x ? "#0070f3" : "grey"} />
                <Circle height={buttons.circle ? 60 : 64} width={64} fill={buttons.circle ? "#0070f3" : "grey"} />
                <Square height={buttons.square ? 60 : 64} width={64} fill={buttons.square ? "#0070f3" : "grey"} />
                <Triangle height={buttons.triangle ? 60 : 64} width={64} fill={buttons.triangle ? "#0070f3" : "grey"} />
            </div>
            <div className="flex gap-x-4">
                <L1 height={buttons.l1 ? 60 : 64} width={64} fill={buttons.l1 ? "#0070f3" : "grey"} />
                <R1 height={buttons.r1 ? 60 : 64} width={64} fill={buttons.r1 ? "#0070f3" : "grey"} />
                <L2 height={buttons.l2 ? 60 : 64} width={64} fill={buttons.l2 ? "#0070f3" : "grey"} />
                <R2 height={buttons.r2 ? 60 : 64} width={64} fill={buttons.r2 ? "#0070f3" : "grey"} />
                <L3 height={buttons.l3 ? 60 : 64} width={64} fill={buttons.l3 ? "#0070f3" : "grey"} />
                <R3 height={buttons.r3 ? 60 : 64} width={64} fill={buttons.r3 ? "#0070f3" : "grey"} />
            </div>
            <div className="flex gap-x-4">
                <Create height={buttons.create ? 60 : 64} width={64} fill={buttons.create ? "#0070f3" : "grey"} />
                <Options height={buttons.options ? 60 : 64} width={64} fill={buttons.options ? "#0070f3" : "grey"} />
                <TouchPad height={buttons.touchpad ? 60 : 64} width={64} fill={buttons.touchpad ? "#0070f3" : "grey"} />
                <Home height={buttons.power ? 60 : 64} width={64} fill={buttons.power ? "#0070f3" : "grey"} />
            </div>
            <span className="mt-4"><Badge className="bg-slate-200 dark:bg-slate-700">Tip</Badge> Use Right Analog to move camera.</span>
            <span className="mt-2"><Badge className="bg-slate-200 dark:bg-slate-700">Tip</Badge> Use L2/R2 to zoom.</span>
        </div>
    )
}

export default GamePad;