import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import DiseaseDetector from './components/DiseaseDetector';
import WeatherAndCrops from './components/WeatherAndCrops';
import { authService } from './services/api';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('detector'); // 'auth' | 'detector' | 'weather'
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar Header */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onOpenAuth={() => setActivePage('auth')}
        onLogout={handleLogout}
      />

      {/* Main Content View Switcher */}
      <main style={{ flex: 1 }}>
        {activePage === 'auth' && (
          <AuthModal
            user={user}
            setUser={setUser}
            onScanRedirect={() => setActivePage('detector')}
          />
        )}

        {activePage === 'detector' && (
          <DiseaseDetector user={user} />
        )}

        {activePage === 'weather' && (
          <WeatherAndCrops />
        )}
      </main>

      {/* Modern Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(52, 211, 153, 0.15)',
        background: 'rgba(10, 17, 14, 0.95)',
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '0.88rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f3f4f6', fontWeight: 600 }}>
            <img src="/agri-logo.png" alt="Logo" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
            <span>Agri Bandhu (कृषि बंधु) - Empowering Modern Farming</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            Built with <Heart size={13} color="#ef4444" style={{ display: 'inline', margin: '0 2px' }} /> for Agricultural Innovation
          </div>
        </div>
      </footer>

    </div>
  );
}
