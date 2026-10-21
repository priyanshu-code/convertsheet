"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Receipt, ShieldCheck, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
  CalcShareButton,
  CalcSaveButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export interface IncomeTaxCalculatorProps {
  initialValues?: Partial<{
    regime: "US" | "IN";
    // US fields
    grossIncomeUs: number;
    filingStatus: "single" | "married";
    customDeductionsUs: number;
    // India fields
    annualIncomeIn: number;
    standardDeductionIn: number;
    otherDeductionsIn: number;
  }>;
}

export function IncomeTaxCalculator({ initialValues }: IncomeTaxCalculatorProps = {}) {
  const currencyCtx = useCurrency();
  const detectedMarket = currencyCtx?.market;

  // Detect region: if market === "IN" default regime to "IN", otherwise default to "US"
  const [regime, setRegime] = useState<"US" | "IN">(() => {
    if (initialValues?.regime) return initialValues.regime;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("regime");
      if (q === "US" || q === "IN") return q;
    }
    return detectedMarket === "IN" ? "IN" : "US";
  });

  // ==========================================
  // US MODE STATE
  // ==========================================
  const [grossIncomeUs, setGrossIncomeUs] = useState<number>(() => {
    if (initialValues?.grossIncomeUs !== undefined) return initialValues.grossIncomeUs;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("grossIncomeUs");
      if (q) return Number(q);
    }
    return 100000;
  });

  const [filingStatus, setFilingStatus] = useState<"single" | "married">(() => {
    if (initialValues?.filingStatus !== undefined) return initialValues.filingStatus;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("filingStatus");
      if (q === "single" || q === "married") return q;
    }
    return "single";
  });

  const [customDeductionsUs, setCustomDeductionsUs] = useState<number>(() => {
    if (initialValues?.customDeductionsUs !== undefined) return initialValues.customDeductionsUs;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("customDeductionsUs");
      if (q) return Number(q);
    }
    return 0;
  });

  // ==========================================
  // INDIA MODE STATE
  // ==========================================
  const [annualIncomeIn, setAnnualIncomeIn] = useState<number>(() => {
    if (initialValues?.annualIncomeIn !== undefined) return initialValues.annualIncomeIn;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("annualIncome");
      if (q) return Number(q);
    }
    return 1500000;
  });

  const [standardDeductionIn, setStandardDeductionIn] = useState<number>(() => {
    if (initialValues?.standardDeductionIn !== undefined) return initialValues.standardDeductionIn;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("standardDeduction");
      if (q) return Number(q);
    }
    return 75000;
  });

  const [otherDeductionsIn, setOtherDeductionsIn] = useState<number>(() => {
    if (initialValues?.otherDeductionsIn !== undefined) return initialValues.otherDeductionsIn;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("otherDeductions");
      if (q) return Number(q);
    }
    return 50000;
  });

  // ==========================================
  // US TAX COMPUTATION
  // ==========================================
  const usTaxResult = useMemo(() => {
    const gross = Math.max(0, grossIncomeUs);
    const standardDeduction = filingStatus === "married" ? 29200 : 14600;
    const additionalDeductions = Math.max(0, customDeductionsUs);
    const taxable = Math.max(0, gross - standardDeduction - additionalDeductions);

    const singleBrackets = [
      { range: "Up to $11,600", rate: "10%", rateNum: 0.10, min: 0, max: 11600 },
      { range: "$11,601 - $47,150", rate: "12%", rateNum: 0.12, min: 11600, max: 47150 },
      { range: "$47,151 - $100,525", rate: "22%", rateNum: 0.22, min: 47150, max: 100525 },
      { range: "$100,526 - $191,950", rate: "24%", rateNum: 0.24, min: 100525, max: 191950 },
      { range: "$191,951 - $243,725", rate: "32%", rateNum: 0.32, min: 191950, max: 243725 },
      { range: "$243,726 - $609,350", rate: "35%", rateNum: 0.35, min: 243725, max: 609350 },
      { range: "Above $609,350", rate: "37%", rateNum: 0.37, min: 609350, max: Infinity },
    ];

    const marriedBrackets = [
      { range: "Up to $23,200", rate: "10%", rateNum: 0.10, min: 0, max: 23200 },
      { range: "$23,201 - $94,300", rate: "12%", rateNum: 0.12, min: 23200, max: 94300 },
      { range: "$94,301 - $201,050", rate: "22%", rateNum: 0.22, min: 94300, max: 201050 },
      { range: "$201,051 - $383,900", rate: "24%", rateNum: 0.24, min: 201050, max: 383900 },
      { range: "$383,901 - $487,450", rate: "32%", rateNum: 0.32, min: 383900, max: 487450 },
      { range: "$487,451 - $731,200", rate: "35%", rateNum: 0.35, min: 487450, max: 731200 },
      { range: "Above $731,200", rate: "37%", rateNum: 0.37, min: 731200, max: Infinity },
    ];

    const activeBrackets = filingStatus === "married" ? marriedBrackets : singleBrackets;

    let totalTax = 0;
    let marginalRate = 0;

    const breakdown = activeBrackets.map((bracket) => {
      let taxedPortion = 0;
      if (taxable > bracket.min) {
        taxedPortion = Math.min(taxable, bracket.max) - bracket.min;
        marginalRate = bracket.rateNum * 100;
      }
      const bracketTax = taxedPortion * bracket.rateNum;
      totalTax += bracketTax;
      return {
        range: bracket.range,
        rate: bracket.rate,
        taxedAmount: Math.round(taxedPortion),
        tax: Math.round(bracketTax),
      };
    });

    const netAfterTaxIncome = Math.max(0, gross - totalTax);
    const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0;

    return {
      gross,
      standardDeduction,
      additionalDeductions,
      taxableIncome: Math.round(taxable),
      slabBreakdown: breakdown,
      totalFederalTax: Math.round(totalTax),
      effectiveTaxRate: Number(effectiveRate.toFixed(2)),
      marginalRate,
      netAfterTaxIncome: Math.round(netAfterTaxIncome),
    };
  }, [grossIncomeUs, filingStatus, customDeductionsUs]);

  // ==========================================
  // INDIA TAX COMPUTATION
  // ==========================================
  const inTaxResult = useMemo(() => {
    const gross = Math.max(0, annualIncomeIn);
    const deductions = Math.max(0, standardDeductionIn) + Math.max(0, otherDeductionsIn);
    const taxable = Math.max(0, gross - deductions);

    const slabs = [
      { range: "Up to ₹3,00,000", rate: "0%", min: 0, max: 300000, rateNum: 0 },
      { range: "₹3,00,001 - ₹7,00,000", rate: "5%", min: 300000, max: 700000, rateNum: 0.05 },
      { range: "₹7,00,001 - ₹10,00,000", rate: "10%", min: 700000, max: 1000000, rateNum: 0.10 },
      { range: "₹10,00,001 - ₹12,00,000", rate: "15%", min: 1000000, max: 1200000, rateNum: 0.15 },
      { range: "₹12,00,001 - ₹15,00,000", rate: "20%", min: 1200000, max: 1500000, rateNum: 0.20 },
      { range: "Above ₹15,00,000", rate: "30%", min: 1500000, max: Infinity, rateNum: 0.30 },
    ];

    let baseTax = 0;
    let marginalRate = 0;

    const computedSlabs = slabs.map((slab) => {
      let taxedPortion = 0;
      if (taxable > slab.min) {
        taxedPortion = Math.min(taxable, slab.max) - slab.min;
        marginalRate = slab.rateNum * 100;
      }
      const slabTax = taxedPortion * slab.rateNum;
      baseTax += slabTax;
      return {
        range: slab.range,
        rate: slab.rate,
        taxedAmount: Math.round(taxedPortion),
        tax: Math.round(slabTax),
      };
    });

    // Section 87A rebate and marginal relief under New Tax Regime (Section 115BAC):
    // Full rebate up to ₹25,000 for taxable income <= ₹7,00,000.
    // Marginal relief: tax payable cannot exceed taxable income in excess of ₹7,00,000.
    let rebate87A = 0;
    if (taxable <= 700000) {
      rebate87A = Math.min(baseTax, 25000);
    } else if (baseTax > (taxable - 700000)) {
      rebate87A = Math.max(0, baseTax - (taxable - 700000));
    }
    const taxAfterRebate = Math.max(0, baseTax - rebate87A);
    const cess = taxAfterRebate * 0.04;
    const finalTax = taxAfterRebate + cess;
    const netAfterTaxIncome = Math.max(0, gross - finalTax);
    const effectiveRate = gross > 0 ? (finalTax / gross) * 100 : 0;

    return {
      gross,
      taxableIncome: Math.round(taxable),
      slabBreakdown: computedSlabs,
      totalBaseTax: Math.round(baseTax),
      rebate87A: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      cessAmount: Math.round(cess),
      totalTaxPayable: Math.round(finalTax),
      effectiveTaxRate: Number(effectiveRate.toFixed(2)),
      marginalRate,
      netAfterTaxIncome: Math.round(netAfterTaxIncome),
    };
  }, [annualIncomeIn, standardDeductionIn, otherDeductionsIn]);

  // ==========================================
  // CHART DATA
  // ==========================================
  const chartData = useMemo(() => {
    const activeBreakdown = regime === "US" ? usTaxResult.slabBreakdown : inTaxResult.slabBreakdown;
    return activeBreakdown
      .filter((s) => s.tax > 0)
      .map((s) => ({
        label: s.rate,
        taxOwed: s.tax,
      }));
  }, [regime, usTaxResult, inTaxResult]);

  // ==========================================
  // EXPORT SCHEDULE
  // ==========================================
  const exportSchedule = useMemo(() => {
    if (regime === "US") {
      return [
        { Metric: "Gross Annual Income", Value: usTaxResult.gross },
        { Metric: "Filing Status", Value: filingStatus === "married" ? "Married Filing Jointly" : "Single" },
        { Metric: "Standard Deduction", Value: usTaxResult.standardDeduction },
        { Metric: "Additional Itemized/Other Deductions", Value: usTaxResult.additionalDeductions },
        { Metric: "Taxable Income", Value: usTaxResult.taxableIncome },
        ...usTaxResult.slabBreakdown.map((s) => ({
          Metric: `Bracket ${s.range} (${s.rate})`,
          Value: s.tax,
        })),
        { Metric: "Total Federal Tax Payable", Value: usTaxResult.totalFederalTax },
        { Metric: "Effective Tax Rate (%)", Value: usTaxResult.effectiveTaxRate },
        { Metric: "Marginal Tax Bracket (%)", Value: usTaxResult.marginalRate },
        { Metric: "Net After-Tax Income", Value: usTaxResult.netAfterTaxIncome },
      ];
    }
    return [
      { Metric: "Gross Annual Income", Value: inTaxResult.gross },
      { Metric: "Standard Deduction", Value: standardDeductionIn },
      { Metric: "Other Deductions", Value: otherDeductionsIn },
      { Metric: "Net Taxable Income", Value: inTaxResult.taxableIncome },
      ...inTaxResult.slabBreakdown.map((s) => ({
        Metric: `Bracket ${s.range} (${s.rate})`,
        Value: s.tax,
      })),
      { Metric: "Base Income Tax", Value: inTaxResult.totalBaseTax },
      { Metric: "Section 87A Tax Rebate", Value: inTaxResult.rebate87A },
      { Metric: "4% Health & Education Cess", Value: inTaxResult.cessAmount },
      { Metric: "Total Tax Liability", Value: inTaxResult.totalTaxPayable },
      { Metric: "Effective Tax Rate (%)", Value: inTaxResult.effectiveTaxRate },
      { Metric: "Net After-Tax Income", Value: inTaxResult.netAfterTaxIncome },
    ];
  }, [regime, usTaxResult, filingStatus, inTaxResult, standardDeductionIn, otherDeductionsIn]);

  // ==========================================
  // LLM PROMPT
  // ==========================================
  const llmPrompt = useMemo(() => {
    if (regime === "US") {
      return `Analyze my progressive US Federal income tax liability (Tax Year 2024):
- Gross Annual Income: $${usTaxResult.gross.toLocaleString()}
- Filing Status: ${filingStatus === "married" ? "Married Filing Jointly" : "Single"}
- Standard Deduction: $${usTaxResult.standardDeduction.toLocaleString()}
- Additional Deductions: $${usTaxResult.additionalDeductions.toLocaleString()}
- Taxable Income: $${usTaxResult.taxableIncome.toLocaleString()}
- Total Federal Tax Payable: $${usTaxResult.totalFederalTax.toLocaleString()}
- Effective Tax Rate: ${usTaxResult.effectiveTaxRate}%
- Marginal Tax Bracket: ${usTaxResult.marginalRate}%
- Net After-Tax Income: $${usTaxResult.netAfterTaxIncome.toLocaleString()}

Please evaluate tax reduction strategies (Traditional IRA / 401(k), HSA contributions, itemized deductions vs standard deduction) and advise on quarterly estimated taxes.`;
    }
    return `Analyze my progressive income tax liability under India's New Tax Regime (FY 2024-25 / AY 2025-26):
- Gross Annual Income: ₹${inTaxResult.gross.toLocaleString()}
- Standard Deduction: ₹${standardDeductionIn.toLocaleString()}
- Other Deductions: ₹${otherDeductionsIn.toLocaleString()}
- Net Taxable Income: ₹${inTaxResult.taxableIncome.toLocaleString()}
- Section 87A Rebate: ₹${inTaxResult.rebate87A.toLocaleString()}
- 4% Health & Education Cess: ₹${inTaxResult.cessAmount.toLocaleString()}
- Total Tax Payable: ₹${inTaxResult.totalTaxPayable.toLocaleString()}
- Effective Tax Rate: ${inTaxResult.effectiveTaxRate}%
- Net After-Tax Income: ₹${inTaxResult.netAfterTaxIncome.toLocaleString()}

Please evaluate whether the Old Regime or New Regime is better for this income level, and suggest tax optimization maneuvers.`;
  }, [regime, usTaxResult, filingStatus, inTaxResult, standardDeductionIn, otherDeductionsIn]);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("regime", regime);
    if (regime === "US") {
      params.set("grossIncomeUs", grossIncomeUs.toString());
      params.set("filingStatus", filingStatus);
      params.set("customDeductionsUs", customDeductionsUs.toString());
      params.delete("annualIncome");
      params.delete("standardDeduction");
      params.delete("otherDeductions");
    } else {
      params.set("annualIncome", annualIncomeIn.toString());
      params.set("standardDeduction", standardDeductionIn.toString());
      params.set("otherDeductions", otherDeductionsIn.toString());
      params.delete("grossIncomeUs");
      params.delete("filingStatus");
      params.delete("customDeductionsUs");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [regime, grossIncomeUs, filingStatus, customDeductionsUs, annualIncomeIn, standardDeductionIn, otherDeductionsIn]);

  const handleExportExcel = () => {
    try {
      const summaryRows: (string | number)[][] = [
        ["ConvertSheet - Income Tax Liability & Progressive Bracket Model", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/income-tax-calculator"],
        ["", ""],
      ];

      if (regime === "US") {
        summaryRows.push(
          ["--- US FEDERAL TAX PARAMETERS (TY 2024 / 2025) ---", ""],
          ["Gross Annual Income ($)", usTaxResult.gross],
          ["Filing Status", filingStatus === "married" ? "Married Filing Jointly" : "Single"],
          ["Standard Deduction ($)", usTaxResult.standardDeduction],
          ["Additional Itemized / Other Deductions ($)", usTaxResult.additionalDeductions],
          ["Taxable Income ($)", usTaxResult.taxableIncome],
          ["", ""],
          ["--- PROGRESSIVE BRACKET BREAKDOWN ---", ""],
          ...usTaxResult.slabBreakdown.map((s) => [`Bracket ${s.range} (${s.rate})`, s.tax]),
          ["", ""],
          ["--- FINAL TAX LIABILITY & TAKE-HOME ---", ""],
          ["Total Federal Tax Payable ($)", usTaxResult.totalFederalTax],
          ["Effective Tax Rate (%)", usTaxResult.effectiveTaxRate],
          ["Marginal Tax Bracket (%)", usTaxResult.marginalRate],
          ["Net After-Tax Income ($)", usTaxResult.netAfterTaxIncome],
          ["Monthly Net Take-Home ($/mo)", Math.round(usTaxResult.netAfterTaxIncome / 12)]
        );
      } else {
        summaryRows.push(
          ["--- INDIA NEW TAX REGIME PARAMETERS (FY 2024-25 / AY 2025-26) ---", ""],
          ["Gross Annual CTC (₹)", inTaxResult.gross],
          ["Standard Deduction (₹)", standardDeductionIn],
          ["Other Deductions (₹)", otherDeductionsIn],
          ["Taxable Income (₹)", inTaxResult.taxableIncome],
          ["", ""],
          ["--- PROGRESSIVE TAX SLAB BREAKDOWN ---", ""],
          ...inTaxResult.slabBreakdown.map((s) => [`Slab ${s.range} (${s.rate})`, s.tax]),
          ["", ""],
          ["--- FINAL TAX LIABILITY & NET IN-HAND ---", ""],
          ["Base Income Tax (₹)", inTaxResult.totalBaseTax],
          ["Section 87A Tax Rebate (₹)", inTaxResult.rebate87A],
          ["4% Health & Education Cess (₹)", inTaxResult.cessAmount],
          ["Total Tax Payable (₹)", inTaxResult.totalTaxPayable],
          ["Effective Tax Rate (%)", inTaxResult.effectiveTaxRate],
          ["Net Annual Post-Tax Income (₹)", inTaxResult.netAfterTaxIncome],
          ["Net Monthly In-Hand (₹/mo)", Math.round(inTaxResult.netAfterTaxIncome / 12)]
        );
      }

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "TaxSchedule");
      XLSX.writeFile(
        wb,
        regime === "US"
          ? `ConvertSheet_US_Federal_Tax_${grossIncomeUs}_${filingStatus}.xlsx`
          : `ConvertSheet_India_Tax_${annualIncomeIn}_NewRegime.xlsx`
      );
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
      </div>

      {/* Market Rate & Tax Benchmark Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          {regime === "US"
            ? "Updated for 2026 IRS Tax Year: Standard Deduction ($15,000 Single / $30,000 Married) • 7 Progressive Federal Brackets (10% to 37%)"
            : "Updated for India FY 2024-26 Budget: New Tax Regime Slabs • Section 87A Full Tax Rebate up to ₹7 Lakh • Standard Deduction ₹75,000"}
        </span>
      </div>

      <CalcCard
        title={
          regime === "US"
            ? "US Federal Income Tax Bracket Calculator (2024-2026)"
            : "Income Tax Slab Calculator (India FY 2024-25)"
        }
        subtitle={
          regime === "US"
            ? "Calculate progressive 2024-2026 US Federal Income Tax across all 7 tax brackets with standard deduction, effective tax rate, and net after-tax income."
            : "Calculate income tax liability under India's New Tax Regime (Section 115BAC) with ₹75,000 standard deduction, 87A rebate, progressive slabs, and 4% health & education cess."
        }
        icon={Receipt}
        badge={regime === "US" ? "United States • Federal 2026" : "India • FY 2024-26"}
      >
        {/* Country pill switcher */}
        <div className="flex items-center justify-start pb-2">
          <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setRegime("US")}
              className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                regime === "US"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>🇺🇸</span>
              <span>United States (Federal)</span>
            </button>
            <button
              type="button"
              onClick={() => setRegime("IN")}
              className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                regime === "IN"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>🇮🇳</span>
              <span>India (FY 2024-25)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Inputs */}
          <div className="space-y-6">
            {regime === "US" ? (
              <>
                <div className="space-y-3">
                  <CalcInput
                    id="gross-income-us"
                    label="Gross Annual Income"
                    value={grossIncomeUs}
                    onChange={(val) => setGrossIncomeUs(Number(val) || 0)}
                    prefix="$"
                    min={0}
                    step={5000}
                    helpText="W-2 wages, self-employment earnings, or total annual taxable revenue"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick:</span>
                    {[
                      { label: "$50k", val: 50000 },
                      { label: "$75k", val: 75000 },
                      { label: "$100k", val: 100000 },
                      { label: "$150k", val: 150000 },
                      { label: "$250k", val: 250000 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setGrossIncomeUs(p.val)}
                        className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          grossIncomeUs === p.val
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <CalcSlider
                    id="gross-income-us-slider"
                    label="Gross Annual Income Slider"
                    ariaLabel="Gross Annual Income Slider"
                    value={grossIncomeUs}
                    min={10000}
                    max={500000}
                    step={5000}
                    prefix="$"
                    onChange={setGrossIncomeUs}
                  />
                </div>
                <CalcSelect
                  id="filing-status"
                  label="Filing Status"
                  value={filingStatus}
                  onChange={(val) => setFilingStatus(val as "single" | "married")}
                  options={[
                    { value: "single", label: "Single ($14,600 Std Deduction)" },
                    { value: "married", label: "Married Filing Jointly ($29,200 Std Deduction)" },
                  ]}
                  helperText="Determines statutory standard deduction and tax bracket boundaries"
                />
                <CalcInput
                  id="custom-deductions-us"
                  label="Custom Itemized / Additional Deductions"
                  value={customDeductionsUs}
                  onChange={(val) => setCustomDeductionsUs(Number(val) || 0)}
                  prefix="$"
                  min={0}
                  step={1000}
                  helpText="Optional additional adjustments (e.g. IRA, HSA, or excess itemized deductions above standard)"
                />
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <CalcInput
                    id="annual-income-in"
                    label="Gross Annual Income"
                    value={annualIncomeIn}
                    onChange={(val) => setAnnualIncomeIn(Number(val) || 0)}
                    prefix="₹"
                    min={100000}
                    step={50000}
                    helpText="Total gross annual CTC or total taxable income"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick:</span>
                    {[
                      { label: "₹8L", val: 800000 },
                      { label: "₹12L", val: 1200000 },
                      { label: "₹15L", val: 1500000 },
                      { label: "₹20L", val: 2000000 },
                      { label: "₹30L", val: 3000000 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setAnnualIncomeIn(p.val)}
                        className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          annualIncomeIn === p.val
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <CalcSlider
                    id="annual-income-in-slider"
                    label="Gross Annual CTC Slider"
                    ariaLabel="Gross Annual CTC Slider"
                    value={annualIncomeIn}
                    min={250000}
                    max={5000000}
                    step={50000}
                    prefix="₹"
                    onChange={setAnnualIncomeIn}
                  />
                </div>
                <CalcInput
                  id="standard-deduction-in"
                  label="Standard Deduction"
                  value={standardDeductionIn}
                  onChange={(val) => setStandardDeductionIn(Number(val) || 0)}
                  prefix="₹"
                  min={0}
                  step={5000}
                  helpText="Statutory deduction (₹75,000 for salaried under Budget 2024)"
                />
                <CalcInput
                  id="other-deductions-in"
                  label="Other Exemptions / Deductions"
                  value={otherDeductionsIn}
                  onChange={(val) => setOtherDeductionsIn(Number(val) || 0)}
                  prefix="₹"
                  min={0}
                  step={5000}
                  helpText="Employer NPS (80CCD(2)) or other permissible deductions"
                />
              </>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <CalcSaveButton
                toolSlug="income-tax-calculator"
                toolName="Income Tax Calculator"
                summaryTitle={
                  regime === "US"
                    ? `US Tax: $${usTaxResult.gross.toLocaleString()} Income (Payable: $${usTaxResult.totalFederalTax.toLocaleString()})`
                    : `India Tax: ₹${inTaxResult.gross.toLocaleString()} Income (Payable: ₹${inTaxResult.totalTaxPayable.toLocaleString()})`
                }
                summaryMetrics={
                  regime === "US"
                    ? [
                        { label: "Federal Tax", value: `$${usTaxResult.totalFederalTax.toLocaleString()}` },
                        { label: "Effective Rate", value: `${usTaxResult.effectiveTaxRate}%` },
                        { label: "Taxable Income", value: `$${usTaxResult.taxableIncome.toLocaleString()}` },
                        { label: "After-Tax Income", value: `$${usTaxResult.netAfterTaxIncome.toLocaleString()}` },
                      ]
                    : [
                        { label: "Tax Payable", value: `₹${inTaxResult.totalTaxPayable.toLocaleString()}` },
                        { label: "Effective Rate", value: `${inTaxResult.effectiveTaxRate}%` },
                        { label: "Taxable Income", value: `₹${inTaxResult.taxableIncome.toLocaleString()}` },
                        { label: "Cess (4%)", value: `₹${inTaxResult.cessAmount.toLocaleString()}` },
                      ]
                }
              />
              <CalcShareButton
                state={
                  regime === "US"
                    ? {
                        regime: "US",
                        grossIncomeUs,
                        filingStatus,
                        customDeductionsUs,
                      }
                    : {
                        regime: "IN",
                        annualIncome: annualIncomeIn,
                        standardDeduction: standardDeductionIn,
                        otherDeductions: otherDeductionsIn,
                      }
                }
                label="Share Tax Scenario"
              />
              <CalcSaveButton
                toolSlug="income-tax-calculator"
                toolName="Income Tax Bracket Calculator"
                label="Save Calculation"
                summaryTitle={
                  regime === "US"
                    ? `US Tax: $${usTaxResult.gross.toLocaleString()} (${filingStatus})`
                    : `India Tax: ₹${inTaxResult.gross.toLocaleString()} (New Regime)`
                }
                summaryMetrics={
                  regime === "US"
                    ? [
                        { label: "Tax Payable", value: `$${usTaxResult.totalFederalTax.toLocaleString()}` },
                        { label: "Effective Rate", value: `${usTaxResult.effectiveTaxRate}%` },
                        { label: "Net Take-Home", value: `$${usTaxResult.netAfterTaxIncome.toLocaleString()}` },
                      ]
                    : [
                        { label: "Tax Payable", value: `₹${inTaxResult.totalTaxPayable.toLocaleString()}` },
                        { label: "Effective Rate", value: `${inTaxResult.effectiveTaxRate}%` },
                        { label: "Net In-Hand", value: `₹${inTaxResult.netAfterTaxIncome.toLocaleString()}` },
                      ]
                }
              />
              <CalcPromptButton promptText={llmPrompt} />
              <button
                type="button"
                onClick={handleExportExcel}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Formulaic Excel</span>
              </button>
              <CalcExportButton
                data={exportSchedule}
                filename={regime === "US" ? "us-federal-tax-schedule" : "india-income-tax-schedule"}
                sheetName="Tax Calculation"
              />
            </div>
          </div>

        {/* Right Results */}
        <div className="space-y-4">
          {regime === "US" ? (
            <>
              <CalcResult
                title="Federal Tax Liability Summary"
                primaryLabel="Total Federal Tax Payable"
                primaryValue={`$${usTaxResult.totalFederalTax.toLocaleString()}`}
                primarySubtext={`Effective Tax Rate: ${usTaxResult.effectiveTaxRate}% | Marginal Bracket: ${usTaxResult.marginalRate}%`}
                copyValue={`US Federal Tax: $${usTaxResult.totalFederalTax.toLocaleString()} on $${grossIncomeUs.toLocaleString()} gross income (Effective: ${usTaxResult.effectiveTaxRate}%, Marginal: ${usTaxResult.marginalRate}%) | After-Tax Income: $${usTaxResult.netAfterTaxIncome.toLocaleString()}`}
                items={[
                  {
                    label: "Taxable Income",
                    value: `$${usTaxResult.taxableIncome.toLocaleString()}`,
                    highlight: true,
                  },
                  {
                    label: "Net After-Tax Income",
                    value: `$${usTaxResult.netAfterTaxIncome.toLocaleString()}`,
                    highlight: true,
                  },
                  {
                    label: "Standard Deduction",
                    value: `$${usTaxResult.standardDeduction.toLocaleString()}`,
                  },
                  {
                    label: "Additional Deductions",
                    value: `$${usTaxResult.additionalDeductions.toLocaleString()}`,
                  },
                  {
                    label: "Marginal Rate",
                    value: `${usTaxResult.marginalRate}%`,
                  },
                  {
                    label: "Effective Rate",
                    value: `${usTaxResult.effectiveTaxRate}%`,
                  },
                ]}
              />

              {/* 7 Federal Tax Brackets Breakdown Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                <div className="bg-zinc-100 dark:bg-zinc-800/60 font-semibold px-3 py-2 text-zinc-700 dark:text-zinc-300 grid grid-cols-4">
                  <span className="col-span-2">Tax Bracket</span>
                  <span className="text-center">Rate</span>
                  <span className="text-right">Tax Owed</span>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-56 overflow-y-auto">
                  {usTaxResult.slabBreakdown.map((s, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 grid grid-cols-4 items-center ${
                        s.taxedAmount > 0
                          ? "text-zinc-800 dark:text-zinc-200 bg-amber-50/40 dark:bg-amber-950/20"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      <div className="col-span-2 truncate">
                        <span className="font-medium">{s.range}</span>
                        {s.taxedAmount > 0 && (
                          <span className="block text-[10px] text-zinc-600 dark:text-zinc-300">
                            Portion: ${s.taxedAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-center font-mono font-medium">{s.rate}</span>
                      <span className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                        ${s.tax.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <CalcResult
                title="Tax Liability Summary"
                primaryLabel="Total Tax Payable"
                primaryValue={`₹${inTaxResult.totalTaxPayable.toLocaleString()}`}
                primarySubtext={`Effective Tax Rate: ${inTaxResult.effectiveTaxRate}%`}
                copyValue={`India Income Tax: ₹${inTaxResult.totalTaxPayable.toLocaleString()} on ₹${annualIncomeIn.toLocaleString()} income (Effective: ${inTaxResult.effectiveTaxRate}%) | Net After-Tax: ₹${inTaxResult.netAfterTaxIncome.toLocaleString()} | Taxable: ₹${inTaxResult.taxableIncome.toLocaleString()}`}
                items={[
                  {
                    label: "Net Taxable Income",
                    value: `₹${inTaxResult.taxableIncome.toLocaleString()}`,
                    highlight: true,
                  },
                  {
                    label: "Net After-Tax Income",
                    value: `₹${inTaxResult.netAfterTaxIncome.toLocaleString()}`,
                    highlight: true,
                  },
                  {
                    label: "Section 87A Rebate",
                    value: `₹${inTaxResult.rebate87A.toLocaleString()}`,
                  },
                  {
                    label: "Health & Edu Cess (4%)",
                    value: `₹${inTaxResult.cessAmount.toLocaleString()}`,
                  },
                  {
                    label: "Base Income Tax",
                    value: `₹${inTaxResult.totalBaseTax.toLocaleString()}`,
                  },
                  {
                    label: "Standard Deduction",
                    value: `₹${standardDeductionIn.toLocaleString()}`,
                  },
                ]}
              />

              {/* India Tax Slab Breakdown Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                <div className="bg-zinc-100 dark:bg-zinc-800/60 font-semibold px-3 py-2 text-zinc-700 dark:text-zinc-300 grid grid-cols-4">
                  <span className="col-span-2">Tax Slab</span>
                  <span className="text-center">Rate</span>
                  <span className="text-right">Tax Owed</span>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-56 overflow-y-auto">
                  {inTaxResult.slabBreakdown.map((s, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 grid grid-cols-4 items-center ${
                        s.taxedAmount > 0
                          ? "text-zinc-800 dark:text-zinc-200 bg-amber-50/40 dark:bg-amber-950/20"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      <div className="col-span-2 truncate">
                        <span className="font-medium">{s.range}</span>
                        {s.taxedAmount > 0 && (
                          <span className="block text-[10px] text-zinc-600 dark:text-zinc-300">
                            Portion: ₹{s.taxedAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-center font-mono font-medium">{s.rate}</span>
                      <span className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                        ₹{s.tax.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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
                name: regime === "US" ? "Tax Owed ($)" : "Tax Owed (₹)",
                color: "#f59e0b",
                gradientId: "taxGrad",
              },
            ]}
          />
        </div>
      )}
    </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            {regime === "US" ? "Federal Tax Payable" : "Total Tax Liability"}
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {regime === "US"
              ? `$${usTaxResult.totalFederalTax.toLocaleString()}`
              : `₹${inTaxResult.totalTaxPayable.toLocaleString()}`}
          </span>
          <span className="text-[11px] text-zinc-500 block">
            {regime === "US"
              ? `Effective: ${usTaxResult.effectiveTaxRate}%`
              : `Effective: ${inTaxResult.effectiveTaxRate}%`}
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}
