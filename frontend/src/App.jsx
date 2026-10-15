import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import DiseaseDetector from './components/DiseaseDetector';
import WeatherAndCrops from './components/WeatherAndCrops';
import FarmManager from './components/FarmManager';
import { authService } from './services/api';
import { Sprout, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

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

export default function App() {
  const [activePage, setActivePage] = useState('detector'); // 'auth' | 'detector' | 'weather' | 'farm'
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
      <ErrorBoundary>
        <main style={{ flex: 1 }}>
          {activePage === 'auth' && (
            <AuthModal
              user={user}
              setUser={setUser}
              onScanRedirect={() => setActivePage('detector')}
            />
          )}

          {activePage === 'detector' && (
            <DiseaseDetector 
              user={user} 
              onNavigateFarm={() => setActivePage('farm')} 
            />
          )}

          {activePage === 'weather' && (
            <WeatherAndCrops />
          )}

          {activePage === 'farm' && (
            <FarmManager 
              user={user} 
              onScanRedirect={() => setActivePage('detector')} 
            />
          )}
        </main>
      </ErrorBoundary>

      {/* Modern Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: '#0e2a1b',
        padding: '1.5rem 1.5rem',
        textAlign: 'center',
        color: '#bbf7d0',
        fontSize: '0.88rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600 }}>
            <img src="/agri-logo.png" alt="Logo" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
            <span>Agri Bandhu (कृषि बंधु) - Empowering Modern Farming</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
            Built with <Heart size={13} color="#ef4444" style={{ display: 'inline', margin: '0 2px' }} /> for Agricultural Innovation
          </div>
        </div>
      </footer>

    </div>
  );
}
