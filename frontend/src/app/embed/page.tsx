import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Code, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, Copy, HelpCircle, Layers, ArrowRight } from "lucide-react";
import { getAllTools } from "@/lib/tool-registry";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { EmbedWidgetCard } from "@/components/calculator/EmbedWidgetCard";

export const metadata: Metadata = {
  title: "Free Embeddable Financial & Calculation Widgets | ConvertSheet",
  description:
    "Embed 50+ free, client-side financial calculators, loan estimators, and file converters onto your website or blog. Fast, responsive, and 100% private.",
  alternates: {
    canonical: "https://www.convertsheet.com/embed",
  },
  openGraph: {
    title: "Free Embeddable Financial & Calculation Widgets | ConvertSheet",
    description:
      "Embed 50+ free, client-side financial calculators, loan estimators, and file converters onto your website or blog. Fast, responsive, and 100% private.",
    url: "https://www.convertsheet.com/embed",
    type: "website",
  },
};

export default function EmbedDirectoryPage() {
  const allTools = getAllTools();
  const allConverters = Object.values(CONVERTER_REGISTRY);

  // Highlight popular tools for top featured shelf
  const featuredSlugs = [
    "mortgage-calculator",
    "car-loan-calculator",
    "salary-calculator",
    "retirement-calculator",
    "compound-interest-calculator",
    "inflation-calculator",
    "sip-calculator",
    "percentage-calculator",
  ];

  const featuredTools = featuredSlugs
    .map((slug) => allTools.find((t) => t.slug === slug))
    .filter(Boolean);

  const categories = [
    { id: "finance", name: "Mortgages & Loans", slugs: ["mortgage-calculator", "car-loan-calculator", "debt-payoff-calculator", "emi-calculator"] },
    { id: "salary", name: "Salary & Paycheck", slugs: ["salary-calculator", "income-tax-calculator", "hourly-to-salary-calculator", "annual-to-hourly-calculator", "uk-salary-calculator", "canada-paycheck-calculator", "australia-pay-calculator"] },
    { id: "investing", name: "Savings & Wealth", slugs: ["compound-interest-calculator", "retirement-calculator", "high-yield-savings-cd-calculator", "inflation-calculator", "sip-calculator", "roi-calculator"] },
    { id: "developer", name: "Data & Developer Tools", slugs: ["json-formatter-validator", "base64-encoder-decoder", "jwt-decoder", "uuid-generator", "data-anonymizer-cleaner", "sheet-diff-checker"] },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
          <Code className="w-3.5 h-3.5" />
          <span>Interactive Calculator Widgets</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Embed Free Financial &amp; Calculation Tools
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Provide your website visitors with interactive calculations. Copy and paste 1 line of HTML to embed bank-grade mortgage, loan, salary, and investment calculators.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">100% Client-Side</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Calculations execute locally in the user&apos;s browser. Zero server loads or rate limits.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Zero Ads or Tracking</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Clean widgets focused on user experience. Seamless automatic light and dark mode.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">1-Line Copy &amp; Paste</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Standard responsive iframe embeds compatible with WordPress, Ghost, Webflow, and React.</p>
          </div>
        </div>
      </div>

      {/* Popular Featured Widgets */}
      <section aria-labelledby="featured-widgets-heading" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="featured-widgets-heading" className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Most Popular Calculator Widgets
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Ready to embed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredTools.map((tool) => (
            <EmbedWidgetCard key={tool!.slug} tool={tool!} />
          ))}
        </div>
      </section>

      {/* Categorized Directory */}
      <div className="space-y-10">
        {categories.map((cat) => {
          const categoryTools = cat.slugs
            .map((s) => allTools.find((t) => t.slug === s))
            .filter(Boolean);

          return (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`} className="space-y-4">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h2 id={`cat-${cat.id}`} className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {cat.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryTools.map((tool) => (
                  <EmbedWidgetCard key={tool!.slug} tool={tool!} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* How to Embed & Integration Guide */}
      <section aria-labelledby="how-to-embed-heading" className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-10 shadow-xs space-y-6">
        <h2 id="how-to-embed-heading" className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          How to Embed on Any Platform
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="space-y-2">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">WordPress &amp; Webflow</h3>
            <p>
              In your WordPress post editor or Webflow designer, add a <strong>Custom HTML / Embed</strong> block. Paste the iframe code snippet directly into the block and publish.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Ghost &amp; Substack</h3>
            <p>
              In Ghost, insert an <strong>HTML card</strong>. The responsive widget dynamically adapts to your blog&apos;s content width and scales for mobile readers automatically.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">React / Next.js / Astro</h3>
            <p>
              In modern web apps, render the iframe inside a responsive wrapper or React component with <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">width=&quot;100%&quot;</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Embed Directory FAQs */}
      <section aria-labelledby="embed-faq-heading" className="space-y-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 id="embed-faq-heading" className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1.5">
              Is embedding ConvertSheet widgets really 100% free?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Yes, completely free. There are no API keys, paywalls, or usage caps. You can embed our widgets on personal blogs, commercial portals, or educational sites without cost.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1.5">
              Do these widgets track my visitors or harvest financial data?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Never. Every calculation runs 100% in the client&apos;s browser memory using WebAssembly and JavaScript. No financial inputs, loan amounts, or salaries are transmitted to any server.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1.5">
              Can I customize the width and height of the embedded tool?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Yes. The iframe snippet is configured with <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">width=&quot;100%&quot;</code> by default so it naturally fills whatever container you place it in. You can also specify an exact pixel width (such as 600px or 750px) to suit your layout.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
