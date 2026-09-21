export interface CompetitorComparison {
  slug: string;
  competitorName: string;
  title: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  prosCompetitor: string[];
  consCompetitor: string[];
  convertsheetAdvantages: string[];
  featuresMatrix: {
    feature: string;
    convertsheet: string;
    competitor: string;
    isAdvantage: boolean;
  }[];
  recommendedConverters: {
    slug: string;
    name: string;
    description: string;
    type: "tool" | "converter";
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const COMPARISONS: CompetitorComparison[] = [
  {
    slug: "cloudconvert-alternative",
    competitorName: "CloudConvert",
    title: "Best Free CloudConvert Alternative (Zero Server Uploads)",
    metaDescription: "Looking for a secure CloudConvert alternative? ConvertSheet converts JSON, XML, CSV, and Parquet directly in your browser using WebAssembly. No file uploads, no daily limits.",
    heroHeadline: "The Zero-Upload, In-Browser CloudConvert Alternative",
    heroSubheadline: "Stop uploading sensitive company data, API responses, and financial records to cloud servers. ConvertSheet processes files locally on your device with WebAssembly.",
    prosCompetitor: [
      "Broad format support including obscure legacy archives",
      "API platform for cloud-to-cloud server pipelines",
    ],
    consCompetitor: [
      "Uploads your files to remote third-party cloud infrastructure",
      "Daily limit of 25 conversion minutes on free tier",
      "Upload delays and bandwidth limits on large datasets",
      "Potential compliance and GDPR risks for proprietary records",
    ],
    convertsheetAdvantages: [
      "100% In-Browser: Zero bytes leave your device",
      "Completely Free & Unlimited: No credits, queues, or paywalls",
      "Offline Ready: PWA support allows conversions without internet",
      "Ultra-Fast: Instant processing powered by DuckDB-Wasm and SheetJS",
    ],
    featuresMatrix: [
      {
        feature: "Data Privacy & Processing",
        convertsheet: "100% Local (Client-Side WebAssembly)",
        competitor: "Uploaded to Remote Cloud Servers",
        isAdvantage: true,
      },
      {
        feature: "Daily Conversion Limits",
        convertsheet: "Unlimited Free Conversions",
        competitor: "25 Conversion Minutes/Day Free",
        isAdvantage: true,
      },
      {
        feature: "Works Offline / Air-Gapped",
        convertsheet: "Yes (Full Progressive Web App)",
        competitor: "No (Requires Constant Internet)",
        isAdvantage: true,
      },
      {
        feature: "Upload & Download Latency",
        convertsheet: "Zero (Instant In-Memory Stream)",
        competitor: "Depends on Internet Speed & Cloud Queues",
        isAdvantage: true,
      },
      {
        feature: "Server Data Retention Risk",
        convertsheet: "Impossible (No Server Receives Data)",
        competitor: "Stored temporarily on cloud servers",
        isAdvantage: true,
      },
      {
        feature: "Excel Spreadsheet Formatting",
        convertsheet: "Native Formatted .xlsx with Auto-Width",
        competitor: "Standard Raw Conversion",
        isAdvantage: true,
      },
    ],
    recommendedConverters: [
      {
        slug: "json-to-excel",
        name: "JSON to Excel Converter",
        description: "Flatten complex nested JSON trees and API dumps directly into Excel workbooks.",
        type: "converter",
      },
      {
        slug: "xml-to-excel",
        name: "XML to Excel Converter",
        description: "Convert corporate XML feeds and ERP exports into clean spreadsheets.",
        type: "converter",
      },
      {
        slug: "csv-to-excel",
        name: "CSV to Excel Converter",
        description: "Format comma-separated files into styled Excel sheets with zero data upload.",
        type: "converter",
      },
      {
        slug: "parquet-to-excel",
        name: "Parquet to Excel Converter",
        description: "Parse big data Apache Parquet files in-browser with DuckDB-Wasm.",
        type: "converter",
      },
    ],
    faqs: [
      {
        question: "Why should I choose ConvertSheet over CloudConvert?",
        answer: "If you work with confidential data, customer records, or financial numbers, CloudConvert requires uploading your files to their servers. ConvertSheet executes 100% in your browser using WebAssembly. Your files never leave your machine.",
      },
      {
        question: "Does ConvertSheet impose a file conversion queue or limit?",
        answer: "No. Because ConvertSheet utilizes your own computer's CPU and RAM via Web Workers, there are zero server costs for us and zero usage caps or paid credit tiers for you.",
      },
      {
        question: "Can ConvertSheet work without an internet connection?",
        answer: "Yes. Once the ConvertSheet web application is loaded in your browser or installed as a PWA, all core data conversion engines run fully offline.",
      },
    ],
  },
  {
    slug: "smallpdf-alternative",
    competitorName: "Smallpdf",
    title: "Free Smallpdf Alternative — Unlimited PDF & Data Tools",
    metaDescription: "Tired of Smallpdf's 2-task daily limits and paywalls? ConvertSheet is a fast, unlimited, in-browser alternative that never uploads your files.",
    heroHeadline: "The Free, Unlimited Smallpdf Alternative",
    heroSubheadline: "No 2-task daily limits. No credit card traps. ConvertSheet gives you client-side data and document utilities with zero cloud uploads.",
    prosCompetitor: [
      "Well-known consumer brand for standard PDF signing",
      "Mobile scanner apps for iOS and Android",
    ],
    consCompetitor: [
      "Strict limit of 2 free document conversions per day",
      "Aggressive paywalls and subscription prompts ($12+/mo)",
      "Uploads private documents to third-party cloud servers",
      "Requires account creation or email collection for repeated tasks",
    ],
    convertsheetAdvantages: [
      "Unlimited Usage: Convert as many documents and tables as you need",
      "Zero Paywalls: 100% free with no hidden credit card prompts",
      "No Sign-Up Required: Never asks for your email or account registration",
      "Local Device Privacy: Files are processed on-device via WebAssembly",
    ],
    featuresMatrix: [
      {
        feature: "Free Usage Quota",
        convertsheet: "100% Unlimited Free Use",
        competitor: "2 Free Tasks / 24 Hours",
        isAdvantage: true,
      },
      {
        feature: "Document Privacy",
        convertsheet: "Local Browser Processing Only",
        competitor: "Uploaded to Cloud Servers",
        isAdvantage: true,
      },
      {
        feature: "Account or Login Required",
        convertsheet: "Never Required",
        competitor: "Pushed Aggressively",
        isAdvantage: true,
      },
      {
        feature: "Paywall / Subscription Nagging",
        convertsheet: "None",
        competitor: "Frequent $12+/mo Subscription Upsells",
        isAdvantage: true,
      },
      {
        feature: "Spreadsheet Generation Quality",
        convertsheet: "Optimized for Data Analysts (.xlsx / .csv)",
        competitor: "Standard Document Export",
        isAdvantage: true,
      },
    ],
    recommendedConverters: [
      {
        slug: "pdf-to-excel",
        name: "PDF to Excel Converter",
        description: "Extract tabular financial and business data from PDF documents into Excel spreadsheets.",
        type: "converter",
      },
      {
        slug: "excel-to-csv",
        name: "Excel to CSV Converter",
        description: "Convert workbooks to clean UTF-8 CSVs without opening Microsoft Office.",
        type: "converter",
      },
      {
        slug: "json-to-excel",
        name: "JSON to Excel Converter",
        description: "Instant tabular conversion of structured developer payloads.",
        type: "converter",
      },
    ],
    faqs: [
      {
        question: "Is ConvertSheet truly free without Smallpdf's 2-task limit?",
        answer: "Yes. ConvertSheet has no daily task quotas. You can convert dozens or hundreds of files consecutively without seeing a paywall.",
      },
      {
        question: "Do I need to create an account or provide an email?",
        answer: "No. ConvertSheet requires zero registration. Just drag your file into the tool and download your converted spreadsheet immediately.",
      },
      {
        question: "How does ConvertSheet protect my confidential documents?",
        answer: "Unlike Smallpdf, which transmits files across the internet to remote cloud processors, ConvertSheet parses data locally using client-side JavaScript and WebAssembly.",
      },
    ],
  },
  {
    slug: "omni-calculator-alternative",
    competitorName: "Omni Calculator",
    title: "Clean Omni Calculator Alternative: Zero Clutter & Excel Export | ConvertSheet",
    metaDescription: "Looking for an Omni Calculator alternative? ConvertSheet offers fast, clean financial and wage calculators with instant Excel amortization workbook downloads.",
    heroHeadline: "The Clean, Spreadsheet-Ready Omni Calculator Alternative",
    heroSubheadline: "Fast, accurate financial calculators without intrusive banner popups, paywalls, or laggy layouts. Export any calculation directly to a styled Excel schedule.",
    prosCompetitor: [
      "Massive library of niche physics and biology calculators",
      "Detailed explanatory text for classroom physics formulas",
    ],
    consCompetitor: [
      "Dense ad clutter and flashing banners",
      "No 1-click Excel (.xlsx) schedule or amortization download",
      "Does not provide client-side data conversion (JSON, CSV, Parquet)",
      "Can feel slow and bloated on mobile browsers",
    ],
    convertsheetAdvantages: [
      "Direct Excel Export: Download complete amortization schedules and growth balance sheets in .xlsx",
      "Modern & Responsive UI: Clean dual-column layout with tactile sliders",
      "Local Storage Scenario History: Bookmark multiple scenarios in browser memory without an account",
      "Unified Suite: Combines financial planning with in-browser data converters",
    ],
    featuresMatrix: [
      {
        feature: "Excel (.xlsx) Schedule Export",
        convertsheet: "Built-In 1-Click Formatted Workbook",
        competitor: "Not Available (Numbers on Screen Only)",
        isAdvantage: true,
      },
      {
        feature: "Ad Intrusion & Clutter",
        convertsheet: "Clean, Distraction-Free Layout",
        competitor: "Heavy Third-Party Display Banner Ads",
        isAdvantage: true,
      },
      {
        feature: "Saved Scenario History",
        convertsheet: "Private In-Browser LocalStorage Drawer",
        competitor: "None",
        isAdvantage: true,
      },
      {
        feature: "Bank-Ready PDF Dossier",
        convertsheet: "Downloadable Loan & Mortgage PDF",
        competitor: "Not Available",
        isAdvantage: true,
      },
      {
        feature: "Integrated Data Tools",
        convertsheet: "Full Converter Suite (JSON, XML, CSV, Parquet)",
        competitor: "Calculators Only",
        isAdvantage: true,
      },
    ],
    recommendedConverters: [
      {
        slug: "mortgage-calculator",
        name: "Mortgage Calculator & Amortization",
        description: "Full principal, interest, taxes, and insurance breakdown with downloadable PDF dossier.",
        type: "tool",
      },
      {
        slug: "debt-payoff-calculator",
        name: "Debt Payoff Accelerator",
        description: "Compare Avalanche vs Snowball payoff strategies with custom rollover schedule.",
        type: "tool",
      },
      {
        slug: "high-yield-savings-cd-calculator",
        name: "High-Yield Savings & CD Calculator",
        description: "Compound growth simulator with daily compounding and early withdrawal penalty modeling.",
        type: "tool",
      },
      {
        slug: "hourly-to-salary-calculator",
        name: "Hourly to Salary Wage Calculator",
        description: "Convert hourly rates to paychecks across overtime and state tax variations.",
        type: "tool",
      },
    ],
    faqs: [
      {
        question: "Why use ConvertSheet instead of Omni Calculator for financial math?",
        answer: "Omni Calculator shows numbers on screen, but ConvertSheet allows you to export full 360-month amortization schedules and compound growth balances directly to Microsoft Excel workbooks for your personal budget.",
      },
      {
        question: "Can I embed ConvertSheet calculators on my own blog?",
        answer: "Yes. Every ConvertSheet calculator includes an Embed button with a ready-to-use responsive HTML iframe snippet for your website.",
      },
      {
        question: "Is my personal financial data tracked or stored?",
        answer: "No. All income, loan balance, and mortgage numbers remain strictly in your browser. Nothing is ever sent to any remote database.",
      },
    ],
  },
];

export function getAllComparisons(): CompetitorComparison[] {
  return COMPARISONS;
}

export function getComparisonBySlug(slug: string): CompetitorComparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
