import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Search, Droplets, Wind, Thermometer, ShieldAlert, 
  BookOpen, Calendar, Filter, X, ArrowRight, Sun, CloudRain, 
  MapPin, Loader2, Sparkles, Sprout, Navigation 
} from 'lucide-react';
import { TRANSLATIONS } from '../translations';

// Default cities dataset fallback
const INITIAL_WEATHER_PRESETS = {
  'Delhi': { 
    temp: 31, humidity: 78, condition: 'Humid & Overcast', conditionHi: 'आर्द्र एवं घने बादल', 
    wind: '12 km/h', rainChance: '65%', uv: 6, state: 'Delhi, India', 
    alertEn: 'High humidity detected (78%). Increased risk of fungal leaf spot & powdery mildew in vegetable crops. Spray organic neem oil early morning.',
    alertHi: 'उच्च आर्द्रता (78%) दर्ज की गई। सब्जियों में फफूंद एवं चूर्णिल आसिता का जोखिम अधिक है। सुबह नीम के तेल का छिड़काव करें।'
  },
  'Punjab': { 
    temp: 28, humidity: 62, condition: 'Partly Cloudy', conditionHi: 'आंशिक रूप से बादल', 
    wind: '15 km/h', rainChance: '20%', uv: 7, state: 'Punjab, India', 
    alertEn: 'Favorable condition for Wheat & Paddy tillering. Maintain optimum soil moisture.',
    alertHi: 'गेहूं एवं धान के कल्ले फूटने के लिए अनुकूल मौसम। खेत में पर्याप्त नमी बनाए रखें।'
  },
  'Maharashtra': { 
    temp: 33, humidity: 71, condition: 'Light Rain', conditionHi: 'हल्की बारिश', 
    wind: '18 km/h', rainChance: '85%', uv: 5, state: 'Maharashtra, India', 
    alertEn: 'Heavy shower predicted. Delay pesticide spraying and ensure drainage channels in cotton fields.',
    alertHi: 'भारी बारिश की संभावना। कीटनाशक छिड़काव रोकें और कपास के खेत में जल निकासी सुनिश्चित करें।'
  },
  'Bengaluru': { 
    temp: 25, humidity: 55, condition: 'Pleasant & Breezy', conditionHi: 'सुहावना एवं ठंडी हवा', 
    wind: '14 km/h', rainChance: '10%', uv: 8, state: 'Karnataka, India', 
    alertEn: 'Optimal weather for tomato and chilli transplanting.',
    alertHi: 'टमाटर और मिर्च की रोपाई के लिए मौसम अत्यंत अनुकूल है।'
  },
  'Uttar Pradesh': { 
    temp: 30, humidity: 74, condition: 'Scattered Thunderstorms', conditionHi: 'गरज के साथ बौछारें', 
    wind: '16 km/h', rainChance: '70%', uv: 6, state: 'Uttar Pradesh, India', 
    alertEn: 'High moisture alert. Inspect sugarcane & maize fields for armyworm infestation.',
    alertHi: 'उच्च नमी का अलर्ट। गन्ने और मक्का की फसल में सुंडी व कीट प्रकोप की जांच करें।'
  },
};

const DEFAULT_FORECAST_DAYS = [
  { dayEn: 'Today', dayHi: 'आज', temp: '31°C', icon: CloudSun, conditionEn: 'Humid', conditionHi: 'आर्द्र' },
  { dayEn: 'Tomorrow', dayHi: 'कल', temp: '29°C', icon: CloudRain, conditionEn: 'Light Rain', conditionHi: 'हल्की बारिश' },
  { dayEn: 'Thu', dayHi: 'गुरुवार', temp: '32°C', icon: Sun, conditionEn: 'Sunny', conditionHi: 'धूप' },
  { dayEn: 'Fri', dayHi: 'शुक्रवार', temp: '33°C', icon: Sun, conditionEn: 'Clear Sky', conditionHi: 'साफ मौसम' },
  { dayEn: 'Sat', dayHi: 'शनिवार', temp: '30°C', icon: CloudSun, conditionEn: 'Partly Cloudy', conditionHi: 'बादल' },
];

