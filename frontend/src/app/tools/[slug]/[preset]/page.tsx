import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, BookOpen, ArrowRight, Sparkles, HelpCircle, Calculator } from "lucide-react";
import { getToolBySlug } from "@/lib/tool-registry";
import {
  getAllPresetStaticParams,
  getProgrammaticPreset,
  getProgrammaticPresetsByTool,
} from "@/lib/programmatic-presets";
import { ToolJsonLdSchema } from "@/components/seo/ToolJsonLdSchema";
import { FAQAccordion } from "@/components/seo";
import { AdBanner } from "@/components/layout";
import { EmbedTrigger } from "@/components/calculator/EmbedTrigger";

// Import financial calculators that support programmatic presets
import { MortgageCalculator } from "@/components/tools/MortgageCalculator";
import { CarLoanCalculator } from "@/components/tools/CarLoanCalculator";
import { RetirementCalculator } from "@/components/tools/RetirementCalculator";
import { InflationCalculator } from "@/components/tools/InflationCalculator";
import { HourlyToSalaryCalculator } from "@/components/tools/HourlyToSalaryCalculator";
import { AnnualToHourlyCalculator } from "@/components/tools/AnnualToHourlyCalculator";
import { SavingsCdCalculator } from "@/components/tools/SavingsCdCalculator";
import { DebtPayoffCalculator } from "@/components/tools/DebtPayoffCalculator";
import { SalaryCalculator } from "@/components/tools/SalaryCalculator";
import { IncomeTaxCalculator } from "@/components/tools/IncomeTaxCalculator";
import { UkSalaryCalculator } from "@/components/tools/UkSalaryCalculator";
import { CanadaPaycheckCalculator } from "@/components/tools/CanadaPaycheckCalculator";
import { AustraliaPayCalculator } from "@/components/tools/AustraliaPayCalculator";
import { PercentageCalculator } from "@/components/tools/PercentageCalculator";
import { WageConversionMatrix } from "@/components/calculator/WageConversionMatrix";
import { InflationErosionMatrix } from "@/components/calculator/InflationErosionMatrix";
import { ApyCompoundingMatrix } from "@/components/calculator/ApyCompoundingMatrix";
import { CarLoanTermMatrix } from "@/components/calculator/CarLoanTermMatrix";

