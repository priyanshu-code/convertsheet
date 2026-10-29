"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { formatBytes } from "@/lib/utils";
import { dispatchMediaJob, pollMediaJob } from "@/lib/media-engine-client";

export function FaceUnblurTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [fidelity, setFidelity] = useState<number>(0.75); // 0.0 to 1.0 balance between restore & natural
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP or HEIC).");
      return;
    }
    setError(null);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
  };

  const restoreFace = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", originalFile);
      formData.append("fidelity", fidelity.toString());
      formData.append("tier", "pro");
      formData.append("output_format", "auto");

      const data = await dispatchMediaJob("vision/restore-faces", formData);

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
      setError(err.message || "Failed to restore faces. Please check your image format and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `unblurred_${originalFile?.name || "portrait.jpg"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Interactive Demonstration Slider (Before/After Proof) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Interactive AI Example
          </span>
          <span>Slide left/right to see facial detail & eye reconstruction</span>
        </div>
        <BeforeAfterSlider
          beforeImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=20&blur=8"
          afterImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=95"
          beforeLabel="Blurry / Low-Res Face"
          afterLabel="AI Face Restored (GFPGAN)"
          aspectRatio="aspect-[16/9] sm:aspect-[21/9]"
        />
      </div>

      {/* Main Control Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Dropzone */}
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
              aria-label="Upload photo to unblur"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Upload Blurry Photo or Vintage Portrait
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Drag & drop any photo with blurry, out-of-focus, or pixelated faces. AI automatically detects and reconstructs all facial features.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* If Processed: Show Interactive Before/After of THEIR OWN PHOTO */}
            {processedUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>✓ Face Enhancement Completed</span>
                  <span className="text-zinc-400 font-normal">Drag to compare results</span>
                </div>
                <BeforeAfterSlider
                  beforeImage={originalUrl}
                  afterImage={processedUrl}
                  beforeLabel="Your Upload"
                  afterLabel="Restored Face"
                  aspectRatio="aspect-[4/3] sm:aspect-[16/9]"
                />
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <button
                    onClick={() => downloadImage(processedUrl)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Restored Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      setOriginalFile(null);
                      setOriginalUrl(null);
                      setProcessedUrl(null);
                    }}
                    className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                  >
                    Restore Another Photo
                  </button>
                </div>
              </div>
            ) : (
              /* Pre-processing Settings Bar */
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={originalUrl}
                    alt="Original Upload"
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {originalFile?.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatBytes(originalFile?.size || 0)} • Ready for AI face detection
                    </div>
                  </div>
                </div>

                {/* Restoration Fidelity Slider */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Restoration Fidelity
                    </span>
                    <span className="text-zinc-500 font-mono">{Math.round(fidelity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="0.95"
                    step="0.05"
                    value={fidelity}
                    onChange={(e) => setFidelity(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Subtle (Retain vintage grain)</span>
                    <span>Balanced</span>
                    <span>Maximum Clarity</span>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={restoreFace}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Restoring Faces on GPU Engine...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Unblur Faces Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy Assurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Photos are processed in isolated GPU memory and automatically deleted after 20 minutes.</span>
        </div>
      </div>
    </div>
  );
}
