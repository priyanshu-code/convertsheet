"use client";

import React, { useState, useRef } from "react";
import {
  Receipt,
  UploadCloud,
  FileText,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  DollarSign,
  Calendar,
  Building,
  Copy,
  Table,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface ReceiptItem {
  name: string;
  quantity?: number;
  price?: number;
  total?: number;
}

interface ReceiptData {
  vendor?: {
    name?: string;
    address?: string;
    phone?: string;
  };
  date?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  verified_math?: boolean;
  items?: ReceiptItem[];
  confidence?: number;
  duration_seconds?: number;
}

export function ReceiptOcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ReceiptData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setResult(null);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const parseReceipt = async () => {
    if (!file) {
      setError("Please select a receipt or invoice image.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (currency) formData.append("currency", currency);
      formData.append("tier", "free");

      const data = await dispatchMediaJob("document/parse-receipt", formData);

      if (data.total !== undefined || data.vendor) {
        setResult(data as ReceiptData);
      } else if (data.job_id) {
        const fullResult: any = await pollMediaJobFull(data.job_id, 40, 1000);
        setResult(fullResult as ReceiptData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to scan receipt. Please verify image clarity and retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsv = () => {
    if (!result?.items) return;
    const headers = "Item Name,Quantity,Unit Price,Total Price\n";
    const rows = result.items
      .map(
        (it) =>
          `"${it.name || ""}",${it.quantity || 1},${it.price || ""},${it.total || ""}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `receipt_items_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Upload Receipt */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            1. Select Receipt, Invoice, or Bill
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              file
                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-900/40"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              aria-label="Upload receipt or invoice image"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*,.pdf,.jpg,.jpeg,.png,.webp,.tiff"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {file ? file.name : "Click to select or drag & drop receipt photo"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {file
                    ? `${formatBytes(file.size)} • Ready to extract expenses`
                    : "Supports JPG, PNG, WebP, PDF up to 50MB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Process Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={parseReceipt}
            disabled={isProcessing || !file}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reading Line Items & Taxes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Expense Data</span>
              </>
            )}
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-5">
            {/* Top Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Vendor</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate block mt-0.5">
                  {result.vendor?.name || "Merchant"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Date</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                  {result.date || "N/A"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Tax</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                  {result.currency || "$"}
                  {result.tax !== undefined ? result.tax.toFixed(2) : "0.00"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  {result.currency || "$"}
                  {result.total !== undefined ? result.total.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            {result.items && result.items.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Itemized Line Items ({result.items.length})
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyJson}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copied ? "Copied" : "Copy JSON"}
                    </button>
                    <button
                      type="button"
                      onClick={downloadCsv}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-500"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100/50 dark:bg-zinc-800/30 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {result.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                          <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </td>
                          <td className="p-3 text-right font-mono text-zinc-500">
                            {item.quantity || 1}
                          </td>
                          <td className="p-3 text-right font-mono text-zinc-500">
                            {item.price !== undefined ? `${result.currency || "$"}${item.price.toFixed(2)}` : "-"}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {item.total !== undefined ? `${result.currency || "$"}${item.total.toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Receipt scans are processed in isolated memory and never stored in any database.</span>
        </div>
      </div>
    </div>
  );
}
