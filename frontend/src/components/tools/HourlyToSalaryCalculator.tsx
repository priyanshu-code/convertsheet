"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, Clock, Calendar, Briefcase, Table as TableIcon } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcExportButton,
  CalcPromptButton,
  ModernSlider,
} from "@/components/calculator";
import { calculateHourlyToSalary } from "@/lib/engines/financial-engine";

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
  const [hourlyRate, setHourlyRate] = useState<number>(
    Number(initialValues?.hourlyRate) || 25
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(
    Number(initialValues?.hoursPerWeek) || 40
  );
  const [weeksPerYear, setWeeksPerYear] = useState<number>(
    Number(initialValues?.weeksPerYear) || 52
  );
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState<number>(
    Number(initialValues?.unpaidLeaveDays) || 0
  );
  const [overtimeHours, setOvertimeHours] = useState<number>(
    Number(initialValues?.overtimeHoursPerWeek) || 0
  );
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(
    Number(initialValues?.overtimeMultiplier) || 1.5
  );

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

  // SheetJS formatted export rows
  const exportData = useMemo(() => {
    return [
      { Interval: "Hourly Wage", Amount: `$${result.hourlyRate.toFixed(2)}`, Note: "Base rate" },
      { Interval: "Daily Pay", Amount: `$${result.dailyPay.toLocaleString()}`, Note: "Based on 8h/day (or 1/5th weekly)" },
      { Interval: "Weekly Pay", Amount: `$${result.weeklyPay.toLocaleString()}`, Note: `${hoursPerWeek}h regular + ${overtimeHours}h OT` },
      { Interval: "Bi-Weekly Pay", Amount: `$${result.biWeeklyPay.toLocaleString()}`, Note: "26 paychecks per year" },
      { Interval: "Semi-Monthly Pay", Amount: `$${result.semiMonthlyPay.toLocaleString()}`, Note: "24 paychecks per year (twice monthly)" },
      { Interval: "Monthly Gross Pay", Amount: `$${result.monthlyPay.toLocaleString()}`, Note: "12 paychecks per year" },
      { Interval: "Annual Gross Salary", Amount: `$${result.annualSalary.toLocaleString()}`, Note: `${weeksPerYear} weeks worked per year` },
    ];
  }, [result, hoursPerWeek, overtimeHours, weeksPerYear]);

  const aiPrompt = useMemo(() => {
    return `Analyze this salary breakdown:
- Hourly Rate: $${hourlyRate}/hr
- Hours Worked: ${hoursPerWeek} hrs/week across ${weeksPerYear} weeks/year
- Overtime: ${overtimeHours} hrs/week at ${overtimeMultiplier}x rate
- Resulting Gross Pay:
  • Annual Salary: $${result.annualSalary.toLocaleString()}
  • Monthly Pay: $${result.monthlyPay.toLocaleString()}
  • Bi-Weekly Pay: $${result.biWeeklyPay.toLocaleString()}
  • Weekly Pay: $${result.weeklyPay.toLocaleString()}
Provide career budgeting insights, estimated tax brackets, and negotiating advice.`;
  }, [hourlyRate, hoursPerWeek, weeksPerYear, overtimeHours, overtimeMultiplier, result]);

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
                <CalcPromptButton promptText={aiPrompt} />
              </div>
            </div>
          </CalcCard>
        </div>
      </div>
    </div>
  );
}
