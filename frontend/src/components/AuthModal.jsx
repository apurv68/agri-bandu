import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ShieldCheck, LogIn, UserPlus, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthModal({ user, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

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

  // Direct 1-Step Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const cleanEmail = formData.email.trim();
    if (!isValidEmail(cleanEmail)) {
      setError('Invalid Email Address: Please enter a valid email format (e.g. farmer@agribandhu.in).');
      return;
    }

    if (!formData.name.trim() || formData.password.length < 6) {
      setError('Please fill in your full name and a password with at least 6 characters.');
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
        setMessage(res.message || 'Account created successfully! Welcome to Agri Bandhu.');
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
      setError('Invalid Email Format: Please enter a valid registered email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ email: cleanEmail, password: formData.password });
      setUser(res.user);
      setMessage(res.message || 'Welcome back to Agri Bandhu!');
    } catch (err) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

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
            Welcome, {user.name}!
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Signed in as <strong style={{ color: '#15803d' }}>{user.email}</strong> • Role: <strong style={{ color: '#0284c7' }}>{user.role || 'Farmer'}</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '540px', margin: '0 auto 2rem auto' }}>
            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>Active Role</div>
              <div style={{ fontSize: '1.1rem', color: '#14281d', fontWeight: 800, marginTop: '0.2rem' }}>{user.role || 'Farmer Partner'}</div>
            </div>
            <div style={{ background: '#f8faf6', border: '1px solid #e2ebd8', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>Account Security</div>
              <div style={{ fontSize: '1.1rem', color: '#15803d', fontWeight: 800, marginTop: '0.2rem' }}>Verified ✓</div>
            </div>
          </div>

          <div>
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
              <span>Sign Out Account</span>
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
            {isLogin ? 'Farmer Portal Login' : 'Create Farmer Account'}
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: 0 }}>
            {isLogin ? 'Sign in to access your crop scan history' : 'Register to manage crop diagnostics & farm schedule'}
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
            Sign In
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
            Sign Up
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

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                Email Address
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
                Password
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
              <span>{loading ? 'Verifying Account...' : 'Sign In to Account'}</span>
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM: 1-STEP DIRECT REGISTRATION */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#14281d', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ramesh Kumar"
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
                Email Address
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
                Password (min 6 characters)
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
                Farming Profile Type
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
                <option value="Farmer">Crop Farmer (फसल किसान)</option>
                <option value="Gardener">Home Gardener / Horticulturist (बागवान)</option>
                <option value="Agronomist">Agricultural Consultant / Agronomist (कृषि विशेषज्ञ)</option>
                <option value="Student">Agri Student / Researcher (कृषि विद्यार्थी)</option>
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
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
