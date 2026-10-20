"use client";

import Link from "next/link";
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
        <header className="px-8 py-2 flex">
            <div className="flex h-20 w-full items-center justify-between">
                <Link href="/">
                    <span className="text-2xl text-slate-900 dark:text-slate-50 font-medium">Online Controller Tester</span>
                </Link>
                <Button variant="outline" onClick={toggleTheme}>
                    {theme === 'light' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </Button>
            </div>
        </header>
    )
}

export default Header;
