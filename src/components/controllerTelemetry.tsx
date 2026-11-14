"use client";

import { Activity, Battery, BatteryCharging, Gauge, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useDualSenseHid } from "@/hooks/useDualSenseHid";
import type { ControllerState, TelemetryState } from "@/hooks/useGamepadState";
import { disconnectDualSenseHid, requestDualSenseHid } from "@/lib/dualsenseHid";

type Props = { controller: ControllerState; telemetry: TelemetryState };

export default function ControllerTelemetry({ controller, telemetry }: Props) {
    const hid = useDualSenseHid();
    const useHidBattery = hid.connected && hid.report && controller.type !== "xbox";
    const batteryLevel = useHidBattery ? hid.report!.batteryLevel : telemetry.batteryLevel;
    const charging = useHidBattery ? hid.report!.batteryCharging : telemetry.batteryCharging;
    const batteryStatus = useHidBattery ? hid.report!.batteryStatus : charging === true ? "charging" : null;

    return (
        <section aria-label="Controller telemetry" className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Controller telemetry</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Live status from Gamepad and DualSense HID reports</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${hid.connected
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                    WebHID {hid.connected ? `connected · ${hid.report?.transport ?? "waiting"}` : "not connected"}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2.5 dark:border-slate-700 dark:bg-slate-950/40">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {charging ? <BatteryCharging size={15} /> : <Battery size={15} />} Battery
                    </div>
                    <p className="mt-1 font-semibold">{batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : "Unavailable"}</p>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2.5 dark:border-slate-700 dark:bg-slate-950/40">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><Zap size={15} /> Charge state</div>
                    <p className="mt-1 font-semibold capitalize">{batteryStatus ?? (charging === false ? "Not charging" : "Unavailable")}</p>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2.5 dark:border-slate-700 dark:bg-slate-950/40">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><Gauge size={15} /> Gamepad sample</div>
                    <p className="mt-1 font-semibold">{telemetry.pollingRate ? `${telemetry.pollingRate.toFixed(0)} Hz` : "--"}</p>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2.5 dark:border-slate-700 dark:bg-slate-950/40">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><Activity size={15} /> HID reports</div>
                    <p className="mt-1 font-semibold">{hid.reportRate ? `${hid.reportRate.toFixed(0)} Hz` : "--"}</p>
                </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                {!hid.connected ? (
                    <Button type="button" size="sm" onClick={() => void requestDualSenseHid()} disabled={!hid.supported || hid.connecting}>
                        {hid.connecting ? "Connecting..." : "Connect DualSense WebHID"}
                    </Button>
                ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => void disconnectDualSenseHid()}>Disconnect WebHID</Button>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300">
                    {hid.connected ? hid.deviceName : "DualSense / DualSense Edge only; Xbox HID telemetry is not available here."}
                </p>
            </div>
            {!hid.supported && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">WebHID needs desktop Chrome or Edge on HTTPS or localhost. Gamepad input still works where supported.</p>}
            {hid.error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{hid.error}</p>}
            {hid.connected && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                {!hid.report ? "Waiting for full DualSense motion reports."
                    : controller.type === "dualsense" ? "Move your DualSense to rotate the 3D model."
                        : "DualSense motion is paused while another controller is active."}
            </p>}
        </section>
    );
}
