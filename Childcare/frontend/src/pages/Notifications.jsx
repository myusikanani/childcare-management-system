// File Path: src/pages/Notifications.jsx
// Description: Notifications page - all roles see their relevant notifications

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('notif-styles')) return;
  const style = document.createElement('style');
  style.id = 'notif-styles';
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

    .nt-root {
      min-height: 100vh;
      background: linear-gradient(160deg, #E0F2FE 0%, #F0FDF4 45%, #FFF1F2 100%);
      font-family: 'Quicksand', sans-serif;
      color: var(--navy);
    }

    /* Navbar */
    .nt-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px;
      height: 68px;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(56,189,248,0.15);
    }

    .nt-logo {
      font-family: 'Baloo 2', cursive;
      font-size: 1.5rem; font-weight: 800;
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      display: flex; align-items: center; gap: 8px; text-decoration: none;
      cursor: pointer;
    }

    .nt-nav-links { display: flex; gap: 8px; }
    .nt-nav-btn {
      padding: 9px 20px; border-radius: 999px; font-weight: 700; font-size: 0.88rem;
      text-decoration: none; color: var(--white); transition: all 0.2s;
      background: linear-gradient(135deg, #38b2ac, #4fd1c5); border: none; cursor: pointer; font-family: 'Quicksand', sans-serif;
      box-shadow: 0 2px 8px rgba(56,178,172,0.3);
    }
    .nt-nav-btn:hover { background: linear-gradient(135deg, #2d9f93, #38b2ac); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(56,178,172,0.4); }

    /* Main content */
    .nt-main {
      max-width: 900px; margin: 0 auto;
      padding: 100px 48px 60px;
    }

    .nt-top {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 36px;
    }
    .nt-heading {
      font-family: 'Baloo 2', cursive;
      font-size: 2.2rem; font-weight: 800; color: var(--navy); line-height: 1.1;
      margin-bottom: 6px;
    }
    .nt-subheading { color: var(--slate); font-size: 0.9rem; }

    .nt-actions { display: flex; gap: 10px; }
    .nt-action-btn {
      padding: 10px 20px; border-radius: 999px;
      border: 2px solid rgba(56,189,248,0.3); background: white;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.82rem; font-weight: 700; color: var(--slate);
      cursor: pointer; transition: all 0.2s;
    }
    .nt-action-btn:hover { border-color: var(--sky2); color: var(--sky2); }
    .nt-action-btn.primary {
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      border-color: transparent; color: white;
      box-shadow: 0 4px 14px rgba(14,165,233,0.3);
    }
    .nt-action-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14,165,233,0.4); }

    /* Date group */
    .nt-date-group { margin-bottom: 28px; }
    .nt-date-label {
      font-size: 0.72rem; font-weight: 800; color: var(--slate);
      text-transform: uppercase; letter-spacing: 2px;
      margin-bottom: 12px; padding-left: 4px;
    }

    /* Notification card */
    .nt-card {
      display: flex; gap: 16px; align-items: flex-start;
      padding: 20px 24px; border-radius: 18px;
      background: white; border: 2px solid transparent;
      margin-bottom: 10px; cursor: pointer;
      transition: all 0.25s;
      position: relative; overflow: hidden;
    }
    .nt-card:hover { border-color: rgba(56,189,248,0.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .nt-card.unread { border-left: 4px solid var(--sky2); }
    .nt-card.unread::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, rgba(56,189,248,0.03) 0%, transparent 60%);
    }

    .nt-card-icon {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; flex-shrink: 0;
    }

    .nt-card-body { flex: 1; }
    .nt-card-title {
      font-size: 0.95rem; font-weight: 700; color: var(--navy);
      margin-bottom: 4px; line-height: 1.4;
    }
    .nt-card-desc {
      font-size: 0.84rem; color: var(--slate); line-height: 1.5;
      margin-bottom: 8px;
    }
    .nt-card-meta {
      display: flex; align-items: center; gap: 10px;
    }
    .nt-card-time { font-size: 0.75rem; color: var(--slate); font-weight: 500; }
    .nt-card-badge {
      padding: 3px 10px; border-radius: 999px;
      font-size: 0.68rem; font-weight: 700; letter-spacing: 0.5px;
    }

    .nt-card-right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
    }
    .nt-unread-dot {
      width: 9px; height: 9px; border-radius: 50%; background: var(--sky2);
      flex-shrink: 0;
    }
    .nt-del-btn {
      background: none; border: none; cursor: pointer;
      color: #CCC; font-size: 0.85rem; padding: 4px;
      border-radius: 6px; transition: all 0.2s; opacity: 0;
    }
    .nt-card:hover .nt-del-btn { opacity: 1; }
    .nt-del-btn:hover { color: var(--coral2); background: rgba(225,29,72,0.1); }

    /* Filter tabs */
    .nt-filters {
      display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .nt-filter-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 999px;
      border: 2px solid #E5E7EB; background: white;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.82rem; font-weight: 600; color: var(--slate);
      cursor: pointer; transition: all 0.2s;
    }
    .nt-filter-btn:hover { border-color: var(--sky2); color: var(--sky2); }
    .nt-filter-btn.active {
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      border-color: transparent; color: white;
    }
    .nt-filter-icon { font-size: 0.9rem; }
    .nt-filter-count {
      background: rgba(255,255,255,0.3); color: inherit;
      font-size: 0.68rem; font-weight: 800; padding: 2px 6px;
      border-radius: 999px;
    }

    /* Empty */
    .nt-empty {
      text-align: center; padding: 80px 20px;
      background: white; border-radius: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .nt-empty-icon {
      font-size: 4rem; margin-bottom: 16px;
      animation: ntBounce 2s ease-in-out infinite;
    }
    @keyframes ntBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    .nt-empty-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.4rem; font-weight: 800; color: var(--navy); margin-bottom: 8px;
    }
    .nt-empty-sub { color: var(--slate); font-size: 0.9rem; }

    /* Slide in animation */
    .nt-card { animation: ntIn 0.35s ease both; }
    @keyframes ntIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

    @media(max-width:800px){
      .nt-main { padding: 100px 20px 40px; }
      .nt-nav { padding: 0 20px; }
    }
  `;
  document.head.appendChild(style);
};

const TYPE_CONFIG = {
  booking_request: { bg:'#F0F9FF', color:'#0EA5E9', badge:'#F0F9FF', badgeColor:'#0EA5E9', badgeText:'Booking'  },
  booking_confirmed: { bg:'#F0FDF4', color:'#34D399', badge:'#F0FDF4', badgeColor:'#059669', badgeText:'Confirmed' },
  booking_cancelled: { bg:'#FFF1F2', color:'#E11D48', badge:'#FFF1F2', badgeColor:'#E11D48', badgeText:'Cancelled' },
  booking_completed: { bg:'#F0FDF4', color:'#059669', badge:'#F0FDF4', badgeColor:'#059669', badgeText:'Completed' },
  payment_received: { bg:'#ECFDF5', color:'#059669', badge:'#ECFDF5', badgeColor:'#059669', badgeText:'Payment' },
  review_received: { bg:'#FFFBEB', color:'#F59E0B', badge:'#FFFBEB', badgeColor:'#D97706', badgeText:'Review'   },
  refund_requested: { bg:'#FFF7ED', color:'#EA580C', badge:'#FFF7ED', badgeColor:'#EA580C', badgeText:'Refund' },
  system:   { bg:'#F0F9FF', color:'#0EA5E9', badge:'#F0F9FF', badgeColor:'#0EA5E9', badgeText:'System'   },
  alert:    { bg:'#FFF1F2', color:'#E11D48', badge:'#FFF1F2', badgeColor:'#E11D48', badgeText:'Alert'    },
  training: { bg:'#F0FDFA', color:'#0D9488', badge:'#F0FDFA', badgeColor:'#0D9488', badgeText:'Training' },
  message: { bg:'#F5F3FF', color:'#8B5CF6', badge:'#F5F3FF', badgeColor:'#7C3AED', badgeText:'Message' },
  profile_incomplete: { bg:'#FEF3C7', color:'#D97706', badge:'#FEF3C7', badgeColor:'#B45309', badgeText:'Action' },
};

const getIconForType = (type) => {
  const icons = {
    booking_request: '📅',
    booking_confirmed: '✅',
    booking_cancelled: '❌',
    booking_completed: '🎉',
    payment_received: '💰',
    refund_requested: '💸',
    review_received: '⭐',
    system: '🔔',
    alert: '⚠️',
    training: '🎓',
    message: '💬',
    profile_incomplete: '📝',
  };
  return icons[type] || '📌';
};

const FILTERS = [
  { key:'all',      icon:'🔔', label:'All' },
  { key:'booking',  icon:'📅', label:'Bookings' },
  { key:'payment',  icon:'💳', label:'Payments' },
  { key:'review',   icon:'⭐', label:'Reviews' },
  { key:'system',   icon:'⚙️', label:'System' },
  { key:'message',  icon:'💬', label:'Messages' },
];

export default function Notifications() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [notifs,  setNotifs]  = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    injectCSS();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      if (response.success) {
        const formatted = response.notifications.map(n => ({
          id: n._id,
          type: n.type,
          icon: getIconForType(n.type),
          title: n.title,
          desc: n.message,
          time: formatTimeAgo(n.createdAt),
          date: formatDateGroup(n.createdAt),
          unread: !n.isRead,
          createdAt: n.createdAt,
        }));
        setNotifs(formatted);
      }
    } catch (err) {
      console.log('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatDateGroup = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) return 'Today';
    if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
    return 'Earlier';
  };

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifs(notifs.map(n => n.id === id ? {...n, unread: false} : n));
    } catch (err) {
      console.log('Failed to mark as read');
    }
  };

  const deleteNotif = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifs(notifs.filter(n => n.id !== id));
    } catch (err) {
      console.log('Failed to delete notification');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifs(notifs.map(n => ({...n, unread: false})));
    } catch (err) {
      console.log('Failed to mark all as read');
    }
  };

  const clearAll = async () => {
    for (const n of notifs) {
      try {
        await notificationsAPI.delete(n.id);
      } catch {}
    }
    setNotifs([]);
  };

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => n.unread).length;

  // Group by date
  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  const countByType = (type) => notifs.filter(n => n.type === type && n.unread).length;

  return (
    <div className="nt-root">
      {/* Navbar */}
      <nav className="nt-nav">
        <div className="nt-logo" onClick={() => navigate('/')}>
          <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height: '36px', width: 'auto' }} />
          Trusted Care
        </div>
        <div className="nt-nav-links">
          <button className="nt-nav-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </nav>

      {/* Main */}
      <div className="nt-main">
        <div className="nt-top">
          <div>
            <div className="nt-heading">
              Notifications {unreadCount > 0 && <span style={{background:'linear-gradient(135deg, var(--sky2), var(--mint2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>({unreadCount})</span>}
            </div>
            <div className="nt-subheading">
              {user?.name || 'User'} · {user?.role || 'User'} account
            </div>
          </div>
          <div className="nt-actions">
            {unreadCount > 0 && (
              <button className="nt-action-btn" onClick={markAllRead}>Mark all read</button>
            )}
            <button className="nt-action-btn primary" onClick={clearAll}>Clear all</button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="nt-filters">
          {FILTERS.map(f => {
            const cnt = f.key === 'all' ? unreadCount : countByType(f.key);
            return (
              <button
                key={f.key}
                className={`nt-filter-btn ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                <span className="nt-filter-icon">{f.icon}</span>
                {f.label}
                {cnt > 0 && <span className="nt-filter-count">{cnt}</span>}
              </button>
            );
          })}
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="nt-empty">
            <div className="nt-empty-icon">🎉</div>
            <div className="nt-empty-title">You're all caught up!</div>
            <div className="nt-empty-sub">No notifications in this category</div>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="nt-date-group">
              <div className="nt-date-label">{date}</div>
              {items.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                return (
                  <div
                    key={n.id}
                    className={`nt-card ${n.unread ? 'unread' : ''}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="nt-card-icon" style={{ background: cfg.bg }}>
                      {n.icon}
                    </div>
                    <div className="nt-card-body">
                      <div className="nt-card-title">{n.title}</div>
                      <div className="nt-card-desc">{n.desc}</div>
                      <div className="nt-card-meta">
                        <span className="nt-card-time">🕐 {n.time}</span>
                        <span
                          className="nt-card-badge"
                          style={{ background: cfg.badge, color: cfg.badgeColor, border: `1px solid ${cfg.badgeColor}22` }}
                        >{cfg.badgeText}</span>
                      </div>
                    </div>
                    <div className="nt-card-right">
                      {n.unread && <div className="nt-unread-dot" />}
                      <button
                        className="nt-del-btn"
                        onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                        title="Delete"
                      >✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}