import React from 'react';
import { Sprout, ShieldAlert, CloudSun, UserCheck, LogIn, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, user, onOpenAuth, onLogout }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 17, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(52, 211, 153, 0.15)',
      padding: '0.9rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('detector')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <img 
            src="/agri-logo.png" 
            alt="Agri Bandhu Logo" 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f3f4f6', margin: 0, letterSpacing: '-0.03em' }}>
                Agri<span style={{ color: '#34d399' }}>Bandhu</span>
              </h1>
              <span style={{
                fontSize: '0.65rem',
                background: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                fontWeight: 700,
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}>
                कृषि बंधु v2.5
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
              AI Plant Health & Smart Farmer Advisory
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActivePage('detector')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '12px',
              border: activePage === 'detector' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
              background: activePage === 'detector' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activePage === 'detector' ? '#34d399' : '#d1d5db',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldAlert size={18} />
            <span>Disease Detector</span>
          </button>

          <button
            onClick={() => setActivePage('weather')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '12px',
              border: activePage === 'weather' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
              background: activePage === 'weather' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activePage === 'weather' ? '#34d399' : '#d1d5db',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <CloudSun size={18} />
            <span>Weather & Crops</span>
          </button>

          <button
            onClick={() => setActivePage('auth')}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '12px',
              border: activePage === 'auth' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
              background: activePage === 'auth' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activePage === 'auth' ? '#34d399' : '#d1d5db',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <UserCheck size={18} />
            <span>User Portal</span>
          </button>
        </nav>

        {/* User Auth Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '0.4rem 0.8rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                  {user.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary"
              style={{ fontSize: '0.88rem', padding: '0.55rem 1.2rem' }}
            >
              <LogIn size={17} />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
