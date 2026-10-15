"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Percent, Download, Table, Sparkles, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { roundTo } from "@/lib/math-utils";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
  CalcSelect,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";

export type PercentageCalcMode =
  | "whatIs"
  | "isWhatPercent"
  | "change"
  | "discount"
  | "tax"
  | "marginMarkup";

export interface PercentageCalculatorProps {
  initialValues?: Partial<{
    mode: PercentageCalcMode;
    valX: number;
    valY: number;
    originalPrice: number;
    discountPercent: number;
    taxBasePrice: number;
    taxPercent: number;
    taxMode: "add" | "extract";
    costPrice: number;
    marginMarkupPercent: number;
    marginMarkupType: "margin" | "markup";
  }>;
}

const MATRIX_PERCENTAGES = [1, 5, 10, 15, 20, 25, 30, 33.333, 50, 75, 100, 150, 200];

export function PercentageCalculator({ initialValues }: PercentageCalculatorProps = {}) {
  const [calcMode, setCalcMode] = useState<PercentageCalcMode>(() => {
    if (initialValues?.mode) return initialValues.mode;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("mode");
      if (q && ["whatIs", "isWhatPercent", "change", "discount", "tax", "marginMarkup"].includes(q)) {
        return q as PercentageCalcMode;
      }
    }
    return "whatIs";
  });

  // Mode 1: What is X% of Y?
  const [valX1, setValX1] = useState<number>(() => {
    if (initialValues?.valX !== undefined) return Number(initialValues.valX);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("valX");
      if (q) return Number(q);
    }
    return 15;
  });
  const [valY1, setValY1] = useState<number>(() => {
    if (initialValues?.valY !== undefined) return Number(initialValues.valY);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("valY");
      if (q) return Number(q);
    }
    return 200;
  });

  // Mode 2: X is what % of Y?
  const [valX2, setValX2] = useState<number>(() => {
    if (initialValues?.valX !== undefined) return Number(initialValues.valX);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("valX");
      if (q) return Number(q);
    }
    return 30;
  });
  const [valY2, setValY2] = useState<number>(() => {
    if (initialValues?.valY !== undefined) return Number(initialValues.valY);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("valY");
      if (q) return Number(q);
    }
    return 150;
  });

  // Mode 3: Percentage increase/decrease from X to Y
  const [valX3, setValX3] = useState<number>(() => {
    if (initialValues?.valX !== undefined) return Number(initialValues.valX);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("valX");
      if (q) return Number(q);
    }
    return 100;
  });
  const [valY3, setValY3] = useState<number>(() => {
    if (initialValues?.valY !== undefined) return Number(initialValues.valY);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("valY");
      if (q) return Number(q);
    }
    return 125;
  });

  // Mode 4: Discount & Sale
  const [originalPrice, setOriginalPrice] = useState<number>(() => {
    const raw = initialValues?.originalPrice ?? (initialValues?.mode === "discount" ? initialValues?.valY : undefined);
    if (raw !== undefined) return Number(raw);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("originalPrice");
      if (q) return Number(q);
    }
    return 80;
  });
  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    const raw = initialValues?.discountPercent ?? (initialValues?.mode === "discount" ? initialValues?.valX : undefined);
    if (raw !== undefined) return Number(raw);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("discountPercent");
      if (q) return Number(q);
    }
    return 25;
  });

  // Mode 5: Sales Tax / VAT
  const [taxBasePrice, setTaxBasePrice] = useState<number>(() => {
    const raw = initialValues?.taxBasePrice ?? (initialValues?.mode === "tax" ? initialValues?.valY : undefined);
    if (raw !== undefined) return Number(raw);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("taxBasePrice");
      if (q) return Number(q);
    }
    return 120;
  });
  const [taxPercent, setTaxPercent] = useState<number>(() => {
    const raw = initialValues?.taxPercent ?? (initialValues?.mode === "tax" ? initialValues?.valX : undefined);
    if (raw !== undefined) return Number(raw);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("taxPercent");
      if (q) return Number(q);
    }
    return 8.25;
  });
  const [taxMode, setTaxMode] = useState<"add" | "extract">(() => {
    if (initialValues?.taxMode) return initialValues.taxMode;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("taxMode");
      if (q === "add" || q === "extract") return q;
    }
    return "add";
  });

  // Mode 6: Margin vs Markup
  const [costPrice, setCostPrice] = useState<number>(() => {
    const raw = initialValues?.costPrice ?? (initialValues?.mode === "marginMarkup" ? initialValues?.valY : undefined);
    if (raw !== undefined) return Number(raw);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("costPrice");
      if (q) return Number(q);
    }
    return 100;
  });
  const [marginMarkupPercent, setMarginMarkupPercent] = useState<number>(() => {
    const raw = initialValues?.marginMarkupPercent ?? (initialValues?.mode === "marginMarkup" ? initialValues?.valX : undefined);
    if (raw !== undefined) return Number(raw);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("marginMarkupPercent");
      if (q) return Number(q);
    }
    return 30;
  });
  const [marginMarkupType, setMarginMarkupType] = useState<"margin" | "markup">(() => {
    if (initialValues?.marginMarkupType) return initialValues.marginMarkupType;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("marginMarkupType");
      if (q === "margin" || q === "markup") return q;
    }
    return "markup";
  });

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("mode", calcMode);
    if (calcMode === "whatIs") {
      params.set("valX", valX1.toString());
      params.set("valY", valY1.toString());
    } else if (calcMode === "isWhatPercent") {
      params.set("valX", valX2.toString());
      params.set("valY", valY2.toString());
    } else if (calcMode === "change") {
      params.set("valX", valX3.toString());
      params.set("valY", valY3.toString());
    } else if (calcMode === "discount") {
      params.set("originalPrice", originalPrice.toString());
      params.set("discountPercent", discountPercent.toString());
    } else if (calcMode === "tax") {
      params.set("taxBasePrice", taxBasePrice.toString());
      params.set("taxPercent", taxPercent.toString());
      params.set("taxMode", taxMode);
    } else if (calcMode === "marginMarkup") {
      params.set("costPrice", costPrice.toString());
      params.set("marginMarkupPercent", marginMarkupPercent.toString());
      params.set("marginMarkupType", marginMarkupType);
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [
    calcMode,
    valX1,
    valY1,
    valX2,
    valY2,
    valX3,
    valY3,
    originalPrice,
    discountPercent,
    taxBasePrice,
    taxPercent,
    taxMode,
    costPrice,
    marginMarkupPercent,
    marginMarkupType,
  ]);

  // Reference Matrix Base Value
  const matrixBase = useMemo(() => {
    switch (calcMode) {
      case "whatIs":
        return valY1 || 100;
      case "isWhatPercent":
        return valY2 || 100;
      case "change":
        return valX3 || 100;
      case "discount":
        return originalPrice || 100;
      case "tax":
        return taxBasePrice || 100;
      case "marginMarkup":
        return costPrice || 100;
      default:
        return 100;
    }
  }, [calcMode, valY1, valY2, valX3, originalPrice, taxBasePrice, costPrice]);

  const result1 = useMemo(() => {
    const res = roundTo((valX1 / 100) * valY1, 4);
    return {
      value: res.toLocaleString(),
      formula: `${valX1}% × ${valY1} = ${res}`,
    };
  }, [valX1, valY1]);

  const result2 = useMemo(() => {
    if (valY2 === 0) return { value: "Undefined (div by 0)", formula: "" };
    const res = roundTo((valX2 / valY2) * 100, 2);
    return {
      value: `${res}%`,
      formula: `(${valX2} / ${valY2}) × 100 = ${res}%`,
    };
  }, [valX2, valY2]);

  const result3 = useMemo(() => {
    if (valX3 === 0) return { value: "Undefined (initial value is 0)", formula: "", type: "neutral", diff: "0" };
    const diff = roundTo(valY3 - valX3, 4);
    const pct = roundTo((diff / valX3) * 100, 2);
    const isIncrease = diff >= 0;
    return {
      value: `${isIncrease ? "+" : ""}${pct}%`,
      formula: `((${valY3} - ${valX3}) / ${valX3}) × 100 = ${pct}%`,
      type: isIncrease ? "increase" : "decrease",
      diff: diff.toLocaleString(),
    };
  }, [valX3, valY3]);

  const result4 = useMemo(() => {
    const savings = roundTo((discountPercent / 100) * originalPrice, 2);
    const finalPrice = roundTo(Math.max(0, originalPrice - savings), 2);
    return {
      finalPrice: finalPrice.toLocaleString(),
      savings: savings.toLocaleString(),
      formula: `${originalPrice} - (${discountPercent}% × ${originalPrice}) = ${finalPrice}`,
    };
  }, [originalPrice, discountPercent]);

  const result5 = useMemo(() => {
    if (taxMode === "add") {
      const taxAmount = roundTo((taxPercent / 100) * taxBasePrice, 2);
      const total = roundTo(taxBasePrice + taxAmount, 2);
      return {
        total: total.toLocaleString(),
        taxAmount: taxAmount.toLocaleString(),
        preTax: taxBasePrice.toLocaleString(),
        formula: `${taxBasePrice} + (${taxPercent}% × ${taxBasePrice}) = ${total}`,
      };
    } else {
      const preTax = roundTo(taxBasePrice / (1 + taxPercent / 100), 2);
      const taxAmount = roundTo(taxBasePrice - preTax, 2);
      return {
        total: taxBasePrice.toLocaleString(),
        taxAmount: taxAmount.toLocaleString(),
        preTax: preTax.toLocaleString(),
        formula: `${taxBasePrice} / (1 + ${taxPercent / 100}) = ${preTax} (Tax: ${taxAmount})`,
      };
    }
  }, [taxBasePrice, taxPercent, taxMode]);

  const result6 = useMemo(() => {
    if (marginMarkupType === "markup") {
      const profit = roundTo((marginMarkupPercent / 100) * costPrice, 2);
      const sellingPrice = roundTo(costPrice + profit, 2);
      const margin = sellingPrice > 0 ? roundTo((profit / sellingPrice) * 100, 2) : 0;
      return {
        sellingPrice: sellingPrice.toLocaleString(),
        profit: profit.toLocaleString(),
        equivalent: `${margin}% gross margin`,
        formula: `Selling Price = ${costPrice} × (1 + ${marginMarkupPercent}%) = ${sellingPrice}`,
      };
    } else {
      const safeMargin = Math.min(marginMarkupPercent, 99.99);
      const sellingPrice = roundTo(costPrice / (1 - safeMargin / 100), 2);
      const profit = roundTo(sellingPrice - costPrice, 2);
      const markup = costPrice > 0 ? roundTo((profit / costPrice) * 100, 2) : 0;
      return {
        sellingPrice: sellingPrice.toLocaleString(),
        profit: profit.toLocaleString(),
        equivalent: `${markup}% markup on cost`,
        formula: `Selling Price = ${costPrice} / (1 - ${safeMargin}%) = ${sellingPrice}`,
      };
    }
  }, [costPrice, marginMarkupPercent, marginMarkupType]);

  // Reference Matrix Data
  const matrixRows = useMemo(() => {
    return MATRIX_PERCENTAGES.map((pct) => {
      const calculated = roundTo((pct / 100) * matrixBase, 2);
      const multiplier = roundTo(pct / 100, 4);
      return {
        percentage: `${pct}%`,
        multiplier,
        value: calculated,
      };
    });
  }, [matrixBase]);

  const handleDownloadCheatSheet = () => {
    const rows = matrixRows.map((r) => ({
      "Percentage Rate": r.percentage,
      "Decimal Multiplier": r.multiplier,
      [`Calculated Value (of ${matrixBase})`]: r.value,
      "Calculation Formula": `${matrixBase} * ${r.multiplier}`,
    }));

    const formulaGuide = [
      { Concept: "What is X% of Y?", Formula: "Y * (X / 100)", Example: `15% of 200 = 200 * 0.15 = 30` },
      { Concept: "X is what % of Y?", Formula: "(X / Y) * 100", Example: `30 of 150 = (30 / 150) * 100 = 20%` },
      { Concept: "% Increase / Decrease", Formula: "((New - Old) / Old) * 100", Example: `From 100 to 125 = ((125 - 100) / 100) * 100 = +25%` },
      { Concept: "Discount Sale Price", Formula: "Price * (1 - Discount / 100)", Example: `$80 with 25% off = $80 * 0.75 = $60` },
      { Concept: "Sales Tax / VAT", Formula: "Price * (1 + Tax / 100)", Example: `$120 + 8.25% = $120 * 1.0825 = $129.90` },
      { Concept: "Selling Price from Margin", Formula: "Cost / (1 - Margin / 100)", Example: `$100 cost at 30% margin = $100 / 0.70 = $142.86` },
      { Concept: "Selling Price from Markup", Formula: "Cost * (1 + Markup / 100)", Example: `$100 cost at 30% markup = $100 * 1.30 = $130.00` },
    ];

    const wb = XLSX.utils.book_new();
    const wsMatrix = XLSX.utils.json_to_sheet(rows);
    const wsFormulas = XLSX.utils.json_to_sheet(formulaGuide);

    XLSX.utils.book_append_sheet(wb, wsMatrix, `Percentage_Matrix_${matrixBase}`);
    XLSX.utils.book_append_sheet(wb, wsFormulas, "Formulas_Cheatsheet");
    XLSX.writeFile(wb, `percentage-reference-sheet-${matrixBase}.xlsx`);
  };

  const shareState = useMemo(() => {
    switch (calcMode) {
      case "whatIs":
        return { mode: "whatIs", valX: valX1, valY: valY1 };
      case "isWhatPercent":
        return { mode: "isWhatPercent", valX: valX2, valY: valY2 };
      case "change":
        return { mode: "change", valX: valX3, valY: valY3 };
      case "discount":
        return { mode: "discount", originalPrice, discountPercent };
      case "tax":
        return { mode: "tax", taxBasePrice, taxPercent, taxMode };
      case "marginMarkup":
        return { mode: "marginMarkup", costPrice, marginMarkupPercent, marginMarkupType };
    }
  }, [calcMode, valX1, valY1, valX2, valY2, valX3, valY3, originalPrice, discountPercent, taxBasePrice, taxPercent, taxMode, costPrice, marginMarkupPercent, marginMarkupType]);

  const aiPrompt = useMemo(() => {
    switch (calcMode) {
      case "whatIs":
        return `Explain step-by-step how to compute ${valX1}% of ${valY1} (Result: ${result1.value}) and provide real-world financial or business applications of this calculation.`;
      case "isWhatPercent":
        return `Explain how to calculate what percentage ${valX2} is of ${valY2} (Result: ${result2.value}) and provide practical examples.`;
      case "change":
        return `Analyze a percentage change from ${valX3} to ${valY3} (Result: ${result3.value}) and explain what this metric indicates in inflation, sales growth, or investment returns.`;
      case "discount":
        return `Evaluate a discount of ${discountPercent}% on an item originally priced at $${originalPrice} (Final: $${result4.finalPrice}, Savings: $${result4.savings}) and discuss pricing psychology.`;
      case "tax":
        return `Explain the breakdown of $${taxBasePrice} with ${taxPercent}% sales tax / VAT under mode "${taxMode}" (Total: $${result5.total}, Tax: $${result5.taxAmount}).`;
      case "marginMarkup":
        return `Compare the commercial difference between a ${marginMarkupPercent}% ${marginMarkupType} on a cost price of $${costPrice} (Selling price: $${result6.sellingPrice}, Profit: $${result6.profit}).`;
    }
  }, [calcMode, valX1, valY1, result1, valX2, valY2, result2, valX3, valY3, result3, originalPrice, discountPercent, result4, taxBasePrice, taxPercent, taxMode, result5, costPrice, marginMarkupPercent, marginMarkupType, result6]);

  const { currentSummaryLabel, currentSummaryValue } = useMemo(() => {
    switch (calcMode) {
      case "whatIs":
        return { currentSummaryLabel: `${valX1}% of ${valY1}`, currentSummaryValue: result1.value };
      case "isWhatPercent":
        return { currentSummaryLabel: `${valX2} of ${valY2}`, currentSummaryValue: result2.value };
      case "change":
        return { currentSummaryLabel: `% Change (${valX3} → ${valY3})`, currentSummaryValue: result3.value };
      case "discount":
        return { currentSummaryLabel: "Final Sale Price", currentSummaryValue: `$${result4.finalPrice}` };
      case "tax":
        return { currentSummaryLabel: "Total with Tax", currentSummaryValue: `$${result5.total}` };
      case "marginMarkup":
        return { currentSummaryLabel: "Selling Price", currentSummaryValue: `$${result6.sellingPrice}` };
      default:
        return { currentSummaryLabel: "Result", currentSummaryValue: "0" };
    }
  }, [calcMode, valX1, valY1, result1, valX2, valY2, result2, valX3, valY3, result3, result4, result5, result6]);

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Reassurance Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side Privacy — Zero Math or Input Data Leaves Your Device</span>
      </div>

      <CalcCard
        title="Percentage Calculator"
        subtitle="Solve all percentage problems: find a percent of a number, percentage ratios, price changes, discounts, sales tax, and margins."
        icon={Percent}
        badge="6-in-1 Math Suite"
      >
        <CalcToggle
          value={calcMode}
          options={[
            { value: "whatIs", label: "X% of Y" },
            { value: "isWhatPercent", label: "X is what %" },
            { value: "change", label: "% Change" },
            { value: "discount", label: "Discount & Sale" },
            { value: "tax", label: "Sales Tax / VAT" },
            { value: "marginMarkup", label: "Margin & Markup" },
          ]}
          onChange={(val) => setCalcMode(val as PercentageCalcMode)}
        />

        {calcMode === "whatIs" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcInput
                id="val-x1"
                label="Percentage (X)"
                value={valX1}
                suffix="%"
                onChange={(v) => setValX1(Number(v) || 0)}
              />
              <CalcInput
                id="val-y1"
                label="Total Number (Y)"
                value={valY1}
                onChange={(v) => setValY1(Number(v) || 0)}
              />
            </div>

            <CalcResult
              title="Percentage Output"
              primaryLabel={`What is ${valX1}% of ${valY1}?`}
              primaryValue={result1.value}
              copyValue={`${valX1}% of ${valY1} = ${result1.value}`}
              items={[
                { label: "Mathematical Formula", value: result1.formula },
                { label: "Decimal Equivalent", value: (valX1 / 100).toString() },
              ]}
            />

            {/* Direct Answer Box (Google Snippet Optimized) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Direct Answer:</strong> {valX1}% of {valY1} is <strong className="font-bold">{result1.value}</strong>.
                <span className="block text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Calculation: ({valX1} ÷ 100) × {valY1} = {(valX1 / 100).toFixed(4)} × {valY1} = {result1.value}.
                </span>
              </div>
            </div>
          </div>
        )}

        {calcMode === "isWhatPercent" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcInput
                id="val-x2"
                label="Part Number (X)"
                value={valX2}
                onChange={(v) => setValX2(Number(v) || 0)}
              />
              <CalcInput
                id="val-y2"
                label="Whole Number (Y)"
                value={valY2}
                onChange={(v) => setValY2(Number(v) || 0)}
              />
            </div>

            <CalcResult
              title="Percentage Ratio"
              primaryLabel={`${valX2} is what percent of ${valY2}?`}
              primaryValue={result2.value}
              copyValue={`${valX2} is ${result2.value} of ${valY2}`}
              items={[
                { label: "Mathematical Formula", value: result2.formula },
                { label: "Fraction Representation", value: `${valX2}/${valY2}` },
              ]}
            />

            {/* Direct Answer Box (Google Snippet Optimized) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Direct Answer:</strong> {valX2} is <strong className="font-bold">{result2.value}</strong> of {valY2}.
                <span className="block text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Calculation: ({valX2} ÷ {valY2}) × 100 = {result2.value}.
                </span>
              </div>
            </div>
          </div>
        )}

        {calcMode === "change" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcInput
                id="val-x3"
                label="Initial / Old Value (X)"
                value={valX3}
                onChange={(v) => setValX3(Number(v) || 0)}
              />
              <CalcInput
                id="val-y3"
                label="Final / New Value (Y)"
                value={valY3}
                onChange={(v) => setValY3(Number(v) || 0)}
              />
            </div>

            <CalcResult
              title="Change Analysis"
              primaryLabel={`Percentage change from ${valX3} to ${valY3}`}
              primaryValue={result3.value}
              copyValue={`Change from ${valX3} to ${valY3} = ${result3.value}`}
              items={[
                { label: "Direction", value: result3.type === "increase" ? "Growth (Increase)" : "Decline (Decrease)" },
                { label: "Absolute Difference", value: result3.diff },
                { label: "Formula Applied", value: result3.formula },
              ]}
            />

            {/* Direct Answer Box (Google Snippet Optimized) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Direct Answer:</strong> Changing from {valX3} to {valY3} is a <strong className="font-bold">{result3.value}</strong> {result3.type}.
                <span className="block text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Formula: {result3.formula}.
                </span>
              </div>
            </div>
          </div>
        )}

        {calcMode === "discount" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcInput
                id="orig-price"
                label="Original List Price"
                prefix="$"
                value={originalPrice}
                onChange={(v) => setOriginalPrice(Number(v) || 0)}
              />
              <CalcInput
                id="disc-pct"
                label="Discount Percentage"
                suffix="%"
                value={discountPercent}
                onChange={(v) => setDiscountPercent(Number(v) || 0)}
              />
            </div>

            <CalcResult
              title="Sale Pricing Output"
              primaryLabel={`Final Sale Price (${discountPercent}% off)`}
              primaryValue={`$${result4.finalPrice}`}
              copyValue={`Original $${originalPrice} with ${discountPercent}% off = $${result4.finalPrice} (Saved $${result4.savings})`}
              items={[
                { label: "You Save", value: `$${result4.savings}`, highlight: true },
                { label: "Original Price", value: `$${originalPrice}` },
                { label: "Formula", value: result4.formula },
              ]}
            />

            {/* Direct Answer Box (Google Snippet Optimized) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Direct Answer:</strong> A {discountPercent}% discount on ${originalPrice} saves <strong className="font-bold">${result4.savings}</strong>, paying <strong className="font-bold">${result4.finalPrice}</strong>.
              </div>
            </div>
          </div>
        )}

        {calcMode === "tax" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CalcInput
                id="tax-base"
                label="Base Price"
                prefix="$"
                value={taxBasePrice}
                onChange={(v) => setTaxBasePrice(Number(v) || 0)}
              />
              <CalcInput
                id="tax-rate"
                label="Tax Rate"
                suffix="%"
                value={taxPercent}
                onChange={(v) => setTaxPercent(Number(v) || 0)}
              />
              <CalcSelect
                id="tax-mode"
                label="Calculation Direction"
                value={taxMode}
                options={[
                  { value: "add", label: "Add Tax to Net Price" },
                  { value: "extract", label: "Extract Tax from Gross" },
                ]}
                onChange={(v) => setTaxMode(v as "add" | "extract")}
              />
            </div>

            <CalcResult
              title="Tax Breakdown"
              primaryLabel={taxMode === "add" ? "Total Price (Including Tax)" : "Net Price (Excluding Tax)"}
              primaryValue={`$${taxMode === "add" ? result5.total : result5.preTax}`}
              copyValue={`Base: $${taxBasePrice} at ${taxPercent}% tax = Total: $${result5.total} (Tax: $${result5.taxAmount})`}
              items={[
                { label: "Tax Amount", value: `$${result5.taxAmount}`, highlight: true },
                { label: taxMode === "add" ? "Pre-Tax Base" : "Gross Total", value: `$${taxMode === "add" ? result5.preTax : result5.total}` },
                { label: "Formula Applied", value: result5.formula },
              ]}
            />
          </div>
        )}

        {calcMode === "marginMarkup" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CalcInput
                id="cost-price"
                label="Cost of Goods (COGS)"
                prefix="$"
                value={costPrice}
                onChange={(v) => setCostPrice(Number(v) || 0)}
              />
              <CalcInput
                id="margin-rate"
                label={marginMarkupType === "markup" ? "Desired Markup" : "Target Profit Margin"}
                suffix="%"
                value={marginMarkupPercent}
                onChange={(v) => setMarginMarkupPercent(Number(v) || 0)}
              />
              <CalcSelect
                id="margin-markup-mode"
                label="Pricing Strategy"
                value={marginMarkupType}
                options={[
                  { value: "markup", label: "Markup on Cost" },
                  { value: "margin", label: "Gross Profit Margin" },
                ]}
                onChange={(v) => setMarginMarkupType(v as "margin" | "markup")}
              />
            </div>

            <CalcResult
              title="Commercial Pricing Output"
              primaryLabel="Recommended Selling Price"
              primaryValue={`$${result6.sellingPrice}`}
              copyValue={`Cost: $${costPrice} at ${marginMarkupPercent}% ${marginMarkupType} = Selling Price: $${result6.sellingPrice} (Profit: $${result6.profit})`}
              items={[
                { label: "Gross Profit per Unit", value: `$${result6.profit}`, highlight: true },
                { label: "Equivalent Metric", value: result6.equivalent },
                { label: "Formula", value: result6.formula },
              ]}
            />

            {/* Direct Answer Box (Google Snippet Optimized) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Direct Answer:</strong> A ${costPrice} cost with {marginMarkupPercent}% {marginMarkupType} yields a selling price of <strong className="font-bold">${result6.sellingPrice}</strong> with <strong className="font-bold">${result6.profit}</strong> profit.
                <span className="block text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Formula: {result6.formula}.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <CalcShareButton
            state={shareState}
            label="Share Calculation"
          />
          <CalcPromptButton promptText={aiPrompt} label="Copy Scenario for ChatGPT / Claude" />
        </div>
      </CalcCard>

      {/* Live Percentage Reference Grid */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Table className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Instant Percentage Matrix for {matrixBase.toLocaleString()}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Common percentage multipliers and exact values calculated in real-time.
            </p>
          </div>
          <button
            onClick={handleDownloadCheatSheet}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800/60"
          >
            <Download className="h-3.5 w-3.5" />
            Download .xlsx Reference Sheet
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {matrixRows.map((row) => (
            <div
              key={row.percentage}
              className="flex flex-col p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {row.percentage}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  ×{row.multiplier}
                </span>
              </div>
              <span className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {row.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">{currentSummaryLabel}</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {currentSummaryValue}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDownloadCheatSheet}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}
