export type CalibrationSettings = {
    deadzone: number;
    leftSensitivity: number;
    rightSensitivity: number;
    triggerSensitivity: number;
    invertLeftX: boolean;
    invertLeftY: boolean;
    invertRightX: boolean;
    invertRightY: boolean;
};

export const CALIBRATION_STORAGE_KEY = "controller-calibration";

export const DEFAULT_CALIBRATION_SETTINGS: CalibrationSettings = {
    deadzone: 0.08,
    leftSensitivity: 1,
    rightSensitivity: 1,
    triggerSensitivity: 1,
    invertLeftX: false,
    invertLeftY: false,
    invertRightX: false,
    invertRightY: false,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const parseCalibrationSettings = (raw: string | null): CalibrationSettings => {
    if (!raw) {
        return DEFAULT_CALIBRATION_SETTINGS;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<CalibrationSettings>;
        return {
            ...DEFAULT_CALIBRATION_SETTINGS,
            ...parsed,
        };
    }
    catch {
        return DEFAULT_CALIBRATION_SETTINGS;
    }
};

export const loadCalibrationSettings = (): CalibrationSettings => {
    if (typeof window === "undefined") {
        return DEFAULT_CALIBRATION_SETTINGS;
    }
    return parseCalibrationSettings(window.localStorage.getItem(CALIBRATION_STORAGE_KEY));
};

export const saveCalibrationSettings = (settings: CalibrationSettings) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(settings));
};

export const applyAxisCalibration = (
    value: number,
    sensitivity: number,
    invert: boolean,
    deadzone: number,
) => {
    let next = invert ? -value : value;
    if (Math.abs(next) < deadzone) {
        next = 0;
    }
    next *= sensitivity;
    return clamp(next, -1, 1);
};
