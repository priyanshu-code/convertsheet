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

    return {
      calendarDays: calendarDays.toLocaleString(),
      businessDays: businessDays.toLocaleString(),
      weekends: weekends.toLocaleString(),
      breakdown: `${weeks} weeks and ${remainingDays} days`,
    };
  }, [startDate, endDate, includeEndDay]);

  return (
    <CalcCard
      title="Date Difference & Duration Calculator"
      subtitle="Calculate exact days, weeks, and business days (excluding weekends) between any two calendar dates."
      icon={CalendarRange}
      badge="Work & Calendar"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CalcInput
          id="start-date"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
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
          copyValue={`${diffData.calendarDays} Days`}
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
          ]}
        />
      )}
    </CalcCard>
  );
}
