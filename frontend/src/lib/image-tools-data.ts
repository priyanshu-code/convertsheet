import { ToolConfig } from "@/types/tool";

export const IMAGE_TOOLS: Record<string, ToolConfig> = {
  "webp-to-png": {
    slug: "webp-to-png",
    name: "WebP to PNG Converter",
    category: "utility",
    title: "Convert WebP to PNG Online Free (Batch & 100% Private)",
    subtitle: "Batch convert Google WebP images to high-resolution transparent PNG files directly in your web browser with zero server uploads and zero cloud queues.",
    metaDescription: "Free online WebP to PNG converter. Batch convert multiple WebP photos into lossless transparent PNGs with full alpha channel support in browser memory. 100% private.",
    answerSummary: "Convert WebP images to PNG with full alpha channel transparency support directly in your web browser using client-side HTML5 Canvas. Zero files are uploaded to remote cloud servers, guaranteeing 100% data confidentiality and zero queue wait times.",
    badge: "100% Free",
    featured: true,
    keywords: ["webp to png", "convert webp to png online", "webp converter", "transparent png from webp", "lossless webp conversion", "batch webp to png", "webp to png free"],
    formulaDescription: "Decodes WebP container VP8/VP8L bitstreams into 32-bit RGBA8888 canvas pixel buffers and re-encodes as lossless Deflate PNG bitmaps with alpha preservation.",
    about: "WebP is an efficient modern image format engineered by Google utilizing VP8 (lossy) or VP8L (lossless) compression within a RIFF container. While WebP achieves superior compression ratios for web loading speeds, legacy desktop applications, specialized image editors, printing workflows, and desktop OS utilities frequently fail to open or manipulate .webp files natively. ConvertSheet solves this by decoding WebP pixel buffers directly in your browser's execution thread via native HTML5 Canvas and OffscreenCanvas APIs into uncompressed 32-bit RGBA8888 bitmaps, then re-encoding them into standard lossless Portable Network Graphics (PNG) format with full 8-bit alpha channel transparency.\n\n### ConvertSheet vs Other WebP Converters\n\n| Feature | ConvertSheet | CloudConvert | FreeConvert | MS Paint / Mac Preview |\n| :--- | :--- | :--- | :--- | :--- |\n| **Cloud Server Uploads** | **Zero (100% In-Browser)** | Yes (Uploaded to cloud) | Yes (Uploaded to cloud) | No (Local Desktop App) |\n| **Data Privacy & NDAs** | **100% Confidential** | Third-party queue risks | Third-party queue risks | Safe locally |\n| **Alpha Transparency** | **Full 32-bit RGBA** | Preserved | Preserved | Often loses transparency |\n| **Batch Processing** | **Instant (Multi-file)** | Queue-limited (25 min/day) | Max 20 files (with ads) | One file at a time |\n| **Installation Required** | **None (Works everywhere)**| None | None | OS-dependent |\n| **Pricing / Paywall** | **100% Free Forever** | Daily conversion caps | Aggressive paywalls | Built-in |",
    howTo: [
      { step: 1, title: "Choose WebP Image", description: "Select or drop your .webp file into the secure dropzone." },
      { step: 2, title: "Preview Output", description: "Inspect the rendered PNG output and transparency channel." },
      { step: 3, title: "Download PNG", description: "Click Download to save the crystal clear PNG file to your device." }
    ],
    faqs: [
      {
        question: "Does this converter preserve transparent backgrounds (alpha channel)?",
        answer: "Yes! Full alpha transparency is preserved with complete 32-bit RGBA fidelity. When a WebP image with an alpha mask or transparent layer is decoded, ConvertSheet extracts all 4 color channels (Red, Green, Blue, and Alpha at 8 bits per channel) into the canvas buffer and encodes a true 32-bit PNG file, ensuring transparent cutouts, logos, and UI elements stay crisp without jagged halos or black background artifacts."
      },
      {
        question: "Why is ConvertSheet safer than CloudConvert or FreeConvert for confidential images?",
        answer: "Cloud converters like CloudConvert, FreeConvert, or Zamzar transmit your raw image files across public networks to remote third-party processing clusters, storing them on temporary cloud disks where they may be vulnerable to data leaks or server retention. ConvertSheet executes 100% locally in your device's browser memory using WebAssembly and HTML5 Canvas. Your confidential graphics, NDA documents, customer photos, and proprietary assets never leave your computer."
      },
      {
        question: "How do I convert WebP to PNG on Mac or Windows without downloading third-party software?",
        answer: "On Windows, you can open the WebP file in MS Paint and select \"Save As\" > \"PNG picture\", though older versions may discard transparency. On macOS, you can double-click the file to open it in Preview, choose \"File\" > \"Export\", and select PNG. However, desktop utilities require opening and converting each image individually. ConvertSheet gives you the speed and privacy of local processing with seamless drag-and-drop batch conversion and ZIP download without installing any software."
      },
      {
        question: "Why does Google Chrome download images as .webp instead of .png or .jpg?",
        answer: "Websites serve WebP images to Google Chrome because WebP cuts file sizes by 25% to 35% compared to PNG and JPEG, significantly accelerating page load times and boosting Google PageSpeed and Core Web Vitals rankings. When you right-click \"Save image as\" in Chrome, the browser saves the exact file sent by the server (.webp). ConvertSheet allows you to instantly convert those WebP downloads back to standard PNG format for seamless compatibility with PowerPoint, Photoshop, Discord, and desktop software."
      },
      {
        question: "Can I batch convert multiple WebP files to PNG simultaneously?",
        answer: "Yes! You can drag and drop up to 30 WebP files into ConvertSheet simultaneously. Our multi-threaded browser engine processes conversions in parallel and provides one-click batch ZIP download so you can save all converted PNG images instantly without waiting in server queues."
      },
      {
        question: "Can animated WebP files be converted to PNG?",
        answer: "Standard PNG is a single-frame bitmap format. When you upload an animated WebP file, ConvertSheet decodes and extracts the high-resolution first keyframe as a crisp transparent PNG. If you require full multi-frame animation, you would need Animated Portable Network Graphics (APNG) or GIF, but for static graphical use, the first-frame PNG extraction is ideal."
      },
      {
        question: "Is there any file size limit or daily conversion queue?",
        answer: "ConvertSheet has zero artificial paywalls, no daily conversion quotas, and no queue wait times. You can convert unlimited images up to 50MB per file, constrained only by your device's available browser RAM."
      },
      {
        question: "Will converting from WebP to PNG increase my file size?",
        answer: "Yes, in most cases the resulting PNG will be larger in byte size than the original WebP file. WebP uses modern predictive lossy or lossless compression algorithms specifically designed to minimize web transmission bytes, whereas PNG uses Deflate (LZ77 + Huffman) encoding optimized for lossless fidelity and broad software compatibility rather than minimal payload size."
      }
    ],
    relatedConverters: [],
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
    about: "Web developers, performance engineers, and SEO specialists convert bulky PNG assets to modern WebP format to dramatically reduce website bandwidth, improve Google Core Web Vitals (specifically Largest Contentful Paint - LCP and Cumulative Layout Shift - CLS), and pass Google PageSpeed Insights audits (\"Serve images in next-gen formats\"). WebP combines predictive block coding from VP8 with arithmetic entropy coding to deliver 26% smaller file sizes than lossless PNGs and 70% to 85% smaller file sizes in lossy mode at equivalent perceptual clarity. ConvertSheet provides real-time client-side conversion directly in your browser memory with full alpha transparency preservation and adjustable quality controls.",
    howTo: [
      { step: 1, title: "Upload PNG", description: "Drop your transparent or solid PNG image into the workspace." },
      { step: 2, title: "Adjust Quality", description: "Use the quality slider to balance maximum compression with visual clarity." },
      { step: 3, title: "Download WebP", description: "Save your lightweight WebP asset ready for instant production deployment." }
    ],
    faqs: [
      {
        question: "How much file size do I save by converting PNG to WebP?",
        answer: "Lossless WebP images are typically 26% smaller than standard PNGs, while lossy WebP at 80%-85% quality can slash file sizes by 70% to 85% with zero perceptible loss in visual quality on high-density displays."
      },
      {
        question: "How does converting PNG to WebP improve Google Core Web Vitals and SEO?",
        answer: "Images account for over 60% of average web page weight. Heavy PNG files delay Largest Contentful Paint (LCP) and cause poor PageSpeed scores. Converting PNG to lightweight WebP drastically accelerates asset downloads over mobile networks, helping your pages satisfy Google's Core Web Vitals benchmarks and improve organic search rankings."
      },
      {
        question: "Are WebP images supported across all modern browsers and devices?",
        answer: "Yes! WebP has universal browser support across Google Chrome, Apple Safari (iOS 14+ and macOS Big Sur+), Mozilla Firefox, Microsoft Edge, and Opera, covering more than 97% of worldwide web users."
      },
      {
        question: "Does converting PNG to WebP keep transparency intact?",
        answer: "Yes. WebP provides complete support for 8-bit alpha transparency in both lossless and lossy compression modes, unlike JPEG which forces transparent areas onto solid white or black backgrounds."
      },
      {
        question: "What is the recommended quality setting when converting PNG to WebP for websites?",
        answer: "For photographs and complex illustrations, an 80% to 85% quality setting offers the optimal balance between dramatic file size reduction (often 75%+ smaller) and pristine visual quality. For UI icons, logos, and line art with sharp edges, using 90%-95% or lossless mode ensures zero compression artifacts."
      },
      {
        question: "Can I batch convert multiple PNGs to WebP with ConvertSheet?",
        answer: "Yes! You can upload and batch convert multiple PNG files simultaneously. ConvertSheet processes all files locally in parallel using client-side browser threads and lets you download the complete set as a single ZIP archive."
      },
      {
        question: "Why is ConvertSheet preferred over cloud-based PNG to WebP converters?",
        answer: "ConvertSheet executes 100% within your local browser memory using client-side APIs. Your images are never uploaded to remote cloud servers, ensuring strict compliance with data privacy regulations, eliminating upload latency, and removing daily conversion limits."
      }
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
  },

  "image-resizer": {
    slug: "image-resizer",
    name: "Free Image Resizer",
    category: "utility",
    title: "Image Resizer Online Free - Resize Images & Photos in Pixels",
    subtitle: "Resize photos, graphics, and social media banners to exact pixel dimensions with lockable aspect ratio and 100% in-browser privacy.",
    metaDescription: "Free online image resizer. Resize JPG, PNG, and WebP images to custom dimensions in pixels or percentages with zero server uploads and zero quality loss.",
    answerSummary: "Resize images to custom width and height pixel dimensions with lockable aspect ratios and preset dimensions (YouTube thumbnail, Instagram story, Passport photo) directly in your browser.",
    badge: "Most Popular",
    featured: true,
    keywords: [
      "image resizer",
      "resize image online",
      "resize photo in pixels",
      "free image resizer",
      "passport photo resizer",
      "youtube thumbnail resizer",
      "social media banner resizer"
    ],
    formulaDescription: "Calculates new canvas dimensions based on aspect ratio constraints and resamples source pixel arrays using high-quality bi-cubic browser canvas interpolation.",
    about: "Whether you need to fit photo requirements for government visa portals, social media banners, or web page hero containers, resizing images should be fast and private. ConvertSheet's Image Resizer runs 100% locally in your browser memory using HTML5 Canvas. Your personal photos, business graphics, and confidential documents are never sent across the internet.",
    howTo: [
      { step: 1, title: "Select Photo", description: "Choose or drag and drop your image into the workspace." },
      { step: 2, title: "Adjust Dimensions", description: "Choose common presets (e.g. YouTube thumbnail, Instagram square) or enter custom width and height." },
      { step: 3, title: "Download Resized Image", description: "Click download to save your resized JPG, PNG, or WebP photo immediately." }
    ],
    faqs: [
      { question: "Can I lock the aspect ratio while resizing?", answer: "Yes! By default, the aspect ratio is locked to prevent stretching. You can unlock it at any time to enter independent width and height." },
      { question: "Are my photos uploaded to any external server?", answer: "No. All canvas rendering and resizing occurs directly within your web browser. Zero bytes leave your device." },
      { question: "What image formats are supported?", answer: "You can resize JPG, JPEG, PNG, WebP, and SVG files up to 50MB." }
    ],
    relatedConverters: ["jpg-to-png", "png-to-jpg"],
    relatedTools: ["image-compressor", "webp-to-png", "svg-to-png"]
  }
};
