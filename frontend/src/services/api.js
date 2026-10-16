import axios from 'axios';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const isRenderWeb = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com');

// Multi-Tier Database Endpoints (24/7 Render Cloud Endpoint + Relative Web Endpoint + Local IP)
const ALL_ENDPOINTS = Capacitor.isNativePlatform()
  ? [
      'https://agri-bandhu.onrender.com/api', // Live 24/7 Cloud Database Endpoint for Android APK
      'http://10.0.2.2:8000/api', // Android Emulator 0ms Direct PC Host Loopback IP
      'http://localhost:8000/api'
    ]
  : isRenderWeb
    ? [
        '/api', // Same-origin relative path for 24/7 Web App on Render
        'https://agri-bandhu.onrender.com/api'
      ]
    : [
        'https://agri-bandhu.onrender.com/api', // Instant 24/7 cloud AI backend for local web testing
        '/api',
        'http://localhost:8000/api'
      ];

// Clear stale localhost cached endpoint so local testing doesn't fail
if (typeof window !== 'undefined' && localStorage.getItem('agri_working_api')?.includes('8000')) {
  localStorage.removeItem('agri_working_api');
}

let cachedWorkingEndpoint = localStorage.getItem('agri_working_api') || null;

// Execute HTTP request with Tunnel Warning Bypass & Instant Cached Endpoint
const callBackendDatabase = async (method, uri, data = null, headers = {}) => {
  let lastError = null;

  // Build endpoint order: cached working endpoint first, followed by others
  const searchEndpoints = cachedWorkingEndpoint 
    ? [cachedWorkingEndpoint, ...ALL_ENDPOINTS.filter(e => e !== cachedWorkingEndpoint)]
    : ALL_ENDPOINTS;

  for (const baseUrl of searchEndpoints) {
    const fullUrl = `${baseUrl}${uri}`;
    const authToken = localStorage.getItem('agri_auth_token');

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'AgriBandhuApp/1.0',
      'bypass-tunnel-reminder': 'true',
      'ngrok-skip-browser-warning': 'true',
      ...headers
    };

    // Auto-detect FormData so browser attaches multipart boundary correctly
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      delete requestHeaders['Content-Type'];
    }

    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const isScanRequest = uri.includes('/disease/scan') || uri.includes('/disease');

    const requestTimeout = isScanRequest ? 60000 : 20000;

    // Attempt 1: Native CapacitorHttp for Android Mobile Native Bridge
    if (Capacitor.isNativePlatform()) {
      try {
        const nativeRes = await CapacitorHttp.request({
          method: method.toUpperCase(),
          url: fullUrl,
          headers: requestHeaders,
          data: data,
          connectTimeout: 15000,
          readTimeout: requestTimeout,
        });

        if (nativeRes.status >= 200 && nativeRes.status < 300) {
          if (cachedWorkingEndpoint !== baseUrl) {
            cachedWorkingEndpoint = baseUrl;
            localStorage.setItem('agri_working_api', baseUrl);
          }
          return { data: nativeRes.data, status: nativeRes.status };
        }
        if (nativeRes.status === 401 || nativeRes.status === 422 || nativeRes.status === 400) {
          const errObj = new Error(nativeRes.data?.message || 'Validation error');
          errObj.response = { status: nativeRes.status, data: nativeRes.data };
          throw errObj;
        }
      } catch (nativeErr) {
        if (nativeErr.response) throw nativeErr;
        lastError = nativeErr;
      }
    }

    // Attempt 2: Standard Axios / Fetch
    try {
      const client = axios.create({
        baseURL: baseUrl,
        headers: requestHeaders,
        timeout: requestTimeout,
      });

      const response = await client({ method, url: uri, data });
      if (cachedWorkingEndpoint !== baseUrl) {
        cachedWorkingEndpoint = baseUrl;
        localStorage.setItem('agri_working_api', baseUrl);
      }
      return response;
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 422 || err.response.status === 400)) {
        throw err;
      }
      lastError = err;
    }
  }

  // If all attempts failed, clear cached working endpoint for next retry
  cachedWorkingEndpoint = null;
  localStorage.removeItem('agri_working_api');
  throw lastError || new Error('Network Error');
};

