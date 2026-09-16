"use client";

import React from "react";
import { PiggyBank, ShieldCheck, Sparkles, ExternalLink, Info, ArrowUpRight } from "lucide-react";
import { getAffiliatePartnerLink, AFFILIATE_DISCLOSURE } from "@/lib/affiliate-config";

export interface RetirementAccountsCardProps {
  monthlySavings?: number;
}

interface AccountTier {
  category: string;
  name: string;
  yieldOrBenefit: string;
  highlight: string;
  minDeposit: string;
  badge?: string;
  link: string;
}

const RETIREMENT_TIERS: AccountTier[] = [
  {
    category: "High-Yield Cash",
    name: "High-Yield Savings & Cash Reserve",
    yieldOrBenefit: "4.75% – 5.10% APY",
    highlight: "FDIC insured up to $2,000,000 via sweep networks. Zero lockup or withdrawal penalties.",
    minDeposit: "$0 min",
    badge: "Most Liquid",
    link: "https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts",
  },
  {
    category: "Retirement",
    name: "Roth IRA (Tax-Free Growth)",
    yieldOrBenefit: "Tax-Free Compounding",
    highlight: "Pay taxes today; all withdrawals and capital gains are 100% tax-free in retirement.",
    minDeposit: "$0 commission",
    badge: "Top Tax Advantage",
    link: "https://www.investopedia.com/best-roth-ira-accounts-4770857",
  },
  {
    category: "Tax-Deferred",
    name: "Traditional IRA & 401(k) Rollover",
    yieldOrBenefit: "Upfront Tax Deduction",
    highlight: "Reduce your taxable income today. Maximize total portfolio principal compounding.",
    minDeposit: "$0 account fees",
    link: "https://www.investopedia.com/best-ira-accounts-4587873",
  },
];

export function RetirementAccountsCard({ monthlySavings = 750 }: RetirementAccountsCardProps) {
  // Approximate annual compound boost from a top 5% APY cash reserve vs 0.01% traditional bank
  const yearlyGain = Math.round((monthlySavings * 12 * 0.05) / 2);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Yield &amp; Wealth Acceleration</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Top High-Yield Accounts &amp; IRA Providers
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Maximizing your monthly{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
              ${monthlySavings.toLocaleString()}
            </span>{" "}
            contributions in tax-advantaged accounts compounds your net worth significantly faster.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>FDIC Insured Up To $250k+</span>
        </div>
      </div>

      {/* Account Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RETIREMENT_TIERS.map((tier) => (
          <div
            key={tier.name}
            className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-xs group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                  {tier.category}
                </span>
                {tier.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    {tier.badge}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {tier.name}
                </h4>
                <div className="mt-1.5 text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {tier.yieldOrBenefit}
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {tier.highlight}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {tier.minDeposit}
              </span>
              <a
                href={getAffiliatePartnerLink({
                  category: tier.category.toLowerCase().includes("cash") ? "savings" : "retirement",
                  fallbackUrl: tier.link,
                  params: { monthlySavings },
                })}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
              >
                <span>Compare</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Yield Highlight Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p>
          Moving emergency reserves from a big-bank checking account (0.01%) into a top High-Yield Savings Account (5.00%) produces an estimated{" "}
          <strong className="font-semibold underline underline-offset-2">${yearlyGain.toLocaleString()}+</strong> in passive interest every single year.
        </p>
      </div>

      {/* Advertising Disclosure */}
      <div className="flex items-start gap-2 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <p>{AFFILIATE_DISCLOSURE}</p>
      </div>
    </div>
  );
}
