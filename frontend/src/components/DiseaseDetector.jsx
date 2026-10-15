import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Scan, CheckCircle, AlertTriangle, XCircle, RefreshCw, 
  Leaf, Shield, Info, Save, Layers, Sparkles, ArrowRight, Volume2, 
  VolumeX, Play, Pause, MessageCircle, Calendar, Mic, X, ChevronRight, 
  Sun, Zap, ArrowLeft, Check, HelpCircle, Share2
} from 'lucide-react';
import { diseaseService } from '../services/api';

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

export default function DiseaseDetector({ user }) {
  const [lang, setLang] = useState('hi'); // 'hi' | 'en'
  const t = I18N[lang];

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
  const [showScheduleToast, setShowScheduleToast] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech Speech Synthesis for Farmers
  const toggleAudioSpeech = (textOverride = null) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    let speechText = textOverride;
    if (!speechText && scanResult) {
      const disease = scanResult.diseaseName || scanResult.disease_name;
      const remedy = remedyTab === 'organic' 
        ? (scanResult.organicRemedy || scanResult.organic_remedy)
        : (scanResult.chemicalRemedy || scanResult.chemical_remedy);
      speechText = lang === 'hi' 
        ? `फसल में ${disease} के लक्षण पाए गए हैं। उपचार के लिए: ${remedy}`
        : `Detected ${disease}. Recommended treatment: ${remedy}`;
    }

    if (!speechText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Start Camera with guided viewfinder
  const startCamera = async () => {
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

  const compressImage = (dataUrl, maxWidth = 640, quality = 0.8) => {
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

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const rawData = canvasRef.current.toDataURL('image/jpeg');
      const compressed = await compressImage(rawData);
      setSelectedImage(compressed);
      stopCamera();
      runAnalysis(compressed);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const compressed = await compressImage(reader.result);
        setSelectedImage(compressed);
        runAnalysis(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = async (sample) => {
    setSelectedImage(sample.image);
    stopCamera();
    setIsScanning(true);
    setScanResult(null);
    setSavedSuccess(false);

    try {
      const res = await diseaseService.scanLeaf(sample.image);
      if (res && res.diagnosis) {
        setScanResult({ 
          ...sample, 
          ...res.diagnosis, 
          image: res.image_url || sample.image,
          referenceImg: sample.referenceImg || sample.image
        });
        setSavedSuccess(true);
      } else {
        setScanResult(sample);
      }
    } catch (e) {
      setScanResult(sample);
    } finally {
      setIsScanning(false);
    }
  };

  const runAnalysis = async (imgSrc) => {
    setIsScanning(true);
    setScanResult(null);
    setSavedSuccess(false);

    try {
      const compressed = await compressImage(imgSrc);
      const res = await diseaseService.scanLeaf(compressed);
      if (res && res.diagnosis) {
        const predictedClass = res.diagnosis.predicted_class || '';
        const matchedReference = REFERENCE_SYMPTOM_IMAGES[predictedClass] || REFERENCE_SYMPTOM_IMAGES['default'];

        setScanResult({
          ...res.diagnosis,
          image: res.image_url || compressed,
          referenceImg: matchedReference,
          scan_id: res.scan_id
        });
        setSavedSuccess(true);
      } else {
        setScanResult({
          crop: 'Network / Server Notice',
          diseaseName: 'Cloud AI Responded with Inconclusive',
          scientificName: 'Retry with clear lighting',
          status: 'invalid',
          confidence: 0,
          image: compressed,
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

  // Farmer Voice Question Handler
  const handleAskQuestion = (q) => {
    setIsAnsweringVoice(true);
    setTimeout(() => {
      let reply = '';
      const textLower = (q || userQuestion).toLowerCase();
      if (textLower.includes('neem') || textLower.includes('spray') || textLower.includes('छिड़काव')) {
        reply = lang === 'hi' 
          ? 'नीम के तेल का छिड़काव सुबह 7-9 बजे या शाम को 5 बजे के बाद करें जब धूप तेज न हो।' 
          : 'Spray neem oil emulsion in the early morning or evening when direct sunlight is low.';
      } else if (textLower.includes('water') || textLower.includes('पानी')) {
        reply = lang === 'hi'
          ? 'पत्तियों पर ऊपर से पानी न डालें। केवल जड़ों में ड्रिप या क्यारी विधि से सिंचाई करें।'
          : 'Avoid wetting the leaves directly. Irrigate at the root zone to prevent fungal spread.';
      } else {
        reply = lang === 'hi'
          ? 'लक्षण मध्यम अवस्था में हैं। नीचे की खराब पत्तियों को तुरंत तोड़कर खेत से दूर नष्ट करें।'
          : 'Symptoms are moderate. Prune infected lower foliage immediately and burn or bury away from field.';
      }
      setAiAnswer(reply);
      setIsAnsweringVoice(false);
      toggleAudioSpeech(reply);
    }, 900);
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
    setShowScheduleToast(true);
    setTimeout(() => setShowScheduleToast(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '1rem auto 3rem auto', padding: '0 1rem' }}>
      
      {/* Top Header Card - Matching Mobile & Web Screens */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(16, 28, 23, 0.95) 0%, rgba(10, 20, 16, 0.98) 100%)',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Weather & Location Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.45rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            color: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sun size={16} color="#fbbf24" />
            <span>Noida · 28°C · Clear</span>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            padding: '0.45rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            color: '#34d399',
            fontWeight: 700
          }}>
            {user?.name ? user.name : 'Farmer Partner'}
          </div>
        </div>

        {/* Dual Language Switcher: अ / A */}
        <button
          onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            padding: '0.45rem 1rem',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
          }}
        >
          <span style={{ fontSize: '1.05rem' }}>{lang === 'hi' ? 'अ' : 'A'}</span>
          <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>/ {lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      {/* Seasonal Alert Banner (from Screenshot 2) */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '16px',
        padding: '0.9rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(245, 158, 11, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={20} color="#fbbf24" />
        </div>
        <div>
          <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.02em' }}>
            {t.alertTitle}: Early/Late Blight (झुलसा रोग)
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.83rem', marginTop: '0.1rem' }}>
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
              <h2 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
                {t.welcome}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                {t.greetingSub}
              </p>
            </div>

            {/* Viewfinder Container */}
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: '#050a08',
              height: '380px',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
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
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)'
                  }}>
                    <Camera size={34} color="#34d399" />
                  </div>
                  <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {t.tapToScan}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.4rem', maxWidth: '280px' }}>
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

            {/* Recent Plots (मेरे खेत) Section from Screenshot 2 */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#f3f4f6', fontWeight: 700, margin: 0 }}>
                  {t.recentPlots}
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#34d399', cursor: 'pointer', fontWeight: 600 }}>
                  View All Plots →
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {/* Plot 1 */}
                <div 
                  onClick={() => handleSelectSample(SAMPLE_LEAF_PRESETS[0])}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <img src="/images/crops/tomato.png" alt="Tomato" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f3f4f6', marginTop: '0.5rem' }}>
                    {t.plot1Title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '0.1rem' }}>
                    {t.plot1Status}
                  </div>
                </div>

                {/* Plot 2 */}
                <div 
                  onClick={() => handleSelectSample(SAMPLE_LEAF_PRESETS[1])}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <img src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80" alt="Potato" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f3f4f6', marginTop: '0.5rem' }}>
                    {t.plot2Title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.1rem' }}>
                    {t.plot2Status}
                  </div>
                </div>

                {/* Plot 3 */}
                <div 
                  onClick={() => handleSelectSample(SAMPLE_LEAF_PRESETS[2])}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <img src="https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80" alt="Corn" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f3f4f6', marginTop: '0.5rem' }}>
                    {t.plot3Title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.1rem' }}>
                    {t.plot3Status}
                  </div>
                </div>
              </div>
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
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {scanResult.crop} Leaf Pathology
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800, margin: '0.2rem 0' }}>
                    {scanResult.diseaseName || scanResult.disease_name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>
                    {scanResult.scientificName || scanResult.scientific_name}
                  </div>
                </div>

                {/* Audio Listen Button from Screenshot 1 */}
                <button
                  onClick={() => toggleAudioSpeech()}
                  style={{
                    background: isPlayingAudio ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    border: `1px solid ${isPlayingAudio ? 'rgba(239, 68, 68, 0.5)' : 'rgba(52, 211, 153, 0.4)'}`,
                    color: isPlayingAudio ? '#f87171' : '#34d399',
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isPlayingAudio ? t.stopAudio : t.listen}</span>
                </button>
              </div>

              {/* Severity Meter (from Screenshot 1 & 2) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700 }}>
                    <CheckCircle size={15} />
                    <span>{t.symptomMatch}</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                    AI Confidence: <strong style={{ color: '#34d399' }}>{scanResult.confidence}%</strong>
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

              {/* Side-by-Side Leaf Comparison Card (Matching Screenshot 1 & 2) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.88rem', color: '#f3f4f6', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
                  {t.doesLeafLookLike}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* Your Photo */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', height: '110px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <img src={scanResult.image || selectedImage} alt="Your Leaf" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', marginTop: '0.35rem' }}>
                      {t.yourPhoto}
                    </span>
                  </div>

                  {/* Target Reference Photo with checkmark */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', height: '110px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #10b981' }}>
                      <img src={scanResult.referenceImg || REFERENCE_SYMPTOM_IMAGES['default']} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: '#10b981',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, display: 'block', marginTop: '0.35rem' }}>
                      {t.targetReference}
                    </span>
                  </div>
                </div>

                {/* Yes View Remedy & Retake Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.6rem', marginTop: '0.85rem' }}>
                  <button
                    onClick={() => {
                      document.getElementById('treatment-deck')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.6rem 0.8rem',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>✓ {t.yesViewRemedy}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setScanResult(null);
                      startCamera();
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#d1d5db',
                      borderRadius: '12px',
                      padding: '0.6rem 0.8rem',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    ↺ {t.retakePhoto}
                  </button>
                </div>
              </div>

              {/* Agronomist Audio Player Card (Screenshot 2) */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.6) 0%, rgba(4, 47, 36, 0.7) 100%)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '16px',
                padding: '1rem',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#a7f3d0', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700 }}>🔊 {t.agronomistAudio}</span>
                    <span>{isPlayingAudio ? '0:22 / 0:45' : '0:00 / 0:45'}</span>
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
                <h4 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="#34d399" />
                  <span>{t.treatmentDeck}</span>
                </h4>

                {/* Treatment Deck Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '4px',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <button
                    onClick={() => setRemedyTab('organic')}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: remedyTab === 'organic' ? '#059669' : 'transparent',
                      color: remedyTab === 'organic' ? '#ffffff' : '#9ca3af',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🌿 {t.tabOrganic}
                  </button>

                  <button
                    onClick={() => setRemedyTab('chemical')}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: remedyTab === 'chemical' ? '#d97706' : 'transparent',
                      color: remedyTab === 'chemical' ? '#ffffff' : '#9ca3af',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🧪 {t.tabChemical}
                  </button>

                  <button
                    onClick={() => setRemedyTab('prevent')}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: remedyTab === 'prevent' ? '#2563eb' : 'transparent',
                      color: remedyTab === 'prevent' ? '#ffffff' : '#9ca3af',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🛡️ {t.tabPrevent}
                  </button>
                </div>

                {/* Treatment Content Card */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  borderRadius: '16px',
                  padding: '1.25rem'
                }}>
                  {remedyTab === 'organic' && (
                    <div>
                      <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                        🌱 Neem Oil & Bio-Fungicide Solution
                      </div>
                      
                      {/* Dosage Recipe with water drops (Screenshot 2) */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#e5e7eb', marginBottom: '0.3rem' }}>
                          💧 <strong>5 ml Neem Oil</strong> per 1L water (5 मि.ली. नीम तेल + 1L पानी)
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                          💧 Add <strong>2 drops</strong> mild soap / detergent for spreadability
                        </div>
                      </div>

                      <div style={{ color: '#d1d5db', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {scanResult.organicRemedy || scanResult.organic_remedy}
                      </div>

                      <div style={{ marginTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.2rem' }}>
                          🔍 {t.fieldActions}:
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
                          • Prune lowest 15-20 cm of infected leaves to stop soil splash.
                        </div>
                      </div>
                    </div>
                  )}

                  {remedyTab === 'chemical' && (
                    <div>
                      <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                        🧪 Standard Fungicide Spray
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                          💧 Apply <strong>2g per liter</strong> of water using flat-fan nozzle sprayer.
                        </div>
                      </div>
                      <div style={{ color: '#d1d5db', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {scanResult.chemicalRemedy || scanResult.chemical_remedy}
                      </div>
                    </div>
                  )}

                  {remedyTab === 'prevent' && (
                    <div>
                      <div style={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                        🛡️ Crop Rotation & Canopy Sanitation
                      </div>
                      <div style={{ color: '#d1d5db', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {scanResult.prevention || 'Maintain 60cm plant spacing for air circulation and avoid sprinkler irrigation.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Voice Question, Schedule & WhatsApp (Screenshot 2) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                {/* Hold to Ask Question Button */}
                <button
                  onClick={() => setShowVoiceModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.85rem',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(217, 119, 6, 0.35)'
                  }}
                >
                  <Mic size={18} />
                  <span>{t.askQuestionBtn}</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <button
                    onClick={handleScheduleReminder}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#e5e7eb',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Calendar size={16} color="#34d399" />
                    <span>{t.addSchedule}</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    style={{
                      background: 'rgba(37, 211, 102, 0.15)',
                      border: '1px solid rgba(37, 211, 102, 0.35)',
                      color: '#25d366',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Share2 size={16} />
                    <span>{t.shareWhatsApp}</span>
                  </button>
                </div>

                {showScheduleToast && (
                  <div style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '0.6rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '0.82rem',
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
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                border: '1px solid rgba(52, 211, 153, 0.25)'
              }}>
                <Scan size={44} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#ffffff', fontWeight: 800 }}>
                {t.checkHealthBtn}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', maxWidth: '340px', marginTop: '0.5rem', lineHeight: '1.6' }}>
                {lang === 'hi'
                  ? 'पत्ती की फोटो खींचें या गैलरी से अपलोड करें। एआई तुरंत रोग की पहचान कर जैविक व रासायनिक उपचार बताएगा।'
                  : 'Capture or upload a crop leaf picture. AI instantly diagnoses disease severity and provides organic & chemical remedies.'
                }
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Preset Samples Bar */}
      <div style={{ marginTop: '2.5rem' }}>
        <h4 style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.04em' }}>
          🌿 {t.samplePresets}:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {SAMPLE_LEAF_PRESETS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="glass-panel"
              style={{
                padding: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <img src={sample.image} alt={sample.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f3f4f6' }}>{sample.name}</div>
                <div style={{ fontSize: '0.75rem', color: sample.status === 'healthy' ? '#34d399' : '#fbbf24' }}>
                  {sample.diseaseName.split('(')[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Assistant / Ask Question Modal (Screenshot 2) */}
      {showVoiceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
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
            background: 'rgba(16, 28, 23, 0.98)',
            border: '1px solid rgba(52, 211, 153, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 800 }}>
                <Mic size={20} />
                <span>{lang === 'hi' ? 'कृषि मित्र से सवाल पूछें' : 'Ask Agronomist Question'}</span>
              </div>
              <button 
                onClick={() => { setShowVoiceModal(false); setAiAnswer(''); }}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {lang === 'hi' 
                ? 'छिड़काव का समय, पानी की मात्रा या अन्य दवाओं के बारे में पूछें:' 
                : 'Ask about spray timings, dosage amounts, or weather precautions:'}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder={lang === 'hi' ? 'जैसे: नीम तेल का छिड़काव कब करें?' : 'e.g., When should I spray neem oil?'}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAskQuestion(userQuestion); }}
              />
              <button
                onClick={() => handleAskQuestion(userQuestion)}
                className="btn-primary"
                style={{ padding: '0.75rem 1.25rem' }}
                disabled={isAnsweringVoice}
              >
                {isAnsweringVoice ? '...' : (lang === 'hi' ? 'पूछें' : 'Ask')}
              </button>
            </div>

            {/* Quick Question Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {[
                lang === 'hi' ? 'नीम तेल कब छिड़कें?' : 'Best time to spray neem oil?',
                lang === 'hi' ? 'सिंचाई कब करें?' : 'When to irrigate?',
                lang === 'hi' ? 'पत्तियां काटना जरूरी है?' : 'Should I prune leaves?'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => { setUserQuestion(chip); handleAskQuestion(chip); }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#34d399',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* AI Agronomist Answer */}
            {aiAnswer && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '1rem',
                borderRadius: '14px',
                color: '#e5e7eb',
                fontSize: '0.88rem',
                lineHeight: '1.5'
              }}>
                <div style={{ fontWeight: 800, color: '#34d399', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={15} /> Agri Bandhu Advisor:
                </div>
                {aiAnswer}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
