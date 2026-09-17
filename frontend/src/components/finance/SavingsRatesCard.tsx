"use client";

import React, { useMemo } from "react";
import { TrendingUp, Shield, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { getAffiliatePartnerLink, AFFILIATE_DISCLOSURE } from "@/lib/affiliate-config";

export interface SavingsRatesCardProps {
  depositAmount?: number;
}

interface SavingsRateRow {
  institutionType: string;
  accountType: string;
  apy: number;
  highlight?: boolean;
  termNote: string;
  features: string;
}

const BENCHMARK_SAVINGS: SavingsRateRow[] = [
  {
    institutionType: "Top-Tier Online Bank (US / EU)",
    accountType: "High-Yield Savings (HYSA)",
    apy: 4.60,
    highlight: true,
    termNote: "Liquid / No lockup",
    features: "FDIC / EU Protected • Daily Compounding • No Fees",
  },
  {
    institutionType: "Direct Bank 12-Month CD",
    accountType: "Certificate of Deposit (CD)",
    apy: 4.85,
    termNote: "1-Year Guaranteed Term",
    features: "Fixed APY • Principal Protected • Insured",
  },
  {
    institutionType: "High-Yield Cash Account",
    accountType: "Cash Sweep Portfolio",
    apy: 4.45,
    termNote: "Same-Day Transfers",
    features: "Up to $2M Multi-Bank Sweep Insurance",
  },
  {
    institutionType: "Traditional Brick & Mortar",
    accountType: "Standard Checking / Savings",
    apy: 0.01,
    termNote: "National Average",
    features: "High opportunity cost vs High-Yield accounts",
  },
];

export function SavingsRatesCard({ depositAmount = 25000 }: SavingsRatesCardProps) {
  const calculations = useMemo(() => {
    return BENCHMARK_SAVINGS.map((row) => {
      const annualInterest = Math.round(depositAmount * (row.apy / 100));
      const monthlyInterest = Math.round(annualInterest / 12);
      return {
        ...row,
        annualInterest,
        monthlyInterest,
      };
    });
  }, [depositAmount]);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>US &amp; EU Benchmark Yields</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Current High-Yield Savings &amp; CD Benchmarks
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Projected annual cash earnings on a{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
              ${depositAmount.toLocaleString()}
            </span>{" "}
            cash allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 self-start sm:self-center">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>FDIC / European Deposit Guarantee</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="pb-3 pl-1">Institution &amp; Account</th>
              <th className="pb-3">APY</th>
              <th className="pb-3 text-right">Est. Annual Yield</th>
              <th className="pb-3 text-right pr-1">Est. Monthly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {calculations.map((row, idx) => {
              const targetUrl = getAffiliatePartnerLink({
                category: "savings",
                fallbackUrl: "https://www.bankrate.com/banking/savings/rates/",
                loanAmount: depositAmount,
              });

              return (
                <tr
                  key={idx}
                  className={`group transition-colors ${
                    row.highlight
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <td className="py-3.5 pl-1">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                        {row.accountType}
                        {row.highlight && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white leading-tight">
                            Recommended
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {row.institutionType} • {row.termNote}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
                    <span className={row.apy > 1 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
                      {row.apy}%
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    ${row.annualInterest.toLocaleString()}/yr
                  </td>
                  <td className="py-3.5 text-right pr-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    +${row.monthlyInterest.toLocaleString()}/mo
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Trust & Guarantee Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Government Insured (up to $250k / €100k)</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300">
          <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>400x Better than 0.01% Traditional Accounts</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Zero Lockup on Liquid HYSA Balances</span>
        </div>
      </div>

      {/* Compliance / Educational Disclaimer */}
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
        {AFFILIATE_DISCLOSURE}
      </p>
    </div>
  );
}
