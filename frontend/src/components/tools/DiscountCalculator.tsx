"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Tag, ShieldCheck, Sparkles, FileSpreadsheet, Download } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import * as XLSX from "xlsx";

export interface DiscountCalculatorProps {
  initialValues?: Partial<{
    originalPrice: number;
    discountPercent: number;
    extraDiscount: number;
  }>;
}

export function DiscountCalculator({ initialValues }: DiscountCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [originalPrice, setOriginalPrice] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("originalPrice");
      if (q) return Number(q);
    }
    return Number(initialValues?.originalPrice) || 2000;
  });

  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("discountPercent");
      if (q) return Number(q);
    }
    return Number(initialValues?.discountPercent) || 20;
  });

  const [extraDiscount, setExtraDiscount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("extraDiscount");
      if (q) return Number(q);
    }
    return Number(initialValues?.extraDiscount) || 0;
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("originalPrice", originalPrice.toString());
    params.set("discountPercent", discountPercent.toString());
    if (extraDiscount > 0) {
      params.set("extraDiscount", extraDiscount.toString());
    } else {
      params.delete("extraDiscount");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [originalPrice, discountPercent, extraDiscount]);

  const { finalPrice, totalSavings, effectiveDiscount, firstDiscountSavings, extraCouponSavings } =
    useMemo(() => {
      const P = Math.max(0, originalPrice);
      const d1 = Math.min(100, Math.max(0, discountPercent));
      const d2 = Math.min(100, Math.max(0, extraDiscount));

      // Stacked discount logic:
      // First discount applied to initial retail price
      const priceAfterFirst = P * (1 - d1 / 100);
      const savingsFirst = P - priceAfterFirst;

      // Second stacked coupon discount applied to already-discounted subtotal
      const priceAfterSecond = priceAfterFirst * (1 - d2 / 100);
      const savingsExtra = priceAfterFirst - priceAfterSecond;

      const totalSave = P - priceAfterSecond;
      const effective = P > 0 ? (totalSave / P) * 100 : 0;

      return {
        finalPrice: Math.round(priceAfterSecond * 100) / 100,
        totalSavings: Math.round(totalSave * 100) / 100,
        effectiveDiscount: Math.round(effective * 10) / 10,
        firstDiscountSavings: Math.round(savingsFirst * 100) / 100,
        extraCouponSavings: Math.round(savingsExtra * 100) / 100,
      };
    }, [originalPrice, discountPercent, extraDiscount]);

  const QUICK_PRICES = [50, 100, 250, 500, 1000, 2000, 5000];
  const QUICK_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50, 70];
  const QUICK_COUPONS = [0, 5, 10, 15, 20];

  const copySummary = `Original: ${formatCurrency(originalPrice)} | Discount: ${discountPercent}%${extraDiscount > 0 ? ` + ${extraDiscount}% coupon` : ""} | Final Price: ${formatCurrency(finalPrice)} (Saved: ${formatCurrency(totalSavings)})`;

  const llmPrompt = `Analyze this retail pricing & discount scenario:
- Original Price: ${currencySymbol}${originalPrice.toLocaleString()}
- Primary Store Discount: ${discountPercent}% (Savings: ${currencySymbol}${firstDiscountSavings.toLocaleString()})
- Stacked Coupon Code: ${extraDiscount}% (Additional Savings: ${currencySymbol}${extraCouponSavings.toLocaleString()})
- Final Out-of-Pocket Price: ${currencySymbol}${finalPrice.toLocaleString()}
- Total Cash Saved: ${currencySymbol}${totalSavings.toLocaleString()}
- Effective Blended Discount: ${effectiveDiscount}% OFF

Please explain the stacked discount math and compare against competitive retail markdowns.`;

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - Discount & Sale Price Calculation", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        [
          "ConvertSheet Recalculation Model",
          `https://www.convertsheet.com/tools/discount-calculator?originalPrice=${originalPrice}&discountPercent=${discountPercent}${extraDiscount > 0 ? `&extraDiscount=${extraDiscount}` : ""}`,
        ],
        ["Benchmark Standard", "2026 Retail & E-Commerce Stacked Markdown Math"],
        ["", ""],
        ["--- TRANSACTION PARAMETERS ---", ""],
        ["Original Retail Price", originalPrice],
        ["Primary Store Discount (%)", `${discountPercent}%`],
        ["Stacked Coupon Code (%)", extraDiscount > 0 ? `${extraDiscount}%` : "None"],
        ["", ""],
        ["--- FINAL PAYABLE & SAVINGS ---", ""],
        ["Initial Store Discount Savings", firstDiscountSavings],
        ["Stacked Coupon Additional Savings", extraCouponSavings],
        ["Total Cash Savings", totalSavings],
        ["Effective Blended Discount Rate", `${effectiveDiscount}%`],
        ["Final Payable Price", finalPrice],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Discount Summary");

      // Comparative Markdown Matrix for standard tiers
      const matrixHeader = [
        "Discount Tier",
        "Original Price",
        "Dollar Savings",
        "Final Price",
        "Effective %",
      ];
      const comparisonTiers = [10, 15, 20, 25, 30, 40, 50, 60, 70];
      const matrixRows = comparisonTiers.map((tier) => {
        const p1 = originalPrice * (1 - tier / 100);
        const p2 = p1 * (1 - extraDiscount / 100);
        const saved = originalPrice - p2;
        const eff = originalPrice > 0 ? (saved / originalPrice) * 100 : 0;
        return [
          `${tier}%${extraDiscount > 0 ? ` + ${extraDiscount}%` : ""}`,
          originalPrice,
          Math.round(saved * 100) / 100,
          Math.round(p2 * 100) / 100,
          `${Math.round(eff * 10) / 10}%`,
        ];
      });

      const wsMatrix = XLSX.utils.aoa_to_sheet([matrixHeader, ...matrixRows]);
      XLSX.utils.book_append_sheet(wb, wsMatrix, "Markdown Matrix");

      XLSX.writeFile(wb, `ConvertSheet_Discount_Audit_${originalPrice}_${discountPercent}pct.xlsx`);
    } catch (err) {
      console.error("Failed to generate Excel export:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          Updated for 2026 Retail &amp; E-Commerce Benchmarks • Stacked Coupon Math &amp; Tax Savings
        </span>
      </div>

      <CalcCard
        title="Discount & Sale Price Calculator"
        subtitle="Calculate your final discounted price, total cash savings, and stacked coupon deductions."
        icon={Tag}
        badge="Retail & Sales"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Original Retail Price */}
          <div className="space-y-3">
            <CalcInput
              id="original-price"
              label="Original Retail Price"
              value={originalPrice}
              min={0}
              step={50}
              prefix={currencySymbol}
              onChange={(v) => setOriginalPrice(Number(v) || 0)}
            />
            <CalcSlider
              id="original-price-slider"
              ariaLabel="Original Retail Price Slider"
              value={originalPrice}
              min={10}
              max={10000}
              step={10}
              prefix={currencySymbol}
              onChange={setOriginalPrice}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_PRICES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setOriginalPrice(p)}
                  className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all touch-manipulation cursor-pointer flex items-center justify-center ${
                    originalPrice === p
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {currencySymbol}
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Discount Rate */}
          <div className="space-y-3">
            <CalcInput
              id="discount-rate"
              label="Primary Discount (%)"
              value={discountPercent}
              min={0}
              max={100}
              step={1}
              suffix="%"
              onChange={(v) => setDiscountPercent(Number(v) || 0)}
            />
            <CalcSlider
              id="discount-slider"
              ariaLabel="Primary Discount Slider"
              value={discountPercent}
              min={0}
              max={90}
              step={5}
              unit="%"
              onChange={setDiscountPercent}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_DISCOUNTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscountPercent(d)}
                  className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all touch-manipulation cursor-pointer flex items-center justify-center ${
                    discountPercent === d
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>

          {/* Extra Stacked Coupon Code */}
          <div className="space-y-3">
            <CalcInput
              id="extra-discount"
              label="Additional Coupon Code (%)"
              value={extraDiscount}
              min={0}
              max={100}
              step={1}
              suffix="%"
              onChange={(v) => setExtraDiscount(Number(v) || 0)}
              helperText="Stacked sequentially on subtotal"
            />
            <CalcSlider
              id="extra-discount-slider"
              ariaLabel="Extra Coupon Slider"
              value={extraDiscount}
              min={0}
              max={50}
              step={5}
              unit="%"
              onChange={setExtraDiscount}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_COUPONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setExtraDiscount(c)}
                  className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all touch-manipulation cursor-pointer flex items-center justify-center ${
                    extraDiscount === c
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {c === 0 ? "None" : `+${c}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Save, Share, Prompt, Excel Export */}
        <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
          <CalcSaveButton
            calculationType="Discount Calculation"
            inputs={{ originalPrice, discountPercent, extraDiscount }}
            outputs={{ finalPrice, totalSavings, effectiveDiscount }}
          />
          <CalcShareButton
            title="ConvertSheet Discount & Sale Price Calculation"
            text={`Final Price: ${formatCurrency(finalPrice)} (Saved: ${formatCurrency(totalSavings)} with ${effectiveDiscount}% off)`}
          />
          <CalcPromptButton promptText={llmPrompt} />
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isExportingExcel ? "Generating .xlsx..." : "Export to Excel (.xlsx)"}</span>
          </button>
        </div>

        <CalcResult
          title="Final Payable Price"
          primaryLabel="Final Price After Discounts"
          primaryValue={formatCurrency(finalPrice, { maxDecimals: 2 })}
          copyValue={copySummary}
          items={[
            {
              label: "Total Money Saved",
              value: formatCurrency(totalSavings, { maxDecimals: 2 }),
              highlight: true,
            },
            {
              label: "Effective Total Discount",
              value: `${effectiveDiscount}% OFF`,
              badge: "Effective",
            },
            {
              label: "Original Price",
              value: formatCurrency(originalPrice, { maxDecimals: 2 }),
            },
          ]}
        />
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            Final Payable Price
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(finalPrice, { maxDecimals: 2 })}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
            Saved {formatCurrency(totalSavings, { maxDecimals: 2 })} ({effectiveDiscount}% off)
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export .xlsx</span>
        </button>
      </div>
    </div>
  );
}
