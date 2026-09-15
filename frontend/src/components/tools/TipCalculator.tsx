"use client";

import React, { useState, useMemo } from "react";
import { Utensils } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";

export function TipCalculator() {
  const [billAmount, setBillAmount] = useState<number>(1200);
  const [tipPercent, setTipPercent] = useState<string>("15");
  const [splitCount, setSplitCount] = useState<number>(2);

  const { tipAmount, totalBill, perPersonBill, perPersonTip } = useMemo(() => {
    const bill = Math.max(0, billAmount);
    const pct = Math.max(0, Number(tipPercent) || 0);
    const people = Math.max(1, splitCount);

    const tip = bill * (pct / 100);
    const total = bill + tip;
    const perPerson = total / people;
    const perPersonT = tip / people;

    return {
      tipAmount: Math.round(tip * 100) / 100,
      totalBill: Math.round(total * 100) / 100,
      perPersonBill: Math.round(perPerson * 100) / 100,
      perPersonTip: Math.round(perPersonT * 100) / 100,
    };
  }, [billAmount, tipPercent, splitCount]);

  return (
    <CalcCard
      title="Tip & Bill Splitter Calculator"
      subtitle="Calculate restaurant gratuity and split the bill total evenly among friends with custom tip percentages."
      icon={Utensils}
      badge="Dining & Groups"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CalcInput
          id="bill-amount"
          label="Total Check / Bill Amount"
          value={billAmount}
          min={0}
          step={50}
          prefix="₹"
          onChange={(v) => setBillAmount(Number(v) || 0)}
        />

        <CalcInput
          id="split-count"
          label="Number of People Splitting"
          value={splitCount}
          min={1}
          max={50}
          step={1}
          suffix="People"
          onChange={(v) => setSplitCount(Number(v) || 1)}
        />
      </div>

      <CalcToggle
        label="Select Tip Percentage"
        value={tipPercent}
        options={[
          { value: "10", label: "10%" },
          { value: "15", label: "15% (Standard)" },
          { value: "18", label: "18%" },
          { value: "20", label: "20% (Great Service)" },
        ]}
        onChange={setTipPercent}
      />

      <CalcResult
        title="Check & Tip Summary"
        primaryLabel="Total Payable Per Person"
        primaryValue={`₹${perPersonBill.toLocaleString("en-IN")}`}
        items={[
          {
            label: "Total Tip Added",
            value: `₹${tipAmount.toLocaleString("en-IN")}`,
            highlight: true,
          },
          {
            label: "Total Bill (Food + Tip)",
            value: `₹${totalBill.toLocaleString("en-IN")}`,
          },
          {
            label: "Tip Per Person",
            value: `₹${perPersonTip.toLocaleString("en-IN")}`,
          },
        ]}
      />
    </CalcCard>
  );
}
