"use client";

import React, { useState, useMemo } from "react";
import { Receipt } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
} from "@/components/calculator";

export function IncomeTaxCalculator() {
  const [annualIncome, setAnnualIncome] = useState<number>(1500000);
  const [standardDeduction, setStandardDeduction] = useState<number>(75000);
  const [otherDeductions, setOtherDeductions] = useState<number>(50000);

  const { taxableIncome, slabBreakdown, totalBaseTax, cessAmount, totalTaxPayable, effectiveTaxRate } = useMemo(() => {
    const gross = Math.max(0, annualIncome);
    const deductions = Math.max(0, standardDeduction) + Math.max(0, otherDeductions);
    const taxable = Math.max(0, gross - deductions);

    const slabs = [
      { range: "Up to ₹3,00,000", rate: "0%", min: 0, max: 300000, tax: 0 },
      { range: "₹3,00,001 - ₹7,00,000", rate: "5%", min: 300000, max: 700000, tax: 0 },
      { range: "₹7,00,001 - ₹10,00,000", rate: "10%", min: 700000, max: 1000000, tax: 0 },
      { range: "₹10,00,001 - ₹12,00,000", rate: "15%", min: 1000000, max: 1200000, tax: 0 },
      { range: "₹12,00,001 - ₹15,00,000", rate: "20%", min: 1200000, max: 1500000, tax: 0 },
      { range: "Above ₹15,00,000", rate: "30%", min: 1500000, max: Infinity, tax: 0 },
    ];

    let baseTax = 0;
    const computedSlabs = slabs.map((slab) => {
      let taxedPortion = 0;
      if (taxable > slab.min) {
        taxedPortion = Math.min(taxable, slab.max) - slab.min;
      }
      const rateNum = parseFloat(slab.rate) / 100;
      const slabTax = taxedPortion * rateNum;
      baseTax += slabTax;
      return {
        ...slab,
        taxedAmount: taxedPortion,
        tax: Math.round(slabTax),
      };
    });

    const cess = baseTax * 0.04;
    const finalTax = baseTax + cess;
    const effectiveRate = gross > 0 ? (finalTax / gross) * 100 : 0;

    return {
      taxableIncome: Math.round(taxable),
      slabBreakdown: computedSlabs,
      totalBaseTax: Math.round(baseTax),
      cessAmount: Math.round(cess),
      totalTaxPayable: Math.round(finalTax),
      effectiveTaxRate: Number(effectiveRate.toFixed(2)),
    };
  }, [annualIncome, standardDeduction, otherDeductions]);

  const chartData = useMemo(() => {
    return slabBreakdown
      .filter((s) => s.tax > 0)
      .map((s) => ({
        label: s.rate,
        taxOwed: s.tax,
      }));
  }, [slabBreakdown]);

  const exportSchedule = useMemo(() => {
    return [
      { Metric: "Gross Annual Income", Value: annualIncome },
      { Metric: "Standard Deduction", Value: standardDeduction },
      { Metric: "Other Deductions", Value: otherDeductions },
      { Metric: "Net Taxable Income", Value: taxableIncome },
      ...slabBreakdown.map((s) => ({
        Metric: `Bracket ${s.range} (${s.rate})`,
        Value: s.tax,
      })),
      { Metric: "Base Income Tax", Value: totalBaseTax },
      { Metric: "4% Health & Education Cess", Value: cessAmount },
      { Metric: "Total Tax Liability", Value: totalTaxPayable },
    ];
  }, [annualIncome, standardDeduction, otherDeductions, taxableIncome, slabBreakdown, totalBaseTax, cessAmount, totalTaxPayable]);

  const llmPrompt = `Analyze my progressive income tax liability:
- Gross Annual Income: ₹${annualIncome.toLocaleString()}
- Total Deductions: ₹${(standardDeduction + otherDeductions).toLocaleString()}
- Taxable Income: ₹${taxableIncome.toLocaleString()}
- Total Tax Payable: ₹${totalTaxPayable.toLocaleString()}
- Effective Tax Rate: ${effectiveTaxRate}%

Please evaluate whether the Old Regime or New Regime is better for this income, and suggest tax optimization maneuvers.`;

  return (
    <CalcCard
      title="Income Tax Slab Calculator"
      subtitle="Estimate your progressive income tax liability across progressive brackets with standard deduction and cess breakdown."
      icon={Receipt}
      badge="Tax Ready"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CalcInput
            id="annual-income"
            label="Gross Annual Income"
            value={annualIncome}
            onChange={setAnnualIncome}
            prefix="₹"
            min={100000}
            step={50000}
          />
          <CalcInput
            id="standard-deduction"
            label="Standard Deduction"
            value={standardDeduction}
            onChange={setStandardDeduction}
            prefix="₹"
            min={0}
            step={5000}
            helpText="Statutory deduction (e.g. ₹75,000 for salaried)"
          />
          <CalcInput
            id="other-deductions"
            label="Other Exemptions / Deductions"
            value={otherDeductions}
            onChange={setOtherDeductions}
            prefix="₹"
            min={0}
            step={5000}
            helpText="NPS, medical insurance, or other allowable deductions"
          />

          <div className="pt-2 flex flex-wrap gap-3">
            <CalcPromptButton promptText={llmPrompt} />
            <CalcExportButton
              data={exportSchedule}
              filename="income-tax-schedule"
              sheetName="Tax Calculation"
            />
          </div>
        </div>

        <div className="space-y-4">
          <CalcResult
            title="Tax Liability Summary"
            primaryLabel="Total Tax Payable"
            primaryValue={`₹${totalTaxPayable.toLocaleString()}`}
            primarySubtext={`Effective Tax Rate: ${effectiveTaxRate}%`}
            items={[
              {
                label: "Net Taxable Income",
                value: `₹${taxableIncome.toLocaleString()}`,
                highlight: true,
              },
              {
                label: "Health & Edu Cess (4%)",
                value: `₹${cessAmount.toLocaleString()}`,
              },
              {
                label: "Base Income Tax",
                value: `₹${totalBaseTax.toLocaleString()}`,
              },
            ]}
          />

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
            <div className="bg-zinc-100 dark:bg-zinc-800/60 font-semibold px-3 py-2 text-zinc-700 dark:text-zinc-300 grid grid-cols-3">
              <span>Bracket</span>
              <span className="text-center">Rate</span>
              <span className="text-right">Tax</span>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-40 overflow-y-auto">
              {slabBreakdown.map((s, idx) => (
                <div key={idx} className="px-3 py-1.5 grid grid-cols-3 text-zinc-600 dark:text-zinc-400">
                  <span className="truncate">{s.range}</span>
                  <span className="text-center font-mono">{s.rate}</span>
                  <span className="text-right font-medium text-zinc-900 dark:text-zinc-200">
                    ₹{s.tax.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <CalcChart
            title="Tax Liability per Bracket"
            data={chartData}
            series={[
              {
                key: "taxOwed",
                name: "Tax Owed (₹)",
                color: "#f59e0b",
                gradientId: "taxGrad",
              },
            ]}
          />
        </div>
      )}
    </CalcCard>
  );
}
