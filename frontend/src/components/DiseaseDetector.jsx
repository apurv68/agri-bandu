import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Scan, CheckCircle, AlertTriangle, XCircle, RefreshCw, 
  Leaf, Shield, Info, Save, Layers, Sparkles, ArrowRight, Volume2, 
  VolumeX, Play, Pause, MessageCircle, Calendar, Mic, X, ChevronRight, 
  Sun, Zap, ArrowLeft, Check, HelpCircle, Share2, Sprout, Key, Lock, LogIn, CheckCircle2, Bot, MicOff
} from 'lucide-react';
import { diseaseService } from '../services/api';
import { geminiService } from '../services/geminiService';


// Reference samples for interactive leaf comparison
const REFERENCE_SYMPTOM_IMAGES = {
  'Tomato___Early_blight': 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80',
  'Tomato___Late_blight': 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80',
  'Potato___Late_blight': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  'Corn_(maize)___Common_rust_': 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80',
  'Squash___Powdery_mildew': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
  'Apple___Cedar_apple_rust': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80',
  'default': '/images/crops/tomato.png'
};

// Translations Dictionary for Dual English / Hindi
const I18N = {
  en: {
    welcome: 'Welcome Farmer',
    greetingSub: 'AI Plant Health & Smart Diagnostics',
    alertTitle: 'Seasonal Alert',
    alertText: 'Late Blight (अगेती झुलसा) active in nearby districts.',
    checkHealthBtn: 'Check Plant Health',
    checkHealthSub: 'Works online & offline · Takes 2s',
    recentPlots: 'Recent Plots (My Fields)',
    plot1Title: 'Tomato Patch A',
    plot1Status: 'Early Blight · Moderate',
    plot2Title: 'Potato Plot #2',
    plot2Status: 'Healthy · Oct 12',
    plot3Title: 'Corn Field #1',
    plot3Status: 'Common Rust · Mild',
    tapToScan: 'Tap to Scan Leaf',
    uploadOrDrop: 'Upload or Drop Leaf Picture',
    supportsFormats: 'Supports JPG, PNG, WEBP camera & gallery photos',
    useCamera: 'Use Camera Viewfinder',
    uploadGallery: 'Choose from Gallery',
    holdLeafPrompt: 'Hold leaf inside the frame — keep it still',
    distanceLocked: 'Optimal Distance Locked',
    daylightGood: 'Good natural daylight',
    shadowDetected: 'Tap for flash',
    diagnosing: 'Analyzing Leaf Pathology...',
    analyzingSub: 'Inspecting chlorophyll & leaf spot patterns with AI model',
    symptomMatch: 'Confirmed Symptom Match',
    severity: 'Severity',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
    doesLeafLookLike: 'Does your leaf look like this reference sample?',
    yourPhoto: 'Your Leaf Photo',
    targetReference: 'Target Symptom Reference',
    yesViewRemedy: 'Yes, View Remedy',
    retakePhoto: 'Retake Photo',
    treatmentDeck: 'Treatment Deck',
    tabOrganic: 'Organic Remedies',
    tabChemical: 'Chemical Treatment',
    tabPrevent: 'Prevent Spread',
    agronomistAudio: 'Agronomist Audio Guide',
    listen: 'Listen',
    stopAudio: 'Stop',
    dosageTitle: 'Application & Dosage Recipe',
    fieldActions: 'Field Actions Checklist',
    askQuestionBtn: 'Hold to Ask Question',
    addSchedule: 'Add to Treatment Schedule',
    shareWhatsApp: 'Share on WhatsApp',
    saveHistory: 'Save Scan Record',
    saved: 'Saved to History!',
    samplePresets: 'Quick Sample Presets (Try Instant Leaves)'
  },
  hi: {
    welcome: 'नमस्ते किसान भाई',
    greetingSub: 'एआई फसल स्वास्थ्य एवं स्मार्ट जांच',
    alertTitle: 'मौसम संबंधी चेतावनी',
    alertText: 'आसपास के क्षेत्रों में अगेती झुलसा (Late Blight) का प्रकोप।',
    checkHealthBtn: 'पत्ती की जांच करें',
    checkHealthSub: 'फास्ट एआई जांच · 2 सेकंड में परिणाम',
    recentPlots: 'मेरे खेत (Recent Plots)',
    plot1Title: 'टमाटर खेत (Patch A)',
    plot1Status: 'अगेती झुलसा · मध्यम',
    plot2Title: 'आलू खेत (Plot #2)',
    plot2Status: 'स्वस्थ · 12 अक्टूबर',
    plot3Title: 'मक्का खेत (Field #1)',
    plot3Status: 'रतुआ रोग · हल्का',
    tapToScan: 'पत्ती की फोटो लें',
    uploadOrDrop: 'पत्ती की फोटो अपलोड करें',
    supportsFormats: 'कैमरा या गैलरी से साफ फोटो चुनें',
    useCamera: 'कैमरा शुरू करें',
    uploadGallery: 'गैलरी से फोटो लें',
    holdLeafPrompt: 'पत्ती को फ्रेम के अंदर रखें — स्थिर रखें',
    distanceLocked: 'सही दूरी सेट है',
    daylightGood: 'पर्याप्त प्राकृतिक रोशनी',
    shadowDetected: 'फ्लैश के लिए टैप करें',
    diagnosing: 'पत्ती की जांच हो रही है...',
    analyzingSub: 'एआई मॉडल पत्ती के लक्षणों का विश्लेषण कर रहा है',
    symptomMatch: 'पक्का लक्षण मेल (Match)',
    severity: 'गंभीरता (Severity)',
    mild: 'हल्का',
    moderate: 'मध्यम',
    severe: 'गंभीर',
    doesLeafLookLike: 'क्या आपकी पत्ती इस संदर्भ नमूने जैसी दिखती है?',
    yourPhoto: 'आपकी पत्ती',
    targetReference: 'संदर्भ फोटो (तुलना)',
    yesViewRemedy: 'उपचार देखें',
    retakePhoto: 'दोबारा फोटो लें',
    treatmentDeck: 'उपचार विवरण (Treatment)',
    tabOrganic: 'प्राकृतिक उपचार (Organic)',
    tabChemical: 'रासायनिक दवा (Chemical)',
    tabPrevent: 'रोकथाम उपाय (Prevent)',
    agronomistAudio: 'कृषि विशेषज्ञ ऑडियो मार्गदर्शन',
    listen: 'सुनें (Listen)',
    stopAudio: 'रोकें',
    dosageTitle: 'दवा छिड़काव की सही मात्रा',
    fieldActions: 'खेत में तुरंत करने योग्य कार्य',
    askQuestionBtn: 'सवाल पूछें (Ask Voice)',
    addSchedule: 'उपचार शेड्यूल में जोड़ें',
    shareWhatsApp: 'व्हाट्सएप पर शेयर करें',
    saveHistory: 'रिकॉर्ड सहेजें',
    saved: 'सफलतापूर्वक सहेजा गया!',
    samplePresets: 'नमूना पत्तियां (जांच का परीक्षण करें)'
  }
};

