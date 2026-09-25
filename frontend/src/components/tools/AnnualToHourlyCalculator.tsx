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
import { calculateAnnualToHourly } from "@/lib/engines/financial-engine";

export interface AnnualToHourlyCalculatorProps {
  initialValues?: Partial<{
    annualSalary: number;
    hoursPerWeek: number;
    weeksPerYear: number;
    unpaidLeaveDays: number;
  }>;
}

export function AnnualToHourlyCalculator({
  initialValues,
}: AnnualToHourlyCalculatorProps = {}) {
  const [annualSalary, setAnnualSalary] = useState<number>(
    Number(initialValues?.annualSalary) || 75000
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

  const result = useMemo(() => {
    return calculateAnnualToHourly({
      annualSalary,
      hoursPerWeek,
      weeksPerYear,
      unpaidLeaveDays,
    });
  }, [annualSalary, hoursPerWeek, weeksPerYear, unpaidLeaveDays]);

  // SheetJS formatted export rows
  const exportData = useMemo(() => {
    return [
      { Interval: "Annual Gross Salary", Amount: `$${result.annualSalary.toLocaleString()}`, Note: "Starting annual compensation" },
      { Interval: "Monthly Salary", Amount: `$${result.monthlySalary.toLocaleString()}`, Note: "12 pay periods per year" },
      { Interval: "Semi-Monthly Salary", Amount: `$${result.semiMonthlySalary.toLocaleString()}`, Note: "24 pay periods (twice per month)" },
      { Interval: "Bi-Weekly Salary", Amount: `$${result.biWeeklySalary.toLocaleString()}`, Note: "26 pay periods (every 2 weeks)" },
      { Interval: "Weekly Salary", Amount: `$${result.weeklySalary.toLocaleString()}`, Note: "52 pay periods per year" },
      { Interval: "Daily Wage", Amount: `$${result.dailyWage.toLocaleString()}`, Note: "Based on standard 5-day work week" },
      { Interval: "Equivalent Hourly Wage", Amount: `$${result.hourlyRate.toFixed(2)}`, Note: `Based on ${result.totalWorkHoursYearly} total working hours` },
    ];
  }, [result]);

  const aiPrompt = useMemo(() => {
    return `Analyze this annual salary conversion:
- Annual Gross Salary: $${annualSalary.toLocaleString()}
- Working Schedule: ${hoursPerWeek} hours/week across ${weeksPerYear} weeks/year
- Computed Equivalent Rates:
  • Hourly Wage: $${result.hourlyRate.toFixed(2)}/hr
  • Monthly Pay: $${result.monthlySalary.toLocaleString()}
  • Bi-Weekly Pay: $${result.biWeeklySalary.toLocaleString()}
  • Daily Wage: $${result.dailyWage.toLocaleString()}
Provide practical personal budgeting ratios (50/30/20 rule) and salary negotiation benchmarks for this compensation band.`;
  }, [annualSalary, hoursPerWeek, weeksPerYear, result]);

  return (
    <div className="space-y-8">
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Inputs */}
        <div className="space-y-6 lg:col-span-6">
          <CalcCard
            title="Annual Compensation & Work Schedule"
            subtitle="Enter your yearly salary to instantly find out what it converts to on an hourly and per-paycheck basis."
          >
            <div className="space-y-6">
              {/* Annual Salary */}
              <div className="space-y-3">
                <CalcInput
                  id="annualSalary"
                  label="Annual Salary"
                  value={annualSalary}
                  onChange={(val) => setAnnualSalary(Number(val) || 0)}
                  prefix="$"
                  min={1000}
                  max={1000000}
                  step={1000}
                  helpText="Gross annual salary before taxes and deductions"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick:</span>
                  {[
                    { label: "$40k", val: 40000 },
                    { label: "$60k", val: 60000 },
                    { label: "$75k", val: 75000 },
                    { label: "$100k", val: 100000 },
                    { label: "$125k", val: 125000 },
                    { label: "$150k", val: 150000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAnnualSalary(p.val)}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                        annualSalary === p.val
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <ModernSlider
                  id="annualSalarySlider"
                  label="Annual Salary"
                  value={annualSalary}
                  min={20000}
                  max={250000}
                  step={2500}
                  prefix="$"
                  onChange={setAnnualSalary}
                />
              </div>

              {/* Hours Per Week */}
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

              {/* Unpaid Leave Days */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                <CalcInput
                  id="unpaidLeaveDays"
                  label="Unpaid Leave Days / Year"
                  value={unpaidLeaveDays}
                  onChange={(val) => setUnpaidLeaveDays(Number(val) || 0)}
                  suffix="days"
                  min={0}
                  max={60}
                  step={1}
                  helpText="Unpaid personal or sick days that reduce your active work hours"
                />
              </div>
            </div>
          </CalcCard>
        </div>

        {/* Right Column: Instant Converted Paycheck Summary */}
        <div className="space-y-6 lg:col-span-6">
          <CalcCard
            title="Converted Hourly Wage & Paycheck Breakdown"
            subtitle="Your exact hourly rate and earnings across standard payroll frequencies."
          >
            <div className="space-y-6">
              {/* Featured Primary Metric: Hourly Wage & Monthly Pay */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-950/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Equivalent Hourly Wage
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                    ${result.hourlyRate.toFixed(2)}<span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">/hr</span>
                  </div>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    {result.totalWorkHoursYearly.toLocaleString()} work hours / year
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Monthly Gross Pay
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
                    ${Math.round(result.monthlySalary).toLocaleString()}
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
                    ${Math.round(result.biWeeklySalary).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Every 2 weeks</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Semi-Monthly (24x)</span>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ${Math.round(result.semiMonthlySalary).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Twice a month</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Weekly (52x)</span>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ${Math.round(result.weeklySalary).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Every week</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Daily (8h)</span>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ${Math.round(result.dailyWage).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400">Per work day</span>
                </div>
              </div>

              {/* Action Buttons: Export & AI Prompt & Quick Copy */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    const str = `$${annualSalary.toLocaleString()}/yr = $${result.hourlyRate.toFixed(2)}/hr ($${Math.round(result.monthlySalary).toLocaleString()}/mo, $${Math.round(result.biWeeklySalary).toLocaleString()} bi-weekly)`;
                    navigator.clipboard.writeText(str);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <span>📋 Copy Summary</span>
                </button>
                <CalcExportButton
                  data={exportData}
                  filename={`annual_salary_${annualSalary}_breakdown.xlsx`}
                  sheetName="Paycheck Breakdown"
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
