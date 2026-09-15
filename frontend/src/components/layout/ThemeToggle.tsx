"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "convertsheet-theme";

export interface ThemeToggleProps {
  className?: string;
}

function getStoredTheme(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(theme: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors in restricted/private browsing modes
  }
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    const hasDarkClass = document.documentElement.classList.contains("dark");
    const systemPrefersDark =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && (hasDarkClass || systemPrefersDark))) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    const nextDark = !currentlyDark;

    if (nextDark) {
      document.documentElement.classList.add("dark");
      setStoredTheme("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setStoredTheme("light");
      setIsDark(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle color theme"}
      title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle color theme"}
      data-testid="theme-toggle"
      className={`relative inline-flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
    >
      {mounted ? (
        isDark ? (
          <Sun className="w-5 h-5 text-amber-400 transition-transform rotate-0 scale-100" />
        ) : (
          <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-300 transition-transform rotate-0 scale-100" />
        )
      ) : (
        <Moon className="w-5 h-5 opacity-0" aria-hidden="true" />
      )}
    </button>
  );
}
