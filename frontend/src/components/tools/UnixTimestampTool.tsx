"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";
import {
  CalcCard,
  CalcCopyButton,
  CalcInput,
  CalcResult,
  CalcToggle,
} from "@/components/calculator";

export function UnixTimestampTool() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [inputDate, setInputDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });
  const [mode, setMode] = useState<"epochToDate" | "dateToEpoch">("epochToDate");

  // Live ticking clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUseCurrent = useCallback(() => {
    const nowSec = Math.floor(Date.now() / 1000).toString();
    setInputEpoch(nowSec);
  }, []);

  const epochConversion = useMemo(() => {
    const raw = Number(inputEpoch.trim());
    if (isNaN(raw) || raw < 0) {
      return { error: "Please enter a valid numeric Unix timestamp" };
    }
    // Auto-detect seconds vs milliseconds
    const ms = raw > 9999999999 ? raw : raw * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      return { error: "Invalid date representation" };
    }

    return {
      error: null,
      utc: d.toUTCString(),
      iso: d.toISOString(),
      local: d.toLocaleString(),
      relative: getRelativeTimeString(d),
    };
  }, [inputEpoch]);

  const dateConversion = useMemo(() => {
    if (!inputDate) return { error: "Select a date" };
    const d = new Date(inputDate);
    if (isNaN(d.getTime())) return { error: "Invalid calendar date" };
    const sec = Math.floor(d.getTime() / 1000);
    const ms = d.getTime();

    return {
      error: null,
      seconds: sec.toString(),
      milliseconds: ms.toString(),
      utc: d.toUTCString(),
    };
  }, [inputDate]);

  return (
    <CalcCard
      title="Unix Timestamp Converter"
      subtitle="Convert Unix timestamps (seconds & milliseconds) to human dates, or convert calendar dates to epoch timestamps."
      icon={Clock}
      badge="Live Epoch Clock"
    >
      {/* Real-time Ticker Banner */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
        <div className="space-y-0.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Current Unix Epoch Timestamp
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {currentEpoch}
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseCurrent}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Insert Current Timestamp</span>
        </button>
      </div>

      <CalcToggle
        value={mode}
        options={[
          { value: "epochToDate", label: "Timestamp → Human Date" },
          { value: "dateToEpoch", label: "Human Date → Timestamp" },
        ]}
        onChange={(val) => setMode(val as "epochToDate" | "dateToEpoch")}
      />

      {mode === "epochToDate" ? (
        <div className="space-y-4">
          <CalcInput
            id="epoch-input"
            label="Unix Epoch Timestamp (Seconds or Milliseconds)"
            value={inputEpoch}
            type="text"
            onChange={setInputEpoch}
            placeholder="e.g. 1700000000"
            helperText="Auto-detects 10-digit (seconds) and 13-digit (milliseconds) formats."
          />

          {epochConversion.error ? (
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
              ⚠️ {epochConversion.error}
            </div>
          ) : (
            <CalcResult
              title="Converted Calendar Date"
              primaryLabel="Local System Time"
              primaryValue={epochConversion.local || ""}
              copyValue={epochConversion.iso}
              items={[
                { label: "UTC / GMT String", value: epochConversion.utc || "" },
                { label: "ISO 8601 Standard", value: epochConversion.iso || "" },
                { label: "Relative Time", value: epochConversion.relative || "", highlight: true },
              ]}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <CalcInput
            id="date-input"
            label="Pick Date & Time"
            value={inputDate}
            type="text"
            onChange={setInputDate}
            placeholder="YYYY-MM-DDTHH:mm"
            helperText="Local calendar format."
          />

          {dateConversion.error ? (
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
              ⚠️ {dateConversion.error}
            </div>
          ) : (
            <CalcResult
              title="Generated Unix Timestamps"
              primaryLabel="Epoch Seconds (10-digit)"
              primaryValue={dateConversion.seconds || ""}
              copyValue={dateConversion.seconds}
              items={[
                { label: "Epoch Milliseconds (13-digit)", value: dateConversion.milliseconds || "" },
                { label: "UTC Representation", value: dateConversion.utc || "" },
              ]}
            />
          )}
        </div>
      )}

      {/* Developer & Linux Terminal Helper Cheatsheet */}
      {(() => {
        const activeEpochSec =
          mode === "epochToDate"
            ? Number(inputEpoch) > 9999999999
              ? Math.floor(Number(inputEpoch) / 1000)
              : Number(inputEpoch) || currentEpoch
            : Number(dateConversion.seconds) || currentEpoch;

        const cliSnippets = [
          {
            title: "Linux Bash (Convert Epoch → Date)",
            command: `date -d @${activeEpochSec}`,
            description: "GNU date utility standard in Ubuntu, Debian, CentOS, Fedora, and WSL.",
          },
          {
            title: "Linux / macOS (Current Date → Epoch)",
            command: "date +%s",
            description: "Prints the current Unix timestamp in seconds.",
          },
          {
            title: "macOS / BSD Terminal (Epoch → Date)",
            command: `date -r ${activeEpochSec}`,
            description: "BSD date command default on macOS Terminal and FreeBSD.",
          },
          {
            title: "Python 3",
            command: `from datetime import datetime; datetime.fromtimestamp(${activeEpochSec})`,
            description: "Converts Unix epoch timestamp into a local datetime object.",
          },
          {
            title: "JavaScript / Node.js",
            command: `new Date(${activeEpochSec} * 1000).toISOString()`,
            description: "Instantiates Date from milliseconds and formats to ISO-8601 UTC string.",
          },
        ];

        return (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Developer & Linux Terminal Helper
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Ready-to-use CLI and programming snippets for epoch{" "}
                  <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    {activeEpochSec}
                  </code>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {cliSnippets.map((snippet, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {snippet.title}
                      </span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 bg-zinc-50 dark:bg-zinc-900/90 px-2.5 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 break-all select-all">
                      {snippet.command}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {snippet.description}
                    </p>
                  </div>
                  <div className="shrink-0 self-end sm:self-center">
                    <CalcCopyButton textToCopy={snippet.command} label="Copy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </CalcCard>
  );
}

function getRelativeTimeString(date: Date): string {
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "seconds");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minutes");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hours");
  const diffDay = Math.round(diffHr / 24);
  return rtf.format(diffDay, "days");
}
