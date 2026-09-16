"use client";

import React, { useState, memo } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Clock, Wallet, TrendingUp } from "lucide-react";
import { ModernSlider, SliderPreset } from "./ModernSlider";

export interface RetirementWizardValues {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  employerMatchPercent?: number;
  annualReturn?: number;
  inflationRate?: number;
  postRetirementAnnualSpend?: number;
}

export interface RetirementWizardProps {
  values: RetirementWizardValues;
  onChange: (key: keyof RetirementWizardValues, val: number) => void;
  onFinish: () => void;
  onSkip?: () => void;
  className?: string;
}

const AGE_PRESETS: SliderPreset[] = [
  { label: "25", value: 25 },
  { label: "30", value: 30 },
  { label: "35", value: 35 },
  { label: "45", value: 45 },
];

const RETIREMENT_AGE_PRESETS: SliderPreset[] = [
  { label: "55", value: 55 },
  { label: "60", value: 60 },
  { label: "65", value: 65 },
  { label: "70", value: 70 },
];

const SAVINGS_PRESETS: SliderPreset[] = [
  { label: "10k", value: 10000 },
  { label: "25k", value: 25000 },
  { label: "50k", value: 50000 },
  { label: "100k", value: 100000 },
  { label: "250k", value: 250000 },
];

const MONTHLY_PRESETS: SliderPreset[] = [
  { label: "250", value: 250 },
  { label: "500", value: 500 },
  { label: "1,000", value: 1000 },
  { label: "2,000", value: 2000 },
];

const MATCH_PRESETS: SliderPreset[] = [
  { label: "0%", value: 0 },
  { label: "50%", value: 50 },
  { label: "100%", value: 100 },
];

const SPEND_PRESETS: SliderPreset[] = [
  { label: "40k", value: 40000 },
  { label: "60k", value: 60000 },
  { label: "80k", value: 80000 },
  { label: "100k", value: 100000 },
];

const RETURN_PRESETS: SliderPreset[] = [
  { label: "6%", value: 6 },
  { label: "7%", value: 7 },
  { label: "8%", value: 8 },
  { label: "10%", value: 10 },
];

const INFLATION_PRESETS: SliderPreset[] = [
  { label: "2%", value: 2 },
  { label: "2.5%", value: 2.5 },
  { label: "3%", value: 3 },
  { label: "4%", value: 4 },
];

export const RetirementWizard = memo(function RetirementWizard({
  values,
  onChange,
  onFinish,
  onSkip,
  className = "",
}: RetirementWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const workingYears = Math.max(1, values.retirementAge - values.currentAge);
  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div
      role="region"
      aria-label="Personalized Retirement Planner Wizard"
      className={`rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 sm:p-7 space-y-6 ${className}`}
    >
      {/* Top Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs">
              {step}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className={step === 1 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>Timeline</span>
              <span>•</span>
              <span className={step === 2 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>Foundation</span>
              <span>•</span>
              <span className={step === 3 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>Outlook</span>
            </div>
          </div>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline decoration-dotted transition-colors"
            >
              Skip to Full Playground
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Step 1 of 3: Your Timeline</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Establish when you want to achieve financial independence.
            </p>
          </div>

          <div className="space-y-5">
            <ModernSlider
              id="wizard-current-age"
              label="Current Age"
              value={values.currentAge}
              min={18}
              max={75}
              step={1}
              suffix="yrs"
              presets={AGE_PRESETS}
              onChange={(val) => onChange("currentAge", val)}
            />

            <ModernSlider
              id="wizard-retirement-age"
              label="Target Retirement Age"
              value={values.retirementAge}
              min={Math.max(30, values.currentAge + 1)}
              max={85}
              step={1}
              suffix="yrs"
              presets={RETIREMENT_AGE_PRESETS}
              onChange={(val) => onChange("retirementAge", val)}
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">
              {workingYears} working years to compound your wealth
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
              Retiring at {values.retirementAge}
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Next: Savings Foundation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4" />
              <span>Step 2 of 3: Financial Foundation</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Where your retirement nest egg stands today and your monthly momentum.
            </p>
          </div>

          <div className="space-y-5">
            <ModernSlider
              id="wizard-current-savings"
              label="Current Retirement Savings"
              value={values.currentSavings}
              min={0}
              max={1000000}
              step={2500}
              prefix="$"
              presets={SAVINGS_PRESETS}
              onChange={(val) => onChange("currentSavings", val)}
            />

            <ModernSlider
              id="wizard-monthly-contribution"
              label="Monthly Savings Contribution"
              value={values.monthlyContribution}
              min={0}
              max={10000}
              step={50}
              prefix="$"
              suffix="/mo"
              presets={MONTHLY_PRESETS}
              onChange={(val) => onChange("monthlyContribution", val)}
            />

            <ModernSlider
              id="wizard-employer-match"
              label="Employer 401(k) Match"
              value={values.employerMatchPercent ?? 50}
              min={0}
              max={100}
              step={5}
              suffix="%"
              presets={MATCH_PRESETS}
              helpText="e.g. 50% match adds an extra $0.50 for every $1 you contribute."
              onChange={(val) => onChange("employerMatchPercent", val)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Next: Lifestyle & Outlook</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Step 3 of 3: Lifestyle & Market Outlook</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Fine-tune your expected spending and long-term investment assumptions.
            </p>
          </div>

          <div className="space-y-5">
            <ModernSlider
              id="wizard-post-spend"
              label="Desired Annual Spending in Retirement"
              value={values.postRetirementAnnualSpend ?? 60000}
              min={20000}
              max={250000}
              step={5000}
              prefix="$"
              suffix="/yr"
              presets={SPEND_PRESETS}
              onChange={(val) => onChange("postRetirementAnnualSpend", val)}
            />

            <ModernSlider
              id="wizard-annual-return"
              label="Expected Investment Return (Pre-Retirement)"
              value={values.annualReturn ?? 8}
              min={3}
              max={14}
              step={0.5}
              suffix="%"
              presets={RETURN_PRESETS}
              helpText="Historical broad market index avg is 7-10% nominal."
              onChange={(val) => onChange("annualReturn", val)}
            />

            <ModernSlider
              id="wizard-inflation-rate"
              label="Expected Long-term Inflation"
              value={values.inflationRate ?? 2.5}
              min={1}
              max={6}
              step={0.25}
              suffix="%"
              presets={INFLATION_PRESETS}
              helpText="Long-term Federal Reserve baseline target is 2-3%."
              onChange={(val) => onChange("inflationRate", val)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onFinish}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all scale-100 hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Sparkles className="w-4 h-4" />
              <span>Finish & View Full Plan</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
