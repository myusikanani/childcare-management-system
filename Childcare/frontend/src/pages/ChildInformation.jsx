import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { childrenAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('child-info-styles')) return;
  const style = document.createElement('style');
  style.id = 'child-info-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .ci-root {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f64f59 100%);
      font-family: 'Quicksand', sans-serif;
      position: relative; overflow: hidden;
    }

    /* Blobs */
    .ci-blob { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.3; pointer-events:none; }
    .ci-blob-1 { width:450px;height:450px;background:#BAE6FD;top:-120px;left:-100px;animation:ciBlobDrift 12s ease-in-out infinite; }
    .ci-blob-2 { width:350px;height:350px;background:#DDD6FE;bottom:-80px;right:-80px;animation:ciBlobDrift 10s ease-in-out infinite reverse; }
    .ci-blob-3 { width:250px;height:250px;background:#FEE2E2;top:40%;right:10%;animation:ciBlobDrift 14s ease-in-out infinite; }
    @keyframes ciBlobDrift {
      0%,100% { transform:translate(0,0) scale(1); }
      50%      { transform:translate(25px,-25px) scale(1.08); }
    }

    /* Floating emojis */
    .ci-emoji { position:absolute; font-size:2rem; opacity:0.15; pointer-events:none; animation:ciFloat 5s ease-in-out infinite; }
    .cie1{top:8%;left:5%;animation-delay:0s;}
    .cie2{top:12%;right:7%;animation-delay:1s;}
    .cie3{bottom:15%;left:6%;animation-delay:2s;}
    .cie4{bottom:10%;right:5%;animation-delay:1.5s;}
    .cie5{top:45%;left:3%;animation-delay:3s;font-size:1.5rem;}
    .cie6{top:60%;right:3%;animation-delay:0.5s;font-size:1.5rem;}
    @keyframes ciFloat {
      0%,100%{transform:translateY(0) rotate(-6deg);}
      50%{transform:translateY(-18px) rotate(6deg);}
    }

    /* Card */
    .ci-card {
      background: white; border-radius: 32px;
      width: 100%; max-width: 580px;
      overflow: hidden;
      box-shadow: 0 40px 100px rgba(0,0,0,0.25);
      position: relative; z-index: 1;
      animation: ciPop 0.5s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes ciPop {
      from { opacity:0; transform:scale(0.88) translateY(24px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }

    /* Top Banner */
    .ci-banner {
      background: linear-gradient(135deg, #667eea, #764ba2);
      padding: 28px 36px 24px;
      display: flex; align-items: center; gap: 18px;
      position: relative; overflow: hidden;
    }
    .ci-banner::before {
      content:''; position:absolute; top:-40px; right:-40px;
      width:150px;height:150px;border-radius:50%;
      background:rgba(255,255,255,0.08);
    }
    .ci-banner-icon {
      width: 64px; height: 64px; border-radius: 20px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.2rem; flex-shrink: 0;
      animation: ciBannerWig 3s ease-in-out infinite;
    }
    @keyframes ciBannerWig {
      0%,100%{transform:rotate(-5deg) scale(1);}
      50%{transform:rotate(5deg) scale(1.08);}
    }
    .ci-banner-text h2 {
      font-family: 'Baloo 2', cursive;
      font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 4px;
    }
    .ci-banner-text p { color: rgba(255,255,255,0.8); font-size: 0.85rem; }

    /* Steps bar */
    .ci-steps {
      display: flex; align-items: center;
      padding: 20px 36px 0;
    }
    .ci-step-item { text-align: center; }
    .ci-step-dot {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 800; margin: 0 auto 4px;
      transition: all 0.3s;
    }
    .ci-step-dot.done    { background: #34D399; color: white; }
    .ci-step-dot.active  { background: #667eea; color: white; box-shadow: 0 0 0 5px rgba(102,126,234,0.2); }
    .ci-step-dot.pending { background: #F1F5F9; color: #94A3B8; }
    .ci-step-label { font-size: 0.72rem; font-weight: 700; color: #94A3B8; }
    .ci-step-line { flex:1; height:2px; background:#E2E8F0; margin:0 10px; margin-bottom:20px; transition:background 0.3s; }
    .ci-step-line.done { background: #34D399; }

    /* Body */
    .ci-body { padding: 28px 36px 36px; }

    .ci-section-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.05rem; font-weight: 800; color: #0F172A;
      margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
      padding-bottom: 12px; border-bottom: 2px solid #F1F5F9;
    }

    /* Form fields */
    .ci-field { margin-bottom: 18px; }
    .ci-label {
      display: block; font-weight: 800; font-size: 0.78rem;
      color: #475569; text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .ci-label span { color: #EF4444; margin-left: 2px; }

    .ci-input, .ci-select, .ci-textarea {
      width: 100%; padding: 13px 16px;
      border: 2px solid #E2E8F0; border-radius: 14px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem; font-weight: 600; color: #0F172A;
      background: #F8FAFC; outline: none; transition: all 0.2s;
      box-sizing: border-box;
    }
    .ci-input:focus, .ci-select:focus, .ci-textarea:focus {
      border-color: #667eea; background: white;
      box-shadow: 0 0 0 4px rgba(102,126,234,0.12);
    }
    .ci-input.error { border-color: #EF4444; background: #FFF1F2; }
    .ci-textarea { resize: none; }

    .ci-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* Allergy tags */
    .ci-allergy-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .ci-allergy-tag {
      padding: 5px 14px; border-radius: 999px;
      border: 2px solid #E2E8F0; background: #F8FAFC;
      font-size: 0.8rem; font-weight: 700; color: #64748B;
      cursor: pointer; transition: all 0.2s;
    }
    .ci-allergy-tag:hover { border-color: #F59E0B; color: #92400E; }
    .ci-allergy-tag.selected {
      background: #FEF3C7; color: #92400E;
      border-color: #F59E0B;
    }

    /* Error banner */
    .ci-error {
      background: #FFF1F2; border: 1.5px solid #FECDD3; border-radius: 12px;
      padding: 12px 16px; margin-bottom: 18px;
      color: #E11D48; font-weight: 700; font-size: 0.85rem;
      display: flex; align-items: center; gap: 8px;
      animation: ciShake 0.4s ease;
    }
    @keyframes ciShake {
      0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)}
    }

    /* Submit button */
    .ci-btn {
      width: 100%; padding: 15px; border-radius: 16px; border: none;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; font-family: 'Quicksand', sans-serif;
      font-size: 1.05rem; font-weight: 800; cursor: pointer;
      box-shadow: 0 6px 20px rgba(102,126,234,0.4);
      transition: all 0.25s; position: relative; overflow: hidden;
    }
    .ci-btn::after {
      content:''; position:absolute; inset:0;
      background: rgba(255,255,255,0.2);
      transform: translateX(-100%); transition: transform 0.4s;
    }
    .ci-btn:hover::after { transform: translateX(100%); }
    .ci-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(102,126,234,0.5); }
    .ci-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .ci-skip {
      display: block; text-align: center; margin-top: 14px;
      color: #94A3B8; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: color 0.2s;
    }
    .ci-skip:hover { color: #667eea; }

    .ci-spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 3px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: ciSpin 0.7s linear infinite;
      margin-right: 8px; vertical-align: middle;
    }
    @keyframes ciSpin { to { transform: rotate(360deg); } }

    /* Success animation */
    .ci-success {
      text-align: center; padding: 40px 20px;
      animation: ciPop 0.5s cubic-bezier(.34,1.56,.64,1);
    }
    .ci-success-icon { font-size: 5rem; margin-bottom: 16px; animation: ciSuccessBounce 1s ease infinite; }
    @keyframes ciSuccessBounce {
      0%,100%{transform:translateY(0) scale(1);}
      50%{transform:translateY(-14px) scale(1.1);}
    }
    .ci-success h2 { font-family:'Baloo 2',cursive; font-size:1.8rem; font-weight:800; color:#0F172A; margin-bottom:8px; }
    .ci-success p { color:#64748B; font-size:0.95rem; margin-bottom:28px; }
    .ci-success-btn {
      padding: 14px 40px; border-radius: 999px; border: none;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; font-family: 'Quicksand', sans-serif;
      font-size: 1rem; font-weight: 800; cursor: pointer;
      box-shadow: 0 6px 20px rgba(102,126,234,0.4);
      transition: all 0.25s;
    }
    .ci-success-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(102,126,234,0.5); }

    @media (max-width: 600px) {
      .ci-body { padding: 20px 20px 28px; }
      .ci-banner { padding: 22px 20px; }
      .ci-steps { padding: 16px 20px 0; }
      .ci-grid-2 { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
};

const AGE_OPTIONS = [
  'Under 1 year (Infant)',
  '1-3 years (Toddler)',
  '3-5 years (Preschool)',
  '5-8 years (Early School)',
  '8-12 years (School Age)',
  '12+ years (Teen)',
];

const ALLERGY_OPTIONS = ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Seafood', 'Soy', 'None'];

export default function ChildInformation() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [childName, setChildName] = useState('');
  const [age, setAge]             = useState('');
  const [gender, setGender]       = useState('');
  const [allergies, setAllergies] = useState([]);
  const [notes, setNotes]         = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    injectCSS();
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  const toggleAllergy = (a) => {
    if (a === 'None') { setAllergies(['None']); return; }
    setAllergies(prev => {
      const without = prev.filter(x => x !== 'None');
      return without.includes(a) ? without.filter(x => x !== a) : [...without, a];
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (!childName.trim()) { setError("Please enter your child's name."); return; }
    if (!age)              { setError("Please select your child's age group."); return; }
    if (!gender)           { setError("Please select your child's gender."); return; }

    setLoading(true);
    
    try {
      // Save to MongoDB first
      const result = await childrenAPI.add({
        name: childName.trim(),
        age: age,
        gender: gender,
        allergies: allergies.length ? allergies.join(', ') : 'None',
        notes: notes.trim(),
      });
      
      if (result.success) {
        // Also save to localStorage as backup
        const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
        const newChild = {
          id:        result.child?._id || Date.now().toString(),
          parentId:  user?.email,
          childName: childName.trim(),
          age,
          gender,
          allergies: allergies.length ? allergies : ['None'],
          notes:     notes.trim(),
          emoji:     gender === 'Female' ? '👧' : gender === 'Male' ? '👦' : '🧒',
          createdAt: new Date().toISOString(),
          migrated:  true, // Mark as migrated to MongoDB
        };
        allChildren.push(newChild);
        localStorage.setItem('childcare_children', JSON.stringify(allChildren));

        // Update user to mark setup complete
        if (updateUser) {
          updateUser({
            setupComplete:  true,
            childrenCount:  allChildren.filter(c => c.parentId === user?.email).length,
          });
        }

        setLoading(false);
        setSuccess(true);
      } else {
        throw new Error(result.message || 'Failed to save child');
      }
    } catch (error) {
      console.error('Error saving child:', error);
      
      // Fallback to localStorage if MongoDB fails
      const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
      const newChild = {
        id:        Date.now().toString(),
        parentId:  user?.email,
        childName: childName.trim(),
        age,
        gender,
        allergies: allergies.length ? allergies : ['None'],
        notes:     notes.trim(),
        emoji:     gender === 'Female' ? '👧' : gender === 'Male' ? '👦' : '🧒',
        createdAt: new Date().toISOString(),
      };
      allChildren.push(newChild);
      localStorage.setItem('childcare_children', JSON.stringify(allChildren));

      if (updateUser) {
        updateUser({
          setupComplete:  true,
          childrenCount:  allChildren.filter(c => c.parentId === user?.email).length,
        });
      }

      setLoading(false);
      setSuccess(true);
    }
  };

  const goToDashboard = () => navigate('/parent-dashboard', { replace: true });

  const handleSkip = () => {
    if (updateUser) updateUser({ setupComplete: true });
    navigate('/parent-dashboard', { replace: true });
  };

  return (
    <div className="ci-root">
      {/* Blobs */}
      <div className="ci-blob ci-blob-1" />
      <div className="ci-blob ci-blob-2" />
      <div className="ci-blob ci-blob-3" />

      {/* Floating emojis */}
      <div className="ci-emoji cie1">👶</div>
      <div className="ci-emoji cie2">🌟</div>
      <div className="ci-emoji cie3">🎀</div>
      <div className="ci-emoji cie4">🧸</div>
      <div className="ci-emoji cie5">🌈</div>
      <div className="ci-emoji cie6">🍭</div>

      <div className="ci-card">

        {/* ── Success State ── */}
        {success ? (
          <div className="ci-success">
            <div className="ci-success-icon">🎉</div>
            <h2>All Set, {user?.name?.split(' ')[0] || 'Parent'}!</h2>
            <p>
              <strong>{childName}</strong>'s profile has been created successfully.
              You can now browse caretakers and make your first booking!
            </p>
            <button className="ci-success-btn" onClick={goToDashboard}>
              Go to Dashboard →
            </button>
          </div>
        ) : (
          <>
            {/* Banner */}
            <div className="ci-banner">
              <div className="ci-banner-icon">👶</div>
              <div className="ci-banner-text">
                <h2>Child Information</h2>
                <p>Tell us about your child so we can provide the best care</p>
              </div>
            </div>

            {/* Steps */}
            <div className="ci-steps">
              <div className="ci-step-item">
                <div className="ci-step-dot done">✓</div>
                <div className="ci-step-label">Account</div>
              </div>
              <div className="ci-step-line done" />
              <div className="ci-step-item">
                <div className="ci-step-dot active">2</div>
                <div className="ci-step-label" style={{ color: '#667eea' }}>Child Info</div>
              </div>
              <div className="ci-step-line" />
              <div className="ci-step-item">
                <div className="ci-step-dot pending">3</div>
                <div className="ci-step-label">Done</div>
              </div>
            </div>

            {/* Form */}
            <div className="ci-body">
              {error && <div className="ci-error">⚠️ {error}</div>}

              {/* Child Name */}
              <div className="ci-field">
                <label className="ci-label">Child's Name <span>*</span></label>
                <input
                  className={`ci-input ${error && !childName ? 'error' : ''}`}
                  placeholder="Enter child's name"
                  value={childName}
                  onChange={e => { setChildName(e.target.value); setError(''); }}
                />
              </div>

              {/* Age & Gender */}
              <div className="ci-grid-2">
                <div className="ci-field" style={{ marginBottom: 0 }}>
                  <label className="ci-label">Age Group <span>*</span></label>
                  <select
                    className={`ci-select ${error && !age ? 'error' : ''}`}
                    value={age}
                    onChange={e => { setAge(e.target.value); setError(''); }}
                  >
                    <option value="">Select age</option>
                    {AGE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="ci-field" style={{ marginBottom: 0 }}>
                  <label className="ci-label">Gender <span>*</span></label>
                  <select
                    className={`ci-select ${error && !gender ? 'error' : ''}`}
                    value={gender}
                    onChange={e => { setGender(e.target.value); setError(''); }}
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Allergies */}
              <div className="ci-field" style={{ marginTop: 18 }}>
                <label className="ci-label">Allergies / Dietary Restrictions</label>
                <div className="ci-allergy-row">
                  {ALLERGY_OPTIONS.map(a => (
                    <div
                      key={a}
                      className={`ci-allergy-tag ${allergies.includes(a) ? 'selected' : ''}`}
                      onClick={() => toggleAllergy(a)}
                    >
                      {a === 'None' ? '✅ None' : a}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Notes */}
              <div className="ci-field">
                <label className="ci-label">
                  Special Notes{' '}
                  <span style={{ color: '#94A3B8', fontWeight: 500, textTransform: 'none', fontSize: '0.75rem' }}>
                    (Optional)
                  </span>
                </label>
                <textarea
                  className="ci-textarea"
                  rows={3}
                  placeholder="Any medical conditions, special routines, emergency info, or care requirements..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button className="ci-btn" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="ci-spinner" />Saving...</>
                  : '🎉 Complete Setup & Go to Dashboard'
                }
              </button>

              <span className="ci-skip" onClick={handleSkip}>
                Skip for now → Go to Dashboard
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}