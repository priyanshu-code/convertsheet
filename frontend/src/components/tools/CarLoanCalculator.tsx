"use client";

import React, { useState, useMemo } from "react";
import { Car } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcPromptButton,
  CalcPdfReportButton,
  CalcSaveButton,
  CalcShareButton,
  CarLeaseVsBuyMatrix,
  CarLoanEarlyPayoffCard,
} from "@/components/calculator";
import { calculateCarLoan } from "@/lib/engines/financial-engine";
import { generateCarLoanDossierPdf } from "@/lib/engines/pdf-dossier-engine";
import { AutoLoanRatesCard } from "@/components/finance";

export interface CarLoanCalculatorProps {
  initialValues?: Partial<{
    vehiclePrice: number;
    downPayment: number;
    tradeInValue: number;
    interestRate: number;
    loanTermMonths: number;
    salesTaxPercent: number;
    dealerFees: number;
  }>;
}

export function CarLoanCalculator({ initialValues }: CarLoanCalculatorProps = {}) {
  const [vehiclePrice, setVehiclePrice] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("vehiclePrice");
      if (q) return Number(q);
    }
    return Number(initialValues?.vehiclePrice) || 35000;
  });

  const [downPayment, setDownPayment] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("downPayment");
      if (q) return Number(q);
    }
    return Number(initialValues?.downPayment) || 5000;
  });

  const [tradeInValue, setTradeInValue] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("tradeInValue");
      if (q) return Number(q);
    }
    return Number(initialValues?.tradeInValue) ?? 3000;
  });

  const [interestRate, setInterestRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("interestRate");
      if (q) return Number(q);
    }
    return Number(initialValues?.interestRate) || 5.9;
  });

  const [loanTermMonths, setLoanTermMonths] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("loanTermMonths");
      if (q) return Number(q);
    }
    return Number(initialValues?.loanTermMonths) || 60;
  });

  const [salesTaxPercent, setSalesTaxPercent] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("salesTaxPercent");
      if (q) return Number(q);
    }
    return Number(initialValues?.salesTaxPercent) ?? 7.0;
  });

  const [dealerFees, setDealerFees] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("dealerFees");
      if (q) return Number(q);
    }
    return Number(initialValues?.dealerFees) ?? 500;
  });

  const carLoan = useMemo(() => {
    return calculateCarLoan({
      vehiclePrice,
      downPayment,
      tradeInValue,
      interestRate,
      loanTermMonths,
      salesTaxPercent,
      dealerFees,
    });
  }, [
    vehiclePrice,
    downPayment,
    tradeInValue,
    interestRate,
    loanTermMonths,
    salesTaxPercent,
    dealerFees,
  ]);

  const chartData = useMemo(() => {
    let cumPrincipal = 0;
    return carLoan.yearlySchedule.map((row) => {
      cumPrincipal += row.principal;
      return {
        label: `Yr ${row.year}`,
        balance: row.balance,
        principalPaid: Math.round(cumPrincipal),
        interestPaid: Math.round(row.interest),
      };
    });
  }, [carLoan.yearlySchedule]);

  const exportData = useMemo(() => {
    return carLoan.yearlySchedule.map((row) => ({
      Year: `Year ${row.year}`,
      "Remaining Balance": `$${row.balance.toLocaleString()}`,
      "Principal Paid This Year": `$${row.principal.toLocaleString()}`,
      "Interest Paid This Year": `$${row.interest.toLocaleString()}`,
    }));
  }, [carLoan.yearlySchedule]);

  const aiPrompt = useMemo(() => {
    return `Analyze this auto loan financing scenario:
- Vehicle Price: $${vehiclePrice.toLocaleString()}
- Trade-in Value: $${tradeInValue.toLocaleString()}
- Cash Down Payment: $${downPayment.toLocaleString()}
- Sales Tax: ${salesTaxPercent}% • Fees: $${dealerFees.toLocaleString()}
- Net Financed Loan: $${carLoan.netLoanAmount.toLocaleString()}
- Interest Rate (APR): ${interestRate}%
- Loan Term: ${loanTermMonths} months (${loanTermMonths / 12} years)
- Monthly Car Payment: $${carLoan.monthlyPayment.toLocaleString()}
- Total Interest Cost: $${carLoan.totalInterest.toLocaleString()}
- Total True Vehicle Cost: $${carLoan.totalCost.toLocaleString()}

Please provide an analysis on whether taking a shorter loan term (e.g. 48 vs 60/72 months) or paying cash upfront would save significant interest.`;
  }, [
    vehiclePrice,
    tradeInValue,
    downPayment,
    salesTaxPercent,
    dealerFees,
    carLoan,
    interestRate,
    loanTermMonths,
  ]);

  return (
    <div className="space-y-8">
      <CalcCard
        title="Auto Loan & Car Payment Calculator"
      subtitle="Calculate your monthly car payment, total interest, sales taxes, and net financed amount with visual payoff curves."
      icon={Car}
      badge="SheetJS Export"
    >
      <div className="space-y-6">
        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalcInput
            id="car-price"
            label="Vehicle Purchase Price"
            value={vehiclePrice}
            onChange={(val) => setVehiclePrice(Number(val) || 0)}
            type="number"
            min={1000}
            step={500}
            prefix="$"
          />

          <div className="space-y-1">
            <CalcInput
              id="car-down-payment"
              label="Cash Down Payment"
              value={downPayment}
              onChange={(val) => setDownPayment(Number(val) || 0)}
              type="number"
              min={0}
              step={500}
              prefix="$"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[0, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDownPayment(amt)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                    downPayment === amt
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <CalcInput
            id="car-trade-in"
            label="Trade-in Value / Allowance"
            value={tradeInValue}
            onChange={(val) => setTradeInValue(Number(val) || 0)}
            type="number"
            min={0}
            step={500}
            prefix="$"
            helpText="Subtracted from taxable price"
          />

          <CalcInput
            id="car-apr"
            label="Interest Rate (APR %)"
            value={interestRate}
            onChange={(val) => setInterestRate(Number(val) || 0)}
            type="number"
            min={0}
            max={30}
            step={0.1}
            suffix="%"
          />

          <div className="space-y-1">
            <CalcSelect
              id="car-term"
              label="Loan Term"
              value={loanTermMonths.toString()}
              onChange={(val) => setLoanTermMonths(Number(val))}
              options={[
                { label: "36 Months (3 Years)", value: "36" },
                { label: "48 Months (4 Years)", value: "48" },
                { label: "60 Months (5 Years - Standard)", value: "60" },
                { label: "72 Months (6 Years)", value: "72" },
                { label: "84 Months (7 Years)", value: "84" },
              ]}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[36, 48, 60, 72].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLoanTermMonths(m)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                    loanTermMonths === m
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {m} mos
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CalcInput
              id="car-tax-rate"
              label="Sales Tax Rate"
              value={salesTaxPercent}
              onChange={(val) => setSalesTaxPercent(Number(val) || 0)}
              type="number"
              min={0}
              max={20}
              step={0.1}
              suffix="%"
            />

            <CalcInput
              id="car-dealer-fees"
              label="Dealer & Doc Fees"
              value={dealerFees}
              onChange={(val) => setDealerFees(Number(val) || 0)}
              type="number"
              min={0}
              step={50}
              prefix="$"
            />
          </div>
        </div>

        {/* Results */}
        <CalcResult
          title="Financing Summary"
          primaryLabel="Monthly Auto Loan Payment"
          primaryValue={`$${carLoan.monthlyPayment.toLocaleString()}`}
          primarySubtext={`Based on $${carLoan.netLoanAmount.toLocaleString()} financed over ${loanTermMonths} months at ${interestRate}% APR.`}
          copyValue={`Monthly Payment: $${carLoan.monthlyPayment.toLocaleString()}/mo | Net Loan Financed: $${carLoan.netLoanAmount.toLocaleString()} | Total Interest: $${carLoan.totalInterest.toLocaleString()} (${loanTermMonths} months @ ${interestRate}% APR)`}
          items={[
            {
              label: "Net Loan Financed",
              value: `$${carLoan.netLoanAmount.toLocaleString()}`,
            },
            {
              label: "Total Interest Paid",
              value: `$${carLoan.totalInterest.toLocaleString()}`,
              highlight: true,
            },
            {
              label: "Sales Taxes & Fees",
              value: `$${carLoan.totalTaxesAndFees.toLocaleString()}`,
            },
            {
              label: "Total Out-of-Pocket Cost",
              value: `$${carLoan.totalCost.toLocaleString()}`,
            },
          ]}
        />

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <CalcExportButton
              data={exportData}
              filename={`car_loan_schedule_${vehiclePrice}`}
              sheetName="AutoLoan"
              label="Export Loan Schedule (.xlsx)"
            />
            <CalcPdfReportButton
              filename={`auto_loan_dossier_${vehiclePrice}.pdf`}
              label="Download Bank-Ready PDF"
              onGenerate={() =>
                generateCarLoanDossierPdf({
                  vehiclePrice,
                  downPayment,
                  tradeInValue,
                  interestRate,
                  loanTermMonths,
                  monthlyPayment: carLoan.monthlyPayment,
                  totalInterest: carLoan.totalInterest,
                  totalCost: carLoan.totalCost,
                  schedule: carLoan.yearlySchedule.map((row) => ({
                    year: row.year,
                    balance: row.balance,
                    principal: row.principal,
                    interest: row.interest,
                  })),
                })
              }
            />
            <CalcPromptButton prompt={aiPrompt} toolName="Car Loan Advice" />
            <CalcSaveButton
              toolSlug="car-loan-calculator"
              toolName="Car Loan Calculator"
              summaryTitle={`$${vehiclePrice.toLocaleString()} Car Loan (${loanTermMonths} mo @ ${interestRate}%)`}
              summaryMetrics={[
                { label: "Monthly Payment", value: `$${carLoan.monthlyPayment.toLocaleString()}/mo` },
                { label: "Vehicle Price", value: `$${vehiclePrice.toLocaleString()}` },
                { label: "Total Interest", value: `$${carLoan.totalInterest.toLocaleString()}` },
                { label: "Term", value: `${loanTermMonths} Months` },
              ]}
            />
            <CalcShareButton
              state={{
                vehiclePrice,
                downPayment,
                tradeInValue,
                interestRate,
                loanTermMonths,
                salesTaxPercent,
                dealerFees,
              }}
              label="Share Auto Loan"
            />
          </div>
        </div>

        {/* Amortization Chart */}
        <CalcChart
          title="Auto Loan Payoff & Principal Balance Reduction"
          data={chartData}
          series={[
            {
              key: "balance",
              name: "Remaining Loan Balance",
              color: "#EF4444",
              gradientId: "carBalanceGrad",
            },
            {
              key: "principalPaid",
              name: "Principal Paid",
              color: "#10B981",
              gradientId: "carPrincGrad",
            },
            {
              key: "interestPaid",
              name: "Interest Paid",
              color: "#F59E0B",
              gradientId: "carIntGrad",
            },
          ]}
        />
      </div>
    </CalcCard>

    <CarLoanEarlyPayoffCard
      loanAmount={carLoan.netLoanAmount}
      interestRate={interestRate}
      loanTermMonths={loanTermMonths}
    />

    <CarLeaseVsBuyMatrix
      vehiclePrice={vehiclePrice}
      downPayment={downPayment}
      tradeInValue={tradeInValue}
      interestRate={interestRate}
      loanTermMonths={loanTermMonths}
      salesTaxPercent={salesTaxPercent}
      dealerFees={dealerFees}
    />

    <AutoLoanRatesCard financedAmount={carLoan.netLoanAmount} loanTermMonths={loanTermMonths} />
  </div>
  );
}
