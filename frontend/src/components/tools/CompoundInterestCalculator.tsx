"use client";

import React, { useState, useMemo } from "react";
import { Coins } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
} from "@/components/calculator";

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [years, setYears] = useState<number>(5);
  const [frequency, setFrequency] = useState<string>("12"); // 12 = monthly

  const { maturityAmount, totalInterest } = useMemo(() => {
    const P = Math.max(0, principal);
    const r = Math.max(0, annualRate) / 100;
    const t = Math.max(1, years);
    const n = Number(frequency) || 1;

    // A = P * (1 + r/n)^(n*t)
    const A = P * Math.pow(1 + r / n, n * t);
    const interest = Math.max(0, A - P);

    return {
      maturityAmount: Math.round(A),
      totalInterest: Math.round(interest),
    };
  }, [principal, annualRate, years, frequency]);

  return (
    <CalcCard
      title="Compound Interest Calculator"
      subtitle="Calculate compound growth on savings, certificates of deposit (CDs), and fixed deposits."
      icon={Coins}
      badge="Exponential Yield"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <CalcInput
            id="ci-principal"
            label="Initial Deposit / Principal"
            value={principal}
            min={1000}
            step={1000}
            prefix="₹"
            onChange={(val) => setPrincipal(Number(val) || 0)}
          />
          <CalcSlider
            id="ci-principal-slider"
            label="Principal Amount"
            value={principal}
            min={5000}
            max={2000000}
            step={5000}
            prefix="₹"
            onChange={setPrincipal}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="ci-rate"
            label="Annual Interest Rate (%)"
            value={annualRate}
            min={0.5}
            max={30}
            step={0.25}
            suffix="%"
            onChange={(val) => setAnnualRate(Number(val) || 0)}
          />
          <CalcSlider
            id="ci-rate-slider"
            label="Interest Rate"
            value={annualRate}
            min={1}
            max={25}
            step={0.5}
            unit="%"
            onChange={setAnnualRate}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="ci-years"
            label="Duration (Years)"
            value={years}
            min={1}
            max={40}
            step={1}
            suffix="Years"
            onChange={(val) => setYears(Number(val) || 1)}
          />
          <CalcSlider
            id="ci-years-slider"
            label="Years"
            value={years}
            min={1}
            max={40}
            unit="Yrs"
            onChange={setYears}
          />
        </div>

        <div className="space-y-4">
          <CalcSelect
            id="ci-frequency"
            label="Compounding Frequency"
            value={frequency}
            options={[
              { value: "1", label: "Annually (1/yr)" },
              { value: "2", label: "Semi-Annually (2/yr)" },
              { value: "4", label: "Quarterly (4/yr)" },
              { value: "12", label: "Monthly (12/yr)" },
              { value: "365", label: "Daily (365/yr)" },
            ]}
            onChange={setFrequency}
          />
        </div>
      </div>

      <CalcResult
        title="Compounding Projections"
        primaryLabel="Total Future Value (Principal + Interest)"
        primaryValue={`₹${maturityAmount.toLocaleString("en-IN")}`}
        items={[
          {
            label: "Initial Principal",
            value: `₹${principal.toLocaleString("en-IN")}`,
          },
          {
            label: "Compound Interest Earned",
            value: `₹${totalInterest.toLocaleString("en-IN")}`,
            highlight: true,
          },
          {
            label: "Growth Rate",
            value: principal > 0 ? `${((totalInterest / principal) * 100).toFixed(1)}%` : "0%",
          },
        ]}
      />
    </CalcCard>
  );
}
