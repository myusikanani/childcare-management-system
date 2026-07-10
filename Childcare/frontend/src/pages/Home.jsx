import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

/* ─────────────────────────────────────────────
   Inline styles & keyframe injector
───────────────────────────────────────────── */
const injectCSS = () => {
  if (document.getElementById('home-styles')) return;
  const style = document.createElement('style');
  style.id = 'home-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    :root {
      --sky:      #38BDF8;
      --sky2:     #0EA5E9;
      --mint:     #34D399;
      --mint2:    #059669;
      --coral:    #FB7185;
      --coral2:   #E11D48;
      --sun:      #FCD34D;
      --sun2:     #F59E0B;
      --lavender: #A78BFA;
      --lav2:     #7C3AED;
      --white:    #FFFFFF;
      --navy:     #0F172A;
      --slate:    #334155;
      --light:    #F0F9FF;

    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .home-root {
      font-family: 'Quicksand', sans-serif;
      background: #F0F9FF;
      color: var(--navy);
      overflow-x: hidden;
    }

    /* ── Navbar ── */
    .hn-bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px;
      height: 68px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(56,189,248,0.15);
      animation: slideDown 0.5s ease;
    }
    @keyframes slideDown { from { transform: translateY(-100%); opacity:0; } to { transform: translateY(0); opacity:1; } }

    .hn-logo {
      font-family: 'Baloo 2', cursive;
      font-size: 1.6rem; font-weight: 800;
      color: #1A237E;
      display: flex; align-items: center; gap: 8px;
      text-decoration: none;
    }
    .hn-logo-icon { font-size: 1.8rem; -webkit-text-fill-color: initial; }

    .hn-links { display: flex; align-items: center; gap: 8px; }
    .hn-link {
      padding: 8px 18px; border-radius: 999px;
      font-weight: 600; font-size: 0.9rem;
      text-decoration: none; color: var(--navy);
      transition: all 0.2s;
      background: transparent;
    }
    .hn-link:hover { background: rgba(56,189,248,0.15); color: var(--sky2); }
    .hn-btn-login {
      padding: 9px 24px; border-radius: 999px;
      font-weight: 700; font-size: 0.9rem;
      text-decoration: none;
      background: linear-gradient(135deg, var(--sky), var(--mint));
      color: white;
      box-shadow: 0 4px 14px rgba(56,189,248,0.4);
      transition: all 0.25s;
    }
    .hn-btn-login:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(56,189,248,0.5); }

    /* ── Hero ── */
    .hero {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 100px 48px 60px;
      position: relative;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: linear-gradient(160deg, #E0F2FE 0%, #F0FDF4 45%, #FFF1F2 100%);
    }

    /* Floating blobs */
    .blob {
      position: absolute; border-radius: 50%;
      filter: blur(60px); opacity: 0.45; z-index: 0;
    }
    .blob-1 { width: 500px; height: 500px; background: radial-gradient(circle, #BAE6FD, transparent); top: -120px; left: -100px; animation: drift1 12s ease-in-out infinite; }
    .blob-2 { width: 400px; height: 400px; background: radial-gradient(circle, #BBF7D0, transparent); bottom: -80px; right: -80px; animation: drift2 10s ease-in-out infinite; }
    .blob-3 { width: 300px; height: 300px; background: radial-gradient(circle, #FEE2E2, transparent); top: 40%; left: 60%; animation: drift3 14s ease-in-out infinite; }

    @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.1)} }
    @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.08)} }
    @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-40px) scale(1.05)} }

    /* Floating emojis */
    .emoji-float {
      position: absolute; font-size: 2.4rem; z-index: 1;
      animation: floatUp 6s ease-in-out infinite;
      user-select: none; pointer-events: none;
    }
    .ef1 { top: 15%; left: 8%; animation-delay: 0s; }
    .ef2 { top: 25%; right: 10%; animation-delay: 1s; }
    .ef3 { bottom: 30%; left: 5%; animation-delay: 2s; }
    .ef4 { bottom: 20%; right: 8%; animation-delay: 1.5s; }
    .ef5 { top: 41%; left: 2%; animation-delay: 3s; font-size: 1.8rem; }
    .ef6 { top: 10%; right: 25%; animation-delay: 2.5s; font-size: 2rem; }
    .ef7 { bottom: 40%; right: 14%; animation-delay: 0.5s; font-size: 2rem; }

    @keyframes floatUp {
      0%,100% { transform: translateY(0px) rotate(-5deg); }
      50%      { transform: translateY(-20px) rotate(5deg); }
    }

    .hero-inner {
      position: relative; z-index: 2;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 60px; align-items: center;
      max-width: 1200px; width: 100%;
    }

    .hero-text { 
      animation: fadeRight 0.7s ease 0.2s both; 
      position: relative;
      z-index: 2;
    }
    @keyframes fadeRight { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }

    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(30,41,59,0.1);
      border: 1.5px solid rgba(30,41,59,0.2);
      padding: 6px 16px; border-radius: 999px;
      font-size: 0.85rem; font-weight: 700;
      color: #1E293B; margin-bottom: 20px;
    }
    .hero-badge span { animation: pulse-dot 2s infinite; }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .hero-h1 {
      font-family: 'Baloo 2', cursive;
      font-size: 3.6rem; font-weight: 800;
      line-height: 1.2; margin-bottom: 22px;
      color: #0F172A;
      text-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .hero-h1 .grad-word {
      background: linear-gradient(135deg, #0EA5E9, #059669);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }
    .hero-h1 .coral-word {
      background: linear-gradient(135deg, #E11D48, #FB7185);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }

    .hero-p {
      font-size: 1.15rem; line-height: 1.8;
      color:navy;
      margin-bottom: 40px;
      max-width: 520px;
      font-weight: 500;
    }

    /* CTA Buttons */
    .cta-group { display: flex; flex-wrap: wrap; gap: 14px; }

    .cta-btn {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 15px 28px; border-radius: 18px;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700; font-size: 0.98rem;
      text-decoration: none;
      transition: all 0.25s var(--ease, cubic-bezier(.34,1.56,.64,1));
      position: relative; overflow: hidden;
    }
    .cta-btn::after {
      content:''; position:absolute; inset:0;
      background: rgba(255,255,255,0.2);
      transform: translateX(-100%);
      transition: transform 0.4s ease;
    }
    .cta-btn:hover::after { transform: translateX(100%); }
    .cta-btn:hover { transform: translateY(-3px); }

    .cta-enroll {
      background: linear-gradient(135deg, var(--sky), var(--sky2));
      color: white;
      box-shadow: 0 6px 20px rgba(14,165,233,0.4);
    }
    .cta-enroll:hover { box-shadow: 0 10px 30px rgba(14,165,233,0.55); }

    .cta-caretaker {
      background: linear-gradient(135deg, var(--mint), var(--mint2));
      color: white;
      box-shadow: 0 6px 20px rgba(52,211,153,0.4);
    }
    .cta-caretaker:hover { box-shadow: 0 10px 30px rgba(52,211,153,0.55); }

    .cta-about {
      background: white;
      color: var(--slate);
      border: 2px solid rgba(56,189,248,0.25);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .cta-about:hover { border-color: var(--sky); color: var(--sky2); }

    /* Hero right — illustration card */
    .hero-visual { animation: fadeLeft 0.7s ease 0.4s both; }
    @keyframes fadeLeft { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }

    .hero-card {
      background: white;
      border-radius: 28px;
      padding: 32px;
      box-shadow: 0 24px 64px rgba(14,165,233,0.15), 0 4px 12px rgba(0,0,0,0.05);
      position: relative;
    }

    .hero-card-banner {
      background: linear-gradient(135deg, #BAE6FD, #BBF7D0);
      border-radius: 18px; padding: 28px 24px;
      text-align: center; margin-bottom: 24px;
      position: relative; overflow: hidden;
    }
    .hero-card-banner-emoji { font-size: 5rem; display: block; animation: wiggle 3s ease-in-out infinite; }
    @keyframes wiggle { 0%,100%{transform:rotate(-8deg) scale(1)} 50%{transform:rotate(8deg) scale(1.1)} }
    .hero-card-banner h3 {
      font-family: 'Baloo 2', cursive;
      font-size: 1.4rem; font-weight: 800; color: var(--navy); margin-top: 10px;
    }
    .hero-card-banner p { font-size: 0.88rem; color: var(--slate); margin-top: 4px; }

    .mini-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .mini-stat {
      background: var(--light); border-radius: 14px; padding: 14px 10px;
      text-align: center;
      transition: transform 0.2s;
    }
    .mini-stat:hover { transform: translateY(-4px); }
    .mini-stat-num {
      font-family: 'Baloo 2', cursive;
      font-size: 1.5rem; font-weight: 800;
      background: linear-gradient(135deg, var(--sky2), var(--mint2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .mini-stat-lbl { font-size: 0.75rem; color: var(--slate); font-weight: 600; margin-top: 2px; }

    /* floating badges on card */
    .card-badge {
      position: absolute;
      display: flex; align-items: center; gap: 6px;
      background: white; padding: 8px 14px; border-radius: 999px;
      font-size: 0.8rem; font-weight: 700; color: var(--navy);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      animation: floatBadge 4s ease-in-out infinite;
    }
    .cb1 { top: -16px; right: 20px; animation-delay: 0s; }
    .cb2 { bottom: -16px; left: 20px; animation-delay: 2s; }
    @keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

    /* ── How it Works ── */
    .section {
      padding: 96px 48px;
      max-width: 1200px; margin: 0 auto;
    }
    .section-tag {
      display: inline-block;
      background: rgba(56,189,248,0.1);
      color: var(--sky2); font-weight: 700; font-size: 0.82rem;
      padding: 5px 14px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 14px;
    }
    .section-h2 {
      font-family: 'Baloo 2', cursive;
      font-size: 2.6rem; font-weight: 800; color: var(--navy);
      line-height: 1.2; margin-bottom: 16px;
    }
    .section-sub { color: var(--slate); font-size: 1.05rem; max-width: 540px; line-height: 1.7; }

    /* Steps */
    .steps-grid {
      display: grid; grid-template-columns: repeat(3,1fr);
      gap: 28px; margin-top: 56px;
    }
    .step-card {
      background: white; border-radius: 24px; padding: 32px 28px;
      position: relative; overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .step-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }

    .step-num {
      font-family: 'Baloo 2', cursive;
      font-size: 4rem; font-weight: 800; line-height: 1;
      background: linear-gradient(135deg, var(--sky), var(--mint));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      opacity: 0.15; position: absolute; top: 16px; right: 20px;
    }
    .step-icon {
      width: 56px; height: 56px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; margin-bottom: 20px;
    }
    .si-blue { background: linear-gradient(135deg, #BAE6FD, #7DD3FC); }
    .si-green { background: linear-gradient(135deg, #BBF7D0, #6EE7B7); }
    .si-coral { background: linear-gradient(135deg, #FEE2E2, #FCA5A5); }

    .step-card h3 { font-family:'Baloo 2',cursive; font-size:1.25rem; font-weight:700; margin-bottom:10px; }
    .step-card p { font-size:0.9rem; color:var(--slate); line-height:1.65; }

    /* ── Features ── */
    .features-wrapper {
      background: linear-gradient(160deg, #F0FDF4 0%, #EFF6FF 100%);
      padding: 96px 0;
    }
    .features-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 20px; margin-top: 52px;
    }
    .feat-card {
      background: white; border-radius: 22px; padding: 28px;
      display: flex; gap: 20px; align-items: flex-start;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .feat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
    .feat-icon {
      width: 52px; height: 52px; min-width: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
    }
    .feat-card h4 { font-family:'Baloo 2',cursive; font-size:1.1rem; font-weight:700; margin-bottom:6px; }
    .feat-card p { font-size:0.875rem; color:var(--slate); line-height:1.6; }

    /* ── Nannies showcase ── */
    .nanny-grid {
      display: grid; grid-template-columns: repeat(4,1fr);
      gap: 20px; margin-top: 52px;
    }
    .nanny-card {
      background: white; border-radius: 22px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.07);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .nanny-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .nanny-avatar {
      height: 120px;
      display: flex; align-items: center; justify-content: center;
      font-size: 4rem;
      overflow: hidden;
    }
    .nanny-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .nanny-avatar.has-image {
      background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
    }
    .na1 { background: linear-gradient(135deg, #BAE6FD, #93C5FD); }
    .na2 { background: linear-gradient(135deg, #BBF7D0, #6EE7B7); }
    .na3 { background: linear-gradient(135deg, #FEE2E2, #FCA5A5); }
    .na4 { background: linear-gradient(135deg, #EDE9FE, #C4B5FD); }
    .nanny-info { padding: 18px; }
    .nanny-info h4 { font-family:'Baloo 2',cursive; font-size:1.05rem; font-weight:700; }
    .nanny-info .nanny-role { font-size:0.8rem; color:var(--sky2); font-weight:600; margin: 3px 0 8px; }
    .nanny-stars { color: var(--sun2); font-size:0.9rem; }
    .nanny-info .nanny-rate { font-size:0.8rem; color:var(--slate); margin-top:6px; }

    /* ── Testimonials ── */
    .testi-wrapper { background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%); padding: 96px 0; }
    .testi-wrapper .section-h2 { color: white; }
    .testi-wrapper .section-sub { color: rgba(255,255,255,0.65); }
    .testi-wrapper .section-tag { background: rgba(56,189,248,0.2); color: #7DD3FC; }
    .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 52px; }
    .testi-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 22px; padding: 28px;
      transition: transform 0.25s, background 0.25s;
    }
    .testi-card:hover { transform: translateY(-6px); background: rgba(255,255,255,0.1); }
    .testi-quote { font-size: 2.5rem; line-height: 1; margin-bottom: 14px; }
    .testi-text { color: rgba(255,255,255,0.82); font-size: 0.92rem; line-height: 1.7; margin-bottom: 20px; }
    .testi-author { display:flex; align-items:center; gap:12px; }
    .testi-av { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
    .testi-name { font-weight:700; color:white; font-size:0.9rem; }
    .testi-role { font-size:0.78rem; color:rgba(255,255,255,0.5); margin-top:2px; }

    /* ── CTA Banner ── */
    .cta-banner {
      margin: 96px 48px;
      background: linear-gradient(135deg, var(--sky2) 0%, var(--mint2) 100%);
      border-radius: 32px; padding: 72px 60px;
      text-align: center; position: relative; overflow: hidden;
    }
    .cta-banner::before {
      content:''; position:absolute; top:-60px; right:-60px;
      width:250px; height:250px; border-radius:50%;
      background: rgba(255,255,255,0.1);
    }
    .cta-banner::after {
      content:''; position:absolute; bottom:-60px; left:-40px;
      width:200px; height:200px; border-radius:50%;
      background: rgba(255,255,255,0.08);
    }
    .cta-banner h2 {
      font-family:'Baloo 2',cursive;
      font-size:2.8rem; font-weight:800; color:white;
      margin-bottom:16px; position:relative; z-index:1;
    }
    .cta-banner p { color:rgba(255,255,255,0.85); font-size:1.05rem; margin-bottom:36px; position:relative; z-index:1; }
    .cta-banner-btns { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; position:relative; z-index:1; }
    .cta-white {
      background:white; color:var(--sky2);
      padding:14px 32px; border-radius:999px;
      font-weight:700; font-size:1rem;
      text-decoration:none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      transition: all 0.25s;
    }
    .cta-white:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
    .cta-outline {
      background: transparent; color:white;
      padding:14px 32px; border-radius:999px;
      font-weight:700; font-size:1rem;
      text-decoration:none;
      border: 2px solid rgba(255,255,255,0.5);
      transition: all 0.25s;
    }
    .cta-outline:hover { background:rgba(255,255,255,0.15); border-color:white; transform:translateY(-3px); }

    /* ── Footer ── */
    .footer {
      background: var(--navy); color: rgba(255,255,255,0.6);
      padding: 48px; text-align: center;
    }
    .footer-logo {
      font-family:'Baloo 2',cursive; font-size:1.6rem; font-weight:800;
      background: linear-gradient(135deg, var(--sky), var(--mint));
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      background-clip:text; margin-bottom:12px;
    }
    .footer p { font-size:0.88rem; }

    /* ── Scroll reveal ── */
    .reveal { opacity:0; transform:translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .reveal.visible { opacity:1; transform:translateY(0); }
    .reveal-delay-1 { transition-delay:0.1s; }
    .reveal-delay-2 { transition-delay:0.2s; }
    .reveal-delay-3 { transition-delay:0.3s; }
    .reveal-delay-4 { transition-delay:0.4s; }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .hero-inner { grid-template-columns:1fr; text-align:center; }
      .hero-visual { display:none; }
      .cta-group { justify-content:center; }
      .hero-h1 { font-size:2.6rem; }
      .steps-grid, .features-grid, .testi-grid { grid-template-columns:1fr; }
      .nanny-grid { grid-template-columns:repeat(2,1fr); }
      .hn-bar { padding:0 24px; }
      .section { padding:64px 24px; }
      .cta-banner { margin:48px 24px; padding:48px 28px; }
      .cta-banner h2 { font-size:2rem; }
      .hero { padding:90px 24px 48px; }
    }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const STEPS = [
  { icon: '🔍', bg: 'si-blue', num: '01', title: 'Find Your Perfect Nanny', desc: 'Browse verified caretakers near you, filtered by skills, experience, and availability.' },
  { icon: '📅', bg: 'si-green', num: '02', title: 'Book with Confidence', desc: 'Schedule sessions easily with our booking calendar. Get instant confirmation.' },
  { icon: '⭐', bg: 'si-coral', num: '03', title: 'Rate & Trust', desc: 'After every session, rate your caretaker. Our review system keeps quality high.' },
];

const FEATURES = [
  { icon: '🛡️', bg: '#EFF6FF', title: 'Background Verified', desc: 'Every caretaker passes thorough background checks before joining our platform.' },
  { icon: '📱', bg: '#F0FDF4', title: 'Real-time Chat', desc: 'Message your caretaker directly through our secure in-app messaging system.' },
  { icon: '💳', bg: '#FFF7ED', title: 'Safe Payments', desc: 'All transactions are secured and encrypted. Pay only after confirmation.' },
  { icon: '🎓', bg: '#FFF1F2', title: 'Trained Professionals', desc: 'Caretakers complete our certified childcare training modules before being listed.' },
  { icon: '📍', bg: '#F5F3FF', title: 'Location-based Search', desc: 'Find caretakers in your area quickly with our map-based search feature.' },
  { icon: '🔔', bg: '#ECFDF5', title: 'Instant Notifications', desc: 'Get real-time alerts for bookings, messages, and schedule changes.' },
];

const NANNIES = [];  // Will be fetched from database1

const TESTIMONIALS = [
  { quote: '"', text: "Finding a trusted nanny for my 2-year-old was so stressful until I found Trusted Care. Booked in under 10 minutes and our nanny Priya is absolutely wonderful!", author: 'Anita Rao', role: 'Parent of 1', emoji: '👩', bg: '#BAE6FD' },
  { quote: '"', text: "As a caretaker, this platform helped me find consistent work and the training modules made me a better professional. Highly recommended!", author: 'Kavita Singh', role: 'Caretaker', emoji: '👩‍🍼', bg: '#BBF7D0' },
  { quote: '"', text: "The booking process is seamless and I love being able to see reviews before choosing. My kids absolutely love their new caretaker!", author: 'Rohit Mehta', role: 'Parent of 2', emoji: '👨', bg: '#FEE2E2' },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, getDashboardPath } = useAuth();
  const revealRefs = useRef([]);
  const [caretakers, setCaretakers] = useState([]);
  const [loadingCaretakers, setLoadingCaretakers] = useState(true);

  const SAMPLE_CARETAKERS = [
    { _id: '1', fullName: 'Priya Sharma', specialization: 'Infant Care Specialist', rating: 4.9, hourlyRate: 500 },
    { _id: '2', fullName: 'Anita Desai', specialization: 'Early Childhood Educator', rating: 4.8, hourlyRate: 450 },
    { _id: '3', fullName: 'Meera Patel', specialization: 'Special Needs Caregiver', rating: 4.7, hourlyRate: 550 },
    { _id: '4', fullName: 'Sunita Verma', specialization: 'Bilingual Childcare', rating: 4.9, hourlyRate: 480 },
  ];

  useEffect(() => {
    injectCSS();

    const fetchCaretakers = async () => {
      try {
        const response = await usersAPI.getCaretakers({});
        if (response.success && response.caretakers && response.caretakers.length > 0) {
          setCaretakers(response.caretakers.slice(0, 4));
        } else {
          setCaretakers(SAMPLE_CARETAKERS);
        }
      } catch (err) {
        setCaretakers(SAMPLE_CARETAKERS);
      } finally {
        setLoadingCaretakers(false);
      }
    };
    fetchCaretakers();

    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addReveal = (i) => (el) => { revealRefs.current[i] = el; };

  const getEmoji = (index) => ['👩', '👨', '👩‍🦱', '👩‍🦳'][index % 4];
  const getBgClass = (index) => ['na1', 'na2', 'na3', 'na4'][index % 4];
  const formatRating = (rating) => {
    const stars = rating ? '★'.repeat(Math.round(rating)) : '★★★★★';
    return stars;
  };
  const formatRate = (rate) => rate ? `₹${rate}/hr` : 'Contact for rate';

  return (
    <div className="home-root">

      {/* ── Navbar ── */}
      <nav className="hn-bar">
        <Link to="/" className="hn-logo">
          <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '8px' }} />
          Trusted Care
        </Link>
        <div className="hn-links">
          <Link to="/about" className="hn-link">About</Link>
          <Link to="/learning" className="hn-link">Learning</Link>
          <Link to="/nannies" className="hn-link">Find Nannies</Link>
          {isAuthenticated ? (
            <button
              className="hn-btn-login"
              style={{ border: 'none', background: 'inherit', cursor: 'pointer', padding: 0 }}
              onClick={() => navigate(getDashboardPath())}
            >
               Dashboard
            </button>
          ) : (
            <Link to="/login" className="hn-btn-login">Login</Link>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Floating emojis */}
        <div className="emoji-float ef1">🌟</div>
        <div className="emoji-float ef2">🎈</div>
        <div className="emoji-float ef3">🌈</div>
        <div className="emoji-float ef4">🎉</div>
        <div className="emoji-float ef5">🦋</div>
        <div className="emoji-float ef6">🎀</div>
        <div className="emoji-float ef7">🌸</div>

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span>●</span> Trusted by 5,000+ families across India
            </div>

            <h1 className="hero-h1">
              Find the <span className="grad-word">Perfect</span><br />
              Care for your <span className="coral-word">Little Ones</span> 💛
            </h1>

            <p className="hero-p" style={{color: 'navy'}}>
              Connect with verified, trained, and loving caretakers near you.
              Safe, affordable, and booked in minutes — so you can work with peace of mind.
            </p>

            <div className="cta-group">
              {isAuthenticated ? (
                <>
                  <button
                    className="cta-btn cta-enroll ripple hover-lift"
                    style={{ border: 'none', background: 'linear-gradient(135deg, var(--sky), var(--sky2))', color: 'white', cursor: 'pointer' }}
                    onClick={() => navigate(getDashboardPath())}
                  >
                    👨‍👩‍👧 Enroll Your Kid
                  </button>
                  <button
                    className="cta-btn cta-caretaker ripple hover-lift"
                    style={{ border: 'none', background: 'linear-gradient(135deg, var(--mint), var(--mint2))', color: 'white', cursor: 'pointer' }}
                    onClick={() => navigate(getDashboardPath())}
                  >
                    👩‍🍼 Join as Caretaker
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup/parent" className="cta-btn cta-enroll ripple hover-lift">
                    👨‍👩‍👧 Enroll Your Kid
                  </Link>
                  <Link to="/signup/caretaker" className="cta-btn cta-caretaker ripple hover-lift">
                    👩‍🍼 Join as Caretaker
                  </Link>
                </>
              )}
              <Link to="/about" className="cta-btn cta-about ripple hover-lift">
                Learn More →
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              {/* Floating badges */}
              <div className="card-badge cb1">✅ Background Verified</div>
              <div className="card-badge cb2">🎓 Certified & Trained</div>

              <div className="hero-card-banner">
                <span className="hero-card-banner-emoji">👩‍🍼</span>
                <h3>Your Child's Safety First</h3>
                <p>Professional care you can trust, every single day</p>
              </div>

              <div className="mini-stats">
                <div className="mini-stat">
                  <div className="mini-stat-num">5K+</div>
                  <div className="mini-stat-lbl">Happy Families</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-num">800+</div>
                  <div className="mini-stat-lbl">Caretakers</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-num">4.9★</div>
                  <div className="mini-stat-lbl">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <div style={{ background: 'white' }}>
        <div className="section">
          <div className="reveal" ref={addReveal(0)}>
            <div className="section-tag">How It Works</div>
            <h2 className="section-h2">3 Simple Steps to<br />Get Started 🚀</h2>
            <p className="section-sub">From finding the perfect nanny to booking your first session — it takes less than 5 minutes.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div className={`step-card reveal reveal-delay-${i + 1} hover-lift`} ref={addReveal(i + 1)} key={i}>
                <div className="step-num">{s.num}</div>
                <div className={`step-icon ${s.bg}`}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="features-wrapper">
        <div className="section">
          <div className="reveal" ref={addReveal(10)}>
            <div className="section-tag">Why Choose Us</div>
            <h2 className="section-h2">Everything You Need<br />in One Place 💎</h2>
            <p className="section-sub">We've built every feature with your child's safety and your convenience in mind.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className={`feat-card reveal reveal-delay-${(i % 3) + 1} hover-lift`} ref={addReveal(20 + i)} key={i}>
                <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="testi-wrapper">
        <div className="section">
          <div className="reveal" ref={addReveal(50)}>
            <div className="section-tag">Testimonials</div>
            <h2 className="section-h2">Loved by Families<br />Across India 💛</h2>
            <p className="section-sub">Don't just take our word for it — here's what our community says.</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className={`testi-card reveal reveal-delay-${i + 1} hover-lift`} ref={addReveal(60 + i)} key={i}>
                <div className="testi-quote">{t.quote}</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-author">
                  <div className="testi-av" style={{ background: t.bg }}>{t.emoji}</div>
                  <div>
                    <div className="testi-name">{t.author}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="cta-banner">
        <h2>Ready to Find Your<br />Perfect Caretaker? 🎉</h2>
        <p>Join 5,000+ families who trust Trusted Care for safe and professional childcare.</p>
        <div className="cta-banner-btns">
          {isAuthenticated ? (
            <>
              <button
                className="cta-white ripple hover-lift"
                style={{ border: 'none', background: 'white', color: 'var(--slate)', cursor: 'pointer' }}
                onClick={() => navigate(getDashboardPath())}
              >
                👨‍👩‍👧 Enroll Your Kid — Free
              </button>
              <button
                className="cta-outline ripple hover-lift"
                style={{ border: '2px solid rgba(56,189,248,0.25)', background: 'white', color: 'var(--slate)', cursor: 'pointer' }}
                onClick={() => navigate(getDashboardPath())}
              >
                👩‍🍼 Become a Caretaker
              </button>
            </>
          ) : (
            <>
              <Link to="/signup/parent" className="cta-white ripple hover-lift">
                👨‍👩‍👧 Enroll Your Kid — Free
              </Link>
              <Link to="/signup/caretaker" className="cta-outline ripple hover-lift">
                👩‍🍼 Become a Caretaker
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-logo">
          <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height: '32px', width: '32px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '8px' }} />
          Trusted Care
        </div>
        <p>Connecting loving families with trusted caretakers across India.</p>
        <p style={{ marginTop: 8, fontSize: '0.8rem', opacity: 0.45 }}>© 2026 Trusted Care. Made with 💛 for children everywhere.</p>
      </footer>

    </div>
  );
}
