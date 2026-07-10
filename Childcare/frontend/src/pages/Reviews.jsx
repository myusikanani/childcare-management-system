// File Path: src/pages/Reviews.jsx
// Description: Rating & Reviews page - Parents can rate caretakers, view all reviews

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const injectCSS = () => {
  if (document.getElementById('reviews-styles')) return;
  const style = document.createElement('style');
  style.id = 'reviews-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    :root {
      --sky: #38BDF8;
      --sky2: #0EA5E9;
      --mint: #34D399;
      --mint2: #059669;
      --coral: #FB7185;
      --coral2: #E11D48;
      --sun: #FCD34D;
      --sun2: #F59E0B;
      --lavender: #A78BFA;
      --white: #FFFFFF;
      --navy: #0F172A;
      --slate: #334155;
      --light: #F0F9FF;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .rv-root {
      min-height: 100vh;
      background: linear-gradient(160deg, #E0F2FE 0%, #F0FDF4 45%, #FFF1F2 100%);
      font-family: 'Quicksand', sans-serif;
      color: var(--navy);
      position: relative;
      overflow-x: hidden;
    }

    /* Navbar */
    .rv-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px;
      height: 68px;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(56,189,248,0.15);
    }

    .rv-logo {
      font-family: 'Baloo 2', cursive;
      font-size: 1.5rem; font-weight: 800;
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      display: flex; align-items: center; gap: 8px; text-decoration: none;
    }

    .rv-nav-links { display: flex; gap: 8px; }
    .rv-nav-btn {
      padding: 8px 18px; border-radius: 999px; font-weight: 600; font-size: 0.88rem;
      text-decoration: none; color: var(--slate); transition: all 0.2s;
    }
    .rv-nav-btn:hover { background: var(--light); color: var(--sky2); }

    /* Hero */
    .rv-hero {
      padding: 120px 48px 40px;
      text-align: center;
      position: relative;
    }

    .rv-hero-tag {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(56,189,248,0.15);
      border: 1px solid rgba(56,189,248,0.3);
      border-radius: 999px; padding: 8px 20px;
      font-size: 0.85rem; font-weight: 700; color: var(--sky2);
      margin-bottom: 16px;
    }

    .rv-hero h1 {
      font-family: 'Baloo 2', cursive;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800; line-height: 1.2;
      color: var(--navy); margin-bottom: 12px;
    }

    .rv-hero h1 span { 
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .rv-hero p { color: var(--slate); font-size: 1rem; max-width: 500px; margin: 0 auto; }

    /* Stats */
    .rv-stats {
      display: flex; justify-content: center; gap: 24px; margin: 32px 0 48px;
      flex-wrap: wrap;
    }
    .rv-stat {
      text-align: center;
      padding: 20px 32px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      min-width: 120px;
    }
    .rv-stat-num {
      font-family: 'Baloo 2', cursive;
      font-size: 2rem; font-weight: 800; 
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      display: block;
    }
    .rv-stat-label {
      font-size: 0.78rem; color: var(--slate); font-weight: 600;
      margin-top: 4px;
    }

    /* Main */
    .rv-main {
      max-width: 1200px; margin: 0 auto;
      padding: 0 48px 60px;
      display: grid; grid-template-columns: 1fr 400px; gap: 32px;
    }

    /* Filter */
    .rv-list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .rv-list-title { font-family: 'Baloo 2', cursive; font-size: 1.3rem; font-weight: 700; }
    .rv-filter-row { display: flex; gap: 8px; }
    .rv-filter-btn {
      padding: 8px 16px; border-radius: 999px;
      border: 2px solid #E5E7EB; background: white;
      font-family: 'Quicksand', sans-serif; font-size: 0.8rem; font-weight: 600;
      color: var(--slate); cursor: pointer; transition: all 0.2s;
    }
    .rv-filter-btn.active, .rv-filter-btn:hover {
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      border-color: transparent; color: white;
    }

    /* Review card */
    .rv-card {
      background: white; border-radius: 20px; padding: 24px;
      margin-bottom: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.05);
      transition: all 0.25s;
    }
    .rv-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

    .rv-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .rv-card-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, var(--sky), var(--mint));
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
    }
    .rv-card-info { flex: 1; }
    .rv-card-name { font-weight: 700; font-size: 0.95rem; }
    .rv-card-meta { font-size: 0.75rem; color: var(--slate); }
    .rv-card-rating { display: flex; gap: 2px; }
    .rv-card-rating .star { color: var(--sun2); font-size: 1rem; }
    .rv-card-rating .star.empty { color: #E5E7EB; }

    .rv-card-body { font-size: 0.9rem; color: var(--slate); line-height: 1.6; margin-bottom: 12px; }
    .rv-card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .rv-card-tag {
      padding: 4px 12px; border-radius: 999px;
      background: rgba(56,189,248,0.1); color: var(--sky2);
      font-size: 0.72rem; font-weight: 600;
    }
    .rv-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid #F1F5F9; }
    .rv-card-time { font-size: 0.72rem; color: #94A3B8; }
    .rv-card-like { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--slate); cursor: pointer; }

    /* Empty state */
    .rv-empty {
      text-align: center; padding: 60px 20px;
      background: white; border-radius: 20px;
    }
    .rv-empty-icon { font-size: 3rem; margin-bottom: 12px; }
    .rv-empty-text { font-size: 0.95rem; color: var(--slate); }

    /* Sidebar panel */
    .rv-panel {
      background: white; border-radius: 24px; padding: 28px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      position: sticky; top: 88px;
    }
    .rv-panel-title { font-family: 'Baloo 2', cursive; font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; }
    .rv-panel-sub { font-size: 0.82rem; color: var(--slate); margin-bottom: 20px; }

    .rv-field { margin-bottom: 16px; }
    .rv-label { display: block; font-weight: 700; font-size: 0.78rem; color: var(--slate); margin-bottom: 6px; text-transform: uppercase; }
    .rv-select, .rv-textarea {
      width: 100%; padding: 12px 14px; border: 2px solid #E5E7EB; border-radius: 12px;
      font-family: 'Quicksand', sans-serif; font-size: 0.9rem; font-weight: 600;
      background: #F8FAFC; outline: none; transition: all 0.2s;
    }
    .rv-select:focus, .rv-textarea:focus { border-color: var(--sky2); background: white; }
    .rv-textarea { resize: none; min-height: 100px; }

    /* Star picker */
    .rv-star-pick { display: flex; gap: 4px; }
    .rv-star-pick button {
      background: none; border: none; font-size: 1.8rem; cursor: pointer;
      transition: transform 0.15s;
    }
    .rv-star-pick button:hover { transform: scale(1.2); }
    .rv-star-pick button.off { opacity: 0.3; }
    .rv-star-pick button.on { opacity: 1; }

    /* Stars display */
    .rv-stars { display: flex; gap: 2px; }
    .rv-star { font-size: 1rem; }
    .rv-star.filled { color: var(--sun2); }
    .rv-star.empty { color: #E5E7EB; }

    /* Tags */
    .rv-tag-pick { display: flex; gap: 6px; flex-wrap: wrap; }
    .rv-tag-pick button {
      padding: 6px 14px; border-radius: 999px; border: 2px solid #E5E7EB;
      background: white; font-family: 'Quicksand', sans-serif;
      font-size: 0.75rem; font-weight: 600; color: var(--slate); cursor: pointer;
      transition: all 0.2s;
    }
    .rv-tag-pick button:hover { border-color: var(--sky2); color: var(--sky2); }
    .rv-tag-pick button.selected { background: var(--sky2); border-color: var(--sky2); color: white; }

    /* Submit button */
    .rv-submit-btn {
      width: 100%; padding: 14px; border-radius: 999px; border: none;
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      color: white; font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem; font-weight: 800; cursor: pointer;
      box-shadow: 0 4px 14px rgba(14,165,233,0.4);
      transition: all 0.25s;
    }
    .rv-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14,165,233,0.5); }
    .rv-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Top rated */
    .rv-top-rated { margin-top: 24px; }
    .rv-top-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0; border-bottom: 1px solid #F1F5F9;
    }
    .rv-top-item:last-child { border-bottom: none; }
    .rv-top-rank {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 800;
      background: linear-gradient(135deg, var(--sun), var(--coral));
      color: white;
    }
    .rv-top-info { flex: 1; }
    .rv-top-name { font-weight: 700; font-size: 0.88rem; }
    .rv-top-reviews { font-size: 0.72rem; color: var(--slate); }
    .rv-top-rating { font-weight: 700; color: var(--sun2); font-size: 0.88rem; }

    /* Toast */
    .rv-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: var(--navy); color: white; padding: 12px 24px;
      border-radius: 999px; font-weight: 600; font-size: 0.88rem;
      z-index: 1000; animation: toastIn 0.3s ease;
    }
    @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

    @media (max-width: 900px) {
      .rv-main { grid-template-columns: 1fr; }
      .rv-panel { position: static; }
    }
  `;
  document.head.appendChild(style);
};

const TAGS_OPTIONS = ['Punctual','Patient','Fun','Caring','Trustworthy','Creative','Professional','Experienced'];

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rv-star-pick">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={n <= (hover || value) ? 'on' : 'off'}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >⭐</button>
      ))}
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="rv-stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`rv-star ${n <= Math.round(rating) ? 'filled' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [nannies, setNannies] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selTags, setSelTags] = useState([]);

  useEffect(() => {
    injectCSS();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      
      const caretakersRes = await fetch('http://localhost:5000/api/users/caretakers');
      const caretakersData = await caretakersRes.json();
      
      if (caretakersData.success) {
        setNannies(caretakersData.caretakers || []);
      }

      const completeds = (bookingsData.bookings || []).filter(b => 
        (b.status === 'completed' || b.status === 'Completed') && !b.rating
      );
      setCompletedBookings(completeds);

      const allReviews = [];
      if (bookingsData.bookings) {
        bookingsData.bookings.forEach(b => {
          if (b.rating && b.review) {
            allReviews.push({
              id: b._id,
              author: b.parentName || 'Parent',
              caretakerId: b.caretaker?._id,
              caretakerName: b.caretakerName || 'Caretaker',
              rating: b.rating,
              date: b.reviewedAt ? new Date(b.reviewedAt).toLocaleDateString('en-IN', { month:'short', year:'numeric' }) : new Date().toLocaleDateString('en-IN', { month:'short', year:'numeric' }),
              text: b.review,
              tags: [],
              likes: 0,
              liked: false,
              isMyReview: b.parent?._id === user?.id || b.parent === user?.id,
            });
          }
        });
      }
      
      setReviews(allReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleTag = (tag) => {
    setSelTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleLike = (id) => {
    setReviews(prev => prev.map(r => r.id === id
      ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
      : r
    ));
  };

  const handleSubmit = async () => {
    if (!selectedBooking) { showToast('⚠️ Please select a booking to review'); return; }
    if (rating === 0) { showToast('⚠️ Please select a star rating'); return; }
    if (comment.trim().length < 10) { showToast('⚠️ Please write at least 10 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${selectedBooking}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, review: comment })
      });
      
      if (res.ok || res.status === 200) {
        await fetchData();
        showToast('✅ Review submitted! Thank you.');
      } else {
        const errorData = await res.json();
        showToast(`⚠️ ${errorData.message || 'Could not submit review'}`);
      }

      setSelectedBooking(''); setRating(0); setComment(''); setSelTags([]);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('⚠️ Failed to submit review');
    }
    setLoading(false);
  };

  const filtered = filter === 'all' ? reviews
    : filter === 'mine' ? reviews.filter(r => r.isMyReview)
    : reviews.filter(r => r.rating === parseInt(filter));

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="rv-root">
      {/* Navbar */}
      <nav className="rv-nav">
        <div className="rv-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '1.6rem' }}>🌟</span>
          Trusted Care
        </div>
        <div className="rv-nav-links">
          <button className="rv-nav-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="rv-hero">
        <div className="rv-hero-tag">⭐ Community Reviews</div>
        <h1>Trusted by <span>Real Families</span></h1>
        <p>Honest reviews from parents who've experienced our caretakers firsthand</p>

        <div className="rv-stats">
          <div className="rv-stat">
            <span className="rv-stat-num">{avgRating}</span>
            <span className="rv-stat-label">Avg Rating</span>
          </div>
          <div className="rv-stat">
            <span className="rv-stat-num">{reviews.length}</span>
            <span className="rv-stat-label">Total Reviews</span>
          </div>
          <div className="rv-stat">
            <span className="rv-stat-num">{nannies.length}</span>
            <span className="rv-stat-label">Caretakers</span>
          </div>
          <div className="rv-stat">
            <span className="rv-stat-num">{reviews.length > 0 ? '100%' : '0%'}</span>
            <span className="rv-stat-label">Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="rv-main">
        {/* Left - Reviews list */}
        <div>
          <div className="rv-list-header">
            <div className="rv-list-title">All Reviews</div>
            <div className="rv-filter-row">
              {['all', 'mine', '5', '4', '3'].map(f => (
                <button
                  key={f}
                  className={`rv-filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'mine' ? 'My Reviews' : `${f} ⭐`}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rv-empty">
              <div className="rv-empty-icon">📝</div>
              <div className="rv-empty-text">
                {reviews.length === 0 
                  ? 'No reviews yet. Complete a booking to leave a review!' 
                  : 'No reviews match your filter.'}
              </div>
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="rv-card">
                <div className="rv-card-header">
                  <div className="rv-card-avatar">👤</div>
                  <div className="rv-card-info">
                    <div className="rv-card-name">{r.author}</div>
                    <div className="rv-card-meta">For {r.caretakerName} • {r.date}</div>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <div className="rv-card-body">{r.text}</div>
                {r.tags.length > 0 && (
                  <div className="rv-card-tags">
                    {r.tags.map(tag => (
                      <span key={tag} className="rv-card-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="rv-card-footer">
                  <div className="rv-card-time">{r.date}</div>
                  <div className="rv-card-like" onClick={() => toggleLike(r.id)}>
                    {r.liked ? '❤️' : '🤍'} {r.likes}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right - Write review panel */}
        <div className="rv-panel">
          <div className="rv-panel-title">Write a Review ✍️</div>
          <div className="rv-panel-sub">
            {completedBookings.length > 0 
              ? 'Share your experience with a caretaker'
              : 'Complete a booking to leave a review'}
          </div>

          <div className="rv-field">
            <label className="rv-label">Select Completed Booking</label>
            <select
              className="rv-select"
              value={selectedBooking}
              onChange={e => setSelectedBooking(e.target.value)}
              disabled={completedBookings.length === 0}
            >
              <option value="">
                {completedBookings.length > 0 ? 'Choose a booking...' : 'No completed bookings'}
              </option>
              {completedBookings.map(b => (
                <option key={b._id} value={b._id}>
                  {b.caretakerName || 'Caretaker'} - {b.date}
                </option>
              ))}
            </select>
          </div>

          <div className="rv-field">
            <label className="rv-label">Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <div style={{ fontSize:'0.8rem', color:'var(--sun2)', marginTop:6, fontWeight:600 }}>
                {['','Terrible 😞','Bad 😕','Okay 😐','Good 😊','Excellent! 🌟'][rating]}
              </div>
            )}
          </div>

          <div className="rv-field">
            <label className="rv-label">Your Review</label>
            <textarea
              className="rv-textarea"
              rows={4}
              placeholder="Describe your experience... (min. 10 characters)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={!selectedBooking}
            />
          </div>

          <div className="rv-field">
            <label className="rv-label">Tags (optional)</label>
            <div className="rv-tag-pick">
              {TAGS_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={selTags.includes(tag) ? 'selected' : ''}
                  onClick={() => toggleTag(tag)}
                  disabled={!selectedBooking}
                >{tag}</button>
              ))}
            </div>
          </div>

          <button
            className="rv-submit-btn"
            onClick={handleSubmit}
            disabled={loading || !selectedBooking || rating === 0}
          >
            {loading ? '⏳ Submitting...' : '⭐ Submit Review'}
          </button>

          {/* Top Rated */}
          <div className="rv-top-rated">
            <div className="rv-panel-title" style={{ marginTop: 24 }}>🏆 Top Rated</div>
            <div className="rv-panel-sub">Best caretakers this month</div>
            {nannies.length > 0 ? nannies.filter(n => n.rating > 0).sort((a,b) => b.rating - a.rating).slice(0,4).map((n, i) => (
              <div key={n._id} className="rv-top-item">
                <div className="rv-top-rank">#{i+1}</div>
                <div className="rv-top-info">
                  <div className="rv-top-name">{n.name}</div>
                  <div className="rv-top-reviews">{n.totalReviews || 0} reviews</div>
                </div>
                <div className="rv-top-rating">⭐ {n.rating?.toFixed(1) || '0.0'}</div>
              </div>
            )) : (
              <div style={{color: 'var(--slate)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0'}}>
                No ratings yet
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="rv-toast">{toast}</div>}
    </div>
  );
}
