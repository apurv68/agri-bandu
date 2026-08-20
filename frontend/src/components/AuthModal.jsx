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
        setError(res.message || 'Registration failed in database.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed in database.');
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
      <div style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))',
            border: '2px solid #34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
          }}>
            <ShieldCheck size={40} color="#34d399" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f3f4f6', marginBottom: '0.5rem' }}>
            Welcome, {user.name}!
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Signed in as <strong style={{ color: '#34d399' }}>{user.email}</strong> • Role: <strong style={{ color: '#60a5fa' }}>{user.role || 'Farmer'}</strong>
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '2rem',
          }}>
            <CheckCircle2 size={16} />
            <span>Database Account Connected & Active</span>
          </div>

          <div>
            <button
              onClick={async () => {
                await authService.logout();
                setUser(null);
              }}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
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
    <div style={{ maxWidth: '480px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.25rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            {isLogin ? <LogIn size={26} color="#34d399" /> : <UserPlus size={26} color="#34d399" />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f3f4f6' }}>
            {isLogin ? 'Farmer Portal Login' : 'Create Farmer Account'}
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.3rem' }}>
            {isLogin ? 'Sign in to access your crop scan history' : 'Register to manage crop diagnostics'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          padding: '0.25rem',
          marginBottom: '1.75rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            onClick={() => { setIsLogin(true); setMessage(null); setError(null); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '10px',
              border: 'none',
              background: isLogin ? 'var(--emerald-600)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setMessage(null); setError(null); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '10px',
              border: 'none',
              background: !isLogin ? 'var(--emerald-600)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Success Alert Modal */}
        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {/* Error Alert Modal */}
        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="farmer@agribandhu.in"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
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
                padding: '0.85rem',
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
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="farmer@agribandhu.in"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Password (min 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
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
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Farming Profile Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              >
                <option value="Farmer" style={{ background: '#111827' }}>Crop Farmer</option>
                <option value="Gardener" style={{ background: '#111827' }}>Home Gardener / Horticulturist</option>
                <option value="Agronomist" style={{ background: '#111827' }}>Agricultural Consultant / Agronomist</option>
                <option value="Student" style={{ background: '#111827' }}>Agri Student / Researcher</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <UserPlus size={20} />
              <span>{loading ? 'Creating Account in Database...' : 'Create Account'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
