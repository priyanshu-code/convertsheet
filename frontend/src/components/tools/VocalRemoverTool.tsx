"use client";

import React, { useState, useRef } from "react";
import {
  Mic,
  Music,
  Sliders,
  Volume2,
  VolumeX,
  UploadCloud,
  FileAudio,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Play,
  Pause,
  Layers,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull, resolvePublicDownloadUrl } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface StemResult {
  vocals_path?: string;
  instrumental_path?: string;
  drums_path?: string;
  bass_path?: string;
  other_path?: string;
  duration_seconds?: number;
  engine?: string;
}

export function VocalRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"acapella" | "4stems">("acapella");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [vocalsUrl, setVocalsUrl] = useState<string | null>(null);
  const [instrumentalUrl, setInstrumentalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalAudioUrl(url);
    setVocalsUrl(null);
    setInstrumentalUrl(null);
  };

  const separateVocals = async () => {
    if (!file) {
      setError("Please select an audio or song file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgressStage("Uploading song to GPU Demucs neural worker...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", "high");
      formData.append("tier", "pro");

      const endpoint = mode === "acapella" ? "stems/acapella" : "stems/split";
      const data = await dispatchMediaJob(endpoint, formData);

      const processStemData = (res: any) => {
        if (res.vocals_path) {
          setVocalsUrl(resolvePublicDownloadUrl(res.vocals_path));
        }
        if (res.instrumental_path || res.no_vocals_path) {
          setInstrumentalUrl(resolvePublicDownloadUrl(res.instrumental_path || res.no_vocals_path));
        }
      };

      if (data.vocals_path || data.instrumental_path) {
        processStemData(data);
      } else if (data.job_id) {
        setProgressStage("Separating vocal frequencies and instruments via Demucs neural network...");
        const fullResult: any = await pollMediaJobFull(data.job_id, 90, 1500);
        processStemData(fullResult);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to separate vocals. Please retry.");
    } finally {
      setIsProcessing(false);
      setProgressStage("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Upload Audio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            1. Select Music or Vocal Track
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
              aria-label="Upload music or vocal track"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="audio/*,.mp3,.wav,.m4a,.flac,.aac,.ogg"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {file ? file.name : "Click to select or drag & drop song"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {file
                    ? `${formatBytes(file.size)} • Ready to isolate`
                    : "Supports MP3, WAV, FLAC, M4A up to 100MB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Separation Mode */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            2. Choose Isolation Target (Demucs v4 Neural Engine)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("acapella")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                mode === "acapella"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-500" /> Vocals + Instrumental
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-600">
                  Acapella & Karaoke
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Splits audio into an isolated vocal track and a clean backing instrumental.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("4stems")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                mode === "4stems"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-500" /> Full 4-Stem Split
                </span>
                <span className="text-[10px] font-bold uppercase text-purple-600">
                  Studio Multitrack
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Extracts individual vocals, drums, bass, and melodic instruments.
              </p>
            </button>
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
            onClick={separateVocals}
            disabled={isProcessing || !file}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{progressStage || "Isolating Audio Stems..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Isolate Vocals & Instrumental</span>
              </>
            )}
          </button>
        </div>

        {/* Results Mixer */}
        {(vocalsUrl || instrumentalUrl) && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Isolated Audio Stems
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Isolated Vocals */}
              {vocalsUrl && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-emerald-500" /> Isolated Vocals (Acapella)
                    </span>
                    <a
                      href={vocalsUrl}
                      download="vocals_isolated.wav"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-500"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                  <audio src={vocalsUrl} controls className="w-full h-10" />
                </div>
              )}

              {/* Isolated Instrumental */}
              {instrumentalUrl && (
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-800 dark:text-purple-200 flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-purple-500" /> Backing Track (Karaoke / Instrumental)
                    </span>
                    <a
                      href={instrumentalUrl}
                      download="instrumental_backing.wav"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-500"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                  <audio src={instrumentalUrl} controls className="w-full h-10" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Audio files are processed strictly in RAM and permanently deleted immediately after generation.</span>
        </div>
      </div>
    </div>
  );
}
