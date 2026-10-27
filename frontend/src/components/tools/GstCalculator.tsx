"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Receipt, ShieldCheck, FileSpreadsheet } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcToggle,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import * as XLSX from "xlsx";

export function GstCalculator() {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [amount, setAmount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("amount");
      if (q) return Number(q);
    }
    return 10000;
  });

  const [rate, setRate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("rate");
      if (q) return q;
    }
    return "18";
  });

  const [mode, setMode] = useState<"exclusive" | "inclusive">(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("mode");
      if (q === "exclusive" || q === "inclusive") return q;
    }
    return "exclusive";
  });

  const [customRate, setCustomRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("customRate");
      if (q) return Number(q);
    }
    return 18;
  });

  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Real-time URL query parameter synchronization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("amount", amount.toString());
      params.set("rate", rate);
      params.set("mode", mode);
      if (rate === "custom") {
        params.set("customRate", customRate.toString());
      } else {
        params.delete("customRate");
      }
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [amount, rate, mode, customRate]);

  const effectiveRate = rate === "custom" ? customRate : Number(rate) || 0;

  const { netAmount, gstAmount, totalAmount, cgst, sgst } = useMemo(() => {
    const rawAmt = Math.max(0, amount);
    const taxRate = Math.max(0, effectiveRate);

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
  }, [amount, effectiveRate, mode]);

  const GST_RATES = ["0", "3", "5", "12", "18", "28", "custom"];
  const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000, 250000];

  const copySummary = `${mode === "exclusive" ? "Add" : "Remove"} ${effectiveRate}% GST | Net Base: ${formatCurrency(netAmount)} | Total GST: ${formatCurrency(gstAmount)} (CGST: ${formatCurrency(cgst)}, SGST: ${formatCurrency(sgst)}) | Gross Total: ${formatCurrency(totalAmount)}`;

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();
      const isExcl = mode === "exclusive";

      // Tab 1: GST Summary with active Excel cell formulas
      const summaryData: any[][] = [
        ["ConvertSheet - GST Tax Computation & Invoice Audit", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", `https://www.convertsheet.com/tools/gst-calculator?amount=${amount}&rate=${rate}&mode=${mode}${rate === "custom" ? `&customRate=${customRate}` : ""}`],
        ["GST Council Baseline", "2026 Statutory GST Schedule (CGST/SGST 50:50 Revenue Split)"],
        ["", ""],
        ["--- TRANSACTION PARAMETERS ---", ""],
        ["Computation Mode", isExcl ? "Add GST (Exclusive - Pre-Tax Input)" : "Remove GST (Inclusive - MRP / Post-Tax Input)"],
        ["Input Amount", amount],
        ["Applicable GST Rate (%)", effectiveRate],
        ["", ""],
        ["--- TAX BREAKDOWN & SPLIT (FORMULAS) ---", ""],
        ["Net Pre-Tax Base Amount", isExcl ? { t: "n", f: "B8", v: netAmount } : { t: "n", f: "B8/(1+B9/100)", v: netAmount }],
        ["Total GST Liability", isExcl ? { t: "n", f: "B12*(B9/100)", v: gstAmount } : { t: "n", f: "B8-B12", v: gstAmount }],
        ["Central GST (CGST - 50%)", { t: "n", f: "B13/2", v: cgst }],
        ["State / UT GST (SGST - 50%)", { t: "n", f: "B13/2", v: sgst }],
        ["Integrated GST (IGST - Inter-State)", { t: "n", f: "B13", v: gstAmount }],
        ["Gross Final Total Amount", { t: "n", f: "B12+B13", v: totalAmount }],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "GST Summary");

      // Tab 2: Rate Matrix Comparison across 3%, 5%, 12%, 18%, 28% with active row formulas
      const matrixHeader = [
        "GST Slab Rate (%)",
        "Mode",
        "Net Base Amount",
        "Total GST",
        "CGST (50%)",
        "SGST (50%)",
        "Gross Final Total",
      ];
      const comparisonRates = [3, 5, 12, 18, 28];
      const matrixRows = comparisonRates.map((r, idx) => {
        const row = idx + 2; // header is row 1
        let n = 0;
        let t = 0;
        let tot = 0;
        if (isExcl) {
          n = amount;
          t = n * (r / 100);
          tot = n + t;
        } else {
          tot = amount;
          n = tot / (1 + r / 100);
          t = tot - n;
        }

        return [
          r,
          isExcl ? "Add GST" : "Remove GST",
          isExcl
            ? { t: "n", f: "'GST Summary'!$B$8", v: amount }
            : { t: "n", f: `'GST Summary'!$B$8/(1+A${row}/100)`, v: Math.round(n * 100) / 100 },
          isExcl
            ? { t: "n", f: `C${row}*(A${row}/100)`, v: Math.round(t * 100) / 100 }
            : { t: "n", f: `'GST Summary'!$B$8-C${row}`, v: Math.round(t * 100) / 100 },
          { t: "n", f: `D${row}/2`, v: Math.round((t / 2) * 100) / 100 },
          { t: "n", f: `D${row}/2`, v: Math.round((t / 2) * 100) / 100 },
          { t: "n", f: `C${row}+D${row}`, v: Math.round(tot * 100) / 100 },
        ];
      });

      const wsMatrix = XLSX.utils.aoa_to_sheet([matrixHeader, ...matrixRows]);
      XLSX.utils.book_append_sheet(wb, wsMatrix, "All Slabs Matrix");

      XLSX.writeFile(wb, `ConvertSheet_GST_Audit_${effectiveRate}pct_${amount}.xlsx`);
    } catch (err) {
      console.error("Failed to generate Excel export:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const llmPrompt = useMemo(() => {
    return `Analyze my GST invoice and tax computation:
- Mode: ${mode === "exclusive" ? "Exclusive (Add GST to base)" : "Inclusive (Extract GST from gross)"}
- Base/Input Amount: ${formatCurrency(amount)}
- Applicable GST Rate: ${effectiveRate}%
- Net Pre-Tax Amount: ${formatCurrency(netAmount)}
- Total GST: ${formatCurrency(gstAmount)}
- Central GST (CGST 50%): ${formatCurrency(cgst)}
- State GST (SGST 50%): ${formatCurrency(sgst)}
- Gross Payable Total: ${formatCurrency(totalAmount)}

Please provide guidance on Input Tax Credit (ITC) eligibility, reverse charge mechanism (RCM), and SAC/HSN compliance under 2026 GST rules.`;
  }, [mode, amount, effectiveRate, netAmount, gstAmount, cgst, sgst, totalAmount, formatCurrency]);

  return (
    <CalcCard
      title="GST Calculator"
      subtitle="Add or remove Goods and Services Tax (GST) with standard tax brackets and CGST/SGST splits."
      icon={Receipt}
      badge="Tax Compliant"
    >
      <div className="space-y-6 pb-28 sm:pb-0">
        {/* Zero-Knowledge Privacy Badge & Freshness Signal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% Client-Side • No server data transfer • Private &amp; Free Forever</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Updated for 2026 GST Council (October 27, 2026): Standard 5%, 12%, 18%, 28% brackets + 3% Gold slab; CGST/SGST 50:50 revenue split</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <CalcToggle
            value={mode}
            options={[
              { value: "exclusive", label: "Add GST (Exclusive)" },
              { value: "inclusive", label: "Remove GST (Inclusive)" },
            ]}
            onChange={(val) => setMode(val as "exclusive" | "inclusive")}
          />
        </div>

        {/* 1-Tap GST Rate Chips */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
            Select GST Rate (%)
          </label>
          <div className="flex flex-wrap gap-2">
            {GST_RATES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRate(r)}
                className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer border touch-manipulation ${
                  rate === r
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                }`}
              >
                {r === "custom" ? "Custom %" : r === "3" ? "3% (Gold)" : `${r}%`}
              </button>
            ))}
          </div>

          {rate === "custom" && (
            <div className="max-w-xs pt-1">
              <CalcInput
                id="custom-gst-rate"
                label="Custom GST Rate (%)"
                value={customRate}
                min={0}
                max={100}
                step={0.1}
                suffix="%"
                onChange={(val) => setCustomRate(Number(val) || 0)}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <CalcInput
            id="gst-amount"
            label={mode === "exclusive" ? "Net Base Amount (Pre-Tax)" : "Total Gross Amount (MRP / Post-Tax)"}
            value={amount}
            min={0}
            step={100}
            prefix={currencySymbol}
            onChange={(val) => setAmount(Number(val) || 0)}
          />
          <CalcSlider
            id="gst-amount-slider"
            label={`Explore Amount Range (${currencySymbol}0 – ${currencySymbol}250,000)`}
            value={Math.min(250000, Math.max(0, amount))}
            onChange={setAmount}
            min={0}
            max={250000}
            step={500}
            unit={currencySymbol}
            ariaLabel="GST Transaction Amount Slider"
          />
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer border touch-manipulation ${
                    amount === amt
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                  }`}
                >
                  {currencySymbol}{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <CalcResult
          title="GST Tax Computation"
          primaryLabel={mode === "exclusive" ? "Total Payable Amount" : "Net Base Amount"}
          primaryValue={formatCurrency(mode === "exclusive" ? totalAmount : netAmount, { maxDecimals: 2 })}
          copyValue={copySummary}
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
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer min-h-[44px] touch-manipulation"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? "Generating..." : "Export Excel (.xlsx)"}</span>
          </button>
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
          <CalcPromptButton promptText={llmPrompt} />
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block tracking-wider">
            {mode === "exclusive" ? "Total Payable" : "Base Pre-Tax"}
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(mode === "exclusive" ? totalAmount : netAmount, { maxDecimals: 2 })}
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 touch-manipulation disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isExportingExcel ? "Exporting..." : "Export .xlsx"}</span>
        </button>
      </div>
    </CalcCard>
  );
}
