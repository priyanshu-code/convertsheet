"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Download,
  Sparkles,
  RefreshCw,
  Scale,
  Lock,
  Unlock,
  Check,
  ArrowRight,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull, resolvePublicDownloadUrl } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";
import { StudioDropZone } from "./StudioDropZone";

interface KbImageResizerProps {
  defaultTargetKb?: number;
  defaultMinKb?: number;
  title?: string;
  subtitle?: string;
}

const PRESET_KB_PILLS = [20, 50, 100, 200, 500];

const GOVERNMENT_PRESETS = [
  { label: "India Passport (3.5 x 4.5 cm)", w: 413, h: 531, kb: 50 },
  { label: "US Visa 2x2 Inch (600 x 600 px)", w: 600, h: 600, kb: 100 },
  { label: "SSC / UPSC Exam (20-50 KB)", w: 200, h: 230, kb: 50, minKb: 20 },
  { label: "Signature Upload (10-20 KB)", w: 140, h: 60, kb: 20, minKb: 10 },
];

export function KbImageResizerTool({
  defaultTargetKb = 50,
  defaultMinKb,
  title = "Target KB Image Resizer & Compressor",
  subtitle = "Compress images to exact KB sizes (20KB, 50KB, 100KB) for job applications, passports, and visa portals.",
}: KbImageResizerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetKb, setTargetKb] = useState<number>(defaultTargetKb);
  const [minKb, setMinKb] = useState<number | undefined>(defaultMinKb);
  const [format, setFormat] = useState<"jpeg" | "webp" | "png">("jpeg");

  // Dimensional constraints
  const [customDimensions, setCustomDimensions] = useState<boolean>(false);
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [originalAspect, setOriginalAspect] = useState<number>(1);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTargetKb(defaultTargetKb);
    if (defaultMinKb) setMinKb(defaultMinKb);
  }, [defaultTargetKb, defaultMinKb]);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setResult(null);
    setProcessedUrl(null);

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Read natural dimensions
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOriginalAspect(img.width / img.height);
      if (!customDimensions) {
        setWidth(img.width);
        setHeight(img.height);
      }
    };
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setProcessedUrl(null);
    setError(null);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && originalAspect) {
      setHeight(Math.round(val / originalAspect));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && originalAspect) {
      setWidth(Math.round(val * originalAspect));
    }
  };

  const applyPreset = (preset: typeof GOVERNMENT_PRESETS[0]) => {
    setTargetKb(preset.kb);
    if (preset.minKb) setMinKb(preset.minKb);
    setCustomDimensions(true);
    setWidth(preset.w);
    setHeight(preset.h);
  };

  const processImage = async () => {
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_kb", targetKb.toString());
      if (minKb) {
        formData.append("min_kb", minKb.toString());
      }
      formData.append("format", format);
      if (customDimensions && width && height) {
        formData.append("width", width.toString());
        formData.append("height", height.toString());
        formData.append("fit", "inside");
      }
      formData.append("strip_metadata", "true");
      formData.append("tier", "free");

      const data = await dispatchMediaJob("image/transform", formData);

      if (data.download_url || data.output_path) {
        const raw = data.download_url || data.output_path;
        setResult(data);
        setProcessedUrl(resolvePublicDownloadUrl(raw));
      } else if (data.job_id) {
        const fullResult: any = await pollMediaJobFull(data.job_id, 40, 1000);
        const raw = fullResult.download_url || fullResult.output_path;
        setResult(fullResult);
        if (raw) {
          setProcessedUrl(resolvePublicDownloadUrl(raw));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to resize image to target KB. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessed = () => {
    if (!processedUrl) return;
    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "image";
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `${baseName}_${targetKb}kb.${format === "jpeg" ? "jpg" : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const outputBytes = result?.bytes || result?.output_size_bytes;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>

      {/* Two-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Canvas & Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <StudioDropZone
            onFileSelect={handleFileSelect}
            currentFile={file}
            onClear={handleClear}
            title="Click to select or drag & drop photo"
            subtitle="Supports JPG, PNG, WebP up to 50MB"
            acceptedExtensions={[".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]}
          />

          {/* Canvas Preview Area */}
          {previewUrl && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {processedUrl ? "Optimized Output Preview" : "Source Photo Preview"}
                </span>
                {width && height ? (
                  <span className="font-mono text-[11px] text-zinc-500">
                    {width} × {height} px
                  </span>
                ) : null}
              </div>

              <div className="relative flex items-center justify-center min-h-[280px] max-h-[420px] bg-zinc-50 dark:bg-zinc-950/60 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={processedUrl || previewUrl}
                  alt={file?.name || "Image Preview"}
                  className="max-h-[380px] max-w-full object-contain rounded-lg shadow-xs"
                />
              </div>

              {/* Byte Delta Banner when processed */}
              {result && processedUrl && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      Ready Under {targetKb} KB
                    </span>
                    {file && outputBytes && (
                      <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                        <span className="line-through">{formatBytes(file.size)}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-400" />
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {formatBytes(outputBytes)}
                        </span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={downloadProcessed}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {format.toUpperCase()}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Precision Parameters & Actions (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 sm:p-6 shadow-sm space-y-5">
          {/* Section 1: Target Size */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Target Size (KB)
              </label>
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                Max {targetKb} KB
              </span>
            </div>

            {/* Quick KB Pills */}
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_KB_PILLS.map((kb) => (
                <button
                  key={kb}
                  type="button"
                  onClick={() => setTargetKb(kb)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    targetKb === kb
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-xs"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 text-xs font-semibold"
                  }`}
                >
                  <span className="text-xs">{kb} KB</span>
                </button>
              ))}
            </div>

            {/* Target KB Number Slider & Input */}
            <div className="pt-1">
              <input
                type="range"
                min="5"
                max="1000"
                step="5"
                value={targetKb}
                aria-label="Target image size in kilobytes"
                onChange={(e) => setTargetKb(parseInt(e.target.value) || 50)}
                className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Official Exam & Government Presets */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Official Portal Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {GOVERNMENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-left text-xs px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                >
                  <p className="font-semibold truncate">{p.label}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {p.w}×{p.h}px • {p.kb}KB
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Exact Dimensions & Format */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Dimensions &amp; Format
              </span>

              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                  lockAspectRatio
                    ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-400"
                }`}
                title="Lock Aspect Ratio"
              >
                {lockAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span className="text-[10px]">Lock Ratio</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="kb-custom-width" className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Width (px)
                </label>
                <input
                  id="kb-custom-width"
                  aria-label="Width in pixels"
                  type="number"
                  value={width}
                  onChange={(e) => {
                    setCustomDimensions(true);
                    handleWidthChange(parseInt(e.target.value) || 0);
                  }}
                  placeholder="Auto"
                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label htmlFor="kb-custom-height" className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Height (px)
                </label>
                <input
                  id="kb-custom-height"
                  aria-label="Height in pixels"
                  type="number"
                  value={height}
                  onChange={(e) => {
                    setCustomDimensions(true);
                    handleHeightChange(parseInt(e.target.value) || 0);
                  }}
                  placeholder="Auto"
                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="kb-output-format" className="block text-[11px] font-medium text-zinc-500 mb-1">
                Output Format
              </label>
              <select
                id="kb-output-format"
                aria-label="Output Format"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="jpeg">JPG / JPEG (Universal Acceptance)</option>
                <option value="webp">WebP (Smallest File Size)</option>
                <option value="png">PNG (Lossless)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={processImage}
              disabled={isProcessing || !file}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compressing to {targetKb} KB...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compress Image to {targetKb} KB</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
