import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SuccessPopup from '../components/common/SuccessPopup';
import Confetti from '../components/common/Confetti';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Parent'
  });

  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const roleMap = { Parent: 'user', Caretaker: 'caretaker', Admin: 'admin' };
      const result = await login({
        email:    formData.email,
        password: formData.password,
        role:     roleMap[formData.role] || 'user',
      });

      // Check if 2FA is required
      if (result.requires2FASetup) {
        setTempUserId(result.userId);
        setRequiresSetup(true);
        setLoading(false);
        setShow2FA(true);
        return;
      }

      if (result.requires2FA) {
        setTempUserId(result.userId);
        setRequiresSetup(false);
        setLoading(false);
        setShow2FA(true);
        return;
      }

      // Normal login success
      const loggedInUser = result?.user;
      setShowSuccess(true);

      setTimeout(() => {
        const roleRoutes = {
          user:        '/parent-dashboard',
          caretaker:   '/caretaker-dashboard',
          admin:       '/admin-dashboard',
        };
        const role = loggedInUser?.role || 'user';
        const path = roleRoutes[role] || '/';
        navigate(path, { replace: true });
      }, 1500);

    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please check your credentials.' });
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-login-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempUserId,
          token: useBackup ? '' : otpCode,
          backupCode: useBackup ? backupCode : ''
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Invalid code');
      }

      // Save token and user
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      setShowSuccess(true);
      setShow2FA(false);

      setTimeout(() => {
        const roleRoutes = {
          user:        '/parent-dashboard',
          caretaker:   '/caretaker-dashboard',
          admin:       '/admin-dashboard',
        };
        const role = result.user?.role || 'user';
        const path = roleRoutes[role] || '/';
        navigate(path, { replace: true });
        window.location.reload();
      }, 1500);

    } catch (error) {
      setErrors({ general: error.message || 'Invalid code. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {showConfetti && <Confetti />}

      <div className="login-container">
        <a href="/" className="nl-back-btn" style={{ position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', zIndex: 10 }}>
          ← Back to Home
        </a>
        <div className="login-card">
          <div className="login-header">
            <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height: '60px', width: 'auto', marginBottom: '10px' }} />
            <h1>{show2FA ? '🔐 Two-Factor Auth' : requiresSetup ? '🔒 Setup Required' : 'Welcome Back!'}</h1>
            <p>{show2FA ? (requiresSetup ? 'Enable 2FA to continue' : 'Enter your 6-digit code') : 'Sign in to continue to your dashboard'}</p>
          </div>

          {show2FA ? (
            <form className="login-form" onSubmit={handle2FASubmit}>
              {errors.general && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  {errors.general}
                </div>
              )}

              {!useBackup ? (
                <>
                  <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ color: '#64748B', marginBottom: '16px', fontSize: '0.88rem' }}>
                      Open your authenticator app and enter the 6-digit code
                    </p>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      style={{
                        width: '150px',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '2px solid #E2E8F0',
                        fontSize: '1.8rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        letterSpacing: '8px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </div>

                  <button type="submit" className="btn-login" disabled={loading || otpCode.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseBackup(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      marginTop: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Lost access? Use backup code
                  </button>
                </>
              ) : (
                <>
                  <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ color: '#64748B', marginBottom: '16px', fontSize: '0.88rem' }}>
                      Enter one of your backup codes
                    </p>
                    <input
                      type="text"
                      value={backupCode}
                      onChange={e => setBackupCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      autoFocus
                      style={{
                        width: '120px',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '2px solid #E2E8F0',
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </div>

                  <button type="submit" className="btn-login" disabled={loading || backupCode.length < 6}>
                    {loading ? 'Verifying...' : 'Use Backup Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setUseBackup(false); setBackupCode(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      marginTop: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Back to OTP
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => { setShow2FA(false); setOtpCode(''); setBackupCode(''); setUseBackup(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  marginTop: '16px'
                }}
              >
                ← Back to login
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role">Login As</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="Parent">Parent</option>
                  <option value="Caretaker">Caretaker (Nanny)</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && <span className="error-text">{errors.role}</span>}
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              <div className="login-footer">
                <p>
                  First time here?{' '}
                  <Link to="/signup" className="signup-link">Sign Up</Link>
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="login-illustration">
          <div className="illustration-content">
            <h2>Safe • Caring • Smart Child Care</h2>
            <p>Join thousands of families who trust us with their children's wellbeing</p>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Happy Kids</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Expert Caretakers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Activities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessPopup
          message="Login Successful!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default Login;
