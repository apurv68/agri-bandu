// Gemini AI Agronomist Service for Agri Bandhu
// Supports dynamic plant disease cures and conversational farmer voice cross-questioning

const STORAGE_KEY = 'agri_gemini_api_key';

// Default / fallback remedies when API key is missing or offline
const FALLBACK_CURES = {
  Tomato: {
    organicRemedy: 'नीम तेल का घोल (Neem Oil): 5 मिलीलीटर नीम का तेल प्रति 1 लीटर पानी में 2 बूंद लिक्विड साबुन मिलाकर सुबह के समय पत्तियों के दोनों तरफ अच्छी तरह छिड़कें। खट्टी छाछ (Buttermilk) का 10% घोल भी कवक को रोकता है।',
    chemicalRemedy: 'मैंकोजेब 75% WP (Mancozeb) @ 2 ग्राम प्रति लीटर पानी या कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम प्रति लीटर पानी में मिलाकर साफ मौसम में छिड़काव करें। 10-12 दिन बाद दोहराएं।',
    prevention: 'पौधों के बीच पर्याप्त दूरी रखें ताकि हवा और धूप मिल सके। खेत में नीचे की संक्रमित पत्तियों को तोड़कर नष्ट करें और ड्रिप से सिंचाई करें, पत्तियों पर पानी न गिराएं।'
  },
  Potato: {
    organicRemedy: 'बोर्डो मिश्रण (Bordeaux mixture 1%) या कॉपर युक्त जैविक कवकनाशी का छिड़काव करें। खेत में जलभराव न होने दें और मिट्टी चढ़ाएं।',
    chemicalRemedy: 'साइमोक्सानिल 8% + मैंकोजेब 64% WP (Curzate) @ 1.5 ग्राम प्रति लीटर या मेटालैक्सिल 8% + मैंकोजेब 64% WP (Ridomil MZ) @ 2 ग्राम प्रति लीटर पानी में छिड़कें।',
    prevention: 'प्रमाणित रोगमुक्त आलू बीजों का उपयोग करें। पिछेती झुलसा के शुरुआती लक्षण दिखते ही तुरंत कवकनाशी का छिड़काव करें।'
  },
  default: {
    organicRemedy: 'नीम के तेल (5ml/L) और ट्राइकोडर्मा विरिडी (Trichoderma viride 5g/L) का छिड़काव करें। प्रभावित पत्तियों को हटाकर खेत से बाहर जलाएं या गाड़ें।',
    chemicalRemedy: 'व्यापक स्पेक्ट्रम कवकनाशी जैसे मैंकोजेब 75% WP @ 2g/L या कार्बेंडाजिम 50% WP @ 1g/L का आवश्यकतानुसार छिड़काव करें।',
    prevention: 'फसल चक्र अपनाएं, संतुलित उर्वरक (कम नाइट्रोजन, पर्याप्त पोटाश) दें और खेत को खरपतवार मुक्त रखें।'
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

    // Try Gemini 1.5 Flash (fastest & best for agricultural mobile responses)
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

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
              temperature: 0.4,
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
        // Try next model if 404 or quota exceeded
      }
    }

    throw lastError || new Error('Gemini API request failed');
  },

  // Fix 4: Dynamic Plant Disease Cure Generation
  async fetchDynamicCure({ crop, diseaseName, scientificName = '', symptoms = [], lang = 'hi' }) {
    // If disease is healthy or non-leaf, return appropriate message
    const isHealthy = diseaseName?.toLowerCase().includes('healthy') || diseaseName?.includes('स्वस्थ');
    if (isHealthy) {
      return {
        organicRemedy: lang === 'hi' 
          ? 'फसल पूरी तरह स्वस्थ है! जैविक पोषण के लिए जीवामृत या वर्मीवाश (10%) का छिड़काव 15 दिन के अंतराल पर करते रहें।' 
          : 'Crop foliage is completely healthy! Apply Jeevamrit or vermiwash (10%) every 15 days for optimal vegetative vigor.',
        chemicalRemedy: lang === 'hi'
          ? 'किसी रासायनिक दवा की आवश्यकता नहीं है। मानक एनपीके और सूक्ष्म पोषक तत्वों का संतुलित प्रयोग जारी रखें।'
          : 'No chemical fungicides needed. Continue balanced NPK and micronutrient schedule.',
        prevention: lang === 'hi'
          ? 'खेत में नियमित निगरानी रखें, उचित जल निकासी बनाए रखें और आवश्यकता से अधिक यूरिया न डालें।'
          : 'Inspect fields every 4-5 days, maintain drainage, and avoid excessive nitrogen application.',
        source: 'ai_healthy'
      };
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Return smart defaults based on crop
      const fallback = FALLBACK_CURES[crop] || FALLBACK_CURES.default;
      return {
        ...fallback,
        source: 'default_no_key'
      };
    }

    const prompt = `You are a senior agricultural scientist and plant pathologist (कृषि वैज्ञानिक) in India.
A computer vision model diagnosed the following plant disease on a farmer's crop:
- Crop: ${crop}
- Disease Name: ${diseaseName}
- Scientific Name: ${scientificName || 'N/A'}
- Visual Symptoms: ${symptoms.join(', ') || 'Leaf spots and foliage damage'}
- Target Output Language: ${lang === 'hi' ? 'Hindi (हिंदी भाषा में भारतीय किसानों के लिए सरल एवं स्पष्ट)' : 'English (clear, practical for farmers)'}

Please provide an expert agricultural cure and prevention protocol. Return your response ONLY as a valid JSON object with the following four keys (no markdown code blocks, just raw JSON):
{
  "organicRemedy": "Detailed organic/natural remedies (जैविक उपचार) including neem formulations, bio-agents (Trichoderma/Pseudomonas), dosage per liter of water, timing of spray.",
  "chemicalRemedy": "Accurate, government-recommended chemical fungicides/pesticides (रासायनिक उपचार) with exact brand/active salt names, dosage (e.g. gm or ml per liter water), and waiting period.",
  "prevention": "3 essential field hygiene and cultural prevention practices (रोकथाम के उपाय) to stop disease spreading to other plants.",
  "audioGuideScript": "A concise 2-sentence conversational summary of what the farmer must immediately do today, suitable for voice playback."
}`;

    try {
      const rawResponse = await this.generateContent(
        prompt, 
        'You are an expert plant pathologist. Always return valid JSON only.'
      );

      // Clean JSON if model returned markdown code block
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      return {
        organicRemedy: parsed.organicRemedy || '',
        chemicalRemedy: parsed.chemicalRemedy || '',
        prevention: parsed.prevention || '',
        audioGuideScript: parsed.audioGuideScript || '',
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini cure generation error, falling back to database defaults:', err);
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
    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Helpful fallback when API key is not yet configured
      if (lang === 'hi') {
        return 'कृपया सेटिंग्स में अपनी Google Gemini API Key दर्ज करें ताकि लाइव एआई कृषि वैज्ञानिक आपके हर सवाल का सटीक जवाब दे सके। आपातकालीन उपचार के लिए नीम तेल (5ml/लीटर) का छिड़काव करें।';
      }
      return 'Please add your Google Gemini API Key in Settings to enable dynamic AI farmer advising. For immediate care, spray neem oil emulsion (5ml/L).';
    }

    const prompt = `You are "Agri Bandhu AI" (कृषि बंधु एआई), a friendly and knowledgeable agricultural expert talking directly to an Indian farmer.
Context:
- Crop: ${crop || 'Crop'}
- Diagnosed Disease/Condition: ${diseaseName || 'Plant condition'}
- Language: ${lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}

Farmer's Question: "${question}"

Provide a warm, reassuring, and scientifically practical answer in 2 to 3 spoken sentences. 
- Mention exact dosage (e.g., in ml or grams per liter) if asking about spray or medicines.
- If asking about water or fertilizer, give clear actionable guidance.
- Keep sentences concise and clear so they sound natural when spoken through text-to-speech.
Do not use bullet points or markdown headings. Provide only the direct spoken response.`;

    try {
      const answer = await this.generateContent(
        prompt, 
        'You are a friendly Indian agricultural scientist speaking via voice to a farmer.'
      );
      return answer.replace(/[*#_]/g, '').trim();
    } catch (err) {
      console.error('Gemini voice advisor error:', err);
      if (lang === 'hi') {
        return 'माफ कीजिए, नेटवर्क या एआई सेवा में अस्थायी समस्या है। कृपया कुछ देर बाद पुनः पूछें या नीम तेल का 5ml/लीटर का घोल सुबह छिड़कें।';
      }
      return 'Sorry, there was a temporary issue reaching the Gemini AI service. Please check your internet or spray neem oil (5ml/L) as a first response.';
    }
  }
};
