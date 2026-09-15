"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Layers,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  className?: string;
}

const PRO_FEATURES = [
  {
    icon: HardDrive,
    title: "Up to 100GB Files",
    description:
      "Process massive spreadsheets and huge datasets with dedicated background worker memory.",
  },
  {
    icon: Layers,
    title: "Batch Conversion",
    description:
      "Queue and convert thousands of files simultaneously with automated zip downloads.",
  },
  {
    icon: ShieldCheck,
    title: "15-Min Auto File Wipe",
    description:
      "Strict enterprise zero-retention guarantee. All uploaded files are permanently deleted after 15 minutes.",
  },
  {
    icon: Code2,
    title: "Developer REST API & CLI",
    description:
      "Integrate automated spreadsheet transformations directly into your backend workflows and CI pipelines.",
  },
];

export function ProUpgradeModal({
  isOpen,
  onClose,
  reason,
  className,
}: ProUpgradeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus trap, auto-focus, focus restore, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;

    const originalOverflow =
      typeof document !== "undefined" ? document.body.style.overflow : "";
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    // Auto-focus close button or first action on mount
    const timer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!dialogRef.current) return;

        const focusableElements = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      clearTimeout(timer);
      if (typeof document !== "undefined") {
        document.body.style.overflow = originalOverflow;
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
      }
      previousActiveElementRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-modal-title"
      aria-describedby={reason ? "pro-modal-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 animate-in zoom-in-95 duration-150",
          className
        )}
      >
        {/* Top Decorative Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ConvertSheet Pro Required</span>
            </div>

            <h2
              id="pro-modal-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Upgrade to Pro for Heavy Files
            </h2>

            {reason && (
              <p
                id="pro-modal-description"
                className="text-sm text-zinc-600 dark:text-zinc-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-lg text-left"
              >
                {reason}
              </p>
            )}
          </div>

          {/* Pro Features Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              What you get with Pro:
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {PRO_FEATURES.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{feature.title}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/pricing"
              onClick={onClose}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all text-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>View Pro Plans ($9.99/mo)</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
