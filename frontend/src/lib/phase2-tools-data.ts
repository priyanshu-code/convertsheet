import { ToolConfig } from "@/types/tool";

export const PHASE2_TOOLS: Record<string, ToolConfig> = {
  "salary-calculator": {
    slug: "salary-calculator",
    name: "Salary & Take-Home Paycheck Calculator",
    category: "financial",
    title: "Salary & Take-Home Pay Calculator (US & India) - Net In-Hand Salary",
    subtitle: "Calculate net monthly take-home pay after taxes, retirement (401k / EPF), and deductions for US (Federal/FICA) and India (FY 2024-25).",
    metaDescription: "Free online salary calculator. Calculate take-home pay after FICA, federal, 401(k), state taxes (US) and CTC, EPF, professional tax, and new regime income tax (India).",
    answerSummary: "Take-home pay equals Gross Salary minus deductions including Employee Provident Fund (EPF), Professional Tax, and Income Tax TDS.",
    badge: "Career Essential",
    featured: true,
    keywords: ["salary calculator", "take home pay calculator", "us salary calculator", "india salary calculator", "in hand salary", "net pay calculator", "paycheck calculator"],
    formulaDescription: "Net Monthly Salary = (Gross Annual CTC - PF Contribution - Professional Tax - Estimated Income Tax) / 12.",
    about: "Understanding the difference between Cost to Company (CTC) and actual in-hand take-home pay is vital when evaluating job offers, annual increments, and monthly budgets. ConvertSheet's Salary Calculator breaks down standard corporate deductions including statutory EPF (12% of basic), standard deductions, and tax withholding.",
    howTo: [
      { step: 1, title: "Enter Gross Annual CTC", description: "Input your total annual CTC or cost to company quoted in your compensation letter." },
      { step: 2, title: "Configure Deductions", description: "Adjust standard deductions such as EPF contribution and professional tax." },
      { step: 3, title: "View Monthly In-Hand", description: "Inspect your exact monthly net payout and annual deductions summary." }
    ],
    faqs: [
      { question: "Why is in-hand salary significantly lower than CTC?", answer: "CTC includes employer contributions to provident fund, gratuity, health insurance premiums, and performance bonuses that are not paid out monthly." },
      { question: "Is EPF deduction mandatory?", answer: "EPF is mandatory for employees with basic wages up to ₹15,000 per month in eligible organizations, and optional/standard above that threshold." }
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["income-tax-calculator", "sip-calculator"]
  },

  "income-tax-calculator": {
    slug: "income-tax-calculator",
    name: "Income Tax Slab Calculator",
    category: "financial",
    title: "Income Tax Calculator (US Federal & India Slabs) - Instant Tax Bracket Breakdown",
    subtitle: "Calculate your exact income tax liability across progressive US Federal brackets (Single / Married) and Indian Income Tax slabs (New Regime FY 2024-25).",
    metaDescription: "Free online income tax calculator. Compare federal tax brackets, standard deductions, and progressive slabs for US and India with 100% privacy.",
    answerSummary: "Our Income Tax Calculator applies progressive slab rates to taxable income, computing total tax payable including standard cess.",
    badge: "Tax Ready",
    featured: true,
    keywords: ["income tax calculator", "federal tax calculator", "us tax calculator", "india tax calculator", "tax slab calculator", "effective tax rate"],
    formulaDescription: "Taxable Income = Gross Income - Standard Deduction. Tax is computed across incremental brackets + 4% Health & Education Cess.",
    about: "Filing taxes requires clear visibility into how progressive brackets apply to your earnings. ConvertSheet's Income Tax Calculator computes tax slab-by-slab, showing your effective tax rate and post-tax retained earnings.",
    howTo: [
      { step: 1, title: "Annual Income", description: "Enter your gross total annual earnings from salary, freelance, or business." },
      { step: 2, title: "Standard Deductions", description: "Apply statutory standard deductions (e.g. ₹75,000 standard deduction)." },
      { step: 3, title: "Review Bracket Breakdown", description: "See the exact tax owed per progressive bracket and overall effective rate." }
    ],
    faqs: [
      { question: "What is an effective tax rate?", answer: "Your effective tax rate is total tax paid divided by total income, which is always lower than your highest marginal tax slab bracket." },
      { question: "How does progressive taxation work?", answer: "Each tax percentage only applies to the portion of income falling within that specific bracket, not your entire income." }
    ],
    relatedConverters: ["tally-xml-to-excel"],
    relatedTools: ["salary-calculator", "gst-calculator"]
  },

  "jwt-decoder": {
    slug: "jwt-decoder",
    name: "JWT Token Inspector & Decoder",
    category: "data-developer",
    title: "JWT Decoder Online - JSON Web Token Inspector & Debugger",
    subtitle: "Decode and inspect JSON Web Tokens (JWT) headers, claims, issued timestamps, and expiration status with 100% client-side privacy.",
    metaDescription: "Free online JWT decoder. Safely decode and inspect JSON Web Token (JWT) header and payload claims in your browser with zero token transmission.",
    answerSummary: "JSON Web Tokens (JWT) consist of three Base64URL-encoded segments (Header, Payload, Signature) separated by dots.",
    badge: "Auth & Security",
    featured: true,
    keywords: ["jwt decoder", "json web token debugger", "decode jwt online", "jwt payload inspector", "jwt token expiry checker"],
    formulaDescription: "Token is split by '.' delimiter; Header and Payload segments are decoded from RFC 7519 Base64URL to JSON strings.",
    about: "Developers and security engineers inspect JWT tokens daily to verify claims, user roles, audience tags, and expiration timestamps. ConvertSheet's JWT Decoder runs entirely in browser memory, ensuring your confidential Bearer tokens, private claims, and API keys are never exposed over network requests.",
    howTo: [
      { step: 1, title: "Paste Token", description: "Paste any standard 3-part JWT token (eyJhbGciOi...)." },
      { step: 2, title: "Inspect Payload", description: "View formatted JSON for the token header and payload claims." },
      { step: 3, title: "Check Expiry", description: "Review human-readable issued-at (iat) and expiration (exp) status." }
    ],
    faqs: [
      { question: "Is it safe to paste production JWTs here?", answer: "Yes! Unlike other token debuggers, ConvertSheet executes 100% in your local web browser with zero server uploads or logging." },
      { question: "Can this verify cryptographic signatures?", answer: "This tool decodes and validates token format and claims. Full cryptographic signature verification requires a shared secret or public key." }
    ],
    relatedConverters: ["json-to-excel"],
    relatedTools: ["base64-encoder-decoder", "hash-generator"]
  },

  "uuid-generator": {
    slug: "uuid-generator",
    name: "UUID / GUID v4 Batch Generator",
    category: "data-developer",
    title: "UUID Generator Online - Random UUID v4 & GUID Batch Tool",
    subtitle: "Generate cryptographically secure random Universally Unique Identifiers (UUID v4 / GUID) individually or in bulk with custom formats.",
    metaDescription: "Free online UUID / GUID v4 generator. Generate cryptographically secure random UUIDs in bulk with uppercase, lowercase, and hyphen toggles.",
    answerSummary: "UUID Version 4 uses 122 bits of cryptographically random entropy to generate globally unique 128-bit identifiers.",
    badge: "RFC 4122",
    featured: false,
    keywords: ["uuid generator", "guid generator", "uuid v4 online", "bulk uuid generator", "generate random uuid", "rfc 4122 uuid"],
    formulaDescription: "16 random bytes from crypto.getRandomValues; bits set to version 4 (0100) and variant RFC 4122 (10xx).",
    about: "UUIDs (Universally Unique Identifiers) provide reliable primary keys for distributed databases, microservices, session cookies, and event buses without central synchronization. ConvertSheet uses the hardware-accelerated W3C Web Crypto API to generate bulk UUIDs instantly.",
    howTo: [
      { step: 1, title: "Select Quantity", description: "Choose how many UUIDs to generate (from 1 to 500)." },
      { step: 2, title: "Configure Format", description: "Toggle uppercase, lowercase, or stripped hyphens." },
      { step: 3, title: "Copy or Download", description: "Copy all generated UUIDs or download them as a clean text file." }
    ],
    faqs: [
      { question: "What is the probability of a UUID v4 collision?", answer: "Effectively zero. Generating 1 billion UUIDs per second for 100 years yields an infinitesimal probability of a collision." },
      { question: "Are these UUIDs cryptographically secure?", answer: "Yes. They are generated using the browser's crypto.getRandomValues API, backed by operating system CSPRNGs." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["hash-generator", "base64-encoder-decoder"]
  },

  "margin-calculator": {
    slug: "margin-calculator",
    name: "Profit Margin & Markup Calculator",
    category: "financial",
    title: "Profit Margin & Markup Calculator - Gross Profit & Revenue",
    subtitle: "Calculate gross profit margin percentage, markup percentage, cost of goods, and selling price for retail and wholesale business.",
    metaDescription: "Free online profit margin and markup calculator. Calculate gross profit, profit margin percentage, and markup from cost and revenue.",
    answerSummary: "Gross profit margin measures profit relative to selling price, while markup measures profit relative to wholesale cost.",
    badge: "E-Commerce",
    featured: false,
    keywords: ["margin calculator", "markup calculator", "profit margin", "gross margin calculator", "cost and selling price", "retail markup"],
    formulaDescription: "Gross Profit = Revenue - Cost; Margin % = (Profit / Revenue) × 100; Markup % = (Profit / Cost) × 100.",
    about: "Setting correct retail prices requires understanding the mathematical difference between profit margin and markup. ConvertSheet's Margin & Markup Calculator gives e-commerce merchants, agency owners, and product managers instant clarity on bottom-line profits.",
    howTo: [
      { step: 1, title: "Enter Cost & Revenue", description: "Input wholesale cost and target selling price, or cost and desired margin." },
      { step: 2, title: "Compare Metrics", description: "Inspect gross profit dollar amount alongside both Margin % and Markup %." },
      { step: 3, title: "Fine-tune Pricing", description: "Adjust selling prices to meet your target business profitability." }
    ],
    faqs: [
      { question: "What is the difference between margin and markup?", answer: "A 50% markup on a $100 cost gives a $150 price with $50 profit. That $50 profit divided by the $150 price is a 33.3% margin." },
      { question: "Can profit margin ever exceed 100%?", answer: "No, margin cannot exceed 100% because profit cannot be greater than total revenue, whereas markup can exceed 100% indefinitely." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["percentage-calculator", "discount-calculator"]
  },

  "roi-calculator": {
    slug: "roi-calculator",
    name: "Return on Investment (ROI) Calculator",
    category: "financial",
    title: "ROI Calculator - Return on Investment & Annualized Returns",
    subtitle: "Calculate simple and annualized Return on Investment (ROI) percentage and total capital gains across business ventures and stocks.",
    metaDescription: "Free online ROI calculator. Calculate return on investment percentage, total net profit, and annualized ROI over any time horizon.",
    answerSummary: "Return on Investment (ROI) measures profitability by dividing net profit by initial invested capital.",
    badge: "Business & Stocks",
    featured: false,
    keywords: ["roi calculator", "return on investment", "calculate roi", "annualized roi", "investment return", "capital gains calculator"],
    formulaDescription: "Simple ROI % = [(Final Value - Cost) / Cost] × 100; Annualized ROI = [(1 + ROI)^(1/years) - 1] × 100.",
    about: "Evaluating capital allocation decisions across marketing campaigns, commercial real estate, corporate equipment, or equity portfolios requires a standardized ROI metric. ConvertSheet's ROI Calculator computes both total percentage return and compound annualized yield.",
    howTo: [
      { step: 1, title: "Investment Amount", description: "Enter the initial capital or acquisition cost." },
      { step: 2, title: "Final Return Value", description: "Enter the final payout or current liquidation valuation." },
      { step: 3, title: "Time Horizon", description: "Input the holding period in years to compute annualized compound growth." }
    ],
    faqs: [
      { question: "Why is annualized ROI more useful than simple ROI?", answer: "A 50% return over 1 year is extraordinary, whereas a 50% return over 10 years represents a modest ~4.1% annual return." },
      { question: "Does this account for ongoing maintenance expenses?", answer: "You can factor recurring expenses into the total initial cost or subtract them from final return value." }
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["sip-calculator", "compound-interest-calculator"]
  }
};
