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

    return {
      error: null,
      primaryAge: `${years} Years, ${months} Months, ${days} Days`,
      years,
      months,
      days,
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
        <CalcInput
          id="birth-date"
          label="Date of Birth"
          type="date"
          value={birthDate}
          onChange={setBirthDate}
        />
        <CalcInput
          id="target-date"
          label="Age at Date (Default Today)"
          type="date"
          value={targetDate}
          onChange={setTargetDate}
        />
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
          copyValue={ageData.primaryAge}
          items={[
            { label: "Next Birthday Countdown", value: ageData.daysToBday || "N/A", highlight: true },
            { label: "Total Days Lived", value: `${ageData.totalDays || 0} days` },
            { label: "Total Weeks", value: `${ageData.totalWeeks || 0} weeks` },
            { label: "Total Hours", value: `${ageData.totalHours || 0} hrs` },
          ]}
        />
      ) : null}
    </CalcCard>
  );
}
