// File Path: src/pages/AdminSignup.jsx
// FIXED: navigate immediately after signup (no setTimeout — setTimeout gets cancelled by PublicRoute unmount)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_SECRET = 'ADMIN2024';

const injectCSS = () => {
  if (document.getElementById('admin-signup-styles')) return;
  const style = document.createElement('style');
  style.id = 'admin-signup-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .as-root {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #1A237E 0%, #283593 50%, #3949AB 100%);
      font-family: 'Quicksand', sans-serif; position: relative; overflow: hidden;
    }
    .as-blob { position:absolute; border-radius:50%; filter:blur(70px); opacity:0.2; pointer-events:none; }
    .as-blob-1 { width:400px;height:400px;background:#7986CB;top:-100px;left:-80px;animation:asDrift 12s ease-in-out infinite; }
    .as-blob-2 { width:300px;height:300px;background:#5C6BC0;bottom:-60px;right:-60px;animation:asDrift 9s ease-in-out infinite reverse; }
    @keyframes asDrift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }

    .as-card {
      background:white; border-radius:28px; overflow:hidden;
      width:100%; max-width:520px;
      box-shadow:0 32px 80px rgba(0,0,0,0.3);
      position:relative; z-index:1;
      animation:asIn 0.5s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes asIn { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }

    .as-banner {
      background: linear-gradient(135deg,#1A237E,#3949AB);
      padding: 32px 36px 28px;
      display: flex; align-items: center; gap: 18px;
      position: relative; overflow: hidden;
    }
    .as-banner::before { content:''; position:absolute; top:-40px; right:-40px; width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,0.07); }
    .as-banner-icon { width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0;animation:asWig 3s ease-in-out infinite; }
    @keyframes asWig { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
    .as-banner h2 { font-family:'Baloo 2',cursive;font-size:1.5rem;font-weight:800;color:white;margin:0 0 4px; }
    .as-banner p { color:rgba(255,255,255,0.75);font-size:0.85rem;margin:0; }

    .as-body { padding:28px 36px 36px; }

    .as-error { background:#FFF1F2;border:1.5px solid #FECDD3;border-radius:12px;padding:11px 14px;margin-bottom:16px;color:#E11D48;font-weight:700;font-size:0.83rem;display:flex;align-items:center;gap:8px;animation:asShake 0.4s ease; }
    @keyframes asShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }

    .as-field { margin-bottom:16px; }
    .as-label { display:block;font-weight:800;font-size:0.75rem;color:#475569;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:7px; }
    .as-label span { color:#EF4444; }
    .as-input {
      width:100%;padding:12px 16px;border:2px solid #E2E8F0;border-radius:12px;
      font-family:'Quicksand',sans-serif;font-size:0.92rem;font-weight:600;color:#0F172A;
      background:#F8FAFC;outline:none;transition:all 0.2s;box-sizing:border-box;
    }
    .as-input:focus { border-color:#3949AB;background:white;box-shadow:0 0 0 4px rgba(57,73,171,0.1); }
    .as-input.err { border-color:#EF4444;background:#FFF1F2; }

    .as-secret-box {
      background:#F0F4FF;border:2px solid #C5CAE9;border-radius:14px;
      padding:16px;margin-bottom:16px;
    }
    .as-secret-label { display:flex;align-items:center;gap:8px;font-weight:800;font-size:0.8rem;color:#3949AB;margin-bottom:10px; }

    .as-btn {
      width:100%;padding:14px;border-radius:16px;border:none;
      background:linear-gradient(135deg,#1A237E,#3949AB);
      color:white;font-family:'Quicksand',sans-serif;font-size:1rem;font-weight:800;
      cursor:pointer;box-shadow:0 6px 20px rgba(26,35,126,0.4);
      transition:all 0.25s;position:relative;overflow:hidden;
    }
    .as-btn::after { content:'';position:absolute;inset:0;background:rgba(255,255,255,0.15);transform:translateX(-100%);transition:transform 0.4s; }
    .as-btn:hover::after { transform:translateX(100%); }
    .as-btn:hover { transform:translateY(-2px); }
    .as-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }
    .as-spinner { display:inline-block;width:15px;height:15px;border:3px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:asSpin 0.7s linear infinite;margin-right:8px;vertical-align:middle; }
    @keyframes asSpin { to{transform:rotate(360deg)} }

    .as-footer { text-align:center;margin-top:16px;color:#94A3B8;font-size:0.84rem; }
    .as-footer a { color:#3949AB;font-weight:800; }
  `;
  document.head.appendChild(style);
};

export default function AdminSignup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [secretCode,  setSecretCode]  = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  React.useEffect(() => { injectCSS(); }, []);

  const handleSubmit = async () => {
    setError('');

    if (!fullName.trim())          { setError('Please enter your full name.'); return; }
    if (!email.includes('@'))      { setError('Please enter a valid email.'); return; }
    if (password.length < 6)       { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm)       { setError('Passwords do not match.'); return; }
    if (secretCode !== ADMIN_SECRET){ setError('Invalid admin secret code.'); return; }

    setLoading(true);
    try {
      await signup({
        name: fullName,
        email,
        password,
        role: 'admin',
        adminSecret: secretCode,
      });

      // ✅ FIX: Navigate immediately — no setTimeout
      // setTimeout was being cancelled because PublicRoute
      // unmounts this component the moment isAuthenticated becomes true
      navigate('/admin-dashboard', { replace: true });

    } catch (err) {
      setError(err?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="as-root">
      <Link to="/signup" className="nl-back-btn" style={{ position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', zIndex: 10 }}>
        ← Back
      </Link>
      <div className="as-blob as-blob-1"/><div className="as-blob as-blob-2"/>

      <div className="as-card">
        <div className="as-banner">
          <img src="/logo.chidcare.png" alt="Trusted Care" style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'contain', background: 'rgba(255,255,255,0.15)', padding: '8px', boxSizing: 'border-box' }} />
          <div>
            <h2>Admin Registration</h2>
            <p>Restricted access — authorized personnel only</p>
          </div>
        </div>

        <div className="as-body">
          {error && <div className="as-error">⚠️ {error}</div>}

          <div className="as-field">
            <label className="as-label">Full Name <span>*</span></label>
            <input className={`as-input ${error && !fullName ? 'err' : ''}`}
              placeholder="Your full name" value={fullName}
              onChange={e => { setFullName(e.target.value); setError(''); }}/>
          </div>

          <div className="as-field">
            <label className="as-label">Email Address <span>*</span></label>
            <input className={`as-input ${error && !email.includes('@') ? 'err' : ''}`}
              type="email" placeholder="admin@childcare.com" value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <div className="as-field" style={{marginBottom:0}}>
              <label className="as-label">Password <span>*</span></label>
              <div style={{position:'relative'}}>
                <input className="as-input" type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 chars" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{paddingRight:40}}/>
                <button type="button"
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1rem',color:'#94A3B8'}}
                  onClick={() => setShowPw(v => !v)}>{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div className="as-field" style={{marginBottom:0}}>
              <label className="as-label">Confirm Password <span>*</span></label>
              <input className="as-input" type="password" placeholder="Re-enter"
                value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }}/>
            </div>
          </div>

          <div className="as-secret-box" style={{marginTop:16}}>
            <div className="as-secret-label">🔐 Admin Secret Code <span style={{color:'#EF4444'}}>*</span></div>
            <input className="as-input" type="password"
              placeholder="Enter the admin secret code"
              value={secretCode}
              onChange={e => { setSecretCode(e.target.value); setError(''); }}/>
            <p style={{color:'#94A3B8',fontSize:'0.76rem',marginTop:8,fontWeight:600}}>
              This code is provided by your organization. Contact your system administrator if you don't have it.
            </p>
          </div>

          <button className="as-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="as-spinner"/>Creating Admin Account...</> : '🛡️ Create Admin Account'}
          </button>

          <div className="as-footer">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
}