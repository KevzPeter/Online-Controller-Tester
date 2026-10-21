import { useMemo, useSyncExternalStore } from "react";
import { CALIBRATION_STORAGE_KEY, parseCalibrationSettings } from "@/lib/calibration";

const subscribe = (onChange: () => void) => {
    window.addEventListener("controller-calibration-changed", onChange);
    return () => window.removeEventListener("controller-calibration-changed", onChange);
};

// Use the stored string as a stable snapshot; parsing an object here would cause re-renders.
const getSnapshot = () => window.localStorage.getItem(CALIBRATION_STORAGE_KEY);
const getServerSnapshot = () => null;

export const useCalibrationSettings = () => {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return useMemo(() => parseCalibrationSettings(snapshot), [snapshot]);
};
