import { ToolConfig } from "@/types/tool";

export const AI_VISION_TOOLS: Record<string, ToolConfig> = {
  "white-background-passport-photo": {
    slug: "white-background-passport-photo",
    name: "Passport Photo with White Background",
    category: "data-developer", // or general media
    title: "Passport Photo Maker with White Background - Free & Instant",
    subtitle: "Turn any home selfie or portrait into an official passport or visa photo with a plain white background and precise dimensions.",
    metaDescription: "Make passport size photos with white background online for free. AI automatically crops your face, replaces cluttered backgrounds with solid white or blue, and fits standard 35x45mm and 2x2 inch requirements.",
    answerSummary: "Create compliant white background passport photos instantly. Our AI isolates your face, removes shadows, and applies official 35x45mm (India/EU/UK) or 2x2 inch (US Visa) formats with zero watermark.",
    badge: "Government Form Ready",
    featured: true,
    keywords: [
      "white background passport photo",
      "passport size photo with white background",
      "passport photo background remover",
      "change background of passport photo to white",
      "passport photo online free",
      "35mm x 45mm white background",
      "2x2 inch us visa photo"
    ],
    about: "Government portals, visa embassies, and passport agencies strictly require photos with an even, plain white or off-white background. Submitting photos taken against household walls or uneven lighting often leads to rejection. ConvertSheet's AI Passport Photo Tool automatically detects your portrait, removes the background with sub-pixel edge precision around hair, and centers your face according to biometric passport standards. Processed photos are automatically deleted from GPU servers after 20 minutes for total privacy.",
    howTo: [
      { step: 1, title: "Select Country & Format", description: "Choose your destination specifications: standard 3.5 x 4.5 cm (India, UK, Europe, Australia) or 2 x 2 inch (US Passport & Visa)." },
      { step: 2, title: "Upload Your Photo", description: "Upload any clear selfie, camera picture, or scan taken against any wall." },
      { step: 3, title: "Instant AI Transformation", description: "The neural matting model extracts your portrait, applies an official white backdrop, and centers your face." },
      { step: 4, title: "Download Portal-Ready File", description: "Download your clean, high-resolution JPEG ready for online submission or 4x6 print grids." }
    ],
    faqs: [
      { question: "Can I use a photo taken with my smartphone at home?", answer: "Yes! As long as your face is evenly lit without harsh shadows across your eyes or nose, our AI will automatically remove the room background and replace it with official white." },
      { question: "What dimensions are used for India and Europe passport photos?", answer: "Standard passport photos for India, the UK, Europe, Australia, and Pakistan are 35mm wide by 45mm tall (3.5 x 4.5 cm), with your face occupying 70% to 80% of the frame height." },
      { question: "Are my uploaded personal photos stored or shared?", answer: "Never. All uploaded portraits are processed strictly in ephemeral GPU memory and permanently purged within 20 minutes." }
    ],
    relatedConverters: ["jpg-to-pdf", "png-to-jpg"],
    relatedTools: ["unblur-face", "ai-photo-enhancer", "image-resizer"]
  },

  "unblur-face": {
    slug: "unblur-face",
    name: "AI Face Unblur & Restoration",
    category: "data-developer",
    title: "Unblur Face Online - AI Face Detail & Clarity Restorer",
    subtitle: "Bring blurry, out-of-focus, or vintage portraits back to life. AI reconstructs facial features, eyes, and skin textures in seconds.",
    metaDescription: "Unblur faces in photos online for free. Powered by deep learning face restoration models (GFPGAN), sharpen blurry eyes, restore old family pictures, and fix motion shake instantly.",
    answerSummary: "Restore blurred and out-of-focus faces with AI. Upload your photo to reconstruct clear facial details, eyes, and teeth with realistic, natural skin textures.",
    badge: "Neural AI",
    featured: true,
    keywords: [
      "unblur face online",
      "unblur face",
      "face restoration ai",
      "fix blurry faces in photos",
      "restore old blurry photos",
      "gfpgan unblur",
      "sharpen face online"
    ],
    about: "Camera shake, low light, compression, and vintage film degradation frequently ruin great portrait memories. Standard sharpening algorithms only amplify noise and grain. ConvertSheet utilizes state-of-the-art Generative Facial Prior models (GFPGAN) to intelligently synthesize missing facial features—restoring eyes, pupil reflections, teeth, and natural skin pores while eliminating motion blur. All operations execute on high-speed GPU queues with ephemeral 20-minute data purging.",
    howTo: [
      { step: 1, title: "Upload Blurry Portrait", description: "Select the photo containing blurry, pixelated, or compressed faces from your computer or phone." },
      { step: 2, title: "Set Fidelity Level", description: "Adjust the restoration fidelity slider (default 75%) to balance between natural vintage character and ultra-sharp clarity." },
      { step: 3, title: "Inspect with Interactive Slider", description: "Drag the before/after comparison slider to see the restored eyes and features before saving." },
      { step: 4, title: "Download in High Resolution", description: "Save your crystal-clear restored portrait in original format with zero watermarks." }
    ],
    faqs: [
      { question: "Can this unblur multiple faces in a group photo?", answer: "Yes! The neural face detector locates every individual face in the photo and restores each one independently." },
      { question: "Does the AI change how the person actually looks?", answer: "No. GFPGAN uses facial landmark priors to preserve the authentic identity and geometry of the person, only reconstructing fine details that were blurred out." },
      { question: "Is this free to use without a watermark?", answer: "Yes, you can restore and download your photos completely free with zero watermarks." }
    ],
    relatedConverters: ["png-to-jpg", "webp-to-jpg"],
    relatedTools: ["ai-photo-enhancer", "white-background-passport-photo", "image-resizer"]
  },

  "ai-photo-enhancer": {
    slug: "ai-photo-enhancer",
    name: "AI Photo Enhancer & Upscaler",
    category: "data-developer",
    title: "AI Photo Enhancer Online - 4x Super-Resolution Upscaler",
    subtitle: "Multiply photo resolution by 400% without losing quality. Reconstruct crisp textures and sharp edges from small images.",
    metaDescription: "Free AI photo enhancer and image upscaler. Upscale photos to 4K resolution using Real-ESRGAN neural networks. Fix pixelation, sharpen soft edges, and download in seconds.",
    answerSummary: "Upscale photos up to 4x using Real-ESRGAN neural networks. Enlarge small thumbnails, e-commerce graphics, and scenery into sharp, print-ready high-definition images.",
    badge: "4K Super-Res",
    featured: true,
    keywords: [
      "ai photo enhancer",
      "photo enhancer online",
      "image upscaler 4x",
      "ai super resolution",
      "enhance photo quality",
      "real esrgan online",
      "fix low resolution photos"
    ],
    about: "When you enlarge a standard digital photo, traditional bilinear or bicubic interpolation simply stretches pixels, creating a blurry, jagged mess. ConvertSheet's AI Photo Enhancer runs deep Residual Dense Networks (Real-ESRGAN) to hallucinate natural photographic textures, smooth gradient fills, and sharp high-frequency edges. Transform compressed 400px thumbnails into glorious 1600px+ high-definition images suitable for desktop wallpapers and high-DPI printing.",
    howTo: [
      { step: 1, title: "Upload Low-Res Image", description: "Drop any thumbnail, downloaded graphic, or compressed photo into the upload area." },
      { step: 2, title: "Select Upscale Factor", description: "Choose 2x (double resolution) or 4x (quadruple resolution) depending on your target dimensions." },
      { step: 3, title: "Interactive Quality Comparison", description: "Slide across the interactive viewport to compare pixel density and edge sharpness." },
      { step: 4, title: "Download Ultra-HD Photo", description: "Export your enhanced image in lossless PNG or compressed high-Q JPEG." }
    ],
    faqs: [
      { question: "How does AI upscaling differ from regular resizing?", answer: "Standard resizing only stretches existing pixels and blurs gaps. Real-ESRGAN neural upscaling analyzes image patterns and creates new, realistic micro-details that look authentic." },
      { question: "What is the maximum output resolution?", answer: "The upscaler comfortably supports outputs up to 4096 x 4096 pixels with 512-tile seamless GPU tiling." },
      { question: "Is there any cost or subscription required?", answer: "No, free users can upscale images directly in their browser without watermarks." }
    ],
    relatedConverters: ["webp-to-png", "jpg-to-png"],
    relatedTools: ["unblur-face", "white-background-passport-photo", "image-resizer"]
  },

  "unblur-image": {
    slug: "unblur-image",
    name: "AI Image & Face Unblur Tool",
    category: "data-developer",
    title: "Unblur Image Online - AI Photo Sharpener & Deblur Tool",
    subtitle: "Clear up out-of-focus, blurry, or low-resolution images in one click using neural AI restoration.",
    metaDescription: "Unblur images online for free. Fix motion blur, camera shake, and out-of-focus portraits with AI deep learning models. Instant before/after comparison.",
    answerSummary: "Fix blurred photos instantly with AI. Our neural restorer sharpens soft edges, reconstructs missing pixel details, and restores crystal clarity without watermarks.",
    badge: "AI Sharpener",
    featured: true,
    keywords: ["unblur image", "unblur photo online", "fix blurry picture", "deblur image", "sharpen image online", "clear blurry photo"],
    about: "Fixing blurry pictures used to require expensive desktop photo editing software with clumsy unsharp masks. ConvertSheet's AI Image Unblur tool runs state-of-the-art neural restoration models directly through high-speed GPU queues to recover lost details, sharpen soft edges, and clean up motion blur. Images are automatically removed from our servers after 20 minutes.",
    howTo: [
      { step: 1, title: "Select Blurry Photo", description: "Upload the out-of-focus or blurry image from your phone or computer." },
      { step: 2, title: "Apply AI Unblur", description: "Our neural network detects blurred regions and reconstructs high-frequency details." },
      { step: 3, title: "Compare & Download", description: "Slide across the interactive viewport to inspect the sharp result and download your photo." }
    ],
    faqs: [
      { question: "Can it fix motion blur from moving objects?", answer: "Yes, our neural models are trained to reverse motion blur and optical focus defects." },
      { question: "Is my photo kept private?", answer: "Yes, all uploaded images are processed in-memory and automatically deleted after 20 minutes." }
    ],
    relatedConverters: ["png-to-jpg", "webp-to-jpg"],
    relatedTools: ["unblur-face", "ai-photo-enhancer", "white-background-passport-photo"]
  },

  "speech-to-text": {
    slug: "speech-to-text",
    name: "AI Speech to Text Converter",
    category: "data-developer",
    title: "Speech to Text Online - Free Audio & Video Transcriber",
    subtitle: "Transcribe audio and video to text in seconds using Whisper Large-v3-Turbo and Parakeet-TDT. Accurate timestamps, SRT/VTT subtitles, and 99+ languages.",
    metaDescription: "Free online speech to text transcription. Transcribe MP3, WAV, M4A, and MP4 files into clean text, SRT/VTT subtitles, and JSON using Whisper Large-v3-Turbo and NeMo Parakeet.",
    answerSummary: "Transcribe speech to text automatically. Upload audio or record live to get accurate text transcripts, interactive timestamps, and downloadable SRT/VTT subtitles with zero watermarks.",
    badge: "Whisper Large-v3-Turbo",
    featured: true,
    keywords: [
      "speech to text",
      "audio to text",
      "transcribe audio online",
      "voice to text converter",
      "whisper speech to text",
      "video to text transcript",
      "free transcription tool"
    ],
    about: "Manual transcription is tedious and time-consuming. ConvertSheet's Speech-to-Text tool combines Sherpa-ONNX Parakeet-TDT v3 for sub-second English transcription with Whisper Large-v3-Turbo for world-class punctuation and multi-lingual accuracy across 99+ languages. Upload voice notes, interviews, lectures, or record straight from your microphone to generate formatted transcripts and SRT subtitle files instantly.",
    howTo: [
      { step: 1, title: "Upload or Record", description: "Select an audio/video file (MP3, WAV, M4A, MP4) or record directly from your microphone." },
      { step: 2, title: "Choose Engine Mode", description: "Pick Fast Lane (Parakeet) for 250ms speed or Multilingual (Whisper) for international language support." },
      { step: 3, title: "Review & Format", description: "Toggle between clean continuous text and timestamped segment views." },
      { step: 4, title: "Export Transcript", description: "Copy with one click or download as .txt or .srt subtitle files." }
    ],
    faqs: [
      { question: "What audio formats are supported?", answer: "We support MP3, WAV, M4A, AAC, FLAC, OGG, WebM, MP4, and MOV files up to 100MB. Audio tracks are extracted automatically from video files." },
      { question: "Can I transcribe languages other than English?", answer: "Yes! Whisper Large-v3-Turbo supports 99+ languages including Hindi, Hinglish, Spanish, French, German, Mandarin, Portuguese, and Arabic with automatic language detection or explicit selection." },
      { question: "Can I download SRT and VTT subtitles for YouTube or Reels?", answer: "Yes, clicking the SRT or VTT buttons downloads industry-standard subtitle files with millisecond timestamps ready for YouTube, TikTok, and Premiere Pro." },
      { question: "Can I click timestamps to jump in the audio player?", answer: "Yes, clicking any timestamp in the Timestamps view immediately seeks and plays that exact audio moment for effortless proofreading." }
    ],
    relatedConverters: ["markdown-to-excel", "csv-to-excel"],
    relatedTools: ["text-to-speech", "json-formatter-validator"]
  },

  "text-to-speech": {
    slug: "text-to-speech",
    name: "AI Text to Speech Generator",
    category: "data-developer",
    title: "AI Text to Speech Online - Lifelike Voice Generator",
    subtitle: "Convert text into realistic, studio-quality human voices in seconds. Powered by Kokoro-82M with 10 American and British voice accents.",
    metaDescription: "Free AI text to speech online. Generate natural human voices from text using Kokoro-82M. Download MP3 audio for videos, podcasts, and audiobooks with zero sign-up.",
    answerSummary: "Generate natural speech from text. Choose from 10 studio voice presets across American and British accents with adjustable speaking rates and instant MP3 download.",
    badge: "Kokoro Studio Voices",
    featured: true,
    keywords: [
      "text to speech",
      "ai voice generator",
      "text to voice online",
      "free tts converter",
      "kokoro tts",
      "realistic text to speech",
      "generate voice from text"
    ],
    about: "Transform written scripts, blog posts, stories, and educational content into broadcast-grade natural spoken audio. ConvertSheet's Text-to-Speech tool leverages Kokoro-82M neural synthesis models to produce expressive, human-like voice cadences without robotic monotony. Choose from 10 distinct male and female personalities across American and British accents with full control over playback tempo.",
    howTo: [
      { step: 1, title: "Enter Your Text", description: "Type, paste, or select a sample prompt up to 15,000 characters." },
      { step: 2, title: "Choose Voice & Accent", description: "Select from 10 studio voices (Heart, Bella, Adam, Michael, Emma, George) and adjust speaking speed." },
      { step: 3, title: "Synthesize Audio", description: "Click Generate to synthesize lifelike speech in under one second." },
      { step: 4, title: "Listen & Download", description: "Preview using the built-in audio player and download your high-bitrate MP3." }
    ],
    faqs: [
      { question: "Is this voice synthesizer free to use?", answer: "Yes! You can generate speech from text completely free with zero subscription requirements or watermarks." },
      { question: "Can I use the generated audio for YouTube and commercial projects?", answer: "Yes, generated audio is royalty-free for your personal, commercial, YouTube, and podcast projects." },
      { question: "What is the maximum length of text I can synthesize at once?", answer: "You can convert up to 15,000 characters (approximately 2,500 words or 15 minutes of speech) in a single generation." }
    ],
    relatedConverters: ["json-to-excel"],
    relatedTools: ["speech-to-text", "unblur-face"]
  },

  "ai-content-detector": {
    slug: "ai-content-detector",
    name: "AI Content & Text Detector",
    category: "data-developer",
    title: "AI Content Detector - Free ChatGPT & AI Text Checker",
    subtitle: "Detect ChatGPT, GPT-4, Claude, and Gemini generated text with high accuracy. Sentence-by-sentence perplexity analysis and burstiness scoring.",
    metaDescription: "Free online AI content detector. Check essays, articles, and copy for ChatGPT, GPT-4, and Claude patterns with instant sentence-level highlighting and probability scores.",
    answerSummary: "Detect AI-generated text instantly. Paste any paragraph or essay to analyze perplexity and structural entropy with sentence-by-sentence color highlighting and zero signups.",
    badge: "GPT-4 & Claude",
    featured: true,
    keywords: [
      "ai content detector",
      "chatgpt detector",
      "ai text checker",
      "detect ai writing",
      "free ai checker",
      "gpt-4 detector online",
      "plagiarism and ai detector"
    ],
    about: "ConvertSheet's AI Content Detector helps educators, writers, students, and SEO professionals identify machine-generated text from models like ChatGPT, GPT-4o, Claude 3.5, and Gemini. By evaluating lexical diversity, burstiness, and token perplexity across individual sentences, our detector highlights robotic phrasing while minimizing false positives on natural human writing.",
    howTo: [
      { step: 1, title: "Paste Your Text", description: "Enter any article, essay, or copy with at least 15 words into the detection box." },
      { step: 2, title: "Choose Scan Mode", description: "Select Standard Classifier for fast checks or Deep Scan for multi-feature structural consensus." },
      { step: 3, title: "Review Score & Highlights", description: "Inspect the overall AI percentage gauge and click individual sentences to see granular probability scores." },
      { step: 4, title: "Copy or Export", description: "Copy the full audit report with one click for academic or editorial verification." }
    ],
    faqs: [
      { question: "How accurate is the AI Content Detector?", answer: "Our multi-layer classifier evaluates statistical burstiness and perplexity, achieving over 98% accuracy on standard ChatGPT and LLM-generated prose." },
      { question: "Will my text be stored or used to train AI models?", answer: "No. All text is analyzed strictly in temporary memory and never stored or retained on any server." },
      { question: "Can it distinguish between hybrid or paraphrased text?", answer: "Yes, our sentence-by-sentence analysis specifically identifies sections that were human-written versus machine-generated." }
    ],
    relatedConverters: ["json-to-excel", "csv-to-excel"],
    relatedTools: ["speech-to-text", "text-to-speech"]
  },

  "ai-text-detector": {
    slug: "ai-text-detector",
    name: "AI Text Checker",
    category: "data-developer",
    title: "AI Text Detector Online - Check ChatGPT Writing Free",
    subtitle: "Identify AI generated copy, essays, and articles with sentence-by-sentence probability scores.",
    metaDescription: "Check if text was written by AI or a human. Instant free AI text detector with sentence highlighting and zero character limits.",
    answerSummary: "Check text for AI writing patterns with sentence-level analysis and probability metrics.",
    badge: "Free Scanner",
    featured: false,
    keywords: ["ai text detector", "check if text is ai", "chatgpt checker", "ai writing analyzer"],
    about: "Identify algorithmic text patterns and verify original human writing with our fast online AI text detector.",
    howTo: [
      { step: 1, title: "Paste Text", description: "Paste text into the scanner." },
      { step: 2, title: "Run Analysis", description: "Click Scan for AI Content." },
      { step: 3, title: "View Verdict", description: "Check probability gauge and sentence colors." }
    ],
    faqs: [
      { question: "Is this tool completely free?", answer: "Yes, 100% free with unlimited scans." },
      { question: "Can it detect text from ChatGPT and Claude?", answer: "Yes, our algorithm analyzes perplexity and burstiness patterns common to large language models including ChatGPT, GPT-4, and Claude." }
    ],
    relatedConverters: ["json-to-excel"],
    relatedTools: ["ai-content-detector", "speech-to-text"]
  },

  "pdf-to-markdown": {
    slug: "pdf-to-markdown",
    name: "PDF to Markdown Converter & OCR",
    category: "data-developer",
    title: "PDF to Markdown Online - Clean OCR & Table Extractor",
    subtitle: "Convert PDFs, scanned documents, and images to clean GitHub-Flavored Markdown. Auto-reconstruct tables, headings, and code blocks.",
    metaDescription: "Free online PDF to Markdown converter. Convert PDF documents and scanned pages into clean GFM Markdown with tables, layout preservation, and OCR text extraction.",
    answerSummary: "Convert PDF documents to clean Markdown with full table reconstruction, heading hierarchies, and OCR support for scanned pages with zero formatting loss.",
    badge: "Docling + OCR",
    featured: true,
    keywords: [
      "pdf to markdown",
      "convert pdf to md",
      "pdf to gfm",
      "ocr pdf to text",
      "scanned pdf to markdown",
      "extract tables from pdf",
      "document to markdown"
    ],
    about: "Converting PDFs and scanned contracts into structured Markdown is critical for LLM ingestion, technical documentation, and static site generators. ConvertSheet's PDF to Markdown tool combines fast text-stream parsing with deep OCR layout comprehension. It automatically recognizes headings, bullet points, blockquotes, code fences, and formats complex tabular data into clean GitHub-Flavored Markdown grids.",
    howTo: [
      { step: 1, title: "Upload Document", description: "Select a PDF, DOCX, or scanned image file (PNG, JPG, TIFF) up to 50MB." },
      { step: 2, title: "Configure Settings", description: "Choose Fast Stream for digital PDFs or Deep Scan OCR for scanned pages, and toggle table formatting." },
      { step: 3, title: "Extract Markdown", description: "Click Extract to parse the layout and reconstruct tables into clean text." },
      { step: 4, title: "Preview & Download", description: "Switch between Formatted Preview and Raw Markdown, then download your .md file or copy to clipboard." }
    ],
    faqs: [
      { question: "Does this tool support scanned or image-only PDFs?", answer: "Yes! Our Deep Scan mode utilizes optical character recognition (OCR) and layout analysis to extract text and tables from image-only scans." },
      { question: "Are complex tables preserved accurately?", answer: "Yes, tables are automatically parsed into standard GitHub-Flavored Markdown pipe-separated tables with aligned headers and cells." },
      { question: "What formats can I upload?", answer: "You can upload PDF, DOCX, XLSX, PPTX, PNG, JPG, JPEG, TIFF, and HTML files." }
    ],
    relatedConverters: ["pdf-to-excel", "markdown-to-excel"],
    relatedTools: ["sheet-diff-checker", "sql-query-studio"]
  },

  "document-to-markdown": {
    slug: "document-to-markdown",
    name: "Document to Markdown OCR",
    category: "data-developer",
    title: "Document to Markdown Converter - Extract Clean Text & Tables",
    subtitle: "Convert documents and images into structured Markdown for documentation and AI prompts.",
    metaDescription: "Convert any document or scanned image into clean formatted Markdown with table support.",
    answerSummary: "Extract clean Markdown from documents, scans, and spreadsheets.",
    badge: "Markdown OCR",
    featured: false,
    keywords: ["document to markdown", "doc to md", "scan to markdown", "ocr to markdown"],
    about: "Transform documents into structured Markdown for documentation, knowledge bases, and LLM context.",
    howTo: [
      { step: 1, title: "Upload", description: "Upload your document or image." },
      { step: 2, title: "Convert", description: "Click Extract Clean Markdown." },
      { step: 3, title: "Download", description: "Download or copy the markdown output." }
    ],
    faqs: [
      { question: "Are documents stored on servers?", answer: "No, files are processed in ephemeral memory and discarded immediately." },
      { question: "Does OCR work on scanned images and invoices?", answer: "Yes, Deep Scan OCR processes scanned pages, photos, and invoices into structured Markdown with preserved tables and headers." }
    ],
    relatedConverters: ["pdf-to-excel", "markdown-to-excel"],
    relatedTools: ["pdf-to-markdown", "pdf-table-extractor"]
  },

  "audio-noise-reducer": {
    slug: "audio-noise-reducer",
    name: "AI Audio Noise Reducer",
    category: "data-developer",
    title: "Audio Noise Reducer Online - Clean Background Noise Free",
    subtitle: "Remove background hiss, fan hum, traffic noise, and room echo from audio recordings using DeepFilterNet 3 neural suppression.",
    metaDescription: "Free online audio noise remover. Clean background noise, microphone hiss, fan hum, and wind from voice recordings and podcasts using DeepFilterNet 3.",
    answerSummary: "Remove background noise from audio recordings automatically. Clean microphone hiss, traffic hum, and room reverb to get studio-quality voice recordings with zero quality loss.",
    badge: "DeepFilterNet 3",
    featured: true,
    keywords: [
      "audio noise reducer",
      "remove background noise from audio",
      "clean audio online",
      "denoise voice recording",
      "microphone hiss remover",
      "remove fan noise from audio",
      "free noise reduction tool"
    ],
    about: "Background hum, computer fans, air conditioners, and street traffic ruin podcast episodes, voiceovers, and interview recordings. ConvertSheet's AI Audio Noise Reducer uses DeepFilterNet 3 deep neural networks to isolate human speech frequencies while suppressing ambient noise up to 100 dB. Listen to side-by-side before and after comparisons and export studio-clarity audio in lossless quality.",
    howTo: [
      { step: 1, title: "Upload Audio", description: "Select any voice recording or podcast file in MP3, WAV, M4A, or FLAC format." },
      { step: 2, title: "Select Suppression Level", description: "Choose Subtle (20 dB), Medium (50 dB), or Maximum (100 dB) suppression depending on noise intensity." },
      { step: 3, title: "Process Audio", description: "Click Clean & Isolate Voice to run neural filtering in under 3 seconds." },
      { step: 4, title: "Compare & Download", description: "Play before and after tracks simultaneously and download your cleaned studio-quality audio file." }
    ],
    faqs: [
      { question: "What types of noise can this tool remove?", answer: "DeepFilterNet removes continuous background noise including air conditioner hum, desk fans, computer fans, traffic noise, microphone static, and room reverberation." },
      { question: "Does noise reduction degrade vocal clarity?", answer: "No. Unlike traditional frequency notch filters that make voices sound hollow or tinny, our deep learning model reconstructs full harmonic vocal frequencies." },
      { question: "What audio formats are supported?", answer: "We support MP3, WAV, M4A, AAC, FLAC, OGG, and WebM up to 100MB." }
    ],
    relatedConverters: ["json-to-excel", "csv-to-excel"],
    relatedTools: ["speech-to-text", "text-to-speech"]
  },

  "clean-audio": {
    slug: "clean-audio",
    name: "Clean Audio Voice Enhancer",
    category: "data-developer",
    title: "Clean Audio Online - Free Background Noise Remover",
    subtitle: "Clean up noisy audio recordings and remove microphone hum instantly.",
    metaDescription: "Clean audio recordings online. Remove hum, hiss, and echo from podcasts and voice clips.",
    answerSummary: "Remove noise and clean audio clips for podcasts, meetings, and voiceovers.",
    badge: "DeepFilter",
    featured: false,
    keywords: ["clean audio", "clean voice recording", "audio cleaner online", "denoise mp3"],
    about: "Remove distracting background noise and clean up voice recordings with one click.",
    howTo: [
      { step: 1, title: "Upload Audio", description: "Upload your noisy audio file." },
      { step: 2, title: "Clean", description: "Click Clean & Isolate Voice." },
      { step: 3, title: "Download", description: "Download your enhanced audio." }
    ],
    faqs: [
      { question: "Is this voice cleaner free?", answer: "Yes, completely free with no watermarks." },
      { question: "What formats can I clean?", answer: "You can upload and denoise MP3, WAV, M4A, AAC, FLAC, and WebM audio files up to 100MB." }
    ],
    relatedConverters: ["json-to-excel", "csv-to-excel"],
    relatedTools: ["audio-noise-reducer", "speech-to-text"]
  },

  "video-compressor": {
    slug: "video-compressor",
    name: "AI Video Compressor & Optimizer",
    category: "data-developer",
    title: "Video Compressor Online - Compress Video to Target MB Free",
    subtitle: "Compress MP4, MOV, and MKV videos to exact target sizes for Discord (25MB), WhatsApp (16MB), and Email (20MB) with zero visual quality loss.",
    metaDescription: "Free online video compressor. Reduce MP4 video size to exact MB limits for WhatsApp, Discord, and Email with two-pass hardware encoding and zero watermarks.",
    answerSummary: "Compress video files to exact target sizes in seconds. Select Discord (25MB), WhatsApp (16MB), or custom MB targets with H.264, HEVC, and AV1 encoding.",
    badge: "Hardware NVENC",
    featured: true,
    keywords: [
      "video compressor",
      "compress video for discord",
      "compress video for whatsapp",
      "reduce mp4 file size",
      "compress video to 25mb",
      "compress video online free",
      "video size reducer"
    ],
    about: "Sharing video clips across Discord, WhatsApp, Slack, and email is constantly blocked by strict attachment limits (16MB for WhatsApp, 25MB for Discord free tier). ConvertSheet's Video Compressor uses intelligent two-pass variable bitrate encoding (VBR) with hardware NVENC acceleration. Enter any target megabyte ceiling to compress your video to fit the exact constraint while preserving crisp 1080p audio and video fidelity.",
    howTo: [
      { step: 1, title: "Upload Video", description: "Select any MP4, MOV, AVI, or MKV video file up to 2GB." },
      { step: 2, title: "Choose Target Size", description: "Select a preset (Discord 25MB, WhatsApp 16MB, Email 20MB) or drag the custom MB slider." },
      { step: 3, title: "Configure Codec", description: "Optionally cap resolution at 1080p, 720p, or switch between H.264, HEVC, and AV1." },
      { step: 4, title: "Compress & Download", description: "Click compress to generate your stream-optimized FastStart MP4." }
    ],
    faqs: [
      { question: "What is the maximum file size I can upload?", answer: "You can compress videos up to 2GB in size." },
      { question: "Will my video have any watermark?", answer: "No. All video tools on ConvertSheet are 100% free with zero watermarks or branding." },
      { question: "How does it hit the exact MB target?", answer: "We calculate the exact mathematical audio and video bitrate budget over the video duration, then apply two-pass rate control." }
    ],
    relatedConverters: ["compress-pdf", "compress-image"],
    relatedTools: ["youtube-downloader", "auto-subtitle-generator"]
  },

  "compress-video": {
    slug: "compress-video",
    name: "Compress Video to Target MB",
    category: "data-developer",
    title: "Compress Video Online - Reduce MP4 Size Free",
    subtitle: "Reduce video file sizes to exact target MB for Discord, WhatsApp, and Web.",
    metaDescription: "Compress video files online for free. Hit exact file size limits for social media and messaging apps.",
    answerSummary: "Reduce video file size online with two-pass rate control.",
    badge: "Free Compressor",
    featured: false,
    keywords: ["compress video", "reduce video size", "compress mp4", "video mb reducer"],
    about: "Fast and private video compression to fit email, WhatsApp, and messaging limits.",
    howTo: [
      { step: 1, title: "Upload Video", description: "Select your video file." },
      { step: 2, title: "Set Size", description: "Pick your target megabyte size." },
      { step: 3, title: "Download", description: "Save the compressed MP4." }
    ],
    faqs: [
      { question: "Is this free?", answer: "Yes, 100% free with no limits." }
    ],
    relatedConverters: ["compress-image"],
    relatedTools: ["video-compressor", "auto-subtitle-generator"]
  },

  "youtube-downloader": {
    slug: "youtube-downloader",
    name: "YouTube Video & MP3 Downloader",
    category: "data-developer",
    title: "YouTube Downloader - Download 1080p Video & MP3 Free",
    subtitle: "Download YouTube videos, Shorts, and music in HD 1080p MP4 or high-bitrate 320kbps MP3 audio with instant metadata preview.",
    metaDescription: "Free online YouTube downloader. Save YouTube videos and Shorts in 1080p MP4 or convert YouTube to MP3 audio in seconds without annoying popups or ads.",
    answerSummary: "Download YouTube videos in 1080p MP4 or convert to MP3 audio. Paste any YouTube or Shorts link for instant download with zero watermarks.",
    badge: "1080p & MP3",
    featured: true,
    keywords: [
      "youtube downloader",
      "download youtube video",
      "youtube to mp3",
      "download youtube shorts",
      "youtube video saver",
      "free youtube to mp4",
      "convert youtube to mp3 320kbps"
    ],
    about: "ConvertSheet's YouTube Downloader lets you save YouTube videos, podcasts, and Shorts in pristine 1080p Full HD MP4 or extract audio tracks into 320kbps MP3. Simply paste any YouTube URL to instantly preview the video thumbnail, author, and duration, then download directly to your phone, tablet, or desktop with no intrusive popups or software installation.",
    howTo: [
      { step: 1, title: "Paste YouTube Link", description: "Copy and paste the URL of any YouTube video, Shorts, or music track." },
      { step: 2, title: "Choose MP4 or MP3", description: "Select Video (1080p/720p MP4) or Audio Only (320kbps MP3)." },
      { step: 3, title: "Download", description: "Click Download to transcode and save your media file directly to your device." }
    ],
    faqs: [
      { question: "Can I download YouTube Shorts?", answer: "Yes! Simply paste the Shorts link to download high-resolution vertical MP4 videos." },
      { question: "Can I extract MP3 audio?", answer: "Yes, choose the 'Audio Only (MP3)' option to extract crystal-clear 320kbps audio tracks." },
      { question: "Does it work on mobile phones?", answer: "Yes, it works smoothly on iPhones (iOS Safari), Android, Mac, and Windows." }
    ],
    relatedConverters: ["speech-to-text"],
    relatedTools: ["video-compressor", "vocal-remover"]
  },

  "youtube-to-mp3": {
    slug: "youtube-to-mp3",
    name: "YouTube to MP3 Converter",
    category: "data-developer",
    title: "YouTube to MP3 Converter - Free High-Bitrate Audio Ripper",
    subtitle: "Convert YouTube videos and podcasts into high-bitrate 320kbps MP3 audio files in seconds.",
    metaDescription: "Free YouTube to MP3 converter. Extract audio from YouTube videos in high quality 320kbps MP3 with zero registration.",
    answerSummary: "Extract MP3 audio from any YouTube video with one click.",
    badge: "320 kbps MP3",
    featured: false,
    keywords: ["youtube to mp3", "yt to mp3", "youtube audio converter", "rip audio from youtube"],
    about: "Convert YouTube videos and lectures into high-fidelity MP3 audio files.",
    howTo: [
      { step: 1, title: "Paste URL", description: "Paste the YouTube link." },
      { step: 2, title: "Select MP3", description: "Select Audio Only (MP3)." },
      { step: 3, title: "Download", description: "Save the audio track." }
    ],
    faqs: [
      { question: "Is this tool free?", answer: "Yes, completely free with unlimited conversions." }
    ],
    relatedConverters: ["speech-to-text"],
    relatedTools: ["youtube-downloader", "speech-to-text"]
  },

  "instagram-downloader": {
    slug: "instagram-downloader",
    name: "Instagram Reel & Video Downloader",
    category: "data-developer",
    title: "Instagram Downloader - Download Reels, Posts & Stories Free",
    subtitle: "Download Instagram Reels, carousel videos, and audio in high-resolution MP4 without watermarks.",
    metaDescription: "Free online Instagram downloader. Download Instagram Reels, videos, and carousel posts in full HD MP4 with zero login required.",
    answerSummary: "Save Instagram Reels and videos in full HD MP4. Paste any Reel link to download directly with zero watermarks.",
    badge: "Full HD Reels",
    featured: true,
    keywords: [
      "instagram downloader",
      "download instagram reel",
      "instagram reel saver",
      "download instagram video free",
      "ig video downloader",
      "save instagram reels without watermark"
    ],
    about: "Save your favorite Instagram Reels, travel clips, tutorials, and carousel videos in original Full HD quality. ConvertSheet's Instagram Downloader works instantly across all modern browsers without requiring your Instagram login or third-party apps.",
    howTo: [
      { step: 1, title: "Paste Instagram Link", description: "Copy and paste the URL of any Instagram Reel or video post." },
      { step: 2, title: "Preview", description: "Check the preview card and choose Video or Audio format." },
      { step: 3, title: "Save to Device", description: "Click Download to save the MP4 video straight to your camera roll or downloads." }
    ],
    faqs: [
      { question: "Do I need to log into Instagram?", answer: "No login or password is required. Simply paste the public Reel link." },
      { question: "Are videos downloaded without watermarks?", answer: "Yes, all videos are saved in pure original quality with zero added watermarks." }
    ],
    relatedConverters: ["video-compressor"],
    relatedTools: ["youtube-downloader", "video-compressor"]
  },

  "download-instagram-reels": {
    slug: "download-instagram-reels",
    name: "Download Instagram Reels",
    category: "data-developer",
    title: "Download Instagram Reels Online - Free MP4 Reel Saver",
    subtitle: "Save Instagram Reels in high definition without watermarks or app downloads.",
    metaDescription: "Download Instagram Reels in HD MP4. Fast, free, and private Reel downloader.",
    answerSummary: "Download Instagram Reels in HD MP4 directly to your device.",
    badge: "Reels Downloader",
    featured: false,
    keywords: ["download instagram reels", "reels saver", "instagram reel mp4", "save reels"],
    about: "Fast online Instagram Reel saver for mobile and desktop.",
    howTo: [
      { step: 1, title: "Paste Reel Link", description: "Paste the Reel URL." },
      { step: 2, title: "Download", description: "Click Download to save." }
    ],
    faqs: [
      { question: "Is it free?", answer: "Yes, 100% free with unlimited downloads." }
    ],
    relatedConverters: ["video-compressor"],
    relatedTools: ["instagram-downloader", "video-compressor"]
  },

  "vocal-remover": {
    slug: "vocal-remover",
    name: "AI Vocal Remover & Acapella Isolator",
    category: "data-developer",
    title: "Vocal Remover Online - Free AI Acapella & Karaoke Maker",
    subtitle: "Separate vocals and instruments from any song using Demucs v4 neural network. Extract isolated acapellas and clean backing karaoke tracks.",
    metaDescription: "Free online vocal remover. Separate vocals and music from any audio track using AI. Download isolated acapella and karaoke instrumental tracks in WAV/MP3.",
    answerSummary: "Separate vocals and backing music from any song using Demucs AI. Download isolated vocals and karaoke instrumentals with zero bleed.",
    badge: "Demucs v4 Neural",
    featured: true,
    keywords: [
      "vocal remover",
      "remove vocals from song",
      "acapella extractor",
      "karaoke maker online",
      "isolate vocals from audio",
      "free ai vocal separator",
      "stem splitter online"
    ],
    about: "Creating karaoke tracks, music remixes, and acapella samples used to require complex audio engineering software. ConvertSheet's AI Vocal Remover leverages Demucs v4 deep neural models to mathematically separate vocal frequencies from drums, bass, and melodic instruments. Get studio-clean isolated vocals and pristine instrumental backing tracks in lossless quality.",
    howTo: [
      { step: 1, title: "Upload Audio", description: "Select any song in MP3, WAV, FLAC, or M4A format." },
      { step: 2, title: "Choose Mode", description: "Select Vocals + Instrumental (Karaoke) or Full 4-Stem Multitrack split." },
      { step: 3, title: "Separate Stems", description: "Click Isolate to run deep neural frequency separation." },
      { step: 4, title: "Listen & Export", description: "Preview each stem and download your isolated Vocals and Backing Tracks in high quality." }
    ],
    faqs: [
      { question: "Is there any audio bleed between vocals and instruments?", answer: "Demucs v4 is state-of-the-art in source separation, achieving near-zero vocal bleed and pristine instrumental isolation." },
      { question: "Can I download individual stems like drums and bass?", answer: "Yes, select 'Full 4-Stem Split' to extract isolated drums, bass, vocals, and instruments." },
      { question: "Is this tool free?", answer: "Yes, completely free with zero subscription requirements or watermarks." }
    ],
    relatedConverters: ["audio-noise-reducer"],
    relatedTools: ["speech-to-text", "audio-noise-reducer"]
  },

  "isolate-vocals": {
    slug: "isolate-vocals",
    name: "Isolate Vocals from Audio",
    category: "data-developer",
    title: "Isolate Vocals Online - Free AI Acapella Extractor",
    subtitle: "Extract pure human vocals from songs and voice recordings with Demucs AI.",
    metaDescription: "Isolate vocals from music online for free. Clean acapella voice extractor powered by deep learning.",
    answerSummary: "Extract isolated acapella vocals from any song.",
    badge: "Acapella AI",
    featured: false,
    keywords: ["isolate vocals", "extract acapella", "vocal isolation online", "separate voice from music"],
    about: "Extract clean vocal stems from songs and audio recordings for remixes and karaoke.",
    howTo: [
      { step: 1, title: "Upload", description: "Select your audio file." },
      { step: 2, title: "Isolate", description: "Click Isolate Vocals." },
      { step: 3, title: "Download", description: "Download the isolated vocal WAV." }
    ],
    faqs: [
      { question: "Is this free?", answer: "Yes, 100% free." }
    ],
    relatedConverters: ["vocal-remover"],
    relatedTools: ["vocal-remover", "audio-noise-reducer"]
  },

  "acapella-extractor": {
    slug: "acapella-extractor",
    name: "Acapella Extractor",
    category: "data-developer",
    title: "Acapella Extractor Online - Extract Vocals from Music Free",
    subtitle: "Make studio-quality acapella tracks from songs in seconds.",
    metaDescription: "Extract acapellas from songs online for free. AI voice isolation with zero instrumental bleed.",
    answerSummary: "Generate studio-quality acapella vocal tracks.",
    badge: "Acapella Maker",
    featured: false,
    keywords: ["acapella extractor", "make acapella", "vocal stripper", "acapella maker"],
    about: "Create isolated acapella vocals for DJs, producers, and remix artists.",
    howTo: [
      { step: 1, title: "Upload Song", description: "Upload your song track." },
      { step: 2, title: "Extract", description: "Extract vocal frequencies." },
      { step: 3, title: "Download", description: "Download the acapella file." }
    ],
    faqs: [
      { question: "Is this free?", answer: "Yes, free with zero watermarks." }
    ],
    relatedConverters: ["vocal-remover"],
    relatedTools: ["vocal-remover", "isolate-vocals"]
  },

  "auto-subtitle-generator": {
    slug: "auto-subtitle-generator",
    name: "Auto Subtitle Generator",
    category: "data-developer",
    title: "Auto Subtitle Generator - Free SRT & VTT Subtitle Creator",
    subtitle: "Generate synchronized subtitles and closed captions for videos using Whisper Large-v3. Download industry-standard .srt and .vtt files with millisecond precision.",
    metaDescription: "Free online auto subtitle generator. Automatically generate SRT and VTT subtitles from video and audio files in 99+ languages using OpenAI Whisper.",
    answerSummary: "Generate auto subtitles for videos in seconds. Export industry-standard .srt and .vtt caption files with millisecond word timestamps in 99+ languages.",
    badge: "Whisper Timestamps",
    featured: true,
    keywords: [
      "auto subtitle generator",
      "generate subtitles online",
      "video to srt converter",
      "auto captions free",
      "create srt from video",
      "closed caption generator",
      "subtitles for youtube reels"
    ],
    about: "Adding subtitles to videos increases engagement by over 80% on YouTube, TikTok, and Instagram Reels. ConvertSheet's Auto Subtitle Generator utilizes Whisper Large-v3 deep speech recognition models to transcribe speech and generate precision millisecond timestamps. Export ready-to-use `.srt` and `.vtt` subtitle files for Premiere Pro, DaVinci Resolve, Final Cut, and CapCut.",
    howTo: [
      { step: 1, title: "Upload Video", description: "Upload any MP4, MOV, MKV, or audio file up to 500MB." },
      { step: 2, title: "Select Language", description: "Pick your spoken language or use Auto-Detect across 99+ languages." },
      { step: 3, title: "Generate Subtitles", description: "Click Generate to transcribe speech and create synchronized timecodes." },
      { step: 4, title: "Export .SRT or .VTT", description: "Inspect the timestamp table and download standard subtitle files or copy to clipboard." }
    ],
    faqs: [
      { question: "Can I use the .srt file directly on YouTube?", answer: "Yes! YouTube, Facebook, Vimeo, and TikTok accept our generated .srt subtitle files without any modifications." },
      { question: "What languages are supported?", answer: "Whisper supports 99+ languages including English, Spanish, French, German, Hindi, Mandarin, Portuguese, Arabic, and Japanese." },
      { question: "Are timestamps accurate?", answer: "Yes, timestamps are calculated to exact millisecond intervals aligning with spoken words." }
    ],
    relatedConverters: ["speech-to-text"],
    relatedTools: ["speech-to-text", "video-compressor"]
  },

  "generate-subtitles": {
    slug: "generate-subtitles",
    name: "Generate Subtitles from Video",
    category: "data-developer",
    title: "Generate Subtitles Online - Free Video Caption Maker",
    subtitle: "Create synced captions and subtitle files from video and audio in seconds.",
    metaDescription: "Generate subtitles for your videos online. Free automatic SRT and VTT subtitle generator.",
    answerSummary: "Create accurate subtitles and captions for video clips.",
    badge: "Auto Captions",
    featured: false,
    keywords: ["generate subtitles", "make subtitles", "video caption creator", "auto srt maker"],
    about: "Create synchronized subtitle files for YouTube, Reels, and TikTok videos.",
    howTo: [
      { step: 1, title: "Upload", description: "Upload your video file." },
      { step: 2, title: "Generate", description: "Click Generate Synced Subtitles." },
      { step: 3, title: "Download", description: "Download your .srt file." }
    ],
    faqs: [
      { question: "Is this free?", answer: "Yes, completely free with no limits." }
    ],
    relatedConverters: ["speech-to-text"],
    relatedTools: ["auto-subtitle-generator", "speech-to-text"]
  },

  "compress-image-to-20kb": {
    slug: "compress-image-to-20kb",
    name: "Compress Image to 20KB",
    category: "utility",
    title: "Compress Image to 20KB Online - Free Photo Resizer",
    subtitle: "Compress JPG, PNG, and WebP images to under 20KB for signatures, SSC, UPSC, and government portal uploads.",
    metaDescription: "Free online image compressor to 20KB. Compress photos and signatures to exactly under 20KB for passport, exam, and job applications without quality loss.",
    answerSummary: "Compress images and signatures to under 20KB for government and job portal uploads with instant libvips processing.",
    badge: "Exact 20KB Target",
    featured: true,
    keywords: [
      "compress image to 20kb",
      "compress photo to 20kb online",
      "reduce image size to 20kb",
      "signature compress to 20kb",
      "photo size reducer to 20kb",
      "ssc photo resizer 20kb"
    ],
    about: "Online job portals and government exam applications (UPSC, SSC, IBPS, State PSCs) strictly require candidate photos and signatures to be under 20KB. ConvertSheet uses high-speed libvips binary search compression to fit your photo under 20KB while preserving maximum visual sharpness and standard pixel dimensions (140x60 or custom).",
    howTo: [
      { step: 1, title: "Upload Photo", description: "Select your image or signature in JPG, PNG, or WebP format." },
      { step: 2, title: "Confirm 20KB Target", description: "The tool automatically sets the target size to 20KB." },
      { step: 3, title: "Compress & Download", description: "Click compress to generate your compliant image in under 50ms." }
    ],
    faqs: [
      { question: "Will my image meet government portal requirements?", answer: "Yes! The output file is guaranteed to be under 20,480 bytes (20KB), matching all portal validation rules." },
      { question: "Can I compress signatures?", answer: "Yes, signature images and documents compress cleanly with high contrast." }
    ],
    relatedConverters: ["compress-image"],
    relatedTools: ["compress-image-to-50kb", "compress-image-to-100kb", "white-background-passport-photo"]
  },

  "compress-image-to-50kb": {
    slug: "compress-image-to-50kb",
    name: "Compress Image to 50KB",
    category: "utility",
    title: "Compress Image to 50KB Online - Free Passport & Exam Resizer",
    subtitle: "Compress photos to exactly under 50KB (between 20KB and 50KB) for passport portals, visa applications, and exam registrations.",
    metaDescription: "Compress image to 50KB online for free. Reduce photo size to under 50KB for passport, visa, and government portal uploads with crisp clarity.",
    answerSummary: "Compress photos to under 50KB for passport, visa, and exam portals with exact byte convergence.",
    badge: "Exact 50KB Target",
    featured: true,
    keywords: [
      "compress image to 50kb",
      "compress photo to 50kb",
      "reduce image size to 50kb online",
      "passport photo 50kb",
      "upsc photo resizer 50kb",
      "photo compressor 50kb"
    ],
    about: "Over 80% of government, visa, and academic admission portals mandate passport photos between 20KB and 50KB. ConvertSheet's 50KB Image Compressor tunes compression quantization and dimensions to ensure your file strictly satisfies the portal validator without blurriness or pixelation.",
    howTo: [
      { step: 1, title: "Upload Photo", description: "Upload your passport or portrait photo." },
      { step: 2, title: "Select 50KB", description: "Preset for 50KB ceiling with 20KB floor." },
      { step: 3, title: "Download", description: "Save your portal-compliant JPG or WebP image." }
    ],
    faqs: [
      { question: "Does it support 3.5 x 4.5 cm dimensions?", answer: "Yes, select the India Passport (3.5 x 4.5 cm) preset to set both exact dimensions and 50KB size." },
      { question: "Is the tool free?", answer: "Yes, completely free with zero limits or watermarks." }
    ],
    relatedConverters: ["compress-image"],
    relatedTools: ["compress-image-to-20kb", "compress-image-to-100kb", "white-background-passport-photo"]
  },

  "compress-image-to-100kb": {
    slug: "compress-image-to-100kb",
    name: "Compress Image to 100KB",
    category: "utility",
    title: "Compress Image to 100KB Online - Free Photo & Doc Resizer",
    subtitle: "Compress images and scanned certificates to under 100KB for online forms, US visa uploads, and ID cards.",
    metaDescription: "Free online image compressor to 100KB. Reduce JPG and PNG file sizes to under 100KB for US Visa (DS-160), job portals, and identity documents.",
    answerSummary: "Compress images to under 100KB for DS-160 US Visa, ID verification, and document portals.",
    badge: "Exact 100KB Target",
    featured: true,
    keywords: [
      "compress image to 100kb",
      "reduce image size to 100kb",
      "us visa photo 100kb",
      "photo compressor 100kb online",
      "compress certificate to 100kb"
    ],
    about: "US Visa (DS-160) and identity verification portals require 2x2 inch photos between 600x600 pixels and under 100KB. ConvertSheet's 100KB Compressor guarantees compliance while preserving facial micro-features and color depth.",
    howTo: [
      { step: 1, title: "Upload Image", description: "Select your photo or scanned document." },
      { step: 2, title: "100KB Target", description: "Preset for exact 100KB limit." },
      { step: 3, title: "Download", description: "Save your verified compliant image." }
    ],
    faqs: [
      { question: "Can I use this for US Visa (DS-160)?", answer: "Yes, select the US Visa 2x2 inch preset for immediate DS-160 portal acceptance." }
    ],
    relatedConverters: ["compress-image"],
    relatedTools: ["compress-image-to-50kb", "white-background-passport-photo"]
  },

  "reduce-image-size-in-kb": {
    slug: "reduce-image-size-in-kb",
    name: "Reduce Image Size in KB",
    category: "utility",
    title: "Reduce Image Size in KB - Free Online Photo Compressor",
    subtitle: "Reduce photo and image sizes to any custom KB ceiling (20KB, 50KB, 100KB, 200KB) with exact byte control.",
    metaDescription: "Reduce image size in KB online for free. Compress JPG, PNG, and WebP images to exact kilobyte targets with high visual quality.",
    answerSummary: "Reduce image file size to exact KB targets with instant libvips processing.",
    badge: "Custom KB Target",
    featured: true,
    keywords: [
      "reduce image size in kb",
      "reduce photo size in kb",
      "kb reducer",
      "image size reducer in kb",
      "photo size reducer in kb online"
    ],
    about: "Custom kilobyte optimization tool that gives you exact control over target KB ceilings, dimension scaling, and quality compression.",
    howTo: [
      { step: 1, title: "Upload Photo", description: "Upload your image file." },
      { step: 2, title: "Set KB Size", description: "Enter any target KB value." },
      { step: 3, title: "Save", description: "Download your resized image." }
    ],
    faqs: [
      { question: "What formats can I reduce?", answer: "We support JPG, JPEG, PNG, WebP, BMP, and TIFF." }
    ],
    relatedConverters: ["compress-image"],
    relatedTools: ["compress-image-to-50kb", "compress-image-to-20kb"]
  },

  "increase-image-size-in-kb": {
    slug: "increase-image-size-in-kb",
    name: "Increase Image Size in KB",
    category: "utility",
    title: "Increase Image Size in KB - Free Online Photo Expander",
    subtitle: "Increase photo and image file size in KB to satisfy minimum portal requirements (e.g. min 20KB, min 50KB) without distortion.",
    metaDescription: "Increase image size in KB online for free. Expand image file sizes to meet minimum portal requirements without visual degradation.",
    answerSummary: "Increase image file sizes to meet minimum portal constraints (e.g. minimum 20KB or 50KB).",
    badge: "Min KB Expander",
    featured: false,
    keywords: [
      "increase image size in kb",
      "increase photo size in kb",
      "expand image size in kb",
      "make image larger in kb"
    ],
    about: "Some portals reject photos that are too small (e.g. 'Must be at least 20KB'). ConvertSheet uses lossless padding and quality interpolation to expand your image size to satisfy minimum requirements.",
    howTo: [
      { step: 1, title: "Upload Image", description: "Select your image file." },
      { step: 2, title: "Set Min KB", description: "Enter the required minimum KB floor." },
      { step: 3, title: "Download", description: "Save your expanded compliant photo." }
    ],
    faqs: [
      { question: "Does increasing KB size distort the image?", answer: "No, we use lossless zero-padding and high-fidelity sampling to maintain visual appearance." }
    ],
    relatedConverters: ["compress-image"],
    relatedTools: ["reduce-image-size-in-kb", "compress-image-to-50kb"]
  },

  "receipt-scanner-ocr": {
    slug: "receipt-scanner-ocr",
    name: "Receipt Scanner & Expense OCR",
    category: "data-developer",
    title: "Receipt Scanner Online - Free Receipt OCR & Expense Parser",
    subtitle: "Extract vendor names, dates, line items, taxes, and totals from receipt photos and invoices into structured JSON and CSV.",
    metaDescription: "Free online receipt scanner and expense OCR. Scan paper receipts, invoices, and bills to extract vendor, line items, taxes, and total amounts into CSV and JSON.",
    answerSummary: "Scan receipts and invoices to extract line items, taxes, and total amounts automatically into CSV and JSON with verified math.",
    badge: "Expense OCR",
    featured: true,
    keywords: [
      "receipt scanner",
      "receipt ocr online",
      "scan receipt to excel",
      "receipt to csv",
      "extract receipt data",
      "invoice scanner ocr",
      "free expense parser"
    ],
    about: "Manual expense reporting is tedious and error-prone. ConvertSheet's Receipt Scanner uses deep document OCR to parse receipts, bills, and hotel invoices. It automatically isolates merchant names, transaction dates, itemized purchases, sales tax, and verifies that subtotal + tax = total within mathematical rounding tolerances. Export clean CSV tables for Excel or raw JSON for accounting software.",
    howTo: [
      { step: 1, title: "Upload Receipt", description: "Upload a photo or scan of your receipt in JPG, PNG, or PDF format." },
      { step: 2, title: "OCR Extraction", description: "Click Extract Expense Data to parse merchant, tax, and line items." },
      { step: 3, title: "Export CSV or JSON", description: "Download an itemized CSV table or copy structured JSON data." }
    ],
    faqs: [
      { question: "Does it verify that numbers add up?", answer: "Yes! The parser performs automated mathematical reconciliation (subtotal + tax == total) to flag discrepancies." },
      { question: "What formats can I export?", answer: "You can download an itemized CSV table (opens directly in Excel and Google Sheets) or copy clean JSON." }
    ],
    relatedConverters: ["pdf-table-extractor", "json-to-excel"],
    relatedTools: ["pdf-to-markdown", "data-anonymizer-cleaner"]
  },

  "parse-receipt": {
    slug: "parse-receipt",
    name: "Parse Receipt to CSV",
    category: "data-developer",
    title: "Parse Receipt to CSV - Free Online Expense Extractor",
    subtitle: "Convert receipt photos into organized spreadsheet rows.",
    metaDescription: "Parse receipts into CSV spreadsheets online for free. Automated receipt expense parser.",
    answerSummary: "Convert receipt images to CSV spreadsheets automatically.",
    badge: "Receipt to CSV",
    featured: false,
    keywords: ["parse receipt", "receipt to csv", "invoice to excel", "expense extractor"],
    about: "Automate expense reports by extracting line items and totals into CSV format.",
    howTo: [
      { step: 1, title: "Upload", description: "Select your receipt photo." },
      { step: 2, title: "Extract", description: "Extract items and total." },
      { step: 3, title: "Save CSV", description: "Download the CSV file." }
    ],
    faqs: [
      { question: "Is this tool free?", answer: "Yes, completely free." }
    ],
    relatedConverters: ["json-to-excel"],
    relatedTools: ["receipt-scanner-ocr", "pdf-table-extractor"]
  }
};
