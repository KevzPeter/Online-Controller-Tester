"use client";

import { Activity, Battery, BatteryCharging, Gauge, Zap } from "lucide-react";
import { useDualSenseHid } from "@/hooks/useDualSenseHid";
import type { ControllerState, TelemetryState } from "@/hooks/useGamepadState";

type Props = { controller: ControllerState; telemetry: TelemetryState };

export default function ControllerTelemetry({ controller, telemetry }: Props) {
    const hid = useDualSenseHid();
    const report = hid.connected && controller.type === "dualsense" ? hid.report : null;
    const batteryLevel = report ? report.batteryLevel : telemetry.batteryLevel;
    const charging = report ? report.batteryCharging : telemetry.batteryCharging;
    const batteryStatus = report ? report.batteryStatus : charging === true ? "charging" : null;
    const stats = [
        { label: "Battery", Icon: charging ? BatteryCharging : Battery, value: batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : "Unavailable" },
        { label: "Charge state", Icon: Zap, value: batteryStatus ?? (charging === false ? "Not charging" : "Unavailable") },
        { label: "App sampling", Icon: Gauge, value: telemetry.pollingRate ? `${telemetry.pollingRate.toFixed(0)} Hz` : "—" },
        { label: "HID reports", Icon: Activity, value: hid.reportRate ? `${hid.reportRate.toFixed(0)} Hz` : "—" },
    ];

    return (
        <section aria-label="Controller telemetry" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Telemetry</h2>
            <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
                {stats.map(({ label, Icon, value }) => (
                    <div key={label} className="min-w-0">
                        <dt className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <Icon size={13} aria-hidden="true" /> {label}
                        </dt>
                        <dd className="text-sm font-semibold capitalize tabular-nums text-slate-800 dark:text-slate-200">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
