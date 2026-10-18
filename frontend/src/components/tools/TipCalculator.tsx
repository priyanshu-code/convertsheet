"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Utensils, Plus, Minus, ShieldCheck, Sparkles, FileSpreadsheet, Download, Users } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcToggle,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import * as XLSX from "xlsx";

export interface TipCalculatorProps {
  initialValues?: Partial<{
    billAmount: number;
    tipPercent: string;
    customTip: number;
    splitCount: number;
    roundUp: boolean;
  }>;
}

export function TipCalculator({ initialValues }: TipCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [billAmount, setBillAmount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("billAmount");
      if (q) return Number(q);
    }
    return Number(initialValues?.billAmount) || 1200;
  });

  const [tipPercent, setTipPercent] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("tipPercent");
      if (q) return q;
    }
    return initialValues?.tipPercent || "15";
  });

  const [customTip, setCustomTip] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("customTip");
      if (q) return Number(q);
    }
    return Number(initialValues?.customTip) || 20;
  });

  const [splitCount, setSplitCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("splitCount");
      if (q) return Number(q);
    }
    return Number(initialValues?.splitCount) || 2;
  });

  const [roundUp, setRoundUp] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("roundUp");
      if (q) return q === "true";
    }
    return initialValues?.roundUp ?? false;
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("billAmount", billAmount.toString());
    params.set("tipPercent", tipPercent);
    if (tipPercent === "custom") {
      params.set("customTip", customTip.toString());
    } else {
      params.delete("customTip");
    }
    params.set("splitCount", splitCount.toString());
    if (roundUp) {
      params.set("roundUp", "true");
    } else {
      params.delete("roundUp");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [billAmount, tipPercent, customTip, splitCount, roundUp]);

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
    ? [250, 500, 1000, 1200, 2000, 3000, 5000]
    : [25, 50, 75, 100, 150, 200, 300];

  const PEOPLE_PRESETS = [1, 2, 3, 4, 5, 6, 8, 10];

  const shareText = `🍽️ Bill Split: ${formatCurrency(billAmount)} bill + ${formatCurrency(tipAmount)} tip (${effectiveTipRate}%) = ${formatCurrency(totalBill)} total across ${splitCount} ${splitCount === 1 ? "person" : "people"} → ${formatCurrency(perPersonBill)} each.`;

  const llmPrompt = `Analyze this restaurant bill and gratuity split calculation:
- Food & Drinks Subtotal: ${currencySymbol}${billAmount.toLocaleString()}
- Gratuity Rate: ${effectiveTipRate}% (${currencySymbol}${tipAmount.toLocaleString()})
- Total Check with Gratuity: ${currencySymbol}${totalBill.toLocaleString()}
- Number of Diners Splitting: ${splitCount} ${splitCount === 1 ? "person" : "people"}
- Total Payable Per Person: ${currencySymbol}${perPersonBill.toLocaleString()}
- Gratuity Share Per Person: ${currencySymbol}${perPersonTip.toLocaleString()}
- Whole Dollar Rounding: ${roundUp ? "Enabled" : "Disabled"}

Please evaluate how this compares to 2026 regional dining tipping standards and advise on itemized vs even split fairness.`;

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - Restaurant Bill & Tip Split Calculation", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["Recalculate Online", "https://www.convertsheet.com/tools/tip-calculator"],
        ["", ""],
        ["--- BILL SUMMARY ---", ""],
        ["Food & Beverage Subtotal", billAmount],
        ["Gratuity / Tip Percentage", `${effectiveTipRate}%`],
        ["Total Gratuity Added", tipAmount],
        ["Total Bill Payable", totalBill],
        ["Number of People Splitting", splitCount],
        ["Payable Per Person", perPersonBill],
        ["Tip Contributed Per Person", perPersonTip],
        ["Nearest Dollar Rounding Applied", roundUp ? "Yes" : "No"],
        ["", ""],
        ["--- GRATUITY COMPARISON MATRIX ---", "", "", ""],
        ["Tip Rate", "Tip Amount", "Total Bill", "Per Person Split"],
      ];

      [10, 12.5, 15, 18, 20, 22, 25].forEach((rate) => {
        const t = Math.round(billAmount * (rate / 100) * 100) / 100;
        const tot = Math.round((billAmount + t) * 100) / 100;
        const pp = Math.round((tot / Math.max(1, splitCount)) * 100) / 100;
        summaryData.push([`${rate}%`, t, tot, pp]);
      });

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      ws["!cols"] = [{ wch: 36 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws, "Bill Split Schedule");

      XLSX.writeFile(wb, `ConvertSheet_Tip_Split_${billAmount}.xlsx`);
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
          <strong className="font-semibold">100% Client-Side Privacy:</strong> Gratuity and expense splits are calculated locally in your browser. Zero check data is transmitted or stored.
        </span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">2026 Dining Standards:</strong> US Standard 15%–22% • UK 12.5% Optional Service • India CCPA Voluntary Guidelines
        </span>
      </div>

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
              step={1}
              prefix={currencySymbol}
              onChange={(v) => setBillAmount(Number(v) || 0)}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_BILLS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBillAmount(b)}
                  className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer border touch-manipulation flex items-center justify-center ${
                    billAmount === b
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
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
              <label htmlFor="split-count" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <span>Number of People Splitting</span>
              </label>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSplitCount((prev) => Math.max(1, prev - 1))}
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition cursor-pointer touch-manipulation"
                  title="Decrease people"
                  aria-label="Decrease people"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 min-w-6 text-center">
                  {splitCount}
                </span>
                <button
                  type="button"
                  onClick={() => setSplitCount((prev) => Math.min(50, prev + 1))}
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition cursor-pointer touch-manipulation"
                  title="Increase people"
                  aria-label="Increase people"
                >
                  <Plus className="w-4 h-4" />
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
                  className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer border touch-manipulation flex items-center justify-center ${
                    splitCount === cnt
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                  }`}
                >
                  {cnt} {cnt === 1 ? "person" : "people"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
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
            <div className="space-y-2 max-w-sm">
              <CalcSlider
                id="custom-tip-slider"
                label="Custom Gratuity Slider"
                value={customTip}
                min={0}
                max={50}
                step={1}
                unit="%"
                onChange={setCustomTip}
              />
              <CalcInput
                id="custom-tip"
                label="Exact Gratuity Rate"
                value={customTip}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(v) => setCustomTip(Number(v) || 0)}
              />
            </div>
          )}

          <div className="pt-1">
            <label className="min-h-[44px] inline-flex items-center gap-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none touch-manipulation">
              <input
                type="checkbox"
                checked={roundUp}
                onChange={(e) => setRoundUp(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Round up total per person to nearest whole currency unit (avoids loose coins)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons: Save, Share, Prompt, Excel Export */}
        <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
          <CalcSaveButton
            calculationType="Tip Calculation"
            inputs={{ billAmount, tipPercent, customTip, splitCount, roundUp }}
            outputs={{ perPersonBill, totalBill, tipAmount, perPersonTip }}
          />
          <CalcShareButton
            title="ConvertSheet Tip & Bill Split Calculation"
            text={shareText}
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

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            Per Person ({splitCount} {splitCount === 1 ? "Person" : "People"})
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(perPersonBill, { maxDecimals: 2 })}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
            Total Check: {formatCurrency(totalBill, { maxDecimals: 2 })} (Tip: {effectiveTipRate}%)
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
    </div>
  );
}
