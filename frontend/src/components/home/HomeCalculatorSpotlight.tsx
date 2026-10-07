"use client";

import React, { useState } from "react";
import { ArrowRightLeft, TrendingUp, Calculator, ShieldCheck, Sparkles } from "lucide-react";
import { BalanceTransferCalculator } from "@/components/tools/BalanceTransferCalculator";
import { RateHikeCalculator } from "@/components/tools/RateHikeCalculator";
import { EmiCalculator } from "@/components/tools/EmiCalculator";
import { cn } from "@/lib/utils";

export type SpotlightCalculatorType = "balance-transfer" | "rate-hike" | "emi";

export function HomeCalculatorSpotlight() {
  const [activeCalc, setActiveCalc] = useState<SpotlightCalculatorType>("balance-transfer");

  const calcTabs = [
    {
      id: "balance-transfer" as const,
      label: "Home Loan Balance Transfer",
      icon: ArrowRightLeft,
      badge: "Savings & Break-Even",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80",
    },
    {
      id: "rate-hike" as const,
      label: "Repo Rate Hike EMI",
      icon: TrendingUp,
      badge: "Tenure Trap Alert",
      badgeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/80",
    },
    {
      id: "emi" as const,
      label: "Standard Loan EMI",
      icon: Calculator,
      badge: "Full Amortization",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800/80",
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Floating Sub-Tabs for Calculators */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="tablist">
          {calcTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCalc === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setActiveCalc(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer",
                  isActive
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 shadow-xs"
                    : "bg-transparent text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold border",
                    tab.badgeColor
                  )}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2 text-[11px] text-zinc-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Client-Side Computation</span>
        </div>
      </div>

      {/* Active Calculator Component */}
      <div className="w-full">
        {activeCalc === "balance-transfer" && <BalanceTransferCalculator />}
        {activeCalc === "rate-hike" && <RateHikeCalculator />}
        {activeCalc === "emi" && <EmiCalculator />}
      </div>
    </div>
  );
}
