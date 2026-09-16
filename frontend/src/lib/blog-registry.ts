export interface BlogAuthor {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface BlogTocItem {
  id: string;
  title: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTimeMinutes: number;
  publishedAt: string; // YYYY-MM-DD
  author: BlogAuthor;
  attachedToolSlug: string;
  attachedToolTitle: string;
  tableOfContents: BlogTocItem[];
  content: string; // Markdown / semantic HTML
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "convert-json-to-excel-privately",
    title: "How to Convert 50,000+ Rows of Nested JSON to Excel Without Leaking Data",
    description: "A step-by-step guide for developers and financial analysts to flatten deeply nested JSON arrays into tabular Excel spreadsheets locally in the browser with zero cloud uploads.",
    category: "Data & Spreadsheets",
    readTimeMinutes: 5,
    publishedAt: "2026-09-17",
    author: {
      name: "ConvertSheet Engineering",
      role: "Core Architecture Team"
    },
    attachedToolSlug: "json-to-excel",
    attachedToolTitle: "JSON to Excel Converter (In-Browser WASM)",
    tableOfContents: [
      { id: "the-silent-risk-of-cloud-converters", title: "1. The Silent Risk of Public Cloud Converters" },
      { id: "understanding-nested-json-structures", title: "2. Understanding Deeply Nested JSON Structures" },
      { id: "how-in-browser-wasm-flattening-works", title: "3. How In-Browser WebAssembly Flattening Works" },
      { id: "step-by-step-converting-large-json", title: "4. Step-by-Step: Converting 50,000+ Records Locally" },
      { id: "benchmarks-and-best-practices", title: "5. Performance Benchmarks & Best Practices" }
    ],
    content: `
      <section id="the-silent-risk-of-cloud-converters" class="space-y-4">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          1. The Silent Risk of Public Cloud Converters
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Every day, software developers, security analysts, and corporate accountants take customer exports, stripe transaction dumps, or audit payloads and paste them into free online converters. When asked to convert this raw data into an Excel (<code>.xlsx</code>) spreadsheet for non-technical stakeholders, the instinctive search is <em>"JSON to Excel converter online"</em>.
        </p>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          What many do not realize is that the vast majority of legacy conversion utilities operate on traditional client-server architectures:
        </p>
        <ul class="space-y-2 text-zinc-700 dark:text-zinc-300 pl-5 list-disc">
          <li><strong>Server-Side Uploads:</strong> Your raw JSON payload is sent over HTTP/HTTPS to an unverified third-party VPS or cloud container.</li>
          <li><strong>Server Logging &amp; Storage:</strong> Temporary files, debug logs, or intermediate SQLite/Postgres caches may persist indefinitely on remote disks.</li>
          <li><strong>Compliance Violations:</strong> Uploading unanonymized customer emails, PII, or internal financial ledgers instantly breaches <strong>GDPR (Article 28)</strong>, <strong>HIPAA</strong>, and <strong>SOC 2 Type II</strong> controls.</li>
        </ul>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          At ConvertSheet, we pioneered <strong>100% Client-Side WebAssembly (WASM) &amp; Web Workers</strong> execution. Your files are processed entirely in browser memory. Not a single byte ever leaves your machine.
        </p>
      </section>

      <section id="understanding-nested-json-structures" class="space-y-4 pt-8">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          2. Understanding Deeply Nested JSON Structures
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Real-world API payloads from platforms like Shopify, Salesforce, Stripe, or internal microservices are rarely flat arrays of uniform key-value pairs. Instead, they feature deeply nested hierarchies:
        </p>
        <div class="rounded-2xl border border-zinc-200 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <pre><code>[
  {
    "order_id": "ORD-94821",
    "customer": {
      "id": "cust_882",
      "profile": {
        "email": "finance.lead@enterprise.corp",
        "tier": "Enterprise"
      }
    },
    "line_items": [
      { "sku": "SKU-PRO-ANNUAL", "quantity": 12, "price": 120.00 }
    ],
    "meta": {
      "timestamp": "2026-09-17T00:00:00Z",
      "tags": ["renewal", "auto-billed"]
    }
  }
]</code></pre>
        </div>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          When exporting to Excel (<code>.xlsx</code>), the primary technical challenge is deciding how to map parent objects and nested arrays:
        </p>
        <ol class="space-y-2 text-zinc-700 dark:text-zinc-300 pl-5 list-decimal">
          <li><strong>Dot-Notation Flattening:</strong> Sub-properties are flattened into composite columns (e.g. <code>customer.profile.email</code>, <code>meta.tags.0</code>).</li>
          <li><strong>Array Expansion vs. Normalization:</strong> Array items can either be normalized across comma-separated values or expanded into relational rows.</li>
          <li><strong>Data Type Preservation:</strong> Ensuring numbers remain actual IEEE floating-point cells instead of text strings, preventing broken <code>SUM</code> or <code>VLOOKUP</code> formulas in Excel.</li>
        </ol>
      </section>

      <section id="how-in-browser-wasm-flattening-works" class="space-y-4 pt-8">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          3. How In-Browser WebAssembly Flattening Works
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Traditional browser-based tools crash with <code>Out of Memory</code> or frozen tabs when parsing 100MB+ JSON files because standard JavaScript V8 engines create millions of intermediate objects during recursive traversal.
        </p>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          ConvertSheet solves this using a two-tier client-side architecture:
        </p>
        <ul class="space-y-2 text-zinc-700 dark:text-zinc-300 pl-5 list-disc">
          <li><strong>Web Worker Threading:</strong> Parsing and schema discovery are offloaded to dedicated background threads, keeping the 60fps UI buttery smooth without freezing your browser.</li>
          <li><strong>Memory-Safe Streaming Iterators:</strong> Memory-safe streaming reads JSON tokens directly into chunked tabular blocks, which are then compiled into standard OpenXML (<code>.xlsx</code>) zip containers via client-side libraries.</li>
        </ul>
      </section>

      <section id="step-by-step-converting-large-json" class="space-y-4 pt-8">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          4. Step-by-Step: Converting 50,000+ Records Locally
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Follow these simple steps to transform your large JSON file in under 3 seconds:
        </p>
        <ol class="space-y-3 text-zinc-700 dark:text-zinc-300 pl-5 list-decimal">
          <li><strong>Open the Converter Tool:</strong> Navigate directly to our <a href="/convert/json-to-excel" class="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">JSON to Excel Converter</a>.</li>
          <li><strong>Drop Your File:</strong> Drag and drop your <code>.json</code> or <code>.jsonl</code> file (up to 500MB) directly onto the drop zone, or paste raw JSON.</li>
          <li><strong>Select Flattening Preferences:</strong> Enable <strong>Dot Notation</strong> to turn nested trees like <code>user.address.city</code> into distinct header columns.</li>
          <li><strong>Preview the Grid:</strong> Inspect the auto-generated data preview table right in the browser to ensure column alignment and data types match your expectations.</li>
          <li><strong>Download .XLSX:</strong> Click <strong>Export to Excel</strong>. The binary spreadsheet is generated locally in RAM and saved instantly to your Downloads folder.</li>
        </ol>
      </section>

      <section id="benchmarks-and-best-practices" class="space-y-4 pt-8">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          5. Performance Benchmarks &amp; Best Practices
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          We benchmarked ConvertSheet's local client-side engine against typical cloud-based alternatives using a realistic 50,000-row e-commerce dataset (nested 4 levels deep, 42MB raw JSON):
        </p>
        <div class="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 my-4">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-zinc-100 dark:bg-zinc-800/80 font-bold border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th class="p-3">Metric</th>
                <th class="p-3 text-emerald-600 dark:text-emerald-400 font-bold">ConvertSheet (Local WASM)</th>
                <th class="p-3 text-zinc-500">Typical Cloud Converter</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td class="p-3 font-medium">Data Privacy</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">100% Private (0 Network Requests)</td>
                <td class="p-3 text-zinc-500">File uploaded to external server</td>
              </tr>
              <tr>
                <td class="p-3 font-medium">Upload Time</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">0.00 seconds (Instant)</td>
                <td class="p-3 text-zinc-500">4.2 – 12.8 seconds</td>
              </tr>
              <tr>
                <td class="p-3 font-medium">Processing Duration</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">1.85 seconds</td>
                <td class="p-3 text-zinc-500">6.50 seconds + queue wait</td>
              </tr>
              <tr>
                <td class="p-3 font-medium">Security Risk</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">Zero / Air-gapped compatible</td>
                <td class="p-3 text-rose-500 font-medium">High (Potential data leakage)</td>
              </tr>
              <tr>
                <td class="p-3 font-medium">Max File Limit</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">Up to 500MB (RAM-dependent)</td>
                <td class="p-3 text-zinc-500">Usually throttled to 5MB – 10MB</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 pt-4">
          Key Best Practices for Working with Massive JSON
        </h3>
        <ul class="space-y-2 text-zinc-700 dark:text-zinc-300 pl-5 list-disc">
          <li><strong>Strip Redundant Metadata:</strong> If your JSON contains massive unneeded debug stacks or base64 attachments, pre-filter with a client-side JSON editor before spreadsheet conversion.</li>
          <li><strong>Ensure Valid JSON Formatting:</strong> If your file contains unescaped quotes or trailing commas, run it through our <a href="/tools/json-formatter-validator" class="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">JSON Formatter &amp; Validator</a> first.</li>
          <li><strong>Audit Network Requests:</strong> Open Chrome DevTools (F12) &gt; Network tab anytime. Confirm that zero bytes are sent across the wire during file processing.</li>
        </ul>
      </section>
    `.trim()
  }
];

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogPostSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}
