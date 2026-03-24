import { useState, useEffect, useRef, useCallback } from "react";

export type ButtonState = {
    x: boolean;
    circle: boolean;
    square: boolean;
    triangle: boolean;
    l1: boolean;
    r1: boolean;
    l2: boolean;
    r2: boolean;
    l3: boolean;
    r3: boolean;
    create: boolean;
    options: boolean;
    dpad: {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
    };
    power: boolean;
    touchpad: boolean;
};

export type AxisState = {
    leftStick: { x: number; y: number };
    rightStick: { x: number; y: number };
};

export type TelemetryState = {
    pollingRate: number;
    batteryLevel: number | null;
    batteryCharging: boolean | null;
    hapticsSupported: boolean;
};

export type ControllerState = {
    name: string;
    type: "" | "xbox" | "dualsense";
    connected: boolean;
};

export type GamepadState = {
    controller: ControllerState;
    axes: AxisState;
    buttons: ButtonState;
    telemetry: TelemetryState;
};

const DEFAULT_BUTTON_STATE: ButtonState = {
    x: false,
    circle: false,
    square: false,
    triangle: false,
    l1: false,
    r1: false,
    l2: false,
    r2: false,
    l3: false,
    r3: false,
    create: false,
    options: false,
    dpad: { up: false, down: false, left: false, right: false },
    power: false,
    touchpad: false,
};

const DEFAULT_AXIS_STATE: AxisState = {
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
};

const DEFAULT_TELEMETRY_STATE: TelemetryState = {
    pollingRate: 0,
    batteryLevel: null,
    batteryCharging: null,
    hapticsSupported: false,
};

const DEFAULT_CONTROLLER_STATE: ControllerState = {
    name: "",
    type: "",
    connected: false,
};

const DEFAULT_GAMEPAD_STATE: GamepadState = {
    controller: DEFAULT_CONTROLLER_STATE,
    axes: DEFAULT_AXIS_STATE,
    buttons: DEFAULT_BUTTON_STATE,
    telemetry: DEFAULT_TELEMETRY_STATE,
};

const detectControllerType = (id: string): "" | "xbox" | "dualsense" => {
    const normalized = id.toLowerCase();
    if (normalized.startsWith("xbox")) return "xbox";
    if (normalized.startsWith("dualsense")) return "dualsense";
    return "";
};

const extractGamepadData = (gamepad: Gamepad): Omit<GamepadState, "telemetry"> => {
    return {
        controller: {
            name: gamepad.id,
            type: detectControllerType(gamepad.id),
            connected: true,
        },
        axes: {
            leftStick: {
                x: gamepad.axes[0] ?? 0,
                y: gamepad.axes[1] ?? 0,
            },
            rightStick: {
                x: gamepad.axes[2] ?? 0,
                y: gamepad.axes[3] ?? 0,
            },
        },
        buttons: {
            x: gamepad.buttons[0]?.pressed ?? false,
            circle: gamepad.buttons[1]?.pressed ?? false,
            square: gamepad.buttons[2]?.pressed ?? false,
            triangle: gamepad.buttons[3]?.pressed ?? false,
            l1: gamepad.buttons[4]?.pressed ?? false,
            r1: gamepad.buttons[5]?.pressed ?? false,
            l2: gamepad.buttons[6]?.pressed ?? false,
            r2: gamepad.buttons[7]?.pressed ?? false,
            create: gamepad.buttons[8]?.pressed ?? false,
            options: gamepad.buttons[9]?.pressed ?? false,
            l3: gamepad.buttons[10]?.pressed ?? false,
            r3: gamepad.buttons[11]?.pressed ?? false,
            dpad: {
                up: gamepad.buttons[12]?.pressed ?? false,
                down: gamepad.buttons[13]?.pressed ?? false,
                left: gamepad.buttons[14]?.pressed ?? false,
                right: gamepad.buttons[15]?.pressed ?? false,
            },
            power: gamepad.buttons[16]?.pressed ?? false,
            touchpad: gamepad.buttons[17]?.pressed ?? false,
        },
    };
};

export const useGamepadState = () => {
    const [gamepadState, setGamepadState] = useState<GamepadState>(DEFAULT_GAMEPAD_STATE);
    const activeControllerRef = useRef<Gamepad | null>(null);
    const previousPollTimestampRef = useRef<number | null>(null);

    const updateTelemetry = useCallback((controller: Gamepad | null) => {
        if (!controller) {
            setGamepadState((prev) => ({
                ...prev,
                controller: { ...DEFAULT_CONTROLLER_STATE },
                telemetry: { ...DEFAULT_TELEMETRY_STATE },
            }));
            return;
        }

        const now = performance.now();
        const previous = previousPollTimestampRef.current;
        let pollingRate = 0;

        if (previous) {
            pollingRate = 1000 / Math.max(1, now - previous);
        }

        previousPollTimestampRef.current = now;

        const controllerWithBattery = controller as Gamepad & {
            battery?: {
                level?: number;
                charging?: boolean;
            };
            vibrationActuator?: unknown;
            hapticActuators?: unknown[];
        };

        const batteryLevel = controllerWithBattery.battery?.level ?? null;
        const batteryCharging =
            typeof controllerWithBattery.battery?.charging === "boolean"
                ? controllerWithBattery.battery.charging
                : null;
        const hapticsSupported = Boolean(
            controllerWithBattery.vibrationActuator || controllerWithBattery.hapticActuators?.length
        );

        setGamepadState((prev) => ({
            ...prev,
            telemetry: {
                pollingRate: prev.telemetry.pollingRate
                    ? prev.telemetry.pollingRate * 0.75 + pollingRate * 0.25
                    : pollingRate,
                batteryLevel,
                batteryCharging,
                hapticsSupported,
            },
        }));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const controller = navigator.getGamepads().find((gp) => gp);

            if (controller) {
                activeControllerRef.current = controller;
                const gamepadData = extractGamepadData(controller);

                setGamepadState((prev) => ({
                    ...prev,
                    controller: gamepadData.controller,
                    axes: gamepadData.axes,
                    buttons: gamepadData.buttons,
                }));

                updateTelemetry(controller);
            } else {
                activeControllerRef.current = null;
                previousPollTimestampRef.current = null;

                setGamepadState((prev) => ({
                    ...prev,
                    controller: { ...DEFAULT_CONTROLLER_STATE },
                }));
            }
        }, 50);

        return () => clearInterval(interval);
    }, [updateTelemetry]);

    return gamepadState;
};