const CROPS_DIRECTORY = [
  {
    id: 'wheat',
    name: 'Wheat (गेहूं)',
    season: 'Rabi',
    seasonHi: 'रबी',
    soilEn: 'Well-drained Fertile Loamy Soil (pH 6.0 - 7.5)',
    soilHi: 'उचित जल निकासी वाली दोमट मिट्टी (pH 6.0 - 7.5)',
    tempRange: '15°C - 25°C',
    duration: '110 - 130 Days',
    durationHi: '110 - 130 दिन',
    yield: '18 - 24 Quintals/Acre',
    yieldHi: '18 - 24 क्विंटल / एकड़',
    msp: '₹2,275 per Quintal',
    pests: ['Yellow Rust', 'Loose Smut', 'Aphids'],
    pestsHi: ['पीला रतुआ (Yellow Rust)', 'कंगियारी (Smut)', 'माहू कीट (Aphids)'],
    waterReq: '4 - 6 Irrigations (Critical: Crown Root & Flowering)',
    waterReqHi: '4 - 6 सिंचाई (ताज मूल व फूल आने की अवस्था)',
    descriptionEn: 'Rabi cereal crop staple across Northern India. Demands cool winters and warm sunny days during harvest.',
    descriptionHi: 'उत्तर भारत की प्रमुख रबी खाद्यान्न फसल। सर्दियों में ठंड और कटाई के समय खिली धूप आवश्यक है।',
    image: '/images/crops/wheat.png'
  },
  {
    id: 'rice',
    name: 'Rice / Paddy (धान)',
    season: 'Kharif',
    seasonHi: 'खरीफ',
    soilEn: 'Clayey Loam & Alluvial Soil (Retains water)',
    soilHi: 'मटियार दोमट एवं जलोढ़ मिट्टी (जल धारण क्षमता वाली)',
    tempRange: '22°C - 32°C',
    duration: '120 - 150 Days',
    durationHi: '120 - 150 दिन',
    yield: '20 - 28 Quintals/Acre',
    yieldHi: '20 - 28 क्विंटल / एकड़',
    msp: '₹2,300 per Quintal',
    pests: ['Rice Blast', 'Bacterial Leaf Blight', 'Stem Borer'],
    pestsHi: ['झुलसा रोग (Blast)', 'जीवाणु पत्ती झुलसा', 'तना छेदक कीट'],
    waterReq: 'High water requirement (5cm standing water in early stage)',
    waterReqHi: 'अधिक पानी की आवश्यकता (शुरुआती दिनों में 5 सेमी भरा पानी)',
    descriptionEn: 'Primary monsoon Kharif crop requiring abundant rainfall, clay soil, and warm humid climate.',
    descriptionHi: 'मानसून की मुख्य खरीफ फसल। भरपूर वर्षा, चिकनी मिट्टी और आर्द्र वातावरण में अच्छी पैदावार देती है।',
    image: '/images/crops/rice.png'
  },
  {
    id: 'tomato',
    name: 'Tomato (टमाटर)',
    season: 'All Seasons',
    seasonHi: 'सर्व-ऋतु',
    soilEn: 'Rich Organic Sandy Loam (pH 6.0 - 7.0)',
    soilHi: 'जीवांश युक्त बलुई दोमट मिट्टी (pH 6.0 - 7.0)',
    tempRange: '18°C - 28°C',
    duration: '90 - 110 Days',
    durationHi: '90 - 110 दिन',
    yield: '12 - 18 Tons/Acre',
    yieldHi: '12 - 18 टन / एकड़',
    msp: 'Market Dependent (₹15 - ₹40/kg)',
    pests: ['Early Blight', 'Leaf Curl Virus', 'Fruit Borer'],
    pestsHi: ['अगेती झुलसा (Early Blight)', 'पत्ती मरोड़ वायरस', 'फल छेदक'],
    waterReq: 'Regular drip irrigation every 3-4 days',
    waterReqHi: 'हर 3-4 दिन में ड्रिप सिंचाई, पत्तियों पर पानी न डालें',
    descriptionEn: 'High-value horticulture crop. Susceptible to fungal blights during high atmospheric humidity.',
    descriptionHi: 'लाभकारी बागवानी फसल। अधिक नमी व कोहरे के समय फफूंद जनित रोगों का विशेष ध्यान रखें।',
    image: '/images/crops/tomato.png'
  },
  {
    id: 'potato',
    name: 'Potato (आलू)',
    season: 'Rabi',
    seasonHi: 'रबी',
    soilEn: 'Friable Sandy Loam rich in humus (pH 5.2 - 6.5)',
    soilHi: 'भुरभुरी बलुई दोमट मिट्टी, अच्छी जलनिकासी (pH 5.2 - 6.5)',
    tempRange: '15°C - 20°C (Tuberization)',
    duration: '80 - 100 Days',
    durationHi: '80 - 100 दिन',
    yield: '100 - 140 Quintals/Acre',
    yieldHi: '100 - 140 क्विंटल / एकड़',
    msp: 'Cold Storage Market Rate',
    pests: ['Late Blight', 'Black Scurf', 'Potato Aphids'],
    pestsHi: ['पिछेती झुलसा (Late Blight)', 'काला स्कर्फ', 'माहू कीट'],
    waterReq: 'Light frequent irrigation, avoid waterlogging',
    waterReqHi: 'हल्की और नियमित सिंचाई, जलभराव से पूरी तरह बचाएं',
    descriptionEn: 'Major tuber crop sensitive to frost and waterlogging. Requires earthing up at 30 days.',
    descriptionHi: 'प्रमुख कंद फसल। पाले और जलभराव के प्रति संवेदनशील। 30-35 दिन पर मिट्टी चढ़ाना आवश्यक है।',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cotton',
    name: 'Cotton (कपास)',
    season: 'Kharif',
    seasonHi: 'खरीफ',
    soilEn: 'Deep Black Cotton Soil (Regur) pH 6.0 - 8.0',
    soilHi: 'गहरी काली कपासी मिट्टी (रेगुर) pH 6.0 - 8.0',
    tempRange: '21°C - 30°C',
    duration: '150 - 180 Days',
    durationHi: '150 - 180 दिन',
    yield: '8 - 12 Quintals/Acre',
    yieldHi: '8 - 12 क्विंटल / एकड़',
    msp: '₹6,620 per Quintal',
    pests: ['Pink Bollworm', 'Whitefly', 'Jassids'],
    pestsHi: ['गुलाबी सुंडी (Pink Bollworm)', 'सफेद मक्खी', 'जैसिड'],
    waterReq: '500 - 700 mm rainfall or 4-5 canal irrigations',
    waterReqHi: '500 - 700 मिमी वर्षा या 4-5 नहरी सिंचाई',
    descriptionEn: 'Commercial fiber crop thrives in black volcanic soils. Clear sky required during boll picking phase.',
    descriptionHi: 'महत्वपूर्ण व्यावसायिक रेशा फसल। टिंडे खिलने और चुगाई के समय खिली धूप अत्यंत आवश्यक है।',
    image: '/images/crops/cotton.png'
  },
  {
    id: 'mustard',
    name: 'Mustard (सरसों)',
    season: 'Rabi',
    seasonHi: 'रबी',
    soilEn: 'Light to Medium Loamy Soil (pH 6.5 - 7.5)',
    soilHi: 'हल्की से मध्यम दोमट मिट्टी (pH 6.5 - 7.5)',
    tempRange: '10°C - 25°C',
    duration: '105 - 125 Days',
    durationHi: '105 - 125 दिन',
    yield: '6 - 9 Quintals/Acre',
    yieldHi: '6 - 9 क्विंटल / एकड़',
    msp: '₹5,650 per Quintal',
    pests: ['Mustard Aphid', 'White Rust', 'Alternaria Blight'],
    pestsHi: ['मोयला / माहू कीट', 'सफेद रतुआ (White Rust)', 'अल्टरनेरिया झुलसा'],
    waterReq: '2 Irrigations (Flowering & Siliqua development)',
    waterReqHi: '2 मुख्य सिंचाई (फूल आते समय एवं फलियां बनते समय)',
    descriptionEn: 'Important oilseed Rabi crop with low water requirement. Highly profitable in dryland regions.',
    descriptionHi: 'कम पानी में अधिक लाभ देने वाली प्रमुख तिलहनी फसल। बारानी क्षेत्रों के लिए सर्वोत्तम।',
    image: '/images/crops/mustard.png'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (गन्ना)',
    season: 'All Seasons',
    seasonHi: 'सर्व-ऋतु',
    soilEn: 'Deep Well-drained Loamy Soil (pH 6.5 - 7.5)',
    soilHi: 'गहरी, उपजाऊ एवं उचित जल निकासी वाली दोमट मिट्टी',
    tempRange: '20°C - 35°C',
    duration: '300 - 360 Days',
    durationHi: '300 - 360 दिन',
    yield: '300 - 450 Quintals/Acre',
    yieldHi: '300 - 450 क्विंटल / एकड़',
    msp: 'FRP ₹315 per Quintal',
    pests: ['Early Shoot Borer', 'Red Rot', 'Pyrilla'],
    pestsHi: ['कंसुआ (Shoot Borer)', 'लाल सड़न (Red Rot)', 'पायरीला कीट'],
    waterReq: 'High water requirement (20 - 24 irrigations)',
    waterReqHi: 'अधिक जल आवश्यकता (20 से 24 सिंचाई समय अनुसार)',
    descriptionEn: 'Long duration cash crop requiring high humidity, fertile soil, and abundant irrigation.',
    descriptionHi: 'दीर्घकालिक नकदी फसल। गर्म आर्द्र जलवायु और नियमित सिंचाई से भरपूर मिठास व वजन मिलता है।',
    image: '/images/crops/sugarcane.png'
  }
];

