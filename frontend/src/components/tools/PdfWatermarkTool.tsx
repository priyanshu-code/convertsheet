"use client";

import React, { useState, useRef } from "react";
import { ShieldAlert, Download, UploadCloud, RefreshCw, FileText } from "lucide-react";
import { CalcCard, CalcInput, CalcSlider, CalcResult } from "@/components/calculator";
import { watermarkPdfFile } from "@/lib/engines/pdf-engine";
import { formatBytes } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

export function PdfWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [opacity, setOpacity] = useState<number>(25);
  const [fontSize, setFontSize] = useState<number>(50);
  const [diagonal, setDiagonal] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    filename: string;
    pageCount: number;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (uploadedFile: File) => {
    setError(null);
    setResult(null);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      setFile(uploadedFile);
      setTotalPages(doc.getPageCount());
    } catch (e: any) {
      setError("Failed to open PDF document. The file may be corrupt or password protected.");
    }
  };

  const handleApplyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setError(null);
    setIsProcessing(true);
    try {
      const res = await watermarkPdfFile(file, {
        text: watermarkText.trim(),
        opacity: opacity / 100,
        size: fontSize,
        diagonal,
      });
      const url = URL.createObjectURL(res.blob);
      setResult({
        ...res,
        url,
      });
    } catch (e: any) {
      setError(e.message || "Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null);
    setTotalPages(0);
    setResult(null);
    setError(null);
  };

  const presets = ["CONFIDENTIAL", "DRAFT", "DO NOT COPY", "SAMPLE", "INTERNAL ONLY"];

  return (
    <CalcCard
      title="Watermark PDF Online"
      subtitle="Stamp custom text watermarks like CONFIDENTIAL or DRAFT onto every PDF page. 100% private in-browser processing."
      icon={ShieldAlert}
      badge="100% Client-Side"
    >
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-800/30 group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Select a PDF document to watermark
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Add customizable security stamps across all pages with zero server uploads.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Choose PDF File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className="p-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatBytes(file.size)} • {totalPages} {totalPages === 1 ? "page" : "pages"} total
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
              >
                Change File
              </button>
            </div>

            {/* Watermark Text Input */}
            <div className="space-y-2">
              <CalcInput
                id="watermark-text"
                label="Watermark Text"
                value={watermarkText}
                onChange={setWatermarkText}
                placeholder="e.g. CONFIDENTIAL"
                helpText="The text stamped across every page of your PDF."
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Presets:
                </span>
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWatermarkText(preset)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      watermarkText === preset
                        ? "bg-emerald-600 text-white font-medium"
                        : "bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders and Orientation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcSlider
                id="watermark-opacity"
                label="Opacity"
                value={opacity}
                onChange={setOpacity}
                min={10}
                max={80}
                step={5}
                unit="%"
                helpText="Controls how faint or prominent the watermark appears."
              />

              <CalcSlider
                id="watermark-font-size"
                label="Font Size"
                value={fontSize}
                onChange={setFontSize}
                min={24}
                max={96}
                step={2}
                unit="px"
                helpText="Adjust the point size of the watermark text."
              />
            </div>

            {/* Rotation Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
              <div>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 block">
                  Diagonal Orientation (45°)
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Slanted watermark across the page center for higher security.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDiagonal((prev) => !prev)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  diagonal ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    diagonal ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Apply Action Button */}
            <button
              type="button"
              onClick={handleApplyWatermark}
              disabled={isProcessing || !watermarkText.trim()}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Stamping Watermark in Browser...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5" />
                  <span>Apply Watermark to All {totalPages} Pages</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Result & Download */}
        {result && (
          <div className="pt-2 space-y-4">
            <CalcResult
              title="Watermarked PDF Ready"
              primaryLabel="Pages Watermarked"
              primaryValue={`${result.pageCount} Pages Watermarked`}
              primarySubtext={`Output size: ${formatBytes(result.blob.size)}`}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Download {result.filename}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Watermark Another</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
