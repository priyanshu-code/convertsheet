"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  FileVideo,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Subtitles,
  Copy,
  Clock,
  Globe,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull, resolvePublicDownloadUrl } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export function AutoSubtitleTool() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("auto");
  const [format, setFormat] = useState<"srt" | "vtt">("srt");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [subtitlesText, setSubtitlesText] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setSegments([]);
    setSubtitlesText(null);
  };

  const generateSubtitles = async () => {
    if (!file) {
      setError("Please select a video or audio file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgressStage("Transcribing video timestamps via Whisper Large-v3...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (language !== "auto") {
        formData.append("language", language);
      }
      formData.append("format", format);
      formData.append("tier", "pro");

      const data = await dispatchMediaJob("subtitles/generate", formData);

      const processSubData = (res: any) => {
        if (res.segments) setSegments(res.segments);
        if (res.srt || res.text || res.vtt) {
          setSubtitlesText(res.srt || res.vtt || res.text);
        } else if (res.segments) {
          setSubtitlesText(buildSrt(res.segments));
        }
      };

      if (data.segments || data.srt || data.vtt) {
        processSubData(data);
      } else if (data.job_id) {
        setProgressStage("Aligning exact millisecond word timestamps...");
        const fullResult: any = await pollMediaJobFull(data.job_id, 90, 1500);
        processSubData(fullResult);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate subtitles. Please retry.");
    } finally {
      setIsProcessing(false);
      setProgressStage("");
    }
  };

  const buildSrt = (segs: SubtitleSegment[]) => {
    return segs
      .map((s, idx) => {
        return `${idx + 1}\n${formatSrtTime(s.start)} --> ${formatSrtTime(s.end)}\n${s.text.trim()}\n`;
      })
      .join("\n");
  };

  const formatSrtTime = (seconds: number) => {
    const pad = (num: number, size: number) => num.toString().padStart(size, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(millis, 3)}`;
  };

  const downloadFile = (ext: string) => {
    if (!subtitlesText) return;
    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "subtitles";
    const blob = new Blob([subtitlesText], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = () => {
    if (!subtitlesText) return;
    navigator.clipboard.writeText(subtitlesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Upload Video/Audio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            1. Select Video or Audio File
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
              aria-label="Upload video or audio file for subtitles"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="video/*,audio/*,.mp4,.mov,.mkv,.webm,.mp3,.wav,.m4a"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Subtitles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {file ? file.name : "Click to select or drag & drop video"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {file
                    ? `${formatBytes(file.size)} • Ready to subtitle`
                    : "Supports MP4, MOV, MKV, MP3, WAV up to 500MB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Language & Format Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label htmlFor="subtitle-language" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Spoken Language
            </label>
            <select
              id="subtitle-language"
              aria-label="Spoken Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
            >
              <option value="auto">Auto-Detect Language (99+ supported)</option>
              <option value="en">English</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="zh">Mandarin Chinese (中文)</option>
              <option value="pt">Portuguese (Português)</option>
              <option value="ar">Arabic (العربية)</option>
              <option value="ja">Japanese (日本語)</option>
            </select>
          </div>

          <div>
            <label htmlFor="subtitle-format" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Subtitle Format
            </label>
            <select
              id="subtitle-format"
              aria-label="Subtitle Format"
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
            >
              <option value="srt">SubRip (.srt) - YouTube, Premiere, DaVinci</option>
              <option value="vtt">WebVTT (.vtt) - HTML5 Video & Web Players</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={generateSubtitles}
            disabled={isProcessing || !file}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{progressStage || "Generating Subtitles..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Synced Subtitles</span>
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        {subtitlesText && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" /> Subtitles Ready ({segments.length} lines)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadFile("srt")}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .SRT</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadFile("vtt")}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .VTT</span>
                </button>
              </div>
            </div>

            {/* Subtitle Inspector Box */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 max-h-[350px] overflow-y-auto">
              <pre className="font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed select-all">
                {subtitlesText}
              </pre>
            </div>
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Video data is purged from worker storage immediately after subtitle extraction.</span>
        </div>
      </div>
    </div>
  );
}
