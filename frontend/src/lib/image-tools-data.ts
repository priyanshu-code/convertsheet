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
    relatedTools: ["png-to-webp", "svg-to-png"]
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
