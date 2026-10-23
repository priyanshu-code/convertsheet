# Specification: 100% Usage-Focused UI & UX Redesign

## 1. Problem Statement
The current ConvertSheet UI suffers from marketing clutter, redundant badges, and an outdated legacy focus (e.g. defaulting to an Excel converter card and spreadsheet-heavy header menus). Users arriving on the site want immediate utility and execution speed without walls of marketing text, buzzwords, or decorative fluff.

## 2. Core Design Principles
1. **Zero Fluff / Zero Marketing Slop:** Eliminate trust badges, promotional paragraphs, and buzzword claims.
2. **Immediate Utility:** Above the fold is 100% functional workspace: instant search (`⌘K`) with autofocus, filterable tool directories, and 1-click execution.
3. **High-Density, Modern Typography:** Tight letter tracking (`tracking-tight`), crisp monochrome contrast (pure `#000000`/`#ffffff`), hairline borders (`border-zinc-200` / `border-zinc-800`), and zero wasted whitespace.
4. **Fast Keyboard & Drag-and-Drop UX:** Direct file dropzones, instant shortcut keys, and instant navigation.

## 3. Header Architecture (`Navbar.tsx`)
- **Logo:** Clean, understated typographic mark: `ConvertSheet` with a minimal monochrome icon.
- **Navigation (Usage-Only):**
  - **Tools Menu:** Practical categorization by actual function:
    - *Images & Photos* (Passport Photo Maker, 20/50/100KB Compress, White Background, Unblur, Enhancer)
    - *Audio & Speech* (Speech-to-Text, Text-to-Speech, Audio Noise Reducer)
    - *PDF & Docs* (PDF to Markdown, Merge, Split, Compress)
    - *Text & AI* (AI Detector, JSON Formatter, Base64)
    - *Calculators* (SIP, EMI, Salary, Mortgage)
  - **Converters:** Direct access to file conversion matrix (CSV, JSON, Parquet, Excel, XML).
  - **Search (`⌘K`):** Raycast-style search bar trigger with keyboard badge.
- **Utilities:**
  - Currency selector (compact).
  - Dark/Light mode toggle.
- **Removed:**
  - Removed all legacy "Spreadsheets & Docs" Excel converter lists.
  - Removed marketing badges ("100% In-Browser Privacy").
  - Removed decorative callouts.

## 4. Homepage Architecture (`app/page.tsx` & `HomeCommandHero.tsx`)
- **Above-The-Fold Command Center:**
  - Instant Filter / Search Bar with live fuzzy matching across all 90+ tools and converters.
  - Category Pills: `All`, `Image Tools`, `Audio & Speech`, `PDF & Docs`, `AI & Text`, `File Converters`, `Calculators`.
- **Active Functional Grid:**
  - Compact, high-utility cards showing:
    - Tool Name & exact function (e.g., "India Passport Photo — 3.5×4.5cm, 300 DPI").
    - Input specifications (format accepted, size limits).
    - 1-click launch button or inline drag-and-drop launcher.
- **Categorized Tool Matrix:**
  - Section 1: **Image & Identity Tools** (Target KB Resizer, Passport Formatter, White BG).
  - Section 2: **AI & Media Tools** (Speech-to-Text, Audio Denoise, AI Content Detector).
  - Section 3: **File & Data Converters** (JSON to Excel, CSV to Parquet, PDF to Markdown).
  - Section 4: **Core Utilities & Calculators** (JSON Formatter, Base64, Salary / EMI).

## 5. Verification & Testing
- Vitest unit tests for the updated Navbar and Homepage components.
- Verification that all navigation routes and tool links remain functional.
- Static export build check (`npm run build`).
