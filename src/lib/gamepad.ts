export type ControllerType = "" | "xbox" | "dualsense";

export function detectControllerType(id: string): ControllerType {
    const normalized = id.toLowerCase();
    if (/x[- ]?box/.test(normalized) || normalized.includes("xinput")) return "xbox";
    if (normalized.includes("dualsense") ||
        (/054c/.test(normalized) && /0ce6|0df2/.test(normalized))) return "dualsense";
    return "";
}

// Use the same pad in both views; browsers can leave empty slots after unplugging.
export function getActiveGamepad(): Gamepad | null {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return null;
    try {
        return Array.from(navigator.getGamepads()).find((pad) => pad?.connected) ?? null;
    } catch {
        // Gamepad access can be denied by an embedding page's permissions policy.
        return null;
    }
}
