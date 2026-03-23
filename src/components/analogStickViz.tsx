type AnalogStickVizProps = {
    label: string;
    x: number;
    y: number;
}

const clampAxisValue = (value: number) => Math.max(-1, Math.min(1, value));

const formatAxisValue = (value: number) => clampAxisValue(value).toFixed(3);

const AnalogStickViz = ({ label, x, y }: AnalogStickVizProps) => {
    const radius = 84;
    const center = 100;
    const dotRadius = 8;
    const safeX = clampAxisValue(x);
    const safeY = clampAxisValue(y);
    const dotX = center + safeX * radius;
    const dotY = center + safeY * radius;

    return (
        <div className="w-full rounded-xl border border-slate-200/80 bg-slate-100/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">{label}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">X: {formatAxisValue(safeX)} | Y: {formatAxisValue(safeY)}</span>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[220px]">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                    <circle cx={center} cy={center} r={radius} className="fill-slate-200 dark:fill-slate-800" />
                    <circle cx={center} cy={center} r={radius} fill="none" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="2" strokeOpacity="0.7" />
                    <line x1={center} y1={center - radius} x2={center} y2={center + radius} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" strokeDasharray="5 5" />
                    <line x1={center - radius} y1={center} x2={center + radius} y2={center} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" strokeDasharray="5 5" />

                    <circle cx={center} cy={center} r="4" className="fill-slate-600 dark:fill-slate-300" />
                    <circle cx={dotX} cy={dotY} r={dotRadius} className="fill-blue-600 transition-all duration-75 ease-linear" />
                    <circle cx={dotX} cy={dotY} r={dotRadius + 6} className="fill-blue-500/25 transition-all duration-75 ease-linear" />
                </svg>

                <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-[10px] font-medium text-slate-500 dark:text-slate-400">-1</span>
                <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500 dark:text-slate-400">1</span>
                <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500 dark:text-slate-400">-1</span>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500 dark:text-slate-400">1</span>
            </div>
        </div>
    );
};

export default AnalogStickViz;