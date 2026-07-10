import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const injectCSS = () => {
  if (document.getElementById('parent-signup-styles')) return;
  const style = document.createElement('style');
  style.id = 'parent-signup-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .ps-root {
      min-height:100vh; display:flex; align-items:center; justify-content:center;
      padding:24px;
      background:linear-gradient(135deg,#4FC3F7 0%,#43C6AC 100%);
      font-family:'Quicksand',sans-serif; position:relative; overflow:hidden;
    }
    .ps-blob { position:absolute; border-radius:50%; filter:blur(70px); opacity:0.3; pointer-events:none; }
    .ps-blob-1{width:400px;height:400px;background:#BAE6FD;top:-100px;left:-80px;animation:psDrift 12s ease-in-out infinite;}
    .ps-blob-2{width:300px;height:300px;background:#BBF7D0;bottom:-60px;right:-60px;animation:psDrift 10s ease-in-out infinite reverse;}
    @keyframes psDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-30px)}}

    .ps-card {
      background:white; border-radius:28px; overflow:hidden;
      width:100%; max-width:960px;
      box-shadow:0 32px 80px rgba(0,0,0,0.18);
      display:grid; grid-template-columns:360px 1fr;
      position:relative; z-index:1;
      animation:psIn 0.5s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes psIn{from{opacity:0;transform:scale(0.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}

    .ps-left {
      background:linear-gradient(160deg,#0EA5E9,#34D399);
      padding:48px 36px; display:flex; flex-direction:column; justify-content:center;
      position:relative; overflow:hidden;
    }
    .ps-left::before {
      content:''; position:absolute; top:-60px; right:-60px;
      width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.1);
    }
    .ps-left-emoji { font-size:3.5rem; margin-bottom:20px; animation:psWiggle 3s ease-in-out infinite; }
    @keyframes psWiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
    .ps-left h2 { font-family:'Baloo 2',cursive; font-size:1.8rem; font-weight:800; color:white; margin-bottom:12px; }
    .ps-left p { color:rgba(255,255,255,0.82); font-size:0.9rem; line-height:1.6; margin-bottom:28px; }
    .ps-feature { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
    .ps-feature-icon { width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0; }
    .ps-feature-text { color:rgba(255,255,255,0.9); font-size:0.85rem; font-weight:600; }
    .ps-left-footer { margin-top:auto; padding-top:28px; color:rgba(255,255,255,0.7); font-size:0.82rem; }
    .ps-left-footer a { color:white; font-weight:800; }

    .ps-right { padding:44px 40px; overflow-y:auto; }

    .ps-steps { display:flex; align-items:center; margin-bottom:32px; }
    .ps-step-dot {
      width:32px;height:32px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:0.8rem;font-weight:800;
      transition:all 0.3s;
    }
    .ps-step-dot.done{background:#34D399;color:white;}
    .ps-step-dot.active{background:#0EA5E9;color:white;box-shadow:0 0 0 4px rgba(14,165,233,0.2);}
    .ps-step-dot.pending{background:#F1F5F9;color:#94A3B8;}
    .ps-step-line{flex:1;height:2px;background:#E2E8F0;margin:0 8px;transition:background 0.3s;}
    .ps-step-line.done{background:#34D399;}
    .ps-step-label{font-size:0.72rem;font-weight:700;color:#94A3B8;margin-top:4px;text-align:center;}

    .ps-title { font-family:'Baloo 2',cursive; font-size:1.6rem; font-weight:800; color:#0F172A; margin-bottom:6px; }
    .ps-subtitle { color:#64748B; font-size:0.9rem; margin-bottom:28px; }

    .ps-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
    .ps-field { margin-bottom:16px; }
    .ps-label { display:block; font-weight:800; font-size:0.78rem; color:#475569; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:7px; }
    .ps-input, .ps-select {
      width:100%; padding:12px 16px; border:2px solid #E2E8F0; border-radius:12px;
      font-family:'Quicksand',sans-serif; font-size:0.92rem; font-weight:600; color:#0F172A;
      background:#F8FAFC; outline:none; transition:all 0.2s; box-sizing:border-box;
    }
    .ps-input:focus, .ps-select:focus { border-color:#0EA5E9; background:white; box-shadow:0 0 0 4px rgba(14,165,233,0.1); }
    .ps-input.error { border-color:#EF4444; }
    .ps-error { color:#EF4444; font-size:0.78rem; font-weight:700; margin-top:4px; }

    .ps-pw-wrap { position:relative; }
    .ps-pw-eye { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:1rem; color:#94A3B8; }

    .ps-error-banner {
      background:#FFF1F2; border:1.5px solid #FECDD3; border-radius:12px;
      padding:11px 16px; margin-bottom:16px; color:#E11D48;
      font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:8px;
    }

    .ps-row-btns { display:flex; gap:12px; margin-top:8px; }
    .ps-btn-back {
      padding:13px 24px; border-radius:999px; border:2px solid #E2E8F0;
      background:white; color:#64748B; font-family:'Quicksand',sans-serif;
      font-size:0.9rem; font-weight:700; cursor:pointer; transition:all 0.2s;
    }
    .ps-btn-back:hover { border-color:#0EA5E9; color:#0EA5E9; }
    .ps-btn {
      flex:1; padding:13px; border-radius:999px; border:none;
      background:linear-gradient(135deg,#0EA5E9,#34D399); color:white;
      font-family:'Quicksand',sans-serif; font-size:1rem; font-weight:800;
      cursor:pointer; box-shadow:0 6px 20px rgba(14,165,233,0.35);
      transition:all 0.25s; position:relative; overflow:hidden;
    }
    .ps-btn::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.2); transform:translateX(-100%); transition:transform 0.4s; }
    .ps-btn:hover::after { transform:translateX(100%); }
    .ps-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(14,165,233,0.45); }
    .ps-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

    .ps-spinner { display:inline-block; width:16px;height:16px; border:3px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:psSpin 0.7s linear infinite; margin-right:8px; vertical-align:middle; }
    @keyframes psSpin{to{transform:rotate(360deg)}}

    @media(max-width:700px){
      .ps-card{grid-template-columns:1fr;}
      .ps-left{display:none;}
      .ps-right{padding:32px 24px;}
    }
  `;
  document.head.appendChild(style);
};

const STEPS = ['Account', 'Personal', 'Done'];

export default function ParentSignup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPw,  setShowPw]  = useState(false);

  // Step 1
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');

  // Step 2
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [city,    setCity]    = useState('Ahmedabad');
  const [pincode, setPincode] = useState('');

  useEffect(() => { injectCSS(); }, []);

  const validateStep1 = () => {
    if (!name.trim())         { setError('Please enter your full name.'); return false; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return false; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return false; }
    if (password !== confirm)  { setError('Passwords do not match.'); return false; }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    setError('');
    if (!phone.trim())   { setError('Please enter your phone number.'); return; }
    if (!address.trim()) { setError('Please enter your address.'); return; }

    setLoading(true);

    try {
      const result = await signup({
        name,
        email,
        password,
        phone,
        address: `${address}, ${city}, ${pincode}`,
        role: 'user',
      });

      if (!result || !result.success) {
        setError(result?.message || 'Signup failed.');
        return;
      }

      navigate('/child-information', { replace: true });
    } catch (err) {
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cities = ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Mumbai','Delhi','Bangalore','Pune','Chennai'];

  return (
    <div className="ps-root">
      <Link to="/signup" className="nl-back-btn" style={{ position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', zIndex: 10 }}>
        ← Back
      </Link>
      <div className="ps-blob ps-blob-1" />
      <div className="ps-blob ps-blob-2" />

      <div className="ps-card">
        {/* Left — UNCHANGED */}
        <div className="ps-left">
          <div className="ps-left-emoji">👨‍👩‍👧</div>
          <h2>Enroll Your Child</h2>
          <p>Create your parent account and find the perfect caretaker for your little one.</p>
          {[
            ['🔍','Browse verified caretakers'],
            ['📅','Book sessions easily'],
            ['💬','Message caretakers directly'],
            ['💳','Secure online payments'],
            ['⭐','Rate and review sessions'],
          ].map(([icon,text]) => (
            <div className="ps-feature" key={text}>
              <div className="ps-feature-icon">{icon}</div>
              <div className="ps-feature-text">{text}</div>
            </div>
          ))}
          <div className="ps-left-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>

        {/* Right — UNCHANGED */}
        <div className="ps-right">
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height: '50px', width: 'auto' }} />
          </div>
          <div className="ps-steps">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ textAlign:'center' }}>
                  <div className={`ps-step-dot ${i+1 < step ? 'done' : i+1 === step ? 'active' : 'pending'}`}>
                    {i+1 < step ? '✓' : i+1}
                  </div>
                  <div className="ps-step-label">{s}</div>
                </div>
                {i < STEPS.length-1 && <div className={`ps-step-line ${i+1 < step ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="ps-error-banner">⚠️ {error}</div>}

          {/* STEP 1 — UNCHANGED */}
          {step === 1 && (
            <>
              <div className="ps-title">Create Your Account 🎉</div>
              <div className="ps-subtitle">Set up your login details</div>

              <div className="ps-field">
                <label className="ps-label">Full Name</label>
                <input className="ps-input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="ps-field">
                <label className="ps-label">Email Address</label>
                <input className="ps-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="ps-grid-2">
                <div className="ps-field" style={{ marginBottom:0 }}>
                  <label className="ps-label">Password</label>
                  <div className="ps-pw-wrap">
                    <input
                      className="ps-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ paddingRight:44 }}
                    />
                    <button type="button" className="ps-pw-eye" onClick={() => setShowPw(v => !v)}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="ps-field" style={{ marginBottom:0 }}>
                  <label className="ps-label">Confirm Password</label>
                  <input className="ps-input" type="password" placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop:24 }}>
                <button className="ps-btn" onClick={handleNext}>Continue →</button>
              </div>
            </>
          )}

          {/* STEP 2 — UNCHANGED */}
          {step === 2 && (
            <>
              <div className="ps-title">Personal Information 📋</div>
              <div className="ps-subtitle">Help caretakers reach you easily</div>

              <div className="ps-field">
                <label className="ps-label">📱 Phone</label>
                <input className="ps-input" placeholder="Your phone number" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="ps-field">
                <label className="ps-label">🏠 Address</label>
                <input className="ps-input" placeholder="Your home address" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="ps-grid-2">
                <div className="ps-field" style={{ marginBottom:0 }}>
                  <label className="ps-label">🏙️ City</label>
                  <select className="ps-select" value={city} onChange={e => setCity(e.target.value)}>
                    {cities.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="ps-field" style={{ marginBottom:0 }}>
                  <label className="ps-label">📮 Pincode</label>
                  <input className="ps-input" placeholder="e.g. 395004" value={pincode} onChange={e => setPincode(e.target.value)} />
                </div>
              </div>

              <div className="ps-row-btns" style={{ marginTop:24 }}>
                <button className="ps-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="ps-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="ps-spinner" />Creating...</> : '🎉 Create Account'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}