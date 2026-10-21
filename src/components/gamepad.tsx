"use client";

import { useCallback } from "react";
import { Battery, BatteryCharging, Gauge } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import ControllerAlert from "./controllerAlert";
import AnalogStickViz from "./analogStickViz";
import DPadViz from "./dPadViz";
import { useGamepadState } from "@/hooks/useGamepadState";
import { useCalibrationSettings } from "@/hooks/useCalibrationSettings";
import {
    applyAxisCalibration,
    DEFAULT_CALIBRATION_SETTINGS,
    saveCalibrationSettings,
    type CalibrationSettings,
} from "@/lib/calibration";
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

const indicatorClass = (pressed: boolean) =>
    `shrink-0 transition-transform duration-75 motion-reduce:transition-none ${pressed
        ? "scale-95 text-blue-600 dark:text-blue-400"
        : "text-slate-600 dark:text-slate-300"}`;

const GamePad = () => {
    // Use modular gamepad state hook
    const gamepadState = useGamepadState();

    const calibration = useCalibrationSettings();

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
        const next = { ...calibration, [key]: value };
        saveCalibrationSettings(next);
        window.dispatchEvent(new CustomEvent("controller-calibration-changed", { detail: next }));
    };

    const resetCalibration = useCallback(() => {
        saveCalibrationSettings(DEFAULT_CALIBRATION_SETTINGS);
        window.dispatchEvent(
            new CustomEvent("controller-calibration-changed", { detail: DEFAULT_CALIBRATION_SETTINGS })
        );
    }, []);

    return (
        <div className="basis-1/2 container flex min-w-0 flex-col mx-auto gap-y-3 text-slate-900 dark:text-slate-50">
            <ControllerAlert controllerName={controller.name} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AnalogStickViz label="Left Stick" x={calibratedX1} y={calibratedY1} />
                <AnalogStickViz label="Right Stick" x={calibratedX2} y={calibratedY2} />
            </div>
            <details className="group rounded-xl border border-slate-200/80 bg-slate-50/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <summary className="cursor-pointer p-3 text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                    Calibration <span className="ml-2 font-normal text-slate-600 dark:text-slate-300">Adjust deadzone and sensitivity</span>
                </summary>
                <div className="border-t border-slate-200/80 p-3 dark:border-slate-700">
                    <div className="mb-3 flex justify-end">
                        <Button variant="outline" size="sm" onClick={resetCalibration}>Reset Defaults</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Deadzone: {calibration.deadzone.toFixed(2)}</p>
                            <Slider value={[calibration.deadzone]} min={0} max={0.3} step={0.01} onValueChange={(value) => updateCalibrationSetting("deadzone", value[0] ?? calibration.deadzone)} />
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Trigger Sensitivity: {calibration.triggerSensitivity.toFixed(2)}</p>
                            <Slider value={[calibration.triggerSensitivity]} min={0.5} max={2} step={0.05} onValueChange={(value) => updateCalibrationSetting("triggerSensitivity", value[0] ?? calibration.triggerSensitivity)} />
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Left Stick Sensitivity: {calibration.leftSensitivity.toFixed(2)}</p>
                            <Slider value={[calibration.leftSensitivity]} min={0.5} max={2} step={0.05} onValueChange={(value) => updateCalibrationSetting("leftSensitivity", value[0] ?? calibration.leftSensitivity)} />
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Right Stick Sensitivity: {calibration.rightSensitivity.toFixed(2)}</p>
                            <Slider value={[calibration.rightSensitivity]} min={0.5} max={2} step={0.05} onValueChange={(value) => updateCalibrationSetting("rightSensitivity", value[0] ?? calibration.rightSensitivity)} />
                        </div>
                    </div>
                </div>
            </details>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                    {telemetry.batteryCharging ? <BatteryCharging size={16} /> : <Battery size={16} />}
                    <span>
                        Battery: {telemetry.batteryLevel !== null ? `${Math.round(telemetry.batteryLevel * 100)}%${telemetry.batteryCharging === true ? " (Charging)" : ""}` : "Unavailable"}
                    </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Gauge size={16} />
                    <span>Polling: {telemetry.pollingRate ? `${telemetry.pollingRate.toFixed(0)} Hz` : "--"}</span>
                </span>
            </div>
            <section aria-label="Button feedback" className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="grid gap-2 xl:grid-cols-[7rem_minmax(0,1fr)]">
                    <div className="text-slate-600 dark:text-slate-300">
                        <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">D-pad</h3>
                        <DPadViz pressed={buttons.dpad} />
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Face buttons</h3>
                        <div className="flex flex-wrap items-center justify-around gap-1">
                            <div className="flex flex-col items-center">
                                <Cross height={72} width={72} fill="currentColor" className={indicatorClass(buttons.x)} role="img" aria-label={`Cross / A: ${buttons.x ? "pressed" : "released"}`} />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Cross / A</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Circle height={72} width={72} fill="currentColor" className={indicatorClass(buttons.circle)} role="img" aria-label={`Circle / B: ${buttons.circle ? "pressed" : "released"}`} />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Circle / B</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Square height={72} width={72} fill="currentColor" className={indicatorClass(buttons.square)} role="img" aria-label={`Square / X: ${buttons.square ? "pressed" : "released"}`} />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Square / X</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Triangle height={72} width={72} fill="currentColor" className={indicatorClass(buttons.triangle)} role="img" aria-label={`Triangle / Y: ${buttons.triangle ? "pressed" : "released"}`} />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Triangle / Y</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-2 border-t border-slate-200/80 pt-2 dark:border-slate-700">
                    <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Shoulders &amp; stick clicks</h3>
                    <div className="flex flex-wrap items-center justify-around gap-1">
                        <L1 height={72} width={72} fill="currentColor" className={indicatorClass(buttons.l1)} role="img" aria-label={`L1 / LB: ${buttons.l1 ? "pressed" : "released"}`} />
                        <R1 height={72} width={72} fill="currentColor" className={indicatorClass(buttons.r1)} role="img" aria-label={`R1 / RB: ${buttons.r1 ? "pressed" : "released"}`} />
                        <L2 height={72} width={72} fill="currentColor" className={indicatorClass(buttons.l2)} role="img" aria-label={`L2 / LT: ${buttons.l2 ? "pressed" : "released"}`} />
                        <R2 height={72} width={72} fill="currentColor" className={indicatorClass(buttons.r2)} role="img" aria-label={`R2 / RT: ${buttons.r2 ? "pressed" : "released"}`} />
                        <L3 height={72} width={72} fill="currentColor" className={indicatorClass(buttons.l3)} role="img" aria-label={`L3 / LS: ${buttons.l3 ? "pressed" : "released"}`} />
                        <R3 height={72} width={72} fill="currentColor" className={indicatorClass(buttons.r3)} role="img" aria-label={`R3 / RS: ${buttons.r3 ? "pressed" : "released"}`} />
                    </div>
                </div>
                <div className="mt-2 border-t border-slate-200/80 pt-2 dark:border-slate-700">
                    <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Menu &amp; system</h3>
                    <div className="flex flex-wrap items-center justify-around gap-1">
                        <div className="flex flex-col items-center">
                            <Create height={72} width={72} fill="currentColor" className={indicatorClass(buttons.create)} role="img" aria-label={`Create / View: ${buttons.create ? "pressed" : "released"}`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Create / View</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Options height={72} width={72} fill="currentColor" className={indicatorClass(buttons.options)} role="img" aria-label={`Options / Menu: ${buttons.options ? "pressed" : "released"}`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Options / Menu</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <TouchPad height={72} width={72} fill="currentColor" className={indicatorClass(buttons.touchpad)} role="img" aria-label={`Touchpad: ${buttons.touchpad ? "pressed" : "released"}`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Touchpad</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Home height={72} width={72} fill="currentColor" className={indicatorClass(buttons.power)} role="img" aria-label={`PS / Xbox: ${buttons.power ? "pressed" : "released"}`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">PS / Xbox</span>
                        </div>
                    </div>
                </div>
            </section>
            <p className="text-sm text-slate-600 dark:text-slate-300">Drag the 3D model to rotate; scroll or pinch to zoom. System buttons depend on browser and OS support.</p>
            {controller.type === "xbox" && (
                <span className="mt-2 text-sm">Elite paddles animate their assigned button. Paddle, profile, sync, and trigger-lock inputs are not separately mapped by the standard browser Gamepad API.</span>
            )}
        </div>
    )
}

export default GamePad;
