"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Sliders,
  Scale,
  Maximize2,
  Lock,
  Unlock,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull, resolvePublicDownloadUrl } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header Title if customized */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        {/* Step 1: Upload Image */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            1. Select Photo or Document Image
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
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {file ? file.name : "Click to select or drag & drop photo"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {file
                    ? `${formatBytes(file.size)} • Ready to compress`
                    : "Supports JPG, PNG, WebP, TIFF up to 50MB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Target Size Selection */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              2. Target Size (KB)
            </label>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Max {targetKb} KB
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {PRESET_KB_PILLS.map((kb) => (
              <button
                key={kb}
                type="button"
                onClick={() => setTargetKb(kb)}
                className={`py-3 px-3 rounded-2xl border text-center transition-all ${
                  targetKb === kb
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300 font-semibold"
                }`}
              >
                <span className="text-sm">{kb} KB</span>
              </button>
            ))}
          </div>

          {/* Quick Government Portal Presets */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Government & Exam Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {GOVERNMENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Exact Dimensions & Format */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-500" /> Output Format & Dimensions
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                  lockAspectRatio
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50/50"
                    : "border-zinc-200 text-zinc-400"
                }`}
                title="Lock Aspect Ratio"
              >
                {lockAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span className="text-[10px] hidden sm:inline">Lock Ratio</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Target Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="jpeg">JPG / JPEG (Standard)</option>
                <option value="webp">WebP (Smallest File)</option>
                <option value="png">PNG (Lossless)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Width (Pixels)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => {
                  setCustomDimensions(true);
                  handleWidthChange(parseInt(e.target.value) || 0);
                }}
                placeholder="Original"
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Height (Pixels)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => {
                  setCustomDimensions(true);
                  handleHeightChange(parseInt(e.target.value) || 0);
                }}
                placeholder="Original"
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
              />
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
            onClick={processImage}
            disabled={isProcessing || !file}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing to {targetKb} KB...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compress Image to {targetKb} KB</span>
              </>
            )}
          </button>
        </div>

        {/* Results Card */}
        {result && processedUrl && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" /> Ready Under {targetKb} KB
                </span>
                {result.original_size_bytes && result.output_size_bytes && (
                  <span className="text-zinc-500">
                    <strong>{formatBytes(result.original_size_bytes)}</strong> →{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatBytes(result.output_size_bytes)}
                    </strong>{" "}
                    ({result.compression_ratio || "Done"})
                  </span>
                )}
                {result.duration_seconds && (
                  <span className="text-zinc-400 font-mono">
                    {(result.duration_seconds * 1000).toFixed(0)}ms
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={downloadProcessed}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </button>
            </div>

            {/* Image Preview */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={processedUrl}
                alt="Compressed"
                className="max-h-[350px] object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Image compression is performed on high-speed RAM workers and immediately removed upon delivery.</span>
        </div>
      </div>
    </div>
  );
}
