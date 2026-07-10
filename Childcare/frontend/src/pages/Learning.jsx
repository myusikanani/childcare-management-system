// File Path: src/pages/Learning.jsx
// Description: Learning Hub for Parents - with Backend Integration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parentLearningAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('learn-styles')) return;
  const style = document.createElement('style');
  style.id = 'learn-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Righteous&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    .lp-root { min-height:100vh; background:linear-gradient(160deg,#F0FDF4 0%,#ECFEFF 50%,#FFF7ED 100%); font-family:'Nunito',sans-serif; color:#1A1A2E; }

    /* Header */
    .lp-header { background:white; border-bottom:2px solid #E5F7EE; padding:18px 48px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:0 2px 16px rgba(0,0,0,0.04); }
    .lp-header-left { display:flex; align-items:center; gap:16px; }
    .lp-back { padding:9px 18px; border-radius:999px; border:2px solid #E5E7EB; background:white; color:#666; font-family:'Nunito',sans-serif; font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
    .lp-back:hover { border-color:#34D399; color:#059669; }
    .lp-brand { font-family:'Righteous',cursive; font-size:1.2rem; color:#059669; display:flex; align-items:center; gap:6px; }
    .lp-header-right { display:flex; align-items:center; gap:12px; }
    .lp-streak { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#FFF7ED,#FEF3C7); border:2px solid #FDE68A; border-radius:999px; padding:8px 16px; font-weight:800; font-size:0.85rem; color:#D97706; }
    .lp-xp { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#F0FDF4,#DCFCE7); border:2px solid #BBF7D0; border-radius:999px; padding:8px 16px; font-weight:800; font-size:0.85rem; color:#059669; }

    /* Hero */
    .lp-hero { background:linear-gradient(135deg,#059669 0%,#0EA5E9 60%,#8B5CF6 100%); padding:48px 48px 52px; position:relative; overflow:hidden; }
    .lp-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 80% 50%,rgba(255,255,255,0.07) 0%,transparent 60%); }
    .lp-hero-inner { position:relative; z-index:1; max-width:1100px; margin:0 auto; }
    .lp-hero-grid { display:grid; grid-template-columns:1fr auto; gap:32px; align-items:center; }
    .lp-hero-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); border-radius:999px; padding:6px 16px; font-size:0.78rem; font-weight:700; color:white; letter-spacing:1px; margin-bottom:14px; }
    .lp-hero h1 { font-family:'Righteous',cursive; font-size:clamp(1.6rem,4vw,2.4rem); color:white; line-height:1.2; margin-bottom:10px; }
    .lp-hero p { color:rgba(255,255,255,0.8); font-size:0.95rem; margin-bottom:24px; }
    .lp-overall-prog { background:rgba(255,255,255,0.15); border-radius:16px; padding:20px 24px; border:1px solid rgba(255,255,255,0.2); }
    .lp-prog-label { color:rgba(255,255,255,0.8); font-size:0.8rem; font-weight:700; margin-bottom:8px; }
    .lp-prog-bar { height:10px; background:rgba(255,255,255,0.2); border-radius:999px; overflow:hidden; margin-bottom:6px; }
    .lp-prog-fill { height:100%; background:white; border-radius:999px; transition:width 1s ease; }
    .lp-prog-pct { color:white; font-size:1.2rem; font-weight:900; }
    .lp-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
    .lp-stat-card { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.2); border-radius:14px; padding:16px; text-align:center; }
    .lp-stat-n { font-family:'Righteous',cursive; font-size:1.6rem; color:white; display:block; }
    .lp-stat-l { font-size:0.72rem; color:rgba(255,255,255,0.7); font-weight:700; letter-spacing:0.5px; }

    /* Tabs */
    .lp-tabs { display:flex; gap:4px; background:white; border-bottom:2px solid #E5E7EB; padding:0 48px; overflow-x:auto; }
    .lp-tab { padding:16px 20px; border:none; background:transparent; font-family:'Nunito',sans-serif; font-size:0.88rem; font-weight:700; color:#888; cursor:pointer; border-bottom:3px solid transparent; transition:all 0.2s; white-space:nowrap; margin-bottom:-2px; }
    .lp-tab:hover { color:#059669; }
    .lp-tab.active { color:#059669; border-bottom-color:#059669; }

    /* Content */
    .lp-content { max-width:1100px; margin:0 auto; padding:36px 48px 60px; }
    .lp-section-title { font-family:'Righteous',cursive; font-size:1.2rem; color:#1A1A2E; margin-bottom:20px; }

    /* Category cards */
    .lp-categories { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:20px; margin-bottom:44px; }
    .lp-cat-card { background:white; border-radius:24px; padding:28px 22px; border:2px solid #E5E7EB; text-align:center; transition:all 0.3s; cursor:pointer; animation:lpFadeUp 0.4s ease both; }
    .lp-cat-card:hover { transform:translateY(-6px); }
    .lp-cat-card.dev:hover  { box-shadow:0 16px 40px rgba(14,165,233,0.18); border-color:#0EA5E9; }
    .lp-cat-card.play:hover { box-shadow:0 16px 40px rgba(217,119,6,0.18); border-color:#F59E0B; }
    .lp-cat-card.nutr:hover { box-shadow:0 16px 40px rgba(5,150,105,0.18); border-color:#059669; }
    .lp-cat-card.emo:hover  { box-shadow:0 16px 40px rgba(236,72,153,0.18); border-color:#EC4899; }
    @keyframes lpFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .lp-cat-icon { font-size:3rem; margin-bottom:14px; display:block; animation:lpWiggle 3s ease-in-out infinite; }
    @keyframes lpWiggle { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
    .lp-cat-card:nth-child(2) .lp-cat-icon { animation-delay:0.5s; }
    .lp-cat-card:nth-child(3) .lp-cat-icon { animation-delay:1s; }
    .lp-cat-card:nth-child(4) .lp-cat-icon { animation-delay:1.5s; }
    .lp-cat-title { font-weight:900; font-size:1rem; color:#1A1A2E; margin-bottom:8px; }
    .lp-cat-desc  { font-size:0.82rem; color:#888; line-height:1.5; margin-bottom:10px; }
    .lp-cat-count { font-size:0.72rem; font-weight:700; color:#AAA; margin-bottom:16px; }
    .lp-cat-btn { padding:10px 24px; border-radius:999px; border:none; font-family:'Nunito',sans-serif; font-size:0.85rem; font-weight:800; cursor:pointer; transition:all 0.2s; color:white; background:linear-gradient(135deg,#F59E0B,#F97316); }
    .lp-cat-card.dev  .lp-cat-btn { background:linear-gradient(135deg,#F59E0B,#F97316); }
    .lp-cat-card.play .lp-cat-btn { background:linear-gradient(135deg,#F59E0B,#F97316); }
    .lp-cat-card.nutr .lp-cat-btn { background:linear-gradient(135deg,#F59E0B,#F97316); }
    .lp-cat-card.emo  .lp-cat-btn { background:linear-gradient(135deg,#F59E0B,#F97316); }
    .lp-cat-btn:hover { transform:scale(1.05); }

    /* Course cards */
    .lp-courses { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; margin-bottom:40px; }
    .lp-course-card { background:white; border-radius:22px; overflow:hidden; border:2px solid #E5E7EB; transition:all 0.3s; cursor:pointer; animation:lpFadeUp 0.4s ease both; }
    .lp-course-card:hover { border-color:#34D399; transform:translateY(-4px); box-shadow:0 12px 32px rgba(52,211,153,0.15); }
    .lp-course-banner { height:110px; display:flex; align-items:center; justify-content:center; font-size:3rem; position:relative; }
    .lp-course-badge { position:absolute; top:10px; right:10px; padding:4px 10px; border-radius:999px; font-size:0.68rem; font-weight:800; }
    .lp-course-body { padding:18px; }
    .lp-course-title { font-weight:800; font-size:0.95rem; color:#1A1A2E; margin-bottom:6px; }
    .lp-course-desc { font-size:0.8rem; color:#888; line-height:1.5; margin-bottom:12px; }
    .lp-course-meta { display:flex; gap:10px; margin-bottom:12px; }
    .lp-course-tag { font-size:0.72rem; color:#666; font-weight:600; }
    .lp-course-prog-bar { height:6px; background:#F0FDF4; border-radius:999px; overflow:hidden; margin-bottom:4px; }
    .lp-course-prog-fill { height:100%; background:linear-gradient(90deg,#34D399,#059669); border-radius:999px; transition:width 0.5s; }
    .lp-course-prog-label { font-size:0.72rem; color:#059669; font-weight:700; margin-bottom:12px; }
    .lp-course-btn { width:100%; padding:10px; border-radius:12px; border:none; font-family:'Nunito',sans-serif; font-size:0.85rem; font-weight:800; cursor:pointer; transition:all 0.2s; }
    .lp-course-btn.start  { background:linear-gradient(135deg,#34D399,#059669); color:white; }
    .lp-course-btn.resume { background:linear-gradient(135deg,#0EA5E9,#3B82F6); color:white; }
    .lp-course-btn.done   { background:#F0FDF4; color:#059669; border:2px solid #BBF7D0; }
    .lp-course-btn:hover  { transform:translateY(-1px); }

    /* Articles */
    .lp-articles { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px; margin-bottom:40px; }
    .lp-article { background:white; border-radius:18px; padding:22px; border:2px solid #E5E7EB; cursor:pointer; transition:all 0.25s; animation:lpFadeUp 0.4s ease both; }
    .lp-article:hover { border-color:#A5F3FC; transform:translateY(-3px); box-shadow:0 8px 24px rgba(14,165,233,0.1); }
    .lp-article-icon  { font-size:2rem; margin-bottom:12px; }
    .lp-article-title { font-weight:800; font-size:0.95rem; color:#1A1A2E; margin-bottom:6px; }
    .lp-article-desc  { font-size:0.8rem; color:#888; line-height:1.5; margin-bottom:14px; }
    .lp-article-foot  { display:flex; align-items:center; justify-content:space-between; }
    .lp-article-time  { font-size:0.72rem; color:#AAA; font-weight:600; }
    .lp-read-btn { padding:5px 14px; border-radius:999px; background:#F0F9FF; border:1.5px solid #BAE6FD; color:#0EA5E9; font-size:0.75rem; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'Nunito',sans-serif; }
    .lp-read-btn:hover { background:#0EA5E9; color:white; }

    /* Tips */
    .lp-tips { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
    .lp-tip { background:white; border-radius:16px; padding:20px; border:2px solid #E5E7EB; text-align:center; transition:all 0.25s; animation:lpFadeUp 0.4s ease both; }
    .lp-tip:hover { border-color:#FDE68A; transform:translateY(-2px); }
    .lp-tip-icon  { font-size:2.2rem; margin-bottom:10px; }
    .lp-tip-title { font-weight:800; font-size:0.9rem; color:#1A1A2E; margin-bottom:6px; }
    .lp-tip-text  { font-size:0.78rem; color:#888; line-height:1.5; }

    /* Activities */
    .lp-activities { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:20px; }
    .lp-activity { background:white; border-radius:20px; padding:24px; border:2px solid #E5E7EB; transition:all 0.25s; animation:lpFadeUp 0.4s ease both; }
    .lp-activity:hover { border-color:#F59E0B; transform:translateY(-4px); box-shadow:0 12px 32px rgba(245,158,11,0.15); }
    .lp-activity-header { display:flex; align-items:flex-start; gap:14px; margin-bottom:14px; }
    .lp-activity-icon { font-size:2.5rem; }
    .lp-activity-title { font-weight:800; font-size:1rem; color:#1A1A2E; margin-bottom:4px; }
    .lp-activity-meta { display:flex; gap:8px; flex-wrap:wrap; }
    .lp-activity-badge { background:#FEF3C7; color:#D97706; padding:3px 10px; border-radius:999px; font-size:0.7rem; font-weight:700; }
    .lp-activity-badge.age { background:#DBEAFE; color:#2563EB; }
    .lp-activity-badge.diff { background:#ECFDF5; color:#059669; }
    .lp-activity-desc { font-size:0.85rem; color:#666; line-height:1.5; margin-bottom:12px; }
    .lp-activity-section { margin-bottom:10px; }
    .lp-activity-section-title { font-size:0.72rem; font-weight:700; color:#AAA; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
    .lp-activity-items { display:flex; flex-wrap:wrap; gap:6px; }
    .lp-activity-item { background:#F8FAFC; padding:4px 10px; border-radius:6px; font-size:0.75rem; color:#555; }
    .lp-activity-benefits { display:flex; flex-wrap:wrap; gap:6px; }
    .lp-activity-benefit { background:#F0FDF4; padding:4px 10px; border-radius:6px; font-size:0.72rem; color:#059669; font-weight:600; }
    .lp-activity-btn { padding:10px 16px; background:linear-gradient(135deg,#F59E0B,#F97316); color:white; border:none; border-radius:10px; font-family:'Nunito',sans-serif; font-weight:800; font-size:0.85rem; cursor:pointer; margin-top:14px; transition:all 0.2s; display:flex; align-items:center; gap:6px; }
    .lp-activity-btn:hover { transform:scale(1.02); box-shadow:0 4px 12px rgba(245,158,11,0.3); }
    .lp-activity-btn.saved { background:#F0FDF4; color:#059669; border:2px solid #BBF7D0; }

    /* Food */
    .lp-food { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:20px; }
    .lp-food-card { background:white; border-radius:20px; padding:24px; border:2px solid #E5E7EB; transition:all 0.25s; animation:lpFadeUp 0.4s ease both; }
    .lp-food-card:hover { border-color:#34D399; transform:translateY(-4px); box-shadow:0 12px 32px rgba(52,211,153,0.15); }
    .lp-food-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .lp-food-icon { font-size:2.5rem; }
    .lp-food-title { font-weight:800; font-size:1rem; color:#1A1A2E; }
    .lp-food-category { font-size:0.72rem; color:#34D399; font-weight:700; text-transform:uppercase; }
    .lp-food-desc { font-size:0.85rem; color:#666; line-height:1.5; margin-bottom:14px; }
    .lp-food-items { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
    .lp-food-tag { background:#F0FDF4; color:#059669; padding:4px 10px; border-radius:6px; font-size:0.72rem; font-weight:600; }
    .lp-food-age { background:#DBEAFE; color:#2563EB; padding:4px 10px; border-radius:6px; font-size:0.72rem; font-weight:600; }
    .lp-food-time { background:#FFF7ED; color:#D97706; padding:4px 10px; border-radius:6px; font-size:0.72rem; font-weight:600; }
    .lp-food-btn { padding:10px 16px; background:linear-gradient(135deg,#34D399,#059669); color:white; border:none; border-radius:10px; font-family:'Nunito',sans-serif; font-weight:800; font-size:0.85rem; cursor:pointer; margin-top:12px; transition:all 0.2s; display:flex; align-items:center; gap:6px; }
    .lp-food-btn:hover { transform:scale(1.02); box-shadow:0 4px 12px rgba(52,211,153,0.3); }
    .lp-food-btn.saved { background:#F0FDF4; color:#059669; border:2px solid #BBF7D0; }

    /* Article Modal */
    .lp-modal-overlay { position:fixed; inset:0; background:rgba(26,35,126,0.4); backdrop-filter:blur(8px); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
    .lp-modal { background:white; border-radius:24px; width:100%; max-width:700px; max-height:85vh; overflow-y:auto; padding:36px; animation:lpPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes lpPopIn { from{opacity:0;transform:scale(0.88) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .lp-modal-close { float:right; background:#F0FDF4; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:1.1rem; color:#059669; transition:all 0.2s; }
    .lp-modal-close:hover { background:#DCFCE7; }
    .lp-modal-icon { font-size:4rem; margin-bottom:16px; }
    .lp-modal-title { font-family:'Righteous',cursive; font-size:1.5rem; color:#1A1A2E; margin-bottom:8px; }
    .lp-modal-meta { font-size:0.78rem; color:#AAA; font-weight:600; margin-bottom:16px; }
    .lp-modal-body { font-size:0.95rem; color:#374151; line-height:1.8; max-height:400px; overflow-y:auto; }
    .lp-modal-body h3 { font-weight:800; color:#1A1A2E; margin:20px 0 10px; font-size:1.05rem; }
    .lp-modal-body ul { padding-left:20px; margin:10px 0; }
    .lp-modal-body li { margin-bottom:8px; }
    .lp-modal-tip { background:#F0FDF4; border:2px solid #BBF7D0; border-radius:14px; padding:16px; margin-top:20px; }
    .lp-modal-tip-title { font-weight:800; color:#059669; margin-bottom:6px; font-size:0.88rem; }
    .lp-modal-tip-text { font-size:0.85rem; color:#374151; }
    .lp-modal-actions { display:flex; gap:12px; margin-top:20px; }
    .lp-modal-btn { flex:1; padding:12px; border-radius:12px; font-family:'Nunito',sans-serif; font-weight:700; cursor:pointer; transition:all 0.2s; }
    .lp-modal-btn.primary { background:linear-gradient(135deg,#34D399,#059669); color:white; border:none; }
    .lp-modal-btn.secondary { background:#F0FDF4; color:#059669; border:2px solid #BBF7D0; }

    /* Comments */
    .lp-comments { margin-top:24px; border-top:2px solid #E5F7EE; padding-top:20px; }
    .lp-comments-title { font-weight:800; font-size:0.95rem; color:#1A1A2E; margin-bottom:16px; }
    .lp-comment { display:flex; gap:12px; margin-bottom:16px; padding:14px; background:#F9FBFF; border-radius:12px; }
    .lp-comment-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#0EA5E9,#3B82F6); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; flex-shrink:0; }
    .lp-comment-content { flex:1; }
    .lp-comment-name { font-weight:700; font-size:0.88rem; color:#1A1A2E; margin-bottom:4px; }
    .lp-comment-text { font-size:0.88rem; color:#555; line-height:1.5; }
    .lp-comment-time { font-size:0.72rem; color:#AAA; margin-top:4px; }
    .lp-comment-input { display:flex; gap:10px; margin-top:16px; }
    .lp-comment-input input { flex:1; padding:12px 16px; border:2px solid #E5F7EE; border-radius:12px; font-family:'Nunito',sans-serif; font-size:0.88rem; outline:none; }
    .lp-comment-input input:focus { border-color:#34D399; }
    .lp-comment-input button { padding:12px 20px; background:linear-gradient(135deg,#34D399,#059669); color:white; border:none; border-radius:12px; font-weight:700; cursor:pointer; }

    /* Achievements toast */
    .lp-achievement-toast { position:fixed; bottom:24px; right:24px; background:linear-gradient(135deg,#FEF3C7,#FDE68A); border:2px solid #F59E0B; border-radius:16px; padding:16px 24px; display:flex; align-items:center; gap:12px; z-index:300; animation:slideInRight 0.4s ease; box-shadow:0 8px 24px rgba(245,158,11,0.3); }
    @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
    .lp-achievement-toast-icon { font-size:2rem; }
    .lp-achievement-toast-text { font-weight:700; color:#92400E; }
    .lp-achievement-toast-title { font-size:0.78rem; color:#B45309; }

    /* Loading */
    .lp-loading { display:flex; align-items:center; justify-content:center; min-height:300px; }
    .lp-spinner { width:48px; height:48px; border:4px solid #E5F7EE; border-top-color:#059669; border-radius:50%; animation:spin 1s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
  `;
  document.head.appendChild(style);
};

// ── Default Data (fallback) ──────────────────────────────────
const CATEGORIES = [
  { id:'development', icon:'🧠', title:'Development',   desc:'Milestones, skills & growth stages for your child',   count:12, tab:'courses' },
  { id:'play',        icon:'🎮', title:'Play & Activities', desc:'Fun activities, games & bonding ideas',           count:18, tab:'activities' },
  { id:'nutrition',   icon:'🥗', title:'Nutrition',       desc:'Healthy meals, allergies & dietary tips',         count:9, tab:'food'  },
  { id:'emotional',   icon:'💗', title:'Emotional',      desc:'Behavior, feelings & mental wellness guidance',     count:14, tab:'courses' },
];

const TIPS = [
  { icon:'💬', title:'Talk to Your Baby',  text:'Narrate your day — it builds language skills from day one.' },
  { icon:'🎵', title:'Sing Daily',         text:'Lullabies and songs soothe babies and boost brain development.' },
  { icon:'📖', title:'Read Together',       text:'Even infants benefit from hearing your voice read aloud.' },
  { icon:'🤸', title:'Tummy Time',         text:'Start with 3-5 minutes a day to strengthen neck and shoulder muscles.' },
  { icon:'🚶', title:'Encourage Exploration',text:'Safe, supervised exploration builds confidence and curiosity.' },
  { icon:'😴', title:'Consistent Sleep',   text:'A predictable bedtime routine helps children feel secure.' },
];

const getBtnState = (pct) => pct === 0 ? 'start' : pct === 100 ? 'done' : 'resume';
const getBtnLabel = (pct) => pct === 0 ? '▶ Start Course' : pct === 100 ? '✓ Completed' : 'Continue';

const Learning = () => {
  injectCSS();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState(null);

  // Content from backend
  const [articles, setArticles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [courses, setCourses] = useState([]);

  // User progress
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({ totalXP: 0, level: 1, xpToNextLevel: 100, articlesRead: 0, completedCourses: 0, savedActivities: [], savedRecipes: [] });
  const [achievements, setAchievements] = useState([]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Modal state
  const [showArticle, setShowArticle] = useState(null);
  const [articleComments, setArticleComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newAchievement, setNewAchievement] = useState(null);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      
      // Fetch content
      const contentRes = await parentLearningAPI.getContent();
      if (contentRes.success) {
        setArticles(contentRes.articles || []);
        setActivities(contentRes.activities || []);
        setRecipes(contentRes.recipes || []);
        setCourses(contentRes.courses || []);
      }
      
      // Fetch progress if logged in
      if (isAuthenticated) {
        const progressRes = await parentLearningAPI.getProgress();
        if (progressRes.success) {
          setProgress(progressRes.progress || []);
          setStats({
            totalXP: progressRes.stats?.totalXP || 0,
            level: progressRes.stats?.level || 1,
            xpToNextLevel: progressRes.stats?.xpToNextLevel || 100,
            articlesRead: progressRes.stats?.articlesRead || 0,
            completedCourses: progressRes.stats?.completedCourses || 0,
            savedActivities: progressRes.savedActivities || [],
            savedRecipes: progressRes.savedRecipes || []
          });
          setAchievements(progressRes.achievements || []);
          setSavedActivities(progressRes.savedActivities || []);
          setSavedRecipes(progressRes.savedRecipes || []);
        }
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    }
    setLoading(false);
  };

  const handleArticleClick = async (article) => {
    setShowArticle(article);
    
    // Mark as read
    if (isAuthenticated) {
      try {
        const res = await parentLearningAPI.markArticleRead(article._id);
        if (res.success && res.achievements?.length > 0) {
          setNewAchievement(res.achievements[0]);
          setTimeout(() => setNewAchievement(null), 4000);
          fetchAllContent();
        }
      } catch (err) {
        console.error('Error marking article read:', err);
      }
    }
    
    // Fetch comments
    try {
      const commentsRes = await parentLearningAPI.getComments(article._id);
      if (commentsRes.success) {
        setArticleComments(commentsRes.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !showArticle) return;
    try {
      const res = await parentLearningAPI.addComment(showArticle._id, newComment);
      if (res.success) {
        setArticleComments([res.comment, ...articleComments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleSaveActivity = async (activityId) => {
    if (!isAuthenticated) {
      alert('Please login to save activities');
      return;
    }
    try {
      const res = await parentLearningAPI.toggleActivitySave(activityId);
      if (res.success) {
        if (res.saved) {
          setSavedActivities([...savedActivities, activityId]);
        } else {
          setSavedActivities(savedActivities.filter(id => id !== activityId));
        }
        if (res.achievements?.length > 0) {
          setNewAchievement(res.achievements[0]);
          setTimeout(() => setNewAchievement(null), 4000);
        }
      }
    } catch (err) {
      console.error('Error saving activity:', err);
    }
  };

  const handleSaveRecipe = async (recipeId) => {
    if (!isAuthenticated) {
      alert('Please login to save recipes');
      return;
    }
    try {
      const res = await parentLearningAPI.toggleRecipeSave(recipeId);
      if (res.success) {
        if (res.saved) {
          setSavedRecipes([...savedRecipes, recipeId]);
        } else {
          setSavedRecipes(savedRecipes.filter(id => id !== recipeId));
        }
        if (res.achievements?.length > 0) {
          setNewAchievement(res.achievements[0]);
          setTimeout(() => setNewAchievement(null), 4000);
        }
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
    }
  };

  const handleCourseEnroll = async (courseId) => {
    if (!isAuthenticated) {
      alert('Please login to enroll in courses');
      return;
    }
    try {
      await parentLearningAPI.enrollInCourse(courseId);
      fetchAllContent();
    } catch (err) {
      console.error('Error enrolling:', err);
    }
  };

  const getCourseProgress = (courseId) => {
    const prog = progress.find(p => p.courseId === courseId || p.courseId?._id === courseId);
    return prog?.progress || 0;
  };

  const handleCategoryExplore = (category) => {
    setActiveCategory(category.id);
    setActiveTab(category.tab);
  };

  const overallPct = courses.length > 0 ? Math.round((stats.completedCourses / courses.length) * 100) : 0;
  const streak = Math.min(stats.articlesRead, 30);

  const filteredCourses = activeCategory
    ? courses.filter(c => c.category === activeCategory)
    : courses;

  const filteredActivities = activeCategory === 'play'
    ? activities
    : activeCategory === 'development'
    ? activities.filter(a => a.category === 'Sensory' || a.category === 'Cognitive')
    : activities;

  const filteredRecipes = activeCategory === 'nutrition'
    ? recipes
    : [];

  const filteredArticles = activeCategory
    ? articles.filter(a => a.category === activeCategory)
    : [];

  if (loading) {
    return (
      <div className="lp-root">
        <div className="lp-loading">
          <div className="lp-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="lp-root">
      {/* Header */}
      <header className="lp-header">
        <div className="lp-header-left">
          <button className="lp-back" onClick={() => navigate('/')}>← Back to Home</button>
          <div className="lp-brand">
            <span>👶</span>
            <span>ParentLearn</span>
          </div>
        </div>
        <div className="lp-header-right">
          <div className="lp-streak">🔥 {streak}-Day Streak</div>
          <div className="lp-xp">⭐ Level {stats.level} • ⚡ {stats.totalXP} XP</div>
        </div>
      </header>

      {/* Hero */}
      <div className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-hero-tag">📚 FREE PARENTING COURSES</div>
              <h1>Learn to Raise Happy, Healthy Kids</h1>
              <p>Expert-backed courses, articles & activities for every stage of your parenting journey</p>
              <div className="lp-stats">
                <div className="lp-stat-card"><span className="lp-stat-n">{courses.length}</span><span className="lp-stat-l">Courses</span></div>
                <div className="lp-stat-card"><span className="lp-stat-n">{activities.length}+</span><span className="lp-stat-l">Activities</span></div>
                <div className="lp-stat-card"><span className="lp-stat-n">{articles.length}+</span><span className="lp-stat-l">Articles</span></div>
              </div>
            </div>
            <div className="lp-overall-prog">
              <div className="lp-prog-label">Overall Progress</div>
              <div className="lp-prog-bar"><div className="lp-prog-fill" style={{width:`${overallPct}%`}}/></div>
              <div className="lp-prog-pct">{overallPct}% Complete • {stats.xpToNextLevel} XP to next level</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="lp-tabs">
        {[
          { key:'overview',   label:'Overview' },
          { key:'courses',    label:'Courses' },
          { key:'articles',   label:'Articles' },
          { key:'activities', label:'Activities' },
          { key:'food',       label:'Recipes' },
        ].map(t => (
          <button key={t.key} className={`lp-tab ${activeTab === t.key && !activeCategory ? 'active' : ''}`}
            onClick={() => { setActiveCategory(null); setActiveTab(t.key); }}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="lp-content">
        {/* Overview */}
        {activeTab === 'overview' && !activeCategory && (
          <>
            <h2 className="lp-section-title">Browse by Category</h2>
            <div className="lp-categories">
              {CATEGORIES.map(c => (
                <div key={c.id} className={`lp-cat-card ${c.id}`}>
                  <span className="lp-cat-icon">{c.icon}</span>
                  <h3 className="lp-cat-title">{c.title}</h3>
                  <p className="lp-cat-desc">{c.desc}</p>
                  <p className="lp-cat-count">
                    {c.id === 'development' && (courses.filter(co => co.category === 'development').length + articles.filter(a => a.category === 'development').length)} resources
                  </p>
                  <button className="lp-cat-btn" onClick={() => handleCategoryExplore(c)}>Explore →</button>
                </div>
              ))}
            </div>

            <h2 className="lp-section-title">Featured Courses</h2>
            <div className="lp-courses">
              {courses.slice(0,3).map(c => {
                const prog = getCourseProgress(c._id);
                return (
                  <div key={c._id} className="lp-course-card" onClick={() => navigate(`/course/${c._id}`)}>
                    <div className="lp-course-banner" style={{ background:c.background || '#E8F5E9' }}>
                      <span style={{ fontSize:'3.5rem' }}>{c.banner}</span>
                      {c.badge && <span className="lp-course-badge" style={{ background:c.color, color:'white' }}>{c.badge}</span>}
                    </div>
                    <div className="lp-course-body">
                      <h3 className="lp-course-title">{c.title}</h3>
                      <p className="lp-course-desc">{c.totalLessons} lessons • {c.duration}</p>
                      {prog > 0 && <div className="lp-course-prog-bar"><div className="lp-course-prog-fill" style={{width:`${prog}%`}}/></div>}
                      {prog > 0 && <p className="lp-course-prog-label">{prog}% complete</p>}
                      <button className={`lp-course-btn ${getBtnState(prog)}`} onClick={(e) => { e.stopPropagation(); navigate(`/course/${c._id}`); }}>{getBtnLabel(prog)}</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="lp-section-title">Quick Parenting Tips</h2>
            <div className="lp-tips">
              {TIPS.map((t, i) => (
                <div key={i} className="lp-tip" style={{ animationDelay:`${i*0.07}s` }}>
                  <div className="lp-tip-icon">{t.icon}</div>
                  <h4 className="lp-tip-title">{t.title}</h4>
                  <p className="lp-tip-text">{t.text}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <>
            {activeCategory && (
              <div style={{marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px'}}>
                <button className="lp-back" onClick={() => setActiveCategory(null)}>← All Categories</button>
                <span style={{fontWeight:700, color:'#059669'}}>{CATEGORIES.find(c => c.id === activeCategory)?.title}</span>
              </div>
            )}
            <h2 className="lp-section-title">{activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.title + ' Courses' : 'All Courses'}</h2>
            {filteredCourses.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', color:'#888'}}>
                <p>No courses found in this category.</p>
              </div>
            ) : (
              <div className="lp-courses">
                {filteredCourses.map(c => {
                  const prog = getCourseProgress(c._id);
                  return (
                    <div key={c._id} className="lp-course-card" onClick={() => navigate(`/course/${c._id}`)}>
                      <div className="lp-course-banner" style={{ background:c.background || '#E8F5E9' }}>
                        <span style={{ fontSize:'3.5rem' }}>{c.banner}</span>
                        {c.badge && <span className="lp-course-badge" style={{ background:c.color, color:'white' }}>{c.badge}</span>}
                      </div>
                      <div className="lp-course-body">
                        <h3 className="lp-course-title">{c.title}</h3>
                        <p className="lp-course-desc">{c.description || `${c.totalLessons} lessons • ${c.duration}`}</p>
                        {prog > 0 && <div className="lp-course-prog-bar"><div className="lp-course-prog-fill" style={{width:`${prog}%`}}/></div>}
                        {prog > 0 && <p className="lp-course-prog-label">{prog}% complete</p>}
                        <button className={`lp-course-btn ${getBtnState(prog)}`} onClick={(e) => { e.stopPropagation(); navigate(`/course/${c._id}`); }}>{getBtnLabel(prog)}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Show related articles when viewing by category */}
            {activeCategory && filteredArticles.length > 0 && (
              <>
                <h2 className="lp-section-title" style={{marginTop:'40px'}}>Related Articles</h2>
                <div className="lp-articles">
                  {filteredArticles.map(a => (
                    <div key={a._id} className="lp-article" onClick={() => handleArticleClick(a)}>
                      <div className="lp-article-icon">{a.icon}</div>
                      <h3 className="lp-article-title">{a.title}</h3>
                      <p className="lp-article-desc">{a.category} • {a.tags?.join(', ')}</p>
                      <div className="lp-article-foot">
                        <span className="lp-article-time">📖 {a.readTime} min read • 👁 {a.views} views</span>
                        <button className="lp-read-btn">Read →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Articles */}
        {activeTab === 'articles' && (
          <>
            {activeCategory && (
              <div style={{marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px'}}>
                <button className="lp-back" onClick={() => setActiveCategory(null)}>← All Categories</button>
                <span style={{fontWeight:700, color:'#0EA5E9'}}>{CATEGORIES.find(c => c.id === activeCategory)?.title}</span>
              </div>
            )}
            <h2 className="lp-section-title">Expert Articles ({activeCategory ? filteredArticles.length : articles.length})</h2>
            {filteredArticles.length === 0 && activeCategory ? (
              <div style={{textAlign:'center', padding:'40px', color:'#888'}}>
                <p>No articles found in this category.</p>
              </div>
            ) : (
              <div className="lp-articles">
                {(activeCategory ? filteredArticles : articles).map(a => (
                  <div key={a._id} className="lp-article" onClick={() => handleArticleClick(a)}>
                    <div className="lp-article-icon">{a.icon}</div>
                    <h3 className="lp-article-title">{a.title}</h3>
                    <p className="lp-article-desc">{a.category} • {a.tags?.join(', ')}</p>
                    <div className="lp-article-foot">
                      <span className="lp-article-time">📖 {a.readTime} min read • 👁 {a.views} views</span>
                      <button className="lp-read-btn">Read →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Activities */}
        {activeTab === 'activities' && (
          <>
            {activeCategory && (
              <div style={{marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px'}}>
                <button className="lp-back" onClick={() => setActiveCategory(null)}>← All Categories</button>
                <span style={{fontWeight:700, color:'#F59E0B'}}>{CATEGORIES.find(c => c.id === activeCategory)?.title}</span>
              </div>
            )}
            <h2 className="lp-section-title">Fun Activities by Age ({filteredActivities.length})</h2>
            {filteredActivities.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', color:'#888'}}>
                <p>No activities found in this category.</p>
              </div>
            ) : (
              <div className="lp-activities">
                {filteredActivities.map(a => {
                  const isSaved = savedActivities.includes(a._id);
                  return (
                    <div key={a._id} className="lp-activity">
                      <div className="lp-activity-header">
                        <div className="lp-activity-icon">{a.icon}</div>
                        <div>
                          <h3 className="lp-activity-title">{a.title}</h3>
                          <div className="lp-activity-meta">
                            <span className="lp-activity-badge age">{a.ageRangeMin}-{a.ageRangeMax} mo</span>
                            <span className="lp-activity-badge diff">{a.difficulty}</span>
                            <span className="lp-activity-badge">{a.category}</span>
                          </div>
                        </div>
                      </div>
                      <p className="lp-activity-desc">{a.description}</p>
                      <div className="lp-activity-section">
                        <div className="lp-activity-section-title">What You'll Need</div>
                        <div className="lp-activity-items">{a.materials?.map((item, i) => <span key={i} className="lp-activity-item">{item}</span>)}</div>
                      </div>
                      <div className="lp-activity-section">
                        <div className="lp-activity-section-title">Benefits</div>
                        <div className="lp-activity-benefits">{a.benefits?.map((b, i) => <span key={i} className="lp-activity-benefit">{b}</span>)}</div>
                      </div>
                      <button className={`lp-activity-btn ${isSaved ? 'saved' : ''}`} onClick={() => handleSaveActivity(a._id)}>
                        {isSaved ? '✓ Saved' : '💾 Save Activity'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Food/Recipes */}
        {activeTab === 'food' && (
          <>
            {activeCategory && (
              <div style={{marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px'}}>
                <button className="lp-back" onClick={() => setActiveCategory(null)}>← All Categories</button>
                <span style={{fontWeight:700, color:'#34D399'}}>{CATEGORIES.find(c => c.id === activeCategory)?.title}</span>
              </div>
            )}
            <h2 className="lp-section-title">Kid-Friendly Recipes ({filteredRecipes.length})</h2>
            {filteredRecipes.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', color:'#888'}}>
                <p>No recipes found in this category.</p>
              </div>
            ) : (
              <div className="lp-food">
                {filteredRecipes.map(f => {
                  const isSaved = savedRecipes.includes(f._id);
                  return (
                    <div key={f._id} className="lp-food-card">
                      <div className="lp-food-header">
                        <div className="lp-food-icon">{f.icon}</div>
                        <div>
                          <h3 className="lp-food-title">{f.title}</h3>
                          <div className="lp-food-items">
                            <span className="lp-food-tag">{f.category}</span>
                            <span className="lp-food-age">{f.ageGroup}</span>
                            <span className="lp-food-time">⏱ {f.prepTime + f.cookTime} min</span>
                          </div>
                        </div>
                      </div>
                      <p className="lp-food-desc">{f.description}</p>
                      <div className="lp-food-items">
                        {f.tags?.map((tag, i) => <span key={i} className="lp-food-tag">{tag}</span>)}
                      </div>
                      <button className={`lp-food-btn ${isSaved ? 'saved' : ''}`} onClick={() => handleSaveRecipe(f._id)}>
                        {isSaved ? '✓ Saved' : '💾 Save Recipe'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Article Modal */}
      {showArticle && (
        <div className="lp-modal-overlay" onClick={() => setShowArticle(null)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <button className="lp-modal-close" onClick={() => setShowArticle(null)}>✕</button>
            <div className="lp-modal-icon">{showArticle.icon}</div>
            <h2 className="lp-modal-title">{showArticle.title}</h2>
            <p className="lp-modal-meta">📖 {showArticle.readTime} min read • 👁 {showArticle.views} views • +5 XP</p>
            <div className="lp-modal-body" dangerouslySetInnerHTML={{ __html: showArticle.content || '<p>Full article coming soon...</p>' }} />
            
            {/* Comments Section */}
            <div className="lp-comments">
              <h4 className="lp-comments-title">Comments ({articleComments.length})</h4>
              {articleComments.map((comment, i) => (
                <div key={comment._id || i} className="lp-comment">
                  <div className="lp-comment-avatar">{comment.userName?.[0] || '?'}</div>
                  <div className="lp-comment-content">
                    <div className="lp-comment-name">{comment.userName}</div>
                    <div className="lp-comment-text">{comment.text}</div>
                    <div className="lp-comment-time">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</div>
                  </div>
                </div>
              ))}
              {isAuthenticated && (
                <div className="lp-comment-input">
                  <input type="text" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                  <button onClick={handleAddComment}>Post</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Toast */}
      {newAchievement && (
        <div className="lp-achievement-toast">
          <span className="lp-achievement-toast-icon">{newAchievement.icon}</span>
          <div>
            <div className="lp-achievement-toast-title">Achievement Unlocked!</div>
            <div className="lp-achievement-toast-text">{newAchievement.title}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learning;
