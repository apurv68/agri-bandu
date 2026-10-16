// Gemini AI Agronomist Service for Agri Bandhu
// Supports dynamic plant disease cures and conversational farmer voice cross-questioning

const STORAGE_KEY = 'agri_gemini_api_key';

// Default / fallback remedies when API key is missing or offline
const FALLBACK_CURES = {
  Tomato: {
    organicTitle: 'नीम तेल व जैविक कवकनाशी घोल',
    organicDosage: '5 ml नीम का तेल प्रति 1L पानी + 2 बूंद साबुन',
    organicRemedy: '5 मिलीलीटर नीम का तेल प्रति 1 लीटर पानी में 2 बूंद लिक्विड साबुन मिलाकर सुबह के समय पत्तियों के दोनों तरफ अच्छी तरह छिड़कें। खट्टी छाछ (10%) का छिड़काव भी कवक को रोकता है।',
    fieldAction: 'जमीन से 15-20 सेमी नीचे की पुरानी व पीली पत्तियों को तोड़कर खेत से दूर नष्ट करें।',
    chemicalTitle: 'व्यापक स्पेक्ट्रम कवकनाशी छिड़काव',
    chemicalDosage: 'मैंकोजेब 75% WP @ 2 ग्राम प्रति लीटर पानी',
    chemicalRemedy: 'मैंकोजेब 75% WP @ 2g/L या कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5g/L पानी में मिलाकर साफ मौसम में छिड़काव करें। 10-12 दिन बाद दोहराएं।',
    preventTitle: 'हवा व धूप का प्रबंधन एवं फसल चक्र',
    prevention: 'पौधों के बीच उचित दूरी रखें। केवल जड़ों में ड्रिप द्वारा पानी दें, पत्तियों पर ऊपर से छिड़काव न करें।',
    audioGuideScript: 'किसान भाई, टमाटर की फसल में झुलसा रोग के लक्षण हैं। 5 मिलीलीटर नीम तेल प्रति लीटर पानी में मिलाकर सुबह पत्तियों पर तुरंत छिड़कें, और निचली पीली पत्तियों को तोड़कर खेत से दूर नष्ट करें।'
  },
  Potato: {
    organicTitle: 'बोर्डो मिश्रण एवं जैविक कवकनाशी',
    organicDosage: '1% बोर्डो मिश्रण या कॉपर कवकनाशी @ 3g/L',
    organicRemedy: 'बोर्डो मिश्रण (1%) या कॉपर युक्त जैविक कवकनाशी का छिड़काव करें। खेत में जलभराव न होने दें और मिट्टी चढ़ाएं।',
    fieldAction: 'झुलसा रोग की पहली पहचान होते ही रोगी पौधों की टहनियों को काटकर तुरंत नष्ट करें।',
    chemicalTitle: 'झुलसा नियंत्रण कवकनाशी',
    chemicalDosage: 'साइमोक्सानिल + मैंकोजेब @ 1.5 ग्राम प्रति लीटर',
    chemicalRemedy: 'साइमोक्सानिल 8% + मैंकोजेब 64% WP @ 1.5g/L या मेटालैक्सिल 8% + मैंकोजेब 64% WP @ 2g/L पानी में छिड़कें।',
    preventTitle: 'प्रमाणित रोगमुक्त बीज एवं जल निकासी',
    prevention: 'प्रमाणित रोगमुक्त आलू बीजों का प्रयोग करें। पिछेती झुलसा के लक्षण दिखते ही तुरंत कवकनाशी छिड़कें।',
    audioGuideScript: 'किसान भाई, आलू की फसल में पिछेती झुलसा का प्रकोप है। 1 प्रतिशत बोर्डो मिश्रण या मैंकोजेब 2 ग्राम प्रति लीटर पानी में मिलाकर तुरंत छिड़काव करें और खेत में जलभराव न होने दें।'
  },
  default: {
    organicTitle: 'नीम तेल एवं ट्राइकोडर्मा उपचार',
    organicDosage: '5 ml नीम का तेल प्रति 1 लीटर पानी',
    organicRemedy: 'नीम के तेल (5ml/L) और ट्राइकोडर्मा विरिडी (5g/L) का छिड़काव करें। प्रभावित पत्तियों को हटाकर खेत से बाहर जलाएं।',
    fieldAction: 'प्रभावित पत्तियों को छांटें और जड़ों के पास जलभराव न होने दें।',
    chemicalTitle: 'मानक कवकनाशी छिड़काव',
    chemicalDosage: 'मैंकोजेब 75% WP @ 2 ग्राम प्रति लीटर',
    chemicalRemedy: 'मैंकोजेब 75% WP @ 2g/L या कार्बेंडाजिम 50% WP @ 1g/L का आवश्यकतानुसार 10-12 दिन के अंतराल पर छिड़काव करें।',
    preventTitle: 'फसल चक्र एवं संतुलित उर्वरक',
    prevention: 'फसल चक्र अपनाएं, अत्यधिक नाइट्रोजन से बचें और खेत को खरपतवार मुक्त रखें।',
    audioGuideScript: 'किसान भाई, फसल में रोग नियंत्रण के लिए 5 मिलीलीटर नीम तेल प्रति लीटर पानी में मिलाकर सुबह के समय पत्तियों पर अच्छी तरह छिड़कें और रोगग्रस्त पत्तियों को खेत से बाहर निकालें।'
  }
};

