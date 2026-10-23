"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Printer,
  Grid,
} from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { formatBytes } from "@/lib/utils";
import { dispatchMediaJob, pollMediaJob } from "@/lib/media-engine-client";

export interface PassportPreset {
  id: string;
  name: string;
  dimensionsMm: string;
  pixelWidth: number;
  pixelHeight: number;
  aspectRatio: string;
  countries: string;
}

const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: "35x45",
    name: "3.5 x 4.5 cm (Standard)",
    dimensionsMm: "35 x 45 mm",
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: "35/45",
    countries: "India, UK, Europe, Australia, Pakistan, Canada",
  },
  {
    id: "2x2",
    name: "2 x 2 Inch (Square)",
    dimensionsMm: "51 x 51 mm",
    pixelWidth: 600,
    pixelHeight: 600,
    aspectRatio: "1/1",
    countries: "United States Visa & Passport, India OCI",
  },
  {
    id: "35x35",
    name: "3.5 x 3.5 cm",
    dimensionsMm: "35 x 35 mm",
    pixelWidth: 413,
    pixelHeight: 413,
    aspectRatio: "1/1",
    countries: "Singapore, China, New Zealand",
  },
];

const BG_COLORS = [
  { id: "white", name: "Pure White", hex: "#FFFFFF", border: "border-zinc-300" },
  { id: "offwhite", name: "Off White", hex: "#F3F4F6", border: "border-zinc-300" },
  { id: "lightblue", name: "Consular Blue", hex: "#D4E6F8", border: "border-blue-300" },
  { id: "red", name: "Consular Red", hex: "#D91414", border: "border-red-400" },
];

export function WhiteBackgroundPassportTool() {
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [selectedBg, setSelectedBg] = useState(BG_COLORS[0]);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP or HEIC).");
      return;
    }
    setError(null);
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setProcessedUrl(null);
  };

  const processImage = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", originalFile);
      formData.append("background_color", selectedBg.hex);
      formData.append("precision", "subpixel_hair");
      formData.append("tier", "pro");

      const data = await dispatchMediaJob("matting/remove-bg", formData);

      if (data.download_url || data.output_path || data.result) {
        const fileUrl = data.download_url || (data.result && data.result.download_url);
        if (fileUrl) {
          setProcessedUrl(fileUrl);
        } else {
          setProcessedUrl(data.output_url || originalUrl);
        }
      } else if (data.job_id) {
        const finalUrl = await pollMediaJob(data.job_id);
        setProcessedUrl(finalUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process passport photo. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessed = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `passport_photo_${selectedPreset.id}_white_bg.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Interactive Demonstration Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Interactive AI Example
          </span>
          <span>Drag slider to see background isolation & white balance</span>
        </div>
        <BeforeAfterSlider
          beforeImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
          afterImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80&sat=-100"
          beforeLabel="Home Selfie / Cluttered Room"
          afterLabel="White Background Passport"
          aspectRatio="aspect-[16/9] sm:aspect-[21/9]"
        />
      </div>

      {/* Main Conversion Control Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Preset & Background Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              1. Passport / Visa Size
            </label>
            <div className="space-y-2">
              {PASSPORT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                    selectedPreset.id === p.id
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{p.name}</span>
                    <span className="text-xs text-zinc-400">{p.dimensionsMm}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    {p.countries}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              2. Official Background Color
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm transition-all ${
                    selectedBg.id === bg.id
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-medium ring-1 ring-emerald-500"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border shrink-0 ${bg.border}`}
                    style={{ backgroundColor: bg.hex }}
                  />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Privacy & Automated Deletion</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Images are processed in GPU RAM and automatically deleted from our server after 20 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Upload Dropzone */}
        {!originalUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-950/20 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="Upload photo for passport white background"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Upload Any Selfie or Portrait Photo
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Drag and drop your photo here, or click to browse. Works with camera photos, home selfies, and scanned IDs.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview & Action */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
              <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-md shrink-0">
                <img
                  src={processedUrl || originalUrl}
                  alt="Passport preview"
                  className="w-full h-full object-cover"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {originalFile?.name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span>Size: {formatBytes(originalFile?.size || 0)}</span>
                  <span>•</span>
                  <span>Target: {selectedPreset.name}</span>
                  <span>•</span>
                  <span>Background: {selectedBg.name}</span>
                </div>

                {error && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
                  {!processedUrl ? (
                    <button
                      onClick={processImage}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating White Background...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Make Passport Photo</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => downloadProcessed(processedUrl)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Passport Photo</span>
                      </button>
                      <button
                        onClick={() => {
                          setOriginalFile(null);
                          setOriginalUrl(null);
                          setProcessedUrl(null);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                      >
                        Upload Another
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
