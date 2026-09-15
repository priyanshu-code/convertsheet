# ConvertSheet (`convertsheet.com`)

Fast, private, browser-first & API-driven structured data converter (JSON, XML, CSV, Excel, PDF tables, Tally XML).

## Project Overview

ConvertSheet combines zero-server-cost client-side WebAssembly conversions with high-intent programmatic SEO and B2B Pro subscription / API tiers.

```
                    ┌─────────────────────────┐
                    │  User Browser / Mobile  │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           │                                           │
  [Files < 10MB (Client-Side First)]          [Files > 10MB & Pro API Calls]
           │                                           │
           ▼                                           ▼
┌───────────────────────────┐             ┌─────────────────────────┐
│ Client-Side Engine        │             │ Backend FastAPI Service │
│ (100% Private, 0 Cost)    │             │ (Hosted on dockerbox    │
│ SheetJS, PapaParse, XML   │             │  via Cloudflare Tunnel) │
└───────────────────────────┘             └─────────────────────────┘
```

## Monetization Model (Triple-Threat Engine)

1. **Google AdSense (Clean Display Ads):** Programmatic SEO landing pages monetized via standard IAB responsive ad units (`leaderboard`, `rectangle`, `horizontal`).
2. **Pro SaaS Subscriptions ($4.99 – $19.99/month):**
   - Free tier: Up to 10MB per file, 100% in-browser privacy.
   - Pro tier: Up to 100GB files, batch conversion, automated 15-minute file wipe guarantee for corporate data, priority queues.
3. **Developer REST API:** API keys and monthly subscriptions for automating spreadsheet ingestion via Python, Node.js, Zapier, and n8n.

## MVP Converters Included

1. **JSON to Excel (`.xlsx`)** — `/convert/json-to-excel`
2. **XML to Excel (`.xlsx`)** — `/convert/xml-to-excel`
3. **CSV to Excel (`.xlsx`)** — `/convert/csv-to-excel`
4. **Excel to JSON** — `/convert/excel-to-json`
5. **Excel to CSV** — `/convert/excel-to-csv`
6. **PDF Table to Excel** — `/convert/pdf-to-excel`
7. **Tally XML to Excel** — `/convert/tally-xml-to-excel`

## Directory Structure

```
convertsheet/
├── frontend/                               # Next.js 14+ (App Router), TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── convert/[slug]/             # Programmatic SEO routes (SSG pre-rendered)
│   │   │   ├── pricing/                    # Free vs Pro vs Developer API comparison
│   │   │   ├── page.tsx                    # Universal drag-and-drop converter
│   │   │   ├── sitemap.ts                  # Dynamic XML sitemap
│   │   │   └── robots.ts                   # Search crawler directives
│   │   ├── components/
│   │   │   ├── converter/                  # DropZone, DataPreviewTable, ConverterCard, FormatSelector
│   │   │   ├── layout/                     # Navbar, Footer, ThemeToggle, AdBanner
│   │   │   └── seo/                        # HowToGuide, FAQAccordion, JsonLdSchema
│   │   ├── hooks/                          # useConverter hook with 10MB gating
│   │   ├── lib/                            # SOLID conversion engines & registry
│   │   └── types/                          # TypeScript definitions
│   ├── package.json
│   └── tailwind.config.ts
├── backend/                                # Python FastAPI Service for dockerbox
│   ├── app/                                # FastAPI application & conversion routers
│   ├── Dockerfile                          # Container setup for Linux server
│   ├── requirements.txt                    # pandas, openpyxl, pdfplumber, xmltodict
│   └── README.md                           # Cloudflare Tunnel deployment instructions
├── docs/
│   └── superpowers/                        # Specs & implementation plans
└── README.md
```

## Running the Project

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access ConvertSheet.

To run the test suite:
```bash
npm test --prefix frontend
```

To build for production:
```bash
npm run build --prefix frontend
```

### Backend (Python FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
