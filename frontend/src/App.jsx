import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import DiseaseDetector from './components/DiseaseDetector';
import WeatherAndCrops from './components/WeatherAndCrops';
import FarmManager from './components/FarmManager';
import { authService } from './services/api';
import { Sprout, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AgriBandhu ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '600px',
          margin: '4rem auto',
          padding: '2rem',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center',
          border: '1px solid #fee2e2'
        }}>
          <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { TRANSLATIONS } from './translations';

export default function App() {
  const [activePage, setActivePage] = useState('detector'); // 'auth' | 'detector' | 'weather' | 'farm'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('agri_lang') || 'hi');

  useEffect(() => {
    localStorage.setItem('agri_lang', lang);
  }, [lang]);

  useEffect(() => {
    // Process OAuth URL parameters (for both Web query params and APK deep links)
    const handleAuthUrl = async (urlString) => {
      try {
        if (!urlString) return;
        let queryPart = '';
        if (urlString.includes('?')) {
          queryPart = urlString.split('?')[1];
        } else if (window.location.search) {
          queryPart = window.location.search.substring(1);
        }

        if (!queryPart) return;
        const urlParams = new URLSearchParams(queryPart);
        const isGoogleAuth = urlParams.get('google_auth');
        const token = urlParams.get('token');
        const rawUser = urlParams.get('user');
        const authError = urlParams.get('error');

        if (authError) {
          try {
            await Browser.close();
          } catch (e) {}
          alert('Google Sign-In: ' + authError);
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          return;
        }

        if (isGoogleAuth === 'success' && rawUser) {
          const decodedUser = JSON.parse(atob(decodeURIComponent(rawUser)));
          if (token) {
            localStorage.setItem('agri_auth_token', token);
          }
          localStorage.setItem('agri_user', JSON.stringify(decodedUser));
          setUser(decodedUser);
          setActivePage('detector');
          try {
            await Browser.close();
          } catch (e) {}
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (err) {
        console.warn('OAuth URL parse error:', err);
      }
    };

    // 1. Check web browser URL on initial load
    handleAuthUrl(window.location.href);

    // 2. Listen for native Android deep link returns (agribandhu://auth?google_auth=success...)
    let appUrlListener = null;
    try {
      CapApp.addListener('appUrlOpen', async (data) => {
        if (data?.url && data.url.includes('agribandhu://auth')) {
          await handleAuthUrl(data.url);
        }
      }).then((listener) => {
        appUrlListener = listener;
      });
    } catch (e) {}

    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    return () => {
      if (appUrlListener?.remove) {
        appUrlListener.remove();
      }
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%', overflowX: 'hidden' }}>
      
      {/* Slide-in Left Navigation Tools Drawer (Web & Mobile APK) */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onOpenAuth={() => setActivePage('auth')}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main App Viewport (100% Full Screen Width) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh', width: '100%' }}>
        
        {/* Top Header Bar with Original Branding & Slide-in Tools Button */}
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          onOpenAuth={() => setActivePage('auth')}
          onLogout={handleLogout}
          lang={lang}
          setLang={setLang}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content View Switcher */}
        <ErrorBoundary>
          <main style={{ flex: 1 }}>
            {activePage === 'auth' && (
              <AuthModal
                user={user}
                setUser={setUser}
                onScanRedirect={() => setActivePage('detector')}
                lang={lang}
              />
            )}

            {activePage === 'detector' && (
              <DiseaseDetector 
                user={user} 
                onNavigateFarm={() => setActivePage('farm')}
                onOpenAuth={() => setActivePage('auth')}
                lang={lang}
                setLang={setLang}
              />
            )}

            {activePage === 'weather' && (
              <WeatherAndCrops 
                lang={lang}
              />
            )}

            {activePage === 'farm' && (
              <FarmManager 
                user={user} 
                onScanRedirect={() => setActivePage('detector')}
                lang={lang}
              />
            )}
          </main>
        </ErrorBoundary>

        {/* Modern Footer */}
        <footer style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0e2a1b',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          color: '#bbf7d0',
          fontSize: '0.88rem',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600 }}>
              <img src="/agri-logo.png" alt="Logo" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
              <span>{t.footerTagline}</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
              {t.footerLove}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

