"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Download, Laptop, WifiOff, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    // Register Service Worker defensively
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      typeof navigator.serviceWorker?.register === "function"
    ) {
      try {
        const registration = navigator.serviceWorker.register("/sw.js");
        if (registration && typeof registration.then === "function") {
          registration.catch((err) => {
            console.warn("ServiceWorker registration skipped:", err);
          });
        }
      } catch (err) {
        console.warn("ServiceWorker registration error:", err);
      }
    }

    // Check if already in standalone mode
    if (
      typeof window !== "undefined" &&
      ((typeof window.matchMedia === "function" &&
        window.matchMedia("(display-mode: standalone)").matches) ||
        (window.navigator as any)?.standalone === true)
    ) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("PWA install error:", err);
    }
  }, [deferredPrompt]);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Offline Alert Badge if user is disconnected */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Offline Mode Active</span>
          <span className="sm:hidden">Offline</span>
        </div>
      )}

      {/* Install Button (Shown when prompt is available and not already standalone) */}
      {deferredPrompt && !isInstalled && (
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Install ConvertSheet App"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 border border-zinc-700/50 dark:border-zinc-300 shadow-xs transition-all"
        >
          <Laptop className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>Install App</span>
        </button>
      )}
    </div>
  );
}