export interface ProgrammaticPresetPageProps {
  params: {
    slug: string;
    preset: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPresetStaticParams();
}

export async function generateMetadata({
  params,
}: ProgrammaticPresetPageProps): Promise<Metadata> {
  const preset = getProgrammaticPreset(params.slug, params.preset);

  if (!preset) {
    return {
      title: "Preset Not Found",
      description: "The requested calculator calculation preset was not found.",
    };
  }

  const canonicalUrl = `https://www.convertsheet.com/tools/${params.slug}/${params.preset}`;
  const ogImage = `https://www.convertsheet.com/tools/${params.slug}/${params.preset}/opengraph-image`;

  return {
    title: preset.title,
    description: preset.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: preset.title,
      description: preset.metaDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${preset.name} - ConvertSheet Free Calculations`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: preset.title,
      description: preset.metaDescription,
      images: [ogImage],
    },
  };
}

export default function ProgrammaticPresetPage({
  params,
}: ProgrammaticPresetPageProps) {
  const tool = getToolBySlug(params.slug);
  const preset = getProgrammaticPreset(params.slug, params.preset);

  if (!tool || !preset) {
    notFound();
  }

  // Sibling presets for internal linking network
  const siblingPresets = getProgrammaticPresetsByTool(params.slug).filter(
    (p) => p.presetSlug !== preset.presetSlug
  );

  const renderCalculator = () => {
    switch (tool.slug) {
      case "mortgage-calculator":
        return <MortgageCalculator initialValues={preset.initialValues} />;
      case "car-loan-calculator":
        return <CarLoanCalculator initialValues={preset.initialValues} />;
      case "retirement-calculator":
        return <RetirementCalculator initialValues={preset.initialValues} />;
      case "inflation-calculator":
        return <InflationCalculator initialValues={preset.initialValues} />;
      case "hourly-to-salary-calculator":
        return <HourlyToSalaryCalculator initialValues={preset.initialValues} />;
      case "annual-to-hourly-calculator":
        return <AnnualToHourlyCalculator initialValues={preset.initialValues} />;
      case "high-yield-savings-cd-calculator":
        return <SavingsCdCalculator initialValues={preset.initialValues} />;
      case "debt-payoff-calculator":
      case "credit-card-payoff-calculator":
        return <DebtPayoffCalculator initialValues={preset.initialValues} />;
      case "salary-calculator":
        return <SalaryCalculator initialValues={preset.initialValues} />;
      case "income-tax-calculator":
        return <IncomeTaxCalculator initialValues={preset.initialValues} />;
      case "uk-salary-calculator":
        return <UkSalaryCalculator initialValues={preset.initialValues} />;
      case "canada-paycheck-calculator":
        return <CanadaPaycheckCalculator initialValues={preset.initialValues} />;
      case "australia-pay-calculator":
        return <AustraliaPayCalculator initialValues={preset.initialValues} />;
      case "percentage-calculator":
        return <PercentageCalculator initialValues={preset.initialValues} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ToolJsonLdSchema
        config={{
          ...tool,
          name: preset.name,
          title: preset.title,
          metaDescription: preset.metaDescription,
          answerSummary: preset.answerSummary,
          about: preset.about,
          faqs: preset.faqs,
        }}
        canonicalUrl={`https://www.convertsheet.com/tools/${params.slug}/${params.preset}`}
        presetName={preset.name}
        parentToolName={tool.name}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            <li>
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li>
              <Link href="/tools" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Tools Hub
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li>
              <Link
                href={`/tools/category/${tool.category}`}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors capitalize"
              >
                {tool.category.replace("-", " & ")}
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li>
              <Link
                href={`/tools/${tool.slug}`}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {tool.name}
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li className="font-medium text-zinc-800 dark:text-zinc-200 truncate" aria-current="page">
              {preset.name}
            </li>
          </ol>
        </nav>

        {/* Answer-First AEO Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Client-Side • Amortization Excel Export</span>
            </div>
            <EmbedTrigger tool={tool} />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {preset.name}
          </h1>

          {/* AEO Speakable Direct Answer Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium tool-answer-summary text-left sm:text-center">
            💡 <strong className="text-zinc-900 dark:text-zinc-100">Direct Answer:</strong> {preset.answerSummary}
          </div>
        </div>

        {/* Primary Interactive Calculator UI pre-populated with preset parameters */}
        <div className="max-w-6xl mx-auto w-full">
          {renderCalculator()}
        </div>

        {/* Specialized High-Intent Preset Add-ons */}
        {(tool.slug === "hourly-to-salary-calculator" || preset.presetSlug.includes("-an-hour-salary")) && (
          <div className="max-w-5xl mx-auto w-full">
            <WageConversionMatrix
              initialHourlyRate={
                Number(
                  preset.initialValues?.hourlyRate ??
                    preset.initialValues?.hourlyWage
                ) || 25
              }
            />
          </div>
        )}

        {tool.slug === "inflation-calculator" && (
          <div className="max-w-5xl mx-auto w-full">
            <InflationErosionMatrix
              initialAmount={Number(preset.initialValues?.amount) || 100000}
            />
          </div>
        )}

        {tool.slug === "high-yield-savings-cd-calculator" && (
          <div className="max-w-5xl mx-auto w-full">
            <ApyCompoundingMatrix
              initialDeposit={Number(preset.initialValues?.initialDeposit) || 50000}
            />
          </div>
        )}

        {tool.slug === "car-loan-calculator" && (
          <div className="max-w-5xl mx-auto w-full">
            <CarLoanTermMatrix
              initialLoanAmount={Number(preset.initialValues?.vehiclePrice) || 35000}
            />
          </div>
        )}

        {/* Top Ad Slot */}
        <div className="flex justify-center w-full my-6">
          <AdBanner format="horizontal" />
        </div>

        {/* In-Depth About Section */}
        <section aria-labelledby="about-heading" className="space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 id="about-heading" className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              About {preset.name}
            </h2>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3">
            <p>{preset.about}</p>
            {tool.formulaDescription && (() => {
              const text = tool.formulaDescription;
              const hasWhere = text.toLowerCase().includes(", where ");
              const parts = hasWhere ? text.split(/, where /i) : [text];
              const formulaPart = parts[0];
              const variablesPart = parts[1];
              const hasEquation = formulaPart.includes("=") || formulaPart.includes(":");
              const formulas = formulaPart.includes(";") ? formulaPart.split(";").map((s) => s.trim()) : [formulaPart];

              return (
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 text-zinc-100 dark:bg-zinc-950 border border-zinc-800 shadow-md space-y-4 not-prose my-4">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans">
                        {hasEquation ? "Formula & Computation Model" : "Algorithm & Technical Model"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      Exact Computation
                    </span>
                  </div>

                  <div className="space-y-2">
                    {formulas.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="font-mono text-sm sm:text-base text-emerald-300 bg-zinc-950/80 dark:bg-black/40 px-3.5 py-2.5 rounded-xl border border-zinc-800/80 overflow-x-auto tracking-wide selection:bg-emerald-500/30"
                      >
                        {f}
                      </div>
                    ))}
                  </div>

                  {variablesPart && (
                    <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 space-y-2">
                      <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px] block">
                        Variable Definitions:
                      </span>
                      <div className="flex flex-wrap gap-2 font-sans">
                        {variablesPart.split(/,(?![^(]*\))/).map((vPart, vIdx) => {
                          const cleaned = vPart.replace(/^and\s+/i, "").trim();
                          if (!cleaned) return null;
                          return (
                            <span
                              key={vIdx}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-800/90 text-zinc-200 text-xs border border-zinc-700/60 font-mono"
                            >
                              {cleaned}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>

        {/* Sibling Long-Tail Presets (Internal Link Matrix) */}
        {siblingPresets.length > 0 && (
          <section className="space-y-4 max-w-4xl mx-auto border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Related {tool.name} Calculations
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {siblingPresets.map((sib) => (
                <Link
                  key={sib.presetSlug}
                  href={`/tools/${tool.slug}/${sib.presetSlug}`}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex items-center justify-between group shadow-xs"
                >
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {sib.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {preset.faqs && preset.faqs.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <FAQAccordion
              faqs={preset.faqs}
              title={`Frequently Asked Questions: ${preset.name}`}
              description="Clear mathematical answers to key questions, calculations, and loan parameters."
            />
          </div>
        )}
      </div>
    </>
  );
}
