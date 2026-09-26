"use client";

import React from "react";
import { Globe, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getAffiliatePartnerLink, AFFILIATE_DISCLOSURE } from "@/lib/affiliate-config";

export interface RemittancePartnerCardProps {
  sourceCurrency?: string;
  targetCurrency?: string;
}

interface RemittanceProvider {
  name: string;
  tagline: string;
  highlight?: boolean;
  rateFeature: string;
  speed: string;
  link: string;
}

const REMITTANCE_PROVIDERS: RemittanceProvider[] = [
  {
    name: "Wise (formerly TransferWise)",
    tagline: "True Mid-Market Exchange Rate",
    highlight: true,
    rateFeature: "Zero hidden markups • Mid-market exchange rate • Transparent fees",
    speed: "Instant to same-day delivery",
    link: "https://wise.com",
  },
  {
    name: "Revolut Multi-Currency",
    tagline: "Global Spending & Remittance Account",
    rateFeature: "Hold 30+ currencies • Free fee allowances on weekdays • Multi-currency IBAN",
    speed: "Real-time to same-day",
    link: "https://revolut.com",
  },
  {
    name: "OFX Global Currency",
    tagline: "Dedicated Broker for Transfers > $5,000",
    rateFeature: "24/7 dedicated currency dealers • Forward contracts & rate locks",
    speed: "1-2 business days",
    link: "https://ofx.com",
  },
];

export function RemittancePartnerCard({
  sourceCurrency = "USD",
  targetCurrency = "INR",
}: RemittancePartnerCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
              International Transfer & Currency Accounts
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Compare transparent mid-market FX rates to transfer {sourceCurrency} to {targetCurrency} without hidden bank fees.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          Bank-Grade Security
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REMITTANCE_PROVIDERS.map((provider) => {
          const partnerUrl = getAffiliatePartnerLink({
            category: "remittance",
            fallbackUrl: provider.link,
          });

          return (
            <div
              key={provider.name}
              className={`rounded-xl p-4 flex flex-col justify-between transition-all border ${
                provider.highlight
                  ? "bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent border-blue-200 dark:border-blue-800/80 shadow-xs"
                  : "bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {provider.name}
                  </span>
                  {provider.highlight && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  {provider.tagline}
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
                  {provider.rateFeature}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{provider.speed}</span>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={partnerUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-colors"
                >
                  <span>Compare Live Rates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
        {AFFILIATE_DISCLOSURE}
      </p>
    </div>
  );
}
