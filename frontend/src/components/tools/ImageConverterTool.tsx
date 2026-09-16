"use client";

import React, { useState, useRef, useCallback } from "react";
import { Image as ImageIcon, Download, UploadCloud, RefreshCw, Sliders, Check } from "lucide-react";
import {
  CalcCard,
  CalcSelect,
  CalcSlider,
  CalcResult,
  CalcCopyButton,
} from "@/components/calculator";
import { convertImage, ImageConversionResult } from "@/lib/engines/image-engine";
import { formatBytes } from "@/lib/utils";

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

  const handleFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsProcessing(true);
    try {
      const res = await convertImage(file, {
        format: targetFormat,
        quality: quality / 100,
        maxWidth: maxWidth,
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Failed to process image.");
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, [targetFormat, quality, maxWidth]);

  const handleConvertAgain = useCallback(async () => {
    if (!selectedFile) return;
    await handleFile(selectedFile);
  }, [selectedFile, handleFile]);

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
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-800/30 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Click to choose an image or drag &amp; drop
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Supports WEBP, PNG, JPG, JPEG, and SVG up to 50MB (Processed entirely in browser memory)
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
                helpText="Lower quality produces smaller file size"
              />

              <CalcSlider
                id="max-width"
                label="Max Width Resize"
                value={maxWidth}
                onChange={setMaxWidth}
                min={320}
                max={3840}
                step={160}
                unit="px"
                helpText="Downscale resolution to reduce size"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleConvertAgain}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                {isProcessing ? "Processing..." : "Re-apply Settings"}
              </button>

              {result && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium text-sm transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download {result.filename} ({formatBytes(result.sizeBytes)})
                </button>
              )}
            </div>

            {/* Conversion Result Metrics */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <CalcResult
                  title="Resolution"
                  primaryLabel="Dimensions"
                  primaryValue={`${result.width}×${result.height}`}
                />
                <CalcResult
                  title="New File Size"
                  primaryLabel="Compressed Size"
                  primaryValue={formatBytes(result.sizeBytes)}
                />
                <CalcResult
                  title="Savings"
                  primaryLabel="Size Reduction"
                  primaryValue={compressionRatio > 0 ? `-${compressionRatio}%` : "No Change"}
                  primarySubtext={compressionRatio > 0 ? "Saved bandwidth" : "Minimal change"}
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
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Real-time Preview
                </span>
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 flex items-center justify-center overflow-hidden max-h-96">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.dataUrl}
                    alt="Converted output preview"
                    className="max-h-80 max-w-full rounded-lg object-contain shadow-sm"
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