const SAMPLE_LEAF_PRESETS = [
  {
    id: 'tomato-early-blight',
    name: 'Tomato Leaf',
    diseaseName: 'Tomato Early Blight (टमाटर अगेती झुलसा)',
    scientificName: 'Alternaria solani',
    crop: 'Tomato',
    status: 'warning',
    confidence: 97.94,
    symptoms: [
      'Concentric dark brown rings forming target-shaped spots',
      'Yellow halos surrounding leaf lesions',
      'Premature defoliation starting from lower leaves'
    ],
    organicRemedy: 'Neem Oil Emulsion: Mix 5ml Neem Oil per 1L water + 2 drops mild soap. Spray thoroughly in early morning.',
    chemicalRemedy: 'Mancozeb 75% WP @ 2g/L or Chlorothalonil 75% WP @ 2g/L of clean water.',
    prevention: 'Maintain plant spacing for airflow, practice 3-year crop rotation, and avoid overhead sprinkler watering.',
    image: '/images/crops/tomato.png',
    referenceImg: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'potato-late-blight',
    name: 'Potato Leaf',
    diseaseName: 'Potato Late Blight (आलू पिछेती झुलसा)',
    scientificName: 'Phytophthora infestans',
    crop: 'Potato',
    status: 'critical',
    confidence: 96.7,
    symptoms: [
      'Water-soaked dark lesions on leaf tips and margins',
      'White cottony fungal growth on lower side of leaves during high humidity',
      'Rapid collapse and browning of entire leaf canopy'
    ],
    organicRemedy: 'Bordeaux mixture (1%) or copper oxychloride spray (3g/L). Ensure well-drained soil.',
    chemicalRemedy: 'Cymoxanil 8% + Mancozeb 64% WP @ 1.5g/L or Metalaxyl 8% + Mancozeb 64% WP.',
    prevention: 'Use certified disease-free seed tubers and plant resistant varieties.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    referenceImg: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'corn-rust',
    name: 'Corn Leaf',
    diseaseName: 'Corn Common Rust (मक्का रतुआ रोग)',
    scientificName: 'Puccinia sorghi',
    crop: 'Corn (Maize)',
    status: 'warning',
    confidence: 95.8,
    symptoms: [
      'Oval to elongated reddish-brown pustules on upper and lower leaf surfaces',
      'Pustules rupture releasing powdery rust-colored spores'
    ],
    organicRemedy: 'Spray liquid sulfur formulations (3g/L) at early sign of rust pustules.',
    chemicalRemedy: 'Azoxystrobin 23% SC @ 1ml/L or Propiconazole 25% EC @ 1ml/L.',
    prevention: 'Plant resistant corn hybrids and avoid excessive nitrogen fertilizer application.',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80',
    referenceImg: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'healthy-wheat',
    name: 'Wheat Leaf',
    diseaseName: 'Healthy Wheat Leaf (स्वस्थ गेहूं)',
    scientificName: 'Triticum aestivum',
    crop: 'Wheat',
    status: 'healthy',
    confidence: 99.1,
    symptoms: [
      'Vibrant deep green foliage with uniform leaf tissue',
      'No spots, pustules, or discoloration detected'
    ],
    organicRemedy: 'Maintain regular balanced irrigation and bio-fertilizer schedule (Azotobacter & PSB).',
    chemicalRemedy: 'No chemical fungicides needed. Continue standard crop care.',
    prevention: 'Regular scouting once every 5 days during tillering phase.',
    image: '/images/crops/wheat.png',
    referenceImg: '/images/crops/wheat.png'
  }
];

