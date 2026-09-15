# System Design & Specification: ConvertSheet (convertsheet.com)

**Author:** Antigravity Engineering  
**Date:** 2026-09-15  
**Status:** Approved  
**Topic:** ConvertSheet - Browser-First High-Speed Data Converter & API

---

## 1. Executive Summary & Business Strategy

ConvertSheet (`convertsheet.com`) is a high-speed, privacy-first structured data conversion platform engineered to capture high-volume search traffic and monetize through a 3-tier engine:
1. **Programmatic SEO & High-RPM Clean Display Advertising:** Target high-intent queries (e.g., `json to excel`, `xml to excel`, `pdf table to excel`) with instant, free, client-side tools monetized with unobtrusive B2B ad units.
2. **Pro Subscriptions ($4.99 - $19.99/mo):** For power users needing large files (>10MB up to 100GB via chunked backend processing), batch conversions, advanced schema mapping, custom delimiters, and automated 15-minute file wipe guarantees.
3. **Developer REST API:** API keys and metering for developers automating file transformations in Python, Node.js, Zapier, and n8n.

### Architectural Core Principles
- **KISS (Keep It Simple, Stupid):** Zero bundler-heavy worker dependencies; modular native async parsing; static in-memory registry for programmatic SEO without database overhead.
- **SOLID Architecture:** Decoupled converter engines implementing a uniform `IConverterEngine` interface, open for extension without modifying page templates or UI components.
- **Client-Side First (Zero Server Cost):** Files $< 5\text{MB}$ (constituting $>80\%$ of typical traffic) convert directly in the user's browser using WebAssembly / JavaScript without uploading data to servers.
- **Monorepo Separation:** Decoupled `frontend/` (Next.js App Router) and `backend/` (FastAPI for heavy tasks & API customers).

---

## 2. Directory & Monorepo Architecture

```
convertsheet/
├── frontend/                               # Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide icons
│   ├── public/                             # Static assets, logos, favicon, robots.txt
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                  # Root layout: Navbar, Footer, ThemeProvider, Google AdSense script loader
│   │   │   ├── page.tsx                    # Home page: Universal converter + featured tools grid + value props
│   │   │   ├── pricing/                    # Pricing page: Free vs Pro comparison & Stripe checkout CTA
│   │   │   ├── convert/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx            # Programmatic SEO converter page (SSG via generateStaticParams)
│   │   │   │       └── opengraph-image.tsx # Dynamic OG social preview image
│   │   │   └── sitemap.ts                  # Dynamic XML sitemap generator
│   │   ├── components/
│   │   │   ├── converter/
│   │   │   │   ├── DropZone.tsx            # Drag & drop upload area with mime-type validation
│   │   │   │   ├── DataPreviewTable.tsx    # Responsive virtualized/paginated 10-row data preview
│   │   │   │   ├── ConverterCard.tsx       # Core container managing file state, options & conversion trigger
│   │   │   │   ├── ConversionProgress.tsx  # Parsing & formatting progress indicator
│   │   │   │   └── FormatSelector.tsx      # Source & target format picker
│   │   │   ├── seo/
│   │   │   │   ├── HowToGuide.tsx          # 3-step conversion visual guide
│   │   │   │   ├── FAQAccordion.tsx        # SEO FAQ accordion
│   │   │   │   └── JsonLdSchema.tsx        # Structured schema: SoftwareApplication, HowTo, FAQPage
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx              # Top navigation with logo, Tools dropdown, Pricing, Pro badge
│   │   │   │   ├── Footer.tsx              # Footer with converter links, privacy policy, terms
│   │   │   │   └── AdBanner.tsx            # AdSense responsive placeholder wrapper
│   │   │   └── ui/                         # Atomic components (button, card, badge, dialog, tabs)
│   │   ├── hooks/
│   │   │   └── useConverter.ts             # Custom hook orchestrating parse, preview, and export
│   │   ├── lib/
│   │   │   ├── engines/                    # Concrete conversion engines implementing IConverterEngine
│   │   │   │   ├── json-engine.ts          # JSON parse, flatten, and serialize
│   │   │   │   ├── csv-engine.ts           # PapaParse CSV parser & formatter with auto-delimiter detection
│   │   │   │   ├── excel-engine.ts         # SheetJS (xlsx) workbook read & write
│   │   │   │   ├── xml-engine.ts           # fast-xml-parser XML to tabular mapper
│   │   │   │   └── index.ts                # Engine dispatcher
│   │   │   ├── registry.ts                 # Source of truth for SEO copy, slugs, formats, FAQs
│   │   │   └── utils.ts                    # File size formatting, blob downloader, classnames
│   │   └── types/
│   │       ├── converter.ts                # IConverterEngine, TabularData, ConversionResult interfaces
│   │       └── registry.ts                 # ConverterMeta, SEOConfig, FAQItem definitions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                                # Phase 3: Python FastAPI Microservice (for dockerbox)
│   ├── app/
│   │   ├── main.py                         # FastAPI application entrypoint
│   │   ├── routers/                        # Endpoints: /convert/pdf, /convert/xml-heavy, /convert/tally
│   │   └── services/                       # Pandas, openpyxl, pdfplumber pipelines
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
├── docs/
│   └── superpowers/specs/                  # System specifications & design documents
└── README.md                               # Project blueprint and onboarding guide
```

---

## 3. SOLID Engine Architecture

### Single Responsibility (SRP) & Liskov Substitution (LSP)
All format engines conform to the universal `IConverterEngine` contract:

