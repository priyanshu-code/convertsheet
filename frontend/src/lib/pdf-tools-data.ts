import { ToolConfig } from "@/types/tool";

export const PDF_TOOLS: Record<string, ToolConfig> = {
  "merge-pdf": {
    slug: "merge-pdf",
    name: "Merge PDF Online",
    category: "utility",
    title: "Merge PDF Files Online - 100% Free, Fast & Private",
    subtitle: "Combine multiple PDF documents into a single organized PDF file in seconds directly in your web browser.",
    metaDescription: "Free online PDF merger. Combine multiple PDF files into one document in browser memory with zero server uploads and 100% privacy.",
    answerSummary: "Merge multiple PDF files into one document in sequential order. Drag and drop your PDFs, rearrange the sequence, and download the merged file with zero server uploads.",
    badge: "100% Private",
    featured: true,
    keywords: [
      "merge pdf",
      "combine pdf",
      "merge pdf online",
      "join pdf files",
      "combine pdf documents free",
      "client side pdf merger",
      "secure pdf merge"
    ],
    formulaDescription: "Reads binary PDF streams via pdf-lib, extracts document catalogs and pages into a unified document catalog, and serializes the combined byte stream in browser memory.",
    about: "Combining contracts, invoices, academic research papers, or monthly financial reports often requires merging multiple PDF documents into a single cohesive file. Unlike traditional online PDF tools that upload your sensitive documents to remote third-party servers, ConvertSheet executes the entire merging pipeline 100% client-side in your browser memory. Your confidential financial, legal, and personal files never leave your device.",
    howTo: [
      { step: 1, title: "Select PDF Files", description: "Click Choose Files or drop multiple PDF documents into the workspace." },
      { step: 2, title: "Arrange Sequence", description: "Use the Up and Down controls to order the documents in your preferred page sequence." },
      { step: 3, title: "Merge & Download", description: "Click Merge PDFs to instantly create and download your single combined PDF file." }
    ],
    faqs: [
      { question: "Is there a file size or page limit when merging PDFs?", answer: "Because ConvertSheet operates in your web browser's memory, you can merge dozens of files without subscription fees or artificial page restrictions." },
      { question: "Are my confidential PDF documents uploaded to your server?", answer: "No. Zero bytes leave your computer. Merging is processed entirely within your device's memory using client-side JavaScript." },
      { question: "Can I reorder the PDF files before merging?", answer: "Yes. You can reorder the documents using the Up and Down arrow buttons to ensure the pages appear in the exact order you need." }
    ],
    relatedConverters: ["pdf-to-excel", "csv-to-excel"],
    relatedTools: ["split-pdf", "watermark-pdf", "page-number-pdf"]
  },

  "split-pdf": {
    slug: "split-pdf",
    name: "Split PDF & Extract Pages",
    category: "utility",
    title: "Split PDF Online - Extract Pages & Ranges Free",
    subtitle: "Separate specific pages or custom page ranges from any PDF document quickly and securely in your browser.",
    metaDescription: "Free online PDF splitter. Extract specific pages or page ranges from any PDF document directly in your browser with zero server uploads.",
    answerSummary: "Extract specific pages or page ranges (e.g. 1-3, 5, 8-10) from any PDF document into a new lightweight PDF file in browser memory.",
    badge: "Fast & Free",
    featured: true,
    keywords: [
      "split pdf",
      "extract pdf pages",
      "separate pdf",
      "split pdf online free",
      "extract pages from pdf",
      "pdf page range extractor"
    ],
    formulaDescription: "Parses target page indices, extracts corresponding page objects from the source PDF dictionary, and writes a new PDF document containing only the selected subset.",
    about: "When you only need a single chapter from an e-book, specific invoices from a monthly accounting bundle, or particular slides from a presentation deck, splitting a PDF is the fastest solution. ConvertSheet's PDF Splitter lets you extract single pages, continuous ranges, or custom subsets without uploading your documents to external cloud servers.",
    howTo: [
      { step: 1, title: "Upload PDF", description: "Drop your PDF file into the dropzone to inspect its total page count." },
      { step: 2, title: "Specify Page Range", description: "Enter page numbers or ranges (e.g., 1-3, 5, 7) or choose quick presets like Odd or Even pages." },
      { step: 3, title: "Extract & Save", description: "Click Split PDF to download the newly generated document containing only your selected pages." }
    ],
    faqs: [
      { question: "How do I specify multiple separate page ranges?", answer: "Use comma-separated values and hyphens. For example, '1-4, 7, 10-12' extracts pages 1 through 4, page 7, and pages 10 through 12." },
      { question: "Does splitting reduce the quality of the PDF?", answer: "No. The vector shapes, high-resolution images, and embedded fonts in the extracted pages are preserved with 100% original fidelity." },
      { question: "Is my document stored on ConvertSheet?", answer: "Never. All page extraction is performed locally in browser memory with zero server retention." }
    ],
    relatedConverters: ["pdf-to-excel", "csv-to-excel"],
    relatedTools: ["merge-pdf", "watermark-pdf", "page-number-pdf"]
  },

  "watermark-pdf": {
    slug: "watermark-pdf",
    name: "Watermark PDF Online",
    category: "utility",
    title: "Watermark PDF Online - Add Text Watermarks Free",
    subtitle: "Protect your intellectual property by stamping custom text watermarks like CONFIDENTIAL or DRAFT onto every PDF page.",
    metaDescription: "Free online PDF watermarker. Add custom text watermarks, adjust opacity, angle, and size across all pages directly in your browser.",
    answerSummary: "Add customizable text watermarks (such as CONFIDENTIAL, DRAFT, or COPY) with adjustable opacity, diagonal rotation, and font sizing to every page of your PDF.",
    badge: "IP Protection",
    featured: true,
    keywords: [
      "watermark pdf",
      "add watermark to pdf",
      "pdf watermark online",
      "confidential watermark pdf",
      "draft watermark pdf",
      "free pdf watermarker"
    ],
    formulaDescription: "Embeds Helvetica font glyphs into the content stream of each page dictionary at calculated center coordinates with configurable alpha channel opacity and degree rotations.",
    about: "Protecting sensitive blueprints, proprietary financial models, and pre-release manuscripts requires clear document watermarking. ConvertSheet's PDF Watermarker stamps high-visibility or subtle semi-transparent text watermarks across every page of your document directly in your browser.",
    howTo: [
      { step: 1, title: "Upload PDF", description: "Select the PDF document you wish to watermark." },
      { step: 2, title: "Customize Watermark", description: "Type your watermark text, choose opacity, diagonal or horizontal orientation, and font size." },
      { step: 3, title: "Apply & Download", description: "Click Apply Watermark to generate and save the stamped PDF file instantly." }
    ],
    faqs: [
      { question: "Can the watermark text be customized?", answer: "Yes. You can enter any text, such as CONFIDENTIAL, DRAFT, SAMPLE, DO NOT COPY, or your organization's name." },
      { question: "Can I adjust how dark or transparent the watermark is?", answer: "Yes. The opacity slider allows you to choose anywhere from 10% (subtle background) to 80% (prominent stamp)." },
      { question: "Are my confidential files secure?", answer: "100% secure. Processing happens entirely on your machine. No documents are transmitted over the internet." }
    ],
    relatedConverters: ["pdf-to-excel"],
    relatedTools: ["merge-pdf", "page-number-pdf", "split-pdf"]
  },

  "page-number-pdf": {
    slug: "page-number-pdf",
    name: "Add Page Numbers to PDF",
    category: "utility",
    title: "Add Page Numbers to PDF Online - Fast & Free",
    subtitle: "Stamp clean, professional page numbering onto every page of your PDF documents with customizable position and format.",
    metaDescription: "Free online PDF page numberer. Stamp page numbers (Page X of Y or 1, 2, 3) at bottom-center or bottom-right directly in your browser with zero server uploads.",
    answerSummary: "Stamp sequential page numbers onto your PDF documents with flexible formatting ('Page X of Y' or '1, 2, 3') and bottom-center or bottom-right alignment.",
    badge: "Professional Polish",
    featured: true,
    keywords: [
      "page number pdf",
      "add page numbers to pdf",
      "number pdf pages",
      "pdf page numbering online free",
      "bates numbering pdf",
      "stamp page numbers"
    ],
    formulaDescription: "Iterates through document page nodes, calculates page width and baseline offsets, and injects text drawing operators into each page's visual layer.",
    about: "When preparing legal filings, academic dissertations, business proposals, or corporate reports, sequential page numbering is essential for readability and referencing. ConvertSheet provides an instant, client-side page numberer that stamps clean numbering at your chosen position without altering your existing content.",
    howTo: [
      { step: 1, title: "Select PDF", description: "Choose the PDF document that needs page numbers." },
      { step: 2, title: "Choose Style & Position", description: "Select between 'Page X of Y' or simple digits, and pick bottom-center or bottom-right alignment." },
      { step: 3, title: "Stamp & Download", description: "Click Add Page Numbers to generate and download your numbered PDF immediately." }
    ],
    faqs: [
      { question: "What numbering formats are available?", answer: "You can choose between 'Page X of Y' (e.g., Page 3 of 12) or clean single numbers ('3')." },
      { question: "Where are the page numbers placed?", answer: "Numbers are neatly stamped in the bottom margin, either centered or aligned to the bottom-right corner." },
      { question: "Does this overwrite existing text on the page?", answer: "Numbers are stamped cleanly in the lower page margin (24pt from bottom) to avoid overlapping body text." }
    ],
    relatedConverters: ["pdf-to-excel", "csv-to-excel"],
    relatedTools: ["merge-pdf", "watermark-pdf", "split-pdf"]
  },

  "pdf-table-extractor": {
    slug: "pdf-table-extractor",
    name: "PDF Table & Text Extractor to Excel",
    category: "data-developer",
    title: "Extract Tables from PDF to Excel & CSV Online",
    subtitle: "Parse structured text and tables from PDF documents and export directly to clean Excel (.xlsx) or CSV spreadsheets.",
    metaDescription: "Free online PDF table extractor. Parse structured data from PDF files and export to Excel (.xlsx) or CSV directly in your browser with zero server uploads.",
    answerSummary: "Extract structured tabular data and text from PDF documents and export directly into Excel (.xlsx) spreadsheets or CSV files 100% in-browser.",
    badge: "SheetJS Powered",
    featured: true,
    keywords: [
      "pdf table extractor",
      "extract table from pdf to excel",
      "pdf to excel online",
      "convert pdf table to csv",
      "extract data from pdf",
      "pdf to spreadsheet free"
    ],
    formulaDescription: "Scans PDF content operators for text stream blocks, reconstructs whitespace-delimited columns into tabular rows, and builds an OpenXML workbook via SheetJS.",
    about: "Financial statements, invoices, rate sheets, and inventory catalogs are frequently locked in non-editable PDF files. Converting them manually requires tedious copy-pasting and reformatting. ConvertSheet's PDF Table Extractor reads the text layout directly from your PDF and converts it into a structured spreadsheet ready for Excel, Google Sheets, or CSV analysis.",
    howTo: [
      { step: 1, title: "Upload PDF", description: "Drop your PDF containing tabular data or structured text into the parser." },
      { step: 2, title: "Preview Data", description: "Inspect the extracted table columns and rows in the live interactive data preview." },
      { step: 3, title: "Export to Excel or CSV", description: "Click Export to Excel (.xlsx) or Export to CSV to download your structured spreadsheet." }
    ],
    faqs: [
      { question: "Does this work on scanned images of documents?", answer: "This tool extracts selectable digital text streams. Scanned image-only PDFs without an OCR text layer will show an indicator that selectable text was not found." },
      { question: "What formats can I export the extracted table to?", answer: "You can export directly to Microsoft Excel (.xlsx), comma-separated values (.csv), or copy the raw table to your clipboard." },
      { question: "Is my financial or corporate data safe?", answer: "Absolutely. All extraction and Excel file generation happen entirely in your browser using SheetJS. Zero data is ever sent to a server." }
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel", "json-to-excel"],
    relatedTools: ["merge-pdf", "byte-converter", "json-formatter-validator"]
  }
};
