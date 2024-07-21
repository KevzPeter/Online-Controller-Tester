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
        setInterval(() => {
            setLoadingMessage(loadingMessages[(++counter) % 6]);
        }, 5000)
    }, [])

    return (
        <div className="basis-1/2 min-h-60 flex flex-col justify-center items-center gap-y-4">
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