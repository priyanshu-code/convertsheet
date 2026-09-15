import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Zap,
  Crown,
  Code2,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { AdBanner } from "@/components/layout";

export const metadata: Metadata = {
  title: "Pricing Plans - Free, Pro & Developer API",
  description:
    "Transparent pricing for ConvertSheet. Convert files up to 10MB free in your browser, upgrade to Pro for 100GB batch conversions, or automate via developer REST API.",
  alternates: {
    canonical: "https://convertsheet.com/pricing",
  },
  openGraph: {
    title: "ConvertSheet Pricing - Free, Pro & Developer API",
    description:
      "Convert files up to 10MB free in your browser, upgrade to Pro for 100GB batch conversions, or automate via developer REST API.",
    url: "https://convertsheet.com/pricing",
    type: "website",
  },
};

const TIERS = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    period: "forever",
    description:
      "Perfect for individuals and quick one-off conversions directly in your web browser.",
    highlight: false,
    badge: null,
    buttonText: "Start Free",
    buttonHref: "/",
    buttonVariant: "outline",
    features: [
      "Files up to 10MB per conversion",
      "100% Client-side browser privacy",
      "Zero server uploads for small files",
      "JSON, CSV, Excel & XML support",
      "Live 10-row tabular data preview",
      "Unlimited daily conversions",
    ],
    limitations: [
      "No batch conversions",
      "No PDF table OCR extraction",
      "No developer REST API access",
    ],
  },
  {
    name: "Pro",
    id: "pro",
    price: "$9.99",
    period: "per month",
    annualPrice: "$7.99/mo billed annually ($95/yr)",
    description:
      "Engineered for analysts, accountants, and businesses handling large or sensitive datasets.",
    highlight: true,
    badge: "Most Popular",
    buttonText: "Upgrade to Pro",
    buttonHref: "https://buy.stripe.com/test_convertsheet_pro",
    buttonVariant: "primary",
    features: [
      "Everything in Free, plus:",
      "Files up to 100GB via chunked backend",
      "Batch conversion (up to 50 files at once)",
      "PDF Table & Bank Statement to Excel",
      "Tally XML ERP voucher extraction",
      "Automated 15-minute file wipe guarantee",
      "Custom delimiters & character encodings",
      "Priority conversion queue",
    ],
    limitations: [],
  },
  {
    name: "Developer API",
    id: "api",
    price: "$19.99",
    period: "per month",
    annualPrice: "$15.99/mo billed annually ($190/yr)",
    description:
      "For engineers and software teams automating data ingestion pipelines in code.",
    highlight: false,
    badge: "For Developers",
    buttonText: "Get API Keys",
    buttonHref: "https://buy.stripe.com/test_convertsheet_api",
    buttonVariant: "outline",
    features: [
      "10,000 API conversions per month",
      "Python, Node.js & Go client SDKs",
      "Zapier, Make & n8n webhook integrations",
      "Programmatic PDF & XML parsing endpoints",
      "99.9% Uptime Service Level Agreement (SLA)",
      "Dedicated developer Slack support",
      "Volume overage at $0.001 per file",
    ],
    limitations: [],
  },
];

const PRICING_FAQS = [
  {
    q: "How does the Free plan remain free?",
    a: "Our free tier runs 100% client-side inside your browser using WebAssembly and modern JavaScript. Because your device processes the file directly, our server compute costs are zero, allowing us to keep it permanently free.",
  },
  {
    q: "How does the 15-minute file wipe guarantee work?",
    a: "When Pro users upload heavy files (>10MB) or PDFs to our backend conversion cluster, files are processed in encrypted temporary storage and permanently purged 15 minutes after conversion. We never retain, train on, or inspect your files.",
  },
  {
    q: "Can I cancel or switch plans at any time?",
    a: "Yes. All subscriptions are managed via Stripe Customer Portal. You can cancel, downgrade, or upgrade your plan with one click at any time with no lock-in.",
  },
  {
    q: "Do you offer developer API rate limits?",
    a: "API plans include up to 100 concurrent requests and 10,000 conversions per month. Higher limits, dedicated VPC instances, and self-hosted on-premise Docker deployments are available for enterprise customers.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Simple, Transparent Pricing</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Convert Free in Browser, Scale with Pro &amp; API
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Zero-cost private browser conversions for everyday tasks. High-capacity cloud processing and developer APIs for power users and automation.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            id={tier.id}
            className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-200 ${
              tier.highlight
                ? "bg-white dark:bg-zinc-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                : "bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  {tier.badge}
                </span>
              </div>
            )}

            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {tier.name}
                </h2>
                {tier.id === "free" && <Zap className="w-5 h-5 text-emerald-500" />}
                {tier.id === "pro" && <Crown className="w-5 h-5 text-emerald-500" />}
                {tier.id === "api" && <Code2 className="w-5 h-5 text-emerald-500" />}
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 min-h-[40px]">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {tier.price}
                  </span>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    /{tier.period}
                  </span>
                </div>
                {tier.annualPrice && (
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {tier.annualPrice}
                  </p>
                )}
              </div>

              {/* Action CTA */}
              <div className="mb-8">
                {tier.buttonHref.startsWith("http") ? (
                  <a
                    href={tier.buttonHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      tier.buttonVariant === "primary"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <span>{tier.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={tier.buttonHref}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      tier.buttonVariant === "primary"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <span>{tier.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Included Features
                </p>
                <ul className="space-y-2.5">
                  {tier.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Privacy Badge footer on cards */}
            <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                {tier.id === "free"
                  ? "Zero server storage. 100% in-browser."
                  : "Encrypted transmission. 15-min auto wipe."}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ad Banner */}
      <div className="flex justify-center w-full my-8">
        <AdBanner format="leaderboard" />
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Billing &amp; Privacy FAQ</span>
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Frequently Asked Pricing Questions
          </h2>
        </div>

        <div className="space-y-6">
          {PRICING_FAQS.map((faq, index) => (
            <div
              key={index}
              className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6 last:border-b-0 last:pb-0"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {faq.q}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
