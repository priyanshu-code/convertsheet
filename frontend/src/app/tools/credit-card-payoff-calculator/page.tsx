import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { getToolBySlug } from "@/lib/tool-registry";
import { ToolJsonLdSchema } from "@/components/seo/ToolJsonLdSchema";
import { HowToGuide, FAQAccordion } from "@/components/seo";
import { EmbedTrigger } from "@/components/calculator/EmbedTrigger";
import { DebtPayoffCalculator } from "@/components/tools/DebtPayoffCalculator";

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator — Free Avalanche vs Snowball Payoff Plan",
  description:
    "Free credit card payoff calculator. Compare Debt Avalanche vs Snowball methods, calculate interest savings, and export amortization schedules to Excel (.xlsx).",
  alternates: {
    canonical: "https://www.convertsheet.com/tools/debt-payoff-calculator",
  },
};

export default function CreditCardPayoffPage() {
  const tool = getToolBySlug("debt-payoff-calculator");

  if (!tool) {
    return null;
  }

  const creditCardTool = {
    ...tool,
    slug: "credit-card-payoff-calculator",
    name: "Credit Card Payoff Calculator",
  };

  return (
    <>
      <ToolJsonLdSchema config={creditCardTool} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Tools Hub
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li>
              <Link
                href="/tools/category/financial"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Financial
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li className="font-medium text-zinc-800 dark:text-zinc-200 truncate" aria-current="page">
              Credit Card Payoff Calculator
            </li>
          </ol>
        </nav>

        {/* Answer-First AEO Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Client-Side • Private &amp; Free Forever</span>
            </div>
            <EmbedTrigger tool={creditCardTool} />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Credit Card Payoff Calculator
          </h1>

          {/* AEO Speakable Direct Answer Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium tool-answer-summary">
            💡 <strong className="text-zinc-900 dark:text-zinc-100">Direct Answer:</strong> {tool.answerSummary}
          </div>
        </div>

        {/* Primary Calculator UI */}
        <div className="max-w-6xl mx-auto w-full">
          <DebtPayoffCalculator />
        </div>

        {/* How-To Step Guide */}
        {tool.howTo && tool.howTo.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <HowToGuide
              config={{
                sourceFormat: "Credit Cards",
                targetFormat: "Debt Freedom",
                howTo: tool.howTo,
              } as any}
            />
          </div>
        )}

        {/* FAQ Accordion */}
        {tool.faqs && tool.faqs.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <FAQAccordion
              faqs={tool.faqs}
              title="Frequently Asked Questions: Credit Card Payoff"
              description="Answers to common questions regarding minimum payments, Avalanche vs Snowball, and interest savings."
            />
          </div>
        )}

        {/* Canonical redirect notice */}
        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 pt-4">
          Primary canonical hub:{" "}
          <Link
            href="/tools/debt-payoff-calculator"
            className="text-emerald-600 dark:text-emerald-400 underline font-medium"
          >
            Debt Payoff &amp; Snowball Calculator
          </Link>
        </div>
      </div>
    </>
  );
}
