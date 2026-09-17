"use client";

import React, { useMemo } from "react";
import { Shield, ArrowRight, Percent, CheckCircle2, Zap } from "lucide-react";
import { getAffiliatePartnerLink, AFFILIATE_DISCLOSURE } from "@/lib/affiliate-config";

export interface DebtConsolidationCardProps {
  totalDebt?: number;
}

interface ConsolidationBenchmark {
  title: string;
  category: "credit_card" | "personal_loan";
  benchmarkApr: number;
  termMonths: number;
  tag: string;
  highlight?: boolean;
  notes: string;
}

const BENCHMARKS: ConsolidationBenchmark[] = [
  {
    title: "Balance Transfer Card (0% Promo)",
    category: "credit_card",
    benchmarkApr: 0.0,
    termMonths: 18,
    tag: "Lowest Cost Promo",
    highlight: true,
    notes: "0% APR for 15-21 months • 3% to 5% one-time transfer fee",
  },
  {
    title: "Fixed Debt Consolidation Loan",
    category: "personal_loan",
    benchmarkApr: 8.49,
    termMonths: 36,
    tag: "Predictable Fixed Rate",
    notes: "Fixed monthly payment • No compounding penalty APR",
  },
  {
    title: "Unconsolidated Credit Card Average",
    category: "credit_card",
    benchmarkApr: 24.99,
    termMonths: 36,
    tag: "Status Quo",
    notes: "US & EU revolving credit card index average",
  },
];

export function DebtConsolidationCard({ totalDebt = 15000 }: DebtConsolidationCardProps) {
  const currentDebt = Math.max(1000, totalDebt);

  const calculations = useMemo(() => {
    // Standard credit card APR baseline (24.99%)
    const baselineApr = 0.2499;
    const baselineMonthlyInterest = Math.round((currentDebt * (baselineApr / 12)));
    const baseline3YearInterest = Math.round(currentDebt * baselineApr * 2.2); // approx compounding

    return BENCHMARKS.map((b) => {
      let monthlyInterest = 0;
      let estSavings = 0;

      if (b.benchmarkApr === 0) {
        // 0% balance transfer: saves almost all monthly interest (minus ~3% transfer fee amortized)
        const transferFee = currentDebt * 0.03;
        monthlyInterest = Math.round(transferFee / b.termMonths);
        estSavings = Math.max(0, baselineMonthlyInterest - monthlyInterest);
      } else if (b.benchmarkApr < 20) {
        monthlyInterest = Math.round(currentDebt * (b.benchmarkApr / 100 / 12));
        estSavings = Math.max(0, baselineMonthlyInterest - monthlyInterest);
      } else {
        monthlyInterest = baselineMonthlyInterest;
        estSavings = 0;
      }

      return {
        ...b,
        monthlyInterest,
        estMonthlySavings: estSavings,
      };
    });
  }, [currentDebt]);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>US &amp; EU Refinance &amp; Payoff Benchmarks</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Debt Consolidation &amp; Rate Refinance Options
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comparing typical US &amp; EU personal loan APRs against high-interest credit cards for{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
              ${currentDebt.toLocaleString()}
            </span>{" "}
            in debt.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 self-start sm:self-center">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>FCA / CFPB Consumer Lending Standards</span>
        </div>
      </div>

      {/* Benchmark Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {calculations.map((item, idx) => {
          return (
            <div
              key={idx}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                item.highlight
                  ? "border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.highlight
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                    {item.benchmarkApr === 0 ? "0% Promo APR" : `${item.benchmarkApr}% APR`}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {item.notes}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Est. Monthly Interest:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    ${item.monthlyInterest.toLocaleString()}/mo
                  </span>
                </div>

                {item.estMonthlySavings > 0 ? (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Potential Savings:</span>
                    <span>+${item.estMonthlySavings.toLocaleString()}/mo</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Current baseline:</span>
                    <span>High APR</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Cut Interest by up to 60-100%</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300">
          <Percent className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Single predictable monthly payment</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Preserves credit score during payoff</span>
        </div>
      </div>

      {/* Compliance / Educational Disclaimer */}
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
        {AFFILIATE_DISCLOSURE}
      </p>
    </div>
  );
}
