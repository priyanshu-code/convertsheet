import { ToolConfig } from "@/types/tool";

export const IMAGE_TOOLS: Record<string, ToolConfig> = {
  "webp-to-png": {
    slug: "webp-to-png",
    name: "WebP to PNG Converter",
    category: "utility",
    title: "Convert WebP to PNG Online - Free, Fast & Lossless",
    subtitle: "Convert Google WebP images to high-definition transparent PNG files directly in your web browser with 100% privacy.",
    metaDescription: "Free online WebP to PNG converter. Transform WebP photos and graphics into transparent PNG images in browser memory with zero server uploads.",
    answerSummary: "Convert WebP images to PNG with full alpha channel transparency support directly in your web browser using HTML5 Canvas APIs.",
    badge: "100% Free",
    featured: true,
    keywords: ["webp to png", "convert webp to png online", "webp converter", "transparent png from webp", "lossless webp conversion"],
    formulaDescription: "Decodes WebP pixel buffers via native browser image decoders and re-encodes to PNG with RGBA 32-bit color accuracy.",
    about: "WebP is an efficient format developed by Google for high-speed web loading, but many legacy desktop applications, image editors, and printing workflows still require PNG. ConvertSheet enables instant, lossless conversion from WebP to PNG entirely inside your browser memory.",
    howTo: [
      { step: 1, title: "Choose WebP Image", description: "Select or drop your .webp file into the secure dropzone." },
      { step: 2, title: "Preview Output", description: "Inspect the rendered PNG output and transparency channel." },
      { step: 3, title: "Download PNG", description: "Click Download to save the crystal clear PNG file to your device." }
    ],
    faqs: [
      { question: "Does this preserve transparency?", answer: "Yes! Full alpha transparency is 100% preserved during conversion." },
      { question: "Is my photo uploaded to your server?", answer: "No. The entire rendering and encoding pipeline executes locally in your browser memory." }
    ],
    relatedConverters: ["parquet-to-excel"],
    relatedTools: ["png-to-webp", "image-compressor"]
  },

  "png-to-webp": {
    slug: "png-to-webp",
    name: "PNG to WebP Converter",
    category: "utility",
    title: "Convert PNG to WebP Online - Reduce Image Size by 80%",
    subtitle: "Convert PNG images to next-gen WebP format with configurable compression and transparency support to speed up website load times.",
    metaDescription: "Free online PNG to WebP converter. Slash image file size by up to 80% while retaining transparent backgrounds and crisp visual clarity.",
    answerSummary: "Converting PNG to modern WebP format typically cuts file size by 25% to 80%, drastically improving Google PageSpeed and Core Web Vitals.",
    badge: "PageSpeed Boost",
    featured: true,
    keywords: ["png to webp", "convert png to webp", "compress png to webp", "next gen image format", "pagespeed image optimization"],
    formulaDescription: "Applies WebP predictive coding and entropy quantization to PNG pixel buffers, reducing asset payloads.",
    about: "Web developers and SEO specialists convert bulky PNG assets to WebP to dramatically reduce website bandwidth and improve Core Web Vitals (LCP score). ConvertSheet lets you batch convert PNGs into sleek WebP images with adjustable quality sliders.",
    howTo: [
      { step: 1, title: "Upload PNG", description: "Drop your transparent or solid PNG image into the workspace." },
      { step: 2, title: "Adjust Quality", description: "Use the quality slider to balance maximum compression with visual clarity." },
      { step: 3, title: "Download WebP", description: "Save your lightweight WebP asset ready for instant production deployment." }
    ],
    faqs: [
      { question: "How much file size do I save by converting PNG to WebP?", answer: "WebP lossless images are typically 26% smaller than PNGs, and lossy WebP can be 70% to 85% smaller." },
      { question: "Are WebP images supported across all browsers?", answer: "Yes, WebP is supported by Chrome, Safari, Firefox, Edge, and all modern mobile devices." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["webp-to-png", "image-compressor"]
  },

  "jpeg-to-png": {
    slug: "jpeg-to-png",
    name: "JPEG to PNG Converter",
    category: "utility",
    title: "Convert JPG & JPEG to PNG Online - High Quality",
    subtitle: "Convert JPG and JPEG photos to uncompressed PNG format for clean editing, overlaying, and graphics design.",
    metaDescription: "Free online JPEG to PNG converter. Convert JPG photographs and assets to PNG format with zero quality degradation.",
    answerSummary: "Convert lossy JPEG photos to lossless PNG format for seamless graphic design, vector overlays, and photo editing.",
    badge: "Graphic Design",
    featured: false,
    keywords: ["jpeg to png", "jpg to png", "convert jpg to png", "photo to png converter", "online jpg converter"],
    formulaDescription: "Decompresses Discrete Cosine Transform (DCT) JPEG blocks into raw bitmap RGBA pixels and re-encodes as PNG.",
    about: "Converting JPEG to PNG is useful when you need to import photos into design tools like Photoshop or Figma without compounding compression artifacts. ConvertSheet processes your JPEG images locally on your computer with zero compression loss.",
    howTo: [
      { step: 1, title: "Select JPG", description: "Upload any JPG or JPEG image." },
      { step: 2, title: "Review Dimensions", description: "Inspect the decoded image dimensions and color depth." },
      { step: 3, title: "Export PNG", description: "Download the converted PNG file instantly." }
    ],
    faqs: [
      { question: "Will converting JPEG to PNG improve image quality?", answer: "Converting does not add detail lost during JPEG compression, but prevents any future quality degradation upon further editing." },
      { question: "Does PNG support transparency when converted from JPEG?", answer: "JPEG images do not have transparency layers, but converting to PNG allows you to add transparent alpha channels in photo editors." }
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["png-to-webp", "webp-to-png"]
  },

  "image-compressor": {
    slug: "image-compressor",
    name: "Image Resizer & Compressor",
    category: "utility",
    title: "Online Image Compressor & Resizer - Shrink Image KB/MB",
    subtitle: "Compress and resize WebP, PNG, and JPEG images to exact pixel widths and target file sizes directly in browser memory.",
    metaDescription: "Free online image compressor and resizer. Reduce image file size by up to 90% without server uploads. Set custom dimensions and quality.",
    answerSummary: "Shrink image file size in kilobytes and megabytes by dynamically downsampling resolution and adjusting quantization levels.",
    badge: "Essential",
    featured: true,
    keywords: ["image compressor", "resize image online", "compress photo", "reduce image size kb", "image optimizer"],
    formulaDescription: "Applies bilinear downsampling interpolation and perceptual quantization to compress image assets.",
    about: "High-resolution photos from smartphones and cameras often exceed 10MB to 20MB, making them too large for emails, job applications, government portals, and web forms. ConvertSheet's Image Resizer and Compressor lets you scale down resolution and adjust quality in real time.",
    howTo: [
      { step: 1, title: "Upload Photo", description: "Drag and drop any heavy image file into the compressor." },
      { step: 2, title: "Choose Target Size", description: "Adjust the Max Width slider and quality percentage." },
      { step: 3, title: "Download Optimized Image", description: "Save your optimized image with the exact size reduction displayed." }
    ],
    faqs: [
      { question: "Is there a limit on how many images I can compress?", answer: "No, ConvertSheet is 100% free with unlimited conversions because processing happens on your own hardware." },
      { question: "Are my photos kept private?", answer: "Yes, your personal pictures and documents never leave your computer." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["compress-image", "png-to-webp", "svg-to-png"]
  },

  "compress-image": {
    slug: "compress-image",
    name: "Bulk Image Compressor",
    category: "utility",
    title: "Bulk Image Compressor Online - Compress Photos & Images in Browser",
    subtitle: "Compress up to 50 JPEG, PNG, and WebP images simultaneously in your browser. Slash file sizes up to 90% with zero server uploads and 100% privacy.",
    metaDescription: "Free bulk image compressor. Compress multiple JPG, PNG, and WebP photos directly in your browser with real-time savings preview, individual quality fine-tuning, and ZIP export.",
    answerSummary: "Compress batches of up to 50 JPEG, PNG, and WebP images simultaneously directly in your browser memory, slashing file sizes by up to 90% while keeping your media 100% private.",
    badge: "Bulk Optimizer",
    featured: true,
    keywords: [
      "bulk image compressor",
      "compress images in bulk",
      "batch image optimizer",
      "compress photo online",
      "reduce image size mb to kb",
      "free bulk photo compressor"
    ],
    formulaDescription: "Uses client-side HTML5 Canvas and OffscreenCanvas with progressive DCT quantization and WebP predictive encoding to reduce image file weight.",
    about: "Modern cameras and smartphones produce photographs and design assets often exceeding 10MB to 30MB each. When preparing images for websites, digital forms, real estate listings, or email campaigns, uploading images individually is painfully slow. ConvertSheet's Bulk Image Compressor runs locally on your device hardware, allowing you to optimize up to 50 photos in parallel with real-time savings calculations and one-click ZIP packaging.",
    howTo: [
      { step: 1, title: "Upload batch of images", description: "Drag and drop up to 50 JPG, PNG, or WebP files or choose them from your device." },
      { step: 2, title: "Fine-tune compression/quality", description: "Apply a global quality preset or adjust individual photo sliders to achieve your ideal balance of sharpness and file size." },
      { step: 3, title: "Download individual or ZIP", description: "Download individual compressed photos or export the complete batch in a single convenient ZIP archive." }
    ],
    faqs: [
      { question: "Is my photo uploaded to an external server?", answer: "No. All compression, resizing, and ZIP packaging happens entirely within your web browser using client-side JavaScript and Canvas APIs. Zero image data is sent across the internet." },
      { question: "What is the file limit for batch compression?", answer: "You can compress up to 50 images simultaneously, with support for files up to 50MB each depending on your device's browser memory." },
      { question: "Which formats are supported?", answer: "Our bulk compression engine supports JPEG/JPG, PNG, and WebP image formats, preserving alpha transparency where applicable." },
      { question: "How does ZIP export work?", answer: "All compressed files in your batch are packaged locally using client-side ZIP streaming, allowing you to save all optimized images with one click." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["compress-jpeg", "compress-png", "compress-webp", "image-compressor"]
  },

  "compress-jpeg": {
    slug: "compress-jpeg",
    name: "JPEG & JPG Compressor",
    category: "utility",
    title: "Compress JPEG & JPG Images Online - Reduce File Size",
    subtitle: "Shrink bulky JPEG and JPG photographs with smart quantization while preserving visual clarity.",
    metaDescription: "Free online JPEG and JPG compressor. Reduce image file size by up to 90% without quality degradation. Client-side, fast, and private.",
    answerSummary: "Shrink bulky JPEG and JPG photographs by adjusting quantization matrices and chroma subsampling directly in your browser without compromising visible clarity.",
    badge: "Popular Format",
    featured: true,
    keywords: [
      "compress jpeg",
      "compress jpg",
      "reduce jpg size",
      "jpeg optimizer",
      "shrink jpeg online",
      "compress photo"
    ],
    formulaDescription: "Adjusts 8x8 Discrete Cosine Transform (DCT) quantization tables and chroma subsampling to eliminate imperceptible image data.",
    about: "JPEG is the dominant image format for photographic imagery across the web, but unoptimized photos quickly inflate web page load times and trigger mobile bandwidth limits. ConvertSheet's JPEG Compressor enables smart perceptual compression that preserves skin tones, edges, and high-frequency textures while dramatically reducing byte counts.",
    howTo: [
      { step: 1, title: "Upload JPEG files", description: "Drag and drop your JPG or JPEG images into the compressor." },
      { step: 2, title: "Adjust compression quality", description: "Select your target compression strength using the visual preview slider." },
      { step: 3, title: "Download compressed JPEG", description: "Save your optimized photos individually or as an all-in-one ZIP archive." }
    ],
    faqs: [
      { question: "What is the difference between JPEG and JPG?", answer: "JPEG and JPG refer to the exact same image format. The .jpg file extension originated from legacy 3-letter file extension limits on older operating systems." },
      { question: "Does compressing JPEG cause visual blurriness?", answer: "ConvertSheet uses perceptual quantization algorithms that maintain crisp edge contrast and color fidelity, minimizing artifacts at standard 70%-85% quality settings." },
      { question: "Can I compress multiple JPGs at once?", answer: "Yes! You can process up to 50 JPEG images simultaneously in a single batch." }
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["compress-image", "compress-png", "compress-webp"]
  },

  "compress-png": {
    slug: "compress-png",
    name: "PNG Compressor",
    category: "utility",
    title: "Compress PNG Images Online - Transparent & Lossless",
    subtitle: "Reduce transparent PNG file size without loss of background transparency or graphics quality.",
    metaDescription: "Free online PNG compressor. Shrink transparent PNGs, screenshots, and graphics without losing alpha channels or visual sharpness. 100% private.",
    answerSummary: "Compress transparent PNG graphics, logos, and UI screenshots without losing alpha background transparency or visual sharpness.",
    badge: "Alpha Transparency",
    featured: true,
    keywords: [
      "compress png",
      "shrink png",
      "reduce png file size",
      "transparent png compressor",
      "lossless png optimization",
      "png optimizer online"
    ],
    formulaDescription: "Optimizes Deflate filtering heuristics and RGBA palette indexing to compress PNG assets while maintaining 8-bit alpha transparency.",
    about: "Portable Network Graphics (PNG) is the standard format for logos, illustrations, and user interface screenshots requiring transparent backgrounds. However, raw PNG files can be massive due to lossless bitmap storage. ConvertSheet's PNG Compressor selectively optimizes color palettes and entropy filters, drastically shrinking file sizes while keeping alpha transparency perfectly intact.",
    howTo: [
      { step: 1, title: "Upload PNG graphics", description: "Select or drop transparent PNG illustrations, icons, or screenshots." },
      { step: 2, title: "Choose compression level", description: "Fine-tune compression settings with real-time byte count and visual preview." },
      { step: 3, title: "Export optimized PNG", description: "Download your compressed PNGs with transparent layers preserved." }
    ],
    faqs: [
      { question: "Will my transparent backgrounds be preserved?", answer: "Yes. Our PNG compression engine fully preserves 8-bit and 1-bit alpha transparency channels." },
      { question: "Why are PNG files usually larger than JPEGs?", answer: "PNG is a lossless format designed for crisp line art and text, whereas JPEG is lossy and designed for photographs. Our tool optimizes PNG compression to bridge this size gap." },
      { question: "Is this compression safe for brand logos and icons?", answer: "Absolutely. High-contrast edges, fine typography, and vector-rendered graphics retain crisp definition." }
    ],
    relatedConverters: ["csv-to-excel"],
    relatedTools: ["compress-image", "compress-jpeg", "compress-webp"]
  },

  "compress-webp": {
    slug: "compress-webp",
    name: "WebP Compressor",
    category: "utility",
    title: "Compress WebP Images Online - Max PageSpeed Boost",
    subtitle: "Optimize next-generation WebP images to supercharge Google Core Web Vitals and LCP scores.",
    metaDescription: "Free online WebP compressor. Maximize Google PageSpeed and Core Web Vitals by optimizing WebP assets directly in your browser with zero latency.",
    answerSummary: "Optimize next-generation WebP images to minimize payload weights and supercharge Google PageSpeed and Largest Contentful Paint (LCP) scores.",
    badge: "Next-Gen Speed",
    featured: true,
    keywords: [
      "compress webp",
      "webp compressor online",
      "optimize webp",
      "reduce webp size",
      "pagespeed webp optimization",
      "core web vitals image tool"
    ],
    formulaDescription: "Applies advanced VP8/VP8L predictive macroblock quantization and arithmetic entropy coding for maximum data compaction.",
    about: "WebP is Google's modern image format engineered for lightning-fast web browsing and superior compression ratios over legacy formats. ConvertSheet's WebP Compressor pushes WebP optimization even further, letting web developers, SEO specialists, and performance engineers achieve minimal asset payloads to ace Core Web Vitals audits.",
    howTo: [
      { step: 1, title: "Upload WebP files", description: "Drop your existing WebP images into the optimization workspace." },
      { step: 2, title: "Select optimization level", description: "Adjust the WebP quality slider to maximize file size reduction." },
      { step: 3, title: "Download optimized WebP", description: "Save the hyper-optimized WebP files ready for instant CDN deployment." }
    ],
    faqs: [
      { question: "How does WebP compare to JPG and PNG for web performance?", answer: "WebP files are typically 25% to 34% smaller than equivalent JPEGs and 26% smaller than PNGs while matching visual fidelity." },
      { question: "Does WebP compression support both lossy and lossless modes?", answer: "Yes, WebP supports both lossy photographic compression and lossless transparency-preserving compression." },
      { question: "Will compressing WebP improve my Google PageSpeed score?", answer: "Yes. Smaller image payloads directly decrease Largest Contentful Paint (LCP) and total page load time, boosting your SEO rankings." }
    ],
    relatedConverters: ["parquet-to-excel"],
    relatedTools: ["compress-image", "compress-jpeg", "compress-png"]
  },

  "svg-to-png": {
    slug: "svg-to-png",
    name: "SVG to PNG Rasterizer",
    category: "utility",
    title: "Convert SVG to PNG Online - High-Resolution Rasterizer",
    subtitle: "Render scalable vector graphics (SVG) into crisp transparent PNG images at any custom resolution up to 4K.",
    metaDescription: "Free online SVG to PNG converter. Rasterize vector SVG files into high-resolution transparent PNG images with custom dimensions.",
    answerSummary: "Convert vector XML paths into crisp rasterized PNG bitmaps at custom high resolutions with transparent backgrounds.",
    badge: "Vector Tool",
    featured: false,
    keywords: ["svg to png", "convert svg to png", "rasterize svg", "high resolution svg to png", "svg converter online"],
    formulaDescription: "Parses SVG XML vectors via browser DOM parser, renders to canvas at target DPI, and exports to PNG.",
    about: "Vector SVG icons, illustrations, and logos offer infinite scalability, but many document processors and presentation decks require PNG bitmaps. ConvertSheet lets you rasterize SVGs at high DPI with transparent backgrounds.",
    howTo: [
      { step: 1, title: "Upload SVG", description: "Choose your .svg vector file." },
      { step: 2, title: "Set Output Resolution", description: "Select your desired width (e.g. 1920px for Full HD or 3840px for 4K)." },
      { step: 3, title: "Download PNG", description: "Download the crystal clear rasterized PNG image." }
    ],
    faqs: [
      { question: "Can I rasterize SVGs at 4K resolution?", answer: "Yes! Set the max width slider to 3840px to produce ultra-sharp 4K PNG renders." },
      { question: "Does this tool preserve vector color gradients?", answer: "Yes, modern canvas vector rasterization faithfully preserves linear and radial gradients defined in SVG paths." }
    ],
    relatedConverters: ["json-to-excel"],
    relatedTools: ["png-to-webp", "webp-to-png"]
  }
};
