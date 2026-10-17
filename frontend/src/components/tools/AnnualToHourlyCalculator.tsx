"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  Clock,
  Calendar,
  Briefcase,
  ShieldCheck,
  Download,
} from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import { calculateAnnualToHourly } from "@/lib/engines/financial-engine";
import * as XLSX from "xlsx";

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
  const [annualSalary, setAnnualSalary] = useState<number>(() => {
    if (initialValues?.annualSalary !== undefined) return Number(initialValues.annualSalary);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("annualSalary");
      if (q) return Number(q);
    }
    return 75000;
  });

  const [hoursPerWeek, setHoursPerWeek] = useState<number>(() => {
    if (initialValues?.hoursPerWeek !== undefined) return Number(initialValues.hoursPerWeek);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("hoursPerWeek");
      if (q) return Number(q);
    }
    return 40;
  });

  const [weeksPerYear, setWeeksPerYear] = useState<number>(() => {
    if (initialValues?.weeksPerYear !== undefined) return Number(initialValues.weeksPerYear);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("weeksPerYear");
      if (q) return Number(q);
    }
    return 52;
  });

  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState<number>(() => {
    if (initialValues?.unpaidLeaveDays !== undefined) return Number(initialValues.unpaidLeaveDays);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("unpaidLeaveDays");
      if (q) return Number(q);
    }
    return 0;
  });

  const result = useMemo(() => {
    return calculateAnnualToHourly({
      annualSalary,
      hoursPerWeek,
      weeksPerYear,
      unpaidLeaveDays,
    });
  }, [annualSalary, hoursPerWeek, weeksPerYear, unpaidLeaveDays]);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("annualSalary", annualSalary.toString());
    params.set("hoursPerWeek", hoursPerWeek.toString());
    params.set("weeksPerYear", weeksPerYear.toString());
    params.set("unpaidLeaveDays", unpaidLeaveDays.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [annualSalary, hoursPerWeek, weeksPerYear, unpaidLeaveDays]);

  const handleExportExcel = () => {
    try {
      const summaryRows = [
        ["ConvertSheet - Annual Salary to Hourly Pay Breakdown", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/annual-to-hourly-calculator"],
        ["", ""],
        ["--- COMPENSATION & SCHEDULE PARAMETERS ---", ""],
        ["Annual Gross Salary ($)", annualSalary],
        ["Hours Worked Per Week", hoursPerWeek],
        ["Weeks Worked Per Year", weeksPerYear],
        ["Unpaid Leave Days / Year", unpaidLeaveDays],
        ["Total Work Hours Yearly", result.totalWorkHoursYearly],
        ["", ""],
        ["--- CONVERTED PAYCHECK INTERVALS ---", ""],
        ["Equivalent Hourly Wage ($/hr)", Math.round(result.hourlyRate * 100) / 100],
        ["Daily Wage (Standard 8h Day)", Math.round(result.dailyWage)],
        ["Weekly Gross Pay (52x)", Math.round(result.weeklySalary)],
        ["Bi-Weekly Pay (26x)", Math.round(result.biWeeklySalary)],
        ["Semi-Monthly Pay (24x)", Math.round(result.semiMonthlySalary)],
        ["Monthly Gross Pay (12x)", Math.round(result.monthlySalary)],
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SalaryBreakdown");
      XLSX.writeFile(wb, `ConvertSheet_Annual_Salary_${annualSalary}_to_Hourly.xlsx`);
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

  const aiPrompt = useMemo(() => {
    return `Analyze this annual salary conversion:
- Annual Gross Salary: $${annualSalary.toLocaleString()}
- Working Schedule: ${hoursPerWeek} hours/week across ${weeksPerYear} weeks/year (${result.totalWorkHoursYearly.toLocaleString()} total hours)
- Computed Equivalent Rates:
  • Hourly Wage: $${result.hourlyRate.toFixed(2)}/hr
  • Daily Wage: $${result.dailyWage.toLocaleString()}
  • Weekly Pay: $${Math.round(result.weeklySalary).toLocaleString()}
  • Bi-Weekly Pay (26x): $${Math.round(result.biWeeklySalary).toLocaleString()}
  • Semi-Monthly Pay (24x): $${Math.round(result.semiMonthlySalary).toLocaleString()}
  • Monthly Pay (12x): $${Math.round(result.monthlySalary).toLocaleString()}
Provide practical personal budgeting ratios (50/30/20 rule), emergency fund guidelines, and salary negotiation benchmarks for this compensation band.`;
  }, [annualSalary, hoursPerWeek, weeksPerYear, result]);

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Inputs */}
        <div className="space-y-6 lg:col-span-6">
          <CalcCard
            title="Annual Compensation & Work Schedule"
            subtitle="Enter your yearly salary to instantly find out what it converts to on an hourly and per-paycheck basis."
            icon={Briefcase}
            badge="Updated for 2026 Compensation"
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
                      className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        annualSalary === p.val
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <CalcSlider
                  id="annualSalarySlider"
                  label="Annual Salary Slider"
                  ariaLabel="Annual Salary Slider"
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
                <CalcSlider
                  id="hoursPerWeekSlider"
                  label="Hours Per Week Slider"
                  ariaLabel="Hours Per Week Slider"
                  value={hoursPerWeek}
                  min={10}
                  max={60}
                  step={1}
                  unit="hrs"
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
                <CalcSlider
                  id="weeksPerYearSlider"
                  label="Weeks Worked Per Year Slider"
                  ariaLabel="Weeks Worked Per Year Slider"
                  value={weeksPerYear}
                  min={40}
                  max={52}
                  step={1}
                  unit="wks"
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

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
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

              {/* Action Buttons: Save, Share, AI Prompt, Export & Quick Copy */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    const str = `$${annualSalary.toLocaleString()}/yr = $${result.hourlyRate.toFixed(2)}/hr ($${Math.round(result.monthlySalary).toLocaleString()}/mo, $${Math.round(result.biWeeklySalary).toLocaleString()} bi-weekly)`;
                    navigator.clipboard.writeText(str);
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <span>📋 Copy Summary</span>
                </button>
                <CalcSaveButton
                  toolSlug="annual-to-hourly-calculator"
                  toolName="Annual to Hourly Calculator"
                  summaryTitle={`Salary: $${annualSalary.toLocaleString()} ($${result.hourlyRate.toFixed(2)}/hr)`}
                  summaryMetrics={[
                    { label: "Hourly Wage", value: `$${result.hourlyRate.toFixed(2)}/hr` },
                    { label: "Monthly Gross", value: `$${Math.round(result.monthlySalary).toLocaleString()}` },
                    { label: "Bi-Weekly Pay", value: `$${Math.round(result.biWeeklySalary).toLocaleString()}` },
                    { label: "Annual Hours", value: `${result.totalWorkHoursYearly.toLocaleString()} hrs` },
                  ]}
                />
                <CalcShareButton
                  state={{
                    annualSalary,
                    hoursPerWeek,
                    weeksPerYear,
                    unpaidLeaveDays,
                  }}
                  label="Share Calculation"
                />
                <CalcPromptButton promptText={aiPrompt} />
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export to Excel</span>
                </button>
              </div>
            </div>
          </CalcCard>
        </div>
      </div>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 shadow-lg flex items-center justify-between"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Hourly Wage</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            ${result.hourlyRate.toFixed(2)}/hr
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}
