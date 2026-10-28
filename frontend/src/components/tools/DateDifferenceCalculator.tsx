"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CalendarRange, ArrowLeftRight, ShieldCheck, Sparkles, FileSpreadsheet, Download, Calendar } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import * as XLSX from "xlsx";

export interface DateDifferenceCalculatorProps {
  initialValues?: Partial<{
    startDate: string;
    endDate: string;
    includeEndDay: "no" | "yes";
  }>;
}

export function DateDifferenceCalculator({ initialValues }: DateDifferenceCalculatorProps = {}) {
  const [startDate, setStartDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("startDate");
      if (q) return q;
    }
    if (initialValues?.startDate) return initialValues.startDate;
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });

  const [endDate, setEndDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("endDate");
      if (q) return q;
    }
    if (initialValues?.endDate) return initialValues.endDate;
    return new Date().toISOString().slice(0, 10);
  });

  const [includeEndDay, setIncludeEndDay] = useState<"no" | "yes">(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("includeEndDay");
      if (q === "yes" || q === "no") return q;
    }
    return initialValues?.includeEndDay || "no";
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    params.set("includeEndDay", includeEndDay);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [startDate, endDate, includeEndDay]);

  const swapDates = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
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
      rawCalendarDays: calendarDays,
      rawBusinessDays: businessDays,
      rawWeekends: weekends,
      calendarDays: calendarDays.toLocaleString(),
      businessDays: businessDays.toLocaleString(),
      weekends: weekends.toLocaleString(),
      breakdown: `${weeks} weeks and ${remainingDays} days`,
      totalHours: totalHours.toLocaleString(),
      copySummary,
    };
  }, [startDate, endDate, includeEndDay]);

  const llmPrompt = diffData
    ? `Analyze this calendar duration and business schedule:
- Start Date: ${startDate}
- End Date: ${endDate}
- End Date Included: ${includeEndDay === "yes" ? "Yes (+1 inclusive day)" : "No (exclusive)"}
- Total Calendar Duration: ${diffData.calendarDays} Days (${diffData.breakdown})
- Working Business Days: ${diffData.businessDays} Days
- Weekend Days: ${diffData.weekends} Days
- Total Elapsed Hours: ${diffData.totalHours} Hours

Please evaluate this project timeline against standard 2026 sprint milestones and statutory bank holidays.`
    : "";

  const handleExportExcel = () => {
    if (!diffData) return;
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - Date Difference & Project Duration Calculation", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        [
          "ConvertSheet Recalculation Model",
          `https://www.convertsheet.com/tools/date-difference-calculator?startDate=${startDate}&endDate=${endDate}&includeEndDay=${includeEndDay}`,
        ],
        ["Calendar Baseline Reference", "October 28, 2026 Project Standards (365 Days • 261 Business Days • NETWORKDAYS Math)"],
        ["", ""],
        ["--- TIMELINE PARAMETERS ---", ""],
        ["Start Date", startDate],
        ["End Date", endDate],
        ["Include End Date in Duration", includeEndDay === "yes" ? "Yes" : "No"],
        ["", ""],
        ["--- DURATION METRICS (FORMULAS) ---", ""],
        [
          "Total Calendar Days",
          {
            t: "n",
            f: `DATEVALUE("${endDate}")-DATEVALUE("${startDate}")+IF(B8="Yes",1,0)`,
            v: diffData.rawCalendarDays,
          },
        ],
        [
          "Working Business Days (Mon-Fri)",
          {
            t: "n",
            f: `NETWORKDAYS(DATEVALUE("${startDate}"),IF(B8="Yes",DATEVALUE("${endDate}"),DATEVALUE("${endDate}")-1))`,
            v: diffData.rawBusinessDays,
          },
        ],
        ["Weekend Days (Sat-Sun)", { t: "n", f: "B11-B12", v: diffData.rawWeekends }],
        ["Total Duration in Hours", { t: "n", f: "B11*24", v: diffData.rawCalendarDays * 24 }],
        ["Total Duration in Minutes", { t: "n", f: "B14*60", v: diffData.rawCalendarDays * 1440 }],
        ["Total Elapsed Weeks", { t: "n", f: "INT(B11/7)", v: Math.floor(diffData.rawCalendarDays / 7) }],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 38 }, { wch: 28 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Duration Summary");

      // Tab 2: Sprint & Timeline Milestone Projections with formulas linking Start Date
      const milestoneHeader = [
        "Milestone Target",
        "Target Interval (Days)",
        "Calendar Days Offset",
        "Target Completion Date (Formula)",
      ];
      const milestones = [
        { label: "1-Week Sprint", days: 7 },
        { label: "2-Week Sprint", days: 14 },
        { label: "30-Day Checkpoint", days: 30 },
        { label: "60-Day Midterm", days: 60 },
        { label: "90-Day Quarter Milestone", days: 90 },
        { label: "180-Day Half-Year", days: 180 },
        { label: "365-Day Annual Cycle", days: 365 },
      ];

      const sDateObj = new Date(startDate);
      const milestoneRows = milestones.map((m, idx) => {
        const row = idx + 2;
        const targetDate = new Date(sDateObj);
        targetDate.setDate(targetDate.getDate() + m.days);
        const targetDateStr = !isNaN(targetDate.getTime()) ? targetDate.toISOString().slice(0, 10) : "";
        return [
          m.label,
          m.days,
          { t: "n", f: `B${row}`, v: m.days },
          { t: "s", f: `TEXT(DATEVALUE("${startDate}")+B${row},"YYYY-MM-DD")`, v: targetDateStr },
        ];
      });

      const wsMilestones = XLSX.utils.aoa_to_sheet([milestoneHeader, ...milestoneRows]);
      wsMilestones["!cols"] = [{ wch: 28 }, { wch: 24 }, { wch: 22 }, { wch: 32 }];
      XLSX.utils.book_append_sheet(wb, wsMilestones, "Milestone Projections");

      XLSX.writeFile(wb, `ConvertSheet_Date_Diff_${startDate}_to_${endDate}.xlsx`);
    } catch (err) {
      console.error("Failed to export Excel", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* 100% Client-Side Privacy Reassurance Badge */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong className="font-semibold">100% Client-Side Privacy:</strong> Calendar calculations run entirely inside your browser. Zero dates or project timelines are transmitted.
        </span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">2026 Calendar Standards:</strong> Updated for 2026 Calendar &amp; Project Milestone Standards (October 28, 2026): 365 Days (Common Year) • 261 Standard Business Days • Accurate Mon–Fri NETWORKDAYS Math
        </span>
      </div>

      <CalcCard
        title="Date Difference & Duration Calculator"
        subtitle="Calculate exact days, weeks, and business days (excluding weekends) between any two calendar dates."
        icon={CalendarRange}
        badge="Work & Calendar"
      >
        {/* Quick Range Presets with 44px minimum touch targets */}
        <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Quick Range Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Last 7 Days", preset: "7d" as const },
              { label: "Last 30 Days", preset: "30d" as const },
              { label: "Last 90 Days", preset: "90d" as const },
              { label: "This Month", preset: "thisMonth" as const },
              { label: "This Year", preset: "thisYear" as const },
              { label: "Until New Year 2027", preset: "untilNewYear" as const },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.preset)}
                className="min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700 shadow-xs transition-colors touch-manipulation cursor-pointer flex items-center justify-center"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-end pt-2">
          <CalcInput
            id="start-date"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={setStartDate}
          />
          <div className="flex justify-center pb-0.5">
            <button
              type="button"
              onClick={swapDates}
              title="Swap Start and End Dates"
              className="min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 shadow-xs touch-manipulation cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap</span>
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

        <div className="pt-2">
          <CalcToggle
            label="Include End Day in Calculation (+1 day)?"
            value={includeEndDay}
            options={[
              { value: "no", label: "Exclude End Date" },
              { value: "yes", label: "Include End Date" },
            ]}
            onChange={(v) => setIncludeEndDay(v as "no" | "yes")}
          />
        </div>

        {/* Action Buttons: Save, Share, Prompt, Excel Export */}
        {diffData && (
          <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <CalcSaveButton
              calculationType="Date Difference Calculation"
              inputs={{ startDate, endDate, includeEndDay }}
              outputs={{
                calendarDays: diffData.calendarDays,
                businessDays: diffData.businessDays,
                weekends: diffData.weekends,
              }}
            />
            <CalcShareButton
              title="ConvertSheet Date Difference & Duration Calculation"
              text={diffData.copySummary}
            />
            <CalcPromptButton promptText={llmPrompt} />
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 touch-manipulation"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isExportingExcel ? "Generating .xlsx..." : "Export to Excel (.xlsx)"}</span>
            </button>
          </div>
        )}

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

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      {diffData && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
              Total Calendar Duration
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {diffData.calendarDays} Days
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
              {diffData.businessDays} working days ({diffData.weekends} weekends)
            </span>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs touch-manipulation"
          >
            <Download className="w-4 h-4" />
            <span>Export .xlsx</span>
          </button>
        </div>
      )}
    </div>
  );
}
