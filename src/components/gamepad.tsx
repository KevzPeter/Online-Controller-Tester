"use client";

import AnalogStickViz from "./analogStickViz";
import ButtonFeedback from "./buttonFeedback";
import CalibrationPanel from "./calibrationPanel";
import ClientCanvas from "./clientCanvas";
import ControllerConnection from "./controllerConnection";
import ControllerTelemetry from "./controllerTelemetry";
import { useGamepadState } from "@/hooks/useGamepadState";
import { useCalibrationSettings } from "@/hooks/useCalibrationSettings";
import { applyAxisCalibration } from "@/lib/calibration";

export default function GamePad() {
    const { controller, axes, buttons, telemetry } = useGamepadState();
    const calibration = useCalibrationSettings();
    const leftX = applyAxisCalibration(axes.leftStick.x, calibration.leftSensitivity, calibration.invertLeftX, calibration.deadzone);
    const leftY = applyAxisCalibration(axes.leftStick.y, calibration.leftSensitivity, calibration.invertLeftY, calibration.deadzone);
    const rightX = applyAxisCalibration(axes.rightStick.x, calibration.rightSensitivity, calibration.invertRightX, calibration.deadzone);
    const rightY = applyAxisCalibration(axes.rightStick.y, calibration.rightSensitivity, calibration.invertRightY, calibration.deadzone);

    return (
        <div className="space-y-4 text-slate-900 dark:text-slate-50">
            <ControllerConnection controller={controller} />
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
                <section aria-label="3D controller preview" className="min-w-0">
                    <ClientCanvas />
                </section>
                <aside aria-label="Live controller readings" className="min-w-0 space-y-4">
                    <section aria-label="Analog stick feedback" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
                        <h2 className="mb-4 text-sm font-semibold">Analog sticks</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <AnalogStickViz label="Left stick" x={leftX} y={leftY} />
                            <AnalogStickViz label="Right stick" x={rightX} y={rightY} />
                        </div>
                    </section>
                    <ControllerTelemetry controller={controller} telemetry={telemetry} />
                    <CalibrationPanel />
                </aside>
            </div>
            <ButtonFeedback buttons={buttons} />
        </div>
    );
}
