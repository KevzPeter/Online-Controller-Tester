"use client";

import { useState, CSSProperties, useEffect } from "react";
import BarLoader from "react-spinners/BarLoader";

const override: CSSProperties = {
    borderColor: "#2563EB",
};

const loadingMessages = [
    "Loading 3D model...",
    "Pushing pixels.",
    "Crunching numbers.",
    "Optimizing the optimizer.",
    "This may take a while.",
    "Let's hope it's worth the wait.",
]


const Spinner = () => {

    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        let counter = 0;
        const interval = setInterval(() => {
            setLoadingMessage(loadingMessages[(++counter) % 6]);
        }, 5000);

        return () => clearInterval(interval);
    }, [])

    return (
        <div className="flex h-[420px] w-full min-w-0 flex-col items-center justify-center gap-y-4 sm:h-[560px] lg:h-[clamp(560px,70vh,760px)]">
            <span className="text-md">{loadingMessage}</span>
            <BarLoader
                color="#2563EB"
                cssOverride={override}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    );
}

export default Spinner;
