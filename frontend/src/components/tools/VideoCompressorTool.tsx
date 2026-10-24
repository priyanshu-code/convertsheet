"use client";

import React, { useState, useRef } from "react";
import {
  Video,
  UploadCloud,
  FileVideo,
  Play,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Sliders,
  Zap,
  ArrowRight,
  Settings,
  HardDrive,
  Film,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull, resolvePublicDownloadUrl } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface VideoCompressResult {
  output_path?: string;
  download_url?: string;
  original_size_bytes?: number;
  compressed_size_bytes?: number;
  compression_ratio?: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  codec?: string;
  bitrate_kbps?: number;
}

const PRESET_TARGETS = [
  { label: "WhatsApp", mb: 16, desc: "Instant mobile sharing" },
  { label: "Discord", mb: 25, desc: "Free tier file limit" },
  { label: "Email", mb: 20, desc: "Standard attachment ceiling" },
  { label: "Web HD", mb: 50, desc: "Balanced streamable MP4" },
];

export function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSizeMb, setTargetSizeMb] = useState<number>(25);
  const [maxResolution, setMaxResolution] = useState<string>("1080p");
  const [codec, setCodec] = useState<string>("h264");
  const [preset, setPreset] = useState<string>("medium");
  const [isCustomTarget, setIsCustomTarget] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [result, setResult] = useState<VideoCompressResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setResult(null);
    setDownloadUrl(null);

    // Auto-adjust target if input is already smaller
    const fileMb = selectedFile.size / (1024 * 1024);
    if (fileMb < 25 && fileMb > 5) {
      setTargetSizeMb(Math.floor(fileMb * 0.5));
    }
  };

  const compressVideo = async () => {
    if (!file) {
      setError("Please select a video file to compress.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgressStage("Uploading video file to GPU worker...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (targetSizeMb > 0) {
        formData.append("target_size_mb", targetSizeMb.toString());
      }
      formData.append("max_resolution", maxResolution);
      formData.append("codec", codec);
      formData.append("preset", preset);
      formData.append("faststart", "true");

      const data = await dispatchMediaJob("video/compress", formData);

      if (data.download_url || data.output_path) {
        const raw = data.download_url || data.output_path;
        setResult(data as VideoCompressResult);
        setDownloadUrl(resolvePublicDownloadUrl(raw));
      } else if (data.job_id) {
        setProgressStage("Encoding video with two-pass bitrate optimization...");
        const fullResult: any = await pollMediaJobFull(data.job_id, 90, 1500);
        const raw = fullResult.download_url || fullResult.output_path || fullResult.output_video_path;
        setResult(fullResult as VideoCompressResult);
        if (raw) {
          setDownloadUrl(resolvePublicDownloadUrl(raw));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to compress video. Please retry.");
    } finally {
      setIsProcessing(false);
      setProgressStage("");
    }
  };

  const downloadCompressed = () => {
    if (!downloadUrl) return;
    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "video";
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${baseName}_compressed.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Upload Video */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            1. Select Video File
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
              aria-label="Upload video file"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {file ? file.name : "Click to select or drag & drop video"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {file
                    ? `${formatBytes(file.size)} • Ready to optimize`
                    : "Supports MP4, MOV, MKV, WebM, AVI up to 2GB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Target Size Presets */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              2. Target Size & Limit
            </label>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {targetSizeMb} MB Target
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_TARGETS.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setTargetSizeMb(t.mb);
                  setIsCustomTarget(false);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  targetSizeMb === t.mb && !isCustomTarget
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {t.label}
                  </span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {t.mb}MB
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Custom Size Slider */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-500" /> Custom Target Size
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {targetSizeMb} MB
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="200"
              step="1"
              value={targetSizeMb}
              aria-label="Custom Target Size in MB"
              onChange={(e) => {
                setTargetSizeMb(parseInt(e.target.value));
                setIsCustomTarget(true);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>2 MB (Micro)</span>
              <span>50 MB (Balanced)</span>
              <span>200 MB (Near Lossless)</span>
            </div>
          </div>
        </div>

        {/* Advanced Encoding Accordion */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-zinc-400" /> Advanced Codec & Resolution Options
            </span>
            <span className="text-zinc-400">{showAdvanced ? "▲" : "▼"}</span>
          </button>

          {showAdvanced && (
            <div className="p-4 bg-white dark:bg-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Resolution Ceiling
                </label>
                <select
                  value={maxResolution}
                  onChange={(e) => setMaxResolution(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="1080p">1080p Full HD (Default)</option>
                  <option value="720p">720p HD</option>
                  <option value="480p">480p SD</option>
                  <option value="360p">360p Low Bandwidth</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Video Codec
                </label>
                <select
                  value={codec}
                  onChange={(e) => setCodec(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="h264">H.264 (Universal Compatibility)</option>
                  <option value="h265">HEVC / H.265 (High Efficiency)</option>
                  <option value="av1">AV1 (Next-Gen Open)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Compression Preset
                </label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="fast">Fast (Quick turnaround)</option>
                  <option value="medium">Medium (Recommended)</option>
                  <option value="slow">Slow (Maximum Quality)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Compress Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={compressVideo}
            disabled={isProcessing || !file}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{progressStage || "Compressing Video..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compress to ~{targetSizeMb} MB</span>
              </>
            )}
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" /> Compression Complete
                </span>
                {result.original_size_bytes && result.compressed_size_bytes && (
                  <span className="text-zinc-500">
                    <strong>{formatBytes(result.original_size_bytes)}</strong> →{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {formatBytes(result.compressed_size_bytes)}
                    </strong>{" "}
                    ({result.compression_ratio || "Optimized"} saved)
                  </span>
                )}
                {result.duration_seconds && (
                  <span className="text-zinc-400 font-mono">
                    {result.duration_seconds.toFixed(1)}s
                  </span>
                )}
              </div>

              {downloadUrl && (
                <button
                  type="button"
                  onClick={downloadCompressed}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4</span>
                </button>
              )}
            </div>

            {/* Video Player Preview */}
            {downloadUrl && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black flex justify-center">
                <video
                  ref={videoPlayerRef}
                  src={downloadUrl}
                  controls
                  className="max-h-[400px] w-auto"
                />
              </div>
            )}
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Videos are processed on dedicated hardware workers and unlinked immediately upon download completion.</span>
        </div>
      </div>
    </div>
  );
}
