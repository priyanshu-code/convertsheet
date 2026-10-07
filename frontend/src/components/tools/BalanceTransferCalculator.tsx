"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  Percent,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Download,
  IndianRupee,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import {
  calculateBalanceTransfer,
  BalanceTransferInput,
} from "@/lib/engines/financial-engine";
import { generateBalanceTransferDossierPdf } from "@/lib/engines/pdf-dossier-engine";
import * as XLSX from "xlsx";

export interface BalanceTransferCalculatorProps {
  initialValues?: Partial<BalanceTransferInput>;
}

export function BalanceTransferCalculator({
  initialValues,
}: BalanceTransferCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  // State
  const [currentBalance, setCurrentBalance] = useState<number>(
    () => Number(initialValues?.currentBalance) || 5000000
  );
  const [currentRate, setCurrentRate] = useState<number>(
    () => Number(initialValues?.currentRate) || 9.10
  );
  const [newRate, setNewRate] = useState<number>(
    () => Number(initialValues?.newRate) || 8.35
  );
  const [remainingTenureYears, setRemainingTenureYears] = useState<number>(
    () => Number(initialValues?.remainingTenureYears) || 15
  );
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(
    () => Number(initialValues?.processingFeePercent ?? 0.25)
  );
  const [modtStampDutyPercent, setModtStampDutyPercent] = useState<number>(
    () => Number(initialValues?.modtStampDutyPercent ?? 0.20)
  );
  const [otherCharges, setOtherCharges] = useState<number>(
    () => Number(initialValues?.otherCharges ?? 5000)
  );

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Calculation
  const result = useMemo(() => {
    return calculateBalanceTransfer({
      currentBalance,
      currentRate,
      newRate,
      remainingTenureYears,
      processingFeePercent,
      modtStampDutyPercent,
      otherCharges,
    });
  }, [
    currentBalance,
    currentRate,
    newRate,
    remainingTenureYears,
    processingFeePercent,
    modtStampDutyPercent,
    otherCharges,
  ]);

  // Loan presets for quick Indian mortgage amounts
  const loanPresets = [
    { label: "₹30 Lakh", val: 3000000 },
    { label: "₹50 Lakh", val: 5000000 },
    { label: "₹75 Lakh", val: 7500000 },
    { label: "₹1 Crore", val: 10000000 },
  ];

  // State-specific MODT / Stamp Duty presets in India
  const stateModtPresets = [
    { label: "Karnataka / Telangana (0.20%)", val: 0.20 },
    { label: "Maharashtra (0.50% max)", val: 0.50 },
    { label: "Delhi / NCR (0.10%)", val: 0.10 },
    { label: "Zero / Waived (0.00%)", val: 0.00 },
  ];

  // 1-Click PDF Export
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const pdfBytes = await generateBalanceTransferDossierPdf({
        currentBalance: result.currentBalance,
        currentRate: result.currentRate,
        newRate: result.newRate,
        rateCutPercent: result.rateCutPercent,
        rateCutBps: result.rateCutBps,
        remainingTenureYears: result.remainingTenureYears,
        currentEmi: result.currentEmi,
        newEmi: result.newEmi,
        monthlySavings: result.monthlySavings,
        annualSavings: result.annualSavings,
        grossLifetimeSavings: result.grossLifetimeSavings,
        processingFeeAmount: result.processingFeeAmount,
        modtStampDutyAmount: result.modtStampDutyAmount,
        otherCharges: result.otherCharges,
        totalSwitchingCost: result.totalSwitchingCost,
        netLifetimeSavings: result.netLifetimeSavings,
        breakEvenMonths: result.breakEvenMonths,
        recommendation: result.recommendation,
        recommendationReason: result.recommendationReason,
        currencySymbol,
      });

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Home-Loan-Balance-Transfer-Dossier-${Math.round(currentBalance / 100000)}Lakh.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 1-Click Excel Export
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["CONVERTSHEET HOME LOAN BALANCE TRANSFER AUDIT"],
        ["Generated", new Date().toLocaleString()],
        [],
        ["LOAN PARAMETERS", ""],
        ["Outstanding Principal", result.currentBalance],
        ["Current Interest Rate (%)", result.currentRate],
        ["New Interest Rate (%)", result.newRate],
        ["Rate Cut (% / bps)", `${result.rateCutPercent}% (${result.rateCutBps} bps)`],
        ["Remaining Tenure (Years)", result.remainingTenureYears],
        [],
        ["SAVINGS & EXPENSES", ""],
        ["Current Monthly EMI", result.currentEmi],
        ["New Monthly EMI", result.newEmi],
        ["Monthly EMI Savings", result.monthlySavings],
        ["Annual Savings", result.annualSavings],
        ["Gross Lifetime Savings", result.grossLifetimeSavings],
        ["Processing Fee", result.processingFeeAmount],
        ["MODT / Stamp Duty", result.modtStampDutyAmount],
        ["Other Charges", result.otherCharges],
        ["Total Switching Costs", result.totalSwitchingCost],
        ["Net Lifetime Savings", result.netLifetimeSavings],
        ["Break-Even Payback Horizon (Months)", result.breakEvenMonths],
        ["Verdict", result.recommendation],
        ["Executive Reason", result.recommendationReason],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Transfer Summary");

      // Yearly schedule
      const scheduleHeaders = [
        "Year",
        "Current Interest Paid",
        "New Interest Paid",
        "Yearly Savings",
        "Cumulative Savings",
        "Current Principal Remaining",
        "New Principal Remaining",
      ];
      const scheduleRows = result.yearlyComparison.map((r) => [
        `Year ${r.year}`,
        r.currentInterest,
        r.newInterest,
        r.yearlySavings,
        r.cumulativeSavings,
        r.currentPrincipalRemaining,
        r.newPrincipalRemaining,
      ]);

      const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeaders, ...scheduleRows]);
      XLSX.utils.book_append_sheet(wb, wsSchedule, "Yearly Amortization");

      XLSX.writeFile(
        wb,
        `balance-transfer-audit-${Math.round(currentBalance / 100000)}Lakh.xlsx`
      );
    } catch (e) {
      console.error("Excel export failed:", e);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const chartData = useMemo(() => {
    return result.yearlyComparison.map((r) => ({
      label: `Yr ${r.year}`,
      currentInterest: Math.round(r.currentInterest),
      newInterest: Math.round(r.newInterest),
      cumulativeSavings: Math.round(r.cumulativeSavings),
    }));
  }, [result]);

  return (
    <div className="space-y-6">
      <CalcCard
        title="Home Loan Balance Transfer Savings Calculator"
        subtitle="Calculate if switching your existing home loan to a lower-interest lender actually saves money after accounting for MODT stamp duty, processing fees, and title valuation costs."
        icon={ArrowRightLeft}
      >
        {/* Quick presets */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Loan Presets:
          </span>
          {loanPresets.map((p) => (
            <button
              key={p.val}
              type="button"
              onClick={() => setCurrentBalance(p.val)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                currentBalance === p.val
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
                  : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CalcInput
            id="bt-current-balance"
            label="Outstanding Principal"
            value={currentBalance}
            onChange={(v) => setCurrentBalance(Number(v) || 0)}
            prefix={currencySymbol}
            min={100000}
            max={100000000}
            step={50000}
          />
          <CalcInput
            id="bt-current-rate"
            label="Current Interest Rate"
            value={currentRate}
            onChange={(v) => setCurrentRate(Number(v) || 0)}
            suffix="%"
            min={1}
            max={25}
            step={0.05}
          />
          <CalcInput
            id="bt-new-rate"
            label="New Lender Rate"
            value={newRate}
            onChange={(v) => setNewRate(Number(v) || 0)}
            suffix="%"
            min={1}
            max={25}
            step={0.05}
          />
          <CalcInput
            id="bt-remaining-tenure"
            label="Remaining Tenure"
            value={remainingTenureYears}
            onChange={(v) => setRemainingTenureYears(Number(v) || 0)}
            suffix="Years"
            min={1}
            max={30}
            step={1}
          />
        </div>

        {/* Sliders */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <CalcSlider
            id="bt-slider-current-rate"
            label="Current Rate"
            value={currentRate}
            onChange={setCurrentRate}
            min={6.5}
            max={14}
            step={0.05}
            unit="%"
          />
          <CalcSlider
            id="bt-slider-new-rate"
            label="New Lender Rate"
            value={newRate}
            onChange={setNewRate}
            min={6.5}
            max={14}
            step={0.05}
            unit="%"
          />
          <CalcSlider
            id="bt-slider-remaining-tenure"
            label="Remaining Tenure"
            value={remainingTenureYears}
            onChange={setRemainingTenureYears}
            min={1}
            max={30}
            step={1}
            unit=" yrs"
          />
        </div>

        {/* Switching Costs Accordion/Section */}
        <div className="mt-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Switching Fees & MODT Stamp Duty</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium">
                Upfront Costs
              </span>
            </h4>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-500">MODT State Preset:</span>
              {stateModtPresets.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setModtStampDutyPercent(s.val)}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                    modtStampDutyPercent === s.val
                      ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 border-zinc-800"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {s.label.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CalcInput
              id="bt-proc-fee-pct"
              label="New Processing Fee (%)"
              value={processingFeePercent}
              onChange={(v) => setProcessingFeePercent(Number(v) || 0)}
              suffix="%"
              min={0}
              max={2}
              step={0.05}
            />
            <CalcInput
              id="bt-modt-duty-pct"
              label="MODT Stamp Duty (%)"
              value={modtStampDutyPercent}
              onChange={(v) => setModtStampDutyPercent(Number(v) || 0)}
              suffix="%"
              min={0}
              max={1}
              step={0.05}
            />
            <CalcInput
              id="bt-other-charges"
              label="Valuation & Legal Charges"
              value={otherCharges}
              onChange={(v) => setOtherCharges(Number(v) || 0)}
              prefix={currencySymbol}
              min={0}
              max={50000}
              step={1000}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Total Upfront Transfer Cost:{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                {formatCurrency(result.totalSwitchingCost)}
              </strong>
            </span>
            <span className="text-[11px]">
              (Proc: {formatCurrency(result.processingFeeAmount)} + MODT: {formatCurrency(result.modtStampDutyAmount)} + Other: {formatCurrency(result.otherCharges)})
            </span>
          </div>
        </div>

        {/* Verdict Card */}
        <div className="mt-6">
          <div
            className={`p-4 sm:p-5 rounded-2xl border ${
              result.isViable
                ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                : "bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {result.recommendation === "Highly Recommended" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : result.recommendation === "Moderate / Worth Evaluating" ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        result.isViable
                          ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                          : "bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200"
                      }`}
                    >
                      {result.recommendation}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Rate Drop: -{result.rateCutBps} bps (-{result.rateCutPercent}%)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mt-1 font-medium">
                    {result.recommendationReason}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-zinc-500 block">Break-Even Horizon</span>
                <span className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                  {result.breakEvenMonths} Months
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Current Monthly EMI
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(result.currentEmi)}
            </div>
            <div className="text-[11px] text-zinc-500">
              At {result.currentRate.toFixed(2)}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
            <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              New Monthly EMI
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(result.newEmi)}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              At {result.newRate.toFixed(2)}% (-{result.rateCutBps} bps)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Monthly Cash Savings
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(result.monthlySavings)}
            </div>
            <div className="text-[11px] text-zinc-500">
              {formatCurrency(result.annualSavings)} / year
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-1">
            <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Net Lifetime Savings
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(result.netLifetimeSavings)}
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
              Gross: {formatCurrency(result.grossLifetimeSavings)}
            </div>
          </div>
        </div>

        {/* Export Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? "Building PDF..." : "Download Balance Transfer Audit (PDF)"}</span>
              <Download className="w-3 h-3 ml-0.5" />
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingExcel ? "Exporting..." : "Export Excel (.xlsx)"}</span>
              <Download className="w-3 h-3 ml-0.5" />
            </button>
          </div>
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            100% Client-Side Private Computation
          </span>
        </div>
      </CalcCard>

      {/* Amortization Chart & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard
          title="Cumulative Savings & Interest Comparison"
          subtitle="Trajectory of cumulative interest saved over the loan lifespan"
        >
          <CalcChart
            title="Cumulative Savings Trajectory"
            data={chartData}
            series={[
              {
                key: "cumulativeSavings",
                name: "Cumulative Savings",
                color: "#10b981",
                gradientId: "btCumSavGrad",
              },
              {
                key: "currentInterest",
                name: "Current Lender Interest",
                color: "#f43f5e",
                gradientId: "btCurIntGrad",
              },
              {
                key: "newInterest",
                name: "New Lender Interest",
                color: "#3b82f6",
                gradientId: "btNewIntGrad",
              },
            ]}
          />
        </CalcCard>

        <CalcCard
          title="Yearly Savings Projection"
          subtitle="Cumulative interest saved year by year until full repayment"
        >
          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-100 dark:bg-zinc-800/80 sticky top-0">
                <tr>
                  <th className="py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">Year</th>
                  <th className="py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">Yearly Savings</th>
                  <th className="py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">Cumulative Savings</th>
                  <th className="py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                {result.yearlyComparison.map((row) => (
                  <tr key={row.year} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-2 px-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                      Yr {row.year}
                    </td>
                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{formatCurrency(row.yearlySavings)}
                    </td>
                    <td className="py-2 px-3 text-zinc-800 dark:text-zinc-200 font-semibold">
                      {formatCurrency(row.cumulativeSavings)}
                    </td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(row.newPrincipalRemaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcCard>
      </div>

      {/* Advisory FAQ / Guide Card */}
      <CalcCard
        title="Balance Transfer Playbook: When Should You Switch?"
        subtitle="Crucial rules and hidden charges every home loan borrower must audit before applying"
        icon={Info}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
              <span>1. The Internal Repricing Hack</span>
            </h5>
            <p>
              Before switching to an outside lender and incurring MODT stamp duty and legal fees, submit an internal repricing request to your existing bank. Banks routinely cut rates for existing borrowers by charging a nominal administrative repricing fee of ₹1,000–₹5,000 without requiring fresh mortgage registration.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
              <span>2. The 50 BPS & 5-Year Rule</span>
            </h5>
            <p>
              A balance transfer is mathematically lucrative if the interest rate delta is at least 0.40% to 0.50% (40–50 bps) and you have more than 5 years of repayment remaining. If your remaining term is less than 3–4 years, upfront switching friction will eat up almost all interest savings.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
              <span>3. Document Handover & EC</span>
            </h5>
            <p>
              Under RBI fair practice directives, banks must return your original property title deeds and issue a No Objection Certificate (NOC) within 30 days of loan closure. Always check whether your prospective lender accepts certified copies during the transition window to prevent loan disbursement stalls.
            </p>
          </div>
        </div>
      </CalcCard>
    </div>
  );
}
