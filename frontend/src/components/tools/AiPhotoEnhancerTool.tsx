"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Maximize2,
  ZoomIn,
} from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { formatBytes } from "@/lib/utils";
import { dispatchMediaJob, pollMediaJob } from "@/lib/media-engine-client";

export function AiPhotoEnhancerTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(4); // 2x or 4x
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image (JPG, PNG, WebP).");
      return;
    }
    setError(null);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
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

      const data = await dispatchMediaJob("vision/upscale", formData);

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
      setError(err.message || "Failed to enhance image. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `enhanced_${scale}x_${originalFile?.name || "image.png"}`;
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
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Upload Any Low-Quality or Pixelated Photo
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Our neural network reconstructs missing pixels, sharpens soft edges, and multiplies resolution by 400%.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {processedUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>✓ 4x AI Upscale Complete</span>
                  <span className="text-zinc-400 font-normal">Drag to compare resolution</span>
                </div>
                <BeforeAfterSlider
                  beforeImage={originalUrl}
                  afterImage={processedUrl}
                  beforeLabel="Original Upload"
                  afterLabel="4x Enhanced HD"
                  aspectRatio="aspect-[4/3] sm:aspect-[16/9]"
                />
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <button
                    onClick={() => downloadImage(processedUrl)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Enhanced Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      setOriginalFile(null);
                      setOriginalUrl(null);
                      setProcessedUrl(null);
                    }}
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
                      {formatBytes(originalFile?.size || 0)} • Ready for Real-ESRGAN upscaling
                    </div>
                  </div>
                </div>

                {/* Scale Multiplier */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-emerald-500" /> Upscaling Factor
                  </span>
                  <div className="flex gap-2">
                    {[2, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

                {error && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={enhanceImage}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Reconstructing Pixels on GPU...</span>
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
