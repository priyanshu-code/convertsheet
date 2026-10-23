# Specification: 100% Usage-Focused UI & Professional Studio Workspace

## 1. Problem Statement
The current ConvertSheet UI tries to pretend complex file engineering is a simplistic toy widget. As a result:
1. **Missing Core Ingestion UX:** Tools lack robust drag-and-drop and clipboard paste (`⌘V`), or bury file inputs in clumsy layouts.
2. **False Simplicity vs. Real Power:** The UI hides essential controls or awkwardly crams them into narrow boxes, rather than providing a professional two-column studio workspace (Live Preview + Full Parameter Controls).
3. **Legacy Header Clutter:** The header is still dominated by Excel converters and spreadsheet categories rather than the full suite of Image, Audio, AI, PDF, and Data tools.

## 2. Core Architectural Pillars

### A. Universal Dropzone & Clipboard Engine (`StudioDropZone`)
Every media and document tool must use a standardized, battle-tested `StudioDropZone`:
- **Full-Area Drag-and-Drop:** Obvious dashed border, generous padding, glowing active state on hover/drag.
- **System Clipboard Paste (`⌘V` / `Ctrl+V`):** Users can capture a screenshot or copy a file and immediately paste it into the tool without opening a file picker.
- **Active File Inspector Bar:** Once loaded, displays:
  - File name, file size (formatted, e.g., `2.4 MB`), MIME type.
  - Image dimensions (`1920 × 1080 px`) or Audio duration (`02:45 min`) or Page count.
  - "Replace File" and "Clear" quick buttons.

### B. Professional Studio Layout (Two-Column Workspace)
Instead of a cramped vertical stack:
- **Left Column (Visual Canvas & Inspector):**
  - Interactive dropzone when empty.
  - Interactive Before/After image comparison slider or live audio player once loaded.
  - Live result preview with exact byte-level metric delta (e.g., `2.4 MB → 48.6 KB (-98%)`).
- **Right Column (Precision Parameter Controls):**
  - **Presets:** Quick 1-click pills (e.g. `20 KB`, `50 KB`, `100 KB`, `Passport 3.5×4.5cm`, `NSDL PAN`).
  - **Dimension Engine:** Width, Height, Unit (px, cm, inch), DPI (300 DPI for passports), Aspect Ratio Lock.
  - **Output Settings:** Format (`JPEG`, `WEBP`, `PNG`), compression tolerance.
  - **Primary Action:** High-contrast execution button (`Convert Now` / `Process Media`) with live progress state and 1-click Download.

### C. Clean, Modern Header (`Navbar.tsx`)
- **Logo:** Clean, understated `ConvertSheet` typographic branding with minimal geometric icon.
- **Tools Popover:** Categorized by real daily utility:
  - **Image & Photo Studio:** Target KB Compressor (20/50/100/200KB), Passport Photo Maker, White Background, Unblur & Enhancer.
  - **Audio & Speech:** Speech-to-Text Whisper, Text-to-Speech, Background Noise Reducer.
  - **PDF & Document Engine:** PDF to Markdown & OCR, Merge, Split, Compress.
  - **AI & Text Utilities:** AI Content Detector, JSON Formatter, Base64.
  - **File Converters:** Parquet, CSV, Excel, DuckDB in-browser engine.
  - **Calculators:** SIP, EMI, Salary, Mortgage.
- **Search:** Instant `⌘K` command bar trigger.
- **Cleaned Up:** Zero legacy Excel converter bias, zero marketing slogans, zero decorative clutter.

### D. Homepage: Universal Command Center
- **Direct Search & Filter:** Autofocus `⌘K` search matching tools, formats, and actions in < 10ms.
- **Universal Quick-Drop Zone:** Allows dropping any file on the home hero to immediately route to the best tool (e.g. dropping a JPG suggests Target KB Compressor or Passport Maker; dropping an MP3 suggests Speech-to-Text or Audio Denoise).
- **Categorized Utility Grids:** High-density, functional cards with specifications and 1-click launch.

## 3. Plan of Execution
1. **Component 1: Standardized `StudioDropZone`** with drag-and-drop, clipboard paste (`⌘V`), and file metadata inspector.
2. **Component 2: Header Overhaul (`Navbar.tsx`)** removing Excel bias, adding comprehensive tools popover and clean monochrome branding.
3. **Component 3: Professional Studio Workspace** for `KbImageResizerTool` (covering all 12 target KB, passport, and exam photo tools).
4. **Component 4: Homepage Command Center** with universal dropzone and high-density tool directory.
5. **Component 5: Unit Tests & Verification** ensuring all tests pass (100% green) and static export builds cleanly.
