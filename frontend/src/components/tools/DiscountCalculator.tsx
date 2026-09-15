"use client";

import React, { useState, useMemo } from "react";
import { Tag } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
} from "@/components/calculator";

export function DiscountCalculator() {
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
            prefix="₹"
            onChange={(v) => setOriginalPrice(Number(v) || 0)}
          />
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
          <CalcSlider
            id="discount-slider"
            label="Primary Discount"
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
        </div>
      </div>

      <CalcResult
        title="Final Payable Price"
        primaryLabel="Final Price After Discounts"
        primaryValue={`₹${finalPrice.toLocaleString("en-IN")}`}
        items={[
          {
            label: "Total Money Saved",
            value: `₹${totalSavings.toLocaleString("en-IN")}`,
            highlight: true,
          },
          {
            label: "Effective Total Discount",
            value: `${effectiveDiscount}% OFF`,
            badge: "Effective",
          },
          {
            label: "Original Price",
            value: `₹${originalPrice.toLocaleString("en-IN")}`,
          },
        ]}
      />
    </CalcCard>
  );
}
