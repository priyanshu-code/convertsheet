"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Image as ImageIcon, Download, UploadCloud, RefreshCw, Check } from "lucide-react";
import {
  CalcCard,
  CalcSelect,
  CalcSlider,
  CalcResult,
} from "@/components/calculator";
import { convertImage, ImageConversionResult } from "@/lib/engines/image-engine";
import { formatBytes, cn } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

interface ImageConverterToolProps {
  defaultTargetFormat?: "image/webp" | "image/png" | "image/jpeg";
  title?: string;
  subtitle?: string;
}

export function ImageConverterTool({
  defaultTargetFormat = "image/webp",
  title = "In-Browser Image Converter & Compressor",
  subtitle = "Convert images between WebP, PNG, JPEG, and SVG directly in your browser with zero server uploads.",
}: ImageConverterToolProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<"image/webp" | "image/png" | "image/jpeg">(defaultTargetFormat);
  const [quality, setQuality] = useState<number>(85);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ImageConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core conversion execution with specific parameters
  const runConversion = useCallback(
    async (file: File, format: "image/webp" | "image/png" | "image/jpeg", q: number, w: number) => {
      setError(null);
      setIsProcessing(true);
      try {
        const res = await convertImage(file, {
          format,
          quality: q / 100,
          maxWidth: w,
        });
        setResult(res);
      } catch (e: any) {
        setError(e.message || "Failed to process image.");
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Initial file upload
  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file);
      runConversion(file, targetFormat, quality, maxWidth);
    },
    [targetFormat, quality, maxWidth, runConversion]
  );

  const isImage = (f: File) =>
    f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".svg");

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    multiple: false,
    accept: isImage,
    onFiles: (files) => {
      if (files[0]) handleFile(files[0]);
    },
  });

  // Live auto-update when sliders (quality, maxWidth) or target format changes
  useEffect(() => {
    if (!selectedFile) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      runConversion(selectedFile, targetFormat, quality, maxWidth);
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [selectedFile, targetFormat, quality, maxWidth, runConversion]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const compressionRatio = selectedFile && result
    ? Math.round((1 - result.sizeBytes / selectedFile.size) * 100)
    : 0;

  return (
    <CalcCard
      title={title}
      subtitle={subtitle}
      icon={ImageIcon}
      badge="100% Client-Side"
    >
      <div className="space-y-6">
        {/* Upload Dropzone */}
        {!selectedFile ? (
          <div
            {...dragHandlers}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-800/30 group",
              isDragOver
                ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10 scale-[1.01]"
                : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              aria-label="Select image file to convert"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform",
                isDragOver
                  ? "bg-emerald-600 text-white scale-110"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
              )}
            >
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Click to choose an image, drag &amp; drop, or paste
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
              <span>Supports WEBP, PNG, JPG, JPEG, and SVG up to 50MB</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold shadow-xs">
                  Ctrl / ⌘ + V
                </kbd>
                <span>to paste</span>
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Original Size: {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setResult(null);
                }}
                className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
              >
                Change Image
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <CalcSelect
                  id="target-format"
                  label="Target Format"
                  value={targetFormat}
                  options={[
                    { value: "image/webp", label: "WEBP (Next-Gen High Compression)" },
                    { value: "image/png", label: "PNG (Lossless Transparency)" },
                    { value: "image/jpeg", label: "JPEG / JPG (Standard Web)" },
                  ]}
                  onChange={(val) => setTargetFormat(val as any)}
                />
              </div>

              <CalcSlider
                id="image-quality"
                label="Quality"
                value={quality}
                onChange={setQuality}
                min={10}
                max={100}
                step={5}
                unit="%"
                helpText="Live compression quantization"
              />

              <CalcSlider
                id="max-width"
                label="Max Width Resize"
                value={maxWidth}
                onChange={setMaxWidth}
                min={320}
                max={3840}
                step={80}
                unit="px"
                helpText="Live downscale resolution limit"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {result && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download {result.filename} ({formatBytes(result.sizeBytes)})
                </button>
              )}

              {isProcessing && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Updating preview...
                </span>
              )}
            </div>

            {/* Conversion Result Metrics */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <CalcResult
                  title="Resolution"
                  primaryLabel="Dimensions"
                  primaryValue={`${result.width} × ${result.height}`}
                />
                <CalcResult
                  title="New File Size"
                  primaryLabel="Compressed Size"
                  primaryValue={formatBytes(result.sizeBytes)}
                />
                <CalcResult
                  title="Savings"
                  primaryLabel="Size Reduction"
                  primaryValue={compressionRatio > 0 ? `-${compressionRatio}%` : `${Math.abs(compressionRatio)}%`}
                  primarySubtext={compressionRatio > 0 ? "Saved bandwidth" : "Uncompressed gain"}
                />
                <CalcResult
                  title="Format"
                  primaryLabel="File Type"
                  primaryValue={targetFormat.split("/")[1].toUpperCase()}
                />
              </div>
            )}

            {/* Visual Preview */}
            {result && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider">
                    Real-time Output Preview
                  </span>
                  <span>{result.width} × {result.height} px</span>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 flex items-center justify-center overflow-hidden min-h-[220px] max-h-[480px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.dataUrl}
                    alt="Converted output preview"
                    className="max-h-[440px] max-w-full rounded-lg object-contain shadow-sm transition-all duration-150"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CalcCard>
  );
}
