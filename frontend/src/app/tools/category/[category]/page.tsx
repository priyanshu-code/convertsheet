import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Calculator,
  Terminal,
  Layers,
  HelpCircle,
} from "lucide-react";
import { getToolsByCategory, getAllTools } from "@/lib/tool-registry";
import { ToolCategory } from "@/types/tool";
import { FAQAccordion } from "@/components/seo/FAQAccordion";

export interface CategoryPageProps {
  params: {
    category: string;
  };
}

export const dynamicParams = false;

interface CategoryMeta {
  name: string;
  category: ToolCategory;
  title: string;
  metaDescription: string;
  headline: string;
  description: string;
  icon: typeof Calculator;
  faqs: { question: string; answer: string }[];
}

const CATEGORY_DATA: Record<string, CategoryMeta> = {
  financial: {
    name: "Financial Calculators",
    category: "financial",
    title: "Free Financial Calculators Online - Amortization, Loans & Wealth | ConvertSheet",
    metaDescription:
      "Accurate, private financial calculators for mortgages, car loans, retirement 401(k), inflation, EMI, and compound interest. Instant one-click Excel (.xlsx) exports.",
    headline: "Financial Calculators & Wealth Planning",
    description:
      "Model mortgages with full PITI escrows, calculate auto loan financing with trade-in tax credits, project multi-decade 401(k) nest eggs, and assess inflation's erosion on purchasing power. All calculations run client-side with full SheetJS Excel export.",
    icon: Calculator,
    faqs: [
      {
        question: "Can I export amortization schedules directly to Excel?",
        answer:
          "Yes! Every major financial calculator on ConvertSheet features our built-in SheetJS exporter. Click 'Export to Excel (.xlsx)' to download a cleanly formatted spreadsheet ready for Microsoft Excel, Apple Numbers, or Google Sheets.",
      },
      {
        question: "Are my personal financial inputs kept private?",
        answer:
          "100% private. Unlike financial portals that sell your loan inquiry data to brokers or lenders, ConvertSheet processes all math locally in your web browser. Zero bytes of your financial data ever leave your machine.",
      },
      {
        question: "How are the interest and amortization formulas verified?",
        answer:
          "Our engines adhere to standard financial industry standards (standard compound interest, reducing balance amortization, and actuarial annuity formulas) with comprehensive automated test suites.",
      },
    ],
  },
  "data-developer": {
    name: "Data & Developer Tools",
    category: "data-developer",
    title: "Free Developer Tools Online - Base64, JSON, JWT, UUID & Unix Time | ConvertSheet",
    metaDescription:
      "Fast, private developer utilities running 100% client-side. Format JSON, encode/decode Base64 and URLs, inspect JWT tokens, and generate UUIDs with zero server logging.",
    headline: "Data Engineering & Developer Utilities",
    description:
      "Transform, validate, and inspect developer payloads directly in your browser. From pretty-printing nested JSON and decoding JWT authorization tokens to generating cryptographically random UUIDs and translating Unix timestamps.",
    icon: Terminal,
    faqs: [
      {
        question: "Are API keys or JWT tokens safe to paste into these tools?",
        answer:
          "Yes. All parsing, validation, hashing, and encoding happen strictly in client-side JavaScript. No tokens, secrets, or payloads are transmitted to any server.",
      },
      {
        question: "Does the JSON formatter support large files?",
        answer:
          "Yes, the formatter runs in browser memory and comfortably parses multi-megabyte payloads without network timeouts or upload bandwidth bottlenecks.",
      },
      {
        question: "What standards do the hash and UUID generators adhere to?",
        answer:
          "UUIDs are generated using the Web Crypto API compliant with RFC 4122 v4 standards, while hash functions leverage native browser crypto implementations (SHA-256, SHA-512, MD5).",
      },
    ],
  },
  utility: {
    name: "Daily Utilities & PDF",
    category: "utility",
    title: "Free Daily Utilities & PDF Tools Online - 100% In-Browser | ConvertSheet",
    metaDescription:
      "Client-side daily utilities, PDF tools, and image converters. Merge, split, watermark, and number PDFs, convert WebP to PNG, and calculate age or BMI privately.",
    headline: "Daily Utilities, PDF & Image Tools",
    description:
      "Perform high-speed document operations and everyday conversions with zero software installs. Merge multiple PDFs, split documents by page ranges, convert images across WebP and PNG, and calculate unit conversions.",
    icon: Layers,
    faqs: [
      {
        question: "Are my confidential PDF documents uploaded to your servers?",
        answer:
          "No. All PDF operations (merging, splitting, watermarking, page numbering, and table extraction) use client-side WebAssembly and pdf-lib directly in your browser memory. Your documents are never uploaded.",
      },
      {
        question: "Is there a file size limit for PDF and image tools?",
        answer:
          "Since processing is powered by your local device hardware, there are no artificial server upload caps. You can merge, convert, and split large multi-megabyte files smoothly.",
      },
      {
        question: "Do these tools require a paid subscription or account?",
        answer:
          "Never. All tools on ConvertSheet are completely free, open to all users, with no subscription tiers or login requirements.",
      },
    ],
  },
};

