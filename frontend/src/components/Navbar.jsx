import React from 'react';
import { Menu, Globe, LogIn, LogOut, User } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  user, 
  onOpenAuth, 
  onLogout, 
  lang, 
  setLang,
  onToggleSidebar 
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  return (
    <header className="agri-topbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 99,
      background: 'rgba(18, 57, 36, 0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '0.65rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Left: Slide-in Tools Menu Toggle + Original Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          onClick={onToggleSidebar}
          className="hamburger-btn"
          aria-label={lang === 'hi' ? 'नेविगेशन टूल्स खोलें' : 'Open Navigation Tools'}
          title={lang === 'hi' ? 'नेविगेशन टूल्स (स्लाइड इन)' : 'Navigation Tools (Slide In)'}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '0.45rem 0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Menu size={20} color="#86efac" />
          <span className="tools-btn-label" style={{ color: '#ffffff', fontWeight: 700 }}>
            {lang === 'hi' ? 'टूल्स' : 'Tools'}
          </span>
        </button>

        <div 
          onClick={() => setActivePage('detector')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <img 
            src="/agri-logo.png" 
            alt="Agri Bandhu Logo" 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '2px solid rgba(134, 239, 172, 0.45)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Agri<span style={{ color: '#86efac' }}>Bandhu</span>
              </span>
            </div>
            <p className="agri-nav-subtitle" style={{ margin: 0, fontSize: '0.72rem', color: '#bbf7d0', opacity: 0.9, fontWeight: 500, lineHeight: 1.2 }}>
              {t.navSubtitle || (lang === 'hi' ? 'एआई फसल स्वास्थ्य एवं स्मार्ट कृषि सलाहकार' : 'AI Plant Health & Smart Farmer Advisory')}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Language Switcher & User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Quick Language Toggle */}
        <button
          onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
          title="भाषा बदलें / Change Language"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            padding: '0.35rem 0.65rem',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          <Globe size={15} color="#86efac" />
          <span style={{ color: '#86efac' }}>{lang === 'hi' ? 'अ' : 'A'}</span>
        </button>

        {/* User Pill / Login Button */}
        {user ? (
          <div 
            onClick={() => setActivePage('auth')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(134, 239, 172, 0.35)',
              padding: '0.3rem 0.65rem',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#86efac' }} />
            <span style={{ 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: '#ffffff',
              maxWidth: '80px',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>
              {user.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '0.38rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <LogIn size={15} />
            <span>{lang === 'hi' ? 'लॉगिन' : 'Login'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
