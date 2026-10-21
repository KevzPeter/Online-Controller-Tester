"use client";
import { Canvas } from "@react-three/fiber";
import SceneContainer from "./scene";
import { Component, useState, type ReactNode } from "react";
import { useProgress } from "@react-three/drei";
import { useGamepadState } from "@/hooks/useGamepadState";

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
    const [previewOtherModel, setPreviewOtherModel] = useState(false);
    const alternateModel = controller.type === "xbox" ? "dualsense" : "xbox";
    const controllerType = previewOtherModel ? alternateModel : controller.connected ? controller.type : "dualsense";

    return (
        <div className="relative basis-1/2 min-h-[420px] lg:min-h-[560px] border-2 rounded-2xl mx-4 overflow-hidden">
            <button
                type="button"
                aria-pressed={previewOtherModel}
                onClick={() => setPreviewOtherModel((current) => !current)}
                className={`absolute right-3 top-3 z-10 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${previewOtherModel
                    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                    : "border-slate-300 bg-white/90 text-slate-800 hover:bg-white dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-900"}`}
            >
                Preview {alternateModel === "xbox" ? "Xbox" : "PS5"} model
            </button>
            <ModelBoundary>
                <Canvas style={{ minHeight: 420 }} dpr={[1, 2]} camera={{ position: [0, 2.1, 4.8] }}
                    fallback={<p className="p-6">WebGL is unavailable. Use the button tester to check your controller.</p>}>
                    <SceneContainer controllerType={controllerType} acceptCrossModelInput={previewOtherModel} />
                </Canvas>
                <ModelLoadingStatus />
            </ModelBoundary>
            {/* Keep HTML in the page's React root, outside the WebGL scene. */}
            {(!previewOtherModel && (!controller.connected || !controllerType)) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4">
                    <p role="status" className="rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-center text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100">
                        {controller.connected ? "Controller connected, model not available for this type." : "Connect your controller and press a button to begin."}
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
