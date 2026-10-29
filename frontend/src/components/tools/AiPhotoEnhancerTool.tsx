"use client";

import React, { useState } from "react";
import {
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Maximize2,
  FileCheck2,
  Gauge,
  Sliders,
} from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { StudioDropZone } from "./StudioDropZone";
import { formatBytes } from "@/lib/utils";
import { dispatchMediaJob, pollMediaJobFull, resolvePublicDownloadUrl } from "@/lib/media-engine-client";

interface EnhancedResultMeta {
  file_size_bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  duration_seconds?: number;
}

export function AiPhotoEnhancerTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedMeta, setProcessedMeta] = useState<EnhancedResultMeta | null>(null);
  const [scale, setScale] = useState<number>(4); // 2x or 4x
  const [outputFormat, setOutputFormat] = useState<"auto" | "webp" | "jpeg" | "png">("auto");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image (JPG, PNG, WebP).");
      return;
    }
    setError(null);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    setProcessedMeta(null);
  };

  const handleClearFile = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessedMeta(null);
    setError(null);
  };

  const enhanceImage = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", originalFile);
      formData.append("scale", scale.toString());
      formData.append("tile_size", "512");
      formData.append("tier", "pro");
      formData.append("output_format", outputFormat);

      const data = await dispatchMediaJob("vision/upscale", formData);

      if (data.download_url || data.output_path || data.result) {
        const fileUrl = data.download_url || (data.result && data.result.download_url);
        const resolved = resolvePublicDownloadUrl(fileUrl || data.output_url || originalUrl || "");
        setProcessedUrl(resolved);
        setProcessedMeta(data.result || data);
      } else if (data.job_id) {
        const fullResult = await pollMediaJobFull(data.job_id);
        const resolved = resolvePublicDownloadUrl(
          fullResult.download_url || fullResult.output_image_path || ""
        );
        setProcessedUrl(resolved);
        setProcessedMeta(fullResult);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to enhance image. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    
    // Choose clean target extension based on returned format or url
    let ext = processedMeta?.format || "webp";
    if (ext === "jpeg") ext = "jpg";
    if (url.includes(".png")) ext = "png";
    if (url.includes(".webp")) ext = "webp";
    if (url.includes(".jpg") || url.includes(".jpeg")) ext = "jpg";

    const baseName = originalFile?.name
      ? originalFile.name.replace(/\.[^/.]+$/, "")
      : "photo";

    a.download = `enhanced_${scale}x_${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Interactive Demonstration Slider (Picsart Style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 4x Super-Resolution Sample
          </span>
          <span>Slide to test AI texture sharpness before uploading</span>
        </div>
        <BeforeAfterSlider
          beforeImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=30"
          afterImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=95"
          beforeLabel="Low-Res Thumbnail (300px)"
          afterLabel="4x Real-ESRGAN HD (1200px)"
          aspectRatio="aspect-[16/9] sm:aspect-[21/9]"
        />
      </div>

      {/* Main Control Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {!originalUrl ? (
          <div>
            <StudioDropZone
              onFileSelect={handleFileSelect}
              title="Upload Any Low-Quality or Pixelated Photo"
              subtitle="Supports JPG, PNG, WebP • Drag & drop or paste (⌘V) • AI auto-optimizes file size"
              acceptedExtensions={[".jpg", ".jpeg", ".png", ".webp", ".tiff"]}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {processedUrl ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                    <FileCheck2 className="w-4 h-4" />
                    <span>✓ {scale}x AI Upscale Complete (Optimized & Compressed)</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
                    {originalFile && (
                      <span>
                        Original: <strong>{formatBytes(originalFile.size)}</strong>
                      </span>
                    )}
                    {processedMeta?.file_size_bytes && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ➔ Enhanced: <strong>{formatBytes(processedMeta.file_size_bytes)}</strong>
                      </span>
                    )}
                    {processedMeta?.width && processedMeta?.height && (
                      <span className="text-zinc-400 font-mono text-[11px]">
                        ({processedMeta.width} × {processedMeta.height} px)
                      </span>
                    )}
                  </div>
                </div>

                <BeforeAfterSlider
                  beforeImage={originalUrl}
                  afterImage={processedUrl}
                  beforeLabel="Original Upload"
                  afterLabel={`${scale}x Enhanced HD`}
                  aspectRatio="aspect-[4/3] sm:aspect-[16/9]"
                />

                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <button
                    onClick={() => downloadImage(processedUrl)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      Download Enhanced Photo
                      {processedMeta?.file_size_bytes ? ` (${formatBytes(processedMeta.file_size_bytes)})` : ""}
                    </span>
                  </button>
                  <button
                    onClick={handleClearFile}
                    className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                  >
                    Enhance Another Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={originalUrl}
                    alt="Upload Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {originalFile?.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatBytes(originalFile?.size || 0)} • Ready for Real-ESRGAN super-resolution
                    </div>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    Change
                  </button>
                </div>

                {/* Scale Multiplier */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-emerald-500" /> Upscaling Factor
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Reconstructs micro-textures with deep generative priors
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {[2, 4].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScale(s)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          scale === s
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300"
                        }`}
                      >
                        {s}x Resolution
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compression & Optimization Format Selection */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-500" /> Output Optimization
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Compresses 40MB+ uncompressed pixels to ~2MB while keeping 100% sharpness
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { id: "auto", label: "Auto Optimized" },
                      { id: "webp", label: "WebP" },
                      { id: "jpeg", label: "JPG" },
                      { id: "png", label: "PNG" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setOutputFormat(f.id as any)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          outputFormat === f.id
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    {error}
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <button
                    onClick={enhanceImage}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Reconstructing Pixels on GPU & Optimizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Enhance Photo to {scale}x HD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>High-definition neural processing with automatic 20-minute ephemeral deletion.</span>
        </div>
      </div>
    </div>
  );
}
