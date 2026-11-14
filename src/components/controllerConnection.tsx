"use client";

import { Gamepad2, LoaderCircle, Unplug, Usb } from "lucide-react";
import { Button } from "./ui/button";
import { useDualSenseHid } from "@/hooks/useDualSenseHid";
import type { ControllerState } from "@/hooks/useGamepadState";
import { disconnectDualSenseHid, requestDualSenseHid } from "@/lib/dualsenseHid";

export default function ControllerConnection({ controller }: { controller: ControllerState }) {
    const hid = useDualSenseHid();

    return (
        <section aria-label="Controller connection" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${controller.connected
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                        <Gamepad2 size={22} aria-hidden="true" />
                    </div>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${controller.connected ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden="true" />
                    <p role="status" title={controller.name || undefined} className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {controller.name || "No controller connected"}
                    </p>
                </div>
                <div className="flex shrink-0 flex-col sm:items-end">
                    {hid.connected ? (
                        <Button type="button" variant="outline" aria-label="Disconnect WebHID"
                            onClick={() => void disconnectDualSenseHid()}
                            className="h-10 gap-2 rounded-xl border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
                            <Unplug size={16} aria-hidden="true" />
                            Disconnect WebHID
                        </Button>
                    ) : (
                        <Button type="button" aria-label="Connect DualSense WebHID"
                            onClick={() => void requestDualSenseHid()} disabled={!hid.supported || hid.connecting}
                            title={!hid.supported ? "WebHID requires desktop Chrome or Edge on HTTPS or localhost." : undefined}
                            className="h-10 gap-2 rounded-xl bg-blue-600 px-4 text-white shadow-sm shadow-blue-600/15 hover:bg-blue-700">
                            {hid.connecting ? <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                : <Usb size={16} aria-hidden="true" />}
                            {hid.connecting ? "Connecting…" : "Connect DualSense"}
                        </Button>
                    )}
                </div>
            </div>
            {hid.error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{hid.error}</p>}
        </section>
    );
}
