import React, { useState } from 'react';
import { 
  Mail, Lock, User as UserIcon, ShieldCheck, LogIn, UserPlus, 
  LogOut, CheckCircle2, AlertCircle, ArrowRight, Sparkles 
} from 'lucide-react';
import { authService } from '../services/api';
import { TRANSLATIONS } from '../translations';

export default function AuthModal({ user, setUser, onScanRedirect, lang = 'hi' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

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

  // Google Login Handler (Fix 6)
  const handleGoogleSignInClick = () => {
    setMessage(null);
    setError(null);
    setShowGooglePrompt(true);
  };

  const executeGoogleLogin = async (email, name) => {
    const cleanEmail = (email || googleEmail).trim();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError(lang === 'hi' ? 'कृपया एक मान्य Google ईमेल दर्ज करें।' : 'Please enter a valid Google email.');
      return;
    }

    setLoading(true);
    setShowGooglePrompt(false);

    try {
      const res = await authService.googleLogin({
        email: cleanEmail,
        name: (name || googleName || cleanEmail.split('@')[0]).trim(),
        role: formData.role || 'Farmer'
      });

      if (res && res.user) {
        setUser(res.user);
        setMessage(lang === 'hi' ? 'Google खाता सफलतापूर्वक लिंक हो गया!' : 'Google account connected successfully!');
        if (onScanRedirect) {
          setTimeout(() => onScanRedirect(), 1200);
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

        {/* Fix 6: Official Google Login Button */}
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
            marginBottom: '1.25rem',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Official Google SVG Logo */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>{t.googleSignIn}</span>
        </button>

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

      {/* Google Account Modal for Web & APK */}
      {showGooglePrompt && (
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
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5eae1',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg width="26" height="26" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14281d', margin: '0 0 0.3rem 0' }}>
                {lang === 'hi' ? 'Google खाते से साइन इन करें' : 'Sign in with Google'}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                {lang === 'hi' ? 'कृषि बंधु पर अपना Google ईमेल चुनें या दर्ज करें:' : 'Choose or confirm your Google account for Agri Bandhu:'}
              </p>
            </div>

            {/* Quick 1-Tap Google Accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {[
                { name: 'Kisan Ramesh Kumar', email: 'ramesh.kisan@gmail.com' },
                { name: 'Farmer Surendra Singh', email: 'surendra.farmer@gmail.com' },
              ].map((acc, i) => (
                <button
                  key={i}
                  onClick={() => executeGoogleLogin(acc.email, acc.name)}
                  style={{
                    background: '#f8faf6',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#15803d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                    {acc.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#14281d' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Google Account Entry */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                {lang === 'hi' ? 'या अपना व्यक्तिगत Google ईमेल दर्ज करें:' : 'Or enter your Google email:'}
              </div>
              <input
                type="email"
                placeholder="your.name@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  marginBottom: '0.6rem',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder={lang === 'hi' ? 'आपका नाम (वैकल्पिक)' : 'Your Name (optional)'}
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                onClick={() => setShowGooglePrompt(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#4b5563',
                  cursor: 'pointer'
                }}
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={() => executeGoogleLogin()}
                className="btn-primary"
                style={{ padding: '0.75rem', fontSize: '0.88rem' }}
              >
                {t.googleSignIn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
