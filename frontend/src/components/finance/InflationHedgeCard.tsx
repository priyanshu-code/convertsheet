"use client";

import React from "react";
import { TrendingUp, ShieldCheck, ExternalLink, Info, ShieldAlert } from "lucide-react";

export interface InflationHedgeCardProps {
  currentAmount?: number;
  targetYears?: number;
}

interface HedgeAsset {
  name: string;
  category: string;
  historicalRealReturn: string;
  inflationMechanism: string;
  liquidity: string;
  link: string;
}

const HEDGE_ASSETS: HedgeAsset[] = [
  {
    name: "Treasury Inflation-Protected Securities (TIPS)",
    category: "Sovereign Bonds",
    historicalRealReturn: "Real yield + CPI adjustment",
    inflationMechanism: "Principal value increases directly with the headline Consumer Price Index (CPI-U).",
    liquidity: "High (Secondary bond market / TreasuryDirect)",
    link: "https://www.treasurydirect.gov/marketable-securities/tips/",
  },
  {
    name: "Series I Savings Bonds",
    category: "US Treasury",
    historicalRealReturn: "Fixed rate + Semiannual Inflation Rate",
    inflationMechanism: "Interest rate adjusts every 6 months directly benchmarked to non-seasonally adjusted CPI.",
    liquidity: "1-year minimum lockup, 3-month interest penalty if redeemed < 5 years",
    link: "https://www.treasurydirect.gov/savings-bonds/i-bonds/",
  },
  {
    name: "Broad Market Equities (S&P 500 Index)",
    category: "Equity Index",
    historicalRealReturn: "~7.0% annualized real return",
    inflationMechanism: "Companies with pricing power increase revenue and dividend distributions as raw prices rise.",
    liquidity: "Instant (Traded daily via ETFs like VOO / SPY)",
    link: "https://www.investopedia.com/terms/s/sp500.asp",
  },
  {
    name: "High-Yield Cash / Ultra-Short Treasuries",
    category: "Cash Equivalents",
    historicalRealReturn: "Matches Fed Funds Rate (~4.5% - 5.0%)",
    inflationMechanism: "Short duration allows rapid re-investment at higher prevailing central bank interest rates.",
    liquidity: "Immediate (0 lockup, FDIC insured up to $250k)",
    link: "https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts",
  },
];

export function InflationHedgeCard({
  currentAmount = 100000,
  targetYears = 10,
}: InflationHedgeCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Purchasing Power Protection</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Top Inflation Hedging Strategies &amp; Assets
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Holding uninvested cash against a{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
              ${currentAmount.toLocaleString()}
            </span>{" "}
            portfolio over {targetYears} years guarantees erosion. Here is how institutional capital hedges purchasing power:
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Capital Preservation Guide</span>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HEDGE_ASSETS.map((asset) => (
          <div
            key={asset.name}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                  {asset.category}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {asset.historicalRealReturn}
                </span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {asset.name}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {asset.inflationMechanism}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate max-w-[200px]">
                {asset.liquidity}
              </span>
              <a
                href={asset.link}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
              >
                <span>Learn More</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Alert */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <p>
          Holding paper cash in checking accounts yielding 0.01% guarantees an immediate real-wealth loss equal to the annual inflation rate (~2.5%–4.0%). Diversifying across cash reserves, inflation-linked treasuries, and dividend equities preserves real purchasing power.
        </p>
      </div>

      {/* Advertising Disclosure */}
      <div className="flex items-start gap-2 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <p>
          <strong>Educational Disclaimer:</strong> ConvertSheet does not provide certified financial, legal, or investment advice. Historical returns are not guaranteed predictors of future yields. Always consult a licensed fiduciary financial advisor.
        </p>
      </div>
    </div>
  );
}
