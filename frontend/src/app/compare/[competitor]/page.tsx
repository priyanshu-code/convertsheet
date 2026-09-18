import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Check,
  X as XIcon,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Zap,
  Lock,
} from "lucide-react";
import {
  getAllComparisons,
  getAllComparisonSlugs,
  getComparisonBySlug,
} from "@/lib/comparison-data";
import { FAQAccordion } from "@/components/seo";
import { AdBanner } from "@/components/layout";

export interface ComparisonPageProps {
  params: {
    competitor: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllComparisonSlugs().map((competitor) => ({
    competitor,
  }));
}

export async function generateMetadata({
  params,
}: ComparisonPageProps): Promise<Metadata> {
  const comp = getComparisonBySlug(params.competitor);
  if (!comp) {
    return { title: "Competitor Comparison | ConvertSheet" };
  }

  const canonicalUrl = `https://www.convertsheet.com/compare/${comp.slug}`;

  return {
    title: comp.title,
    description: comp.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: comp.title,
      description: comp.metaDescription,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: comp.title,
      description: comp.metaDescription,
    },
  };
}

export default function ComparisonPage({ params }: ComparisonPageProps) {
  const comp = getComparisonBySlug(params.competitor);
  if (!comp) {
    notFound();
  }

  const otherComparisons = getAllComparisons().filter(
    (c) => c.slug !== comp.slug
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
          <li>
            <Link
              href="/"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-zinc-400">
            /
          </li>
          <li>
            <span className="text-zinc-500 dark:text-zinc-400">Compare</span>
          </li>
          <li aria-hidden="true" className="text-zinc-400">
            /
          </li>
          <li
            className="font-medium text-zinc-800 dark:text-zinc-200 truncate"
            aria-current="page"
          >
            {comp.competitorName} Alternative
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Privacy-First Software Comparison</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          {comp.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          {comp.heroSubheadline}
        </p>
      </div>

      {/* Side-by-Side Spec Matrix */}
      <section aria-labelledby="comparison-matrix-heading" className="space-y-6">
        <div className="text-center space-y-1">
          <h2
            id="comparison-matrix-heading"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
          >
            ConvertSheet vs {comp.competitorName}: Side-by-Side Comparison
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Comparing local client-side processing vs remote server workflows.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 w-1/3">
                  Capability / Feature
                </th>
                <th className="p-4 font-bold text-emerald-700 dark:text-emerald-400 w-1/3 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>ConvertSheet</span>
                  </div>
                </th>
                <th className="p-4 font-bold text-zinc-600 dark:text-zinc-400 w-1/3">
                  {comp.competitorName}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {comp.featuresMatrix.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="p-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {row.feature}
                  </td>
                  <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{row.convertsheet}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      {row.isAdvantage ? (
                        <XIcon className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : null}
                      <span>{row.competitor}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pros & Cons Comparison Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ConvertSheet Advantages */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-lg">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h3>Why ConvertSheet Wins</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            {comp.convertsheetAdvantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Competitor Drawbacks */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-lg">
            <Lock className="w-5 h-5 text-zinc-500" />
            <h3>{comp.competitorName} Limitations</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            {comp.consCompetitor.map((con, i) => (
              <li key={i} className="flex items-start gap-2">
                <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="flex justify-center w-full my-6">
        <AdBanner format="horizontal" />
      </div>

      {/* Recommended Converters / Calculators Grid */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Try ConvertSheet Tools (Free &amp; 100% In-Browser)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Instant client-side execution with zero file uploads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {comp.recommendedConverters.map((item) => {
            const href =
              item.type === "tool"
                ? `/tools/${item.slug}`
                : `/convert/${item.slug}`;
            return (
              <Link
                key={item.slug}
                href={href}
                className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>
        </div>
        <FAQAccordion faqs={comp.faqs} />
      </section>

      {/* Other Competitor Comparisons */}
      {otherComparisons.length > 0 && (
        <section className="border-t border-zinc-200 dark:border-zinc-800 pt-8 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Explore Other Comparisons
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {otherComparisons.map((other) => (
              <Link
                key={other.slug}
                href={`/compare/${other.slug}`}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 transition-all"
              >
                {other.competitorName} Alternative
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
