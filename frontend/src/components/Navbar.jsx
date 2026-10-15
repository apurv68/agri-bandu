import React from 'react';
import { Sprout, ShieldAlert, CloudSun, UserCheck, LogIn, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, user, onOpenAuth, onLogout }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#123924',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 4px 20px rgba(18, 57, 36, 0.15)',
      padding: '0.85rem 1.5rem',
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
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Agri<span style={{ color: '#86efac' }}>Bandhu</span>
              </h1>
              <span style={{
                fontSize: '0.65rem',
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}>
                कृषि बंधु v2.5
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#bbf7d0', margin: 0, opacity: 0.9 }}>
              AI Plant Health & Smart Farmer Advisory
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActivePage('detector')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '12px',
              border: activePage === 'detector' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              background: activePage === 'detector' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldAlert size={17} />
            <span>Disease Detector</span>
          </button>

          <button
            onClick={() => setActivePage('weather')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '12px',
              border: activePage === 'weather' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              background: activePage === 'weather' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: activePage === 'weather' ? '#ffffff' : '#d1e7dd',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <CloudSun size={17} />
            <span>Weather & Crops</span>
          </button>

          <button
            onClick={() => setActivePage('farm')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '12px',
              border: activePage === 'farm' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              background: activePage === 'farm' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Sprout size={17} />
            <span>My Farm & Schedule</span>
          </button>

          <button
            onClick={() => setActivePage('auth')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '12px',
              border: activePage === 'auth' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              background: activePage === 'auth' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: activePage === 'auth' ? '#ffffff' : '#d1e7dd',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <UserCheck size={17} />
            <span>User Portal</span>
          </button>
        </nav>

        {/* User Auth Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '0.35rem 0.85rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#86efac' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  {user.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-amber"
              style={{ fontSize: '0.86rem', padding: '0.55rem 1.2rem', borderRadius: '12px' }}
            >
              <LogIn size={16} />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