export default function DiseaseDetector({ user, onNavigateFarm, onOpenAuth, lang = 'hi', setLang }) {
  const t = I18N[lang] || I18N.hi;


  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [remedyTab, setRemedyTab] = useState('organic'); // 'organic' | 'chemical' | 'prevent'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAnsweringVoice, setIsAnsweringVoice] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [showScheduleToast, setShowScheduleToast] = useState(false);

  // Fix 4: Gemini API Key State & Dynamic Cure Formulation
  const [geminiKey, setGeminiKey] = useState(() => geminiService.getApiKey());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInputValue, setKeyInputValue] = useState('');
  const [keyTestStatus, setKeyTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [isGeneratingCure, setIsGeneratingCure] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      window.__agriUtterance = null;
    };
  }, []);

  // Update Gemini Dynamic Cures on Language Switch
  useEffect(() => {
    if (scanResult && scanResult.status !== 'invalid' && !scanResult.diseaseName?.includes('Non-Leaf')) {
      geminiService.fetchDynamicCure({
        crop: scanResult.crop,
        diseaseName: scanResult.diseaseName || scanResult.disease_name,
        scientificName: scanResult.scientificName || '',
        symptoms: scanResult.symptoms || [],
        lang
      }).then(updated => {
        if (updated) {
          setScanResult(prev => prev ? ({
            ...prev,
            organicRemedy: updated.organicRemedy || prev.organicRemedy,
            chemicalRemedy: updated.chemicalRemedy || prev.chemicalRemedy,
            prevention: updated.prevention || prev.prevention,
            audioGuideScript: updated.audioGuideScript,
            cureSource: updated.source
          }) : null);
        }
      }).catch(() => {});
    }
  }, [lang]);

  // Fix 5: Android APK & Web Robust Speech Synthesis
  const toggleAudioSpeech = (textOverride = null) => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'hi' ? 'इस डिवाइस पर ऑडियो वाचन समर्थित नहीं है।' : 'Text-to-speech audio is not supported on this device.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      window.__agriUtterance = null;
      return;
    }

    let speechText = textOverride;
    if (!speechText && scanResult) {
      if (scanResult.audioGuideScript) {
        speechText = scanResult.audioGuideScript;
      } else {
        const disease = scanResult.diseaseName || scanResult.disease_name;
        const remedy = remedyTab === 'organic' 
          ? (scanResult.organicRemedy || scanResult.organic_remedy)
          : (scanResult.chemicalRemedy || scanResult.chemical_remedy);
        speechText = lang === 'hi' 
          ? `फसल में ${disease} के लक्षण पाए गए हैं। उपचार के लिए: ${remedy}`
          : `Detected ${disease}. Recommended treatment: ${remedy}`;
      }
    }

    if (!speechText) return;

    // Clean markdown characters (*, #, _, `)
    const cleanSpeech = speechText.replace(/[*#_`]/g, '').trim();

    // Android WebView Fix 1: cancel stuck speech queue
    window.speechSynthesis.cancel();

    // Android WebView Fix 2: resume paused engine
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Android WebView Fix 3: save reference to prevent garbage collection mid-speech
    window.__agriUtterance = utterance;

    // Find best voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchPrefix = lang === 'hi' ? 'hi' : 'en';
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(matchPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      window.__agriUtterance = null;
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlayingAudio(false);
      window.__agriUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);

    // Android WebView Fix 4: keepalive interval so speech doesn't pause after 15s
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 4500);
  };

  // Fix 7: Enforce login before starting camera
  const startCamera = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    try {
      setCameraActive(true);
      setSelectedImage(null);
      setScanResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied or unavailable. Please choose a photo from your gallery.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const compressImage = (dataUrl, maxWidth = 1024, quality = 0.9) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Fix 7: Enforce login before photo capture
  const capturePhoto = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const w = videoRef.current.videoWidth || 1280;
      const h = videoRef.current.videoHeight || 720;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      context.drawImage(videoRef.current, 0, 0, w, h);
      const rawData = canvasRef.current.toDataURL('image/jpeg', 0.92);
      setSelectedImage(rawData);
      stopCamera();
      runAnalysis(rawData);
    }
  };

  // Fix 7: Enforce login before gallery upload
  const handleFileChange = (e) => {
    if (!user) {
      if (e.target) e.target.value = '';
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const raw = reader.result;
        setSelectedImage(raw);
        const optimized = await compressImage(raw);
        runAnalysis(optimized);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fix 4: Enhance with Dynamic Gemini Agronomist Cure
  const enhanceWithGeminiCure = async (diagnosis, image, matchedReference, scan_id = null) => {
    // Set immediate base diagnosis
    setScanResult({
      ...diagnosis,
      image,
      referenceImg: matchedReference,
      scan_id,
      cureSource: 'loading'
    });
    setSavedSuccess(true);

    if (diagnosis.status === 'invalid' || diagnosis.diseaseName?.includes('Non-Leaf')) {
      return;
    }

    // Call Gemini API for dynamic cure
    setIsGeneratingCure(true);
    try {
      const dynamicCure = await geminiService.fetchDynamicCure({
        crop: diagnosis.crop,
        diseaseName: diagnosis.diseaseName || diagnosis.disease_name,
        scientificName: diagnosis.scientificName || '',
        symptoms: diagnosis.symptoms || [],
        lang
      });

      if (dynamicCure) {
        setScanResult(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            organicRemedy: dynamicCure.organicRemedy || prev.organicRemedy,
            chemicalRemedy: dynamicCure.chemicalRemedy || prev.chemicalRemedy,
            prevention: dynamicCure.prevention || prev.prevention,
            audioGuideScript: dynamicCure.audioGuideScript,
            cureSource: dynamicCure.source
          };
        });
      }
    } catch (e) {
      console.warn('Gemini dynamic cure fetch error:', e);
    } finally {
      setIsGeneratingCure(false);
    }
  };

  // Fix 7: Enforce login before sample preset click
  const handleSelectSample = async (sample) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setSelectedImage(sample.image);
    stopCamera();
    setIsScanning(true);
    setScanResult(null);
    setSavedSuccess(false);

    try {
      let scanPayload = sample.image;
      if (sample.image.startsWith('/')) {
        try {
          const fetchRes = await fetch(sample.image);
          const blob = await fetchRes.blob();
          scanPayload = await new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result);
            r.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          scanPayload = sample.image;
        }
      }

      const res = await diseaseService.scanLeaf(scanPayload);
      if (res && res.diagnosis && res.diagnosis.status !== 'invalid' && !res.diagnosis.diseaseName?.includes('Non-Leaf')) {
        const predictedClass = res.diagnosis.predicted_class || '';
        const matchedReference = REFERENCE_SYMPTOM_IMAGES[predictedClass] || sample.referenceImg || sample.image;
        await enhanceWithGeminiCure(res.diagnosis, sample.image, matchedReference, res.scan_id);
      } else {
        await enhanceWithGeminiCure(sample, sample.image, sample.referenceImg || sample.image);
      }
    } catch (e) {
      await enhanceWithGeminiCure(sample, sample.image, sample.referenceImg || sample.image);
    } finally {
      setIsScanning(false);
    }
  };

  const runAnalysis = async (imgSrc) => {
    setIsScanning(true);
    setScanResult(null);
    setSavedSuccess(false);

    try {
      const res = await diseaseService.scanLeaf(imgSrc);

      if (res && res.diagnosis) {
        const predictedClass = res.diagnosis.predicted_class || '';
        const matchedReference = REFERENCE_SYMPTOM_IMAGES[predictedClass] || REFERENCE_SYMPTOM_IMAGES['default'];
        await enhanceWithGeminiCure(res.diagnosis, imgSrc, matchedReference, res.scan_id);
      } else {
        setScanResult({
          crop: 'Network / Server Notice',
          diseaseName: 'Cloud AI Responded with Inconclusive',
          scientificName: 'Retry with clear lighting',
          status: 'invalid',
          confidence: 0,
          image: imgSrc,
          symptoms: ['Could not extract distinct disease features. Please ensure close-up leaf framing.'],
          organicRemedy: 'Please take a close-up photo of the affected leaf in good lighting.',
          chemicalRemedy: 'N/A',
          prevention: 'Ensure phone camera lens is clean.'
        });
      }
    } catch (err) {
      setScanResult({
        crop: 'Scan Notice',
        diseaseName: 'Connection Timed Out',
        scientificName: 'Please try again',
        status: 'invalid',
        confidence: 0,
        image: imgSrc,
        symptoms: ['Check your internet connection and tap retry.'],
        organicRemedy: 'Ensure phone has active network.',
        chemicalRemedy: 'N/A',
        prevention: 'Active internet connection required.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Severity calculator based on status & confidence
  const getSeverityLevel = () => {
    if (!scanResult) return 'moderate';
    if (scanResult.status === 'healthy') return 'mild';
    if (scanResult.status === 'critical') return 'severe';
    if (scanResult.confidence > 92) return 'moderate';
    return 'mild';
  };

  // Fix 5: Gemini AI Conversational Voice Advisor & Cross-Questioning
  const handleAskQuestion = async (customQuestion = null) => {
    const q = (customQuestion || userQuestion).trim();
    if (!q) return;

    setIsAnsweringVoice(true);
    setAiAnswer('');

    try {
      const reply = await geminiService.askVoiceAdvisor({
        question: q,
        crop: scanResult?.crop || 'Crop',
        diseaseName: scanResult?.diseaseName || scanResult?.disease_name || 'Plant Health',
        lang
      });
      setAiAnswer(reply);
      toggleAudioSpeech(reply);
    } catch (err) {
      console.error('Error asking Gemini voice advisor:', err);
      const fallbackReply = lang === 'hi' 
        ? 'लक्षणों के आधार पर सुबह के समय 5ml/L नीम तेल के घोल का छिड़काव करें और संक्रमित पत्तियों को हटाएं।'
        : 'Based on diagnosis, spray 5ml/L neem oil emulsion early in the morning and remove damaged foliage.';
      setAiAnswer(fallbackReply);
      toggleAudioSpeech(fallbackReply);
    } finally {
      setIsAnsweringVoice(false);
    }
  };

  // Fix 5: Speech-to-Text Microphone Recording
  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi' ? 'वॉइस पहचान आपके ब्राउज़र में उपलब्ध नहीं है। कृपया सवाल लिखकर पूछें।' : 'Speech recognition not available. Please type your question.');
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningVoice(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setUserQuestion(transcript);
          setIsListeningVoice(false);
          handleAskQuestion(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Could not start recognition:', e);
      setIsListeningVoice(false);
    }
  };

  // Test and Save Gemini API Key
  const handleSaveGeminiKey = async () => {
    const cleanKey = keyInputValue.trim();
    setKeyTestStatus('testing');

    if (!cleanKey) {
      geminiService.setApiKey('');
      setGeminiKey('');
      setKeyTestStatus('success');
      setTimeout(() => setShowKeyModal(false), 800);
      return;
    }

    try {
      geminiService.setApiKey(cleanKey);
      // Run quick test query to verify key with Google
      await geminiService.generateContent('Hi', 'Reply with OK');
      setGeminiKey(cleanKey);
      setKeyTestStatus('success');
      setTimeout(() => setShowKeyModal(false), 900);
    } catch (err) {
      console.error('Gemini Key verification failed:', err);
      setKeyTestStatus('error');
    }
  };

  const handleShareWhatsApp = () => {
    if (!scanResult) return;
    const disease = scanResult.diseaseName || scanResult.disease_name;
    const msg = encodeURIComponent(
      `🌾 Agri Bandhu Crop Health Report:\nCrop: ${scanResult.crop}\nDiagnosis: ${disease}\nConfidence: ${scanResult.confidence}%\nRemedy: ${scanResult.organicRemedy || scanResult.organic_remedy}\n\nDiagnosed via Agri Bandhu AI.`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleScheduleReminder = () => {
    if (scanResult) {
      const disease = scanResult.diseaseName || scanResult.disease_name;
      const remedy = remedyTab === 'organic' 
        ? (scanResult.organicRemedy || scanResult.organic_remedy)
        : (scanResult.chemicalRemedy || scanResult.chemical_remedy);

      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const newTask = {
        id: `task-${Date.now()}`,
        farmId: 'farm-1',
        farmName: `${scanResult.crop || 'Crop'} Plot`,
        category: 'spray',
        title: `${disease} Spray Treatment`,
        dosage: remedy ? remedy.substring(0, 95) : 'Neem oil or standard fungicide spray',
        date: tomorrow,
        time: '07:00 AM',
        completed: false,
        urgent: true
      };

      try {
        const existing = JSON.parse(localStorage.getItem('agri_bandhu_tasks') || '[]');
        localStorage.setItem('agri_bandhu_tasks', JSON.stringify([newTask, ...existing]));
      } catch (e) {}
    }

    setShowScheduleToast(true);
    if (onNavigateFarm) {
      setTimeout(() => {
        onNavigateFarm();
      }, 350);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '1rem auto 3rem auto', padding: '0 1rem' }}>
      
      {/* Top Header Card - Deep Agricultural Forest Green from Screenshot 1 */}
      <div style={{
        padding: '1.25rem 1.75rem',
        marginBottom: '1.25rem',
        background: '#123924',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 20px rgba(18, 57, 36, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Weather & Location Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '0.45rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            color: '#ffffff',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sun size={17} color="#fde047" />
            <span>Noida · 28°C · Clear</span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '0.45rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            color: '#bbf7d0',
            fontWeight: 700
          }}>
            {user?.name ? user.name : 'Farmer Partner'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Fix 4: Gemini AI Key Status Button */}
          <button
            onClick={() => {
              setKeyInputValue(geminiKey || '');
              setKeyTestStatus(null);
              setShowKeyModal(true);
            }}
            style={{
              background: geminiKey ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              border: geminiKey ? '1px solid rgba(74, 222, 128, 0.5)' : '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.45rem 0.95rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
            title="Configure Google Gemini API Key"
          >
            <Sparkles size={15} color={geminiKey ? '#86efac' : '#fde047'} />
            <span>{geminiKey ? (lang === 'hi' ? 'Gemini AI एक्टिव' : 'Gemini AI Active') : (lang === 'hi' ? '🔑 Gemini Key' : '🔑 Gemini Key')}</span>
          </button>

          {onNavigateFarm && (
            <button
              onClick={onNavigateFarm}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.45rem 1rem',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sprout size={16} color="#86efac" />
              <span>{lang === 'hi' ? 'मेरा खेत व शेड्यूल' : 'My Farm & Schedule'}</span>
            </button>
          )}

          {/* Dual Language Switcher: अ / A */}
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>{lang === 'hi' ? 'अ' : 'A'}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>/ {lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </div>

      {/* Fix 7: Mandatory Login Warning Banner if user is not signed in */}
      {!user && (
        <div style={{
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '18px',
          padding: '1.1rem 1.4rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(220, 38, 38, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Lock size={22} color="#dc2626" />
            </div>
            <div>
              <div style={{ color: '#991b1b', fontWeight: 800, fontSize: '0.98rem' }}>
                {lang === 'hi' ? '🔒 पत्ती जांच के लिए लॉगिन अनिवार्य है' : '🔒 Login Required to Scan Crop Leaves'}
              </div>
              <div style={{ color: '#7f1d1d', fontSize: '0.84rem', marginTop: '0.15rem' }}>
                {lang === 'hi' ? 'अपनी फसल के रोग की जांच, सटीक जेमिनी उपचार और इतिहास सुरक्षित रखने के लिए कृपया पहले लॉगिन करें।' : 'Please sign in to scan plant leaves, formulate Gemini AI remedies, and save diagnostic history.'}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LogIn size={18} />
            <span>{lang === 'hi' ? 'लॉगिन / साइन अप करें' : 'Sign In to Scan'}</span>
          </button>
        </div>
      )}

      {/* Seasonal Alert Banner (from Screenshot 2 - Warm Amber Pill) */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '16px',
        padding: '0.9rem 1.35rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        boxShadow: '0 2px 10px rgba(245, 158, 11, 0.08)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#fef3c7',
          border: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={20} color="#d97706" />
        </div>
        <div>
          <div style={{ color: '#b45309', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.01em' }}>
            {t.alertTitle}: Early/Late Blight (झुलसा रोग)
          </div>
          <div style={{ color: '#92400e', fontSize: '0.84rem', marginTop: '0.1rem' }}>
            {t.alertText}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Scanner & Right Diagnosis Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Camera Viewfinder / Capture Section */}
        <div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            
            {/* Header Greeting */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#14281d', fontWeight: 800, margin: 0 }}>
                {t.welcome}
              </h2>
              <p style={{ color: '#4b5563', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                {t.greetingSub}
              </p>
            </div>

            {/* Viewfinder Container */}
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: cameraActive || selectedImage ? '#111613' : '#f8faf6',
              height: '380px',
              border: cameraActive || selectedImage ? '2px solid rgba(18, 57, 36, 0.4)' : '2px dashed #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: cameraActive || selectedImage ? '0 8px 30px rgba(0, 0, 0, 0.4)' : 'none'
            }}>
              
              {cameraActive ? (
                /* Active Camera Stream with Oval Guide Overlay */
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* Oval Dotted Leaf Guide Frame (from Screenshot 1) */}
                  <div className="oval-viewfinder">
                    <div style={{
                      position: 'absolute',
                      top: '40%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                      width: '85%'
                    }}>
                      {t.holdLeafPrompt}
                    </div>
                  </div>

                  {/* Top Bar Controls inside Viewfinder */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    right: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 20
                  }}>
                    <button
                      onClick={stopCamera}
                      style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <X size={14} /> Close
                    </button>

                    <div style={{
                      background: 'rgba(16, 185, 129, 0.85)',
                      color: '#ffffff',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <span style={{ width: '6px', height: '6px', background: '#ffffff', borderRadius: '50%' }} />
                      ● Ready
                    </div>
                  </div>

                  {/* Bottom Guidance Status Pill */}
                  <div style={{
                    position: 'absolute',
                    bottom: '4.8rem',
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: '#e5e7eb',
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    zIndex: 20
                  }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>● {t.distanceLocked}</span>
                    <span style={{ color: '#9ca3af' }}>· ☀️ {t.daylightGood}</span>
                  </div>

                  {/* Viewfinder Controls Dock */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0.9rem',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '0 1.5rem',
                    zIndex: 20
                  }}>
                    {/* Gallery picker */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: 'rgba(0, 0, 0, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Upload from Gallery"
                    >
                      <Upload size={20} />
                    </button>

                    {/* Main Leaf Shutter Button */}
                    <button
                      onClick={capturePhoto}
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '4px solid #10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)'
                      }}
                    >
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        <Leaf size={26} />
                      </div>
                    </button>

                    {/* Voice Guide prompt */}
                    <button
                      onClick={() => toggleAudioSpeech(lang === 'hi' ? 'पत्ती को फ्रेम के बीच में सीधा रखें।' : 'Hold leaf straight in center.')}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: 'rgba(0, 0, 0, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: isPlayingAudio ? '#34d399' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Voice Guide"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                </>
              ) : selectedImage ? (
                /* Selected Image Preview with Laser Scanning Overlay */
                <>
                  <img src={selectedImage} alt="Selected Leaf" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isScanning && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(6, 78, 59, 0.8)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                    }}>
                      <div style={{ animation: 'spin 1.5s linear infinite' }}>
                        <RefreshCw size={44} color="#34d399" />
                      </div>
                      <span style={{ marginTop: '1.2rem', fontWeight: 800, fontSize: '1.15rem' }}>
                        {t.diagnosing}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#a7f3d0', marginTop: '0.3rem', maxWidth: '80%', textAlign: 'center' }}>
                        {t.analyzingSub}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                /* Idle Action Card */
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)'
                  }}>
                    <Camera size={34} color="#059669" />
                  </div>
                  <h3 style={{ color: '#14281d', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {t.tapToScan}
                  </h3>
                  <p style={{ color: '#4b5563', fontSize: '0.85rem', marginTop: '0.4rem', maxWidth: '280px' }}>
                    {t.supportsFormats}
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Quick Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={startCamera}
                className="btn-primary"
                disabled={isScanning}
                style={{ padding: '0.85rem', fontSize: '0.9rem' }}
              >
                <Camera size={18} />
                <span>{t.useCamera}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                disabled={isScanning}
                style={{ padding: '0.85rem', fontSize: '0.9rem' }}
              >
                <Upload size={18} />
                <span>{t.uploadGallery}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Pathology Diagnostic & Treatment Deck */}
        <div>
          {scanResult ? (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              
              {/* Top Diagnosis Header & Audio Listen Button */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                borderBottom: '1px solid #e5eae1',
                paddingBottom: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {scanResult.crop} Leaf Pathology
                  </div>
                  <h3 style={{ fontSize: '1.55rem', color: '#14281d', fontWeight: 800, margin: '0.2rem 0' }}>
                    {scanResult.diseaseName || scanResult.disease_name}
                  </h3>
                  <div style={{ fontSize: '0.86rem', color: '#6b7280', fontStyle: 'italic' }}>
                    {scanResult.scientificName || scanResult.scientific_name}
                  </div>
                </div>

                {/* Top Action Buttons: Retake Photo & Audio Listen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setScanResult(null);
                      startCamera();
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <RefreshCw size={15} />
                    <span>{t.retakePhoto}</span>
                  </button>

                  <button
                    onClick={() => toggleAudioSpeech()}
                    style={{
                      background: isPlayingAudio ? '#fef2f2' : '#f0fdf4',
                      border: `1px solid ${isPlayingAudio ? '#fecaca' : '#bbf7d0'}`,
                      color: isPlayingAudio ? '#dc2626' : '#15803d',
                      padding: '0.5rem 1.1rem',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 2px 8px rgba(22, 101, 52, 0.08)'
                    }}
                  >
                    {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isPlayingAudio ? t.stopAudio : t.listen}</span>
                  </button>
                </div>
              </div>

              {/* Severity Meter (from Screenshot 1 & 2) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 700 }}>
                    <CheckCircle size={16} />
                    <span>{t.symptomMatch}</span>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                    AI Confidence: <strong style={{ color: '#15803d' }}>{scanResult.confidence}%</strong>
                  </div>
                </div>

                {/* 3-Step Severity Bar */}
                <div className="severity-track">
                  <div className={`severity-step ${getSeverityLevel() === 'mild' ? 'active-mild' : ''}`}>
                    {t.mild}
                  </div>
                  <div className={`severity-step ${getSeverityLevel() === 'moderate' ? 'active-moderate' : ''}`}>
                    {t.moderate}
                  </div>
                  <div className={`severity-step ${getSeverityLevel() === 'severe' ? 'active-severe' : ''}`}>
                    {t.severe}
                  </div>
                </div>
              </div>

              {/* Agronomist Audio Player Card (Screenshot 2 - Deep Forest Green) */}
              <div style={{
                background: '#123924',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 4px 15px rgba(18, 57, 36, 0.15)',
                borderRadius: '18px',
                padding: '1.1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <button
                  onClick={() => toggleAudioSpeech()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
                  }}
                >
                  {isPlayingAudio ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#bbf7d0', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800 }}>🔊 {t.agronomistAudio}</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{isPlayingAudio ? '0:22 / 0:45' : '0:00 / 0:45'}</span>
                  </div>

                  {/* Audio Waveform visualization */}
                  <div className="audio-wave">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((i) => (
                      <div
                        key={i}
                        className="audio-bar"
                        style={{
                          height: isPlayingAudio ? undefined : `${(i % 5 + 1) * 3}px`,
                          animationPlayState: isPlayingAudio ? 'running' : 'paused'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Treatment Deck Section (from Screenshot 1 & 2) */}
              <div id="treatment-deck" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', color: '#14281d', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={19} color="#15803d" />
                    <span>{t.treatmentDeck}</span>
                  </h4>

                  {/* Fix 4: Live Gemini Cure Status Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: scanResult.cureSource === 'gemini' ? '#ecfdf5' : '#f8fafc',
                    border: `1px solid ${scanResult.cureSource === 'gemini' ? '#a7f3d0' : '#e2e8f0'}`,
                    color: scanResult.cureSource === 'gemini' ? '#047857' : '#64748b',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    <Sparkles size={14} color={scanResult.cureSource === 'gemini' ? '#10b981' : '#94a3b8'} />
                    <span>
                      {isGeneratingCure 
                        ? (lang === 'hi' ? '✨ जेमिनी एआई उपचार तैयार हो रहा है...' : '✨ Formulating Gemini AI cure...')
                        : scanResult.cureSource === 'gemini'
                          ? (lang === 'hi' ? '✨ Gemini 1.5 Flash AI उपचार' : '✨ Gemini 1.5 Flash AI Cure')
                          : (lang === 'hi' ? 'कृषि संस्तुति उपचार' : 'Agronomist Protocol')}
                    </span>
                  </div>
                </div>

                {/* Treatment Deck Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  background: '#e9eee5',
                  padding: '4px',
                  borderRadius: '14px',
                  marginBottom: '1rem',
                  border: '1px solid #d9e2d4'
                }}>
                  <button
                    onClick={() => setRemedyTab('organic')}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.5rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: remedyTab === 'organic' ? '#123924' : 'transparent',
                      color: remedyTab === 'organic' ? '#ffffff' : '#4b5563',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: remedyTab === 'organic' ? '0 2px 6px rgba(18, 57, 36, 0.2)' : 'none'
                    }}
                  >
                    🌿 {t.tabOrganic}
                  </button>

                  <button
                    onClick={() => setRemedyTab('chemical')}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.5rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: remedyTab === 'chemical' ? '#d97706' : 'transparent',
                      color: remedyTab === 'chemical' ? '#ffffff' : '#4b5563',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: remedyTab === 'chemical' ? '0 2px 6px rgba(217, 119, 6, 0.2)' : 'none'
                    }}
                  >
                    🧪 {t.tabChemical}
                  </button>

                  <button
                    onClick={() => setRemedyTab('prevent')}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.5rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: remedyTab === 'prevent' ? '#1e40af' : 'transparent',
                      color: remedyTab === 'prevent' ? '#ffffff' : '#4b5563',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: remedyTab === 'prevent' ? '0 2px 6px rgba(30, 64, 175, 0.2)' : 'none'
                    }}
                  >
                    🛡️ {t.tabPrevent}
                  </button>
                </div>

                {/* Treatment Content Card */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e5eae1',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 2px 10px rgba(18, 57, 36, 0.03)'
                }}>
                  {remedyTab === 'organic' && (
                    <div>
                      <div style={{ color: '#15803d', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                        🌱 Neem Oil & Bio-Fungicide Solution (नीम का तेल)
                      </div>
                      
                      {/* Dosage Recipe with water drops (Screenshot 2) */}
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.86rem', color: '#166534', marginBottom: '0.35rem', fontWeight: 600 }}>
                          💧 <strong>5 ml Neem Oil</strong> per 1L water (5 मि.ली. नीम तेल + 1L पानी)
                        </div>
                        <div style={{ fontSize: '0.86rem', color: '#166534', fontWeight: 600 }}>
                          💧 Add <strong>2 drops</strong> mild soap / detergent for spreadability
                        </div>
                      </div>

                      <div style={{ color: '#374151', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {scanResult.organicRemedy || scanResult.organic_remedy}
                      </div>

                      <div style={{ marginTop: '0.85rem', borderTop: '1px solid #e5eae1', paddingTop: '0.75rem' }}>
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '10px' }}>
                          <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 800, marginBottom: '0.2rem' }}>
                            🔍 {t.fieldActions}:
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#92400e' }}>
                            • Prune lowest 15-20 cm of infected leaves to stop soil splash.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {remedyTab === 'chemical' && (
                    <div>
                      <div style={{ color: '#d97706', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                        🧪 Standard Fungicide Spray
                      </div>
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.86rem', color: '#92400e', fontWeight: 600 }}>
                          💧 Apply <strong>2g per liter</strong> of water using flat-fan nozzle sprayer.
                        </div>
                      </div>
                      <div style={{ color: '#374151', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {scanResult.chemicalRemedy || scanResult.chemical_remedy}
                      </div>
                    </div>
                  )}

                  {remedyTab === 'prevent' && (
                    <div>
                      <div style={{ color: '#1e40af', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                        🛡️ Crop Rotation & Canopy Sanitation
                      </div>
                      <div style={{ color: '#374151', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {scanResult.prevention || 'Maintain 60cm plant spacing for air circulation and avoid sprinkler irrigation.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Voice Question, Schedule & WhatsApp (Screenshot 2) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Hold to Ask Question Button (Golden Amber CTA) */}
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="btn-amber"
                  style={{ width: '100%', padding: '0.95rem' }}
                >
                  <Mic size={19} />
                  <span>{t.askQuestionBtn}</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    onClick={handleScheduleReminder}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#14281d',
                      padding: '0.8rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Calendar size={16} color="#15803d" />
                    <span>{t.addSchedule}</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#15803d',
                      padding: '0.8rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 6px rgba(22, 101, 52, 0.05)'
                    }}
                  >
                    <Share2 size={16} />
                    <span>{t.shareWhatsApp}</span>
                  </button>
                </div>

                {showScheduleToast && (
                  <div style={{
                    background: '#15803d',
                    color: '#ffffff',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '0.84rem',
                    fontWeight: 700
                  }}>
                    ✓ Treatment reminder added to farmer calendar!
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Empty State Guide Card */
            <div className="glass-panel" style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                border: '1px solid #a7f3d0',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)'
              }}>
                <Scan size={44} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#14281d', fontWeight: 800 }}>
                {t.checkHealthBtn}
              </h3>
              <p style={{ color: '#4b5563', fontSize: '0.9rem', maxWidth: '340px', marginTop: '0.5rem', lineHeight: '1.6' }}>
                {lang === 'hi'
                  ? 'पत्ती की फोटो खींचें या गैलरी से अपलोड करें। एआई तुरंत रोग की पहचान कर जैविक व रासायनिक उपचार बताएगा।'
                  : 'Capture or upload a crop leaf picture. AI instantly diagnoses disease severity and provides organic & chemical remedies.'
                }
              </p>
            </div>
          )}
        </div>

      </div>



      {/* Voice Assistant / Ask Question Modal (Screenshot 2) */}
      {showVoiceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 16, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5eae1',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 800 }}>
                <Bot size={22} />
                <span>{lang === 'hi' ? 'जेमिनी एआई कृषि विशेषज्ञ से पूछें' : 'Gemini AI Agronomist Voice Advisor'}</span>
              </div>
              <button 
                onClick={() => { 
                  setShowVoiceModal(false); 
                  setAiAnswer(''); 
                  setIsListeningVoice(false);
                  if (isPlayingAudio) {
                    window.speechSynthesis.cancel();
                    setIsPlayingAudio(false);
                  }
                }}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Gemini Live AI Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: '#166534',
              fontWeight: 600
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} color="#15803d" />
                <span>{geminiKey ? 'Gemini 1.5 Flash AI Active' : (lang === 'hi' ? 'Gemini API Key सेट करें' : 'Set Gemini API Key')}</span>
              </div>
              <button
                onClick={() => {
                  setShowVoiceModal(false);
                  setKeyInputValue(geminiKey || '');
                  setKeyTestStatus(null);
                  setShowKeyModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {lang === 'hi' ? 'कुंजी बदलें' : 'Edit Key'}
              </button>
            </div>

            {/* Central Animated Voice Recording Button (Fix 5) */}
            <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
              <button
                type="button"
                onClick={startVoiceRecording}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: isListeningVoice 
                    ? '#dc2626' 
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  border: isListeningVoice ? '4px solid #fecaca' : '4px solid #bbf7d0',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isListeningVoice 
                    ? '0 0 25px rgba(220, 38, 38, 0.6)' 
                    : '0 4px 20px rgba(22, 163, 74, 0.35)',
                  transition: 'all 0.2s ease',
                  animation: isListeningVoice ? 'pulse 1.2s infinite' : 'none'
                }}
                title={lang === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap to speak'}
              >
                <Mic size={32} />
              </button>
              <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 700, color: isListeningVoice ? '#dc2626' : '#374151' }}>
                {isListeningVoice 
                  ? (lang === 'hi' ? '🔴 आपकी आवाज सुनी जा रही है... बोलें' : '🔴 Listening to your voice... Speak now') 
                  : (lang === 'hi' ? 'माइक दबाकर बोलें या नीचे लिखें' : 'Tap mic to speak or type below')}
              </div>
            </div>

            {/* Text Input Row */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder={lang === 'hi' ? 'जैसे: नीम तेल का छिड़काव कब करें?' : 'e.g., When should I spray neem oil?'}
                style={{
                  flex: 1,
                  background: '#f8faf6',
                  border: '1px solid #cbd5e1',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  color: '#14281d',
                  fontSize: '0.9rem'
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAskQuestion(userQuestion); }}
              />
              <button
                onClick={() => handleAskQuestion(userQuestion)}
                className="btn-primary"
                style={{ padding: '0.75rem 1.25rem' }}
                disabled={isAnsweringVoice || !userQuestion.trim()}
              >
                {isAnsweringVoice ? '...' : (lang === 'hi' ? 'पूछें' : 'Ask')}
              </button>
            </div>

            {/* Quick Question Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {[
                lang === 'hi' ? 'नीम तेल कब छिड़कें?' : 'Best time to spray neem oil?',
                lang === 'hi' ? 'सिंचाई कब करें?' : 'When to irrigate?',
                lang === 'hi' ? 'दवा की सही मात्रा क्या है?' : 'What is the exact dosage?'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => { setUserQuestion(chip); handleAskQuestion(chip); }}
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* AI Agronomist Answer Display */}
            {aiAnswer && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '1.1rem',
                borderRadius: '14px',
                color: '#14281d',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                <div style={{ fontWeight: 800, color: '#15803d', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={16} />
                    <span>Agri Bandhu Gemini Advisor:</span>
                  </div>
                  <button
                    onClick={() => toggleAudioSpeech(aiAnswer)}
                    style={{
                      background: isPlayingAudio ? '#fef2f2' : '#ffffff',
                      border: `1px solid ${isPlayingAudio ? '#fecaca' : '#bbf7d0'}`,
                      color: isPlayingAudio ? '#dc2626' : '#15803d',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{isPlayingAudio ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सुनें' : 'Listen')}</span>
                  </button>
                </div>
                {aiAnswer}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fix 4: Gemini API Key Setup Modal for Web & APK */}
      {showKeyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 16, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5eae1',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 800 }}>
                <Key size={22} />
                <span>{lang === 'hi' ? 'Google Gemini API Key' : 'Configure Gemini API Key'}</span>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#4b5563', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              {lang === 'hi' 
                ? 'रोग पहचान के बाद गतिशील जैविक व रासायनिक उपचार नुस्खे बनाने तथा वॉइस सलाहकार के लिए अपनी Google Gemini API कुंजी दर्ज करें।' 
                : 'Enter your Google Gemini API key to formulate real-time customized disease treatments and power the voice agronomist advisor.'}
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#14281d', marginBottom: '0.4rem' }}>
                Gemini API Key (Google AI Studio)
              </label>
              <input
                type="password"
                value={keyInputValue}
                onChange={(e) => { setKeyInputValue(e.target.value); setKeyTestStatus(null); }}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#f8faf6',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  color: '#14281d',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: '0.4rem' }}>
                {lang === 'hi' ? 'मुफ्त कुंजी प्राप्त करें:' : 'Get free key from:'} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 700 }}>Google AI Studio</a>
              </div>
            </div>

            {keyTestStatus === 'success' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} color="#166534" />
                <span>{lang === 'hi' ? 'Gemini API सफलतापूर्वक कनेक्ट हो गई!' : 'Gemini API verified and saved successfully!'}</span>
              </div>
            )}

            {keyTestStatus === 'error' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <AlertTriangle size={18} color="#dc2626" />
                <span>{lang === 'hi' ? 'अमान्य API कुंजी या नेटवर्क त्रुटि। कृपया कुंजी जांचें।' : 'Invalid API key or network error. Please verify your key.'}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setKeyInputValue('');
                  geminiService.setApiKey('');
                  setGeminiKey('');
                  setShowKeyModal(false);
                }}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#4b5563',
                  cursor: 'pointer'
                }}
              >
                {lang === 'hi' ? 'कुंजी हटाएं' : 'Clear Key'}
              </button>

              <button
                type="button"
                onClick={handleSaveGeminiKey}
                disabled={keyTestStatus === 'testing'}
                className="btn-primary"
                style={{ padding: '0.75rem', fontSize: '0.88rem' }}
              >
                {keyTestStatus === 'testing' ? 'Testing...' : (lang === 'hi' ? 'सहेजें व टेस्ट करें' : 'Save & Test')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

