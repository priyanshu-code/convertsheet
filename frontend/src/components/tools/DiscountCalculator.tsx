"use client";

import React, { useState, useMemo } from "react";
import { Tag } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export function DiscountCalculator() {
  const { currencySymbol, formatCurrency } = useCurrency();
  const [originalPrice, setOriginalPrice] = useState<number>(2000);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);

  const { finalPrice, totalSavings, effectiveDiscount } = useMemo(() => {
    const P = Math.max(0, originalPrice);
    const d1 = Math.min(100, Math.max(0, discountPercent));
    const d2 = Math.min(100, Math.max(0, extraDiscount));

    // Stacked discount logic
    const afterFirst = P * (1 - d1 / 100);
    const afterSecond = afterFirst * (1 - d2 / 100);
    const savings = P - afterSecond;
    const effective = P > 0 ? (savings / P) * 100 : 0;

    return {
      finalPrice: Math.round(afterSecond * 100) / 100,
      totalSavings: Math.round(savings * 100) / 100,
      effectiveDiscount: Math.round(effective * 10) / 10,
    };
  }, [originalPrice, discountPercent, extraDiscount]);

  const QUICK_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50, 70];
  const QUICK_COUPONS = [0, 5, 10, 15, 20];
  const QUICK_PRICES = [50, 100, 250, 500, 1000, 2000];

  return (
    <CalcCard
      title="Discount & Sale Price Calculator"
      subtitle="Calculate your final discounted price, total cash savings, and stacked coupon deductions."
      icon={Tag}
      badge="Retail & Sales"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-4">
          <CalcInput
            id="original-price"
            label="Original Retail Price"
            value={originalPrice}
            min={0}
            step={50}
            prefix={currencySymbol}
            onChange={(v) => setOriginalPrice(Number(v) || 0)}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_PRICES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setOriginalPrice(p)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                  originalPrice === p
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                }`}
              >
                {currencySymbol}{p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
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
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_DISCOUNTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiscountPercent(d)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                  discountPercent === d
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                }`}
              >
                {d}%
              </button>
            ))}
          </div>
          <CalcSlider
            id="discount-slider"
            label="Primary Discount Slider"
            value={discountPercent}
            min={0}
            max={90}
            step={5}
            unit="%"
            onChange={setDiscountPercent}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="extra-discount"
            label="Additional Coupon Code (%)"
            value={extraDiscount}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={(v) => setExtraDiscount(Number(v) || 0)}
            helperText="Stacked on top of primary discount"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_COUPONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setExtraDiscount(c)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                  extraDiscount === c
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                }`}
              >
                {c === 0 ? "None" : `+${c}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CalcResult
        title="Final Payable Price"
        primaryLabel="Final Price After Discounts"
        primaryValue={formatCurrency(finalPrice, { maxDecimals: 2 })}
        copyValue={`Original: ${formatCurrency(originalPrice)} | Discount: ${discountPercent}%${extraDiscount > 0 ? ` + ${extraDiscount}% coupon` : ""} | Final Price: ${formatCurrency(finalPrice)} (Saved: ${formatCurrency(totalSavings)})`}
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
  );
}
