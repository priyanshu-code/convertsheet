"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
} from "@/components/calculator";

export function SipCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(12);
  const [timeYears, setTimeYears] = useState<number>(10);

  const { totalInvested, wealthGained, totalMaturity } = useMemo(() => {
    const P = Math.max(0, monthlyInvestment);
    const r = Math.max(0, annualReturnRate);
    const t = Math.max(1, timeYears);

    const i = r / 12 / 100;
    const n = t * 12;

    const invested = P * n;
    let maturity = 0;

    if (i === 0) {
      maturity = invested;
    } else {
      // SIP Formula: P * [((1 + i)^n - 1) / i] * (1 + i)
      maturity = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    const gains = Math.max(0, maturity - invested);

    return {
      totalInvested: Math.round(invested),
      wealthGained: Math.round(gains),
      totalMaturity: Math.round(maturity),
    };
  }, [monthlyInvestment, annualReturnRate, timeYears]);

  // Year by year trajectory for interactive Recharts area graph
  const chartData = useMemo(() => {
    const P = Math.max(0, monthlyInvestment);
    const r = Math.max(0, annualReturnRate);
    const t = Math.max(1, timeYears);
    const i = r / 12 / 100;

    const data = [];
    for (let yr = 1; yr <= t; yr++) {
      const n = yr * 12;
      const inv = P * n;
      const mat = i === 0 ? inv : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      data.push({
        label: `Yr ${yr}`,
        invested: Math.round(inv),
        wealthGained: Math.round(Math.max(0, mat - inv)),
        totalValue: Math.round(mat),
      });
    }
    return data;
  }, [monthlyInvestment, annualReturnRate, timeYears]);

  return (
    <CalcCard
      title="SIP Calculator (Mutual Funds)"
      subtitle="Forecast your mutual fund systematic investment wealth generation with compound growth projections."
      icon={TrendingUp}
      badge="Wealth Builder"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <CalcInput
            id="sip-amount"
            label="Monthly Investment"
            value={monthlyInvestment}
            min={500}
            step={500}
            prefix="₹"
            onChange={(val) => setMonthlyInvestment(Number(val) || 0)}
          />
          <CalcSlider
            id="sip-amount-slider"
            label="Adjust Monthly Contribution"
            value={monthlyInvestment}
            min={500}
            max={100000}
            step={500}
            prefix="₹"
            onChange={setMonthlyInvestment}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="sip-rate"
            label="Expected Annual Return (%)"
            value={annualReturnRate}
            min={1}
            max={30}
            step={0.5}
            suffix="%"
            onChange={(val) => setAnnualReturnRate(Number(val) || 0)}
          />
          <CalcSlider
            id="sip-rate-slider"
            label="Return Rate Range"
            value={annualReturnRate}
            min={1}
            max={30}
            step={0.5}
            unit="%"
            onChange={setAnnualReturnRate}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="sip-tenure"
            label="Investment Time Horizon"
            value={timeYears}
            min={1}
            max={40}
            step={1}
            suffix="Years"
            onChange={(val) => setTimeYears(Number(val) || 1)}
          />
          <CalcSlider
            id="sip-tenure-slider"
            label="Tenure (Years)"
            value={timeYears}
            min={1}
            max={40}
            unit="Yrs"
            onChange={setTimeYears}
          />
        </div>
      </div>

      <CalcResult
        title="Maturity Breakdown"
        primaryLabel="Total Expected Maturity Value"
        primaryValue={`₹${totalMaturity.toLocaleString("en-IN")}`}
        items={[
          {
            label: "Total Invested Capital",
            value: `₹${totalInvested.toLocaleString("en-IN")}`,
          },
          {
            label: "Estimated Wealth Gained",
            value: `₹${wealthGained.toLocaleString("en-IN")}`,
            highlight: true,
          },
          {
            label: "Wealth Multiplier",
            value: totalInvested > 0 ? `${(totalMaturity / totalInvested).toFixed(2)}x` : "1x",
            badge: "Growth",
          },
        ]}
      />

      {/* Interactive Growth Curve Chart */}
      <CalcChart
        title="SIP Compounding Wealth Curve (Year-by-Year)"
        data={chartData}
        series={[
          {
            key: "invested",
            name: "Invested Capital",
            color: "#3B82F6",
            gradientId: "sipInvestedGrad",
          },
          {
            key: "wealthGained",
            name: "Estimated Gains",
            color: "#10B981",
            gradientId: "sipGainsGrad",
          },
        ]}
      />

      {/* AEO / GEO Actions & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <CalcPromptButton
          promptText={`Analyze this SIP investment strategy: I am investing ₹${monthlyInvestment.toLocaleString('en-IN')}/month for ${timeYears} years at an expected return of ${annualReturnRate}%. My projected maturity value is ₹${totalMaturity.toLocaleString('en-IN')} (₹${totalInvested.toLocaleString('en-IN')} invested + ₹${wealthGained.toLocaleString('en-IN')} gains). Is this realistic, what are the inflation-adjusted returns, and what mutual fund categories are recommended?`}
          label="Copy Prompt for ChatGPT / Claude"
        />

        <CalcExportButton
          filename={`convertsheet_sip_${monthlyInvestment}_pm_${timeYears}yrs`}
          sheetName="SIP Projections"
          data={chartData.map((d) => ({
            Year: d.label,
            "Invested Capital (INR)": d.invested,
            "Wealth Gained (INR)": d.wealthGained,
            "Total Portfolio Value (INR)": d.totalValue,
          }))}
          label="Download Schedule (.xlsx)"
        />
      </div>
    </CalcCard>
  );
}
