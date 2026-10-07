import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Percent,
  Calculator,
  ArrowRight,
  Sparkles,
  Scale,
  ShieldAlert,
  Coins,
} from "lucide-react";

interface ShowcaseCard {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  formula: string;
  href: string;
  ctaText: string;
  icon: React.ElementType;
  highlights: string[];
}

const CARDS: ShowcaseCard[] = [
  {
    title: "Home Loan Balance Transfer Savings",
    badge: "Refinance Auditor",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60",
    description:
      "Audit whether switching lenders actually saves money or gets eaten by MODT stamp duty and processing fees. Calculates your exact break-even horizon in months.",
    formula: "Net Savings = (Old Int - New Int) - (MODT + Fees)",
    href: "/tools/home-loan-balance-transfer-calculator",
    ctaText: "Launch Balance Transfer Tool",
    icon: Scale,
    highlights: ["State-wise MODT stamp duty", "Break-even month cutoff", "Lifetime interest delta"],
  },
  {
    title: "Repo Rate Hike EMI Impact",
    badge: "RBI Policy Alert",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60",
    description:
      "Detect the silent tenure trap when the central bank hikes repo rates by +25 or +50 bps. See whether keeping your EMI constant extends your loan by 5–10 years.",
    formula: "Tenure Trap = f(EMI, Rate + Δbps, Principal)",
    href: "/tools/interest-rate-hike-calculator",
    ctaText: "Launch Rate Hike Tool",
    icon: ShieldAlert,
    highlights: ["+25 to +100 bps hike presets", "Tenure trap auditor", "Prepayment absorption"],
  },
  {
    title: "Standard Loan EMI & Amortization",
    badge: "Core Mortgage",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
    description:
      "High-precision principal vs interest amortization schedule. Test extra monthly prepayments to cut years off your home, auto, or personal loan.",
    formula: "EMI = [P × r × (1+r)ⁿ] ÷ [(1+r)ⁿ - 1]",
    href: "/tools/emi-calculator",
    ctaText: "Launch EMI Tool",
    icon: Calculator,
    highlights: ["Interactive amortization graph", "Extra prepayment slider", "Year-by-year payoff"],
  },
  {
    title: "SIP Wealth & Compounding",
    badge: "Wealth Planning",
    badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60",
    description:
      "Forecast compound wealth growth across mutual funds and equities. Includes annual step-up contributions and inflation-adjusted purchasing power.",
    formula: "M = P × [((1+i)ⁿ - 1) ÷ i] × (1+i)",
    href: "/tools/sip-calculator",
    ctaText: "Launch SIP Tool",
    icon: Coins,
    highlights: ["Annual step-up increment", "Inflation adjustment (6-8%)", "Compounding horizon"],
  },
];

export function TrendingFinancialSuite() {
  return (
    <section
      aria-labelledby="trending-financial-heading"
      className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800"
    >
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Flagship Mortgage &amp; Wealth Analytics</span>
        </div>
        <h2
          id="trending-financial-heading"
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Trending Financial &amp; Mortgage Suite
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Interactive mathematical auditors built for Indian borrowers and global investors. 100% private, client-side calculations with instant PDF exports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-7xl mx-auto">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                    {card.description}
                  </p>
                </div>

                {/* Mathematical Formula Preview Box */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                  <span className="text-zinc-400 dark:text-zinc-500 mr-1.5 select-none font-sans font-bold">
                    Formula:
                  </span>
                  <span>{card.formula}</span>
                </div>

                {/* Feature Highlights */}
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {card.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <Link
                  href={card.href}
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 transition-colors"
                >
                  <span>{card.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
