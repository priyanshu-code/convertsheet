"use client";

import React, { useState, useMemo } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcExportButton,
  CalcPromptButton,
  ModernSlider,
} from "@/components/calculator";
import { calculateDebtPayoff, DebtItem } from "@/lib/engines/financial-engine";

export interface DebtPayoffCalculatorProps {
  initialValues?: Partial<{
    extraMonthlyPayment: number;
    strategy: "snowball" | "avalanche";
  }>;
}

export function DebtPayoffCalculator({
  initialValues,
}: DebtPayoffCalculatorProps = {}) {
  const [debts, setDebts] = useState<DebtItem[]>([
    { id: "1", name: "Credit Card (High APR)", balance: 4500, interestRate: 24.99, minimumPayment: 135 },
    { id: "2", name: "Store Card", balance: 1800, interestRate: 19.99, minimumPayment: 60 },
    { id: "3", name: "Personal Loan", balance: 7500, interestRate: 11.50, minimumPayment: 210 },
  ]);

  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(
    Number(initialValues?.extraMonthlyPayment) || 150
  );
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">(
    initialValues?.strategy || "avalanche"
  );

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
    <div className="space-y-8">
      {/* Top Strategy Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Payoff Acceleration Strategy:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStrategy("avalanche")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Current Balance
                      </label>
                      <CalcInput
                        id={`balance-${debt.id}`}
                        label=""
                        value={debt.balance}
                        onChange={(v) => updateDebt(debt.id, "balance", Number(v) || 0)}
                        prefix="$"
                        min={0}
                        max={1000000}
                        step={50}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Interest Rate (APR)
                      </label>
                      <CalcInput
                        id={`rate-${debt.id}`}
                        label=""
                        value={debt.interestRate}
                        onChange={(v) => updateDebt(debt.id, "interestRate", Number(v) || 0)}
                        suffix="%"
                        min={0}
                        max={99}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Minimum Payment
                      </label>
                      <CalcInput
                        id={`min-${debt.id}`}
                        label=""
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
                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Debt / Card</span>
              </button>

              {/* Extra Payment Accelerator */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <CalcInput
                  id="extraMonthlyPayment"
                  label="Extra Monthly Accelerator Payment"
                  value={extraMonthlyPayment}
                  onChange={(v) => setExtraMonthlyPayment(Number(v) || 0)}
                  prefix="$"
                  min={0}
                  max={5000}
                  step={25}
                  helpText="Additional money applied toward debt elimination each month"
                />
                <ModernSlider
                  id="extraMonthlyPaymentSlider"
                  label="Extra Monthly Accelerator"
                  value={extraMonthlyPayment}
                  min={0}
                  max={1000}
                  step={25}
                  prefix="$"
                  onChange={setExtraMonthlyPayment}
                />
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
              <div className="space-y-3 pt-2">
                <CalcResult
                  label="Total Starting Debt"
                  value={`$${Math.round(payoffResult.totalOriginalBalance).toLocaleString()}`}
                  subtext="Cumulative principal balances across all accounts"
                />
                <CalcResult
                  label="Monthly Commitment"
                  value={`$${Math.round(payoffResult.totalMonthlyPayment).toLocaleString()}/mo`}
                  subtext="Minimums + your extra accelerator contribution"
                />
                <CalcResult
                  label="Total Interest Paid"
                  value={`$${Math.round(payoffResult.totalInterestPaid).toLocaleString()}`}
                  subtext="Total cost of borrowing over entire payoff period"
                />
                <CalcResult
                  label="Total Cumulative Payments"
                  value={`$${Math.round(payoffResult.totalPayment).toLocaleString()}`}
                  subtext="Principal + interest to reach zero debt"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                <CalcExportButton
                  filename={`debt-payoff-schedule-${strategy}`}
                  sheetName="PayoffSchedule"
                  data={exportData}
                  label="Export Payoff Amortization (.xlsx)"
                />
                <CalcPromptButton prompt={aiPrompt} label="Analyze with AI" />
              </div>
            </div>
          </CalcCard>
        </div>
      </div>
    </div>
  );
}
