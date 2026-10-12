---
title: "How We Built an In-Browser 500MB JSON-to-Excel Converter Using WebAssembly and Web Workers"
published: false
description: "A deep dive into zero-upload client-side data engineering: how to parse massive nested JSON payloads, stream chunked tabular records, and compile OpenXML (.xlsx) binaries directly in browser memory without crashing Chrome or leaking data."
tags: webassembly, javascript, webdev, architecture
canonical_url: https://www.convertsheet.com/blog/convert-json-to-excel-privately
cover_image: https://www.convertsheet.com/og-image.png
---

# How We Built an In-Browser 500MB JSON-to-Excel Converter Using WebAssembly and Web Workers

Every day, software developers, security analysts, and enterprise accountants take raw customer exports, Stripe transaction dumps, or audit payloads and paste them into free online converters. When asked to convert this raw data into an Excel (`.xlsx`) spreadsheet for non-technical stakeholders, the instinctive search is *"JSON to Excel converter online"*.

What many engineering teams overlook is the severe architectural and legal exposure of traditional online converters:

1. **Server-Side Uploads:** Raw JSON payloads are transmitted over HTTP/HTTPS to unverified third-party cloud instances or VPS hosts.
2. **Disk Caching & Ingress Logging:** Temporary files, debug logs, or intermediate SQLite/Postgres tables frequently persist on remote disks indefinitely.
3. **Data Protection Violations:** Uploading customer emails, PII, financial ledgers, or health records breaches **GDPR (Article 28)**, **HIPAA**, and **SOC 2 Type II** controls.

