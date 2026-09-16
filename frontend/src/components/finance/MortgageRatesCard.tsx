"use client";

import React, { useMemo } from "react";
import { TrendingDown, Shield, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { getAffiliatePartnerLink, AFFILIATE_DISCLOSURE } from "@/lib/affiliate-config";

export interface MortgageRatesCardProps {
  loanAmount?: number;
}

interface RateRow {
  product: string;
  term: string;
  benchmarkRate: number;
  apr: number;
  highlight?: boolean;
}

const BENCHMARK_RATES: RateRow[] = [
  { product: "30-Year Fixed", term: "30 Years", benchmarkRate: 6.68, apr: 6.75, highlight: true },
  { product: "15-Year Fixed", term: "15 Years", benchmarkRate: 5.92, apr: 6.04 },
  { product: "5/1 Adj. Rate (ARM)", term: "5 Years Initial", benchmarkRate: 6.18, apr: 6.55 },
  { product: "FHA / VA 30-Year", term: "30 Years", benchmarkRate: 6.15, apr: 6.82 },
];

export function MortgageRatesCard({ loanAmount = 320000 }: MortgageRatesCardProps) {
  const calculations = useMemo(() => {
    return BENCHMARK_RATES.map((row) => {
      const r = row.benchmarkRate / 100 / 12;
      const n = row.product.includes("15") ? 180 : 360;
      const monthlyPAndI =
        loanAmount > 0
          ? Math.round((loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1))
          : 0;
      return {
        ...row,
        monthlyPAndI,
      };
    });
  }, [loanAmount]);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>National Benchmark Rates</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Compare Top Mortgage &amp; Refinance Rates
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Estimated monthly principal &amp; interest based on a{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
              ${loanAmount.toLocaleString()}
            </span>{" "}
            mortgage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>No SSN or Credit Pull Required</span>
        </div>
      </div>

      {/* Rates Table / Grid */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Loan Product</th>
              <th className="py-3 px-4 text-right">Interest Rate</th>
              <th className="py-3 px-4 text-right">APR</th>
              <th className="py-3 px-4 text-right">Est. Monthly P&amp;I</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            {calculations.map((item) => (
              <tr
                key={item.product}
                className={`transition-colors ${
                  item.highlight
                    ? "bg-emerald-50/40 dark:bg-emerald-950/15 font-medium"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {item.highlight && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <span>{item.product}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {item.benchmarkRate.toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-zinc-500">
                  {item.apr.toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  ${item.monthlyPAndI.toLocaleString()}/mo
                </td>
                <td className="py-3.5 px-4 text-right">
                  <a
                    href={getAffiliatePartnerLink({
                      category: "mortgage",
                      fallbackUrl: "https://www.bankrate.com/mortgages/mortgage-rates/",
                      loanAmount,
                    })}
                    target="_blank"
                    rel="noopener nofollow"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-95"
                  >
                    <span>Check Rates</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Perks Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Shop Multiple Lenders</p>
          <p>Borrowers who compare 3+ quotes save an average of $84,000 over a 30-year term.</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Points vs Zero-Cost</p>
          <p>Paying discount points lowers your ongoing interest rate if you plan to stay 5+ years.</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">PMI Removal Rules</p>
          <p>Request private mortgage insurance cancellation as soon as your loan-to-value reaches 80%.</p>
        </div>
      </div>

      {/* Transparent Affiliate & Advertising Disclosure */}
      <div className="flex items-start gap-2 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <p>{AFFILIATE_DISCLOSURE}</p>
      </div>
    </div>
  );
}
