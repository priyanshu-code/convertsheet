"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, Clock, Calendar, Briefcase, Table as TableIcon, Wallet } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcExportButton,
  CalcPromptButton,
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
    <div className="space-y-8">
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
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

              {/* Action Buttons: Export & AI Prompt */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <CalcExportButton
                  data={exportData}
                  filename={`hourly_salary_${hourlyRate}_per_hr.xlsx`}
                  sheetName="Salary Breakdown"
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
    </div>
  );
}
