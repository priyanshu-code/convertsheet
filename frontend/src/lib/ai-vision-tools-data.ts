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
    subtitle: "Transcribe audio and video to text in seconds using Whisper Large-v3 and Parakeet-TDT. Accurate timestamps and 99+ languages.",
    metaDescription: "Free online speech to text transcription. Transcribe MP3, WAV, M4A, and MP4 files into clean text and SRT subtitles using OpenAI Whisper and NeMo Parakeet.",
    answerSummary: "Transcribe speech to text automatically. Upload audio or record live to get accurate text transcripts, timestamps, and downloadable SRT subtitles with zero watermarks.",
    badge: "Whisper Large-v3",
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
      { question: "What audio formats are supported?", answer: "We support MP3, WAV, M4A, AAC, FLAC, OGG, WebM, MP4, and MOV files up to 100MB." },
      { question: "Can I transcribe languages other than English?", answer: "Yes! Whisper Large-v3 supports 99+ languages including Spanish, French, German, Hindi, Mandarin, Portuguese, and Arabic with auto-detection." },
      { question: "Can I download SRT subtitles for YouTube or Reels?", answer: "Yes, clicking the SRT button downloads an industry-standard .srt subtitle file with precise millisecond timestamps." }
    ],
    relatedConverters: ["jpg-to-text", "png-to-text"],
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
  }
};
