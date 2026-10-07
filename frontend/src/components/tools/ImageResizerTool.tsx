"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Maximize2,
  Download,
  UploadCloud,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  Check,
  FileImage,
  Sparkles,
} from "lucide-react";
import { CalcCard, CalcSelect } from "@/components/calculator";
import { formatBytes, cn } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export interface ImageResizerToolProps {
  title?: string;
  subtitle?: string;
}

interface ImageDimensionState {
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  aspectRatio: number;
  format: "image/jpeg" | "image/png" | "image/webp";
  quality: number;
}

const COMMON_PRESETS = [
  { label: "Original Size", w: 0, h: 0 },
  { label: "Instagram Square (1080 × 1080)", w: 1080, h: 1080 },
  { label: "Instagram Story / Reel (1080 × 1920)", w: 1080, h: 1920 },
  { label: "YouTube Thumbnail (1280 × 720)", w: 1280, h: 720 },
  { label: "Full HD (1920 × 1080)", w: 1920, h: 1080 },
  { label: "Passport Photo (600 × 600)", w: 600, h: 600 },
  { label: "Standard 4K (3840 × 2160)", w: 3840, h: 2160 },
];

export function ImageResizerTool({
  title = "Free Image Resizer & Scaler",
  subtitle = "Resize photos, graphics, and banner images to custom pixel dimensions with 100% in-browser privacy.",
}: ImageResizerToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<ImageDimensionState>({
    originalWidth: 0,
    originalHeight: 0,
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    aspectRatio: 1,
    format: "image/jpeg",
    quality: 90,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) return;

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      imgElementRef.current = img;
      setDims({
        originalWidth: w,
        originalHeight: h,
        width: w,
        height: h,
        maintainAspectRatio: true,
        aspectRatio: w / h,
        format: selectedFile.type === "image/png" ? "image/png" : "image/jpeg",
        quality: 90,
      });
    };
    img.src = url;
  }, []);

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    onFiles: (files) => {
      if (files.length > 0) handleFile(files[0]);
    },
    accept: (f) => f.type.startsWith("image/"),
  });

  // Re-run client-side canvas resize whenever dimensions or quality changes
  useEffect(() => {
    if (!imgElementRef.current || dims.width <= 0 || dims.height <= 0) return;

    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      try {
        if (dims.format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, dims.width, dims.height);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(imgElementRef.current, 0, 0, dims.width, dims.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setResizedBlob(blob);
              setResizedSize(blob.size);
            }
            setIsProcessing(false);
          },
          dims.format,
          dims.quality / 100
        );
      } catch (err) {
        console.warn("Canvas rendering error:", err);
        setIsProcessing(false);
      }
    }
  }, [dims]);

  const handleWidthChange = (val: number) => {
    const newWidth = Math.max(1, Math.min(8000, val));
    if (dims.maintainAspectRatio && dims.aspectRatio > 0) {
      setDims((prev) => ({
        ...prev,
        width: newWidth,
        height: Math.round(newWidth / prev.aspectRatio),
      }));
    } else {
      setDims((prev) => ({ ...prev, width: newWidth }));
    }
  };

  const handleHeightChange = (val: number) => {
    const newHeight = Math.max(1, Math.min(8000, val));
    if (dims.maintainAspectRatio && dims.aspectRatio > 0) {
      setDims((prev) => ({
        ...prev,
        height: newHeight,
        width: Math.round(newHeight * prev.aspectRatio),
      }));
    } else {
      setDims((prev) => ({ ...prev, height: newHeight }));
    }
  };

  const handlePreset = (w: number, h: number) => {
    if (w === 0 && h === 0) {
      setDims((prev) => ({
        ...prev,
        width: prev.originalWidth,
        height: prev.originalHeight,
      }));
    } else {
      setDims((prev) => ({
        ...prev,
        width: w,
        height: h,
        maintainAspectRatio: false,
      }));
    }
  };

  const handleDownload = () => {
    if (!resizedBlob || !file) return;
    const ext = dims.format === "image/png" ? "png" : dims.format === "image/webp" ? "webp" : "jpg";
    const base = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const filename = `${base}_${dims.width}x${dims.height}.${ext}`;
    const url = URL.createObjectURL(resizedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <CalcCard
      title={title}
      subtitle={subtitle}
      icon={Maximize2}
      privacyScope="file"
      className="w-full max-w-4xl mx-auto shadow-sm"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        {!file ? (
          <div
            {...dragHandlers}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all",
              isDragOver
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-600 bg-zinc-50/50 dark:bg-zinc-900/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Click to select an image or drag & drop
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Supports JPG, PNG, WebP, and SVG up to 50MB. 100% private in browser memory.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Dimensions Presets */}
            <div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Common Preset Resolutions:
              </span>
              <div className="flex flex-wrap gap-2">
                {COMMON_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePreset(p.w, p.h)}
                    className="px-2.5 py-1 text-xs rounded-lg font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Sliders & Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Width (pixels)
                </label>
                <input
                  type="number"
                  min={1}
                  max={8000}
                  value={dims.width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Height (pixels)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setDims((prev) => ({
                        ...prev,
                        maintainAspectRatio: !prev.maintainAspectRatio,
                      }))
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    {dims.maintainAspectRatio ? (
                      <>
                        <Lock className="w-3 h-3" /> Lock Aspect Ratio
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Free Dimensions
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={8000}
                  value={dims.height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            {/* Format & Quality Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Target Format
                </label>
                <select
                  value={dims.format}
                  onChange={(e) =>
                    setDims((prev) => ({
                      ...prev,
                      format: e.target.value as "image/jpeg" | "image/png" | "image/webp",
                    }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="image/jpeg">JPG / JPEG (Smallest size)</option>
                  <option value="image/png">PNG (Lossless transparency)</option>
                  <option value="image/webp">WebP (Modern web format)</option>
                </select>
              </div>

              {dims.format !== "image/png" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>Quality</span>
                    <span className="font-mono">{dims.quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={dims.quality}
                    onChange={(e) =>
                      setDims((prev) => ({ ...prev, quality: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>
              )}
            </div>

            {/* Results & Download Bar */}
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 block">
                  Resized Output: {dims.width} × {dims.height} px
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Original: {dims.originalWidth} × {dims.originalHeight} px (
                  {formatBytes(file.size)}) &rarr; New Size: {formatBytes(resizedSize)}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-600 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resized Image</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