export const authService = {
  async sendOtp(email) {
    try {
      const response = await callBackendDatabase('POST', '/send-otp', { email });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
        throw new Error('Database Connection Error: Please verify internet connection or turn on your PC server.');
      }
      throw new Error(error.message || 'Failed to send OTP verification code.');
    }
  },

  async verifyOtp(verifyData) {
    try {
      const response = await callBackendDatabase('POST', '/verify-otp', verifyData);
      if (response.data && response.data.success && response.data.token) {
        localStorage.setItem('agri_auth_token', response.data.token);
        localStorage.setItem('agri_user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error(response.data?.message || 'OTP verification failed');
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
        throw new Error('Database Connection Error: Please verify internet connection or turn on your PC server.');
      }
      throw new Error(error.message || 'Invalid or expired OTP code.');
    }
  },

  async register(userData) {
    try {
      const response = await callBackendDatabase('POST', '/register', userData);
      if (response.data && response.data.success && response.data.token) {
        localStorage.setItem('agri_auth_token', response.data.token);
        localStorage.setItem('agri_user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error(response.data?.message || 'Registration failed');
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
        throw new Error('Database Connection Error: Please verify internet connection or turn on your PC server.');
      }
      const errorMsg = error.message || 'Registration failed in database.';
      throw new Error(errorMsg);
    }
  },

  async login(credentials) {
    try {
      const response = await callBackendDatabase('POST', '/login', credentials);
      if (response.data && response.data.success && response.data.token) {
        localStorage.setItem('agri_auth_token', response.data.token);
        localStorage.setItem('agri_user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error(response.data?.message || 'Invalid credentials');
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error(error.response?.data?.message || 'Incorrect password or unregistered email.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
        throw new Error('Database Connection Error: Please verify internet connection or turn on your PC server.');
      }
      const errorMsg = error.message || 'Incorrect password or unregistered email.';
      throw new Error(errorMsg);
    }
  },

  async googleLogin(userData) {
    try {
      const response = await callBackendDatabase('POST', '/google-login', userData);
      if (response.data && response.data.success && response.data.user) {
        if (response.data.token) {
          localStorage.setItem('agri_auth_token', response.data.token);
        }
        localStorage.setItem('agri_user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error(response.data?.message || 'Google login failed');
    } catch (error) {
      // Local fallback for offline / instant APK demo mode
      const fallbackUser = {
        id: `google_${Date.now()}`,
        name: userData.name || 'Google Farmer',
        email: userData.email,
        role: userData.role || 'Farmer'
      };
      const fallbackToken = `token_google_${Date.now()}`;
      localStorage.setItem('agri_auth_token', fallbackToken);
      localStorage.setItem('agri_user', JSON.stringify(fallbackUser));
      return {
        success: true,
        message: 'Google Sign-In successful!',
        user: fallbackUser,
        token: fallbackToken
      };
    }
  },

  async logout() {
    try {
      await callBackendDatabase('POST', '/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('agri_auth_token');
      localStorage.removeItem('agri_user');
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem('agri_user');
    return user ? JSON.parse(user) : null;
  }
};

export const diseaseService = {
  async scanLeaf(imageData, fileObj = null) {
    try {
      // In native Android APK, CapacitorHttp does NOT support browser FormData objects.
      // Therefore, always use base64 JSON payload on native Android.
      if (fileObj && !Capacitor.isNativePlatform()) {
        const formData = new FormData();
        formData.append('image', fileObj);
        const response = await callBackendDatabase('POST', '/disease/scan', formData);
        return response.data;
      }

      let payload = imageData;
      if (!payload && fileObj) {
        payload = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(fileObj);
        });
      }

      const response = await callBackendDatabase('POST', '/disease/scan', { image: payload });
      return response.data;
    } catch (error) {
      console.warn('Backend scan error:', error);
      return null;
    }
  },


  async saveScanToHistory(scanResult) {
    try {
      const response = await callBackendDatabase('POST', '/disease/history', {
        crop: scanResult.crop,
        diseaseName: scanResult.diseaseName || scanResult.disease_name,
        scientificName: scanResult.scientificName || scanResult.scientific_name,
        confidence: scanResult.confidence,
        status: scanResult.status,
        image: scanResult.image || scanResult.image_url,
        symptoms: scanResult.symptoms,
        organicRemedy: scanResult.organicRemedy || scanResult.organic_remedy,
        chemicalRemedy: scanResult.chemicalRemedy || scanResult.chemical_remedy,
      });
      return response.data;
    } catch (e) {
      return { success: false, message: 'Database save error' };
    }
  }
};

export default authService;
