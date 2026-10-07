import React from "react";
import { CheckCircle2, DollarSign, Calendar, TrendingDown, Percent, Award, ShieldCheck } from "lucide-react";

export interface PresetQuickFactCardProps {
  toolSlug: string;
  presetSlug: string;
  initialValues?: Record<string, unknown>;
  badge?: string;
}

export function PresetQuickFactCard({
  toolSlug,
  presetSlug,
  initialValues = {},
  badge,
}: PresetQuickFactCardProps) {
  // 1. Mortgage Calculation Facts
  if (toolSlug === "mortgage-calculator") {
    const homePrice = Number(initialValues.homePrice) || 400000;
    const downPayment = Number(initialValues.downPayment) || homePrice * 0.2;
    const loanAmount = Math.max(1000, homePrice - downPayment);
    const years = Number(initialValues.loanTermYears) || 30;
    const rate = Number(initialValues.interestRate) || 6.5;

    const r = rate / 100 / 12;
    const n = years * 12;
    const monthlyPayment =
      r === 0 ? loanAmount / n : (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const totalCost = monthlyPayment * n;
    const totalInterest = totalCost - loanAmount;
    // Standard 28% front-end debt-to-income ratio recommended household income
    const minAnnualIncome = Math.round((monthlyPayment / 0.28) * 12);

    return (
      <div className="w-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Key Financial Facts & Estimates (At a Glance)
            </span>
          </div>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Monthly P&I Payment
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${Math.round(monthlyPayment).toLocaleString()}/mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Lifetime Interest
            </span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ${Math.round(totalInterest).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Loan Cost
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${Math.round(totalCost).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Recommended Income (28% DTI)
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${minAnnualIncome.toLocaleString()}/yr
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Hourly to Salary / Wage Facts
  if (toolSlug === "hourly-to-salary-calculator" || toolSlug === "annual-to-hourly-calculator") {
    const hourly =
      Number(initialValues.hourlyRate ?? initialValues.hourlyWage) ||
      (Number(initialValues.annualSalary) ? Number(initialValues.annualSalary) / 2080 : 25);
    const annual = Math.round(hourly * 2080);
    const monthly = Math.round(annual / 12);
    const biweekly = Math.round(annual / 26);
    const daily = Math.round(hourly * 8);

    return (
      <div className="w-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Equivalent Pay Periods (2,080 Work Hours / Year)
            </span>
          </div>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Annual Salary
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${annual.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Monthly Paycheck
            </span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ${monthly.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Bi-Weekly Paycheck
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${biweekly.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Daily Earnings (8h)
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${daily.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Car Loan Facts
  if (toolSlug === "car-loan-calculator") {
    const price = Number(initialValues.vehiclePrice) || 35000;
    const down = Number(initialValues.downPayment) || price * 0.1;
    const loanAmount = Math.max(500, price - down);
    const months = Number(initialValues.loanTermMonths) || 60;
    const rate = Number(initialValues.interestRate) || 6.5;

    const r = rate / 100 / 12;
    const monthlyPayment =
      r === 0 ? loanAmount / months : (loanAmount * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
    const totalCost = monthlyPayment * months;
    const totalInterest = totalCost - loanAmount;

    return (
      <div className="w-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Financing Breakdown ({months} Months @ {rate}% APR)
            </span>
          </div>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Monthly Payment
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${Math.round(monthlyPayment).toLocaleString()}/mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Interest Paid
            </span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ${Math.round(totalInterest).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Financing Cost
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${Math.round(totalCost).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Net Amount Financed
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${Math.round(loanAmount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 4. US State Salary / Income Tax Facts
  if (toolSlug === "salary-calculator" || toolSlug === "income-tax-calculator") {
    const gross = Number(initialValues.grossSalary) || 75000;
    const stateTaxPercent = Number(initialValues.stateTaxPercent) || 0;
    // Approximations for instant Position 0 display
    const fedTax = gross * 0.12;
    const ficaTax = gross * 0.0765;
    const stateTax = gross * (stateTaxPercent / 100);
    const netAnnual = Math.round(gross - fedTax - ficaTax - stateTax);
    const netMonthly = Math.round(netAnnual / 12);
    const netBiweekly = Math.round(netAnnual / 26);
    const effectiveRate = ((gross - netAnnual) / gross) * 100;

    return (
      <div className="w-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Estimated Take-Home Summary (Single Filer)
            </span>
          </div>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Net Annual Pay
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${netAnnual.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Monthly Take-Home
            </span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ${netMonthly.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Bi-Weekly Paycheck
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ${netBiweekly.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Tax Bite %
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              {effectiveRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Image Resizer Facts
  if (toolSlug === "image-resizer") {
    const width = Number(initialValues.targetWidth) || 1080;
    const height = Number(initialValues.targetHeight) || 1080;
    const format = (initialValues.targetFormat as string) || "image/png";
    const formatLabel = format.replace("image/", "").toUpperCase();
    const megapixels = ((width * height) / 1000000).toFixed(2);

    return (
      <div className="w-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Preset Target Specifications ({width} × {height} px)
            </span>
          </div>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Target Dimensions
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              {width}×{height}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Aspect Ratio
            </span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {width === height ? "1:1 Square" : `${(width / height).toFixed(2)}:1`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Pixels
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              {megapixels} MP
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Default Format
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              {formatLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 6. Percentage Calculator Math Facts (Position-0 AEO Snippet)
  if (toolSlug === "percentage-calculator") {
    let expression = "0.20 × 100";
    let result = "20";
    let decimalFormula = "0.20 × 100 = 20";
    let fractionFormula = "20 / 100 × 100 = 20";

    if (presetSlug === "0-20-x-100") {
      expression = "0.20 * 100 (or 100 x 0.20)";
      result = "20";
      decimalFormula = "0.20 × 100 = 20";
      fractionFormula = "100 × 0.20 = 20";
    } else if (presetSlug === "100-percent-divided-by-20") {
      expression = "100% / 20";
      result = "5%";
      decimalFormula = "1.0 ÷ 20 = 0.05";
      fractionFormula = "100% ÷ 20 parts = 5% each";
    } else if (presetSlug === "what-is-20-percent-of-100") {
      expression = "20% of 100";
      result = "20";
      decimalFormula = "(20 ÷ 100) × 100 = 20";
      fractionFormula = "0.20 × 100 = 20";
    } else if (presetSlug === "what-is-15-percent-of-80") {
      expression = "15% of 80";
      result = "12";
      decimalFormula = "(15 ÷ 100) × 80 = 12";
      fractionFormula = "0.15 × 80 = 12";
    }

    return (
      <div className="w-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Instant Answer & Math Proof (At a Glance)
            </span>
          </div>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Expression
            </span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              {expression}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Evaluated Result
            </span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {result}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Decimal Formula
            </span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-50 font-mono">
              {decimalFormula}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Arithmetic Step
            </span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-50 font-mono">
              {fractionFormula}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 7. EMI Calculator & Repo Rate Hike Facts
  if (toolSlug === "emi-calculator") {
    const loanAmount = Number(initialValues.loanAmount) || 5000000;
    const rate = Number(initialValues.interestRate) || 8.75;
    const years = Number(initialValues.loanTenureYears) || 20;

    const r = rate / 100 / 12;
    const n = years * 12;
    const emi = Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPayment = emi * n;
    const totalInterest = totalPayment - loanAmount;

    // Base calculation before 25 bps hike (rate - 0.25)
    const baseR = Math.max(0.01, (rate - 0.25)) / 100 / 12;
    const baseEmi = Math.round((loanAmount * baseR * Math.pow(1 + baseR, n)) / (Math.pow(1 + baseR, n) - 1));
    const emiDelta = Math.max(0, emi - baseEmi);

    return (
      <div className="w-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Loan Repayment &amp; Repo Rate Impact Facts
            </span>
          </div>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Monthly EMI Payable
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ₹{emi.toLocaleString("en-IN")}/mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              +25 bps Monthly Hike
            </span>
            <span className="text-base sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              +₹{emiDelta.toLocaleString("en-IN")}/mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Interest Accrued
            </span>
            <span className="text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              ₹{totalInterest.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              Total Loan Outflow
            </span>
            <span className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
              ₹{totalPayment.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
