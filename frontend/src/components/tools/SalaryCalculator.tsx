"use client";

import React, { useState, useMemo } from "react";
import { Briefcase } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
  CalcShareButton,
} from "@/components/calculator";

export function SalaryCalculator() {
  const [annualCtc, setAnnualCtc] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("annualCtc");
      if (q) return Number(q);
    }
    return 1200000;
  });

  const [epfPercent, setEpfPercent] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("epfPercent");
      if (q) return Number(q);
    }
    return 12;
  });

  const [professionalTaxMonthly, setProfessionalTaxMonthly] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("professionalTaxMonthly");
      if (q) return Number(q);
    }
    return 200;
  });

  const {
    monthlyGross,
    monthlyEpf,
    monthlyTax,
    monthlyPt,
    monthlyTakeHome,
    annualTakeHome,
    annualDeductions,
  } = useMemo(() => {
    const ctc = Math.max(0, annualCtc);
    const mGross = ctc / 12;
    const basicPay = ctc * 0.5;
    const annualEpf = (basicPay * Math.max(0, epfPercent)) / 100;
    const mEpf = annualEpf / 12;
    const mPt = Math.max(0, professionalTaxMonthly);
    const annualPt = mPt * 12;

    const taxable = Math.max(0, ctc - 75000 - annualPt);
    let annualTax = 0;
    if (taxable > 1500000) {
      annualTax = 150000 + (taxable - 1500000) * 0.3;
    } else if (taxable > 1200000) {
      annualTax = 90000 + (taxable - 1200000) * 0.2;
    } else if (taxable > 1000000) {
      annualTax = 60000 + (taxable - 1000000) * 0.15;
    } else if (taxable > 700000) {
      annualTax = 20000 + (taxable - 700000) * 0.1;
    } else if (taxable > 300000) {
      annualTax = (taxable - 300000) * 0.05;
    }
    annualTax = annualTax * 1.04;

    const mTax = annualTax / 12;
    const mTakeHome = Math.max(0, mGross - mEpf - mPt - mTax);
    const aTakeHome = mTakeHome * 12;
    const aDeductions = ctc - aTakeHome;

    return {
      monthlyGross: Math.round(mGross),
      monthlyEpf: Math.round(mEpf),
      monthlyTax: Math.round(mTax),
      monthlyPt: Math.round(mPt),
      monthlyTakeHome: Math.round(mTakeHome),
      annualTakeHome: Math.round(aTakeHome),
      annualDeductions: Math.round(aDeductions),
    };
  }, [annualCtc, epfPercent, professionalTaxMonthly]);

  const chartData = useMemo(() => {
    return [
      { label: "Gross CTC", amount: annualCtc },
      { label: "Take-Home", amount: annualTakeHome },
      { label: "Total Deductions", amount: annualDeductions },
      { label: "EPF Saved", amount: monthlyEpf * 12 },
      { label: "Income Tax", amount: monthlyTax * 12 },
    ];
  }, [annualCtc, annualTakeHome, annualDeductions, monthlyEpf, monthlyTax]);

  const exportSchedule = useMemo(() => {
    return [
      { Component: "Annual Cost to Company (CTC)", Monthly: monthlyGross, Annual: annualCtc },
      { Component: "Employee Provident Fund (EPF)", Monthly: monthlyEpf, Annual: monthlyEpf * 12 },
      { Component: "Professional Tax (PT)", Monthly: monthlyPt, Annual: monthlyPt * 12 },
      { Component: "Estimated Income Tax TDS", Monthly: monthlyTax, Annual: monthlyTax * 12 },
      { Component: "Net In-Hand Salary", Monthly: monthlyTakeHome, Annual: annualTakeHome },
    ];
  }, [monthlyGross, annualCtc, monthlyEpf, monthlyPt, monthlyTax, monthlyTakeHome, annualTakeHome]);

  const llmPrompt = `Analyze my salary breakdown:
- Gross Annual CTC: ₹${annualCtc.toLocaleString()}
- Monthly Gross: ₹${monthlyGross.toLocaleString()}
- Monthly EPF: ₹${monthlyEpf.toLocaleString()}
- Monthly Professional Tax: ₹${monthlyPt.toLocaleString()}
- Monthly Tax TDS: ₹${monthlyTax.toLocaleString()}
- Net Monthly Take-Home: ₹${monthlyTakeHome.toLocaleString()}

Please advise on tax saving strategies, voluntary PF benefits, and salary restructuring to maximize in-hand pay.`;

  return (
    <CalcCard
      title="Salary & Take-Home Pay Calculator"
      subtitle="Calculate your exact monthly take-home salary from gross annual CTC after EPF, professional tax, and income taxes."
      icon={Briefcase}
      badge="Career Essential"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CalcInput
            id="annual-ctc"
            label="Gross Annual CTC"
            value={annualCtc}
            onChange={setAnnualCtc}
            prefix="₹"
            min={100000}
            step={50000}
            helpText="Total cost-to-company quoted in your offer letter"
          />
          <CalcSlider
            id="epf-percent"
            label="Employee Provident Fund (EPF % of Basic)"
            value={epfPercent}
            onChange={setEpfPercent}
            min={0}
            max={12}
            step={1}
            unit="%"
            helpText="Standard EPF contribution is 12% of basic salary"
          />
          <CalcInput
            id="professional-tax"
            label="Monthly Professional Tax"
            value={professionalTaxMonthly}
            onChange={setProfessionalTaxMonthly}
            prefix="₹"
            min={0}
            max={2500}
            step={50}
            helpText="State professional tax (typically ₹200/month)"
          />

          <div className="pt-2 flex flex-wrap gap-3">
            <CalcShareButton
              state={{
                annualCtc,
                epfPercent,
                professionalTaxMonthly,
              }}
              label="Share Take-Home Plan"
            />
            <CalcPromptButton promptText={llmPrompt} />
            <CalcExportButton
              data={exportSchedule}
              filename="salary-breakdown"
              sheetName="Salary Summary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <CalcResult
            title="Monthly Take-Home Summary"
            primaryLabel="Net In-Hand Paycheck"
            primaryValue={`₹${monthlyTakeHome.toLocaleString()}`}
            primarySubtext={`Annual In-Hand: ₹${annualTakeHome.toLocaleString()}`}
            items={[
              {
                label: "Monthly EPF",
                value: `₹${monthlyEpf.toLocaleString()}`,
                subtext: "Retirement savings",
                highlight: true,
              },
              {
                label: "Monthly Tax TDS",
                value: `₹${monthlyTax.toLocaleString()}`,
                subtext: "Estimated income tax",
              },
              {
                label: "Monthly Gross",
                value: `₹${monthlyGross.toLocaleString()}`,
              },
              {
                label: "Annual Deductions",
                value: `₹${annualDeductions.toLocaleString()}`,
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <CalcChart
          title="Salary Distribution & Deductions"
          data={chartData}
          series={[
            {
              key: "amount",
              name: "Amount (₹)",
              color: "#10b981",
              gradientId: "salaryGrad",
            },
          ]}
        />
      </div>
    </CalcCard>
  );
}
