"use client";

import React, { useMemo } from "react";
import { Car, TrendingDown, ShieldCheck, ExternalLink, Info, Award } from "lucide-react";
import { getAffiliatePartnerLink } from "@/lib/affiliate-config";

export interface AutoLoanRatesCardProps {
  financedAmount?: number;
  loanTermMonths?: number;
}

interface CreditTier {
  tierName: string;
  scoreRange: string;
  newCarApr: number;
  usedCarApr: number;
  isRecommended?: boolean;
}

const CREDIT_TIERS: CreditTier[] = [
  { tierName: "Super Prime", scoreRange: "781 – 850", newCarApr: 5.38, usedCarApr: 6.8, isRecommended: true },
  { tierName: "Prime", scoreRange: "661 – 780", newCarApr: 6.89, usedCarApr: 9.04 },
  { tierName: "Non-Prime", scoreRange: "601 – 660", newCarApr: 9.83, usedCarApr: 13.53 },
  { tierName: "Subprime", scoreRange: "501 – 600", newCarApr: 12.93, usedCarApr: 18.55 },
];

export function AutoLoanRatesCard({
  financedAmount = 28000,
  loanTermMonths = 60,
}: AutoLoanRatesCardProps) {
  const calculations = useMemo(() => {
    return CREDIT_TIERS.map((tier) => {
      const r = tier.newCarApr / 100 / 12;
      const n = loanTermMonths;
      const monthlyPayment =
        financedAmount > 0
          ? Math.round((financedAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1))
          : 0;
      const totalInterest = monthlyPayment * n - financedAmount;

      return {
        ...tier,
        monthlyPayment,
        totalInterest: Math.max(0, totalInterest),
      };
    });
  }, [financedAmount, loanTermMonths]);

  // Interest saved between Non-Prime and Super Prime
  const interestDifference = Math.max(
    0,
    (calculations[2]?.totalInterest || 0) - (calculations[0]?.totalInterest || 0)
  );

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <Car className="w-3.5 h-3.5" />
            <span>Credit Score Rate Benchmarks</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Auto Loan Rates by Credit Score
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Estimated for a{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
              ${financedAmount.toLocaleString()}
            </span>{" "}
            loan over {loanTermMonths} months.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Experian Benchmark Data</span>
        </div>
      </div>

      {/* Credit Tier Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Credit Tier</th>
              <th className="py-3 px-4">FICO Score</th>
              <th className="py-3 px-4 text-right">New APR</th>
              <th className="py-3 px-4 text-right">Used APR</th>
              <th className="py-3 px-4 text-right">Est. Monthly</th>
              <th className="py-3 px-4 text-right">Total Interest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            {calculations.map((tier) => (
              <tr
                key={tier.tierName}
                className={
                  tier.isRecommended
                    ? "bg-emerald-50/40 dark:bg-emerald-950/15 font-semibold"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                }
              >
                <td className="py-3 px-4 whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-1.5">
                    {tier.isRecommended && <Award className="w-4 h-4 text-emerald-500" />}
                    <span>{tier.tierName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                  {tier.scoreRange}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {tier.newCarApr.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right font-mono text-zinc-500">
                  {tier.usedCarApr.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ${tier.monthlyPayment.toLocaleString()}/mo
                </td>
                <td className="py-3 px-4 text-right font-mono text-zinc-600 dark:text-zinc-400">
                  ${tier.totalInterest.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Credit Score Tip */}
      <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="font-bold text-zinc-900 dark:text-zinc-100">
            💡 Credit Score Impact Insight
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Borrowers who elevate their score from Non-Prime to Super Prime save an estimated{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              ${interestDifference.toLocaleString()}
            </strong>{" "}
            in pure interest fees on this vehicle loan.
          </p>
        </div>

        <a
          href={getAffiliatePartnerLink({
            category: "auto_loan",
            fallbackUrl: "https://www.bankrate.com/loans/auto-loans/rates/",
            loanAmount: financedAmount,
            params: { term: loanTermMonths },
          })}
          target="_blank"
          rel="noopener nofollow"
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-95"
        >
          <span>Compare Auto Lenders</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Advertising Disclosure */}
      <div className="flex items-start gap-2 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <p>
          <strong>Disclosure:</strong> Auto loan APR benchmarks are based on nationwide Experian State of the Automotive Finance Market quarterly reporting. ConvertSheet provides unbiased mathematical models and may receive referral fees from lenders.
        </p>
      </div>
    </div>
  );
}
