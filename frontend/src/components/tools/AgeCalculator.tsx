"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Cake, Calendar, ShieldCheck, Sparkles, FileSpreadsheet, Download, Clock } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import * as XLSX from "xlsx";

export interface AgeCalculatorProps {
  initialValues?: Partial<{
    birthDate: string;
    targetDate: string;
  }>;
}

export function AgeCalculator({ initialValues }: AgeCalculatorProps = {}) {
  const [birthDate, setBirthDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("birthDate");
      if (q) return q;
    }
    return initialValues?.birthDate || "1998-05-15";
  });

  const [targetDate, setTargetDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("targetDate");
      if (q) return q;
    }
    if (initialValues?.targetDate) return initialValues.targetDate;
    return new Date().toISOString().slice(0, 10);
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("birthDate", birthDate);
    params.set("targetDate", targetDate);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [birthDate, targetDate]);

  // Quick DOB Presets helper
  const setQuickDob = (yearsAgo: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - yearsAgo);
    setBirthDate(d.toISOString().slice(0, 10));
  };

  const setQuickTarget = (type: "today" | "endOfYear" | "nextYear") => {
    const now = new Date();
    if (type === "today") {
      setTargetDate(now.toISOString().slice(0, 10));
    } else if (type === "endOfYear") {
      setTargetDate(`${now.getFullYear()}-12-31`);
    } else if (type === "nextYear") {
      setTargetDate(`${now.getFullYear() + 1}-01-01`);
    }
  };

  const ageData = useMemo(() => {
    if (!birthDate || !targetDate) return null;
    const b = new Date(birthDate);
    const t = new Date(targetDate);

    if (isNaN(b.getTime()) || isNaN(t.getTime())) return null;
    if (b > t) return { error: "Date of birth cannot be after the target date." };

    let years = t.getFullYear() - b.getFullYear();
    let months = t.getMonth() - b.getMonth();
    let days = t.getDate() - b.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(t.getFullYear(), t.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Day of week born
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bornDayName = dayNames[b.getUTCDay()];

    // Western Zodiac
    const getZodiacSign = (month: number, day: number) => {
      if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) return "Capricorn ♑";
      if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius ♒";
      if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces ♓";
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries ♈";
      if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus ♉";
      if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini ♊";
      if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer ♋";
      if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo ♌";
      if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo ♍";
      if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra ♎";
      if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio ♏";
      return "Sagittarius ♐";
    };
    const zodiac = getZodiacSign(b.getUTCMonth() + 1, b.getUTCDate());

    // Generational Cohort
    const birthYear = b.getFullYear();
    let generation = "Gen Alpha";
    if (birthYear >= 2025) generation = "Gen Beta";
    else if (birthYear >= 2013) generation = "Gen Alpha";
    else if (birthYear >= 1997) generation = "Gen Z";
    else if (birthYear >= 1981) generation = "Millennial";
    else if (birthYear >= 1965) generation = "Generation X";
    else if (birthYear >= 1946) generation = "Baby Boomer";
    else generation = "Silent Generation";

    // Total counts
    const diffMs = t.getTime() - b.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    // Next birthday countdown
    let nextBday = new Date(t.getFullYear(), b.getMonth(), b.getDate());
    if (nextBday < t) {
      nextBday = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
    }
    const daysToBday = Math.ceil((nextBday.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));

    const primaryAge = `${years} Years, ${months} Months, ${days} Days`;
    const copySummary = `Exact Age: ${primaryAge} | Total Days: ${totalDays.toLocaleString()} | Born on: ${bornDayName} | Zodiac: ${zodiac} | Cohort: ${generation}`;

    return {
      error: null,
      primaryAge,
      copySummary,
      years,
      months,
      days,
      bornDayName,
      zodiac,
      generation,
      totalDays: totalDays.toLocaleString(),
      rawTotalDays: totalDays,
      totalWeeks: totalWeeks.toLocaleString(),
      totalHours: totalHours.toLocaleString(),
      daysToBday: daysToBday === 0 ? "Today is your Birthday! 🎂" : `${daysToBday} days`,
      rawDaysToBday: daysToBday,
    };
  }, [birthDate, targetDate]);

  const llmPrompt = ageData && !ageData.error
    ? `Analyze these chronological age metrics & life milestones:
- Date of Birth: ${birthDate} (Born on a ${ageData.bornDayName})
- Target Evaluation Date: ${targetDate}
- Chronological Age: ${ageData.primaryAge}
- Generational Cohort: ${ageData.generation}
- Astrological Sign: ${ageData.zodiac}
- Days Lived: ${ageData.totalDays} Days (${ageData.totalHours} Hours)
- Countdown to Next Birthday: ${ageData.daysToBday}

Please provide life milestone benchmarks (e.g. US SSA Full Retirement Age 67 eligibility, savings horizons, and major decade checkpoints).`
    : "";

  const handleExportExcel = () => {
    if (!ageData || ageData.error) return;
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - Chronological Age & Life Milestones Calculation", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["Recalculate Online", "https://www.convertsheet.com/tools/age-calculator"],
        ["", ""],
        ["--- CHRONOLOGICAL AGE SUMMARY ---", ""],
        ["Date of Birth", birthDate],
        ["Evaluation Date", targetDate],
        ["Exact Age", ageData.primaryAge],
        ["Years", ageData.years],
        ["Months", ageData.months],
        ["Days", ageData.days],
        ["Generational Cohort", ageData.generation],
        ["Day of Week Born", ageData.bornDayName],
        ["Zodiac Sign", ageData.zodiac],
        ["", ""],
        ["--- LIFE ACCUMULATION METRICS ---", ""],
        ["Total Days Lived", ageData.rawTotalDays],
        ["Total Weeks Lived", Math.floor(ageData.rawTotalDays / 7)],
        ["Total Hours Lived", ageData.rawTotalDays * 24],
        ["Total Minutes Lived", ageData.rawTotalDays * 1440],
        ["Days Until Next Birthday", ageData.rawDaysToBday],
        ["", ""],
        ["--- UPCOMING 10 BIRTHDAYS & WEEKDAYS ---", "", ""],
        ["Year", "Birthday Date", "Day of the Week"],
      ];

      const b = new Date(birthDate);
      const evalYear = new Date(targetDate).getFullYear();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      for (let i = 1; i <= 10; i++) {
        const nextYear = evalYear + i;
        const bdayInstance = new Date(nextYear, b.getMonth(), b.getDate());
        const dayStr = dayNames[bdayInstance.getDay()];
        const dateStr = `${nextYear}-${String(b.getMonth() + 1).padStart(2, "0")}-${String(b.getDate()).padStart(2, "0")}`;
        summaryData.push([nextYear, dateStr, dayStr]);
      }

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      ws["!cols"] = [{ wch: 40 }, { wch: 24 }, { wch: 24 }];
      XLSX.utils.book_append_sheet(wb, ws, "Age Milestones");

      XLSX.writeFile(wb, `ConvertSheet_Age_Calculation_${birthDate}.xlsx`);
    } catch (err) {
      console.error("Failed to export Excel", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 100% Client-Side Privacy Reassurance Badge */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong className="font-semibold">100% Client-Side Privacy:</strong> Date of birth and age calculations execute purely inside your browser. Zero personal identifiable information is transmitted.
        </span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">2026 Demographic Benchmarks:</strong> SSA Full Retirement Age 67 • Precise Leap Year Offset • Generational Cohorts (Gen Alpha, Gen Z, Millennial)
        </span>
      </div>

      <CalcCard
        title="Chronological Age Calculator"
        subtitle="Calculate your exact age in years, months, days, hours, and find countdowns to your next birthday."
        icon={Cake}
        badge="Date & Time"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <CalcInput
              id="birth-date"
              label="Date of Birth"
              type="date"
              value={birthDate}
              onChange={setBirthDate}
            />
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">Quick Age Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "18y", years: 18 },
                  { label: "21y", years: 21 },
                  { label: "25y", years: 25 },
                  { label: "30y", years: 30 },
                  { label: "40y", years: 40 },
                  { label: "50y", years: 50 },
                  { label: "65y", years: 65 },
                  { label: "67y (SSA)", years: 67 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setQuickDob(p.years)}
                    className="min-h-[44px] min-w-[44px] px-2.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-zinc-200 dark:border-zinc-700 touch-manipulation cursor-pointer flex items-center justify-center shadow-xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <CalcInput
              id="target-date"
              label="Age at Date (Default Today)"
              type="date"
              value={targetDate}
              onChange={setTargetDate}
            />
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">Target Date:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Today", type: "today" as const },
                  { label: "Dec 31, 2026", type: "endOfYear" as const },
                  { label: "Jan 1, 2027", type: "nextYear" as const },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setQuickTarget(p.type)}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-zinc-200 dark:border-zinc-700 touch-manipulation cursor-pointer flex items-center justify-center shadow-xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {ageData?.error ? (
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
            ⚠️ {ageData.error}
          </div>
        ) : ageData ? (
          <>
            {/* Action Buttons: Save, Share, Prompt, Excel Export */}
            <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <CalcSaveButton
                calculationType="Age Calculation"
                inputs={{ birthDate, targetDate }}
                outputs={{
                  primaryAge: ageData.primaryAge,
                  generation: ageData.generation,
                  totalDays: ageData.totalDays,
                }}
              />
              <CalcShareButton
                title="ConvertSheet Chronological Age Calculation"
                text={ageData.copySummary}
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

            <CalcResult
              title="Exact Chronological Age"
              primaryLabel="Age Summary"
              primaryValue={ageData.primaryAge}
              copyValue={ageData.copySummary}
              items={[
                { label: "Day of Week Born", value: ageData.bornDayName || "", highlight: true },
                { label: "Generational Cohort", value: ageData.generation || "", badge: "Demographics" },
                { label: "Zodiac Sign", value: ageData.zodiac || "" },
                { label: "Next Birthday Countdown", value: ageData.daysToBday || "N/A" },
                { label: "Total Days Lived", value: `${ageData.totalDays || 0} days` },
                { label: "Total Weeks", value: `${ageData.totalWeeks || 0} weeks` },
                { label: "Total Hours", value: `${ageData.totalHours || 0} hrs` },
              ]}
            />
          </>
        ) : null}
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      {ageData && !ageData.error && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
              Chronological Age
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {ageData.primaryAge}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
              {ageData.generation} • Next Bday: {ageData.daysToBday}
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
