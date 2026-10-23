"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  Copy,
  Check,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Globe,
  Zap,
  Clock,
  FileText,
  FileCode,
  Edit3,
  Save,
  RotateCcw,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface Segment {
  start: number;
  end: number;
  text: string;
}

const SUPPORTED_LANGUAGES = [
  { value: "auto", label: "Auto-Detect Language" },
  { value: "hi", label: "Hindi (हिंदी / Hinglish)" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish (Español)" },
  { value: "fr", label: "French (Français)" },
  { value: "de", label: "German (Deutsch)" },
  { value: "pt", label: "Portuguese (Português)" },
  { value: "it", label: "Italian (Italiano)" },
  { value: "ru", label: "Russian (Русский)" },
  { value: "ja", label: "Japanese (日本語)" },
  { value: "zh", label: "Chinese (中文)" },
  { value: "ko", label: "Korean (한국어)" },
  { value: "ar", label: "Arabic (العربية)" },
  { value: "bn", label: "Bengali (বাংলা)" },
  { value: "mr", label: "Marathi (मराठी)" },
  { value: "te", label: "Telugu (తెలుగు)" },
  { value: "ta", label: "Tamil (தமிழ்)" },
  { value: "gu", label: "Gujarati (ગુજરાતી)" },
  { value: "ur", label: "Urdu (اردو)" },
  { value: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "nl", label: "Dutch (Nederlands)" },
  { value: "tr", label: "Turkish (Türkçe)" },
  { value: "pl", label: "Polish (Polski)" },
  { value: "vi", label: "Vietnamese (Tiếng Việt)" },
  { value: "id", label: "Indonesian (Bahasa)" },
];

export function SpeechToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<"auto" | "fast" | "multilingual">("auto");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [enableGpu, setEnableGpu] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"clean" | "timestamps">("clean");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Playback & Interactive Sync States
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableTranscript, setEditableTranscript] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    setTranscript(null);
    setSegments([]);
    setIsEditing(false);
  };

  const startRecording = async () => {
    try {
      setError(null);
      let mimeType = "";
      let ext = "webm";

      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
          ext = "webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
          ext = "m4a";
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const recordedFile = new File(
          [audioBlob],
          `recording_${Date.now()}.${ext}`,
          { type: mimeType || "audio/webm" }
        );
        handleFileSelect(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const transcribeAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", engineMode);
      if (selectedLanguage && selectedLanguage !== "auto") {
        formData.append("language", selectedLanguage);
      }
      formData.append(
        "tier",
        enableGpu || engineMode === "multilingual" ? "pro" : "free"
      );
      formData.append("provider", enableGpu ? "cuda" : "cpu");
      formData.append("device", enableGpu ? "cuda" : "cpu");

      const data = await dispatchMediaJob("stt/transcribe", formData);

      const applyResult = (res: any) => {
        const fullText = res.text || "";
        setTranscript(fullText);
        setEditableTranscript(fullText);
        setSegments(res.segments || []);
        setDetectedLang(res.language || "English");
        setDuration(res.duration_seconds || null);
      };

      if (data.text || data.segments) {
        applyResult(data);
      } else if (data.job_id) {
        const result = await pollMediaJobFull(data.job_id);
        applyResult(result);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Failed to transcribe audio. Please verify the format and retry."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const seekTo = (startSeconds: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = startSeconds;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackSpeed(rate);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = rate;
    }
  };

  const saveEditedTranscript = () => {
    setTranscript(editableTranscript);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    if (!transcript) return;
    const textToCopy =
      viewMode === "clean"
        ? transcript
        : segments
            .map(
              (s) =>
                `[${formatTime(s.start)} - ${formatTime(s.end)}] ${s.text}`
            )
            .join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!transcript) return;
    const content =
      viewMode === "clean"
        ? transcript
        : segments
            .map(
              (s) =>
                `[${formatTime(s.start)} - ${formatTime(s.end)}] ${s.text}`
            )
            .join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transcript_${Date.now()}.txt`;
    a.click();
  };

  const downloadSrt = () => {
    if (!segments.length) return;
    const srtContent = segments
      .map((seg, idx) => {
        return `${idx + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(
          seg.end
        )}\n${seg.text.trim()}\n`;
      })
      .join("\n");

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subtitles_${Date.now()}.srt`;
    a.click();
  };

  const downloadVtt = () => {
    if (!segments.length) return;
    const vttContent =
      "WEBVTT - ConvertSheet Transcription\n\n" +
      segments
        .map((seg, idx) => {
          return `${idx + 1}\n${formatVttTime(seg.start)} --> ${formatVttTime(
            seg.end
          )}\n${seg.text.trim()}\n`;
        })
        .join("\n");

    const blob = new Blob([vttContent], { type: "text/vtt;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subtitles_${Date.now()}.vtt`;
    a.click();
  };

  const downloadJson = () => {
    if (!transcript) return;
    const payload = {
      text: transcript,
      language: detectedLang,
      duration_seconds: duration,
      segments: segments,
      generated_by: "ConvertSheet AI Speech-to-Text",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transcript_${Date.now()}.json`;
    a.click();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatSrtTime = (seconds: number) => {
    const pad = (num: number, size: number) =>
      num.toString().padStart(size, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(
      millis,
      3
    )}`;
  };

  const formatVttTime = (seconds: number) => {
    const pad = (num: number, size: number) =>
      num.toString().padStart(size, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)}.${pad(
      millis,
      3
    )}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Engine Selection Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setEngineMode("auto")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            engineMode === "auto"
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Auto-Adaptive
          </div>
          <div className="text-sm font-semibold">Smart Routing</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Auto-detects language and picks the optimal low-latency engine.
          </p>
        </button>

        <button
          onClick={() => setEngineMode("fast")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            engineMode === "fast"
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Zap className="w-3.5 h-3.5" /> Parakeet-TDT v3
          </div>
          <div className="text-sm font-semibold">Sub-Second Fast</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Ultra-fast 250ms lane optimized for English conversations.
          </p>
        </button>

        <button
          onClick={() => setEngineMode("multilingual")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            engineMode === "multilingual"
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
            <Globe className="w-3.5 h-3.5" /> Whisper Large-v3-Turbo
          </div>
          <div className="text-sm font-semibold">Multilingual Studio</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Studio punctuation and Indic/Hindi accuracy across 99+ languages.
          </p>
        </button>
      </div>

      {/* Settings Row: Language & Acceleration */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            Audio Language:
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Audio Language"
            className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableGpu}
              onChange={(e) => setEnableGpu(e.target.checked)}
              aria-label="GPU Acceleration"
              className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              GPU Acceleration {enableGpu ? "(CUDA active)" : "(CPU mode)"}
            </span>
          </label>
        </div>
      </div>

      {/* Main Dropzone / Record Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {!audioUrl ? (
          <div className="space-y-4">
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
                aria-label="Upload audio or video file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.opus,.mp4,.webm,.mov,.mkv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Drop Audio or Video File Here
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Supports MP3, WAV, M4A, FLAC, MP4, WebM, and MOV up to 100MB. Audio tracks are extracted automatically from videos.
              </p>
            </div>

            {/* Microphone Live Record Button */}
            <div className="flex items-center justify-center pt-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs"
                >
                  <Mic className="w-4 h-4 text-emerald-500" />
                  <span>Record From Microphone Live</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-xs font-semibold text-white animate-pulse shadow-md transition-colors"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Stop Recording ({formatTime(recordingSeconds)})</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Audio File Preview Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                    {file?.name}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {formatBytes(file?.size || 0)}
                  </div>
                </div>
              </div>

              {/* Native Audio Preview & Speed Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <audio
                  ref={audioPlayerRef}
                  src={audioUrl}
                  controls
                  className="h-9 w-full sm:w-60"
                  onTimeUpdate={(e) =>
                    setCurrentTime(e.currentTarget.currentTime)
                  }
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Playback Speed Switcher */}
                <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-1 rounded-xl text-[10px] font-semibold">
                  {[1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        playbackSpeed === speed
                          ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!transcript && (
                  <button
                    onClick={transcribeAudio}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Transcribing on Engine...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Transcript</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setAudioUrl(null);
                    setTranscript(null);
                    setSegments([]);
                    setIsEditing(false);
                  }}
                  className="px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Change File
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            {/* Transcript Output Window */}
            {transcript && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      Transcription
                    </span>
                    {detectedLang && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                        {detectedLang.toUpperCase()}
                      </span>
                    )}
                    {duration && (
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {Math.round(duration)}s audio
                      </span>
                    )}
                  </div>

                  {/* View Toggles & Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                      <button
                        onClick={() => setViewMode("clean")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          viewMode === "clean"
                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                        }`}
                      >
                        Text Only
                      </button>
                      <button
                        onClick={() => setViewMode("timestamps")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          viewMode === "timestamps"
                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                        }`}
                      >
                        Timestamps
                      </button>
                    </div>

                    {/* Quick Edit Toggle */}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          saveEditedTranscript();
                        } else {
                          setEditableTranscript(transcript);
                          setIsEditing(true);
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                        isEditing
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                      title={isEditing ? "Save Edits" : "Edit Transcript"}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Save</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Download TXT */}
                    <button
                      onClick={downloadTxt}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-bold"
                      title="Download Text File (.txt)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>TXT</span>
                    </button>

                    {/* Subtitle & Data Exports */}
                    {segments.length > 0 && (
                      <>
                        <button
                          onClick={downloadSrt}
                          className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-bold"
                          title="Download Subtitles (.srt)"
                        >
                          SRT
                        </button>
                        <button
                          onClick={downloadVtt}
                          className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-bold"
                          title="Download WebVTT Subtitles (.vtt)"
                        >
                          VTT
                        </button>
                        <button
                          onClick={downloadJson}
                          className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-bold"
                          title="Download Raw JSON (.json)"
                        >
                          JSON
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-4 sm:p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 max-h-96 overflow-y-auto font-sans text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editableTranscript}
                        onChange={(e) => setEditableTranscript(e.target.value)}
                        className="w-full h-64 p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Edit your transcript here..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditableTranscript(transcript);
                            setIsEditing(false);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditedTranscript}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : viewMode === "clean" ? (
                    <p className="whitespace-pre-wrap">{transcript}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {segments.map((seg, idx) => {
                        const isActive =
                          currentTime >= seg.start && currentTime < seg.end;
                        return (
                          <div
                            key={idx}
                            onClick={() => seekTo(seg.start)}
                            className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                              isActive
                                ? "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                                : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            <span
                              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                                isActive
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-emerald-100"
                              }`}
                            >
                              {formatTime(seg.start)}
                            </span>
                            <span className="text-xs leading-relaxed flex-1">
                              {seg.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Speech audio is processed in RAM and automatically deleted after 20 minutes.
          </span>
        </div>
      </div>
    </div>
  );
}