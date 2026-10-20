"use client";

import dynamic from "next/dynamic";
import Spinner from "@/components/spinner";

const ClientCanvas = dynamic(() => import("./canvas"), {
    ssr: false,
    loading: () => <Spinner />,
});

export default ClientCanvas;
