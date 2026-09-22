import { ToolConfig, ToolCategory } from "@/types/tool";
import { PHASE2_TOOLS } from "./phase2-tools-data";
import { IMAGE_TOOLS } from "./image-tools-data";
import { PDF_TOOLS } from "./pdf-tools-data";
import { FINANCIAL_CROWN_TOOLS } from "./financial-crown-tools-data";
import { WORKBENCH_TOOLS } from "./workbench-tools-data";

export const TOOL_REGISTRY = {
  // ==========================================
  // CATEGORY A: DATA & DEVELOPER TOOLS (6)
  // ==========================================
  "base64-encoder-decoder": {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder & Decoder",
    category: "data-developer",
    title: "Base64 Encoder & Decoder Online - Fast, Free & Private",
    subtitle: "Encode plain text or binary data into Base64 format, or decode Base64 strings back to text directly in your browser.",
    metaDescription: "Free online Base64 encoder and decoder. Convert text, JSON, and binary data to and from Base64 instantly in your browser with zero server data retention.",
    answerSummary: "Base64 encoding translates binary or UTF-8 text into an ASCII string format of 64 printable characters, ensuring reliable transmission across text-only protocols.",
    badge: "Developer Favorite",
    featured: true,
    keywords: ["base64 encoder", "base64 decoder", "base64 to text", "text to base64", "utf-8 base64", "online base64 tool"],
    formulaDescription: "Binary octets (8-bit) are grouped into 24-bit blocks, then split into four 6-bit chunks mapped to the standard RFC 4648 Base64 character set (A-Z, a-z, 0-9, +, /).",
    about: "Base64 encoding is an essential tool for software engineers, data scientists, and web developers. It allows binary assets, authorization headers, cryptographic tokens, and embedded images to be represented in clean ASCII strings. ConvertSheet provides a 100% client-side encoder and decoder that runs entirely in your browser memory, guaranteeing that sensitive keys, credentials, and payloads are never sent to external servers.",
    howTo: [
      { step: 1, title: "Select Mode", description: "Choose whether you want to encode plain text into Base64 or decode an existing Base64 string." },
      { step: 2, title: "Input Content", description: "Type, paste, or upload your UTF-8 text or raw data into the input workspace." },
      { step: 3, title: "Copy or Download", description: "Instantly copy the converted output to your clipboard with one click." }
    ],
    faqs: [
      { question: "Does this Base64 tool support UTF-8 and special characters?", answer: "Yes. Our engine uses TextEncoder and TextDecoder APIs to safely handle Unicode characters, emojis, and non-ASCII text without encoding errors." },
      { question: "Are my encoded keys or tokens transmitted to your servers?", answer: "No. The entire transformation executes locally in your browser memory using client-side JavaScript. Zero bytes are uploaded." },
      { question: "What is Base64 padding (=)?", answer: "Base64 requires inputs to be multiples of 3 bytes. If the input has 1 or 2 leftover bytes, '=' padding characters are appended to satisfy the 24-bit block alignment." }
    ],
    relatedConverters: ["json-to-excel", "excel-to-json"],
    relatedTools: ["json-formatter-validator", "url-encoder-decoder", "hash-generator"]
  },

  "json-formatter-validator": {
    slug: "json-formatter-validator",
    name: "JSON Formatter & Validator",
    category: "data-developer",
    title: "JSON Formatter, Beautifier & Validator Online",
    subtitle: "Format, beautify, minify, and validate JSON payloads with accurate syntax error highlighting and tree structure viewing.",
    metaDescription: "Free online JSON formatter and validator. Pretty-print nested JSON, detect syntax errors with line indicators, and minify payloads directly in your browser.",
    answerSummary: "Use our JSON Formatter to beautify minified JSON strings with 2-space or 4-space indentation and pinpoint syntax errors instantly.",
    badge: "Popular",
    featured: true,
    keywords: ["json formatter", "json beautifier", "json validator", "pretty print json", "minify json", "json parser online"],
    formulaDescription: "JSON syntax trees are parsed via native ECMAScript JSON engines, validating RFC 8259 compliance and re-serializing with configurable whitespace indentation.",
    about: "Working with raw API outputs, database dumps, and webhook payloads frequently involves unformatted or malformed JSON. ConvertSheet's JSON Formatter cleans, indents, and validates your JSON in real-time. If there is a syntax error (such as a missing comma, unescaped quote, or trailing bracket), our validator pinpoints the exact line and character error message so you can fix it immediately.",
    howTo: [
      { step: 1, title: "Paste JSON", description: "Paste your raw, minified, or unformatted JSON text into the editor." },
      { step: 2, title: "Format & Validate", description: "Click Format to beautify with clean indentation, or Minify to strip unnecessary whitespace." },
      { step: 3, title: "Inspect & Copy", description: "Review the validated structure and copy the clean JSON output directly to your clipboard." }
    ],
    faqs: [
      { question: "Why is my JSON failing validation?", answer: "Common causes include trailing commas after the last array or object element, single quotes instead of double quotes, or unescaped control characters." },
      { question: "Can this format large JSON files?", answer: "Yes, our client-side formatter comfortably handles multi-megabyte payloads in browser memory without lag or server upload limits." },
      { question: "Is my JSON payload kept private?", answer: "100% private. Parsing and formatting take place in your browser. Nothing is logged, stored, or sent over the network." }
    ],
    relatedConverters: ["json-to-excel", "json-to-parquet", "excel-to-json"],
    relatedTools: ["base64-encoder-decoder", "url-encoder-decoder"]
  },

  "url-encoder-decoder": {
    slug: "url-encoder-decoder",
    name: "URL Encoder & Decoder",
    category: "data-developer",
    title: "URL Encoder & Decoder Online - Percent Encoding Tool",
    subtitle: "Safely encode special characters for query parameters or decode percent-encoded URLs back to human-readable strings.",
    metaDescription: "Free online URL encoder and decoder. Convert query strings and URIs to and from RFC 3986 percent-encoding with zero latency and 100% privacy.",
    answerSummary: "URL encoding replaces unsafe ASCII characters with a '%' followed by two hexadecimal digits, ensuring query parameters transmit safely across HTTP requests.",
    badge: "Instant",
    featured: false,
    keywords: ["url encoder", "url decoder", "percent encoding", "uri encoder", "query string encoder", "decode url online"],
    formulaDescription: "Non-alphanumeric characters outside the unreserved RFC 3986 set ([A-Z], [a-z], [0-9], '-', '_', '.', '~') are replaced with UTF-8 byte hexadecimal percent escapes (%XX).",
    about: "URLs can only be sent over the Internet using the standard ASCII character-set. When web addresses contain spaces, ampersands, foreign scripts, or reserved characters, they must be percent-encoded. This tool allows developers, marketers, and SEO specialists to instantly encode parameters for tracking links and API requests, or decode complex redirect URLs.",
    howTo: [
      { step: 1, title: "Enter URL or String", description: "Input the link, query parameters, or string you need to transform." },
      { step: 2, title: "Choose Action", description: "Select Encode for percent-encoding or Decode to restore readable text." },
      { step: 3, title: "Copy Result", description: "Grab your encoded or decoded URI string with one-click clipboard copy." }
    ],
    faqs: [
      { question: "What is the difference between encodeURI and encodeURIComponent?", answer: "encodeURI preserves protocol delimiters like '://', '/', and '?', while encodeURIComponent encodes everything, making it safe for query parameter values." },
      { question: "Why does a space become %20 or + in URLs?", answer: "%20 is standard RFC 3986 percent-encoding for spaces, whereas '+' is legacy application/x-www-form-urlencoded form query syntax." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["base64-encoder-decoder", "json-formatter-validator"]
  },

  "hash-generator": {
    slug: "hash-generator",
    name: "Cryptographic Hash Generator",
    category: "data-developer",
    title: "Hash Generator Online - SHA-256, SHA-512, SHA-1 & MD5",
    subtitle: "Generate secure cryptographic message digests and checksums for strings and passwords using native Web Crypto APIs.",
    metaDescription: "Free online hash generator. Calculate SHA-256, SHA-512, SHA-1, and MD5 hashes instantly in your browser using secure client-side Web Crypto APIs.",
    answerSummary: "Cryptographic hash functions produce a unique, deterministic, fixed-length hexadecimal digest from any input text to verify data integrity.",
    badge: "Web Crypto",
    featured: true,
    keywords: ["hash generator", "sha256 generator", "sha512 online", "md5 generator", "crypto checksum", "hash text"],
    formulaDescription: "Input text is converted to an ArrayBuffer and digested via the W3C Web Cryptography API (crypto.subtle.digest) producing bit-level cryptographic signatures.",
    about: "Cryptographic hash generators are indispensable for verifying data integrity, creating digital signatures, checking file checksums, and building authentication workflows. ConvertSheet leverages your browser's native hardware-accelerated Web Crypto API, providing military-grade hashing with zero latency and complete privacy.",
    howTo: [
      { step: 1, title: "Enter Text", description: "Type or paste the input string or secret you want to digest." },
      { step: 2, title: "Select Hash Algorithm", description: "Choose between SHA-256 (recommended), SHA-512, SHA-1, or MD5." },
      { step: 3, title: "Copy Hash", description: "Copy the computed lowercase or uppercase hexadecimal digest." }
    ],
    faqs: [
      { question: "Which hash algorithm is safest for production?", answer: "SHA-256 and SHA-512 are modern industry standards recommended by NIST. MD5 and SHA-1 have known collision vulnerabilities and should only be used for legacy checksums." },
      { question: "Can a hash be converted back to the original text?", answer: "No. Cryptographic hash functions are one-way mathematical functions designed to be irreversible." }
    ],
    relatedConverters: ["parquet-to-json"],
    relatedTools: ["base64-encoder-decoder", "unix-timestamp-converter"]
  },

  "unix-timestamp-converter": {
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    category: "data-developer",
    title: "Unix & Linux Timestamp Converter (Epoch to Human Date) - 100% Private",
    subtitle: "Instant bidirectional conversion between Unix epoch timestamps (seconds & milliseconds) and human dates. Includes Linux bash commands & ISO 8601 formatting.",
    metaDescription: "Free online Unix & Linux timestamp converter. Convert epoch seconds and milliseconds to human-readable dates, relative time, and ISO 8601 strings in real-time.",
    answerSummary: "A Unix epoch timestamp measures seconds elapsed since January 1, 1970 00:00:00 UTC. In Linux terminal bash, convert epoch to date with 'date -d @1700000000' or macOS with 'date -r 1700000000'.",
    badge: "Real-Time",
    featured: false,
    keywords: ["linux timestamp converter", "unix timestamp converter", "epoch to date", "convert epoch linux command", "bash timestamp to date", "iso 8601 epoch", "current unix timestamp"],
    formulaDescription: "Epoch Seconds = (Local Date Time - Jan 1 1970 00:00:00 UTC) / 1000; ISO 8601 strings are formatted with full timezone offset support.",
    about: "Unix epoch time is the standard method for recording dates and events across operating systems, distributed databases, cloud APIs, and log aggregators. ConvertSheet's Unix Timestamp Converter provides a live ticking clock of the current epoch, bidirectional date-to-epoch parsing, and multi-timezone formatting.",
    howTo: [
      { step: 1, title: "Input Epoch or Date", description: "Enter a 10-digit timestamp (seconds), a 13-digit timestamp (milliseconds), or pick a calendar date." },
      { step: 2, title: "Inspect Conversions", description: "View synchronized GMT/UTC time, your local system time, and relative duration." },
      { step: 3, title: "Copy Timestamps", description: "Copy ISO 8601, RFC 2822, or numeric timestamps with a single click." }
    ],
    faqs: [
      { question: "How do I convert an epoch timestamp in Linux terminal / bash?", answer: "On GNU/Linux run 'date -d @1700000000' to format epoch seconds. On macOS / BSD terminal run 'date -r 1700000000'. In Python use 'datetime.fromtimestamp(ts)'." },
      { question: "What is the Year 2038 problem?", answer: "Systems storing Unix time as signed 32-bit integers will overflow on January 19, 2038 at 03:14:07 UTC. Modern 64-bit systems and JavaScript numbers will not overflow for billions of years." },
      { question: "How can I tell if a timestamp is in seconds or milliseconds?", answer: "10-digit timestamps (e.g. 1700000000) are in seconds; 13-digit timestamps (e.g. 1700000000000) are in milliseconds." }
    ],
    relatedConverters: ["csv-to-excel", "excel-to-csv"],
    relatedTools: ["date-difference-calculator", "age-calculator"]
  },

  "color-code-converter": {
    slug: "color-code-converter",
    name: "Color Code Converter (HEX, RGB, HSL)",
    category: "data-developer",
    title: "Color Code Converter - HEX, RGB, HSL & CMYK Online",
    subtitle: "Convert color formats between HEX, RGB, RGBA, and HSL with live visual swatch preview and CSS snippet generators.",
    metaDescription: "Free online color code converter. Transform colors between HEX, RGB, and HSL instantly with live color previews and one-click CSS copy.",
    answerSummary: "Convert hexadecimal web colors to RGB (Red, Green, Blue) and HSL (Hue, Saturation, Lightness) coordinate spaces with interactive previews.",
    badge: "Visual Palette",
    featured: false,
    keywords: ["color code converter", "hex to rgb", "rgb to hex", "hex to hsl", "css color converter", "color picker online"],
    formulaDescription: "HEX values are parsed to 8-bit integer channels (0-255). Hue is calculated via trigonometric projection, and Saturation/Lightness are derived from RGB extremes.",
    about: "Designers and frontend engineers frequently need to translate color values between design tools (Figma, Sketch) and CSS stylesheets. ConvertSheet's Color Code Converter provides seamless bidirectional conversion between HEX, RGB, and HSL spaces, complete with alpha transparency and interactive color adjustment.",
    howTo: [
      { step: 1, title: "Enter Color Code", description: "Type any valid HEX code (e.g. #10b981), RGB value (16, 185, 129), or HSL coordinate." },
      { step: 2, title: "View Conversions", description: "Inspect the synchronized values across all major color notations." },
      { step: 3, title: "Copy CSS", description: "Click to copy formatted CSS variables or standard style declarations." }
    ],
    faqs: [
      { question: "Why do web developers prefer HSL over RGB?", answer: "HSL is more intuitive for human designers because adjusting brightness (Lightness) or intensity (Saturation) does not change the core color tone (Hue)." },
      { question: "Does this support 8-digit HEX with alpha transparency?", answer: "Yes, 8-character HEX codes (e.g. #10b98180) are parsed to their respective RGBA alpha channels." }
    ],
    relatedConverters: ["json-to-excel"],
    relatedTools: ["base64-encoder-decoder", "json-formatter-validator"]
  },

  // ==========================================
  // CATEGORY B: FINANCIAL CALCULATORS (6)
  // ==========================================
  "sip-calculator": {
    slug: "sip-calculator",
    name: "SIP Calculator",
    category: "financial",
    title: "SIP Calculator Online - Mutual Fund Investment Returns",
    subtitle: "Calculate expected future returns on your monthly Systematic Investment Plan (SIP) investments with compound interest growth projections.",
    metaDescription: "Free online SIP calculator. Calculate the future maturity value of your monthly mutual fund investments, total invested amount, and wealth gained.",
    answerSummary: "A Systematic Investment Plan (SIP) calculator computes the future corpus of recurring monthly investments based on estimated annual return rates.",
    badge: "Popular",
    featured: true,
    keywords: ["sip calculator", "mutual fund calculator", "systematic investment plan", "sip returns calculator", "investment growth calculator"],
    formulaDescription: "M = P × ({[1 + i]^n - 1} / i) × (1 + i), where P is monthly investment, i is monthly return rate (r/12/100), and n is total months.",
    about: "A Systematic Investment Plan (SIP) is one of the most effective strategies for long-term wealth accumulation, enabling investors to benefit from rupee-cost averaging and compounding interest. ConvertSheet's SIP Calculator lets you project your portfolio's growth over 1 to 40 years, breaking down your total contributions versus your compounding capital gains.",
    howTo: [
      { step: 1, title: "Monthly Investment", description: "Enter the amount you plan to invest every month (e.g., ₹5,000 or $500)." },
      { step: 2, title: "Expected Return Rate", description: "Set your projected annual return percentage (typically 12% to 15% for equity funds)." },
      { step: 3, title: "Investment Horizon", description: "Specify how many years you intend to keep investing." }
    ],
    faqs: [
      { question: "What is the 15x15x15 rule in mutual funds?", answer: "Investing ₹15,000 per month for 15 years at an expected return of 15% historically accumulates approximately ₹1 Crore (₹10 Million)." },
      { question: "Are SIP returns guaranteed?", answer: "No, mutual fund investments are subject to market volatility. The calculator provides mathematical projections based on historical compound growth." }
    ],
    relatedConverters: ["csv-to-excel", "excel-to-csv"],
    relatedTools: ["compound-interest-calculator", "emi-calculator"]
  },

  "emi-calculator": {
    slug: "emi-calculator",
    name: "EMI Calculator",
    category: "financial",
    title: "EMI Calculator for Home, Car & Personal Loans",
    subtitle: "Calculate your monthly Equated Monthly Installment (EMI), total interest payable, and overall loan repayment schedule.",
    metaDescription: "Free online EMI calculator. Determine your exact monthly loan installment, total interest paid, and principal breakdown for home, car, and personal loans.",
    answerSummary: "An EMI (Equated Monthly Installment) is the fixed monthly payment made by a borrower to a lender to pay off both loan principal and accrued interest.",
    badge: "Financial Essential",
    featured: true,
    keywords: ["emi calculator", "loan calculator", "home loan emi", "car loan emi", "monthly installment calculator", "interest calculator"],
    formulaDescription: "EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1], where P is Principal, r is monthly interest rate, and n is tenure in months.",
    about: "Before committing to a home loan, vehicle purchase, or personal loan, calculating your monthly EMI is crucial for prudent financial budgeting. ConvertSheet's EMI Calculator gives you full clarity on your payment schedule, revealing how much of your hard-earned money goes toward principal reduction versus interest expenses.",
    howTo: [
      { step: 1, title: "Loan Amount", description: "Enter the total loan amount you are borrowing." },
      { step: 2, title: "Interest Rate", description: "Enter the annual interest rate quoted by the financial institution." },
      { step: 3, title: "Tenure", description: "Select the loan duration in either years or months." }
    ],
    faqs: [
      { question: "How does pre-paying principal affect my loan?", answer: "Making prepayments directly reduces your outstanding principal balance, drastically cutting down total interest paid and shortening loan duration." },
      { question: "What is the difference between fixed and reducing interest rates?", answer: "Fixed rates charge interest on the original loan amount throughout the term, while reducing balance rates recalculate interest only on the remaining unpaid principal." }
    ],
    relatedConverters: ["tally-xml-to-excel", "excel-to-csv"],
    relatedTools: ["sip-calculator", "compound-interest-calculator"]
  },

  "compound-interest-calculator": {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    category: "financial",
    title: "Compound Interest Calculator - Daily, Monthly & Annual",
    subtitle: "Forecast exponential savings growth with customizable compounding intervals (annual, quarterly, monthly, daily) and regular deposits.",
    metaDescription: "Free online compound interest calculator. Calculate exponential growth on investments and fixed deposits with customizable compounding frequencies.",
    answerSummary: "Compound interest is interest earned on both initial principal and previously accumulated interest, accelerating portfolio growth exponentially over time.",
    badge: "High Growth",
    featured: false,
    keywords: ["compound interest calculator", "compounding calculator", "investment growth", "fixed deposit interest", "interest formula calculator"],
    formulaDescription: "A = P × (1 + r/n)^(n×t), where P = Principal, r = annual interest rate, n = compounding periods per year, and t = time in years.",
    about: "Often referred to as the eighth wonder of the world, compound interest enables modest initial savings to grow into massive nest eggs over time. ConvertSheet's Compound Interest Calculator lets you explore the impact of different compounding frequencies—from annual and quarterly to monthly and continuous daily compounding.",
    howTo: [
      { step: 1, title: "Initial Principal", description: "Enter your starting balance or initial deposit amount." },
      { step: 2, title: "Annual Interest Rate", description: "Specify the expected annual yield or savings interest rate." },
      { step: 3, title: "Compounding Frequency", description: "Choose how frequently interest compounds (annually, semi-annually, quarterly, or monthly)." }
    ],
    faqs: [
      { question: "What is the Rule of 72?", answer: "Divide 72 by your annual interest rate to approximate how many years it will take to double your investment (e.g. at 8%, 72 / 8 = 9 years)." },
      { question: "Why does more frequent compounding yield more money?", answer: "More frequent compounding credits interest earlier, meaning subsequent interest calculations operate on a larger base." }
    ],
    relatedConverters: ["excel-to-json", "csv-to-excel"],
    relatedTools: ["sip-calculator", "emi-calculator"]
  },

  "gst-calculator": {
    slug: "gst-calculator",
    name: "GST Calculator",
    category: "financial",
    title: "GST Calculator Online - Exclusive & Inclusive Tax Slabs",
    subtitle: "Calculate Goods and Services Tax (GST) effortlessly. Add or remove tax with standard slabs (5%, 12%, 18%, 28%) or custom rates.",
    metaDescription: "Free online GST calculator. Calculate GST inclusive and exclusive amounts, CGST, and SGST breakdowns instantly for business invoices and receipts.",
    answerSummary: "Our GST Calculator computes both GST-inclusive and GST-exclusive amounts, giving exact splits for Central GST (CGST) and State GST (SGST).",
    badge: "Tax Ready",
    featured: true,
    keywords: ["gst calculator", "goods and services tax", "inclusive gst", "exclusive gst", "cgst sgst calculator", "tax calculator online"],
    formulaDescription: "Exclusive: GST = Base × Rate / 100; Inclusive: Base = Total / (1 + Rate / 100); Tax = Total - Base.",
    about: "Navigating Goods and Services Tax (GST) is an everyday necessity for accountants, freelance professionals, e-commerce sellers, and enterprise finance teams. ConvertSheet's GST Calculator simplifies tax compliance by providing instant breakdowns between buyer-paid totals, seller revenues, and CGST/SGST allocations.",
    howTo: [
      { step: 1, title: "Enter Amount", description: "Type the net base amount or the gross final price." },
      { step: 2, title: "Select Tax Slab", description: "Pick a standard rate (5%, 12%, 18%, 28%) or enter a custom percentage." },
      { step: 3, title: "Choose Mode", description: "Toggle between 'Add GST' (Exclusive) or 'Remove GST' (Inclusive)." }
    ],
    faqs: [
      { question: "How is GST split between CGST and SGST?", answer: "For intra-state transactions within the same state, GST is divided equally: 50% as Central GST (CGST) and 50% as State GST (SGST)." },
      { question: "When is IGST applied instead?", answer: "Integrated GST (IGST) is applied to inter-state sales and international imports where the central government collects the full tax." }
    ],
    relatedConverters: ["tally-xml-to-excel", "csv-to-excel"],
    relatedTools: ["percentage-calculator", "discount-calculator"]
  },

  "percentage-calculator": {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    category: "financial",
    title: "Percentage Calculator - 3-in-1 Online Math Tool",
    subtitle: "Solve all percentage math instantly: calculate percentage of a number, percentage increase/decrease, and what percent X is of Y.",
    metaDescription: "Free online percentage calculator. Calculate percentages, relative increases, decreases, and fractions instantly with step-by-step formulas.",
    answerSummary: "Calculate what percentage one number is of another, percentage growth or decline, and exact percentage values in a single utility.",
    badge: "Essential",
    featured: false,
    keywords: ["percentage calculator", "calculate percentage", "percentage increase", "percentage decrease", "percent of number", "math calculator"],
    formulaDescription: "Percent = (Part / Whole) × 100; Percent Change = ([New - Old] / Old) × 100; Value = (Percent / 100) × Whole.",
    about: "Percentages are fundamental to understanding financial reports, test scores, discount markups, and economic metrics. ConvertSheet's Multi-Mode Percentage Calculator combines the three most common percentage queries into a clean, lightning-fast dashboard.",
    howTo: [
      { step: 1, title: "Select Calculation Mode", description: "Choose whether you want 'X% of Y', 'X is what % of Y', or 'Percentage Increase/Decrease'." },
      { step: 2, title: "Enter Numbers", description: "Input your primary values into the designated fields." },
      { step: 3, title: "Instant Result", description: "View the computed percentage and formula breakdown in real-time." }
    ],
    faqs: [
      { question: "How do I calculate a percentage increase?", answer: "Subtract the original value from the new value, divide by the original value, and multiply by 100." },
      { question: "What does percentage point difference mean?", answer: "Percentage points measure the arithmetic difference between two percentages (e.g. going from 10% to 12% is a 2 percentage point increase, but a 20% relative increase)." }
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["gst-calculator", "discount-calculator"]
  },

  "discount-calculator": {
    slug: "discount-calculator",
    name: "Discount & Sale Price Calculator",
    category: "financial",
    title: "Discount Calculator - Sale Price & Total Savings",
    subtitle: "Calculate final sale prices, dollar savings, and stacked coupon discounts during shopping sales and wholesale purchases.",
    metaDescription: "Free online discount calculator. Find your final sale price, total savings, and calculate stacked multi-tiered discounts in seconds.",
    answerSummary: "A discount calculator determines your net price after applying percentage markdowns or flat cash discounts to an original retail price.",
    badge: "Shopping",
    featured: false,
    keywords: ["discount calculator", "sale price calculator", "coupon calculator", "savings calculator", "calculate discount", "retail discount"],
    formulaDescription: "Savings = Original Price × (Discount % / 100); Final Price = Original Price - Savings.",
    about: "Whether you are shopping during Black Friday, evaluating vendor trade quotes, or pricing inventory for an e-commerce storefront, knowing your exact bottom-line savings is essential. ConvertSheet's Discount Calculator handles single discounts, additional coupon codes, and sales tax adjustments.",
    howTo: [
      { step: 1, title: "Original Price", description: "Enter the retail sticker price of the product or service." },
      { step: 2, title: "Discount Rate", description: "Enter the promotional discount percentage (e.g., 25% off)." },
      { step: 3, title: "View Final Cost", description: "Immediately see your final payable price and total money saved." }
    ],
    faqs: [
      { question: "How do stacked discounts work?", answer: "Stacked discounts apply sequentially. If an item is 20% off and you have an extra 10% coupon, the 10% is deducted from the discounted price, not the original." },
      { question: "Is a 50% discount the same as Buy One Get One Free?", answer: "Yes, mathematically BOGO Free is equivalent to a 50% discount per item when purchasing two units." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["gst-calculator", "percentage-calculator"]
  },

  // ==========================================
  // CATEGORY C: GENERAL UTILITY CALCULATORS (6)
  // ==========================================
  "age-calculator": {
    slug: "age-calculator",
    name: "Chronological Age Calculator",
    category: "utility",
    title: "Age Calculator - Exact Age in Years, Months, Days & Hours",
    subtitle: "Calculate your exact chronological age from your date of birth down to the minute, with upcoming birthday countdowns and milestones.",
    metaDescription: "Free online age calculator. Find your exact age in years, months, weeks, days, hours, and minutes with upcoming birthday countdowns.",
    answerSummary: "Our Age Calculator computes exact chronological age by factoring in leap years, variable calendar month lengths, and timezones.",
    featured: false,
    keywords: ["age calculator", "calculate age", "how old am i", "chronological age", "birthday countdown", "date of birth calculator"],
    formulaDescription: "Years = Current Year - Birth Year; Months and Days are adjusted against calendar month days factoring in Gregorian leap years.",
    about: "Knowing your precise age in years, months, and days is often needed for legal paperwork, civil exam applications, passport processing, and insurance policies. ConvertSheet's Age Calculator provides an exact breakdown of your life duration across various units of time.",
    howTo: [
      { step: 1, title: "Select Date of Birth", description: "Pick your birth day, month, and year from the calendar picker." },
      { step: 2, title: "Target Date", description: "Default is today, or select any future/past date to determine age at that specific time." },
      { step: 3, title: "Explore Milestones", description: "View your total days lived, days until next birthday, and upcoming half-decade milestones." }
    ],
    faqs: [
      { question: "How does the calculator handle February 29 leap birthdays?", answer: "In non-leap years, individuals born on February 29 celebrate their legal age milestone on March 1." },
      { question: "Can I calculate my age at a future date?", answer: "Yes! Simply adjust the 'Age at Date' field to see exactly how old you will be for upcoming events or retirements." }
    ],
    relatedConverters: ["excel-to-json"],
    relatedTools: ["date-difference-calculator", "unix-timestamp-converter"]
  },

  "date-difference-calculator": {
    slug: "date-difference-calculator",
    name: "Date Difference & Duration Calculator",
    category: "utility",
    title: "Days Between Two Dates Calculator — Exact Days, Weeks & Business Days",
    subtitle: "Calculate the exact number of days, weeks, months, and working business days between any two calendar dates.",
    metaDescription: "Calculate exact days between two dates. Counts total calendar days, working business days, weekends, weeks, and months with leap year precision. 100% free.",
    answerSummary: "Calculate the exact duration between any two dates, with options to include or exclude weekends and determine business days.",
    badge: "Productivity",
    featured: false,
    keywords: ["date difference calculator", "days between dates", "duration calculator", "business days calculator", "calendar days counter"],
    formulaDescription: "Total Days = Math.round(Math.abs(Date2 - Date1) / (1000 × 60 × 60 × 24)); Business days iterate through weekdays (Mon-Fri).",
    about: "Project managers, contract lawyers, and HR specialists often need to calculate delivery timeframes, contract durations, or notice periods. ConvertSheet's Date Difference Calculator handles both standard calendar spans and working day exclusions.",
    howTo: [
      { step: 1, title: "Start Date", description: "Select the beginning date of your event or timeline." },
      { step: 2, title: "End Date", description: "Select the conclusion date." },
      { step: 3, title: "View Duration", description: "Inspect calendar days, business days, and week breakdowns." }
    ],
    faqs: [
      { question: "Are public bank holidays excluded automatically?", answer: "Our business day calculator filters out Saturday and Sunday weekends. Because regional holidays differ globally, custom holiday offsets can be adjusted." },
      { question: "Is the end date included in the total day count?", answer: "You can toggle whether the final date is inclusive (+1 day) or exclusive based on your contractual terms." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["age-calculator", "unix-timestamp-converter"]
  },

  "bmi-calculator": {
    slug: "bmi-calculator",
    name: "BMI Calculator (Body Mass Index)",
    category: "utility",
    title: "BMI Calculator — Body Mass Index for Men & Women (Metric & Imperial)",
    subtitle: "Calculate your Body Mass Index (BMI) using metric (kg/cm) or imperial (lbs/feet) measurements with WHO classification charts.",
    metaDescription: "Free online BMI calculator. Calculate your Body Mass Index (BMI), WHO health classification, and healthy target weight range with metric or imperial units.",
    answerSummary: "Body Mass Index (BMI) is a screening metric that compares weight to height to classify individuals into underweight, normal, overweight, or obese ranges.",
    featured: false,
    keywords: ["bmi calculator", "body mass index", "ideal weight calculator", "who bmi chart", "metric bmi", "imperial bmi"],
    formulaDescription: "Metric: BMI = weight (kg) / [height (m)]²; Imperial: BMI = 703 × weight (lbs) / [height (inches)]².",
    about: "Body Mass Index (BMI) is an internationally recognized screening metric established by the World Health Organization (WHO) to categorize body mass. ConvertSheet's BMI Calculator supports both metric and imperial units, giving you your exact index score and healthy weight targets.",
    howTo: [
      { step: 1, title: "Select Measurement System", description: "Toggle between Metric (kilograms & centimeters) or Imperial (pounds & feet/inches)." },
      { step: 2, title: "Input Height & Weight", description: "Enter your current body measurements into the fields." },
      { step: 3, title: "Review Category", description: "View your score on the color-coded WHO weight spectrum." }
    ],
    faqs: [
      { question: "What are the standard WHO BMI categories?", answer: "Underweight: < 18.5; Normal weight: 18.5 – 24.9; Overweight: 25.0 – 29.9; Obese: 30.0 and above." },
      { question: "Does BMI distinguish between muscle and fat?", answer: "No. BMI is a general population screening tool. Highly athletic individuals with high muscle mass may register higher BMI scores despite low body fat." }
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["unit-converter", "percentage-calculator"]
  },

  "unit-converter": {
    slug: "unit-converter",
    name: "Universal Unit Converter",
    category: "utility",
    title: "Unit Converter Online - Length, Weight, Temperature & More",
    subtitle: "Instantly convert between metric and imperial units across length, mass, temperature, area, volume, speed, and time.",
    metaDescription: "Free online unit converter. Convert length, weight, temperature, speed, area, and volume between metric and imperial standards with precision.",
    answerSummary: "Our Universal Unit Converter standardizes conversions across length, weight, temperature, speed, area, and volume with high-precision decimal math.",
    badge: "Universal",
    featured: true,
    keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "metric to imperial", "measurement converter"],
    formulaDescription: "Values are normalized to SI base units (meters, grams, Kelvin) using standardized physical constants, then converted to target units.",
    about: "Converting measurements between global standards is crucial for international logistics, engineering projects, scientific labs, and everyday cooking. ConvertSheet's Unit Converter offers immediate two-way conversions across all major physical dimensions with zero rounding errors.",
    howTo: [
      { step: 1, title: "Select Dimension", description: "Choose Length, Weight/Mass, Temperature, Area, Volume, or Speed." },
      { step: 2, title: "Choose Units", description: "Select your source unit (e.g. Kilometers) and destination unit (e.g. Miles)." },
      { step: 3, title: "Type Value", description: "Type any number to see the converted output instantly." }
    ],
    faqs: [
      { question: "How is Celsius converted to Fahrenheit?", answer: "Multiply Celsius by 9/5 (or 1.8) and add 32: °F = (°C × 1.8) + 32." },
      { question: "How many feet are in a meter?", answer: "1 meter is equal to approximately 3.28084 feet." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["byte-converter", "bmi-calculator"]
  },

  "tip-calculator": {
    slug: "tip-calculator",
    name: "Tip & Bill Splitter Calculator",
    category: "utility",
    title: "Tip Calculator & Bill Splitter - Fair Group Sharing",
    subtitle: "Calculate restaurant tips, service charges, and split bill totals evenly among friends or colleagues with custom tip percentages.",
    metaDescription: "Free online tip calculator. Calculate restaurant tip percentages, service fees, and split the final bill evenly between any number of people.",
    answerSummary: "A tip calculator computes customary gratuity amounts on dining bills and divides the total evenly among party members.",
    badge: "Dining",
    featured: false,
    keywords: ["tip calculator", "bill splitter", "restaurant tip", "gratuity calculator", "split bill", "calculate tip"],
    formulaDescription: "Tip Amount = Bill × (Tip % / 100); Total Bill = Bill + Tip; Per Person = Total Bill / Number of People.",
    about: "Tipping customs vary globally, but calculating fair gratuity and splitting group dining checks should never require mental math headaches. ConvertSheet's Tip Calculator lets you adjust tip percentages with quick preset buttons (10%, 15%, 18%, 20%) and evenly split bills among any number of guests.",
    howTo: [
      { step: 1, title: "Bill Total", description: "Enter the pre-tip or post-tax check total from the restaurant." },
      { step: 2, title: "Tip Percentage", description: "Click a standard percentage button or type a custom amount." },
      { step: 3, title: "Split Count", description: "Enter how many people are contributing to see each person's exact share." }
    ],
    faqs: [
      { question: "Is tip calculated before or after sales tax?", answer: "Traditionally in the United States and Canada, tips are calculated on the pre-tax food and beverage total, though many calculate on the final total for convenience." },
      { question: "What is standard restaurant tipping etiquette in the US?", answer: "15% for acceptable service, 18% to 20% for good service, and 22%+ for exceptional dining service." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["percentage-calculator", "discount-calculator"]
  },

  "byte-converter": {
    slug: "byte-converter",
    name: "Data Size & Byte Converter",
    category: "utility",
    title: "Byte Converter Online — Bytes to KB, MB, GB, TB (Binary & Decimal)",
    subtitle: "Convert digital storage units between Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, and Petabytes using Binary or Decimal standards.",
    metaDescription: "Free online byte converter. Calculate exact conversions between Bytes, KB, MB, GB, TB, and PB using binary (1024) or decimal (1000) standards in seconds.",
    answerSummary: "Convert digital file sizes and network bandwidth capacities across Bytes, KB, MB, GB, TB, and PB with both Binary (1024) and Decimal (1000) standards.",
    badge: "Storage Engine",
    featured: true,
    keywords: ["byte converter", "data size converter", "mb to gb", "gb to tb", "kb to mb", "binary vs decimal storage"],
    formulaDescription: "Binary (JEDEC/IEC): 1 KiB = 1024 Bytes; Decimal (SI): 1 KB = 1000 Bytes.",
    about: "Understanding data storage metrics is essential for database architects, cloud engineers, content creators, and backup administrators. Hard drive manufacturers quote storage using metric decimals (1000 bytes = 1 KB), while operating systems like Windows calculate capacity using binary (1024 bytes = 1 KiB). This tool bridges both worlds seamlessly.",
    howTo: [
      { step: 1, title: "Enter File Size", description: "Type the numeric size of your file, database, or disk." },
      { step: 2, title: "Select Source Unit", description: "Choose whether your value is in Bytes, KB, MB, GB, TB, or PB." },
      { step: 3, title: "Inspect Table", description: "Instantly view the equivalent size across all storage units and both binary/decimal bases." }
    ],
    faqs: [
      { question: "Why does my 1TB hard drive show as only 931 GB in Windows?", answer: "Drive manufacturers advertise 1TB as 1,000,000,000,000 bytes (decimal base 1000). Operating systems interpret 1 GiB as 1,073,741,824 bytes (binary base 1024), resulting in ~931.3 GiB." },
      { question: "What is the difference between Megabit (Mb) and Megabyte (MB)?", answer: "1 Byte = 8 bits. Internet connection speeds are typically quoted in Megabits per second (Mbps), meaning an 80 Mbps connection downloads at 10 Megabytes per second (MB/s)." }
    ],
    relatedConverters: ["parquet-to-excel", "csv-to-parquet"],
    relatedTools: ["base64-encoder-decoder", "unit-converter"]
  },

  ...PHASE2_TOOLS,
  ...IMAGE_TOOLS,
  ...PDF_TOOLS,
  ...FINANCIAL_CROWN_TOOLS,
  ...WORKBENCH_TOOLS
} as const satisfies Record<string, ToolConfig>;

export type ToolSlug = keyof typeof TOOL_REGISTRY;

export function getAllToolSlugs(): string[] {
  return Object.keys(TOOL_REGISTRY);
}

export function getAllTools(): ToolConfig[] {
  return Object.values(TOOL_REGISTRY) as ToolConfig[];
}

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return (TOOL_REGISTRY as Record<string, ToolConfig>)[slug];
}

export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
  return getAllTools().filter((tool) => tool.category === category);
}
