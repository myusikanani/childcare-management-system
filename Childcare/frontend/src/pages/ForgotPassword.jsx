// File Path: src/pages/ForgotPassword.jsx
// Description: Forgot Password flow - 3 steps: Enter email → OTP → New password

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const injectCSS = () => {
  if (document.getElementById('fp-styles')) return;
  const style = document.createElement('style');
  style.id = 'fp-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .fp-root {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%);
      font-family: 'Outfit', sans-serif;
      position: relative; overflow: hidden;
    }

    /* Floating shapes */
    .fp-shape {
      position: fixed; pointer-events: none;
      border-radius: 50%; opacity: 0.15;
      animation: fpFloat 10s ease-in-out infinite;
    }
    .fp-s1 { width:300px;height:300px;background:#fff;top:-100px;left:-80px;animation-delay:0s; }
    .fp-s2 { width:200px;height:200px;background:#fff;bottom:-60px;right:-40px;animation-delay:3s; }
    .fp-s3 { width:150px;height:150px;background:#fff;top:40%;right:5%;animation-delay:6s; }
    @keyframes fpFloat { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-20px) scale(1.05)} }

    /* Card */
    .fp-card {
      background: white; border-radius: 32px;
      width: 100%; max-width: 460px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.2);
      overflow: hidden; position: relative; z-index: 1;
      animation: fpPop 0.5s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes fpPop { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }

    /* Top strip */
    .fp-strip {
      height: 6px;
      background: linear-gradient(90deg, #667EEA, #764BA2, #F093FB);
    }

    /* Progress bar */
    .fp-progress {
      display: flex; gap: 0; margin: 0;
    }
    .fp-prog-step {
      flex: 1; height: 3px;
      background: #F0E6FF; transition: background 0.4s;
    }
    .fp-prog-step.done { background: linear-gradient(90deg, #667EEA, #764BA2); }

    /* Body */
    .fp-body { padding: 40px 40px 32px; }

    .fp-icon-wrap {
      width: 72px; height: 72px; border-radius: 22px;
      margin: 0 auto 24px;
      display: flex; align-items: center; justify-content: center;
      font-size: 2.2rem;
      animation: fpBounce 0.6s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes fpBounce { from{transform:scale(0)} to{transform:scale(1)} }

    .fp-step-label {
      text-align: center; font-size: 0.72rem; font-weight: 700;
      color: #764BA2; letter-spacing: 2px; text-transform: uppercase;
      margin-bottom: 8px;
    }
    .fp-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.7rem; font-weight: 900; color: #1A1A2E;
      text-align: center; margin-bottom: 8px; line-height: 1.2;
    }
    .fp-sub {
      text-align: center; color: #888; font-size: 0.88rem;
      line-height: 1.6; margin-bottom: 28px;
    }
    .fp-sub strong { color: #667EEA; }

    /* Field */
    .fp-field { margin-bottom: 18px; }
    .fp-label {
      display: block; font-size: 0.75rem; font-weight: 700;
      color: #555; text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .fp-input {
      width: 100%; padding: 14px 18px;
      border: 2px solid #EEE; border-radius: 14px;
      font-family: 'Outfit', sans-serif; font-size: 0.95rem;
      color: #1A1A2E; background: #FAFAFA; outline: none;
      transition: all 0.2s;
    }
    .fp-input:focus { border-color: #764BA2; background: white; box-shadow: 0 0 0 4px rgba(118,75,162,0.1); }
    .fp-input.error { border-color: #FF5252; background: #FFF8F8; }
    .fp-pw-wrap { position: relative; }
    .fp-pw-eye {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0;
    }

    /* Error */
    .fp-error {
      background: #FFF0F0; border: 1.5px solid #FFCDD2;
      border-radius: 12px; padding: 11px 16px;
      color: #E53935; font-weight: 600; font-size: 0.84rem;
      margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
      animation: fpShake 0.4s ease;
    }
    @keyframes fpShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

    /* OTP inputs */
    .fp-otp-row {
      display: flex; gap: 10px; justify-content: center;
      margin-bottom: 8px;
    }
    .fp-otp-input {
      width: 52px; height: 60px; border-radius: 14px;
      border: 2px solid #EEE; background: #FAFAFA;
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem; font-weight: 900; color: #1A1A2E;
      text-align: center; outline: none; transition: all 0.2s;
    }
    .fp-otp-input:focus { border-color: #764BA2; background: white; box-shadow: 0 0 0 4px rgba(118,75,162,0.1); }
    .fp-otp-input.filled { border-color: #764BA2; background: #F5EEFF; }

    .fp-resend {
      text-align: center; margin-bottom: 24px;
    }
    .fp-resend-btn {
      background: none; border: none; cursor: pointer;
      color: #764BA2; font-family: 'Outfit', sans-serif;
      font-size: 0.85rem; font-weight: 700; padding: 0;
    }
    .fp-resend-btn:disabled { color: #AAA; cursor: not-allowed; }
    .fp-resend-timer { font-size: 0.82rem; color: #AAA; }

    /* Strength bar */
    .fp-strength { margin-top: 8px; }
    .fp-strength-bar {
      height: 4px; background: #EEE; border-radius: 999px; overflow: hidden; margin-bottom: 4px;
    }
    .fp-strength-fill { height: 100%; border-radius: 999px; transition: all 0.3s; }
    .fp-strength-label { font-size: 0.75rem; font-weight: 700; }

    /* Button */
    .fp-btn {
      width: 100%; padding: 15px; border-radius: 14px; border: none;
      background: linear-gradient(135deg, #667EEA, #764BA2);
      color: white; font-family: 'Outfit', sans-serif;
      font-size: 0.98rem; font-weight: 800; cursor: pointer;
      box-shadow: 0 8px 24px rgba(118,75,162,0.35);
      transition: all 0.25s; margin-bottom: 14px;
    }
    .fp-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(118,75,162,0.45); }
    .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .fp-spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 3px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: fpSpin 0.7s linear infinite;
      margin-right: 8px; vertical-align: middle;
    }
    @keyframes fpSpin { to{transform:rotate(360deg)} }

    /* Bottom note */
    .fp-bottom { text-align: center; color: #AAA; font-size: 0.84rem; }
    .fp-bottom a { color: #764BA2; font-weight: 700; text-decoration: none; }

    /* Success */
    .fp-success {
      text-align: center; padding: 20px 0;
      animation: fpPop 0.5s cubic-bezier(.34,1.56,.64,1);
    }
    .fp-success-icon { font-size: 5rem; margin-bottom: 16px; display: block; }
    .fp-success-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem; font-weight: 900; color: #1A1A2E; margin-bottom: 8px;
    }
    .fp-success-sub { color: #888; font-size: 0.9rem; margin-bottom: 28px; }

    /* Step animation */
    .fp-step-enter { animation: fpSlide 0.35s ease; }
    @keyframes fpSlide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  `;
  document.head.appendChild(style);
};

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const STRENGTH_CONFIG = [
  { label:'',          color:'#EEE',    width:'0%'   },
  { label:'Very Weak', color:'#FF5252', width:'20%'  },
  { label:'Weak',      color:'#FF8C00', width:'40%'  },
  { label:'Fair',      color:'#FFB432', width:'60%'  },
  { label:'Strong',    color:'#43C6AC', width:'80%'  },
  { label:'Very Strong!',color:'#34D399',width:'100%'},
];

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(1); // 1=email, 2=otp, 3=newpw, 4=done
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState(['','','','','','']);
  const [newPw,   setNewPw]   = useState('');
  const [confPw,  setConfPw]  = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [timer,   setTimer]   = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  const FAKE_OTP = '123456'; // In real app, this comes from backend

  useEffect(() => { injectCSS(); }, []);

  useEffect(() => {
    if (step !== 2) return;
    setTimer(60); setCanResend(false);
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const handleEmailSubmit = async () => {
    setError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const found = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!found) {
      setError('No account found with this email address.'); setLoading(false); return;
    }

    setLoading(false);
    setStep(2);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (paste.length) {
      setOtp(paste.padEnd(6,'').split(''));
      otpRefs.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    setError('');
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (entered !== FAKE_OTP) {
      setError('Incorrect OTP. Try 123456 for demo.'); setLoading(false); return;
    }
    setLoading(false); setStep(3);
  };

  const handleNewPw = async () => {
    setError('');
    if (newPw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPw !== confPw)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Update password in localStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx   = users.findIndex(u => u.email?.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      users[idx].password = newPw;
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    setLoading(false); setStep(4);
    setTimeout(() => navigate('/login', { replace: true }), 3000);
  };

  const strength  = getStrength(newPw);
  const strengthC = STRENGTH_CONFIG[strength];

  const stepIcons = ['🔐','📱','🔑',''];
  const stepLabels = ['Step 1 of 3','Step 2 of 3','Step 3 of 3',''];
  const stepTitles = ['Forgot Password?','Check your phone','Create new password','Password Reset!'];
  const stepSubs   = [
    "Don't worry! Enter your registered email and we'll help you reset it.",
    `We sent a 6-digit OTP to ${email}. Enter it below to continue.`,
    'Almost done! Choose a strong new password for your account.',
    'Your password has been reset successfully. Redirecting to login...',
  ];
  const iconBgs = ['linear-gradient(135deg,#667EEA,#764BA2)','linear-gradient(135deg,#43C6AC,#0EA5E9)','linear-gradient(135deg,#FFB432,#FF6B6B)',''];

  return (
    <div className="fp-root">
      <div className="fp-shape fp-s1" />
      <div className="fp-shape fp-s2" />
      <div className="fp-shape fp-s3" />

      <div className="fp-card">
        <div className="fp-strip" />
        <div className="fp-progress">
          {[1,2,3].map(s => (
            <div key={s} className={`fp-prog-step ${step > s ? 'done' : step === s ? 'done' : ''}`} />
          ))}
        </div>

        <div className="fp-body">
          {step < 4 && (
            <>
              <div
                className="fp-icon-wrap"
                style={{ background: iconBgs[step-1] }}
              >{stepIcons[step-1]}</div>
              <div className="fp-step-label">{stepLabels[step-1]}</div>
              <div className="fp-title">{stepTitles[step-1]}</div>
              <div className="fp-sub" dangerouslySetInnerHTML={{__html: stepSubs[step-1].replace(email, `<strong>${email}</strong>`)}} />
            </>
          )}

          {error && <div className="fp-error">⚠️ {error}</div>}

          {/* STEP 1 — Email */}
          {step === 1 && (
            <div className="fp-step-enter">
              <div className="fp-field">
                <label className="fp-label">Email Address</label>
                <input
                  className={`fp-input ${error ? 'error' : ''}`}
                  type="email" placeholder="your@email.com"
                  value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                />
              </div>
              <button className="fp-btn" onClick={handleEmailSubmit} disabled={loading}>
                {loading ? <><span className="fp-spinner"/>Checking...</> : 'Send OTP →'}
              </button>
              <div className="fp-bottom">Remember it? <Link to="/login">Go back to Login</Link></div>
            </div>
          )}

          {/* STEP 2 — OTP */}
          {step === 2 && (
            <div className="fp-step-enter">
              <div className="fp-otp-row" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    className={`fp-otp-input ${digit ? 'filled' : ''}`}
                    type="text" inputMode="numeric"
                    maxLength={1} value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKey(e, i)}
                  />
                ))}
              </div>

              <div className="fp-resend">
                {canResend
                  ? <button className="fp-resend-btn" onClick={() => { setOtp(['','','','','','']); setStep(2); }}>Resend OTP</button>
                  : <span className="fp-resend-timer">Resend in {timer}s — (Demo OTP: 123456)</span>
                }
              </div>

              <button className="fp-btn" onClick={handleOtpSubmit} disabled={loading}>
                {loading ? <><span className="fp-spinner"/>Verifying...</> : 'Verify OTP →'}
              </button>
              <div className="fp-bottom"><button style={{background:'none',border:'none',cursor:'pointer',color:'#764BA2',fontWeight:700,fontSize:'0.84rem'}} onClick={() => setStep(1)}>← Change email</button></div>
            </div>
          )}

          {/* STEP 3 — New Password */}
          {step === 3 && (
            <div className="fp-step-enter">
              <div className="fp-field">
                <label className="fp-label">New Password</label>
                <div className="fp-pw-wrap">
                  <input
                    className={`fp-input ${error ? 'error' : ''}`}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); setError(''); }}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" className="fp-pw-eye" onClick={() => setShowPw(v => !v)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {newPw && (
                  <div className="fp-strength">
                    <div className="fp-strength-bar">
                      <div className="fp-strength-fill" style={{ width: strengthC.width, background: strengthC.color }} />
                    </div>
                    <span className="fp-strength-label" style={{ color: strengthC.color }}>{strengthC.label}</span>
                  </div>
                )}
              </div>
              <div className="fp-field">
                <label className="fp-label">Confirm Password</label>
                <input
                  className={`fp-input ${confPw && confPw !== newPw ? 'error' : ''}`}
                  type="password" placeholder="Repeat new password"
                  value={confPw} onChange={e => { setConfPw(e.target.value); setError(''); }}
                />
                {confPw && confPw === newPw && (
                  <div style={{ color:'#34D399', fontSize:'0.78rem', fontWeight:700, marginTop:4 }}>✅ Passwords match!</div>
                )}
              </div>
              <button className="fp-btn" onClick={handleNewPw} disabled={loading}>
                {loading ? <><span className="fp-spinner"/>Saving...</> : '🔐 Reset Password'}
              </button>
            </div>
          )}

          {/* STEP 4 — Success */}
          {step === 4 && (
            <div className="fp-success">
              <span className="fp-success-icon">🎉</span>
              <div className="fp-success-title">All Done!</div>
              <div className="fp-success-sub">Your password has been reset successfully.<br/>Redirecting to login in 3 seconds...</div>
              <button className="fp-btn" onClick={() => navigate('/login', { replace: true })}>
                Go to Login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}