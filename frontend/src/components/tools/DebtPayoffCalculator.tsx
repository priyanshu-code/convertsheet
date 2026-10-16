"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CreditCard, Plus, Trash2, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcExportButton,
  CalcPromptButton,
  CalcSaveButton,
  CalcShareButton,
  ModernSlider,
} from "@/components/calculator";
import { calculateDebtPayoff, DebtItem } from "@/lib/engines/financial-engine";
import { DebtConsolidationCard } from "@/components/finance";

export interface DebtPayoffCalculatorProps {
  initialValues?: Partial<{
    extraMonthlyPayment: number;
    strategy: "snowball" | "avalanche";
    debts: DebtItem[];
    totalStartingDebt?: number;
  }>;
}

export function DebtPayoffCalculator({
  initialValues,
}: DebtPayoffCalculatorProps = {}) {
  const [debts, setDebts] = useState<DebtItem[]>(() => {
    if (initialValues?.debts && initialValues.debts.length > 0) {
      return initialValues.debts;
    }
    if (typeof window !== "undefined") {
      const qDebt = new URLSearchParams(window.location.search).get("totalStartingDebt");
      if (qDebt) {
        const val = Number(qDebt);
        return [
          {
            id: "1",
            name: "Total Debt Balance",
            balance: val,
            interestRate: 21.99,
            minimumPayment: Math.round(val * 0.03),
          },
        ];
      }
    }
    if (initialValues?.totalStartingDebt) {
      return [
        {
          id: "1",
          name: "Credit Card Balance",
          balance: initialValues.totalStartingDebt,
          interestRate: 24.99,
          minimumPayment: Math.round(initialValues.totalStartingDebt * 0.03),
        },
      ];
    }
    return [
      { id: "1", name: "Credit Card (High APR)", balance: 4500, interestRate: 24.99, minimumPayment: 135 },
      { id: "2", name: "Store Card", balance: 1800, interestRate: 19.99, minimumPayment: 60 },
      { id: "3", name: "Personal Loan", balance: 7500, interestRate: 11.50, minimumPayment: 210 },
    ];
  });

  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("extraPayment");
      if (q) return Number(q);
    }
    return Number(initialValues?.extraMonthlyPayment) || 150;
  });

  const [strategy, setStrategy] = useState<"snowball" | "avalanche">(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("strategy");
      if (s === "snowball" || s === "avalanche") return s;
    }
    return initialValues?.strategy || "avalanche";
  });

  const addDebt = () => {
    const nextId = String(Date.now());
    setDebts([
      ...debts,
      { id: nextId, name: `Debt ${debts.length + 1}`, balance: 2000, interestRate: 18.0, minimumPayment: 50 },
    ]);
  };

  const removeDebt = (id: string) => {
    if (debts.length <= 1) return;
    setDebts(debts.filter((d) => d.id !== id));
  };

  const updateDebt = (id: string, field: keyof DebtItem, value: any) => {
    setDebts(
      debts.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const payoffResult = useMemo(() => {
    return calculateDebtPayoff({
      debts,
      extraMonthlyPayment,
      strategy,
    });
  }, [debts, extraMonthlyPayment, strategy]);

  // Dynamic State Serialization (URL Permalink Engine)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const totalBalance = Math.round(payoffResult.totalOriginalBalance);
    if (totalBalance > 0) params.set("totalStartingDebt", totalBalance.toString());
    if (extraMonthlyPayment > 0) params.set("extraPayment", extraMonthlyPayment.toString());
    if (strategy) params.set("strategy", strategy);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [payoffResult.totalOriginalBalance, extraMonthlyPayment, strategy]);

  // Branded SheetJS Excel Export with live recalculation retention hook
  const handleExportExcel = () => {
    try {
      const summaryRows: (string | number)[][] = [
        ["ConvertSheet - Accelerated Debt Payoff Amortization Model", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/debt-payoff-calculator"],
        ["Strategy Mode", strategy === "avalanche" ? "Debt Avalanche (Highest APR First)" : "Debt Snowball (Lowest Balance First)"],
        ["", ""],
        ["--- EXECUTIVE PAYOFF SUMMARY ---", ""],
        ["Total Starting Debt Balance ($)", Math.round(payoffResult.totalOriginalBalance)],
        ["Monthly Minimum Commitment ($)", Math.round(payoffResult.totalMonthlyPayment - extraMonthlyPayment)],
        ["Extra Monthly Accelerator ($)", extraMonthlyPayment],
        ["Total Monthly Payment ($)", Math.round(payoffResult.totalMonthlyPayment)],
        ["Months to Debt Freedom", payoffResult.payoffMonths],
        ["Years to Debt Freedom", payoffResult.payoffYears],
        ["Total Interest Paid ($)", Math.round(payoffResult.totalInterestPaid)],
        ["Total Lifetime Interest Saved ($)", Math.round(payoffResult.interestSavedComparedToMinOnly)],
        ["Months Saved vs. Minimums Only", payoffResult.monthsSavedComparedToMinOnly],
        ["", ""],
        ["--- INCLUDED DEBTS & ACCOUNTS ---", "", "", ""],
        ["Account Name", "Current Balance ($)", "Interest Rate (APR %)", "Minimum Payment ($)"],
        ...debts.map((d) => [d.name, d.balance, d.interestRate, d.minimumPayment]),
        ["", ""],
        ["--- MONTH-BY-MONTH AMORTIZATION SCHEDULE ---", "", "", "", "", ""],
        ["Month", "Payment ($)", "Principal ($)", "Interest ($)", "Remaining Balance ($)", "Debts Eliminated"],
        ...payoffResult.monthlySchedule.map((r) => [
          r.month,
          r.payment,
          r.principal,
          r.interest,
          r.remainingBalance,
          r.debtsPaidOff.join(", ") || "-",
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DebtPayoffSchedule");
      XLSX.writeFile(
        wb,
        `ConvertSheet_Debt_Payoff_${strategy}_${Math.round(payoffResult.totalOriginalBalance)}.xlsx`
      );
    } catch (err) {
      console.error("Debt payoff Excel export failed:", err);
    }
  };

  // Export data for SheetJS Excel
  const exportData = useMemo(() => {
    return payoffResult.monthlySchedule.map((row) => ({
      Month: row.month,
      Payment: `$${row.payment.toFixed(2)}`,
      Principal: `$${row.principal.toFixed(2)}`,
      Interest: `$${row.interest.toFixed(2)}`,
      "Remaining Debt Balance": `$${row.remainingBalance.toFixed(2)}`,
      "Debts Eliminated": row.debtsPaidOff.join(", ") || "-",
    }));
  }, [payoffResult]);

  const aiPrompt = useMemo(() => {
    return `Review this personal debt payoff acceleration plan:
- Total Balance: $${payoffResult.totalOriginalBalance.toLocaleString()}
- Strategy: ${strategy.toUpperCase()} (${strategy === "avalanche" ? "Highest APR First" : "Lowest Balance First"})
- Extra Monthly Contribution: $${extraMonthlyPayment}/month
- Debts Included:
${debts.map((d) => `  • ${d.name}: $${d.balance.toLocaleString()} at ${d.interestRate}% APR (Min: $${d.minimumPayment}/mo)`).join("\n")}
- Simulation Outcomes:
  • Payoff Time: ${payoffResult.payoffMonths} months (${payoffResult.payoffYears} years)
  • Total Interest Paid: $${payoffResult.totalInterestPaid.toLocaleString()}
  • Interest Saved with Acceleration: $${payoffResult.interestSavedComparedToMinOnly.toLocaleString()}
  • Time Shaved Off: ${payoffResult.monthsSavedComparedToMinOnly} months earlier
Please provide budgeting advice, emergency fund coordination, and behavioral strategies to stay debt-free.`;
  }, [debts, extraMonthlyPayment, strategy, payoffResult]);

  return (
    <div className="space-y-8 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Reassurance Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Zero-Knowledge Client-Side Engine • No financial data sent to servers • 100% Private &amp; Free</span>
      </div>

      {/* Top Strategy Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Payoff Acceleration Strategy:
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStrategy("avalanche")}
            className={`flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-manipulation flex items-center justify-center ${
              strategy === "avalanche"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            Debt Avalanche (Save Most Interest)
          </button>
          <button
            type="button"
            onClick={() => setStrategy("snowball")}
            className={`flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-manipulation flex items-center justify-center ${
              strategy === "snowball"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            Debt Snowball (Quick Wins)
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Debts & Inputs */}
        <div className="space-y-6 lg:col-span-7">
          <CalcCard
            title="Your Debts & Credit Cards"
            subtitle="Add all credit cards, personal loans, and auto balances."
          >
            <div className="space-y-4">
              {debts.map((debt, idx) => (
                <div
                  key={debt.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      aria-label={`Debt name ${idx + 1}`}
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                      className="text-sm font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-emerald-500 focus:outline-hidden px-1"
                    />
                    {debts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDebt(debt.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Remove debt"
                        aria-label={`Remove ${debt.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <CalcInput
                        id={`balance-${debt.id}`}
                        label="Current Balance"
                        value={debt.balance}
                        onChange={(v) => updateDebt(debt.id, "balance", Number(v) || 0)}
                        prefix="$"
                        min={0}
                        max={1000000}
                        step={50}
                      />
                    </div>
                    <div>
                      <CalcInput
                        id={`rate-${debt.id}`}
                        label="Interest Rate (APR)"
                        value={debt.interestRate}
                        onChange={(v) => updateDebt(debt.id, "interestRate", Number(v) || 0)}
                        suffix="%"
                        min={0}
                        max={99}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <CalcInput
                        id={`min-${debt.id}`}
                        label="Minimum Payment"
                        value={debt.minimumPayment}
                        onChange={(v) => updateDebt(debt.id, "minimumPayment", Number(v) || 0)}
                        prefix="$"
                        min={1}
                        max={50000}
                        step={5}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addDebt}
                className="w-full min-h-[44px] py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-all touch-manipulation cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Debt / Card</span>
              </button>

              {/* Extra Payment Accelerator */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <ModernSlider
                  id="extraMonthlyPaymentSlider"
                  label="Extra Monthly Accelerator"
                  value={extraMonthlyPayment}
                  min={0}
                  max={5000}
                  step={25}
                  prefix="$"
                  onChange={setExtraMonthlyPayment}
                  helpText="Additional money applied toward debt elimination each month"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick boost:</span>
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setExtraMonthlyPayment(amt)}
                      className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors touch-manipulation cursor-pointer ${
                        extraMonthlyPayment === amt
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      +${amt}/mo
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CalcCard>
        </div>

        {/* Right Column: Outcomes & Metrics */}
        <div className="space-y-6 lg:col-span-5">
          <CalcCard
            title="Debt Elimination Summary"
            subtitle="Accelerated payoff schedule with automated rollover cashflow."
          >
            <div className="space-y-6">
              {/* Primary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-950/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Debt-Free In
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                    {payoffResult.payoffMonths} mos
                  </div>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    ({payoffResult.payoffYears} years)
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Interest Saved
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
                    ${Math.round(payoffResult.interestSavedComparedToMinOnly).toLocaleString()}
                  </div>
                  <span className="mt-1 block text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {payoffResult.monthsSavedComparedToMinOnly} months sooner
                  </span>
                </div>
              </div>

              {/* Secondary Breakdown */}
              <div className="pt-2">
                <CalcResult
                  columns={2}
                  copyValue={`Debt-Free In: ${payoffResult.payoffMonths} months (${payoffResult.payoffYears} yrs) | Strategy: ${strategy} | Total Interest Saved: $${Math.round(payoffResult.interestSavedComparedToMinOnly).toLocaleString()} | Total Starting Debt: $${Math.round(payoffResult.totalOriginalBalance).toLocaleString()}`}
                  items={[
                    {
                      label: "Total Starting Debt",
                      value: `$${Math.round(payoffResult.totalOriginalBalance).toLocaleString()}`,
                      subtext: "Cumulative principal balances across all accounts",
                    },
                    {
                      label: "Monthly Commitment",
                      value: `$${Math.round(payoffResult.totalMonthlyPayment).toLocaleString()}/mo`,
                      subtext: "Minimums + your extra accelerator contribution",
                    },
                    {
                      label: "Total Interest Paid",
                      value: `$${Math.round(payoffResult.totalInterestPaid).toLocaleString()}`,
                      subtext: "Total cost of borrowing over entire payoff period",
                    },
                    {
                      label: "Total Cumulative Payments",
                      value: `$${Math.round(payoffResult.totalPayment).toLocaleString()}`,
                      subtext: "Principal + interest to reach zero debt",
                    },
                  ]}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 touch-manipulation cursor-pointer"
                >
                  <span>Export Payoff Amortization (.xlsx)</span>
                </button>
                <CalcSaveButton
                  toolSlug="debt-payoff-calculator"
                  path="/tools/debt-payoff-calculator"
                  toolName="Debt Payoff & Accelerator Calculator"
                  summaryTitle={`${strategy === "avalanche" ? "Avalanche" : "Snowball"}: $${Math.round(payoffResult.totalOriginalBalance).toLocaleString()} Debt (${payoffResult.payoffMonths} mos)`}
                  summaryMetrics={[
                    { label: "Payoff Time", value: `${payoffResult.payoffMonths} months` },
                    { label: "Total Debt", value: `$${Math.round(payoffResult.totalOriginalBalance).toLocaleString()}` },
                    { label: "Total Interest", value: `$${Math.round(payoffResult.totalInterestPaid).toLocaleString()}` },
                    { label: "Accelerator", value: `+$${extraMonthlyPayment}/mo` },
                  ]}
                />
                <CalcShareButton
                  state={{
                    totalStartingDebt: Math.round(payoffResult.totalOriginalBalance),
                    extraPayment: extraMonthlyPayment,
                    strategy,
                  }}
                  label="Share Debt Plan"
                />
                <CalcPromptButton prompt={aiPrompt} label="Analyze with AI" />
              </div>
            </div>
          </CalcCard>
        </div>
      </div>

      {/* US & EU Benchmark Debt Consolidation & Refinance Benchmark */}
      <DebtConsolidationCard totalDebt={payoffResult.totalOriginalBalance} />

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Debt-Free In</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {payoffResult.payoffMonths} mos ({payoffResult.payoffYears} yrs)
          </span>
          <span className="text-[11px] text-zinc-500 block">
            Saved: ${Math.round(payoffResult.interestSavedComparedToMinOnly).toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors touch-manipulation"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}
