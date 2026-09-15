import React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { cn } from "@/lib/utils";

export interface FAQAccordionProps {
  config: ConverterConfig;
  className?: string;
}

export function FAQAccordion({ config, className }: FAQAccordionProps) {
  const faqs = config.faqs;

  return (
    <section
      aria-labelledby="faq-accordion-heading"
      data-testid="faq-accordion"
      className={cn(
        "w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 lg:p-10 shadow-sm",
        className
      )}
    >
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help &amp; Documentation</span>
        </span>
        <h2
          id="faq-accordion-heading"
          className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Frequently Asked Questions About {config.title}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Everything you need to know about formats, privacy, and browser-based file conversion.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            data-testid={`faq-item-${index}`}
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 overflow-hidden transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 open:border-emerald-200 dark:open:border-emerald-900/50 open:bg-white dark:open:bg-zinc-900"
          >
            <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 list-none select-none hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl">
              <span className="text-sm sm:text-base font-semibold pr-4">
                {faq.question}
              </span>
              <ChevronDown className="w-5 h-5 text-zinc-400 group-open:text-emerald-600 dark:group-open:text-emerald-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
            </summary>
            <div className="px-5 pb-5 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 animate-in fade-in-50 duration-150">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
