"use client";
import { Canvas } from "@react-three/fiber";
import SceneContainer from "./scene";
import { Component, useState, type ReactNode } from "react";
import { useProgress } from "@react-three/drei";
import { RotateCcw } from "lucide-react";
import { useGamepadState } from "@/hooks/useGamepadState";
import { useDualSenseHid } from "@/hooks/useDualSenseHid";
import { dualSenseOrientation } from "@/lib/dualsenseOrientation";

function ModelLoadingStatus() {
    const { active } = useProgress();
    if (!active) return null;
    return (
        <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded bg-white/90 px-3 py-2 text-sm dark:bg-slate-900/90">Loading controller model...</span>
        </div>
    );
}

class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (this.state.failed) {
            return (
                <div role="alert" className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-6 text-center">
                    <p>The 3D view could not load. The button tester is still available.</p>
                    <button className="rounded border px-4 py-2" onClick={() => window.location.reload()}>
                        Reload 3D view
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const CanvasContainer = () => {
    const { controller } = useGamepadState();
    const hid = useDualSenseHid();
    const [previewOtherModel, setPreviewOtherModel] = useState(false);
    const alternateModel = controller.type === "xbox" ? "dualsense" : "xbox";
    const controllerType = previewOtherModel ? alternateModel : controller.connected ? controller.type : "dualsense";
    const trackMotion = Boolean(hid.connected && hid.report && controller.connected && controller.type === "dualsense");

    return (
        <div className="controller-stage relative h-[360px] w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 sm:h-[460px] lg:h-[560px] dark:border-slate-700/70">
            <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-2">
                {trackMotion && (
                    <button type="button" onClick={() => dualSenseOrientation.recenterHeading()}
                        aria-label="Reset heading"
                        title="Reset the relative heading if it drifts"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/50 bg-white/80 text-slate-700 shadow-sm backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600/50 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900">
                        <RotateCcw size={16} aria-hidden="true" />
                    </button>
                )}
                <label htmlFor="model-preview" className="inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-lg border border-white/50 bg-white/80 px-3 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-600/50 dark:bg-slate-900/70 dark:text-slate-200">
                    <span>{alternateModel === "xbox" ? "Xbox" : "PS5"} model</span>
                    <button
                        id="model-preview"
                        type="button"
                        role="switch"
                        aria-label={`Preview ${alternateModel === "xbox" ? "Xbox" : "PS5"} model`}
                        title={`Preview ${alternateModel === "xbox" ? "Xbox" : "PS5"} model`}
                        aria-checked={previewOtherModel}
                        onClick={() => setPreviewOtherModel((current) => !current)}
                        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${previewOtherModel
                            ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                        <span aria-hidden="true" className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${previewOtherModel ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                </label>
            </div>
            <ModelBoundary>
                <Canvas dpr={[1, 2]} camera={{ position: [0, 2.1, 4.8] }}
                    fallback={<p className="p-6 text-slate-700 dark:text-slate-100">WebGL is unavailable. Use the button tester to check your controller.</p>}>
                    <SceneContainer controllerType={controllerType} acceptCrossModelInput={previewOtherModel} trackMotion={trackMotion} />
                </Canvas>
                <ModelLoadingStatus />
            </ModelBoundary>
            {/* Keep HTML in the page's React root, outside the WebGL scene. */}
            {(!previewOtherModel && controller.connected && !controllerType) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4">
                    <p role="status" className="rounded-full border border-white/40 bg-white/70 px-4 py-2 text-center text-xs text-slate-600 backdrop-blur dark:border-slate-600/40 dark:bg-slate-900/60 dark:text-slate-300">
                        Controller connected, model not available for this type.
                    </p>
                </div>
            )}
            {controllerType === "xbox" && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
                    <p className="pointer-events-auto rounded bg-white/90 px-3 py-2 text-center text-xs text-slate-600 dark:bg-slate-900/90 dark:text-slate-300">
                        Xbox Elite model by{" "}
                        <a href="https://sketchfab.com/Rusfort" target="_blank" rel="noreferrer" className="underline">Rusfort</a>
                        {" · "}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY 4.0</a>
                        {" · Rig adapted"}
                    </p>
                </div>
            )}
        </div>
    )
}

export default CanvasContainer;