export default function WeatherAndCrops({ lang = 'hi' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  const [searchCity, setSearchCity] = useState('');
  const [displayCity, setDisplayCity] = useState('Delhi');
  const [locationSubtext, setLocationSubtext] = useState('Delhi, India');
  const [currentWeather, setCurrentWeather] = useState(INITIAL_WEATHER_PRESETS['Delhi']);
  const [forecastDays, setForecastDays] = useState(DEFAULT_FORECAST_DAYS);
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);

  // WMO Weather code interpreter with bilingual support
  const decodeWeatherCode = (code) => {
    if (code === 0) return { conditionEn: 'Clear Sunny Sky', conditionHi: 'साफ एवं खिली धूप', icon: Sun, uv: 8 };
    if (code >= 1 && code <= 3) return { conditionEn: 'Partly Cloudy & Breezy', conditionHi: 'हल्के बादल एवं सुखद हवा', icon: CloudSun, uv: 6 };
    if (code >= 45 && code <= 48) return { conditionEn: 'Foggy & Humid', conditionHi: 'कोहरा एवं नमी', icon: CloudSun, uv: 4 };
    if (code >= 51 && code <= 67) return { conditionEn: 'Light Rain & Showers', conditionHi: 'हल्की बारिश व बौछारें', icon: CloudRain, uv: 5 };
    if (code >= 80 && code <= 99) return { conditionEn: 'Thunderstorm & Heavy Rain', conditionHi: 'तूफान एवं तेज बारिश', icon: CloudRain, uv: 3 };
    return { conditionEn: 'Scattered Clouds', conditionHi: 'आंशिक बादल', icon: CloudSun, uv: 6 };
  };

  // Generate AI agronomic advisory in Hindi or English
  const generateFarmingAdvisory = (cityName, temp, humidity, rainProb) => {
    const rVal = parseInt(rainProb) || 20;
    if (rVal > 60) {
      return lang === 'hi'
        ? `${cityName} में भारी वर्षा की संभावना (${rainProb}) है। खेत में जलभराव रोकने के लिए जल निकास नालियां तुरंत साफ करें। पत्तियों पर कीटनाशक का छिड़काव स्थगित रखें।`
        : `High rainfall probability (${rainProb}) in ${cityName}. Clear field drainage channels immediately to prevent waterlogging. Postpone foliar pesticide sprays.`;
    }
    if (humidity > 75) {
      return lang === 'hi'
        ? `${cityName} में वातावरण में अधिक आर्द्रता (${humidity}%) है। सब्जियों व बागवानी फसलों में फफूंद एवं चूर्णिल आसिता का जोखिम अधिक है। सुबह नीम के तेल का छिड़काव करें।`
        : `High relative humidity (${humidity}%) in ${cityName}. Fungal leaf spot & powdery mildew risk is high in horticultural crops. Spray neem oil early morning.`;
    }
    if (temp > 35) {
      return lang === 'hi'
        ? `${cityName} में तापमान अधिक (${temp}°C) है। फसलों को लू एवं तनाव से बचाने के लिए शाम के समय हल्की सिंचाई करें।`
        : `Elevated ambient temperature (${temp}°C) in ${cityName}. Provide frequent light irrigation during evening hours to protect crops from heat stress.`;
    }
    return lang === 'hi'
      ? `${cityName} में कृषि के लिए अनुकूल मौसम (${temp}°C तापमान, ${humidity}% आर्द्रता) है। खेत की जुताई, निराई-गुड़ाई एवं खाद देने के लिए उत्तम समय है।`
      : `Optimal climatic parameters in ${cityName} (${temp}°C, ${humidity}% humidity). Favorable for field operations, weeding, and fertilizer application.`;
  };

  // Direct Live Weather Fetch by Coordinates
  const fetchWeatherByCoords = async (lat, lon, placeName, regionText) => {
    setLoading(true);
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const wRes = await fetch(weatherUrl);
      const wData = await wRes.json();

      if (wData && wData.current) {
        const cur = wData.current;
        const temp = Math.round(cur.temperature_2m);
        const wind = `${Math.round(cur.wind_speed_10m)} km/h`;
        const humidity = Math.round(cur.relative_humidity_2m);
        const rainProb = (wData.daily && wData.daily.precipitation_probability_max && wData.daily.precipitation_probability_max[0] !== undefined)
          ? `${wData.daily.precipitation_probability_max[0]}%`
          : '30%';

        const decoded = decodeWeatherCode(cur.weather_code);
        const alertMsg = generateFarmingAdvisory(placeName, temp, humidity, rainProb);

        setDisplayCity(placeName);
        setLocationSubtext(regionText);
        setCurrentWeather({
          temp,
          humidity,
          condition: lang === 'hi' ? decoded.conditionHi : decoded.conditionEn,
          wind,
          rainChance: rainProb,
          uv: decoded.uv,
          state: regionText,
          alert: alertMsg
        });

        if (wData.daily && wData.daily.time) {
          const daysListEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const daysListHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
          const newForecast = wData.daily.time.slice(0, 5).map((tStr, idx) => {
            const dObj = new Date(tStr);
            const dayNameEn = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : daysListEn[dObj.getDay()];
            const dayNameHi = idx === 0 ? 'आज' : idx === 1 ? 'कल' : daysListHi[dObj.getDay()];
            const maxT = Math.round(wData.daily.temperature_2m_max[idx]);
            const code = wData.daily.weather_code ? wData.daily.weather_code[idx] : 0;
            const dec = decodeWeatherCode(code);
            return {
              day: lang === 'hi' ? dayNameHi : dayNameEn,
              temp: `${maxT}°C`,
              icon: dec.icon,
              condition: lang === 'hi' ? dec.conditionHi : dec.conditionEn
            };
          });
          setForecastDays(newForecast);
        }
      }
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setLoading(false);
      setLocatingGPS(false);
    }
  };

  // GPS Location Trigger
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'hi' ? 'आपके ब्राउज़र में जीपीएस लोकेशन सपोर्ट नहीं है।' : 'Geolocation is not supported by your browser.');
      return;
    }

    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          // Reverse geocode via BigDataCloud or Open-Meteo
          const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang === 'hi' ? 'hi' : 'en'}`);
          const revData = await revRes.json();
          const place = revData.locality || revData.city || revData.principalSubdivision || 'My Farm';
          const region = `${place}, ${revData.principalSubdivision || revData.countryName || 'India'}`;
          await fetchWeatherByCoords(lat, lon, place, region);
        } catch (err) {
          await fetchWeatherByCoords(lat, lon, 'My Farm Location', `GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
        }
      },
      (err) => {
        setLocatingGPS(false);
        alert(lang === 'hi' ? 'कृपया सटीक मौसम के लिए लोकेशन की अनुमति दें।' : 'Location permission denied. Please allow GPS access for live farm weather.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search by City Name via Open-Meteo Geocoding
  const fetchGlobalCityWeather = async (targetCityName) => {
    const cleanCity = targetCityName.trim();
    if (!cleanCity) return;

    setLoading(true);
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=${lang === 'hi' ? 'hi' : 'en'}&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (geoData && geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const region = place.admin1 ? `${place.name}, ${place.admin1}, India` : `${place.name}, India`;
        await fetchWeatherByCoords(place.latitude, place.longitude, place.name, region);
        return;
      }
    } catch (err) {
      console.warn('Geocoding fallback:', err);
    }

    // Default fallback if offline or not found
    let hash = 0;
    for (let i = 0; i < cleanCity.length; i++) hash += cleanCity.charCodeAt(i);
    const temp = 24 + (hash % 10);
    const humidity = 55 + (hash % 30);
    const rainProb = (hash % 60) + '%';
    const wind = (10 + (hash % 10)) + ' km/h';
    const alertMsg = generateFarmingAdvisory(cleanCity, temp, humidity, rainProb);

    setDisplayCity(cleanCity);
    setLocationSubtext(`${cleanCity}, India`);
    setCurrentWeather({
      temp,
      humidity,
      condition: lang === 'hi' ? 'साफ एवं खिली धूप' : 'Clear Sunny Sky',
      wind,
      rainChance: rainProb,
      uv: 7,
      state: `${cleanCity}, Region`,
      alert: alertMsg
    });
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchGlobalCityWeather(searchCity);
    }
  };

  const filteredCrops = CROPS_DIRECTORY.filter(c => 
    selectedSeason === 'All' ? true : c.season === selectedSeason || c.season === 'All Seasons'
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* SECTION 1: LIVE WEATHER & FARMING ADVISORY */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', background: '#ffffff', border: '1px solid #e5eae1' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#15803d', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <CloudSun size={18} />
              <span>{t.advisoryAlert}</span>
            </div>
            <h2 style={{ fontSize: '2rem', color: '#14281d', fontWeight: 800, marginTop: '0.3rem' }}>
              {t.weatherTitle}
            </h2>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              {t.weatherSubtitle}
            </p>
          </div>

          {/* Search Bar & GPS One-Tap Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleGPSLocation}
              disabled={locatingGPS || loading}
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                color: '#15803d',
                padding: '0.7rem 1.1rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 6px rgba(22, 101, 52, 0.08)'
              }}
            >
              {locatingGPS ? <Loader2 size={16} className="spin" /> : <Navigation size={16} />}
              <span>{locatingGPS ? t.searchingLocation : t.useCurrentLocation}</span>
            </button>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={t.searchCityPlaceholder}
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  style={{
                    padding: '0.7rem 1rem 0.7rem 2.6rem',
                    background: '#ffffff',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '12px',
                    color: '#14281d',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '240px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.7rem 1.2rem', fontSize: '0.9rem' }}>
                {loading ? <Loader2 size={16} className="spin" /> : (lang === 'hi' ? 'खोजें' : 'Search')}
              </button>
            </form>
          </div>
        </div>

        {/* Selected City Weather Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
          
          {/* Main Temperature Card */}
          <div style={{
            background: 'linear-gradient(135deg, #123924 0%, #0a1f14 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 25px rgba(18, 57, 36, 0.25)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a7f3d0', fontSize: '0.9rem', fontWeight: 600 }}>
                <MapPin size={16} color="#34d399" />
                <span>{locationSubtext}</span>
              </div>
              <div style={{ fontSize: '3.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, margin: '0.4rem 0' }}>
                {currentWeather.temp}°C
              </div>
              <div style={{ color: '#86efac', fontWeight: 700, fontSize: '0.95rem' }}>
                {currentWeather.condition}
              </div>
            </div>
            <CloudSun size={68} color="#86efac" style={{ opacity: 0.95 }} />
          </div>

          {/* Weather Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4b5563', fontSize: '0.82rem', fontWeight: 600 }}>
                <Droplets size={15} color="#0284c7" /> {t.humidity}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#14281d', marginTop: '0.25rem' }}>
                {currentWeather.humidity}%
              </div>
            </div>

            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4b5563', fontSize: '0.82rem', fontWeight: 600 }}>
                <Wind size={15} color="#059669" /> {t.windSpeed}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#14281d', marginTop: '0.25rem' }}>
                {currentWeather.wind}
              </div>
            </div>

            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4b5563', fontSize: '0.82rem', fontWeight: 600 }}>
                <CloudRain size={15} color="#2563eb" /> {t.precipitation}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#14281d', marginTop: '0.25rem' }}>
                {currentWeather.rainChance}
              </div>
            </div>

            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4b5563', fontSize: '0.82rem', fontWeight: 600 }}>
                <Sun size={15} color="#d97706" /> {t.uvIndex}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#14281d', marginTop: '0.25rem' }}>
                {currentWeather.uv} / 10
              </div>
            </div>
          </div>

          {/* 5-Day Agro Forecast Pill */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5eae1',
            borderRadius: '20px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#14281d', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} color="#15803d" />
              <span>{t.forecast7Days}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              {forecastDays.map((fd, idx) => {
                const IconComponent = fd.icon || CloudSun;
                return (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>{fd.day}</div>
                    <IconComponent size={22} color="#15803d" style={{ margin: '0.4rem auto' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#14281d' }}>{fd.temp}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* AI Agro Advisory Card */}
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #bbf7d0',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 10px rgba(22, 101, 52, 0.06)'
        }}>
          <div style={{ background: '#dcfce7', padding: '0.65rem', borderRadius: '12px', flexShrink: 0 }}>
            <ShieldAlert size={26} color="#15803d" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>
              {t.advisoryAlert}
            </div>
            <p style={{ color: '#14532d', fontSize: '0.9rem', marginTop: '0.2rem', lineHeight: 1.5 }}>
              {currentWeather.alert}
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 2: CROP DIRECTORY & AGRONOMY GUIDES */}
      <div className="glass-panel" style={{ padding: '2.5rem', background: '#ffffff', border: '1px solid #e5eae1' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <BookOpen size={18} />
              <span>{t.cropsTitle}</span>
            </div>
            <h2 style={{ fontSize: '2rem', color: '#14281d', fontWeight: 800, marginTop: '0.3rem' }}>
              {t.cropsSubtitle}
            </h2>
          </div>

          {/* Season Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            {[
              { id: 'All', label: t.filterAll },
              { id: 'Kharif', label: t.seasonKharif },
              { id: 'Rabi', label: t.seasonRabi },
            ].map((seasonObj) => (
              <button
                key={seasonObj.id}
                onClick={() => setSelectedSeason(seasonObj.id)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: selectedSeason === seasonObj.id ? '#16a34a' : 'transparent',
                  color: selectedSeason === seasonObj.id ? '#ffffff' : '#4b5563',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedSeason === seasonObj.id ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none'
                }}
              >
                {seasonObj.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crops Directory Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5eae1',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(18, 57, 36, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(18, 57, 36, 0.12)';
                e.currentTarget.style.borderColor = '#bbf7d0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(18, 57, 36, 0.06)';
                e.currentTarget.style.borderColor = '#e5eae1';
              }}
            >
              <div style={{ position: 'relative', height: '175px' }}>
                <img src={crop.image} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute',
                  top: '0.85rem',
                  right: '0.85rem',
                  background: '#ffffff',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                  {lang === 'hi' ? crop.seasonHi : crop.season}
                </span>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14281d', margin: 0 }}>
                  {crop.name}
                </h3>
                <p style={{ color: '#4b5563', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  {lang === 'hi' ? crop.descriptionHi : crop.descriptionEn}
                </p>

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>{t.duration}:</span>
                    <strong style={{ color: '#14281d' }}>{lang === 'hi' ? crop.durationHi : crop.duration}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>{t.expectedYield}:</span>
                    <strong style={{ color: '#15803d' }}>{lang === 'hi' ? crop.yieldHi : crop.yield}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>{t.mspPrice}:</span>
                    <strong style={{ color: '#d97706' }}>{crop.msp}</strong>
                  </div>
                </div>

                <div style={{
                  marginTop: '1.25rem',
                  color: '#15803d',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span>{t.viewDetails}</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* DETAIL MODAL FOR SELECTED CROP */}
      {selectedCrop && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 16, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '650px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid #e5eae1',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ position: 'relative', height: '220px' }}>
              <img src={selectedCrop.image} alt={selectedCrop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setSelectedCrop(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                <X size={20} color="#14281d" />
              </button>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#14281d', margin: 0 }}>
                  {selectedCrop.name}
                </h3>
                <span style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}>
                  {lang === 'hi' ? selectedCrop.seasonHi : selectedCrop.season}
                </span>
              </div>

              <p style={{ color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {lang === 'hi' ? selectedCrop.descriptionHi : selectedCrop.descriptionEn}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8faf6', padding: '1rem', borderRadius: '14px', border: '1px solid #e2ebd8' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{t.soilType}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#14281d', marginTop: '0.2rem' }}>
                    {lang === 'hi' ? selectedCrop.soilHi : selectedCrop.soilEn}
                  </div>
                </div>

                <div style={{ background: '#f8faf6', padding: '1rem', borderRadius: '14px', border: '1px solid #e2ebd8' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{t.waterNeeds}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#14281d', marginTop: '0.2rem' }}>
                    {lang === 'hi' ? selectedCrop.waterReqHi : selectedCrop.waterReq}
                  </div>
                </div>

                <div style={{ background: '#f8faf6', padding: '1rem', borderRadius: '14px', border: '1px solid #e2ebd8' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{t.expectedYield}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
                    {lang === 'hi' ? selectedCrop.yieldHi : selectedCrop.yield}
                  </div>
                </div>

                <div style={{ background: '#f8faf6', padding: '1rem', borderRadius: '14px', border: '1px solid #e2ebd8' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{t.mspPrice}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                    {selectedCrop.msp}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#14281d', marginBottom: '0.5rem' }}>
                  {t.commonPests}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(lang === 'hi' ? selectedCrop.pestsHi : selectedCrop.pests).map((p, idx) => (
                    <span key={idx} style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      ⚠️ {p}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedCrop(null)}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1.75rem', padding: '0.85rem' }}
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