export function generateStaticParams() {
  return [
    { category: "financial" },
    { category: "data-developer" },
    { category: "utility" },
  ];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const data = CATEGORY_DATA[params.category];

  if (!data) {
    return {
      title: "Category Not Found",
      description: "The requested tool category was not found.",
    };
  }

  const canonicalUrl = `https://www.convertsheet.com/tools/category/${data.category}`;

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.metaDescription,
    },
  };
}

export default function ToolCategoryPage({ params }: CategoryPageProps) {
  const meta = CATEGORY_DATA[params.category];

  if (!meta) {
    notFound();
  }

  const tools = getToolsByCategory(meta.category);
  const allTools = getAllTools();
  const IconComponent = meta.icon;

  const otherCategories = Object.values(CATEGORY_DATA).filter(
    (c) => c.category !== meta.category
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://www.convertsheet.com/tools/category/${meta.category}#webpage`,
        url: `https://www.convertsheet.com/tools/category/${meta.category}`,
        name: meta.title,
        description: meta.metaDescription,
        breadcrumb: {
          "@id": `https://www.convertsheet.com/tools/category/${meta.category}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://www.convertsheet.com/tools/category/${meta.category}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.convertsheet.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools Hub",
            item: "https://www.convertsheet.com/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: meta.name,
            item: `https://www.convertsheet.com/tools/category/${meta.category}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: meta.headline,
        numberOfItems: tools.length,
        itemListElement: tools.map((t, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: t.name,
          url: `https://www.convertsheet.com/tools/${t.slug}`,
          description: t.subtitle,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: meta.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
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
            <li aria-hidden="true" className="text-zinc-400">
              /
            </li>
            <li>
              <Link
                href="/tools"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Tools Hub
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">
              /
            </li>
            <li
              className="font-medium text-zinc-800 dark:text-zinc-200"
              aria-current="page"
            >
              {meta.name}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <IconComponent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {tools.length} Dedicated Tools • 100% Client-Side Privacy
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {meta.headline}
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {meta.description}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Available {meta.name} ({tools.length})
            </h2>
            <Link
              href="/tools"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View All 38 Tools <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                      {tool.category.replace("-", " ")}
                    </span>
                    {tool.badge && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <Sparkles className="w-2.5 h-2.5" />
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.name}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {tool.subtitle}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Private &amp; Free</span>
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Use Tool <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Category FAQs */}
        <section className="pt-6">
          <FAQAccordion
            config={{
              sourceFormat: meta.name,
              targetFormat: "Overview",
              faqs: meta.faqs,
            } as any}
          />
        </section>

        {/* Cross-Silo Discovery Section */}
        <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Explore Other Tool Suites
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Discover all 38 client-side utilities across developer and everyday productivity suites.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {otherCategories.map((other) => {
              const OtherIcon = other.icon;
              const count = allTools.filter((t) => t.category === other.category).length;
              return (
                <Link
                  key={other.category}
                  href={`/tools/category/${other.category}`}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-emerald-500 group-hover:text-white transition-colors flex items-center justify-center">
                      <OtherIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                        {other.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {count} tools available
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
