"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Cake } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
} from "@/components/calculator";

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState<string>("1998-05-15");
  const [targetDate, setTargetDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

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
      // month is 1-indexed for convenience
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
    const copySummary = `Exact Age: ${primaryAge} | Total Days: ${totalDays.toLocaleString()} | Born on: ${bornDayName} | Zodiac: ${zodiac}`;

    return {
      error: null,
      primaryAge,
      copySummary,
      years,
      months,
      days,
      bornDayName,
      zodiac,
      totalDays: totalDays.toLocaleString(),
      totalWeeks: totalWeeks.toLocaleString(),
      totalHours: totalHours.toLocaleString(),
      daysToBday: daysToBday === 0 ? "Today is your Birthday! 🎂" : `${daysToBday} days`,
    };
  }, [birthDate, targetDate]);

  return (
    <CalcCard
      title="Chronological Age Calculator"
      subtitle="Calculate your exact age in years, months, days, hours, and find countdowns to your next birthday."
      icon={Cake}
      badge="Date & Time"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <CalcInput
            id="birth-date"
            label="Date of Birth"
            type="date"
            value={birthDate}
            onChange={setBirthDate}
          />
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Quick DOB:</span>
            {[
              { label: "18y", years: 18 },
              { label: "21y", years: 21 },
              { label: "25y", years: 25 },
              { label: "30y", years: 30 },
              { label: "50y", years: 50 },
              { label: "65y", years: 65 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setQuickDob(p.years)}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <CalcInput
            id="target-date"
            label="Age at Date (Default Today)"
            type="date"
            value={targetDate}
            onChange={setTargetDate}
          />
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Target:</span>
            {[
              { label: "Today", type: "today" as const },
              { label: "Dec 31", type: "endOfYear" as const },
              { label: "Jan 1 Next Year", type: "nextYear" as const },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setQuickTarget(p.type)}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {ageData?.error ? (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
          ⚠️ {ageData.error}
        </div>
      ) : ageData ? (
        <CalcResult
          title="Exact Chronological Age"
          primaryLabel="Age Summary"
          primaryValue={ageData.primaryAge}
          copyValue={ageData.copySummary}
          items={[
            { label: "Day of Week Born", value: ageData.bornDayName || "", highlight: true },
            { label: "Zodiac Sign", value: ageData.zodiac || "" },
            { label: "Next Birthday Countdown", value: ageData.daysToBday || "N/A" },
            { label: "Total Days Lived", value: `${ageData.totalDays || 0} days` },
            { label: "Total Weeks", value: `${ageData.totalWeeks || 0} weeks` },
            { label: "Total Hours", value: `${ageData.totalHours || 0} hrs` },
          ]}
        />
      ) : null}
    </CalcCard>
  );
}
