"use client";

import React, { useMemo } from "react";
import { Scale, CheckCircle2, Download, HelpCircle, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { calculateCarLeaseVsBuy, CarLeaseVsBuyInput } from "@/lib/engines/financial-engine";

export interface CarLeaseVsBuyMatrixProps {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  interestRate: number;
  loanTermMonths: number;
  salesTaxPercent: number;
  dealerFees: number;
}

export function CarLeaseVsBuyMatrix({
  vehiclePrice,
  downPayment,
  tradeInValue,
  interestRate,
  loanTermMonths,
  salesTaxPercent,
  dealerFees,
}: CarLeaseVsBuyMatrixProps) {
  const comparison = useMemo(() => {
    return calculateCarLeaseVsBuy({
      vehiclePrice,
      downPayment,
      tradeInValue,
      interestRate,
      loanTermMonths: Math.min(loanTermMonths, 48), // lease comparisons typically 36-48 months
      salesTaxPercent,
      dealerFees,
    });
  }, [vehiclePrice, downPayment, tradeInValue, interestRate, loanTermMonths, salesTaxPercent, dealerFees]);

  const handleExportXlsx = () => {
    const rows = [
      { Metric: "Vehicle Purchase Price (MSRP)", "Buying (Auto Loan)": `$${vehiclePrice.toLocaleString()}`, "Leasing": `$${vehiclePrice.toLocaleString()}` },
      { Metric: "Comparison Term", "Buying (Auto Loan)": `${comparison.termMonths} Months`, "Leasing": `${comparison.termMonths} Months` },
      { Metric: "Upfront Cash / Trade-In", "Buying (Auto Loan)": `$${(downPayment + tradeInValue).toLocaleString()}`, "Leasing": `$${(downPayment + tradeInValue).toLocaleString()}` },
      { Metric: "Monthly Payment", "Buying (Auto Loan)": `$${comparison.purchaseMonthlyPayment.toLocaleString()}`, "Leasing": `$${comparison.leaseMonthlyPayment.toLocaleString()}` },
      { Metric: "Total Payments Paid", "Buying (Auto Loan)": `$${comparison.purchaseTotalOutflow.toLocaleString()}`, "Leasing": `$${comparison.leaseTotalOutflow.toLocaleString()}` },
      { Metric: "Total Interest / Finance Fees", "Buying (Auto Loan)": `$${comparison.purchaseTotalInterest.toLocaleString()}`, "Leasing": `$${comparison.leaseFinanceCharges.toLocaleString()}` },
      { Metric: "Vehicle Equity at End of Term", "Buying (Auto Loan)": `$${comparison.purchaseEstimatedEndingEquity.toLocaleString()}`, "Leasing": "$0 (Vehicle Returned)" },
      { Metric: "Net True Cost of Ownership", "Buying (Auto Loan)": `$${comparison.purchaseNetCostOfOwnership.toLocaleString()}`, "Leasing": `$${comparison.leaseNetCostOfOwnership.toLocaleString()}` },
      { Metric: "Mileage Restrictions", "Buying (Auto Loan)": "Unlimited", "Leasing": "12,000 Miles/Year ($0.25/mi overage)" },
      { Metric: "Modifications & Wear Restrictions", "Buying (Auto Loan)": "None (You Own It)", "Leasing": "Strict Excess Wear Charges" },
      { Metric: "Final Financial Verdict", "Buying (Auto Loan)": comparison.longTermFinancialAdvantage === "buy" ? "Winner: Retains Wealth" : "Higher Monthly Outflow", "Leasing": comparison.longTermFinancialAdvantage === "lease" ? "Winner: Lower Total Outflow" : "Zero Equity at Turnover" },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "LeaseVsBuyAnalysis");
    XLSX.writeFile(wb, `lease-vs-buy-car-analysis-${vehiclePrice}.xlsx`);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Lease vs. Buy Side-by-Side Comparison ({comparison.termMonths} Months)
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Compare monthly payments, total out-of-pocket costs, and ending vehicle equity over {comparison.termMonths} months.
          </p>
        </div>
        <button
          onClick={handleExportXlsx}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/60"
        >
          <Download className="h-3.5 w-3.5" />
          Download Comparison (.xlsx)
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buy Column */}
        <div className={`p-4 rounded-xl border transition-all ${
          comparison.longTermFinancialAdvantage === "buy"
            ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20"
            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Option A: Purchase (Loan)
            </span>
            {comparison.longTermFinancialAdvantage === "buy" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Best Long-Term Value
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              ${comparison.purchaseMonthlyPayment.toLocaleString()}
              <span className="text-xs font-normal text-zinc-500"> / month</span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Total Outflow ({comparison.termMonths} mo)</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">${comparison.purchaseTotalOutflow.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Total Interest Paid</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">${comparison.purchaseTotalInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Ending Asset Equity</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">+${comparison.purchaseEstimatedEndingEquity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-900 dark:text-zinc-100 font-bold">Net True Ownership Cost</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">${comparison.purchaseNetCostOfOwnership.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Mileage Restrictions</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">None (Unlimited)</span>
            </div>
          </div>
        </div>

        {/* Lease Column */}
        <div className={`p-4 rounded-xl border transition-all ${
          comparison.longTermFinancialAdvantage === "lease"
            ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20"
            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Option B: Lease (36-Month)
            </span>
            {comparison.monthlyPaymentSavingsWithLease > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                Saves ${comparison.monthlyPaymentSavingsWithLease}/mo Cash Flow
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              ${comparison.leaseMonthlyPayment.toLocaleString()}
              <span className="text-xs font-normal text-zinc-500"> / month</span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Total Outflow ({comparison.termMonths} mo)</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">${comparison.leaseTotalOutflow.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Lease Finance Charges</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">${comparison.leaseFinanceCharges.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Ending Asset Equity</span>
              <span className="font-semibold text-zinc-400">$0 (Car Returned)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-900 dark:text-zinc-100 font-bold">Net True Ownership Cost</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">${comparison.leaseNetCostOfOwnership.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Mileage Restrictions</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">12,000 Miles / Year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Verdict Card */}
      <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            Financial Recommendation: {comparison.verdictSummary}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Leasing offers lower monthly payments for individuals who switch cars every 3 years. Buying builds tangible net worth and removes mileage penalties for drivers planning to keep the vehicle past the loan term.
          </p>
        </div>
      </div>
    </div>
  );
}
