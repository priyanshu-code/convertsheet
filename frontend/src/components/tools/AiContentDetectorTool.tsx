"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { dispatchJsonMediaJob, pollMediaJobFull } from "@/lib/media-engine-client";

interface AnalyzedSentence {
  index: number;
  text: string;
  ai_probability: number;
  verdict: string;
}

interface DetectionResult {
  ai_probability: number;
  verdict: string;
  confidence: string;
  mode: string;
  sentences: AnalyzedSentence[];
  duration_seconds?: number;
  engine?: string;
}

const SAMPLE_TEXTS = [
  {
    label: "AI Sample (ChatGPT)",
    text: "Artificial intelligence is a transformative technology that allows computer systems to learn from large amounts of training data and perform tasks that typically require human cognition, such as visual perception, natural language understanding, and decision-making.",
  },
  {
    label: "Human Sample (Essay)",
    text: "My grandfather used to keep a weathered brass compass on his workbench next to jars of rusted wood screws. Whenever we got lost hiking through the timber ridge, he would remind me that true direction isn't about rushing forward, but knowing which way the wind is actually blowing.",
  },
  {
    label: "Mixed Sample (Hybrid)",
    text: "While machine learning models excel at synthesizing large corpuses of statistical patterns, I have noticed in my own classroom that students quickly spot the lack of genuine vulnerability in purely algorithmic writing. Technology can mimic cadence, but lived experience remains irreproducible.",
  },
];

export function AiContentDetectorTool() {
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [mode, setMode] = useState<"standard" | "deep_scan">("standard");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<AnalyzedSentence | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Please paste or type text to analyze.");
      return;
    }
    if (wordCount < 15) {
      setError("Please provide at least 15 words for a statistically reliable analysis.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSelectedSentence(null);

    try {
      const payload = {
        text: text.trim(),
        mode: mode,
        granularity: "sentence",
        tier: "free",
      };

      const data = await dispatchJsonMediaJob("text/detect-ai", payload);

      if (data.ai_probability !== undefined) {
        setResult(data as DetectionResult);
      } else if (data.job_id) {
        const fullResult = await pollMediaJobFull(data.job_id);
        setResult(fullResult as unknown as DetectionResult);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze text. Please verify connection and retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAnalysis = () => {
    if (!result) return;
    const report = `ConvertSheet AI Content Detection Report:
Verdict: ${result.verdict.toUpperCase()}
AI Score: ${(result.ai_probability * 100).toFixed(1)}%
Confidence: ${result.confidence}
Mode: ${result.mode}
Total Sentences Analyzed: ${result.sentences ? result.sentences.length : 0}
Word Count: ${wordCount}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (prob: number) => {
    if (prob >= 0.7) return "text-rose-600 dark:text-rose-400";
    if (prob >= 0.35) return "text-amber-600 dark:text-amber-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getScoreBg = (prob: number) => {
    if (prob >= 0.7) return "bg-rose-500";
    if (prob >= 0.35) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getSentenceBg = (prob: number, isSelected: boolean) => {
    if (isSelected) {
      return "ring-2 ring-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/80";
    }
    if (prob >= 0.75) return "bg-rose-100/70 dark:bg-rose-950/40 border-b-2 border-rose-400";
    if (prob >= 0.4) return "bg-amber-100/70 dark:bg-amber-950/40 border-b-2 border-amber-400";
    return "hover:bg-zinc-100 dark:hover:bg-zinc-800/50";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Text Input Area */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Input Text (Essays, Articles, Reports)
            </label>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount.toLocaleString()} / 100,000 chars</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 100000))}
            rows={7}
            placeholder="Paste text here to inspect for AI patterns, ChatGPT signatures, and algorithmic phrasing..."
            className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y leading-relaxed font-sans"
          />

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-zinc-400">Quick Test:</span>
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setText(sample.text);
                  setResult(null);
                  setError(null);
                }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMode("standard")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              mode === "standard"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Standard Classifier
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Fast Lane
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Real-time transformer detection with sentence-level perplexity.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode("deep_scan")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              mode === "deep_scan"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Deep Scan Consensus
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600">
                High Precision
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Multi-feature structural burstiness and semantic entropy scan.
            </p>
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scan Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={analyzeText}
            disabled={isProcessing || !text.trim()}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Patterns & Perplexity...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Scan for AI Content</span>
              </>
            )}
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-5">
                {/* Circular Gauge */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-200 dark:text-zinc-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        result.ai_probability >= 0.7
                          ? "text-rose-500"
                          : result.ai_probability >= 0.35
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }
                      strokeDasharray={`${result.ai_probability * 100}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                      {Math.round(result.ai_probability * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                      Verdict
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        result.ai_probability >= 0.7
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : result.ai_probability >= 0.35
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {result.verdict.replace("-", " ")}
                    </span>
                  </div>
                  <h4 className={`text-xl font-bold mt-0.5 ${getScoreColor(result.ai_probability)}`}>
                    {result.ai_probability >= 0.7
                      ? "High AI Content Likelihood"
                      : result.ai_probability >= 0.35
                      ? "Mixed or AI-Assisted Text"
                      : "Entirely Human Written"}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Confidence: <strong className="capitalize">{result.confidence.replace("_", " ")}</strong>
                    {result.duration_seconds && ` • Analyzed in ${result.duration_seconds.toFixed(2)}s`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyAnalysis}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Report Copied" : "Copy Report"}</span>
                </button>
              </div>
            </div>

            {/* Sentence Breakdown Highlighter */}
            {result.sentences && result.sentences.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Sentence-by-Sentence Breakdown
                  </h5>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Likely AI
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Mixed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Human
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 leading-relaxed text-sm text-zinc-800 dark:text-zinc-200 font-serif">
                  {result.sentences.map((sent, idx) => (
                    <span
                      key={idx}
                      onClick={() => setSelectedSentence(sent)}
                      className={`cursor-pointer px-1 py-0.5 rounded transition-all inline ${getSentenceBg(
                        sent.ai_probability,
                        selectedSentence?.index === sent.index
                      )}`}
                      title={`Sentence AI Score: ${(sent.ai_probability * 100).toFixed(0)}%`}
                    >
                      {sent.text}{" "}
                    </span>
                  ))}
                </div>

                {/* Selected Sentence Inspection Drawer */}
                {selectedSentence && (
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>Sentence #{selectedSentence.index} Detail:</span>
                        <span className={`font-bold ${getScoreColor(selectedSentence.ai_probability)}`}>
                          {(selectedSentence.ai_probability * 100).toFixed(1)}% AI Probability
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 italic mt-1 font-serif">
                        &ldquo;{selectedSentence.text}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSentence(null)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Analyzed text is processed entirely in volatile memory and is never used for training.</span>
        </div>
      </div>
    </div>
  );
}
