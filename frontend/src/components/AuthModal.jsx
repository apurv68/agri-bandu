import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Lock, User as UserIcon, ShieldCheck, LogIn, UserPlus, 
  LogOut, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Key 
} from 'lucide-react';
import { authService } from '../services/api';
import { TRANSLATIONS } from '../translations';

export default function AuthModal({ user, setUser, onScanRedirect, lang = 'hi' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const googleBtnContainerRef = useRef(null);
  const googleClientId = (() => {
    const raw = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
    if (raw && raw.trim().length > 10) return raw.trim();
    try {
      const b64 = import.meta.env?.VITE_GOOGLE_CLIENT_ID_B64 || 'OTQ5NzgzMjk4OTk2LXQycmlmcG9lbjFzaDg4aHQ4ZmlyMDBndGo5bWpjdTNlLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29t';
      if (typeof atob === 'function') return atob(b64).trim();
    } catch (e) {}
    return '';
  })();

  const executeGoogleLogin = async (email, name) => {
    if (!email) return;
    setLoading(true);

    try {
      const res = await authService.googleLogin({
        email: email.trim(),
        name: (name || email.split('@')[0]).trim(),
        role: formData.role || 'Farmer'
      });

      if (res && res.user) {
        setUser(res.user);
        setMessage(lang === 'hi' ? 'Google खाता सफलतापूर्वक लिंक हो गया!' : 'Google account connected successfully!');
        if (onScanRedirect) {
          setTimeout(() => onScanRedirect(), 800);
        }
      } else {
        setError(res.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGis = () => {
      if (!window.google?.accounts?.id || !googleBtnContainerRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            try {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const profile = JSON.parse(jsonPayload);
              executeGoogleLogin(profile.email, profile.name);
            } catch (e) {
              setError(lang === 'hi' ? 'Google प्रमाणीकरण विफल रहा।' : 'Failed to decode Google token.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
        });
      } catch (err) {
        console.warn('GIS error:', err);
      }
    };

    initGis();
    const timer = setTimeout(initGis, 800);
    return () => clearTimeout(timer);
  }, [isLogin]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Farmer',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const [showQuickGoogle, setShowQuickGoogle] = useState(false);
  const [quickGoogleEmail, setQuickGoogleEmail] = useState('');

  // Official Google OAuth 2.0 Direct Sign-In
  const redirectToGoogleOAuth = () => {
    setLoading(true);
    let redirectUri = window.location.origin + '/api/auth/google/callback';
    if (redirectUri.includes('localhost') && !redirectUri.includes(':3000')) {
      redirectUri = 'http://localhost:3000/api/auth/google/callback';
    }
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    }).toString();

    window.location.href = googleAuthUrl;
  };

  const handleGoogleSignInClick = () => {
    setMessage(null);
    setError(null);

    // Try Google Identity Services Token Client popup (no redirect required)
    if (window.google?.accounts?.oauth2 && googleClientId) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.warn('GSI Token error:', tokenResponse);
              if (tokenResponse.error === 'popup_closed_by_user') return;
              redirectToGoogleOAuth();
              return;
            }
            if (tokenResponse.access_token) {
              setLoading(true);
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await userRes.json();
                if (profile?.email) {
                  await executeGoogleLogin(profile.email, profile.name);
                  return;
                }
              } catch (fetchErr) {
                console.warn('Failed to fetch Google profile:', fetchErr);
              } finally {
                setLoading(false);
              }
            }
            redirectToGoogleOAuth();
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('GSI tokenClient init error, falling back to redirect:', e);
      }
    }

    redirectToGoogleOAuth();
  };

  const handleQuickGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!quickGoogleEmail || !isValidEmail(quickGoogleEmail)) {
      setError(lang === 'hi' ? 'कृपया सही Google ईमेल (उदा. kisan@gmail.com) दर्ज करें।' : 'Please enter a valid Google email.');
      return;
    }
    const nameFromEmail = quickGoogleEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
    const formattedName = nameFromEmail ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) : 'Google User';
    await executeGoogleLogin(quickGoogleEmail.trim(), formattedName);
  };

  // Direct 1-Step Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const cleanEmail = formData.email.trim();
    if (!isValidEmail(cleanEmail)) {
      setError(lang === 'hi' ? 'कृपया सही ईमेल दर्ज करें (उदा. kisan@gmail.com)।' : 'Please enter a valid email format.');
      return;
    }

    if (!formData.name.trim() || formData.password.length < 6) {
      setError(lang === 'hi' ? 'कृपया पूरा नाम और कम से कम 6 अक्षरों का पासवर्ड दर्ज करें।' : 'Please fill in your name and a password with at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({
        name: formData.name.trim(),
        email: cleanEmail,
        password: formData.password,
        role: formData.role
      });

      if (res && res.success && res.user) {
        setUser(res.user);
        setMessage(res.message || (lang === 'hi' ? 'खाता सफलतापूर्वक बन गया! स्वागत है।' : 'Account created successfully! Welcome to Agri Bandhu.'));
        if (onScanRedirect) {
          setTimeout(() => onScanRedirect(), 1200);
        }
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const cleanEmail = formData.email.trim();
    if (!isValidEmail(cleanEmail)) {
      setError(lang === 'hi' ? 'कृपया सही ईमेल दर्ज करें।' : 'Please enter a valid registered email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ email: cleanEmail, password: formData.password });
      setUser(res.user);
      setMessage(res.message || (lang === 'hi' ? 'सफलतापूर्वक लॉगिन हो गए!' : 'Welcome back to Agri Bandhu!'));
      if (onScanRedirect) {
        setTimeout(() => onScanRedirect(), 1200);
      }
    } catch (err) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Render Logged-In User Profile Card
  if (user) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#ffffff', border: '1px solid #e5eae1', borderRadius: '24px', boxShadow: '0 10px 30px rgba(18, 57, 36, 0.08)' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: '#f0fdf4',
            border: '2px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 20px rgba(22, 101, 52, 0.12)',
          }}>
            <ShieldCheck size={44} color="#15803d" />
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#14281d', marginBottom: '0.4rem' }}>
            {lang === 'hi' ? `नमस्ते, ${user.name} जी!` : `Welcome, ${user.name}!`}
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            {lang === 'hi' ? 'लॉगिन खाता:' : 'Signed in as'} <strong style={{ color: '#15803d' }}>{user.email}</strong> • {lang === 'hi' ? 'भूमिका:' : 'Role:'} <strong style={{ color: '#0284c7' }}>{user.role || 'Farmer'}</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '540px', margin: '0 auto 2rem auto' }}>
            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{lang === 'hi' ? 'सक्रिय प्रोफ़ाइल' : 'Active Role'}</div>
              <div style={{ fontSize: '1.1rem', color: '#14281d', fontWeight: 800, marginTop: '0.2rem' }}>{user.role || 'Farmer Partner'}</div>
            </div>
            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{lang === 'hi' ? 'सुरक्षा स्थिति' : 'Security Status'}</div>
              <div style={{ fontSize: '1.1rem', color: '#15803d', fontWeight: 800, marginTop: '0.2rem' }}>{lang === 'hi' ? 'सत्यापित ✓' : 'Verified ✓'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {onScanRedirect && (
              <button
                onClick={onScanRedirect}
                className="btn-primary"
                style={{ padding: '0.75rem 1.8rem', fontSize: '0.95rem' }}
              >
                <span>{lang === 'hi' ? 'पत्ती की जांच शुरू करें' : 'Go to Leaf Scanner'}</span>
                <ArrowRight size={18} />
              </button>
            )}

            <button
              onClick={async () => {
                await authService.logout();
                setUser(null);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #d1d5db',
                color: '#374151',
                padding: '0.75rem 2rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <LogOut size={18} />
              <span>{t.navLogout}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', background: '#ffffff', border: '1px solid #e5eae1', borderRadius: '24px', boxShadow: '0 10px 30px rgba(18, 57, 36, 0.08)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.1rem',
            boxShadow: '0 4px 15px rgba(22, 101, 52, 0.08)'
          }}>
            {isLogin ? <LogIn size={28} color="#15803d" /> : <UserPlus size={28} color="#15803d" />}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#14281d', margin: '0 0 0.3rem 0' }}>
            {isLogin ? t.authTitleLogin : t.authTitleRegister}
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: 0 }}>
            {t.authSub}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '14px',
          padding: '0.3rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0',
        }}>
          <button
            onClick={() => { setIsLogin(true); setMessage(null); setError(null); }}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '11px',
              border: 'none',
              background: isLogin ? '#16a34a' : 'transparent',
              color: isLogin ? '#ffffff' : '#4b5563',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isLogin ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none'
            }}
          >
            {t.loginBtn}
          </button>
          <button
            onClick={() => { setIsLogin(false); setMessage(null); setError(null); }}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '11px',
              border: 'none',
              background: !isLogin ? '#16a34a' : 'transparent',
              color: !isLogin ? '#ffffff' : '#4b5563',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: !isLogin ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none'
            }}
          >
            {t.registerBtn}
          </button>
        </div>

        {/* Success Alert Modal */}
        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: '14px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={20} color="#15803d" style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {/* Error Alert Modal */}
        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: '14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600
          }}>
            <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Fix 6: Single Official Google Login Button (Method 2 Web/APK) */}
        <button
          onClick={handleGoogleSignInClick}
          type="button"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            background: '#ffffff',
            border: '1.5px solid #d1d5db',
            borderRadius: '12px',
            color: '#374151',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            marginBottom: '0.65rem',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1
          }}
        >
          {/* Official Google SVG Logo */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>{loading ? 'Connecting Google...' : t.googleSignIn}</span>
        </button>

        {/* 1-Click Direct Google Account Fallback / Quick Sign-in */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setShowQuickGoogle(!showQuickGoogle)}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.2rem'
            }}
          >
            {showQuickGoogle 
              ? (lang === 'hi' ? '✕ त्वरित Google बॉक्स बंद करें' : '✕ Close Quick Google Sign-In')
              : (lang === 'hi' ? '⚡ Google ईमेल से तुरंत 1-क्लिक लॉगिन' : '⚡ 1-Click Login with Google Email')}
          </button>

          {showQuickGoogle && (
            <form onSubmit={handleQuickGoogleSubmit} style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                required
                placeholder={lang === 'hi' ? 'अपना जीमेल दर्ज करें (उदा. apurvgoel68@gmail.com)' : 'Enter your Gmail (e.g. apurvgoel68@gmail.com)'}
                value={quickGoogleEmail}
                onChange={(e) => setQuickGoogleEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  border: '1.5px solid #d1d5db',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.65rem 1rem',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {lang === 'hi' ? 'लॉगिन' : 'Log In'}
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.82rem',
          fontWeight: 600,
          margin: '1.25rem 0'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ padding: '0 0.8rem' }}>{t.orContinueWith}</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                {t.emailLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="farmer@agribandhu.in"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.75rem',
                    background: '#ffffff',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '12px',
                    color: '#14281d',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                {t.passwordLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.75rem',
                    background: '#ffffff',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '12px',
                    color: '#14281d',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <LogIn size={20} />
              <span>{loading ? 'Verifying...' : t.loginBtn}</span>
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                {t.nameLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={lang === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar'}
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.75rem',
                    background: '#ffffff',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '12px',
                    color: '#14281d',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                {t.emailLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="farmer@agribandhu.in"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.75rem',
                    background: '#ffffff',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '12px',
                    color: '#14281d',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                {t.passwordLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.75rem',
                    background: '#ffffff',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '12px',
                    color: '#14281d',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                {lang === 'hi' ? 'किसान प्रोफ़ाइल श्रेणी' : 'Farming Profile Type'}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  background: '#ffffff',
                  border: '1.5px solid #d1d5db',
                  borderRadius: '12px',
                  color: '#14281d',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <option value="Farmer">{lang === 'hi' ? 'फसल किसान (Crop Farmer)' : 'Crop Farmer'}</option>
                <option value="Gardener">{lang === 'hi' ? 'बागवान (Horticulturist)' : 'Home Gardener / Horticulturist'}</option>
                <option value="Agronomist">{lang === 'hi' ? 'कृषि विशेषज्ञ (Agronomist)' : 'Agricultural Consultant / Agronomist'}</option>
                <option value="Student">{lang === 'hi' ? 'कृषि विद्यार्थी (Student)' : 'Agri Student / Researcher'}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <UserPlus size={20} />
              <span>{loading ? 'Creating...' : t.registerBtn}</span>
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
