"use client";

import React, { useState, useRef } from "react";
import {
  Volume2,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Sliders,
  User,
  RotateCcw,
} from "lucide-react";
import { dispatchJsonMediaJob, pollMediaJobFull, MEDIA_ENGINE_BASE_URL } from "@/lib/media-engine-client";

interface VoiceOption {
  id: string;
  name: string;
  gender: "Female" | "Male";
  accent: "American" | "British";
  tone: string;
}

const VOICES: VoiceOption[] = [
  { id: "af_heart", name: "Heart (Warm & Engaging)", gender: "Female", accent: "American", tone: "Audiobooks & Storytelling" },
  { id: "af_bella", name: "Bella (Vibrant)", gender: "Female", accent: "American", tone: "Commercials & Shorts" },
  { id: "af_nicole", name: "Nicole (Professional)", gender: "Female", accent: "American", tone: "E-Learning & Tutorials" },
  { id: "af_sarah", name: "Sarah (Calm)", gender: "Female", accent: "American", tone: "Meditation & Narration" },
  { id: "am_adam", name: "Adam (Conversational)", gender: "Male", accent: "American", tone: "Podcasts & YouTube" },
  { id: "am_michael", name: "Michael (Authoritative)", gender: "Male", accent: "American", tone: "News & Corporate" },
  { id: "am_eric", name: "Eric (Friendly)", gender: "Male", accent: "American", tone: "Explainer Videos" },
  { id: "bf_emma", name: "Emma (Sophisticated)", gender: "Female", accent: "British", tone: "Documentary & Drama" },
  { id: "bf_isabella", name: "Isabella (Warm British)", gender: "Female", accent: "British", tone: "Audiobooks & Poetry" },
  { id: "bm_george", name: "George (Classic British)", gender: "Male", accent: "British", tone: "Formal & Historical" },
];

const SAMPLE_TEXTS = [
  {
    label: "Product Announcement",
    text: "We are thrilled to introduce our newest media processing engine. Built from the ground up to deliver studio-grade audio synthesis in under one second.",
  },
  {
    label: "Storytelling",
    text: "The sun had barely dipped below the horizon when the first lights of the ancient coastal city flickered on, reflecting against the calm ocean waves.",
  },
  {
    label: "Educational",
    text: "Artificial intelligence models learn complex patterns by adjusting millions of numerical weights across layers of artificial neural networks.",
  },
];

export function TextToSpeechTool() {
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const synthesizeSpeech = async () => {
    if (!text.trim()) {
      setError("Please enter some text to synthesize.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const payload = {
        text: text.trim(),
        voice: selectedVoice.id,
        speed: speed,
        tier: "free",
      };

      const data = await dispatchJsonMediaJob("tts/synthesize", payload);

      const resolveAudioUrl = (raw: string) => {
        if (!raw) return null;
        if (raw.startsWith("http")) return raw;
        const filename = raw.split("/").pop();
        return `${MEDIA_ENGINE_BASE_URL}/media/api/v1/download/files/${filename}`;
      };

      if (data.download_url || data.output_path || data.audio_path) {
        const raw = data.download_url || data.audio_path || data.output_path;
        setAudioUrl(resolveAudioUrl(raw));
        setDuration(data.duration_seconds || null);
      } else if (data.job_id) {
        const result = await pollMediaJobFull(data.job_id);
        const raw = result.download_url || result.audio_path || result.output_path;
        if (raw) {
          setAudioUrl(resolveAudioUrl(raw));
          setDuration(result.duration_seconds || null);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate speech. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `speech_${selectedVoice.id}_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Text Input Area */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              1. Enter Text to Speak
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400">
                {text.length} / 15,000 characters
              </span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 15000))}
            rows={5}
            placeholder="Type or paste text here to convert into natural human speech..."
            className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y leading-relaxed font-sans"
          />

          {/* Preset Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-zinc-400">Sample Prompts:</span>
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setText(sample.text)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Voice & Speed Controls */}
        <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              2. Select Studio AI Voice (Kokoro-82M)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVoice(v)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedVoice.id === v.id
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {v.name}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 ml-1">
                        {v.accent}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {v.tone}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Speed Slider */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Speech Rate
              </span>
              <span className="font-mono text-zinc-500">{speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={speed}
              aria-label="Speech Rate"
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>0.7x (Slower)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Faster)</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={synthesizeSpeech}
            disabled={isProcessing || !text.trim()}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Studio Audio...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Natural Speech</span>
              </>
            )}
          </button>
        </div>

        {/* Output Audio Player */}
        {audioUrl && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Audio Ready
              </span>
              {duration && <span className="font-mono text-zinc-400">{duration.toFixed(1)}s audio generated</span>}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                autoPlay
                className="w-full sm:flex-1 h-10"
              />

              <button
                onClick={downloadAudio}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download MP3</span>
              </button>
            </div>
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Generated audio files are processed in ephemeral memory and automatically removed after 20 minutes.</span>
        </div>
      </div>
    </div>
  );
}
