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
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull } from "@/lib/media-engine-client";
import { formatBytes } from "@/lib/utils";

interface Segment {
  start: number;
  end: number;
  text: string;
}

export function SpeechToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<"auto" | "fast" | "multilingual">("auto");
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
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const recordedFile = new File([audioBlob], `recording_${Date.now()}.wav`, { type: "audio/wav" });
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
      formData.append("tier", engineMode === "multilingual" ? "pro" : "free");

      const data = await dispatchMediaJob("stt/transcribe", formData);

      if (data.text || data.segments) {
        setTranscript(data.text || "");
        setSegments(data.segments || []);
        setDetectedLang(data.language || "English");
        setDuration(data.duration_seconds || null);
      } else if (data.job_id) {
        const result = await pollMediaJobFull(data.job_id);
        setTranscript(result.text || "");
        setSegments(result.segments || []);
        setDetectedLang(result.language || "English");
        setDuration(result.duration_seconds || null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to transcribe audio. Please verify the format and retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!transcript) return;
    const textToCopy =
      viewMode === "clean"
        ? transcript
        : segments
            .map((s) => `[${formatTime(s.start)} - ${formatTime(s.end)}] ${s.text}`)
            .join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transcript_${Date.now()}.txt`;
    a.click();
  };

  const downloadSrt = () => {
    if (!segments.length) return;
    const srtContent = segments
      .map((seg, idx) => {
        return `${idx + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text.trim()}\n`;
      })
      .join("\n");

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subtitles_${Date.now()}.srt`;
    a.click();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const formatSrtTime = (seconds: number) => {
    const pad = (num: number, size: number) => num.toString().padStart(size, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(millis, 3)}`;
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
            Auto-detects language and chooses fastest engine.
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
            Lightning fast 250ms CPU lane for English speech.
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
            <Globe className="w-3.5 h-3.5" /> Whisper Large-v3
          </div>
          <div className="text-sm font-semibold">Multilingual Studio</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Accurate punctuation across 99+ international languages.
          </p>
        </button>
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
                accept="audio/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Drop Audio or Video File Here
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Supports MP3, WAV, M4A, FLAC, MP4, WebM, and MOV up to 100MB.
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

              {/* Native Audio Preview */}
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                controls
                className="h-9 w-full sm:w-64"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

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
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Transcription</span>
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
                  <div className="flex items-center gap-2">
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

                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={downloadTxt}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Download text file (.txt)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {segments.length > 0 && (
                      <button
                        onClick={downloadSrt}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-bold"
                        title="Download Subtitles (.srt)"
                      >
                        SRT
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-4 sm:p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 max-h-96 overflow-y-auto font-sans text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {viewMode === "clean" ? (
                    <p className="whitespace-pre-wrap">{transcript}</p>
                  ) : (
                    <div className="space-y-2">
                      {segments.map((seg, idx) => (
                        <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                          <span className="font-mono text-zinc-400 shrink-0 font-medium select-none">
                            {formatTime(seg.start)}
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-200">{seg.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Speech audio is processed in RAM and automatically deleted after 20 minutes.</span>
        </div>
      </div>
    </div>
  );
}
