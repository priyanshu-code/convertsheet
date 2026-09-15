import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a byte size into a human-readable string (e.g. 1024 -> "1 KB").
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes <= 0 || !Number.isFinite(bytes)) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.min(
    Math.max(0, Math.floor(Math.log(bytes) / Math.log(k))),
    sizes.length - 1
  );
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Triggers a client-side file download for a given Blob.
 * Defers URL.revokeObjectURL to prevent Safari and Firefox from cancelling active downloads.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Extracts the lowercase file extension from a filename or path without the leading dot.
 * Returns an empty string if no extension exists.
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== "string") return "";
  const trimmed = filename.trim();
  const basename = trimmed.split(/[/\\]/).pop() ?? "";
  const lastDotIndex = basename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === basename.length - 1) {
    return "";
  }
  return basename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Checks whether a filename matches any of the supported extensions.
 * Handles extensions with or without leading dots and is case-insensitive.
 */
export function isExtensionSupported(
  filename: string,
  supportedExtensions: string[]
): boolean {
  if (!filename || !Array.isArray(supportedExtensions) || supportedExtensions.length === 0) {
    return false;
  }
  const ext = getFileExtension(filename);
  if (!ext) return false;
  return supportedExtensions.some((supported) => {
    if (!supported || typeof supported !== "string") return false;
    const normalized = supported.trim().toLowerCase().replace(/^\./, "");
    return normalized === ext;
  });
}

/**
 * Sanitizes an Excel sheet name by removing characters disallowed by Excel ([\\/?*[\]:]),
 * trimming leading/trailing single quotes, truncating to 31 characters, avoiding the reserved
 * keyword "History", and defaulting to "Sheet1".
 */
export function sanitizeSheetName(name?: string): string {
  if (!name || typeof name !== "string") {
    return "Sheet1";
  }

  // Remove invalid Excel sheet name characters: \ / ? * [ ] :
  // and trim leading/trailing single quotes and whitespace
  let cleaned = name
    .replace(/[\\/?*[\]:]/g, "")
    .trim()
    .replace(/^'+|'+$/g, "")
    .trim();

  if (!cleaned) {
    return "Sheet1";
  }

  // Excel sheet names have a maximum length of 31 characters
  cleaned = cleaned.slice(0, 31).replace(/^'+|'+$/g, "").trim();

  if (!cleaned) {
    return "Sheet1";
  }

  // "History" is a reserved worksheet name in Microsoft Excel (case-insensitive)
  if (cleaned.toLowerCase() === "history") {
    return "History_Sheet";
  }

  return cleaned;
}