When designing [ConvertSheet](https://www.convertsheet.com), our non-negotiable architectural requirement was: **Zero cloud uploads. Zero remote bytes. 100% execution in browser memory.**

Here is the engineering breakdown of how we solved the V8 garbage collection wall, designed a Web Worker streaming pipeline, and compiled binary Excel workbooks in-browser at native speed.

---

## 1. The V8 Memory Wall: Why Traditional JavaScript Converters Crash

If you try to parse a 200MB–500MB JSON file in standard client-side JavaScript using `JSON.parse(fileContent)`, Chrome or Firefox will frequently freeze the tab or throw an unrecoverable exception:

```text
RangeError: Maximum call stack size exceeded
// or
Fatal process out of memory: Zone
```

The reason lies in how the V8 engine handles heap allocation:

* A 100MB JSON string on disk doesn't take 100MB of RAM once parsed. It expands into a complex graph of V8 JSObjects, HashMaps, Shape descriptors, and hidden classes.
* A deeply nested array of 100,000 objects with 20 properties each produces over **2,000,000 distinct V8 heap entities**.
* When intermediate data transformation occurs (e.g. `Array.map()`, `Object.keys()`, `Array.flat()`), memory consumption spikes to **4x–8x the raw file size**, triggering aggressive Garbage Collection (GC) pauses that freeze the browser's UI thread (dropping the frame rate from 60fps to 0fps).

---

## 2. The Two-Tier Client-Side Architecture

To achieve butter-smooth UI interactions while crunching hundreds of megabytes, we split execution into two dedicated layers:

```
+-------------------------------------------------------------+
|                     MAIN UI THREAD (60 FPS)                 |
|   React UI  •  Drag-and-Drop Zone  •  Virtual Data Grid     |
+-------------------------------------------------------------+
                               |
                   postMessage | (Structured Clone / ArrayBuffer)
                               v
+-------------------------------------------------------------+
|                 DEDICATED WEB WORKER THREAD                 |
|  +-------------------------------------------------------+  |
|  | WebAssembly Tokenizer & Schema Discovery (Streaming)  |  |
|  +-------------------------------------------------------+  |
|                              |                              |
|                              v                              |
|  +-------------------------------------------------------+  |
|  | Dot-Notation Key Flattening & Type Normalization      |  |
|  +-------------------------------------------------------+  |
|                              |                              |
|                              v                              |
|  +-------------------------------------------------------+  |
|  | Client-Side OpenXML (.xlsx) Binary Zip Compiler       |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

### Key Architectural Decisions:
1. **Never parse on the UI thread:** The main thread only handles file chunk ingestion and UI rendering.
2. **Transferable Objects:** Large binary buffers are passed back to the main thread using `Transferable ArrayBuffers`, transferring memory ownership with **zero memory cloning cost**.
3. **Streaming Tokenization:** Instead of instantiating the entire object graph simultaneously, tokens are parsed in sequential windowed batches.

---

## 3. Dot-Notation Schema Discovery

Real-world API responses from platforms like Stripe, Shopify, or Salesforce are rarely flat arrays. They feature deeply nested objects and polymorphic records:

```json
[
  {
    "order_id": "ORD-94821",
    "customer": {
      "id": "cust_882",
      "profile": { "email": "finance@enterprise.corp", "tier": "Enterprise" }
    },
    "line_items": [
      { "sku": "SKU-PRO", "quantity": 12, "price": 120.00 }
    ],
    "meta": { "timestamp": "2026-10-08T00:00:00Z" }
  }
]
```

To map this into tabular Excel columns, our flattening engine applies three rules:

1. **Recursive Dot-Notation Flattening:** Nested properties become explicit header keys:
   * `customer.profile.email`
   * `customer.profile.tier`
   * `meta.timestamp`
2. **Type-Safe Primitive Conversion:** Excel requires strict cell data typing (`n` for numbers, `s` for strings, `b` for booleans, `d` for ISO dates). Numbers must never be coerced into strings, preserving `SUM()`, `AVERAGE()`, and `VLOOKUP()` formula compatibility.
3. **Heterogeneous Schema Normalization:** If record #1 has keys `[a, b]` and record #50,000 introduces key `[c]`, the schema dynamically registers column `c` and inserts `null` primitives for all previous rows without re-iterating over the dataset.

---

## 4. In-Memory OpenXML (.xlsx) Binary Generation

An `.xlsx` file is not a proprietary black box; it is an Open Packaging Conventions (OPC) compliant ZIP container containing XML files:

* `[Content_Types].xml`
* `_rels/.rels`
* `xl/workbook.xml`
* `xl/worksheets/sheet1.xml`
* `xl/styles.xml`
* `xl/sharedStrings.xml`

Instead of relying on heavy server-side libraries (like Python's `openpyxl` or Java's `Apache POI`), we assemble these XML structures using lightweight streaming builders inside the Web Worker.

Once the XML parts are constructed, an in-memory DEFLATE compression engine packs them into an `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` blob. The worker transmits this blob to the UI thread, which triggers an instant download using an ephemeral `URL.createObjectURL(blob)`.

---

## 5. Performance Benchmarks

We benchmarked ConvertSheet's client-side WASM engine against traditional cloud conversion services using a 50,000-row e-commerce dataset (nested 4 levels deep, 42MB raw JSON):

| Metric | ConvertSheet (Client-Side WASM) | Typical Cloud Converter |
| :--- | :---: | :---: |
| **Data Privacy** | **100% Private (0 Network Requests)** | File uploaded to external cloud VM |
| **Upload Time** | **0.00 seconds (Instant)** | 4.5 – 14.2 seconds |
| **Conversion Duration** | **1.85 seconds** | 6.8 seconds + queue delay |
| **Max File Size** | **Up to 500MB (RAM-dependent)** | 5MB – 10MB (Paywalled) |
| **Compliance Risk** | **Zero (Air-gapped compatible)** | High (Third-party data ingress) |

---

## 6. How to Try It

You can test the implementation directly in your browser without creating an account or uploading any files:

* Launch the [JSON to Excel Converter](https://www.convertsheet.com/convert/json-to-excel).
* If you need to inspect or repair malformed JSON payloads prior to conversion, use our [JSON Formatter & Validator](https://www.convertsheet.com/tools/json-formatter-validator).
* For flat tabular datasets, you can also convert between [CSV and Excel](https://www.convertsheet.com/convert/csv-to-excel) with custom delimiters.

### Verification Tip:
Open Chrome DevTools (`F12`), switch to the **Network** tab, drop a 50MB JSON file into the tool, and watch the network activity. **Zero bytes are transmitted across the wire.**

---

*Written by [Priyanshu Rawat](https://www.linkedin.com/in/priyanshu-rawat-570b7a19b/), Founder & Lead Software Engineer at [ConvertSheet](https://www.convertsheet.com).*
