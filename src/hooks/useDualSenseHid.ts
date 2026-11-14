"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
    getDualSenseHidState, getDualSenseHidServerState, initializeDualSenseHid, subscribeDualSenseHid,
} from "@/lib/dualsenseHid";

export function useDualSenseHid() {
    useEffect(initializeDualSenseHid, []);
    return useSyncExternalStore(subscribeDualSenseHid, getDualSenseHidState, getDualSenseHidServerState);
}
