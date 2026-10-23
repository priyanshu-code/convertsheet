"use client";

import React, { useState, useRef } from "react";
import {
  Volume2,
  VolumeX,
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Sliders,
  Mic,
  RotateCcw,
  Zap,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull, MEDIA_ENGINE_BASE_URL } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface AudioCleanerResult {
  output_path?: string;
  cleaned_audio_path?: string;
  download_url?: string;
  duration_seconds?: number;
  engine?: string;
}

export function AudioNoiseReducerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [cleanedAudioUrl, setCleanedAudioUrl] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<"subtle" | "medium" | "maximum">("maximum");
  const [postFilter, setPostFilter] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const cleanedAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalAudioUrl(url);
    setCleanedAudioUrl(null);
  };

  const cleanAudio = async () => {
    if (!file) {
      setError("Please select an audio file to clean.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("intensity", intensity);
      formData.append("post_filter", postFilter ? "true" : "false");
      formData.append("output_format", "wav");
      formData.append("tier", "free");

      const data = await dispatchMediaJob("audio/denoise", formData);

      const resolveAudioUrl = (raw: string) => {
        if (!raw) return null;
        if (raw.startsWith("http")) return raw;
        const filename = raw.split("/").pop();
        return `${MEDIA_ENGINE_BASE_URL}/media/api/v1/download/files/${filename}`;
      };

      if (data.cleaned_audio_path || data.output_path || data.download_url) {
        const raw = data.download_url || data.cleaned_audio_path || data.output_path;
        setCleanedAudioUrl(resolveAudioUrl(raw));
        setDuration(data.duration_seconds || null);
      } else if (data.job_id) {
        const result: any = await pollMediaJobFull(data.job_id);
        const raw = result.download_url || result.cleaned_audio_path || result.output_path;
        if (raw) {
          setCleanedAudioUrl(resolveAudioUrl(raw));
          setDuration(result.duration_seconds || null);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to remove background noise. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCleaned = () => {
    if (!cleanedAudioUrl) return;
    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "audio";
    const a = document.createElement("a");
    a.href = cleanedAudioUrl;
    a.download = `${baseName}_cleaned.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Upload Audio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            1. Select Audio or Voice Recording
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
              accept=".mp3,.wav,.m4a,.aac,.flac,.ogg,.webm,.mp4"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {file ? file.name : "Click to select or drag & drop noisy audio"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {file
                    ? `${formatBytes(file.size)} • Ready for noise suppression`
                    : "Supports MP3, WAV, M4A, FLAC, AAC up to 100MB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Noise Suppression Intensity */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            2. Choose Noise Suppression Level (DeepFilterNet 3)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setIntensity("subtle")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                intensity === "subtle"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Subtle (20 dB)
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Gentle hiss reduction; preserves room natural warmth.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIntensity("medium")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                intensity === "medium"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Medium (50 dB)
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Best for podcasts, interviews & desk fans.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIntensity("maximum")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                intensity === "maximum"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Maximum (100 dB)
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-600">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Deep neural isolation; removes traffic, AC & heavy drone.
              </p>
            </button>
          </div>
        </div>

        {/* Post-filter toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Harmonic Post-Filter (Smooths residual artifacts)</span>
          </div>
          <input
            type="checkbox"
            checked={postFilter}
            onChange={(e) => setPostFilter(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={cleanAudio}
            disabled={isProcessing || !file}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Removing Background Noise & Echo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Clean & Isolate Voice</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Before & After Comparison */}
        {(originalAudioUrl || cleanedAudioUrl) && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Audio Comparison Player
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Noisy Audio */}
              {originalAudioUrl && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-zinc-400" /> Original Noisy Audio
                    </span>
                    <span className="text-[11px] text-zinc-400">Before</span>
                  </div>
                  <audio
                    ref={originalAudioRef}
                    src={originalAudioUrl}
                    controls
                    className="w-full h-10 mt-1"
                  />
                </div>
              )}

              {/* Cleaned Studio Audio */}
              {cleanedAudioUrl && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" /> Cleaned Studio Voice
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Noise Removed
                    </span>
                  </div>
                  <audio
                    ref={cleanedAudioRef}
                    src={cleanedAudioUrl}
                    controls
                    autoPlay
                    className="w-full h-10 mt-1"
                  />
                </div>
              )}
            </div>

            {cleanedAudioUrl && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={downloadCleaned}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Cleaned WAV</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Uploaded audio is processed in memory and never stored or retained on any permanent server.</span>
        </div>
      </div>
    </div>
  );
}