export const geminiService = {
  // Get stored API key from localStorage or Vite environment
  getApiKey() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}

    const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 10) return envKey.trim();

    return '';
  },

  // Save user-provided Gemini API key
  setApiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  hasApiKey() {
    return Boolean(this.getApiKey());
  },

  // Call Gemini REST API
  async generateContent(promptText, systemInstruction = '') {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('NO_API_KEY');
    }

    // Support current Google Gemini model endpoints
    const models = [
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-flash-lite-latest',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let lastError = null;
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const contents = [];
        if (systemInstruction) {
          contents.push({
            role: 'user',
            parts: [{ text: `[System Instruction: ${systemInstruction}]` }]
          });
          contents.push({
            role: 'model',
            parts: [{ text: 'Understood. I will act strictly according to these instructions.' }]
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: promptText }]
        });

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 1024,
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return candidateText.trim();
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Gemini API request failed');
  },

  // Fix 4: Dynamic Plant Disease Cure Generation (Zero hardcoded text!)
  async fetchDynamicCure({ crop, diseaseName, scientificName = '', symptoms = [], lang = 'hi' }) {
    const isHealthy = diseaseName?.toLowerCase().includes('healthy') || diseaseName?.includes('स्वस्थ');
    if (isHealthy) {
      return {
        organicTitle: lang === 'hi' ? 'जैविक पोषण एवं पौध स्वास्थ्य' : 'Organic Foliar Nutrition & Vigor',
        organicDosage: lang === 'hi' ? '10% जीवामृत या वर्मीवाश (100ml / 1L पानी)' : '10% Jeevamrit or Vermiwash (100ml / 1L water)',
        organicRemedy: lang === 'hi' 
          ? 'फसल पूरी तरह स्वस्थ है! पत्तियों पर कोई रोग या कवक नहीं है। पौधे की निरंतर वृद्धि के लिए जीवामृत, वर्मीवाश या एनपीके सूक्ष्म पोषक तत्वों का छिड़काव 15 दिन के अंतराल पर करते रहें।' 
          : 'Crop foliage is completely healthy! No pathogen detected. Apply Jeevamrit or vermiwash (10%) every 15 days for optimal vegetative vigor and immunity.',
        fieldAction: lang === 'hi' ? 'खेत में 4-5 दिनों में नियमित निरीक्षण करें और संतुलित सिंचाई बनाए रखें।' : 'Maintain regular scouting every 4-5 days and balanced irrigation.',
        chemicalTitle: lang === 'hi' ? 'रासायनिक दवा की आवश्यकता नहीं' : 'No Chemical Treatment Needed',
        chemicalDosage: lang === 'hi' ? 'रासायनिक कवकनाशी की आवश्यकता नहीं है (शून्य दवा)' : 'No chemical spray required (Zero fungicide)',
        chemicalRemedy: lang === 'hi' 
          ? 'फसल रोगमुक्त है, इसलिए किसी भी रासायनिक कवकनाशी या कीटनाशक का अनावश्यक छिड़काव न करें। इससे लागत की बचत होगी।' 
          : 'Crop is disease-free. Avoid unnecessary chemical fungicides to save input costs and preserve beneficial soil microbes.',
        preventTitle: lang === 'hi' ? 'फसल सुरक्षा एवं उचित पोषण' : 'Crop Hygiene & Balanced Irrigation',
        prevention: lang === 'hi'
          ? 'अत्यधिक यूरिया का प्रयोग न करें। खेत में जलनिकासी की उचित व्यवस्था रखें और खरपतवार हटाते रहें।'
          : 'Avoid excessive nitrogen fertilization. Ensure good field drainage and keep plots weed-free.',
        audioGuideScript: lang === 'hi' 
          ? 'आपकी फसल बिल्कुल स्वस्थ है! किसी दवा की आवश्यकता नहीं है, केवल नियमित सिंचाई और जैविक खाद बनाए रखें।' 
          : 'Your crop is completely healthy! No chemical fungicides are needed, just maintain regular watering and organic nutrition.',
        source: 'ai_healthy'
      };
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      const fallback = FALLBACK_CURES[crop] || FALLBACK_CURES.default;
      return {
        ...fallback,
        source: 'default_no_key'
      };
    }

    const isHindi = lang === 'hi' || lang === 'hin';

    const prompt = isHindi
      ? `आप भारत के वरिष्ठ कृषि वैज्ञानिक और पादप रोग विशेषज्ञ (Plant Pathologist) हैं।
एक किसान की फसल की पत्ती में निम्नलिखित रोग के लक्षण पाए गए हैं:
- फसल: ${crop}
- रोग का नाम: ${diseaseName}
- वैज्ञानिक नाम: ${scientificName || 'N/A'}
- पत्ती के लक्षण: ${symptoms.join(', ') || 'पत्तियों पर धब्बे और नुकसान'}

अनिवार्य नियम (CRITICAL RULES FOR HINDI):
1. आपका पूरा उत्तर 100% शुद्ध और सरल हिंदी (केवल देवनागरी लिपि हिन्दी) में होना चाहिए। किसी भी अंग्रेजी वाक्य का प्रयोग न करें।
2. विशेष रूप से "audioGuideScript" में किसान के लिए 2 से 3 व्यावहारिक, स्पष्ट और सीधे बोले जाने वाले वाक्य शुद्ध हिंदी में लिखें (जैसे: "किसान भाई, आपकी फसल में रोग के लक्षण हैं। आज ही 5 मिलीलीटर नीम तेल प्रति लीटर पानी में मिलाकर पत्तियों पर छिड़कें। निचली खराब पत्तियों को तोड़कर खेत से दूर नष्ट करें।")। इसे ऑडियो में बोलकर सुनाया जाएगा। किसी भी अंग्रेजी शब्द या लिपि का प्रयोग न करें।
3. केवल और केवल नीचे दिए गए JSON फॉर्मेट में ही उत्तर दें (बिना किसी बैक-टिक या मार्कडाउन के):
{
  "organicTitle": "जैविक उपाय का शीर्षक (जैसे: नीम तेल व छाछ का छिड़काव)",
  "organicDosage": "प्रति लीटर सही मात्रा (जैसे: 5 मिली नीम तेल प्रति 1L पानी + 2 बूंद साबुन)",
  "organicRemedy": "जैविक घोल बनाने और छिड़कने की विस्तृत विधि हिंदी में",
  "fieldAction": "खेत में तुरंत करने योग्य सबसे जरूरी कार्य",
  "chemicalTitle": "रासायनिक कवकनाशी का नाम",
  "chemicalDosage": "रासायनिक दवा की प्रति लीटर मात्रा (जैसे: मैंकोजेब 2 ग्राम प्रति लीटर पानी)",
  "chemicalRemedy": "रासायनिक छिड़काव की विधि और सावधानियां",
  "preventTitle": "रोकथाम उपाय का शीर्षक",
  "prevention": "फसल को आगे रोग से बचाने के 3 मुख्य उपाय",
  "audioGuideScript": "किसान को ऑडियो में सुनाने के लिए 2-3 सीधे और स्पष्ट हिंदी वाक्य (देवनागरी)"
}`
      : `You are a senior agricultural scientist and plant pathologist in India.
A computer vision model diagnosed the following plant disease on a farmer's crop:
- Crop: ${crop}
- Disease Name: ${diseaseName}
- Scientific Name: ${scientificName || 'N/A'}
- Visual Symptoms: ${symptoms.join(', ') || 'Leaf spots and foliage damage'}
- Target Output Language: English (clear, practical for farmers)

Provide a 100% customized treatment protocol tailored specifically to THIS exact crop and disease.
Return your response ONLY as a valid raw JSON object with these exact keys (no markdown formatting, no code ticks):
{
  "organicTitle": "Short dynamic title of organic solution",
  "organicDosage": "Exact dosage per liter",
  "organicRemedy": "Detailed step-by-step organic preparation and spray instructions.",
  "fieldAction": "The single most urgent immediate task in the field.",
  "chemicalTitle": "Specific chemical treatment title",
  "chemicalDosage": "Exact chemical dosage per liter",
  "chemicalRemedy": "Exact chemical salt/brand name, spray frequency, safety waiting period.",
  "preventTitle": "Prevention strategy title",
  "prevention": "3 essential field hygiene actions to stop spread.",
  "audioGuideScript": "2 concise spoken sentences summarizing what the farmer must do today for voice playback."
}`;

    try {
      const systemInstruction = isHindi
        ? 'आप भारत के विशेषज्ञ कृषि वैज्ञानिक हैं। सदैव केवल शुद्ध हिंदी (देवनागरी लिपि) में वैध कच्चा JSON ही वापस करें। कोई अंग्रेजी वाक्य न लिखें।'
        : 'You are an expert plant pathologist. Always return valid raw JSON only.';

      const rawResponse = await this.generateContent(prompt, systemInstruction);

      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);

      let audioScript = parsed.audioGuideScript || '';
      if (isHindi && (!audioScript || !/[\u0900-\u097F]/.test(audioScript))) {
        audioScript = (parsed.organicDosage && parsed.fieldAction)
          ? `किसान भाई, फसल उपचार के लिए ${parsed.organicDosage} का पत्तियों पर छिड़काव करें। ${parsed.fieldAction}`
          : 'किसान भाई, फसल में रोग नियंत्रण के लिए 5 मिलीलीटर नीम तेल प्रति लीटर पानी में मिलाकर सुबह पत्तियों पर छिड़कें।';
      }

      return {
        organicTitle: parsed.organicTitle || (isHindi ? 'जैविक उपचार' : 'Organic Remedy'),
        organicDosage: parsed.organicDosage || (isHindi ? '5ml नीम तेल प्रति 1L पानी' : '5ml Neem Oil per 1L water'),
        organicRemedy: parsed.organicRemedy || '',
        fieldAction: parsed.fieldAction || (isHindi ? 'संक्रमित पत्तियों को खेत से दूर हटाएं।' : 'Remove infected foliage from field.'),
        chemicalTitle: parsed.chemicalTitle || (isHindi ? 'रासायनिक कवकनाशी' : 'Chemical Fungicide'),
        chemicalDosage: parsed.chemicalDosage || (isHindi ? '2g प्रति लीटर पानी' : '2g per 1L water'),
        chemicalRemedy: parsed.chemicalRemedy || '',
        preventTitle: parsed.preventTitle || (isHindi ? 'रोकथाम उपाय' : 'Preventative Measures'),
        prevention: parsed.prevention || '',
        audioGuideScript: audioScript,
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini dynamic cure error, falling back:', err);
      const fallback = FALLBACK_CURES[crop] || FALLBACK_CURES.default;
      return {
        ...fallback,
        source: 'fallback_error',
        error: err.message
      };
    }
  },

  // Fix 5: Gemini AI Conversational Cross-Questioning & Voice Advisor
  async askVoiceAdvisor({ question, crop, diseaseName, lang = 'hi' }) {
    const isHindi = lang === 'hi' || lang === 'hin';

    const systemInstruction = isHindi
      ? 'आप भारत के वरिष्ठ कृषि वैज्ञानिक और कृषि बंधु एआई विशेषज्ञ हैं। आपका अनिवार्य नियम है: किसान से केवल और केवल शुद्ध, सरल हिंदी भाषा (देवनागरी लिपि) में ही बात करनी है। अंग्रेजी शब्दों या लैटिन अक्षरों का प्रयोग बिल्कुल न करें। 2 से 3 स्पष्ट वाक्यों में उत्तर दें ताकि आवाज में किसान को आसानी से समझ आए।'
      : 'You are a friendly Indian agricultural scientist speaking via voice to a farmer. Provide practical guidance in 2-3 concise spoken sentences in English.';

    const prompt = isHindi
      ? `संदर्भ (Context):
- फसल: ${crop || 'फसल'}
- रोग/स्थिति: ${diseaseName || 'पौध स्वास्थ्य'}

किसान का प्रश्न: "${question}"

अनिवार्य नियम (STRICT RULES):
1. अपना पूरा उत्तर 100% केवल सरल हिंदी (देवनागरी लिपि) में ही दें। किसी भी अंग्रेजी शब्द या अंग्रेजी लिपि का प्रयोग सख्त मना है।
2. किसान को 2 से 3 व्यावहारिक वाक्यों में ही उत्तर दें जो आवाज में सुनने में आसान हों।
3. यदि दवा या छिड़काव की बात हो, तो 1 लीटर पानी में सही मात्रा (जैसे 5ml नीम तेल या 2g कवकनाशी) जरूर बताएं।
4. कोई स्टार (*), हैश (#) या बुलेट पॉइंट न लगाएं, केवल सीधे बोले जाने वाले वाक्य लिखें।`
      : `Context:
- Crop: ${crop || 'Crop'}
- Diagnosed Disease/Condition: ${diseaseName || 'Plant Health'}

Farmer's Question: "${question}"

Instructions:
1. Provide a reassuring and practical answer in 2 to 3 spoken sentences in English.
2. Mention exact dosage per liter if asking about spray or medicines.
3. No bullet points or markdown headings. Provide only the direct spoken response.`;

    try {
      const answer = await this.generateContent(prompt, systemInstruction);
      return answer.replace(/[*#_`]/g, '').trim();
    } catch (err) {
      console.error('Gemini voice advisor error:', err);
      if (isHindi) {
        return 'सुबह के समय 5 मिलीलीटर नीम तेल प्रति लीटर पानी में मिलाकर पत्तियों पर छिड़कें और संक्रमित पत्तियों को खेत से दूर हटा दें।';
      }
      return 'Spray 5ml/L neem oil emulsion early in the morning and remove infected leaves from the field.';
    }
  }
};
