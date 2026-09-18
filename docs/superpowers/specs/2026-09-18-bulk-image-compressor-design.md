# Bulk Image Compressor Suite — Design Specification

## Overview
A high-performance, 100% client-side **Bulk Image Compressor & Optimizer** for ConvertSheet. Enables users to drop up to 50+ images (JPEG, PNG, WebP, SVG) simultaneously, compress and resize them in browser memory without server uploads, preview before-and-after file size savings per image, and download individual files or a single bundled ZIP archive.

---

## 1. User Experience & Workflow

### 1.1 Upload & Batch Ingestion
- **Batch Dropzone**: Supports drag-and-drop or file selection of up to 50 images simultaneously (JPEG, PNG, WebP, GIF, SVG, BMP).
- **Instant Client-Side Parsing**: Automatically reads image dimensions, file size, and format without uploading to any remote backend.

### 1.2 Batch Controls & Global Presets
- **Global Compression Slider**: Adjusts quality (1% to 100%, default 80%) across all images at once.
- **Global Max Resolution**: Optional constraint (Original, 4K 3840px, Full HD 1920px, HD 1280px, Web 800px).
- **Target Format Selector**: Keep Original, Convert All to WebP, Convert All to JPEG, or Convert All to PNG.

### 1.3 Per-Image Fine-Tuning Grid
- **Interactive Image Cards**:
  - Thumbnail preview with aspect ratio preservation.
  - Original size vs. Compressed size badge (e.g. `2.4 MB → 340 KB (-85%)`).
  - Dimension badge (e.g. `4000x3000 → 1920x1440`).
  - Individual quality override slider (optional fine-tuning for specific images).
  - Quick action buttons: Download single image, Remove from queue.

### 1.4 Batch Download & ZIP Bundling
- **Single-Click "Download All (ZIP)"**: Uses in-memory `JSZip` to generate a compressed `.zip` archive on the fly without network round-trips.
- **Total Savings Summary Banner**: Prominently displays aggregate space saved (e.g. `Saved 48.2 MB across 18 images (78% reduction)`).

---

## 2. Technical Architecture & Engine

### 2.1 Engine Layer (`src/lib/engines/image-engine.ts`)
- **OffscreenCanvas / Canvas Processing**:
  - Offload compression and resizing to maintain responsive UI during large multi-image batches.
  - Concurrency limit (3-4 images processed in parallel) to ensure smooth memory usage and prevent mobile browser tab crashes.
  - Re-usable Blob URLs with explicit `URL.revokeObjectURL()` cleanup upon unmount or file deletion to prevent memory leaks.

### 2.2 ZIP Compression Layer (`src/lib/zip-utils.ts`)
- Integrates directly with `createZipArchive(files: ZipFileInput[])` and `downloadBlob` already present in the codebase.
- Automatically handles unique file naming (e.g. `photo-compressed.webp`, `photo(1)-compressed.webp`) to prevent name collisions.

---

## 3. SEO & Route Architecture

### 3.1 Primary Tool Route & Programmatic Presets
- Main Tool Slug: `/tools/compress-image` (Image Compressor & Bulk Resizer).
- Preset Slugs mapped in `TOOL_REGISTRY`:
  - `/tools/compress-jpeg` &rarr; Targets "Compress JPG / JPEG online".
  - `/tools/compress-png` &rarr; Targets "Compress PNG transparent online".
  - `/tools/compress-webp` &rarr; Targets "Compress WebP image online".
- Updates existing `image-compressor` entry with alias to `/tools/compress-image` with full backward compatibility.

### 3.2 Metadata & Schema.org Structured Data
- Includes `SoftwareApplication` and `HowTo` schemas.
- Targeted keywords: `bulk image compressor`, `compress photos in bulk`, `compress images without losing quality`, `client-side image compressor`, `free batch image optimizer`.

---

## 4. Error Handling & Edge Cases
1. **Memory Protection (High File Count / Large Megapixels)**:
   - Cap maximum batch upload count at 50 files.
   - For images $>25$ megapixels, step down downsampling resolution safely to prevent canvas allocations exceeding browser limits.
2. **Corrupted / Unsupported Formats**:
   - If an individual file fails to decode, flag that specific card with an error badge and allow other images in the batch to complete uninterrupted.
3. **Transparency Handling**:
   - Compressing to JPEG fills transparent alpha channels with clean white background rather than black artifacts.

---

## 5. Verification & Testing Plan
- **Unit Tests (`image-engine.test.ts`)**:
  - Test batch image compression with mock `Blob` and `ImageData`.
  - Test aspect ratio preservation and max dimension bounding.
  - Test format conversion (PNG $\to$ WebP, JPEG $\to$ WebP).
- **Component Tests (`BulkImageCompressor.test.tsx`)**:
  - Test file drop handling of multiple files.
  - Test global quality slider changing all card states.
  - Test single file removal and individual download button triggers.
  - Test "Download All as ZIP" click triggers `JSZip` export.
- **Production Build & SEO Audit**:
  - `npm test` &rarr; All test suites pass.
  - `npm run build` &rarr; 428+ SSG routes generated with zero errors.
  - `node scripts/audit-pages.js` &rarr; 0 broken links, 100% accessible.
