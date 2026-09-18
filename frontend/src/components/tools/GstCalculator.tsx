"use client";

import React, { useState, useMemo } from "react";
import { Receipt } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcSelect,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export function GstCalculator() {
  const { currencySymbol, formatCurrency } = useCurrency();
  const [amount, setAmount] = useState<number>(10000);
  const [rate, setRate] = useState<string>("18");
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const { netAmount, gstAmount, totalAmount, cgst, sgst } = useMemo(() => {
    const rawAmt = Math.max(0, amount);
    const taxRate = Math.max(0, Number(rate) || 0);

    let net = 0;
    let tax = 0;
    let total = 0;

    if (mode === "exclusive") {
      // Add GST: tax = net * (rate / 100)
      net = rawAmt;
      tax = net * (taxRate / 100);
      total = net + tax;
    } else {
      // Remove GST: net = total / (1 + rate / 100)
      total = rawAmt;
      net = total / (1 + taxRate / 100);
      tax = total - net;
    }

    const halfTax = tax / 2;

    return {
      netAmount: Math.round(net * 100) / 100,
      gstAmount: Math.round(tax * 100) / 100,
      totalAmount: Math.round(total * 100) / 100,
      cgst: Math.round(halfTax * 100) / 100,
      sgst: Math.round(halfTax * 100) / 100,
    };
  }, [amount, rate, mode]);

  return (
    <CalcCard
      title="GST Calculator"
      subtitle="Add or remove Goods and Services Tax (GST) with standard tax brackets and CGST/SGST splits."
      icon={Receipt}
      badge="Tax Compliant"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CalcToggle
          value={mode}
          options={[
            { value: "exclusive", label: "Add GST (Exclusive)" },
            { value: "inclusive", label: "Remove GST (Inclusive)" },
          ]}
          onChange={(val) => setMode(val as "exclusive" | "inclusive")}
        />

        <div className="w-48">
          <CalcSelect
            id="gst-rate"
            label="GST Tax Rate"
            value={rate}
            options={[
              { value: "5", label: "5% (Essential Goods)" },
              { value: "12", label: "12% (Standard Low)" },
              { value: "18", label: "18% (Standard / Services)" },
              { value: "28", label: "28% (Luxury / De-merit)" },
            ]}
            onChange={setRate}
          />
        </div>
      </div>

      <CalcInput
        id="gst-amount"
        label={mode === "exclusive" ? "Net Base Amount (Pre-Tax)" : "Total Gross Amount (MRP / Post-Tax)"}
        value={amount}
        min={0}
        step={100}
        prefix={currencySymbol}
        onChange={(val) => setAmount(Number(val) || 0)}
      />

      <CalcResult
        title="GST Tax Computation"
        primaryLabel={mode === "exclusive" ? "Total Payable Amount" : "Net Base Amount"}
        primaryValue={formatCurrency(mode === "exclusive" ? totalAmount : netAmount, { maxDecimals: 2 })}
        items={[
          {
            label: "Total GST Amount",
            value: formatCurrency(gstAmount, { maxDecimals: 2 }),
            highlight: true,
          },
          {
            label: "Central GST (CGST - 50%)",
            value: formatCurrency(cgst, { maxDecimals: 2 }),
          },
          {
            label: "State GST (SGST - 50%)",
            value: formatCurrency(sgst, { maxDecimals: 2 }),
          },
        ]}
      />

      {/* Action Buttons */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
        <CalcSaveButton
          toolSlug="gst-calculator"
          toolName="GST Calculator"
          summaryTitle={`${mode === "exclusive" ? "Add" : "Remove"} ${rate}% GST: ${formatCurrency(amount)}`}
          summaryMetrics={[
            { label: mode === "exclusive" ? "Total Payable" : "Base Amount", value: formatCurrency(mode === "exclusive" ? totalAmount : netAmount) },
            { label: "GST Tax", value: formatCurrency(gstAmount) },
            { label: "Rate", value: `${rate}%` },
            { label: "CGST / SGST", value: `${formatCurrency(cgst)} each` },
          ]}
        />
        <CalcShareButton
          state={{
            amount,
            rate,
            mode,
          }}
          label="Share Computation"
        />
      </div>
    </CalcCard>
  );
}