```typescript
export interface TabularData {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export interface ConversionOptions {
  delimiter?: string;
  sheetName?: string;
  prettify?: boolean;
  flattenNested?: boolean;
}

export interface ConversionOutput {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export interface IConverterEngine {
  parsePreview(file: File, maxRows?: number): Promise<TabularData>;
  convert(file: File, options?: ConversionOptions): Promise<ConversionOutput>;
}
```

### Open/Closed Principle (OCP)
The system is closed for modification, open for extension via `CONVERTER_REGISTRY`. Adding any new tool (e.g. `tsv-to-csv`) requires only one dictionary entry:

```typescript
export const CONVERTER_REGISTRY: Record<string, ConverterConfig> = {
  "json-to-excel": {
    slug: "json-to-excel",
    sourceFormat: "json",
    targetFormat: "xlsx",
    sourceExtension: ".json",
    targetExtension: ".xlsx",
    title: "Convert JSON to Excel Online",
    subtitle: "Fast, secure, and 100% private in-browser JSON to XLSX spreadsheet converter.",
    engineId: "json-to-excel",
    faqs: [ ... ],
    howTo: [ ... ],
  },
  // 6 additional MVP converters...
};
```

### Dependency Inversion Principle (DIP) & Custom Hook
Components never call third-party libraries (`xlsx`, `papaparse`) directly. They consume the `useConverter` hook:

```typescript
export function useConverter(config: ConverterConfig) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TabularData | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => { ... };
  const handleConvert = async (options?: ConversionOptions) => { ... };
  const reset = () => { ... };

  return { file, preview, isConverting, error, handleFileSelect, handleConvert, reset };
}
```

---

## 4. MVP Converters Scope & Implementation Strategy

| Slug | Source | Target | Client Engine | Future Backend Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `json-to-excel` | `.json` | `.xlsx` | Custom recursive JSON flattener + SheetJS `json_to_sheet` | Python `pandas.json_normalize` for >10MB |
| `xml-to-excel` | `.xml` | `.xlsx` | `fast-xml-parser` node extractor + SheetJS | Python `xmltodict` & `pandas` |
| `csv-to-excel` | `.csv` | `.xlsx` | `papaparse` stream/chunk + SheetJS `aoa_to_sheet` | Python `pandas.read_csv` |
| `excel-to-json` | `.xlsx`, `.xls` | `.json` | SheetJS `sheet_to_json` + Blob export | Python `openpyxl` |
| `excel-to-csv` | `.xlsx`, `.xls` | `.csv` | SheetJS `sheet_to_csv` + UTF-8 BOM injection | Python `pandas.to_csv` |
| `pdf-to-excel` | `.pdf` | `.xlsx` | Client UI with instant routing to FastAPI engine | Python `pdfplumber` table extraction |
| `tally-xml-to-excel` | `.xml` | `.xlsx` | Specialized Tally TDL parser (Vouchers, Ledger masters) | Python Tally XML parser |

---

## 5. Programmatic SEO Engine

1. **URL Scheme:** `/convert/[source]-to-[target]`
2. **Static Generation (`generateStaticParams`):** Next.js compiles all converter routes at build time for instant TTFB (Time to First Byte).
3. **Structured Schema Markup (JSON-LD):**
   - `SoftwareApplication`: Identifies ConvertSheet as an application, specifies operating system, application category (`UtilitiesApplication`), and free pricing model.
   - `HowTo`: Outlines step 1 (upload file), step 2 (review preview & select settings), step 3 (download converted spreadsheet).
   - `FAQPage`: Answers questions on data security, file size limits, and format compatibility for Google search rich snippets.
4. **Dynamic Sitemap (`src/app/sitemap.ts`):** Automatically indexes homepage, pricing, and all registry converter routes with `lastModified` and `priority: 0.9`.

---

## 6. Monetization & Subscription Readiness

1. **AdSense Ready (`<AdBanner />`):** Clean, standard IAB banner slots (e.g. 728x90 leaderboard below converter, 300x250 sidebar/inline) with fallbacks and responsive collapse.
2. **Pro Tier Gating Hooks:**
   - Client-side size limit check: If `file.size > 10 * 1024 * 1024` (10MB), display an elegant Pro Upgrade modal with Stripe checkout CTA.
   - Batch conversion trigger: "Want to convert 50 files at once? Upgrade to ConvertSheet Pro".
3. **Developer API Readiness:**
   - Dedicated `/pricing` route highlighting API plans ($19.99/mo for 10,000 conversions).
   - Clean navigation link to API documentation.

---

## 7. Visual Design & Theme Guidelines

- **Style:** Modern Clean Tech / FinTech.
- **Color Palette:**
  - Background: Dark slate (`#0B0F17` / `#111827`) & Clean White/Zinc light mode.
  - Primary / Success: Emerald Green (`#10B981` / `#059669`) symbolizing sheets, tables, and successful conversions.
  - Accents & Borders: Subtle border rings (`border-zinc-800` / `border-zinc-200`), smooth transitions.
- **Layout:** High-contrast typography, clear visual hierarchy, hero converter container above the fold, sticky navigation with Pro button.

---

## 8. Verification & Quality Assurance Plan

1. **Unit Testing:** Verify each engine (`json`, `csv`, `excel`, `xml`) against sample test fixtures:
   - Nested JSON to 2D tabular array.
   - Malformed CSV with semicolons/tabs and unescaped quotes.
   - Multi-sheet Excel parsing.
2. **End-to-End Verification:**
   - Upload sample `.json` file $\rightarrow$ verify 10-row preview rendered $\rightarrow$ trigger conversion $\rightarrow$ verify `.xlsx` Blob generation and filename correctness.
   - Test SEO schema output with Google Rich Results Test format.
3. **Performance:** Ensure client-side conversion completes in $< 300\text{ms}$ for standard $1-3\text{MB}$ datasets without UI blocking.
