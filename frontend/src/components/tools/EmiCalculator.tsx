"use client";

import React, { useState, useMemo } from "react";
import { Landmark } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
} from "@/components/calculator";

export function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(15);

  const { monthlyEmi, totalInterest, totalPayment } = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const annualR = Math.max(0.1, interestRate);
    const years = Math.max(1, loanTenureYears);

    const r = annualR / 12 / 100;
    const n = years * 12;

    // EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emi * n;
    const totalInt = Math.max(0, totalPay - P);

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPay),
    };
  }, [loanAmount, interestRate, loanTenureYears]);

  return (
    <CalcCard
      title="Loan EMI Calculator"
      subtitle="Calculate your monthly installment, total interest expenses, and loan repayment schedule."
      icon={Landmark}
      badge="Bank Approved"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <CalcInput
            id="loan-amount"
            label="Total Loan Principal"
            value={loanAmount}
            min={10000}
            step={50000}
            prefix="₹"
            onChange={(val) => setLoanAmount(Number(val) || 0)}
          />
          <CalcSlider
            id="loan-amount-slider"
            label="Principal Amount"
            value={loanAmount}
            min={50000}
            max={10000000}
            step={50000}
            prefix="₹"
            onChange={setLoanAmount}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="loan-rate"
            label="Annual Interest Rate (%)"
            value={interestRate}
            min={1}
            max={25}
            step={0.1}
            suffix="%"
            onChange={(val) => setInterestRate(Number(val) || 0.1)}
          />
          <CalcSlider
            id="loan-rate-slider"
            label="Interest Rate"
            value={interestRate}
            min={5}
            max={20}
            step={0.1}
            unit="%"
            onChange={setInterestRate}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="loan-tenure"
            label="Repayment Tenure"
            value={loanTenureYears}
            min={1}
            max={30}
            step={1}
            suffix="Years"
            onChange={(val) => setLoanTenureYears(Number(val) || 1)}
          />
          <CalcSlider
            id="loan-tenure-slider"
            label="Tenure Duration"
            value={loanTenureYears}
            min={1}
            max={30}
            unit="Yrs"
            onChange={setLoanTenureYears}
          />
        </div>
      </div>

      <CalcResult
        title="Loan Repayment Schedule"
        primaryLabel="Monthly Loan EMI Payable"
        primaryValue={`₹${monthlyEmi.toLocaleString("en-IN")}`}
        items={[
          {
            label: "Total Principal Amount",
            value: `₹${loanAmount.toLocaleString("en-IN")}`,
          },
          {
            label: "Total Interest Accrued",
            value: `₹${totalInterest.toLocaleString("en-IN")}`,
            highlight: true,
          },
          {
            label: "Total Repayment (P + I)",
            value: `₹${totalPayment.toLocaleString("en-IN")}`,
          },
        ]}
      />
    </CalcCard>
  );
}
