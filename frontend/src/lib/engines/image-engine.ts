/**
 * 100% In-Browser Image Conversion and Optimization Engine.
 * Uses native HTMLCanvasElement / OffscreenCanvas and FileReader APIs
 * to convert, resize, and compress images client-side with zero server retention.
 */

export interface ImageConversionOptions {
  format: "image/webp" | "image/png" | "image/jpeg";
  quality?: number; // 0.1 to 1.0 (for webp and jpeg)
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor?: string; // default "#ffffff" when format === "image/jpeg"
}

export interface ImageConversionResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
}

/**
 * Calculates percentage file size savings between original and compressed size.
 * Positive value represents reduction, negative value represents expansion.
 */
export function calculateSavings(originalSize: number, compressedSize: number): number {
  if (originalSize <= 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Loads an image file or SVG into an HTMLImageElement safely.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image. Please ensure the file is a valid image format."));
    };
    img.src = url;
  });
}

/**
 * Converts, scales, and compresses an image in browser memory.
 */
export async function convertImage(
  file: File,
  options: ImageConversionOptions
): Promise<ImageConversionResult> {
  const img = await loadImageFromFile(file);

  let { width, height } = img;
  const maxWidth = options.maxWidth || width;
  const maxHeight = options.maxHeight || height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Draw onto canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D rendering canvas context.");
  }

  // If converting to JPEG, fill background to avoid black transparency
  if (options.format === "image/jpeg") {
    ctx.fillStyle = options.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const quality = options.quality !== undefined ? options.quality : 0.92;

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to export canvas to image blob."));
      },
      options.format,
      quality
    );
  });

  const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
  let ext = "png";
  if (options.format === "image/webp") ext = "webp";
  else if (options.format === "image/jpeg") ext = "jpg";

  const filename = `${baseName}.${ext}`;
  const dataUrl = canvas.toDataURL(options.format, quality);

  return {
    blob,
    dataUrl,
    width,
    height,
    sizeBytes: blob.size,
    filename,
  };
}

/**
 * Converts a batch of image files with a controlled concurrency limit.
 * Invokes onProgress callback after each image completes.
 */
export async function convertBatchImages(
  files: File[],
  options: ImageConversionOptions,
  concurrency: number = 3,
  onProgress?: (completed: number, total: number) => void
): Promise<ImageConversionResult[]> {
  const total = files.length;
  const results: ImageConversionResult[] = new Array(total);
  let currentIndex = 0;
  let completedCount = 0;

  const worker = async () => {
    while (currentIndex < total) {
      const idx = currentIndex++;
      const file = files[idx];
      results[idx] = await convertImage(file, options);
      completedCount++;
      if (onProgress) {
        onProgress(completedCount, total);
      }
    }
  };

  const poolSize = Math.max(1, Math.min(concurrency, total));
  const workers = Array.from({ length: poolSize }, () => worker());
  await Promise.all(workers);

  return results;
}

