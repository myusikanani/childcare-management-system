import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';


const injectCSS = () => {
  if (document.getElementById('nannylist-styles')) return;
  const style = document.createElement('style');
  style.id = 'nannylist-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .nl-root {
      font-family: 'Quicksand', sans-serif;
      background: #F0F9FF;
      min-height: 100vh;
      color: #0F172A;
    }

    .nl-hero {
      background: linear-gradient(135deg, #0EA5E9 0%, #34D399 100%);
      padding: 80px 48px 60px;
      position: relative;
      overflow: hidden;
      text-align: center;
    }
    .nl-navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 32px;
      background: linear-gradient(135deg, #0EA5E9 0%, #34D399 100%);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nl-navbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .nl-navbar-brand {
      font-family: 'Baloo 2', cursive;
      font-size: 1.15rem;
      font-weight: 800;
      color: #34D399;
    }
    .nl-back-btn {
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 8px 20px;
      border-radius: 50px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .nl-back-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-1px);
    }
    .nl-hero::before {
      content: '';
      position: absolute; top: -80px; left: -80px;
      width: 300px; height: 300px; border-radius: 50%;
      background: rgba(255,255,255,0.08);
      animation: blobDrift 10s ease-in-out infinite;
    }
    .nl-hero::after {
      content: '';
      position: absolute; bottom: -60px; right: -60px;
      width: 240px; height: 240px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
      animation: blobDrift 14s ease-in-out infinite reverse;
    }
    @keyframes blobDrift {
      0%,100% { transform: translate(0,0) scale(1); }
      50%      { transform: translate(30px,-30px) scale(1.1); }
    }
    .nl-hero-tag {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: white; font-weight: 700; font-size: 0.82rem;
      padding: 5px 16px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 16px;
      position: relative; z-index: 1;
    }
    .nl-hero h1 {
      font-family: 'Baloo 2', cursive;
      font-size: 2.8rem; font-weight: 800; color: white;
      margin-bottom: 12px;
      position: relative; z-index: 1;
      animation: fadeDown 0.6s ease;
    }
    @keyframes fadeDown {
      from { opacity:0; transform:translateY(-20px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .nl-hero p {
      color: rgba(255,255,255,0.85); font-size: 1.05rem;
      position: relative; z-index: 1;
      animation: fadeDown 0.7s ease 0.1s both;
    }
    .nl-hero-emojis {
      position: absolute; top: 20px; left: 0; right: 0;
      font-size: 1.8rem; letter-spacing: 40px;
      opacity: 0.15; pointer-events: none;
      animation: floatRow 6s ease-in-out infinite;
    }
    @keyframes floatRow {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }

    .nl-controls {
      background: white;
      padding: 24px 48px;
      display: flex; flex-wrap: wrap;
      gap: 14px; align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      position: sticky; top: 0; z-index: 50;
    }
    .nl-search-wrap {
      flex: 1; min-width: 220px;
      position: relative;
    }
    .nl-search-icon {
      position: absolute; left: 14px; top: 50%;
      transform: translateY(-50%);
      font-size: 1rem; pointer-events: none;
    }
    .nl-search {
      width: 100%;
      padding: 11px 16px 11px 40px;
      border: 2px solid #E0F2FE;
      border-radius: 14px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem; font-weight: 600;
      color: #0F172A;
      background: #F0F9FF;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    .nl-search:focus {
      border-color: #38BDF8;
      background: white;
      box-shadow: 0 0 0 4px rgba(56,189,248,0.12);
    }
    .nl-search::placeholder { color: #94A3B8; font-weight: 500; }

    .nl-filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .nl-pill {
      padding: 9px 18px; border-radius: 999px;
      border: 2px solid #E0F2FE;
      background: white; color: #64748B;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.85rem; font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nl-pill:hover { border-color: #38BDF8; color: #0EA5E9; }
    .nl-pill.active {
      background: linear-gradient(135deg, #38BDF8, #34D399);
      color: white; border-color: transparent;
      box-shadow: 0 4px 12px rgba(56,189,248,0.35);
    }

    .nl-select {
      padding: 10px 16px; border-radius: 14px;
      border: 2px solid #E0F2FE;
      background: #F0F9FF; color: #0F172A;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.88rem; font-weight: 600;
      outline: none; cursor: pointer;
      transition: all 0.2s;
    }
    .nl-select:focus { border-color: #38BDF8; background: white; }

    .nl-results-bar {
      padding: 20px 48px 0;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nl-results-count {
      font-size: 0.9rem; color: #64748B; font-weight: 600;
    }
    .nl-results-count strong { color: #0EA5E9; }
    .nl-view-toggle { display: flex; gap: 8px; }
    .nl-view-btn {
      width: 36px; height: 36px; border-radius: 10px;
      border: 2px solid #E0F2FE; background: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1rem;
      transition: all 0.2s;
    }
    .nl-view-btn.active { background: #0EA5E9; border-color: #0EA5E9; filter: brightness(1) invert(0); }

    .nl-grid-wrap { padding: 24px 48px 60px; }
    .nl-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    .nl-grid.list-view { grid-template-columns: 1fr; }

    .nc {
      background: white; border-radius: 24px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.3s, box-shadow 0.3s;
      animation: cardPop 0.4s ease both;
      cursor: pointer;
    }
    .nc:hover { transform: translateY(-8px); box-shadow: 0 20px 48px rgba(0,0,0,0.12); }
    @keyframes cardPop {
      from { opacity:0; transform:translateY(20px) scale(0.97); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }

    .nc-banner {
      height: 110px; position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .nc-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: white; display: flex; align-items: center; justify-content: center;
      font-size: 2.6rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      position: absolute; bottom: -30px;
      border: 4px solid white;
      transition: transform 0.3s;
      overflow: hidden;
    }
    .nc:hover .nc-avatar { transform: scale(1.1); }
    .nc-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .nc-avatar.has-image {
      border: 4px solid white;
    }

    .nc-verified {
      position: absolute; top: 12px; right: 12px;
      background: rgba(255,255,255,0.9); backdrop-filter: blur(6px);
      padding: 4px 10px; border-radius: 999px;
      font-size: 0.72rem; font-weight: 700; color: #059669;
      display: flex; align-items: center; gap: 4px;
    }
    .nc-available {
      position: absolute; top: 12px; left: 12px;
      padding: 4px 10px; border-radius: 999px;
      font-size: 0.72rem; font-weight: 700;
    }
    .nc-available.yes { background: rgba(52,211,153,0.2); color: #059669; }
    .nc-available.no  { background: rgba(251,113,133,0.2); color: #E11D48; }

    .nc-body { padding: 44px 22px 22px; text-align: center; }
    .nc-name {
      font-family: 'Baloo 2', cursive;
      font-size: 1.2rem; font-weight: 800; color: #0F172A; margin-bottom: 4px;
    }
    .nc-role { font-size: 0.82rem; color: #0EA5E9; font-weight: 700; margin-bottom: 10px; }

    .nc-stars { color: #F59E0B; font-size: 0.9rem; }
    .nc-rating-count { font-size: 0.78rem; color: #94A3B8; font-weight: 500; margin-left: 4px; }

    .nc-tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 12px 0; }
    .nc-tag {
      padding: 3px 10px; border-radius: 999px;
      font-size: 0.72rem; font-weight: 700;
      background: #F0F9FF; color: #0EA5E9;
    }

    .nc-info-row {
      display: flex; justify-content: space-between;
      padding: 12px 0;
      border-top: 1px solid #F1F5F9;
      margin-top: 8px;
    }
    .nc-info-item { text-align: center; }
    .nc-info-val {
      font-family: 'Baloo 2', cursive;
      font-size: 1rem; font-weight: 700; color: #0F172A;
    }
    .nc-info-lbl { font-size: 0.7rem; color: #94A3B8; font-weight: 600; }

    .nc-btn {
      width: 100%; padding: 12px;
      background: linear-gradient(135deg, #38BDF8, #34D399);
      color: white; border: none; border-radius: 14px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem; font-weight: 800;
      cursor: pointer; margin-top: 16px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative; overflow: hidden;
    }
    .nc-btn::after {
      content:''; position:absolute; inset:0;
      background: rgba(255,255,255,0.2);
      transform: translateX(-100%);
      transition: transform 0.4s;
    }
    .nc-btn:hover::after { transform: translateX(100%); }
    .nc-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 25px rgba(56,189,248,0.5); }
    .nc-btn:active { transform: translateY(-1px) scale(0.98); }

    .nl-grid.list-view .nc {
      display: grid;
      grid-template-columns: 140px 1fr auto;
      border-radius: 20px;
    }
    .nl-grid.list-view .nc-banner {
      height: 100%; min-height: 120px; border-radius: 20px 0 0 20px;
    }
    .nl-grid.list-view .nc-avatar { position: static; bottom: auto; }
    .nl-grid.list-view .nc-body { text-align: left; padding: 20px; }
    .nl-grid.list-view .nc-tags { justify-content: flex-start; }
    .nl-grid.list-view .nc-btn { width: auto; padding: 12px 28px; align-self: center; margin: 20px 20px 20px 0; }

    .nl-empty {
      text-align: center; padding: 80px 24px; grid-column: 1/-1;
    }
    .nl-empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .nl-empty h3 { font-family:'Baloo 2',cursive; font-size:1.5rem; color:#0F172A; margin-bottom:8px; }
    .nl-empty p { color:#64748B; font-size:0.95rem; }

    .nl-loading {
      text-align: center; padding: 80px 24px; grid-column: 1/-1;
    }
    .nl-loading-icon { font-size: 3rem; margin-bottom: 16px; animation: bounce 1s ease-in-out infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    .nl-loading p { color:#64748B; font-size:0.95rem; font-weight: 600; }

    .nl-modal-bg {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(15,23,42,0.55);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .nl-modal {
      background: white; border-radius: 28px;
      width: 100%; max-width: 540px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,0.25);
      animation: popUp 0.35s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes popUp {
      from { opacity:0; transform:scale(0.9) translateY(20px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    .nm-banner {
      height: 140px;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .nm-close {
      position: absolute; top: 14px; right: 14px;
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,0.3); border: none;
      font-size: 1.1rem; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .nm-close:hover { background: rgba(255,255,255,0.5); }
    .nm-avatar-lg {
      width: 90px; height: 90px; border-radius: 50%;
      background: white; display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border: 4px solid white;
      position: absolute; bottom: -40px;
      overflow: hidden;
    }
    .nm-avatar-lg.has-image {
      border: 4px solid white;
    }
    .nm-avatar-lg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .nm-body { padding: 52px 32px 32px; }
    .nm-name { font-family:'Baloo 2',cursive; font-size:1.6rem; font-weight:800; text-align:center; }
    .nm-role { color:#0EA5E9; font-weight:700; font-size:0.9rem; text-align:center; margin-bottom:16px; }
    .nm-stars { text-align:center; color:#F59E0B; font-size:1rem; margin-bottom:20px; }
    .nm-tags { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:24px; }
    .nm-tag {
      padding: 5px 14px; border-radius:999px;
      background:#F0F9FF; color:#0EA5E9;
      font-size:0.8rem; font-weight:700;
    }
    .nm-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
    .nm-stat {
      background:#F8FAFC; border-radius:14px; padding:14px; text-align:center;
    }
    .nm-stat-val { font-family:'Baloo 2',cursive; font-size:1.3rem; font-weight:800; color:#0F172A; }
    .nm-stat-lbl { font-size:0.72rem; color:#94A3B8; font-weight:600; margin-top:2px; }
    .nm-about { font-size:0.88rem; color:#64748B; line-height:1.7; margin-bottom:24px; }
    .nm-book-btn {
      width:100%; padding:14px;
      background:linear-gradient(135deg,#38BDF8,#34D399);
      color:white; border:none; border-radius:16px;
      font-family:'Quicksand',sans-serif; font-size:1.05rem; font-weight:800;
      cursor:pointer;
      transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .nm-book-btn:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 12px 30px rgba(56,189,248,0.5); }
    .nm-book-btn:active { transform:translateY(-1px) scale(0.98); }

    @media (max-width: 768px) {
      .nl-hero { padding: 60px 24px 40px; }
      .nl-hero h1 { font-size:2rem; }
      .nl-controls { padding: 16px 24px; }
      .nl-grid-wrap { padding: 16px 24px 48px; }
      .nl-results-bar { padding: 16px 24px 0; }
      .nl-grid.list-view .nc { grid-template-columns:1fr; }
      .nl-grid.list-view .nc-banner { height:100px; border-radius:20px 20px 0 0; }
      .nl-grid.list-view .nc-btn { margin: 0 20px 20px; width:calc(100% - 40px); }
    }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────
   Helpers to map backend data to UI shape
───────────────────────────────────────────── */
const BG_COLORS = [
  'linear-gradient(135deg,#BAE6FD,#7DD3FC)',
  'linear-gradient(135deg,#BBF7D0,#6EE7B7)',
  'linear-gradient(135deg,#FEE2E2,#FCA5A5)',
  'linear-gradient(135deg,#EDE9FE,#C4B5FD)',
  'linear-gradient(135deg,#FEF3C7,#FDE68A)',
  'linear-gradient(135deg,#CFFAFE,#A5F3FC)',
  'linear-gradient(135deg,#FCE7F3,#F9A8D4)',
  'linear-gradient(135deg,#ECFDF5,#A7F3D0)',
];
const EMOJIS = ['👩','👨','👩‍🦱','👩‍🦳','🧑','👩‍🏫','👩‍🍼','🧑‍🎨'];

const mapCaretaker = (c, index) => ({
  id:        c._id,
  emoji:     EMOJIS[index % EMOJIS.length],
  avatar:    c.avatar ? (c.avatar.startsWith('http') ? c.avatar : `http://localhost:5000${c.avatar}`) : null,
  name:      c.name,
  role:      c.specializations?.[0] || 'Caretaker',
  stars:     Math.round(c.rating) || 5,
  reviews:   c.totalReviews || 0,
  exp:       c.experience ? `${c.experience} years` : 'New',
  rate:      `₹${c.hourlyRate || 0}/hr`,
  rateNum:   c.hourlyRate || 0,
  location:  c.address || 'Available',
  tags:      c.specializations?.length ? c.specializations : ['Childcare'],
  available: c.isVerified !== false,
  bg:        BG_COLORS[index % BG_COLORS.length],
  about:     c.bio || `${c.name} is a trained and verified caretaker.`,
});

const SORT_OPTIONS = ['Rating: High to Low', 'Price: Low to High', 'Price: High to Low'];

export default function NannyList() {
  const navigate = useNavigate();

  const [nannies,      setNannies]    = useState([]);
  const [loading,      setLoading]    = useState(true);
  const [error,        setError]      = useState('');
  const [search,       setSearch]     = useState('');
  const [availability, setAvail]      = useState('All');
  const [sort,         setSort]       = useState('Rating: High to Low');
  const [view,         setView]       = useState('grid');
  const [selected,     setSelected]   = useState(null);
  const [toastMsg,     setToastMsg]   = useState('');

  useEffect(() => {
    injectCSS();
    fetchCaretakers();
  }, []);

  const fetchCaretakers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await usersAPI.getCaretakers({ trained: 'true' });
      const mapped = (res.caretakers || []).map((c, i) => mapCaretaker(c, i));
      setNannies(mapped);
    } catch (err) {
      setError('Could not load caretakers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = useMemo(() => {
    let list = [...nannies];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.role.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q)) ||
        n.location.toLowerCase().includes(q)
      );
    }
    if (availability === 'Available') list = list.filter(n => n.available);
    if (availability === 'Busy')      list = list.filter(n => !n.available);

    list.sort((a, b) => {
      if (sort === 'Rating: High to Low') return b.stars - a.stars;
      if (sort === 'Price: Low to High')  return a.rateNum - b.rateNum;
      if (sort === 'Price: High to Low')  return b.rateNum - a.rateNum;
      return 0;
    });

    return list;
  }, [nannies, search, availability, sort]);

  const handleBook = (nanny) => {
    if (!nanny.available) {
      showToast(`❌ ${nanny.name} is currently unavailable`);
      return;
    }
    setSelected(null);
    navigate('/booking-calendar', {
      state: {
        nanny: {
          id:    nanny.id,
          emoji: nanny.emoji,
          name:  nanny.name,
          role:  nanny.role,
          rate:  nanny.rateNum,
          stars: nanny.stars,
          bg:    nanny.bg,
        }
      }
    });
  };

  return (
    <div className="nl-root">

      {/* Toast — unchanged */}
      {toastMsg && (
        <div style={{
          position:'fixed', top:20, right:24, zIndex:999,
          background:'#0F172A', color:'white',
          padding:'12px 22px', borderRadius:14,
          fontWeight:700, fontSize:'0.9rem',
          boxShadow:'0 8px 24px rgba(0,0,0,0.2)',
          animation:'cardPop 0.3s ease'
        }}>{toastMsg}</div>
      )}

      {/* Top Navbar */}
      <header className="nl-navbar">
        <div className="nl-navbar-left">
          <button className="nl-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </header>

      {/* Hero */}
      <div className="nl-hero">
        <div className="nl-hero-emojis">👩‍🍼 🌟 👨‍🏫 🎨 🌈 👶</div>
        <div className="nl-hero-tag">🌟 VERIFIED CARETAKERS</div>
        <h1>Find Your Perfect Caretaker 🔍</h1>
        <p>Browse background-verified, trained nannies near you. Filter, compare, and book in minutes.</p>
      </div>

      {/* Search & Filters — unchanged */}
      <div className="nl-controls">
        <div className="nl-search-wrap">
          <span className="nl-search-icon">🔍</span>
          <input
            className="nl-search"
            type="text"
            placeholder="Search by name, skill, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="nl-filter-group">
          {['All', 'Available', 'Busy'].map(a => (
            <button
              key={a}
              className={`nl-pill ${availability === a ? 'active' : ''}`}
              onClick={() => setAvail(a)}
            >{a === 'All' ? '👥 All' : a === 'Available' ? '🟢 Available' : '🔴 Busy'}</button>
          ))}
        </div>

        <select className="nl-select" value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Results bar — unchanged */}
      <div className="nl-results-bar">
        <div className="nl-results-count">
          Showing <strong>{filtered.length}</strong> of {nannies.length} caretakers
        </div>
        <div className="nl-view-toggle">
          <button className={`nl-view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>⊞</button>
          <button className={`nl-view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>≡</button>
        </div>
      </div>

      {/* Cards Grid — unchanged UI */}
      <div className="nl-grid-wrap">
        <div className={`nl-grid ${view === 'list' ? 'list-view' : ''}`}>

          {loading ? (
            <div className="nl-loading">
              <div className="nl-loading-icon">👶</div>
              <p>Loading caretakers...</p>
            </div>
          ) : error ? (
            <div className="nl-empty">
              <div className="nl-empty-icon">⚠️</div>
              <h3>Could not load caretakers</h3>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="nl-empty">
              <div className="nl-empty-icon">🔍</div>
              <h3>No caretakers found</h3>
              <p>Try changing your filters or search terms</p>
            </div>
          ) : (
            filtered.map((n, i) => (
              <div
                className="nc"
                key={n.id}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelected(n)}
              >
                <div className="nc-banner" style={{ background: n.bg }}>
                  <div className={`nc-available ${n.available ? 'yes' : 'no'}`}>
                    {n.available ? '🟢 Available' : '🔴 Busy'}
                  </div>
                  <div className="nc-verified">✅ Verified</div>
                  <div className={`nc-avatar ${n.avatar ? 'has-image' : ''}`}>
                    {n.avatar ? (
                      <img src={n.avatar} alt={n.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                    ) : null}
                    <span style={{ display: n.avatar ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{n.emoji}</span>
                  </div>
                </div>
                <div className="nc-body">
                  <div className="nc-name">{n.name}</div>
                  <div className="nc-role">{n.role}</div>
                  <div>
                    <span className="nc-stars">{'★'.repeat(n.stars)}{'☆'.repeat(5 - n.stars)}</span>
                    <span className="nc-rating-count">({n.reviews} reviews)</span>
                  </div>
                  <div className="nc-tags">
                    {n.tags.map(t => <span className="nc-tag" key={t}>{t}</span>)}
                  </div>
                  <div className="nc-info-row">
                    <div className="nc-info-item">
                      <div className="nc-info-val">{n.rate}</div>
                      <div className="nc-info-lbl">Rate</div>
                    </div>
                    <div className="nc-info-item">
                      <div className="nc-info-val">{n.exp}</div>
                      <div className="nc-info-lbl">Experience</div>
                    </div>
                    <div className="nc-info-item">
                      <div className="nc-info-val">📍</div>
                      <div className="nc-info-lbl">{n.location}</div>
                    </div>
                  </div>
                  <button className="nc-btn" onClick={e => { e.stopPropagation(); setSelected(n); }}>
                    View Profile & Book
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal — unchanged */}
      {selected && (
        <div className="nl-modal-bg" onClick={() => setSelected(null)}>
          <div className="nl-modal" onClick={e => e.stopPropagation()}>
            <div className="nm-banner" style={{ background: selected.bg }}>
              <button className="nm-close" onClick={() => setSelected(null)}>✕</button>
              <div className={`nm-avatar-lg ${selected.avatar ? 'has-image' : ''}`}>
                {selected.avatar ? (
                  <img src={selected.avatar} alt={selected.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                ) : null}
                <span style={{ display: selected.avatar ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{selected.emoji}</span>
              </div>
            </div>
            <div className="nm-body">
              <div className="nm-name">{selected.name}</div>
              <div className="nm-role">{selected.role} · 📍 {selected.location}</div>
              <div className="nm-stars">
                {'★'.repeat(selected.stars)}{'☆'.repeat(5 - selected.stars)}
                <span style={{ color:'#94A3B8', fontSize:'0.82rem', marginLeft:6 }}>
                  ({selected.reviews} reviews)
                </span>
              </div>
              <div className="nm-tags">
                {selected.tags.map(t => <span className="nm-tag" key={t}>{t}</span>)}
                <span className="nm-tag" style={{ background: selected.available ? '#D1FAE5' : '#FEE2E2', color: selected.available ? '#059669' : '#E11D48' }}>
                  {selected.available ? '🟢 Available' : '🔴 Busy'}
                </span>
              </div>
              <div className="nm-stats">
                <div className="nm-stat">
                  <div className="nm-stat-val">{selected.exp}</div>
                  <div className="nm-stat-lbl">Experience</div>
                </div>
                <div className="nm-stat">
                  <div className="nm-stat-val">{selected.rate}</div>
                  <div className="nm-stat-lbl">Per Hour</div>
                </div>
                <div className="nm-stat">
                  <div className="nm-stat-val">{selected.reviews}</div>
                  <div className="nm-stat-lbl">Reviews</div>
                </div>
              </div>
              <p className="nm-about">{selected.about}</p>
              <button
                className="nm-book-btn"
                onClick={() => handleBook(selected)}
                disabled={!selected.available}
                style={!selected.available ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {selected.available ? '📅 Book Now' : '🔴 Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
