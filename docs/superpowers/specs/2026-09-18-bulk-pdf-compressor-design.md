# Bulk PDF Compressor Suite — Design Specification

## Overview
A 100% client-side **Bulk PDF Compressor & Optimizer** for ConvertSheet (`/tools/compress-pdf`). Users can upload up to 20 PDF documents simultaneously, compress them locally in browser memory without server uploads, view before-and-after file size savings per document, and download individual optimized PDFs or a single bundled `.zip` archive.

---

## 1. User Experience & Workflow

### 1.1 Ingestion & Drag-and-Drop
- Multi-PDF dropzone accepting up to 20 `.pdf` files.
- Instant client-side inspection: computes page count and file size immediately.

### 1.2 Compression Modes (3 Presets)
- **Recommended Compression** (Default):
  - Balances crisp text readability and image quality with significant size reduction (~60–75% reduction).
  - Target: Web sharing, email attachments, and document archiving.
- **Extreme Compression**:
  - Maximum size reduction for strict portal upload limits (e.g. government portals, job applications requiring $<1$ MB or $<500$ KB).
  - Aggressively downsamples high-DPI scans and raster assets.
- **Low Compression (High Quality)**:
  - Preserves fine vector lines and high-resolution photos for printing while stripping duplicate metadata streams and unreferenced object dictionaries.

### 1.3 Batch Document Grid
- Individual document cards displaying:
  - Document name, page count badge, and thumbnail placeholder.
  - Original size vs. Compressed size pill (e.g., `8.4 MB → 1.9 MB (-77%)`).
  - Status indicator (Queued, Compressing, Done, Failed).
  - Quick actions: Single-file download (`downloadBlob`) and remove from queue.

### 1.4 Global Actions & ZIP Bundling
- Summary savings banner: Total documents, original size, compressed size, total space saved (MB and %).
- Global "Download All as ZIP" button using `JSZip` without network round-trips.
- Error resilience: If an encrypted or corrupted PDF fails to parse, flag that specific card with an error badge while the rest of the batch completes uninterrupted.

---

## 2. Technical Architecture & Engine

### 2.1 Engine Implementation (`src/lib/engines/pdf-engine.ts`)
- **`compressPdf(file: File, options: PdfCompressionOptions)`**:
  - Leverages `pdf-lib` stream rewriting:
    - Normalizes and removes unreferenced objects, orphaned metadata streams, and duplicate font descriptors.
    - Applies object stream compression (`useObjectStreams: true`) to compress non-stream objects into flate-compressed streams.
    - For embedded raster images (DCT/Flate streams), decodes and downsamples high-resolution scanned imagery according to the selected preset level (`recommended`, `extreme`, `low`).
- **`compressBatchPdfs(files: File[], options: PdfCompressionOptions, onProgress?: (done: number, total: number) => void)`**:
  - Concurrency-controlled worker pool (`concurrency = 2`) to ensure mobile browser tabs and lower-end laptops do not exceed memory thresholds during large PDF re-encoding.

### 2.2 Presets & Parameters
```typescript
export type PdfCompressionLevel = "recommended" | "extreme" | "low";

export interface PdfCompressionOptions {
  level: PdfCompressionLevel;
  stripMetadata?: boolean;
}

export interface PdfCompressionResult {
  blob: Blob;
  filename: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savingsPercentage: number;
  pageCount: number;
}
```

---

## 3. SEO, Programmatic Routes & Tool Registry

### 3.1 Slugs in `TOOL_REGISTRY`
1. `/tools/compress-pdf` — **Bulk PDF Compressor** (Primary high-volume search landing page).
2. Category: `"utility"`.
3. Complete SEO metadata:
   - Target keywords: `compress pdf`, `compress pdf online free`, `reduce pdf file size`, `bulk pdf compressor`, `shrink pdf mb to kb`, `pdf compressor 100% private`.
   - Comprehensive 3-step `howTo` guide.
   - 4 targeted `faqs` (addressing privacy, bank statement safety, file size limits, and scanned documents).
   - Cross-links to `merge-pdf`, `split-pdf`, `pdf-table-extractor`, `pdf-to-excel`.

### 3.2 Dynamic Route Wiring
- Routed in `src/app/tools/[slug]/page.tsx` and `src/app/embed/[slug]/page.tsx`.
- Embed widget support with attribution backlink: `Powered by ConvertSheet Free Tools`.

---

## 4. Verification & Testing Plan
- **Unit Tests (`pdf-engine.test.ts`)**:
  - Test `compressPdf` across the 3 presets (`recommended`, `extreme`, `low`).
  - Test batch processing with progress callbacks.
  - Test encrypted/corrupted PDF rejection handling.
- **Component Tests (`PdfCompressorTool.test.tsx`)**:
  - Test multi-file dropzone, preset toggle changes, card grid stats, individual download, card removal, and ZIP export.
- **Project Verification**:
  - `npm test` &rarr; 100% pass across all test suites.
  - `npm run build` &rarr; All static routes generate cleanly.
  - `node scripts/audit-pages.js` &rarr; 0 broken links, 100% SEO pass.
