"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DollarSign, Clock, Calendar, Briefcase, Table as TableIcon, Wallet, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcExportButton,
  CalcPromptButton,
  CalcSaveButton,
  CalcShareButton,
  ModernSlider,
} from "@/components/calculator";
import { calculateHourlyToSalary, calculateUsSalary } from "@/lib/engines/financial-engine";

export interface HourlyToSalaryCalculatorProps {
  initialValues?: Partial<{
    hourlyRate: number;
    hoursPerWeek: number;
    weeksPerYear: number;
    unpaidLeaveDays: number;
    overtimeHoursPerWeek: number;
    overtimeMultiplier: number;
  }>;
}

export function HourlyToSalaryCalculator({
  initialValues,
}: HourlyToSalaryCalculatorProps = {}) {
  const [hourlyRate, setHourlyRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("hourlyRate");
      if (q) return Number(q);
    }
    return Number(initialValues?.hourlyRate ?? (initialValues as Record<string, unknown>)?.hourlyWage) || 25;
  });

  const [hoursPerWeek, setHoursPerWeek] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("hoursPerWeek");
      if (q) return Number(q);
    }
    return Number(initialValues?.hoursPerWeek) || 40;
  });

  const [weeksPerYear, setWeeksPerYear] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("weeksPerYear");
      if (q) return Number(q);
    }
    return Number(initialValues?.weeksPerYear) || 52;
  });

  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("unpaidLeaveDays");
      if (q) return Number(q);
    }
    return Number(initialValues?.unpaidLeaveDays) || 0;
  });

  const [overtimeHours, setOvertimeHours] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("overtimeHours");
      if (q) return Number(q);
    }
    return Number(initialValues?.overtimeHoursPerWeek) || 0;
  });

  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("overtimeMultiplier");
      if (q) return Number(q);
    }
    return Number(initialValues?.overtimeMultiplier) || 1.5;
  });

  const result = useMemo(() => {
    return calculateHourlyToSalary({
      hourlyRate,
      hoursPerWeek,
      weeksPerYear,
      unpaidLeaveDays,
      overtimeHoursPerWeek: overtimeHours,
      overtimeMultiplier,
    });
  }, [
    hourlyRate,
    hoursPerWeek,
    weeksPerYear,
    unpaidLeaveDays,
    overtimeHours,
    overtimeMultiplier,
  ]);

  const netPayEst = useMemo(() => {
    return calculateUsSalary({
      grossSalary: result.annualSalary,
      filingStatus: "single",
    });
  }, [result.annualSalary]);

  // Dynamic State Serialization (URL Permalink Engine)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (hourlyRate > 0) params.set("hourlyRate", hourlyRate.toString());
    if (hoursPerWeek > 0) params.set("hoursPerWeek", hoursPerWeek.toString());
    if (weeksPerYear > 0) params.set("weeksPerYear", weeksPerYear.toString());
    if (overtimeHours > 0) params.set("overtimeHours", overtimeHours.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [hourlyRate, hoursPerWeek, weeksPerYear, overtimeHours]);

  // Branded SheetJS Excel Export with live recalculation retention hook
  const handleExportExcel = () => {
    try {
      const summaryRows: (string | number)[][] = [
        ["ConvertSheet - Hourly Wage to Salary Payroll Conversion", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/hourly-to-salary-calculator"],
        ["", ""],
        ["--- HOURLY & WORK SCHEDULE PARAMETERS ---", ""],
        ["Base Hourly Rate ($/hr)", hourlyRate],
        ["Regular Hours Per Week", hoursPerWeek],
        ["Weeks Worked Per Year", weeksPerYear],
        ["Unpaid Leave Days Per Year", unpaidLeaveDays],
        ["Overtime Hours Per Week", overtimeHours],
        ["Overtime Pay Multiplier", `${overtimeMultiplier}x`],
        ["Total Work Hours Yearly", result.totalWorkHoursYearly],
        ["", ""],
        ["--- GROSS EARNINGS CONVERSION BY PAYROLL INTERVAL ---", "", ""],
        ["Interval", "Gross Earnings ($)", "Payroll Frequency"],
        ["Hourly Rate", result.hourlyRate, "Per billable hour"],
        ["Daily Pay (8h)", result.dailyPay, "Standard workday"],
        ["Weekly Pay (52x)", result.weeklyPay, "Every week"],
        ["Bi-Weekly Pay (26x)", result.biWeeklyPay, "Every two weeks"],
        ["Semi-Monthly Pay (24x)", result.semiMonthlyPay, "Twice a month"],
        ["Monthly Pay (12x)", result.monthlyPay, "Per calendar month"],
        ["Annual Gross Salary", result.annualSalary, "Full year gross"],
        ["", ""],
        ["--- ESTIMATED NET TAKE-HOME PAY (US FED + FICA) ---", "", ""],
        ["Net Annual Take-Home ($)", Math.round(netPayEst.netAnnualTakeHome), "Estimated take-home in pocket"],
        ["Net Monthly Take-Home ($)", Math.round(netPayEst.netMonthlyTakeHome), "Monthly cash flow"],
        ["Net Bi-Weekly Take-Home ($)", Math.round(netPayEst.netBiWeeklyTakeHome), "Typical paycheck amount"],
        ["Effective Tax Rate", `${netPayEst.effectiveTaxRate}%`, "Federal Tax + FICA (Single Filer)"],
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PayrollConversion");
      XLSX.writeFile(
        wb,
        `ConvertSheet_Hourly_Salary_${hourlyRate}_per_hr_${hoursPerWeek}hrs.xlsx`
      );
    } catch (err) {
      console.error("Hourly to salary Excel export failed:", err);
    }
  };

  // SheetJS formatted export rows
  const exportData = useMemo(() => {
    return [
      { Interval: "Hourly Wage", Amount: `$${result.hourlyRate.toFixed(2)}`, Note: "Base rate" },
      { Interval: "Daily Pay", Amount: `$${result.dailyPay.toLocaleString()}`, Note: "Based on 8h/day (or 1/5th weekly)" },
      { Interval: "Weekly Pay", Amount: `$${result.weeklyPay.toLocaleString()}`, Note: `${hoursPerWeek}h regular + ${overtimeHours}h OT` },
      { Interval: "Bi-Weekly Pay (Gross)", Amount: `$${result.biWeeklyPay.toLocaleString()}`, Note: "26 paychecks per year" },
      { Interval: "Semi-Monthly Pay (Gross)", Amount: `$${result.semiMonthlyPay.toLocaleString()}`, Note: "24 paychecks per year (twice monthly)" },
      { Interval: "Monthly Gross Pay", Amount: `$${result.monthlyPay.toLocaleString()}`, Note: "12 paychecks per year" },
      { Interval: "Annual Gross Salary", Amount: `$${result.annualSalary.toLocaleString()}`, Note: `${weeksPerYear} weeks worked per year` },
      { Interval: "--- ESTIMATED TAKE-HOME (AFTER TAXES) ---", Amount: "", Note: "" },
      { Interval: "Annual Net Take-Home", Amount: `$${Math.round(netPayEst.netAnnualTakeHome).toLocaleString()}`, Note: `Effective Tax Rate: ${netPayEst.effectiveTaxRate}%` },
      { Interval: "Monthly Net Take-Home", Amount: `$${Math.round(netPayEst.netMonthlyTakeHome).toLocaleString()}`, Note: "Post-tax take-home" },
      { Interval: "Bi-Weekly Net Take-Home", Amount: `$${Math.round(netPayEst.netBiWeeklyTakeHome).toLocaleString()}`, Note: "Post-tax take-home" },
    ];
  }, [result, hoursPerWeek, overtimeHours, weeksPerYear, netPayEst]);

  const aiPrompt = useMemo(() => {
    return `Analyze this wage and take-home pay breakdown:
- Hourly Rate: $${hourlyRate}/hr
- Hours Worked: ${hoursPerWeek} hrs/week across ${weeksPerYear} weeks/year
- Overtime: ${overtimeHours} hrs/week at ${overtimeMultiplier}x rate
- Resulting Gross Pay:
  • Annual Salary: $${result.annualSalary.toLocaleString()}
  • Monthly Pay: $${result.monthlyPay.toLocaleString()}
  • Bi-Weekly Pay: $${result.biWeeklyPay.toLocaleString()}
  • Weekly Pay: $${result.weeklyPay.toLocaleString()}
- Estimated Net Take-Home (Single Filer):
  • Net Annual: $${Math.round(netPayEst.netAnnualTakeHome).toLocaleString()}
  • Net Monthly: $${Math.round(netPayEst.netMonthlyTakeHome).toLocaleString()}
  • Net Bi-Weekly: $${Math.round(netPayEst.netBiWeeklyTakeHome).toLocaleString()}
  • Effective Tax Rate: ${netPayEst.effectiveTaxRate}%
Provide career budgeting insights, estimated tax brackets, and negotiating advice.`;
  }, [hourlyRate, hoursPerWeek, weeksPerYear, overtimeHours, overtimeMultiplier, result, netPayEst]);

  return (
    <div className="space-y-8 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Reassurance Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Zero-Knowledge Client-Side Engine • No salary data sent to servers • 100% Private &amp; Free</span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          Updated for October 2026: 2026 Federal Minimum Wage $7.25/hr • BLS Average Private Sector Earnings $35.40/hr • 2026 FLSA Overtime Threshold $58,656/yr ($1,128/wk)
        </span>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Inputs */}
        <div className="space-y-6 lg:col-span-6">
          <CalcCard
            title="Hourly Wage & Hours Worked"
            subtitle="Adjust your hourly rate and weekly schedule to compute your exact paycheck intervals."
          >
            <div className="space-y-6">
              {/* Hourly Rate */}
              <div className="space-y-3">
                <CalcInput
                  id="hourlyRate"
                  label="Hourly Wage"
                  value={hourlyRate}
                  onChange={(val) => setHourlyRate(Number(val) || 0)}
                  prefix="$"
                  min={1}
                  max={500}
                  step={0.5}
                  helpText="Standard base rate per hour before taxes"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick:</span>
                  {[15, 20, 25, 28, 35, 50, 75, 100].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setHourlyRate(rate)}
                      className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors touch-manipulation cursor-pointer ${
                        hourlyRate === rate
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      ${rate}/hr
                    </button>
                  ))}
                </div>
                <ModernSlider
                  id="hourlyRateSlider"
                  label="Hourly Wage"
                  value={hourlyRate}
                  min={10}
                  max={200}
                  step={1}
                  prefix="$"
                  onChange={setHourlyRate}
                />
              </div>

              {/* Hours Worked Per Week */}
              <div className="space-y-3">
                <CalcInput
                  id="hoursPerWeek"
                  label="Hours Per Week"
                  value={hoursPerWeek}
                  onChange={(val) => setHoursPerWeek(Number(val) || 0)}
                  suffix="hrs"
                  min={1}
                  max={80}
                  step={1}
                  helpText="Standard full-time is 40 hours per week"
                />
                <ModernSlider
                  id="hoursPerWeekSlider"
                  label="Hours Per Week"
                  value={hoursPerWeek}
                  min={10}
                  max={60}
                  step={1}
                  suffix="h"
                  onChange={setHoursPerWeek}
                />

                {/* Workweek Quick Presets (35h vs 40h) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[
                    { hours: 40, label: "40h (Standard FT)" },
                    { hours: 35, label: "35h (35h Workweek)" },
                    { hours: 37.5, label: "37.5h (Office Standard)" },
                    { hours: 20, label: "20h (Part-Time)" },
                  ].map((preset) => (
                    <button
                      key={preset.hours}
                      type="button"
                      onClick={() => setHoursPerWeek(preset.hours)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                        hoursPerWeek === preset.hours
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weeks Worked Per Year */}
              <div className="space-y-3">
                <CalcInput
                  id="weeksPerYear"
                  label="Weeks Worked Per Year"
                  value={weeksPerYear}
                  onChange={(val) => setWeeksPerYear(Number(val) || 0)}
                  suffix="wks"
                  min={1}
                  max={52}
                  step={1}
                  helpText="52 weeks (including paid time off) or fewer for unpaid leave"
                />
                <ModernSlider
                  id="weeksPerYearSlider"
                  label="Weeks Worked Per Year"
                  value={weeksPerYear}
                  min={40}
                  max={52}
                  step={1}
                  suffix="wks"
                  onChange={setWeeksPerYear}
                />
              </div>

              {/* Advanced Overtime & Leave Options */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Overtime &amp; Unpaid Leave (Optional)
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CalcInput
                    id="overtimeHours"
                    label="Overtime Hours / Wk"
                    value={overtimeHours}
                    onChange={(val) => setOvertimeHours(Number(val) || 0)}
                    suffix="hrs"
                    min={0}
                    max={30}
                    step={1}
                  />
                  <CalcInput
                    id="overtimeMultiplier"
                    label="Overtime Rate Multiplier"
                    value={overtimeMultiplier}
                    onChange={(val) => setOvertimeMultiplier(Number(val) || 1.5)}
                    suffix="x"
                    min={1}
                    max={3}
                    step={0.25}
                  />
                </div>
                <CalcInput
                  id="unpaidLeaveDays"
                  label="Unpaid Leave Days / Year"
                  value={unpaidLeaveDays}
                  onChange={(val) => setUnpaidLeaveDays(Number(val) || 0)}
                  suffix="days"
                  min={0}
                  max={60}
                  step={1}
                  helpText="Days absent without paid time off benefits"
                />
              </div>
            </div>
          </CalcCard>
        </div>

        {/* Right Column: Instant Paycheck Summary */}
        <div className="space-y-6 lg:col-span-6">
          <CalcCard
            title="Converted Salary & Paycheck Intervals"
            subtitle="Equivalent gross earnings across all standard payroll schedules."
          >
            <div className="space-y-6">
              {/* Big Featured Primary Metric: Annual & Monthly */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-950/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Annual Gross Salary
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                    ${Math.round(result.annualSalary).toLocaleString()}
                  </div>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    {result.totalWorkHoursYearly.toLocaleString()} total hours / yr
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Monthly Gross Pay
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
                    ${Math.round(result.monthlyPay).toLocaleString()}
                  </div>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    12 pay periods / year
                  </span>
                </div>
              </div>

              {/* Secondary Interval Results */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Bi-Weekly (26x)</span>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ${Math.round(result.biWeeklyPay).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Every 2 weeks</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Semi-Monthly (24x)</span>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ${Math.round(result.semiMonthlyPay).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Twice a month</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Weekly (52x)</span>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ${Math.round(result.weeklyPay).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Every week</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Daily (8h)</span>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ${Math.round(result.dailyPay).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Per work day</span>
                </div>
              </div>

              {/* Estimated Net Take-Home Pay (After Taxes) */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4 sm:p-5 dark:border-emerald-500/20 dark:from-emerald-950/30 dark:to-teal-950/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                      Estimated Net Take-Home Pay
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                    Single Filer • US Fed + FICA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-emerald-200/60 dark:border-emerald-800/40">
                    <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Net Annual</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      ${Math.round(netPayEst.netAnnualTakeHome).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-400">in your pocket / yr</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-emerald-200/60 dark:border-emerald-800/40">
                    <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Net Monthly</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      ${Math.round(netPayEst.netMonthlyTakeHome).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-400">per month take-home</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-emerald-200/60 dark:border-emerald-800/40">
                    <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Net Bi-Weekly</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      ${Math.round(netPayEst.netBiWeeklyTakeHome).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-400">every 2 weeks paycheck</div>
                  </div>
                </div>

                <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-0.5">
                  <span>Effective Tax Rate: <strong>{netPayEst.effectiveTaxRate}%</strong> (Federal Tax + FICA)</span>
                  <span className="hidden sm:inline">Excludes state/local taxes</span>
                </div>
              </div>

              {/* Overtime Contribution Breakdown if active */}
              {overtimeHours > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/20">
                  <div className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                    Overtime Earnings Included:
                  </div>
                  <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                    <span>Regular Base: <strong>${result.regularAnnualPay.toLocaleString()}</strong></span>
                    <span>Overtime Pay: <strong className="text-amber-700 dark:text-amber-400">+${result.overtimeAnnualPay.toLocaleString()}</strong></span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Export & AI Prompt & Quick Copy */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    const str = `$${hourlyRate}/hr = $${Math.round(result.annualSalary).toLocaleString()}/yr ($${Math.round(result.monthlyPay).toLocaleString()}/mo gross, ~$${Math.round(netPayEst.netMonthlyTakeHome).toLocaleString()}/mo take-home)`;
                    navigator.clipboard.writeText(str);
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors touch-manipulation cursor-pointer"
                >
                  <span>📋 Copy Summary</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 touch-manipulation cursor-pointer"
                >
                  <span>Export to Excel (.xlsx)</span>
                </button>
                <CalcSaveButton
                  toolSlug="hourly-to-salary-calculator"
                  path="/tools/hourly-to-salary-calculator"
                  toolName="Hourly to Salary Converter"
                  summaryTitle={`$${hourlyRate}/hr -> $${Math.round(result.annualSalary).toLocaleString()}/yr`}
                  summaryMetrics={[
                    { label: "Annual Salary", value: `$${Math.round(result.annualSalary).toLocaleString()}` },
                    { label: "Monthly Gross", value: `$${Math.round(result.monthlyPay).toLocaleString()}` },
                    { label: "Bi-Weekly", value: `$${Math.round(result.biWeeklyPay).toLocaleString()}` },
                    { label: "Net Take-Home", value: `~$${Math.round(netPayEst.netMonthlyTakeHome).toLocaleString()}/mo` },
                  ]}
                />
                <CalcShareButton
                  state={{
                    hourlyRate,
                    hoursPerWeek,
                    weeksPerYear,
                    unpaidLeaveDays,
                    overtimeHours,
                    overtimeMultiplier,
                  }}
                  label="Share Wage Conversion"
                />
                <CalcPromptButton promptText={aiPrompt} />
              </div>
            </div>
          </CalcCard>
        </div>
      </div>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Annual Salary ($)</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            ${Math.round(result.annualSalary).toLocaleString()}/yr
          </span>
          <span className="text-[11px] text-zinc-500 block">
            Take-Home: ~${Math.round(netPayEst.netMonthlyTakeHome).toLocaleString()}/mo
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors touch-manipulation cursor-pointer"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}
