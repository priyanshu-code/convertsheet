"use client";

import React, { useState } from "react";
import {
  Download,
  Youtube,
  Instagram,
  Music,
  Video,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  AlertTriangle,
  Play,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  dispatchJsonMediaJob,
  pollMediaJobFull,
  resolvePublicDownloadUrl,
} from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface MediaProbeData {
  platform: "youtube" | "instagram";
  media_type: string;
  title?: string;
  author?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  caption?: string;
}

interface DownloadJobResult {
  download_url?: string;
  file_path?: string;
  duration_seconds?: number;
  original_size_bytes?: number;
  compressed_size_bytes?: number;
  compression_ratio?: string;
  title?: string;
}

export function MediaDownloaderTool({ defaultPlatform = "youtube" }: { defaultPlatform?: "youtube" | "instagram" }) {
  const [url, setUrl] = useState<string>("");
  const [mode, setMode] = useState<"video" | "audio_only">("video");
  const [maxResolution, setMaxResolution] = useState<string>("1080p");
  const [includeSubtitles, setIncludeSubtitles] = useState<boolean>(false);
  const [optimize, setOptimize] = useState<boolean>(true);

  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeData, setProbeData] = useState<MediaProbeData | null>(null);

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [result, setResult] = useState<DownloadJobResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectPlatform = (inputUrl: string): "youtube" | "instagram" => {
    if (inputUrl.includes("instagram.com")) return "instagram";
    return "youtube";
  };

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setError(null);
    setResult(null);
    setDownloadUrl(null);

    const trimmed = newUrl.trim();
    if (
      trimmed.startsWith("http") &&
      (trimmed.includes("youtube.com") || trimmed.includes("youtu.be") || trimmed.includes("instagram.com"))
    ) {
      probeUrl(trimmed);
    } else {
      setProbeData(null);
    }
  };

  const probeUrl = async (targetUrl: string) => {
    setIsProbing(true);
    try {
      const data = await dispatchJsonMediaJob("download/probe", { url: targetUrl });
      if (data && (data.title || data.author || data.thumbnail_url)) {
        setProbeData(data as MediaProbeData);
      }
    } catch (err: any) {
      console.warn("Probe failed or skipped:", err);
    } finally {
      setIsProbing(false);
    }
  };

  const startDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a valid YouTube or Instagram URL.");
      return;
    }

    setIsDownloading(true);
    setError(null);
    setProgressStage("Fetching media streams from server...");

    try {
      const platform = detectPlatform(url);
      const endpoint = platform === "instagram" ? "download/instagram" : "download/youtube";

      const payload: Record<string, any> = {
        url: url.trim(),
        mode: mode,
        max_resolution: maxResolution,
        optimize: optimize,
      };

      if (platform === "youtube") {
        payload.include_subtitles = includeSubtitles;
        payload.audio_format = "mp3";
      }

      const data = await dispatchJsonMediaJob(endpoint, payload);

      if (data.download_url || data.file_path) {
        const raw = data.download_url || data.file_path;
        setResult(data as DownloadJobResult);
        setDownloadUrl(resolvePublicDownloadUrl(raw));
      } else if (data.job_id) {
        setProgressStage("Downloading and transcoding to high-bitrate format...");
        const fullResult: any = await pollMediaJobFull(data.job_id, 90, 1500);
        const raw = fullResult.download_url || fullResult.file_path || fullResult.output_path;
        setResult(fullResult as DownloadJobResult);
        if (raw) {
          setDownloadUrl(resolvePublicDownloadUrl(raw));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to download media. Please verify URL accessibility and retry.");
    } finally {
      setIsDownloading(false);
      setProgressStage("");
    }
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: URL Input Bar */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Paste YouTube Video, Shorts, or Instagram Reel URL
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                {url.includes("instagram.com") ? (
                  <Instagram className="w-5 h-5 text-pink-500" />
                ) : (
                  <Youtube className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={startDownload}
              disabled={isDownloading || !url.trim()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Probed Metadata Card */}
        {probeData && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in duration-150">
            {probeData.thumbnail_url && (
              <div className="relative w-28 h-20 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-black shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={probeData.thumbnail_url}
                  alt={probeData.title || "Thumbnail"}
                  className="w-full h-full object-cover"
                />
                {probeData.duration_seconds && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {formatDuration(probeData.duration_seconds)}
                  </span>
                )}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {probeData.title || "Video Found"}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                {probeData.author && <span>{probeData.author}</span>}
                {probeData.width && probeData.height && (
                  <span>• {probeData.width}x{probeData.height}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Format & Option Controls */}
        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Download Format & Quality
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("video")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                mode === "video"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-500" /> Video (MP4)
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase">
                  Up to 1080p
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Full video with sound optimized for phone and desktop playback.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("audio_only")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                mode === "audio_only"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-blue-500" /> Audio Only (MP3)
                </span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase">
                  320 kbps
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Extract soundtrack or podcast audio in high-bitrate MP3 format.
              </p>
            </button>
          </div>

          {/* Video Options Sub-bar */}
          {mode === "video" && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-medium">Resolution Cap:</span>
                <select
                  value={maxResolution}
                  onChange={(e) => setMaxResolution(e.target.value)}
                  className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="480p">480p SD</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={optimize}
                    onChange={(e) => setOptimize(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <span>Web FastStart</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={includeSubtitles}
                    onChange={(e) => setIncludeSubtitles(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <span>Subtitles (.srt)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Display */}
        {isDownloading && (
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            <span>{progressStage || "Processing media pipeline..."}</span>
          </div>
        )}

        {/* Results Card */}
        {downloadUrl && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" /> Media Ready
                </span>
                {result?.compressed_size_bytes && (
                  <span className="text-zinc-500 font-mono">
                    {formatBytes(result.compressed_size_bytes)}
                  </span>
                )}
              </div>

              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device</span>
              </a>
            </div>

            {/* In-browser preview */}
            {mode === "video" ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black flex justify-center">
                <video src={downloadUrl} controls className="max-h-[380px] w-auto" />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <audio src={downloadUrl} controls className="w-full h-10" />
              </div>
            )}
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Downloaded media files are buffered in ephemeral cache and auto-reaped every 60 minutes.</span>
        </div>
      </div>
    </div>
  );
}
