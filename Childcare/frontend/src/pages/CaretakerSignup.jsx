import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const injectCSS = () => {
  if (document.getElementById('caretaker-signup-styles')) return;
  const style = document.createElement('style');
  style.id = 'caretaker-signup-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;800&family=Quicksand:wght@400;500;600;700&display=swap');
    .cs-root{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#34D399 0%,#059669 50%,#0EA5E9 100%);font-family:'Quicksand',sans-serif;position:relative;overflow:hidden;}
    .cs-blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:0.3;pointer-events:none;}
    .cs-blob-1{width:380px;height:380px;background:#BBF7D0;top:-80px;left:-60px;animation:csDrift 11s ease-in-out infinite;}
    .cs-blob-2{width:300px;height:300px;background:#BAE6FD;bottom:-60px;right:-40px;animation:csDrift 9s ease-in-out infinite reverse;}
    @keyframes csDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,-25px)}}
    .cs-card{background:white;border-radius:28px;overflow:hidden;width:100%;max-width:960px;box-shadow:0 32px 80px rgba(0,0,0,0.18);display:grid;grid-template-columns:340px 1fr;position:relative;z-index:1;animation:csIn 0.5s cubic-bezier(.34,1.56,.64,1);}
    @keyframes csIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
    .cs-left{background:linear-gradient(160deg,#059669,#0EA5E9);padding:44px 32px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;}
    .cs-left::before{content:'';position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.1);}
    .cs-left-emoji{font-size:3.2rem;margin-bottom:18px;animation:csWig 3s ease-in-out infinite;}
    @keyframes csWig{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
    .cs-left h2{font-family:'Baloo 2',cursive;font-size:1.7rem;font-weight:800;color:white;margin-bottom:10px;}
    .cs-left p{color:rgba(255,255,255,0.82);font-size:0.88rem;line-height:1.6;margin-bottom:24px;}
    .cs-feat{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
    .cs-feat-icon{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;}
    .cs-feat-text{color:rgba(255,255,255,0.9);font-size:0.83rem;font-weight:600;}
    .cs-left-footer{margin-top:auto;padding-top:24px;color:rgba(255,255,255,0.7);font-size:0.82rem;}
    .cs-left-footer a{color:white;font-weight:800;}
    .cs-right{padding:40px;overflow-y:auto;}
    .cs-steps{display:flex;align-items:center;margin-bottom:28px;}
    .cs-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:800;transition:all 0.3s;}
    .cs-dot.done{background:#34D399;color:white;}
    .cs-dot.active{background:#059669;color:white;box-shadow:0 0 0 4px rgba(5,150,105,0.2);}
    .cs-dot.pending{background:#F1F5F9;color:#94A3B8;}
    .cs-line{flex:1;height:2px;background:#E2E8F0;margin:0 8px;transition:background 0.3s;}
    .cs-line.done{background:#34D399;}
    .cs-title{font-family:'Baloo 2',cursive;font-size:1.5rem;font-weight:800;color:#0F172A;margin-bottom:6px;}
    .cs-sub{color:#64748B;font-size:0.88rem;margin-bottom:24px;}
    .cs-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
    .cs-field{margin-bottom:14px;}
    .cs-label{display:block;font-weight:800;font-size:0.76rem;color:#475569;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;}
    .cs-input,.cs-select,.cs-textarea{width:100%;padding:11px 14px;border:2px solid #E2E8F0;border-radius:12px;font-family:'Quicksand',sans-serif;font-size:0.9rem;font-weight:600;color:#0F172A;background:#F8FAFC;outline:none;transition:all 0.2s;box-sizing:border-box;}
    .cs-input:focus,.cs-select:focus,.cs-textarea:focus{border-color:#059669;background:white;box-shadow:0 0 0 4px rgba(5,150,105,0.1);}
    .cs-textarea{resize:none;}
    .cs-pw-wrap{position:relative;}
    .cs-pw-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem;color:#94A3B8;}
    .cs-error-banner{background:#FFF1F2;border:1.5px solid #FECDD3;border-radius:12px;padding:10px 14px;margin-bottom:14px;color:#E11D48;font-weight:700;font-size:0.83rem;display:flex;align-items:center;gap:8px;}
    .cs-avatar-preview{width:80px;height:80px;border-radius:50%;border:3px dashed #E2E8F0;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#F8FAFC;transition:all 0.2s;}
    .cs-avatar-preview:hover{border-color:#059669;}
    .cs-row-btns{display:flex;gap:12px;margin-top:8px;}
    .cs-btn-back{padding:12px 22px;border-radius:999px;border:2px solid #E2E8F0;background:white;color:#64748B;font-family:'Quicksand',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
    .cs-btn-back:hover{border-color:#059669;color:#059669;}
    .cs-btn{flex:1;padding:12px;border-radius:999px;border:none;background:linear-gradient(135deg,#059669,#0EA5E9);color:white;font-family:'Quicksand',sans-serif;font-size:0.95rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(5,150,105,0.35);transition:all 0.25s;position:relative;overflow:hidden;}
    .cs-btn::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,0.2);transform:translateX(-100%);transition:transform 0.4s;}
    .cs-btn:hover::after{transform:translateX(100%);}
    .cs-btn:hover{transform:translateY(-2px);}
    .cs-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
    .cs-spinner{display:inline-block;width:15px;height:15px;border:3px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:csSpin 0.7s linear infinite;margin-right:8px;vertical-align:middle;}
    @keyframes csSpin{to{transform:rotate(360deg)}}
    /* Popup */
    .pp-overlay{position:fixed;inset:0;z-index:300;background:rgba(15,23,42,0.65);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;animation:ppFade 0.2s ease;}
    @keyframes ppFade{from{opacity:0}to{opacity:1}}
    .pp-modal{background:white;border-radius:28px;padding:36px;max-width:540px;width:100%;box-shadow:0 32px 80px rgba(0,0,0,0.25);animation:ppPop 0.4s cubic-bezier(.34,1.56,.64,1);max-height:90vh;overflow-y:auto;}
    @keyframes ppPop{from{opacity:0;transform:scale(0.85) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .pp-header{display:flex;align-items:center;gap:14px;margin-bottom:6px;}
    .pp-icon{font-size:2.2rem;animation:ppBounce 2s ease-in-out infinite;}
    @keyframes ppBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .pp-title{font-family:'Baloo 2',cursive;font-size:1.3rem;font-weight:800;color:#0F172A;}
    .pp-sub{color:#64748B;font-size:0.85rem;margin-bottom:20px;}
    .pp-progress{margin-bottom:20px;}
    .pp-prog-top{display:flex;justify-content:space-between;font-size:0.75rem;font-weight:700;color:#64748B;margin-bottom:6px;}
    .pp-prog-bar{height:6px;background:#E2E8F0;border-radius:999px;overflow:hidden;}
    .pp-prog-fill{height:100%;background:linear-gradient(90deg,#059669,#0EA5E9);border-radius:999px;transition:width 0.4s ease;}
    .pp-q-label{font-weight:800;font-size:0.85rem;color:#0F172A;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
    .pp-q-num{width:24px;height:24px;border-radius:50%;background:#059669;color:white;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;flex-shrink:0;}
    .pp-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
    .pp-option{border:2px solid #E2E8F0;border-radius:14px;padding:14px 12px;cursor:pointer;transition:all 0.2s cubic-bezier(.34,1.56,.64,1);text-align:center;background:#F8FAFC;}
    .pp-option:hover{border-color:#059669;background:#F0FDF4;transform:translateY(-2px);}
    .pp-option.selected{border-color:#059669;background:#F0FDF4;box-shadow:0 0 0 3px rgba(5,150,105,0.15);}
    .pp-opt-emoji{font-size:1.6rem;display:block;margin-bottom:6px;}
    .pp-opt-label{font-size:0.8rem;font-weight:700;color:#0F172A;}
    .pp-opt-desc{font-size:0.72rem;color:#64748B;margin-top:2px;}
    .pp-nav{display:flex;gap:12px;}
    .pp-btn-prev{padding:11px 22px;border-radius:999px;border:2px solid #E2E8F0;background:white;color:#64748B;font-family:'Quicksand',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;}
    .pp-btn-prev:hover{border-color:#059669;color:#059669;}
    .pp-btn-next{flex:1;padding:12px;border-radius:999px;border:none;background:linear-gradient(135deg,#059669,#0EA5E9);color:white;font-family:'Quicksand',sans-serif;font-size:0.95rem;font-weight:800;cursor:pointer;}
    .pp-btn-next:disabled{opacity:0.5;cursor:not-allowed;}
    /* Experience Q5 */
    .exp-choices{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;}
    .exp-choice{border:2px solid #E2E8F0;border-radius:20px;padding:22px 16px;cursor:pointer;transition:all 0.25s cubic-bezier(.34,1.56,.64,1);text-align:center;}
    .exp-choice:hover{transform:translateY(-4px);}
    .exp-choice.yes{border-color:#34D399;}.exp-choice.yes:hover{background:#F0FDF4;box-shadow:0 8px 24px rgba(52,211,153,0.25);}
    .exp-choice.no{border-color:#FB7185;}.exp-choice.no:hover{background:#FFF1F2;box-shadow:0 8px 24px rgba(251,113,133,0.25);}
    .exp-choice-emoji{font-size:2.5rem;display:block;margin-bottom:10px;}
    .exp-choice-title{font-family:'Baloo 2',cursive;font-size:1.05rem;font-weight:800;color:#0F172A;margin-bottom:4px;}
    .exp-choice-desc{font-size:0.78rem;color:#64748B;line-height:1.4;}
    .exp-note{font-size:0.78rem;color:#94A3B8;font-style:italic;text-align:center;}
    @media(max-width:700px){.cs-card{grid-template-columns:1fr;}.cs-left{display:none;}.cs-right{padding:28px 20px;}.cs-grid-2{grid-template-columns:1fr;}.pp-options,.exp-choices{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(style);
};

const POPUP_QUESTIONS = [
  {
    id: 'specialization', label: 'What is your main specialization?', emoji: '🎯',
    options: [
      { value:'infant',  emoji:'👶', label:'Infant Care',   desc:'Newborn to 1 year' },
      { value:'toddler', emoji:'🧒', label:'Toddler Care',  desc:'1–3 years' },
      { value:'school',  emoji:'📚', label:'School Age',    desc:'4–12 years' },
      { value:'special', emoji:'💛', label:'Special Needs', desc:'All ages' },
    ],
  },
  {
    id: 'availability', label: 'What is your availability?', emoji: '📅',
    options: [
      { value:'fulltime',  emoji:'🌞', label:'Full Time',  desc:'Mon–Fri 8hrs/day' },
      { value:'parttime',  emoji:'🌤', label:'Part Time',  desc:'Flexible hours' },
      { value:'weekends',  emoji:'🎉', label:'Weekends',   desc:'Sat & Sun only' },
      { value:'overnight', emoji:'🌙', label:'Overnight',  desc:'Night shifts' },
    ],
  },
  {
    id: 'workType', label: 'Where do you prefer to work?', emoji: '🏠',
    options: [
      { value:'inhome', emoji:'🏡', label:"Client's Home",   desc:'Travel to family' },
      { value:'center', emoji:'🏫', label:'Day Care Center', desc:'Center-based' },
      { value:'both',   emoji:'🔄', label:'Both',            desc:'Flexible' },
      { value:'remote', emoji:'💻', label:'Virtual Tutor',   desc:'Online sessions' },
    ],
  },
  {
    id: 'ageGroup', label: 'Which age group do you enjoy most?', emoji: '❤️',
    options: [
      { value:'infant',    emoji:'🍼', label:'Infants',   desc:'0–1 yr' },
      { value:'preschool', emoji:'🎨', label:'Preschool', desc:'2–4 yrs' },
      { value:'kids',      emoji:'⚽', label:'Kids',      desc:'5–10 yrs' },
      { value:'teens',     emoji:'🎮', label:'Teens',     desc:'11–17 yrs' },
    ],
  },
];

export default function CaretakerSignup() {
  const navigate = useNavigate();
  const { signup, updateUser } = useAuth();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPw,  setShowPw]  = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(0);
  const [answers,   setAnswers]   = useState({});

  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [phone,      setPhone]      = useState('');
  const [city,       setCity]       = useState('Ahmedabad');
  const [experience, setExperience] = useState('1-2 years');
  const [skills,     setSkills]     = useState('');
  const [bio,        setBio]        = useState('');
  const [avatar,     setAvatar]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => { injectCSS(); }, []);

  const validateStep1 = () => {
    if (!name.trim())         { setError('Please enter your full name.'); return false; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return false; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return false; }
    if (password !== confirm)  { setError('Passwords do not match.'); return false; }
    return true;
  };

  const handleNext = () => { setError(''); if (validateStep1()) setStep(2); };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (!avatar) { setError('Please upload a profile picture.'); return; }
    setLoading(true);
    try {
      await signup({
        name, email, password, phone, city, experience,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        bio, role: 'caretaker', avatar,
      });
      setLoading(false);
      setShowPopup(true);
      setPopupStep(0);
    } catch (err) {
      setError(err?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const selectAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const handlePopupNext = () => {
    const q = POPUP_QUESTIONS[popupStep];
    if (!answers[q.id]) return;
    if (popupStep < POPUP_QUESTIONS.length - 1) setPopupStep(p => p + 1);
    else setPopupStep(POPUP_QUESTIONS.length); // go to Q5
  };

  // ✅ Q5 handler — ONLY CHANGE: no-experience now passes state: { fromSignup: true }
  const handleExperience = (hasExp) => {
    // BACKEND NOTE: replace with PATCH /api/users/:id
    if (updateUser) {
      updateUser({
        specialization:    answers.specialization  || '',
        availability:      answers.availability    || '',
        workType:          answers.workType         || '',
        preferredAgeGroup: answers.ageGroup         || '',
        hasExperience:     hasExp,
        trainingCompleted: hasExp,
      });
    }
    setShowPopup(false);
    if (hasExp) {
      navigate('/caretaker-dashboard', { replace: true });
    } else {
      // ✅ THIS IS THE ONLY LINE THAT CHANGED — added:  state: { fromSignup: true }
      navigate('/training', { replace: true, state: { fromSignup: true } });
    }
  };

  const cities     = ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Mumbai','Delhi','Bangalore','Pune','Chennai'];
  const expOptions = ['Less than 1 year','1-2 years','3-5 years','5-8 years','8-10 years','10+ years'];
  const stepLabels = ['Account','Professional','Done'];
  const currentQ   = popupStep < POPUP_QUESTIONS.length ? POPUP_QUESTIONS[popupStep] : null;
  const pct        = Math.round((popupStep / (POPUP_QUESTIONS.length + 1)) * 100);

  return (
    <div className="cs-root">
      <Link to="/signup" className="nl-back-btn" style={{ position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', zIndex: 10 }}>
        ← Back
      </Link>
      <div className="cs-blob cs-blob-1"/><div className="cs-blob cs-blob-2"/>
      <div className="cs-card">
        <div className="cs-left">
          <div className="cs-left-emoji">👩‍🍼</div>
          <h2>Join as Caretaker</h2>
          <p>Start earning by providing quality childcare to families near you.</p>
          {[['💰','Earn ₹300–₹500 per hour'],['📅','Flexible work schedule'],['🎓','Free training provided'],['⭐','Build your reputation'],['🔒','Secure payments always']].map(([icon,text]) => (
            <div className="cs-feat" key={text}><div className="cs-feat-icon">{icon}</div><div className="cs-feat-text">{text}</div></div>
          ))}
          <div className="cs-left-footer">Already have an account? <Link to="/login">Login here</Link></div>
        </div>

        <div className="cs-right">
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height: '50px', width: 'auto' }} />
          </div>
          <div className="cs-steps">
            {stepLabels.map((s,i) => (
              <React.Fragment key={s}>
                <div style={{textAlign:'center'}}>
                  <div className={`cs-dot ${i+1<step?'done':i+1===step?'active':'pending'}`}>{i+1<step?'✓':i+1}</div>
                  <div style={{fontSize:'0.7rem',fontWeight:700,color:'#94A3B8',marginTop:3}}>{s}</div>
                </div>
                {i<stepLabels.length-1 && <div className={`cs-line ${i+1<step?'done':''}`}/>}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="cs-error-banner">⚠️ {error}</div>}

          {step === 1 && (
            <>
              <div className="cs-title">Create Your Account 🌟</div>
              <div className="cs-sub">Set up your caretaker profile</div>
              <div className="cs-field"><label className="cs-label">Full Name</label><input className="cs-input" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div className="cs-field"><label className="cs-label">Email Address</label><input className="cs-input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
              <div className="cs-grid-2">
                <div className="cs-field" style={{marginBottom:0}}>
                  <label className="cs-label">Password</label>
                  <div className="cs-pw-wrap">
                    <input className="cs-input" type={showPw?'text':'password'} placeholder="Min. 6 chars" value={password} onChange={e=>setPassword(e.target.value)} style={{paddingRight:42}}/>
                    <button type="button" className="cs-pw-eye" onClick={()=>setShowPw(v=>!v)}>{showPw?'🙈':'👁️'}</button>
                  </div>
                </div>
                <div className="cs-field" style={{marginBottom:0}}><label className="cs-label">Confirm Password</label><input className="cs-input" type="password" placeholder="Re-enter" value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>
              </div>
              <div style={{marginTop:22}}><button className="cs-btn" onClick={handleNext}>Continue →</button></div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="cs-title">Professional Details 💼</div>
              <div className="cs-sub">Tell families about your experience</div>
              
              {/* Profile Picture Upload */}
              <div className="cs-field">
                <label className="cs-label">Profile Picture *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    border: '3px dashed #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', background: '#F8FAFC', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2rem' }}>📷</span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} id="avatar-upload" style={{ display: 'none' }} />
                    <label htmlFor="avatar-upload" className="cs-btn" style={{ padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Upload Photo
                    </label>
                    <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '6px' }}>JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>
              </div>
              
              <div className="cs-grid-2">
                <div className="cs-field" style={{marginBottom:0}}><label className="cs-label">Phone Number</label><input className="cs-input" placeholder="+91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
                <div className="cs-field" style={{marginBottom:0}}><label className="cs-label">City</label><select className="cs-select" value={city} onChange={e=>setCity(e.target.value)}>{cities.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="cs-field" style={{marginTop:14}}><label className="cs-label">Years of Experience</label><select className="cs-select" value={experience} onChange={e=>setExperience(e.target.value)}>{expOptions.map(o=><option key={o}>{o}</option>)}</select></div>
              <div className="cs-field"><label className="cs-label">Skills (comma separated)</label><input className="cs-input" placeholder="e.g. Toddler Care, First Aid, Cooking" value={skills} onChange={e=>setSkills(e.target.value)}/></div>
              <div className="cs-field"><label className="cs-label">About You (optional)</label><textarea className="cs-textarea" rows={3} placeholder="Tell parents a bit about yourself..." value={bio} onChange={e=>setBio(e.target.value)}/></div>
              <div className="cs-row-btns">
                <button className="cs-btn-back" onClick={()=>{setStep(1);setError('');}}>← Back</button>
                <button className="cs-btn" onClick={handleSubmit} disabled={loading}>{loading?<><span className="cs-spinner"/>Creating...</>:'🎉 Create Account'}</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 5-Question Popup ── */}
      {showPopup && (
        <div className="pp-overlay">
          <div className="pp-modal">
            <div className="pp-header">
              <span className="pp-icon">{currentQ ? currentQ.emoji : '🤔'}</span>
              <div className="pp-title">Question {popupStep + 1} of 5</div>
            </div>
            <p className="pp-sub">Help us personalise your profile — takes 30 seconds!</p>

            <div className="pp-progress">
              <div className="pp-prog-top"><span>Profile Setup</span><span>{pct}% complete</span></div>
              <div className="pp-prog-bar"><div className="pp-prog-fill" style={{width:`${pct}%`}}/></div>
            </div>

            {/* Q1–Q4 */}
            {currentQ && (
              <>
                <div className="pp-q-label"><div className="pp-q-num">{popupStep+1}</div>{currentQ.label}</div>
                <div className="pp-options">
                  {currentQ.options.map(opt => (
                    <div key={opt.value} className={`pp-option ${answers[currentQ.id]===opt.value?'selected':''}`} onClick={()=>selectAnswer(currentQ.id, opt.value)}>
                      <span className="pp-opt-emoji">{opt.emoji}</span>
                      <div className="pp-opt-label">{opt.label}</div>
                      <div className="pp-opt-desc">{opt.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="pp-nav">
                  {popupStep > 0 && <button className="pp-btn-prev" onClick={()=>setPopupStep(p=>p-1)}>← Back</button>}
                  <button className="pp-btn-next" disabled={!answers[currentQ.id]} onClick={handlePopupNext}>
                    {popupStep < POPUP_QUESTIONS.length-1 ? 'Next →' : 'Almost done →'}
                  </button>
                </div>
              </>
            )}

            {/* Q5 — Experience */}
            {!currentQ && (
              <>
                <div className="pp-q-label"><div className="pp-q-num">5</div>Do you have prior childcare experience?</div>
                <div className="exp-choices">
                  <div className="exp-choice yes" onClick={()=>handleExperience(true)}>
                    <span className="exp-choice-emoji">✅</span>
                    <div className="exp-choice-title">Yes, I do!</div>
                    <div className="exp-choice-desc">I have hands-on experience — take me straight to the dashboard</div>
                  </div>
                  <div className="exp-choice no" onClick={()=>handleExperience(false)}>
                    <span className="exp-choice-emoji">🌱</span>
                    <div className="exp-choice-title">I'm New</div>
                    <div className="exp-choice-desc">Take me to training first, then dashboard after</div>
                  </div>
                </div>
                <div className="exp-note">💡 Training takes ~15 mins. You'll get a verified badge after!</div>
                <div style={{marginTop:14}}>
                  <button className="pp-btn-prev" onClick={()=>setPopupStep(POPUP_QUESTIONS.length-1)}>← Back</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}