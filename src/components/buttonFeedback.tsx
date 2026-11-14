import type { ComponentType, SVGProps } from "react";
import type { ButtonState } from "@/hooks/useGamepadState";
import DPadViz from "./dPadViz";
import Square from "../../public/assets/Buttons Outline/Black/SVG/Square.svg";
import Circle from "../../public/assets/Buttons Outline/Black/SVG/Circle.svg";
import Triangle from "../../public/assets/Buttons Outline/Black/SVG/Triangle.svg";
import Cross from "../../public/assets/Buttons Outline/Black/SVG/Cross.svg";
import L1 from "../../public/assets/Buttons Outline/Black/SVG/L1.svg";
import R1 from "../../public/assets/Buttons Outline/Black/SVG/R1.svg";
import L2 from "../../public/assets/Buttons Outline/Black/SVG/L2.svg";
import R2 from "../../public/assets/Buttons Outline/Black/SVG/R2.svg";
import L3 from "../../public/assets/Buttons Outline/Black/SVG/Left Stick Click.svg";
import R3 from "../../public/assets/Buttons Outline/Black/SVG/Right Stick Click.svg";
import Create from "../../public/assets/Buttons Outline/Black/SVG/Create.svg";
import Options from "../../public/assets/Buttons Outline/Black/SVG/Options.svg";
import TouchPad from "../../public/assets/Buttons Outline/Black/SVG/Touch Pad Press.svg";
import Home from "../../public/assets/Buttons Outline/Black/SVG/Home.svg";

type Indicator = {
    label: string;
    pressed: boolean;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function InputIndicators({ inputs, columns = "grid-cols-2" }: { inputs: Indicator[]; columns?: string }) {
    return (
        <div className={`grid gap-1.5 ${columns}`}>
            {inputs.map(({ label, pressed, Icon }) => (
                <div key={label} role="img" aria-label={`${label}: ${pressed ? "pressed" : "released"}`}
                    className={`flex min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 py-2 transition-colors motion-reduce:transition-none ${pressed
                        ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400"
                        : "border-slate-100 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400"}`}>
                    <Icon width={32} height={32} fill="currentColor" className="shrink-0" aria-hidden="true" />
                    <span className="text-[10px] font-medium sm:text-[11px]">{label}</span>
                </div>
            ))}
        </div>
    );
}

export default function ButtonFeedback({ buttons }: { buttons: ButtonState }) {
    const face: Indicator[] = [
        { label: "Cross / A", pressed: buttons.x, Icon: Cross },
        { label: "Circle / B", pressed: buttons.circle, Icon: Circle },
        { label: "Square / X", pressed: buttons.square, Icon: Square },
        { label: "Triangle / Y", pressed: buttons.triangle, Icon: Triangle },
    ];
    const shoulders: Indicator[] = [
        { label: "L1 / LB", pressed: buttons.l1, Icon: L1 },
        { label: "R1 / RB", pressed: buttons.r1, Icon: R1 },
        { label: "L2 / LT", pressed: buttons.l2, Icon: L2 },
        { label: "R2 / RT", pressed: buttons.r2, Icon: R2 },
        { label: "L3 / LS", pressed: buttons.l3, Icon: L3 },
        { label: "R3 / RS", pressed: buttons.r3, Icon: R3 },
    ];
    const system: Indicator[] = [
        { label: "Create / View", pressed: buttons.create, Icon: Create },
        { label: "Options / Menu", pressed: buttons.options, Icon: Options },
        { label: "Touchpad", pressed: buttons.touchpad, Icon: TouchPad },
        { label: "PS / Xbox", pressed: buttons.power, Icon: Home },
    ];

    return (
        <section aria-label="Button feedback" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Digital inputs</h2>
            <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
                <div role="group" aria-label="D-pad and face buttons" className="min-w-0">
                    <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-3">
                        <div className="flex justify-center text-slate-400 dark:text-slate-500 [&>svg]:h-[88px] [&>svg]:w-[88px]">
                            <DPadViz pressed={buttons.dpad} />
                        </div>
                        <InputIndicators inputs={face} />
                    </div>
                </div>
                <div role="group" aria-label="Shoulders and stick clicks" className="min-w-0 border-t border-slate-100 pt-4 dark:border-slate-800 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                    <InputIndicators inputs={shoulders} columns="grid-cols-3" />
                </div>
                <div role="group" aria-label="Menu and system" className="min-w-0 border-t border-slate-100 pt-4 dark:border-slate-800 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                    <InputIndicators inputs={system} />
                </div>
            </div>
        </section>
    );
}
