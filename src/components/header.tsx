"use client";

import Link from "next/link";
import Image from "next/image";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useSyncExternalStore, useEffect } from "react";

const subscribeToTheme = (onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener("theme-changed", onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("theme-changed", onChange);
    };
};

const getTheme = () => localStorage.getItem("theme") || "dark";
const getServerTheme = () => "dark";

const Header = () => {

    const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const toggleTheme = () => {
        localStorage.setItem("theme", theme === "light" ? "dark" : "light");
        window.dispatchEvent(new Event("theme-changed"));
    }

    return (
        <header className="mx-auto w-full max-w-[1600px] px-4 sm:px-6">
            <div className="flex h-20 w-full items-center justify-between gap-3">
                <Link href="/" aria-label="Online Controller Tester home" className="flex min-w-0 items-center gap-2.5">
                    <Image src="/logo.svg" alt="" width={36} height={36} priority className="shrink-0" />
                    <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-xl">
                        <span className="hidden sm:inline">Online </span>Controller Tester
                    </span>
                </Link>
                <Button variant="outline" size="icon" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={toggleTheme} className="shrink-0 rounded-xl">
                    {theme === 'light' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </Button>
            </div>
        </header>
    )
}

export default Header;
