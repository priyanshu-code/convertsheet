"use client";

import React, { useState, useMemo } from "react";
import { Utensils, Plus, Minus } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export function TipCalculator() {
  const { currencySymbol, formatCurrency } = useCurrency();
  const [billAmount, setBillAmount] = useState<number>(1200);
  const [tipPercent, setTipPercent] = useState<string>("15");
  const [customTip, setCustomTip] = useState<number>(20);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [roundUp, setRoundUp] = useState<boolean>(false);

  const effectiveTipRate = tipPercent === "custom" ? Math.max(0, customTip) : Math.max(0, Number(tipPercent) || 0);

  const { tipAmount, totalBill, perPersonBill, perPersonTip } = useMemo(() => {
    const bill = Math.max(0, billAmount);
    const pct = effectiveTipRate;
    const people = Math.max(1, splitCount);

    let tip = bill * (pct / 100);
    let total = bill + tip;
    let perPerson = total / people;

    if (roundUp && perPerson > 0) {
      const roundedPerPerson = Math.ceil(perPerson);
      total = roundedPerPerson * people;
      tip = Math.max(0, total - bill);
      perPerson = roundedPerPerson;
    }

    const perPersonT = tip / people;

    return {
      tipAmount: Math.round(tip * 100) / 100,
      totalBill: Math.round(total * 100) / 100,
      perPersonBill: Math.round(perPerson * 100) / 100,
      perPersonTip: Math.round(perPersonT * 100) / 100,
    };
  }, [billAmount, effectiveTipRate, splitCount, roundUp]);

  const QUICK_BILLS = currencySymbol === "₹"
    ? [250, 500, 1000, 1200, 2000, 3000]
    : [25, 50, 75, 100, 150, 200];
  const PEOPLE_PRESETS = [1, 2, 3, 4, 5, 6, 8, 10];

  const shareText = `🍽️ Bill Split: ${formatCurrency(billAmount)} bill + ${formatCurrency(tipAmount)} tip (${effectiveTipRate}%) = ${formatCurrency(totalBill)} total across ${splitCount} ${splitCount === 1 ? "person" : "people"} → ${formatCurrency(perPersonBill)} each.`;

  return (
    <CalcCard
      title="Tip & Bill Splitter Calculator"
      subtitle="Calculate restaurant gratuity and split the bill total evenly among friends with custom tip percentages and rounding."
      icon={Utensils}
      badge="Dining & Groups"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <CalcInput
            id="bill-amount"
            label="Total Check / Bill Amount"
            value={billAmount}
            min={0}
            step={10}
            prefix={currencySymbol}
            onChange={(v) => setBillAmount(Number(v) || 0)}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_BILLS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBillAmount(b)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                  billAmount === b
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                }`}
              >
                {currencySymbol}{b}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="split-count" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Number of People Splitting
            </label>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSplitCount((prev) => Math.max(1, prev - 1))}
                className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                title="Decrease people"
                aria-label="Decrease people"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 min-w-5 text-center">
                {splitCount}
              </span>
              <button
                type="button"
                onClick={() => setSplitCount((prev) => Math.min(50, prev + 1))}
                className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                title="Increase people"
                aria-label="Increase people"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <CalcInput
            id="split-count"
            label=""
            value={splitCount}
            min={1}
            max={50}
            step={1}
            suffix={splitCount === 1 ? "Person" : "People"}
            onChange={(v) => setSplitCount(Number(v) || 1)}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PEOPLE_PRESETS.map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setSplitCount(cnt)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                  splitCount === cnt
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                }`}
              >
                {cnt} {cnt === 1 ? "person" : "people"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <CalcToggle
          label="Select Tip Percentage"
          value={tipPercent}
          options={[
            { value: "10", label: "10%" },
            { value: "15", label: "15% (Fair)" },
            { value: "18", label: "18% (Good)" },
            { value: "20", label: "20% (Great)" },
            { value: "25", label: "25% (Superb)" },
            { value: "custom", label: "Custom %" },
          ]}
          onChange={setTipPercent}
        />

        {tipPercent === "custom" && (
          <div className="max-w-xs">
            <CalcInput
              id="custom-tip"
              label="Custom Tip Rate"
              value={customTip}
              min={0}
              max={100}
              step={1}
              suffix="%"
              onChange={(v) => setCustomTip(Number(v) || 0)}
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={roundUp}
              onChange={(e) => setRoundUp(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Round up total per person to nearest whole dollar (avoids loose coins)</span>
          </label>
        </div>
      </div>

      <CalcResult
        title="Check & Tip Summary"
        primaryLabel="Total Payable Per Person"
        primaryValue={formatCurrency(perPersonBill, { maxDecimals: 2 })}
        copyValue={shareText}
        items={[
          {
            label: "Total Tip Added",
            value: formatCurrency(tipAmount, { maxDecimals: 2 }),
            highlight: true,
          },
          {
            label: "Total Bill (Food + Tip)",
            value: formatCurrency(totalBill, { maxDecimals: 2 }),
          },
          {
            label: "Tip Per Person",
            value: formatCurrency(perPersonTip, { maxDecimals: 2 }),
          },
          {
            label: "Effective Gratuity Rate",
            value: `${((tipAmount / (billAmount || 1)) * 100).toFixed(1)}%`,
          },
        ]}
      />
    </CalcCard>
  );
}
