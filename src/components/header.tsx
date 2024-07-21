"use client";

import Link from "next/link";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

const Header = () => {

    const [theme, setTheme] = useState(() => {
        const initialTheme = localStorage.getItem("theme");
        return initialTheme ? initialTheme : "dark";
    });

    useEffect(() => {
        getThemeFromLocalStorage();
        setClass();
    }, [theme]);

    const getThemeFromLocalStorage = () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }

    const setClass = () => {
        if (theme === 'dark') {
            document.querySelector("html")?.classList.add("dark");
        }
        else {
            document.querySelector("html")?.classList.remove("dark");
        }
    }

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === "light" ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            return newTheme;
        });
        setClass();
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