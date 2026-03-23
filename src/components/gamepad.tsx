"use client";

import { useState, useEffect, useRef } from "react";
import { Battery, BatteryCharging, Gauge } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import ControllerAlert from "./controllerAlert";
import AnalogStickViz from "./analogStickViz";
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

    const [controllerName, setControllerName] = useState("");
    const [controllerType, setControllerType] = useState("dualsense");
    const [x1, setX1] = useState(0);
    const [y1, setY1] = useState(0);
    const [x2, setX2] = useState(0);
    const [y2, setY2] = useState(0);
    const [circlePressed, setCirclePressed] = useState(false);
    const [trianglePressed, setTrianglePressed] = useState(false);
    const [squarePressed, setSquarePressed] = useState(false);
    const [xPressed, setXPressed] = useState(false);
    const [l1, setL1] = useState(false);
    const [r1, setR1] = useState(false);
    const [l2, setL2] = useState(false);
    const [r2, setR2] = useState(false);
    const [create, setCreate] = useState(false);
    const [options, setOptions] = useState(false);
    const [l3, setL3] = useState(false);
    const [r3, setR3] = useState(false);
    const [up, setUp] = useState(false);
    const [down, setDown] = useState(false);
    const [left, setLeft] = useState(false);
    const [right, setRight] = useState(false);
    const [power, setPower] = useState(false);
    const [touchpad, setTouchpad] = useState(false);
    const [pollingRate, setPollingRate] = useState(0);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [batteryCharging, setBatteryCharging] = useState<boolean | null>(null);
    const [hapticsSupported, setHapticsSupported] = useState(false);
    const [hapticsMessage, setHapticsMessage] = useState("");
    const [calibration, setCalibration] = useState<CalibrationSettings>(DEFAULT_CALIBRATION_SETTINGS);

    const activeControllerRef = useRef<Gamepad | null>(null);
    const previousPollTimestampRef = useRef<number | null>(null);

    const calibratedX1 = applyAxisCalibration(x1, calibration.leftSensitivity, calibration.invertLeftX, calibration.deadzone);
    const calibratedY1 = applyAxisCalibration(y1, calibration.leftSensitivity, calibration.invertLeftY, calibration.deadzone);
    const calibratedX2 = applyAxisCalibration(x2, calibration.rightSensitivity, calibration.invertRightX, calibration.deadzone);
    const calibratedY2 = applyAxisCalibration(y2, calibration.rightSensitivity, calibration.invertRightY, calibration.deadzone);

    const updateCalibrationSetting = <K extends keyof CalibrationSettings>(key: K, value: CalibrationSettings[K]) => {
        setCalibration((prev) => {
            const next = {
                ...prev,
                [key]: value,
            };
            saveCalibrationSettings(next);
            window.dispatchEvent(new CustomEvent("controller-calibration-changed", { detail: next }));
            return next;
        });
    };

    const resetCalibration = () => {
        setCalibration(DEFAULT_CALIBRATION_SETTINGS);
        saveCalibrationSettings(DEFAULT_CALIBRATION_SETTINGS);
        window.dispatchEvent(new CustomEvent("controller-calibration-changed", { detail: DEFAULT_CALIBRATION_SETTINGS }));
    };

    const runVibrationTest = async () => {
        const controller = activeControllerRef.current;
        if (!controller) {
            setHapticsMessage("Connect a controller first.");
            return;
        }

        const gamepadWithHaptics = controller as Gamepad & {
            vibrationActuator?: {
                playEffect?: (type: string, params: {
                    startDelay: number;
                    duration: number;
                    weakMagnitude: number;
                    strongMagnitude: number;
                }) => Promise<unknown>;
            };
            hapticActuators?: Array<{
                pulse?: (value: number, duration: number) => Promise<boolean>;
            }>;
        };

        const vibrationActuator = gamepadWithHaptics.vibrationActuator;
        const hapticActuator = gamepadWithHaptics.hapticActuators?.[0];

        try {
            if (vibrationActuator?.playEffect) {
                await vibrationActuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 220,
                    weakMagnitude: 0.45,
                    strongMagnitude: 0.85,
                });
                setHapticsMessage("Vibration test sent.");
                return;
            }

            if (hapticActuator?.pulse) {
                await hapticActuator.pulse(0.8, 220);
                setHapticsMessage("Vibration test sent.");
                return;
            }

            setHapticsMessage("Haptics are not available on this controller/browser.");
        }
        catch {
            setHapticsMessage("Vibration test failed.");
        }
    };

    useEffect(() => {
        const storedCalibration = loadCalibrationSettings();
        setCalibration(storedCalibration);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const controller = navigator.getGamepads().find(gamepad => gamepad);
            if (controller) {
                activeControllerRef.current = controller;

                const now = performance.now();
                const previous = previousPollTimestampRef.current;
                if (previous) {
                    const nextPollingRate = 1000 / Math.max(1, now - previous);
                    setPollingRate((prev) => (prev ? prev * 0.75 + nextPollingRate * 0.25 : nextPollingRate));
                }
                previousPollTimestampRef.current = now;

                setControllerName(controller.id);
                if (controller.id.toLowerCase().startsWith("xbox")) {
                    setControllerType("xbox")
                }
                else if (controller.id.toLowerCase().startsWith("dualsense")) {
                    setControllerType("dualsense")
                }
                else {
                    setControllerType("");
                }
                setX1(controller.axes[0]);
                setY1(controller.axes[1]);
                setX2(controller.axes[2]);
                setY2(controller.axes[3]);
                setXPressed(controller.buttons[0].pressed);
                setCirclePressed(controller.buttons[1].pressed);
                setSquarePressed(controller.buttons[2].pressed);
                setTrianglePressed(controller.buttons[3].pressed);
                setL1(controller.buttons[4].pressed);
                setR1(controller.buttons[5].pressed);
                setL2(controller.buttons[6].pressed);
                setR2(controller.buttons[7].pressed);
                setCreate(controller.buttons[8].pressed);
                setOptions(controller.buttons[9].pressed);
                setL3(controller.buttons[10].pressed);
                setR3(controller.buttons[11].pressed);
                setUp(controller.buttons[12].pressed);
                setDown(controller.buttons[13].pressed);
                setLeft(controller.buttons[14].pressed);
                setRight(controller.buttons[15].pressed);
                setPower(controller.buttons[16].pressed);
                setTouchpad(controller.buttons[17]?.pressed); // xbox controllers do not have this button

                const controllerAny = controller as Gamepad & {
                    battery?: {
                        level?: number;
                        charging?: boolean;
                    };
                    vibrationActuator?: unknown;
                    hapticActuators?: unknown[];
                };

                if (controllerAny.battery && typeof controllerAny.battery.level === "number") {
                    setBatteryLevel(controllerAny.battery.level);
                    setBatteryCharging(typeof controllerAny.battery.charging === "boolean" ? controllerAny.battery.charging : null);
                }
                else {
                    setBatteryLevel(null);
                    setBatteryCharging(null);
                }

                setHapticsSupported(Boolean(controllerAny.vibrationActuator || controllerAny.hapticActuators?.length));
            }
            else {
                activeControllerRef.current = null;
                previousPollTimestampRef.current = null;
                setControllerName("");
                setPollingRate(0);
                setBatteryLevel(null);
                setBatteryCharging(null);
                setHapticsSupported(false);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [])


    return (
        <div className="basis-1/2 container flex flex-col mx-auto gap-y-4 text-slate-900 dark:text-slate-50">
            <ControllerAlert controllerName={controllerName} />
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
                    <Button size="sm" onClick={runVibrationTest} disabled={!controllerName}>Run Vibration Test</Button>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Haptics: {hapticsSupported ? "Supported" : "Unavailable"}</span>
                    {hapticsMessage && <span className="text-xs text-slate-500 dark:text-slate-400">{hapticsMessage}</span>}
                </div> */}

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                        {batteryCharging ? <BatteryCharging size={14} /> : <Battery size={14} />}
                        <span>
                            Battery: {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%${batteryCharging === true ? " (Charging)" : ""}` : "Unavailable"}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Gauge size={14} />
                        <span>Polling: {pollingRate ? `${pollingRate.toFixed(0)} Hz` : "--"}</span>
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-x-4">
                {up && <DPadUp height={128} width={128} fill={"#0070f3"} />}
                {down && <DPadDown height={128} width={128} fill={"#0070f3"} />}
                {left && <DPadLeft height={128} width={128} fill={"#0070f3"} />}
                {right && <DPadRight height={128} width={128} fill={"#0070f3"} />}
                {(!up && !down && !left && !right) && <DPad height={128} width={128} fill="grey" />}
                <Cross height={xPressed ? 60 : 64} width={64} fill={xPressed ? "#0070f3" : "grey"} />
                <Circle height={circlePressed ? 60 : 64} width={64} fill={circlePressed ? "#0070f3" : "grey"} />
                <Square height={squarePressed ? 60 : 64} width={64} fill={squarePressed ? "#0070f3" : "grey"} />
                <Triangle height={trianglePressed ? 60 : 64} width={64} fill={trianglePressed ? "#0070f3" : "grey"} />
            </div>
            <div className="flex gap-x-4">
                <L1 height={l1 ? 60 : 64} width={64} fill={l1 ? "#0070f3" : "grey"} />
                <R1 height={r1 ? 60 : 64} width={64} fill={r1 ? "#0070f3" : "grey"} />
                <L2 height={l2 ? 60 : 64} width={64} fill={l2 ? "#0070f3" : "grey"} />
                <R2 height={r2 ? 60 : 64} width={64} fill={r2 ? "#0070f3" : "grey"} />
                <L3 height={l3 ? 60 : 64} width={64} fill={l3 ? "#0070f3" : "grey"} />
                <R3 height={r3 ? 60 : 64} width={64} fill={r3 ? "#0070f3" : "grey"} />
            </div>
            <div className="flex gap-x-4">
                <Create height={create ? 60 : 64} width={64} fill={create ? "#0070f3" : "grey"} />
                <Options height={options ? 60 : 64} width={64} fill={options ? "#0070f3" : "grey"} />
                <TouchPad height={touchpad ? 60 : 64} width={64} fill={touchpad ? "#0070f3" : "grey"} />
                <Home height={power ? 60 : 64} width={64} fill={power ? "#0070f3" : "grey"} />
            </div>
            <span className="mt-4"><Badge className="bg-slate-200 dark:bg-slate-700">Tip</Badge> Use Right Analog to move camera.</span>
            <span className="mt-2"><Badge className="bg-slate-200 dark:bg-slate-700">Tip</Badge> Use L2/R2 to zoom.</span>
        </div>
    )
}

export default GamePad;