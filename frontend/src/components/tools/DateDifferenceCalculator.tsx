"use client";

import React, { useState, useMemo } from "react";
import { CalendarRange } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";

export function DateDifferenceCalculator() {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [includeEndDay, setIncludeEndDay] = useState<"no" | "yes">("no");

  const swapDates = () => {
    setStartDate(endDate);
    setEndDate(startDate);
  };

  const applyPreset = (preset: "7d" | "30d" | "90d" | "thisMonth" | "thisYear" | "untilNewYear") => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === "7d") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(past.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === "30d") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(past.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === "90d") {
      const past = new Date();
      past.setDate(past.getDate() - 90);
      setStartDate(past.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(startOfMonth.toISOString().slice(0, 10));
      setEndDate(endOfMonth.toISOString().slice(0, 10));
    } else if (preset === "thisYear") {
      setStartDate(`${today.getFullYear()}-01-01`);
      setEndDate(`${today.getFullYear()}-12-31`);
    } else if (preset === "untilNewYear") {
      setStartDate(todayStr);
      setEndDate(`${today.getFullYear()}-12-31`);
    }
  };

  const diffData = useMemo(() => {
    if (!startDate || !endDate) return null;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const earlier = d1 < d2 ? d1 : d2;
    const later = d1 < d2 ? d2 : d1;

    let calendarDays = Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
    if (includeEndDay === "yes") calendarDays += 1;

    // Calculate business days (Monday to Friday)
    let businessDays = 0;
    let weekends = 0;
    const cur = new Date(earlier);
    const endBound = new Date(later);
    if (includeEndDay === "no") {
      endBound.setDate(endBound.getDate() - 1);
    }

    while (cur <= endBound) {
      const day = cur.getDay();
      if (day === 0 || day === 6) {
        weekends++;
      } else {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const weeks = Math.floor(calendarDays / 7);
    const remainingDays = calendarDays % 7;
    const totalHours = calendarDays * 24;

    const copySummary = `Duration: ${calendarDays.toLocaleString()} Days (${weeks} weeks, ${remainingDays} days) | Business Days: ${businessDays.toLocaleString()} | Weekends: ${weekends.toLocaleString()} | ${startDate} to ${endDate}`;

    return {
      calendarDays: calendarDays.toLocaleString(),
      businessDays: businessDays.toLocaleString(),
      weekends: weekends.toLocaleString(),
      breakdown: `${weeks} weeks and ${remainingDays} days`,
      totalHours: totalHours.toLocaleString(),
      copySummary,
    };
  }, [startDate, endDate, includeEndDay]);

  return (
    <CalcCard
      title="Date Difference & Duration Calculator"
      subtitle="Calculate exact days, weeks, and business days (excluding weekends) between any two calendar dates."
      icon={CalendarRange}
      badge="Work & Calendar"
    >
      {/* Quick Range Presets */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">Quick Presets:</span>
        {[
          { label: "Last 7 Days", preset: "7d" as const },
          { label: "Last 30 Days", preset: "30d" as const },
          { label: "Last 90 Days", preset: "90d" as const },
          { label: "This Month", preset: "thisMonth" as const },
          { label: "This Year", preset: "thisYear" as const },
          { label: "Countdown to Dec 31", preset: "untilNewYear" as const },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.preset)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <CalcInput
          id="start-date"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
        <div className="flex justify-center pb-1">
          <button
            type="button"
            onClick={swapDates}
            title="Swap Start and End Dates"
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>⇄ Swap</span>
          </button>
        </div>
        <CalcInput
          id="end-date"
          label="End Date"
          type="date"
          value={endDate}
          onChange={setEndDate}
        />
      </div>

      <CalcToggle
        label="Include End Day in Calculation (+1 day)?"
        value={includeEndDay}
        options={[
          { value: "no", label: "Exclude End Date" },
          { value: "yes", label: "Include End Date" },
        ]}
        onChange={(v) => setIncludeEndDay(v as any)}
      />

      {diffData && (
        <CalcResult
          title="Duration Calculation"
          primaryLabel="Total Calendar Duration"
          primaryValue={`${diffData.calendarDays} Days`}
          copyValue={diffData.copySummary}
          items={[
            {
              label: "Working Business Days",
              value: `${diffData.businessDays} days`,
              highlight: true,
            },
            {
              label: "Weekend Days",
              value: `${diffData.weekends} days`,
            },
            {
              label: "Weeks Breakdown",
              value: diffData.breakdown,
            },
            {
              label: "Total Duration in Hours",
              value: `${diffData.totalHours} hrs`,
            },
          ]}
        />
      )}
    </CalcCard>
  );
}
