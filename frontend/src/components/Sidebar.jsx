import React from 'react';
import { 
  ShieldAlert, 
  CloudSun, 
  Sprout, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Globe, 
  X,
  ChevronRight
} from 'lucide-react';
import { TRANSLATIONS } from '../translations';

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  user, 
  onOpenAuth, 
  onLogout, 
  lang, 
  setLang,
  isOpen,
  onClose 
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  const navItems = [
    {
      id: 'detector',
      label: t.navDetector,
      icon: ShieldAlert,
      badge: lang === 'hi' ? 'AI जांच' : 'AI Scan',
      badgeColor: '#10b981'
    },
    {
      id: 'weather',
      label: t.navWeather,
      icon: CloudSun,
      badge: lang === 'hi' ? 'लाइव' : 'Live',
      badgeColor: '#38bdf8'
    },
    {
      id: 'farm',
      label: t.navFarm,
      icon: Sprout,
      badge: lang === 'hi' ? 'खेत' : 'Farm',
      badgeColor: '#86efac'
    },
    {
      id: 'auth',
      label: t.navUser,
      icon: UserCheck,
      badge: user ? (lang === 'hi' ? 'सक्रिय' : 'Active') : (lang === 'hi' ? 'लॉगिन' : 'Login'),
      badgeColor: user ? '#a7f3d0' : '#fde047'
    }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Main Sidebar (Desktop fixed left, Mobile drawer) */}
      <aside 
        className={`agri-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: '270px',
          height: '100vh',
          background: 'linear-gradient(180deg, #0d281a 0%, #061a10 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '4px 0 25px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          flexShrink: 0
        }}
      >
        {/* Sidebar Header with Brand Logo & Close on mobile */}
        <div style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div 
            onClick={() => handleNavClick('detector')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <img 
              src="/agri-logo.png" 
              alt="Agri Bandhu" 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '1.5px solid rgba(134, 239, 172, 0.4)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Agri<span style={{ color: '#86efac' }}>Bandhu</span>
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  background: 'rgba(134, 239, 172, 0.15)',
                  color: '#86efac',
                  padding: '0.12rem 0.45rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  border: '1px solid rgba(134, 239, 172, 0.3)'
                }}>
                  v2.5
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#a7f3d0', opacity: 0.85 }}>
                {lang === 'hi' ? 'स्मार्ट कृषि सलाहकार' : 'Smart Farming Advisor'}
              </p>
            </div>
          </div>

          {/* Drawer Close Button */}
          <button
            onClick={onClose}
            className="drawer-close-btn"
            aria-label="Close Navigation Drawer"
            title={lang === 'hi' ? 'बंद करें' : 'Close'}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} color="#86efac" />
          </button>
        </div>

        {/* Sidebar Nav Items List */}
        <div style={{
          padding: '1.25rem 0.85rem',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem'
        }}>
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            color: '#6ee7b7', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            padding: '0 0.6rem 0.5rem 0.6rem'
          }}>
            {lang === 'hi' ? 'मुख्य नेविगेशन' : 'Main Navigation'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 0.95rem',
                  borderRadius: '14px',
                  border: isActive ? '1px solid rgba(134, 239, 172, 0.35)' : '1px solid transparent',
                  background: isActive 
                    ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 78, 59, 0.25) 100%)' 
                    : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isActive ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}>
                    <Icon size={19} />
                  </div>
                  <span style={{ 
                    fontSize: '0.92rem', 
                    fontWeight: isActive ? 800 : 600,
                    letterSpacing: '-0.01em'
                  }}>
                    {item.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#86efac' : '#94a3b8'
                  }}>
                    {item.badge}
                  </span>
                  {isActive && <ChevronRight size={16} color="#86efac" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Language & User Profile Card */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Globe size={17} color="#86efac" />
              <span>{lang === 'hi' ? 'भाषा (Language)' : 'Language'}</span>
            </div>
            <span style={{ 
              background: '#10b981', 
              color: '#ffffff', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '8px', 
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {lang === 'hi' ? 'हिंदी' : 'English'}
            </span>
          </button>

          {/* User Profile Card / Login Button */}
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(134, 239, 172, 0.25)'
            }}>
              <div 
                onClick={() => handleNavClick('auth')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', overflow: 'hidden' }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ 
                    color: '#ffffff', 
                    fontSize: '0.88rem', 
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {user.name}
                  </div>
                  <div style={{ color: '#86efac', fontSize: '0.72rem' }}>
                    {user.role || (lang === 'hi' ? 'फसल किसान' : 'Farmer')}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title={t.navLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '0.45rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('auth')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <LogIn size={17} />
              <span>{t.navLogin}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
