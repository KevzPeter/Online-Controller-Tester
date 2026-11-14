"use client";

import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { useCalibrationSettings } from "@/hooks/useCalibrationSettings";
import { DEFAULT_CALIBRATION_SETTINGS, saveCalibrationSettings, type CalibrationSettings } from "@/lib/calibration";

const controls = [
    { key: "deadzone", label: "Deadzone", min: 0, max: 0.3, step: 0.01 },
    { key: "triggerSensitivity", label: "Trigger sensitivity", min: 0.5, max: 2, step: 0.05 },
    { key: "leftSensitivity", label: "Left stick sensitivity", min: 0.5, max: 2, step: 0.05 },
    { key: "rightSensitivity", label: "Right stick sensitivity", min: 0.5, max: 2, step: 0.05 },
] as const;

export default function CalibrationPanel() {
    const calibration = useCalibrationSettings();
    const save = (settings: CalibrationSettings) => {
        saveCalibrationSettings(settings);
        window.dispatchEvent(new CustomEvent("controller-calibration-changed", { detail: settings }));
    };

    return (
        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-2xl p-4 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal size={15} className="text-slate-400" aria-hidden="true" />
                Calibration
                <ChevronDown size={15} className="ml-auto text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                    {controls.map(({ key, label, min, max, step }) => (
                        <div key={key}>
                            <div className="mb-3 flex items-center justify-between gap-2 text-[11px]">
                                <label id={`calibration-${key}`} className="text-slate-500 dark:text-slate-400">{label}</label>
                                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">{calibration[key].toFixed(2)}</span>
                            </div>
                            <Slider aria-labelledby={`calibration-${key}`} value={[calibration[key]]} min={min} max={max} step={step}
                                onValueChange={(value) => save({ ...calibration, [key]: value[0] ?? calibration[key] })} />
                        </div>
                    ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => save(DEFAULT_CALIBRATION_SETTINGS)}
                    className="mt-5 h-8 gap-1.5 px-2 text-xs text-slate-500 dark:text-slate-400">
                    <RotateCcw size={12} aria-hidden="true" /> Reset Defaults
                </Button>
            </div>
        </details>
    );
}
