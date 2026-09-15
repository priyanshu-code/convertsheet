import React from "react";
import { ConverterConfig } from "@/types/registry";
import { cn } from "@/lib/utils";

export interface HowToGuideProps {
  config: ConverterConfig;
  className?: string;
}

export function HowToGuide({ config, className }: HowToGuideProps) {
  const steps = config.howTo;

  return (
    <section
      aria-labelledby="how-to-guide-heading"
      data-testid="how-to-guide"
      className={cn(
        "w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 lg:p-10 shadow-sm",
        className
      )}
    >
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
          Step-by-Step Guide
        </span>
        <h2
          id="how-to-guide-heading"
          className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          How to Convert {config.sourceFormat} to {config.targetFormat} Online in {steps.length} Simple Steps
        </h2>
        <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Convert your data effortlessly with zero installations and complete local privacy.
        </p>
      </div>

      <div className="relative">
        {/* Desktop Step Connectors Line */}
        <div
          className="hidden md:block absolute top-7 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-900/40 dark:via-emerald-700/60 dark:to-emerald-900/40"
          aria-hidden="true"
        />

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 list-none p-0 m-0">
          {steps.map((stepItem, index) => {
            const stepNumber = stepItem.step || index + 1;
            return (
              <li
                key={stepNumber}
                id={`step-${stepNumber}`}
                className="flex flex-col items-center text-center group scroll-mt-24"
                data-testid={`how-to-step-${stepNumber}`}
              >
                {/* Numbered step pill */}
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/80 shadow-md shadow-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-lg transition-transform duration-200 group-hover:scale-105">
                  <span className="font-mono">{stepNumber}</span>
                  <span className="sr-only">Step {stepNumber}:</span>
                </div>

                {/* Step Content */}
                <div className="mt-5 space-y-2 max-w-xs">
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {stepItem.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
