// File Path: src/components/Sidebar.jsx
// FIXES APPLIED:
//   FIX 1: /parent    → /parent-dashboard
//   FIX 2: /caretaker → /caretaker-dashboard
//   FIX 3: /admin     → /admin-dashboard
//   FIX 4: /profile   → /profile/edit
//   FIX 5: Logout now calls logout() from AuthContext (not navigate to '/')
//   FIX 6: Role-based rendering — each role only sees their own links
//   FIX 7: Removed ../../styles/main.css import (inline styles used instead)
//   NOTE:  This Sidebar is for standalone use. Each dashboard has its own
//          built-in sidebar — this component is available if needed elsewhere.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role || '';

  // FIX 6: Role-based nav links
  const navLinks = {
    Parent: [
      { to: '/parent-dashboard',  icon: '🏠', label: 'Dashboard'    },
      { to: '/booking-calendar',  icon: '📅', label: 'Book a Nanny' },
      { to: '/payments',          icon: '💰', label: 'Payments'     },
      { to: '/messages',          icon: '💬', label: 'Messages'     },
      { to: '/learning',          icon: '📚', label: 'Learning Hub' },
      { to: '/reviews',           icon: '⭐', label: 'Reviews'      },
      { to: '/notifications',     icon: '🔔', label: 'Notifications'},
      { to: '/profile/edit',      icon: '👤', label: 'Edit Profile' }, // FIX 4
    ],
    Caretaker: [
      { to: '/caretaker-dashboard', icon: '🏠', label: 'Dashboard'    },
      { to: '/training',            icon: '📖', label: 'Training'     },
      { to: '/payments',            icon: '💰', label: 'Earnings'     },
      { to: '/messages',            icon: '💬', label: 'Messages'     },
      { to: '/notifications',       icon: '🔔', label: 'Notifications'},
      { to: '/profile/edit',        icon: '👤', label: 'Edit Profile' },
    ],
    Admin: [
      { to: '/admin-dashboard', icon: '🏠', label: 'Dashboard'    },
      { to: '/payments',        icon: '💰', label: 'Payments'     },
      { to: '/messages',        icon: '💬', label: 'Messages'     },
      { to: '/notifications',   icon: '🔔', label: 'Notifications'},
      { to: '/profile/edit',    icon: '👤', label: 'Edit Profile' },
    ],
  };

  const links = navLinks[role] || [];

  return (
    <div style={s.sidebar}>
      {/* Brand */}
      <div style={s.brand}>
        <span style={{ fontSize: '1.8rem' }}>👶</span>
        <span style={s.brandText}>Trusted Care</span>
      </div>

      {/* User info */}
      {user && (
        <div style={s.userCard}>
          <div style={s.avatar}>{user.name?.[0]?.toUpperCase() || '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div style={s.userName}>{user.name}</div>
            <div style={s.userRole}>{role}</div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav style={s.nav}>
        {links.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...s.link,
                ...(isActive ? s.linkActive : {}),
              }}
            >
              <span style={s.linkIcon}>{link.icon}</span>
              <span>{link.label}</span>
              {isActive && <span style={s.activeDot} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout — FIX 5: calls AuthContext logout() */}
      <button style={s.logoutBtn} onClick={logout}>
        🚪 Logout
      </button>
    </div>
  );
};

const F = "'Nunito', sans-serif";

const s = {
  sidebar:    { width: '240px', minHeight: '100vh', background: 'linear-gradient(180deg,#1A237E 0%,#283593 60%,#3949AB 100%)', display: 'flex', flexDirection: 'column', padding: '24px 16px', fontFamily: F },
  brand:      { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingLeft: '8px' },
  brandText:  { fontFamily: "'Fredoka One', cursive", fontSize: '1.6rem', color: 'white' },
  userCard:   { background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
  avatar:     { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#4FC3F7,#CE93D8)', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 },
  userName:   { color: 'white', fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole:   { color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600 },
  nav:        { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  link:       { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', position: 'relative', transition: 'all 0.2s', borderLeft: '3px solid transparent' },
  linkActive: { background: 'rgba(255,255,255,0.15)', color: 'white', borderLeftColor: '#4FC3F7' },
  linkIcon:   { fontSize: '1.1rem', width: '22px', textAlign: 'center' },
  activeDot:  { position: 'absolute', right: '14px', width: '6px', height: '6px', borderRadius: '50%', background: '#4FC3F7' },
  logoutBtn:  { marginTop: '16px', width: '100%', padding: '11px', background: 'rgba(255,82,82,0.15)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: '12px', color: '#FF8A80', fontFamily: F, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' },
};

export default Sidebar; 