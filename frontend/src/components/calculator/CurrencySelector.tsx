"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { MARKET_LIST, TargetMarket } from "@/lib/currency-config";

export function CurrencySelector({ className = "" }: { className?: string }) {
  const { market, setMarket, marketConfig } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Current Market: ${marketConfig.name} (${marketConfig.currencyCode}). Click to change.`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-colors border border-zinc-200/80 dark:border-zinc-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span className="text-sm leading-none" aria-hidden="true">{marketConfig.flag}</span>
        <span className="font-mono text-[11px]">{marketConfig.currencyCode}</span>
        <span className="text-zinc-400 font-mono text-[10px]">({marketConfig.currencySymbol})</span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
            Target Market &amp; Currency
          </div>

          <div className="p-1 space-y-0.5">
            {MARKET_LIST.map((m) => {
              const isSelected = m.code === market;
              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => {
                    setMarket(m.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{m.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{m.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {m.currencyCode} ({m.currencySymbol})
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
            <span className="font-semibold">{marketConfig.depositInsuranceName}</span> ({marketConfig.depositInsuranceLimit})
          </div>
        </div>
      )}
    </div>
  );
}
