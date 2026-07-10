import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, twoFAAPI } from '../services/api';

/* ─────────────────────────────────────────────
   CSS Injector
───────────────────────────────────────────── */
const injectCSS = () => {
  if (document.getElementById('profile-edit-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-edit-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .pe-root {
      font-family: 'Quicksand', sans-serif;
      background: #F8FAFF;
      min-height: 100vh;
      color: #0F172A;
    }

    /* ── Hero ── */
    .pe-hero {
      background: linear-gradient(135deg, #F59E0B 0%, #EF4444 60%, #EC4899 100%);
      padding: 64px 48px 80px;
      position: relative; overflow: hidden;
    }
    .pe-hero::before {
      content:''; position:absolute; top:-80px; right:-80px;
      width:280px; height:280px; border-radius:50%;
      background:rgba(255,255,255,0.08);
      animation: peBlob 10s ease-in-out infinite;
    }
    .pe-hero::after {
      content:''; position:absolute; bottom:-60px; left:-40px;
      width:200px; height:200px; border-radius:50%;
      background:rgba(255,255,255,0.06);
      animation: peBlob 13s ease-in-out infinite reverse;
    }
    @keyframes peBlob {
      0%,100% { transform:translate(0,0) scale(1); }
      50%      { transform:translate(20px,-20px) scale(1.08); }
    }
    .pe-back-btn {
      position: absolute; top: 20px; left: 24px; z-index: 2;
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      color: white; font-size: 0.9rem; font-weight: 700;
      padding: 8px 18px; border-radius: 999px;
      border: 1.5px solid rgba(255,255,255,0.3);
      cursor: pointer; transition: all 0.2s;
      font-family: 'Quicksand', sans-serif;
    }
    .pe-back-btn:hover {
      background: rgba(255,255,255,0.35);
      transform: translateX(-3px);
    }
    .pe-hero-inner {
      max-width: 900px; margin: 0 auto;
      position: relative; z-index: 1;
      display: flex; align-items: center; gap: 28px;
    }
    .pe-avatar-wrap { position: relative; flex-shrink: 0; }
    .pe-avatar {
      width: 100px; height: 100px; border-radius: 28px;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 3.5rem;
      border: 3px solid rgba(255,255,255,0.4);
      cursor: pointer;
      transition: all 0.2s;
      position: relative; overflow: hidden;
    }
    .pe-avatar:hover { transform: scale(1.05); }
    .pe-avatar-edit {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; opacity: 0;
      transition: opacity 0.2s;
      border-radius: 28px;
    }
    .pe-avatar:hover .pe-avatar-edit { opacity: 1; }
    .pe-avatar-badge {
      position: absolute; bottom: -6px; right: -6px;
      width: 26px; height: 26px; border-radius: 50%;
      background: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .pe-hero-text h1 {
      font-family: 'Baloo 2', cursive;
      font-size: 2rem; font-weight: 800; color: white;
      margin-bottom: 4px;
    }
    .pe-hero-text p { color: rgba(255,255,255,0.8); font-size: 0.9rem; }
    .pe-role-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.2);
      color: white; font-size: 0.8rem; font-weight: 700;
      padding: 4px 14px; border-radius: 999px; margin-top: 8px;
    }

    /* ── Tabs ── */
    .pe-tabs {
      background: white;
      border-bottom: 1px solid #E2E8F0;
      padding: 0 48px;
      display: flex; gap: 0;
      position: sticky; top: 0; z-index: 50;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }
    .pe-tab {
      padding: 18px 24px;
      font-weight: 700; font-size: 0.88rem;
      color: #94A3B8; border: none; background: none;
      cursor: pointer; border-bottom: 3px solid transparent;
      transition: all 0.2s; display: flex; align-items: center; gap: 8px;
      font-family: 'Quicksand', sans-serif;
    }
    .pe-tab:hover { color: #F59E0B; }
    .pe-tab.active { color: #F59E0B; border-bottom-color: #F59E0B; }

    /* ── Body ── */
    .pe-body {
      max-width: 900px; margin: 0 auto;
      padding: 36px 24px 60px;
      display: grid; grid-template-columns: 1fr 300px; gap: 24px;
    }

    /* ── Section Card ── */
    .pe-card {
      background: white; border-radius: 22px;
      padding: 28px; margin-bottom: 20px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
      animation: peSlide 0.35s ease;
    }
    @keyframes peSlide {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .pe-section-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.05rem; font-weight: 800;
      color: #0F172A; margin-bottom: 22px;
      display: flex; align-items: center; gap: 10px;
      padding-bottom: 14px;
      border-bottom: 2px solid #F1F5F9;
    }

    /* ── Form Fields ── */
    .pe-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .pe-grid-1 { display: grid; grid-template-columns: 1fr; gap: 16px; }

    .pe-field { display: flex; flex-direction: column; gap: 7px; }
    .pe-label {
      font-size: 0.8rem; font-weight: 800;
      color: #475569; text-transform: uppercase; letter-spacing: 0.4px;
    }
    .pe-input, .pe-select, .pe-textarea {
      padding: 12px 16px;
      border: 2px solid #E2E8F0; border-radius: 12px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.92rem; font-weight: 600; color: #0F172A;
      background: #F8FAFC; outline: none;
      transition: all 0.2s;
    }
    .pe-input:focus, .pe-select:focus, .pe-textarea:focus {
      border-color: #F59E0B; background: white;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.1);
    }
    .pe-textarea { resize: none; }
    .pe-input.changed { border-color: #34D399; background: #F0FDF4; }

    /* ── Tag Input ── */
    .pe-tag-wrap {
      display: flex; flex-wrap: wrap; gap: 8px;
      padding: 10px; border: 2px solid #E2E8F0;
      border-radius: 12px; background: #F8FAFC;
      min-height: 48px; cursor: text;
      transition: all 0.2s;
    }
    .pe-tag-wrap:focus-within { border-color: #F59E0B; background: white; }
    .pe-tag {
      display: flex; align-items: center; gap: 6px;
      background: #FEF3C7; color: #92400E;
      padding: 4px 12px; border-radius: 999px;
      font-size: 0.8rem; font-weight: 700;
    }
    .pe-tag-remove {
      cursor: pointer; font-size: 0.75rem; opacity: 0.6;
      transition: opacity 0.2s;
    }
    .pe-tag-remove:hover { opacity: 1; }
    .pe-tag-input {
      border: none; outline: none; background: none;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.88rem; font-weight: 600;
      color: #0F172A; min-width: 100px; flex: 1;
    }

    /* ── Avatar Picker ── */
    .avatar-grid {
      display: grid; grid-template-columns: repeat(6,1fr); gap: 10px;
    }
    .avatar-opt {
      aspect-ratio: 1; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
      background: #F8FAFC;
    }
    .avatar-opt:hover { transform: scale(1.1); border-color: #F59E0B; }
    .avatar-opt.selected { border-color: #F59E0B; background: #FEF3C7; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); }

    /* ── Password Section ── */
    .pw-field { position: relative; }
    .pw-toggle {
      position: absolute; right: 14px; top: 50%;
      transform: translateY(-50%);
      cursor: pointer; font-size: 1rem;
      background: none; border: none; color: #94A3B8;
    }

    /* ── Sidebar ── */
    .pe-sidebar { display: flex; flex-direction: column; gap: 20px; }

    .pe-profile-preview {
      background: white; border-radius: 22px;
      padding: 24px; text-align: center;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
      position: sticky; top: 80px;
    }
    .ppp-avatar {
      width: 80px; height: 80px; border-radius: 22px;
      display: flex; align-items: center; justify-content: center;
      font-size: 2.8rem; margin: 0 auto 14px;
    }
    .ppp-name {
      font-family: 'Baloo 2', cursive;
      font-size: 1.2rem; font-weight: 800; margin-bottom: 4px;
    }
    .ppp-role { font-size: 0.8rem; color: #F59E0B; font-weight: 700; margin-bottom: 16px; }
    .ppp-divider { height: 1px; background: #F1F5F9; margin: 14px 0; }
    .ppp-stat { display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 8px; }
    .ppp-stat-label { color: #94A3B8; font-weight: 600; }
    .ppp-stat-val { font-weight: 800; color: #0F172A; }

    .pe-tips-card {
      background: linear-gradient(135deg, #FEF3C7, #FFF7ED);
      border-radius: 22px; padding: 22px;
      border: 1.5px solid #FDE68A;
    }
    .pe-tips-title {
      font-family: 'Baloo 2', cursive;
      font-size: 0.95rem; font-weight: 800; color: #92400E;
      margin-bottom: 12px;
    }
    .pe-tip { font-size: 0.8rem; color: #78350F; margin-bottom: 8px; display: flex; gap: 8px; }

    /* ── Save Bar ── */
    .pe-save-bar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
      background: white;
      border-top: 1px solid #E2E8F0;
      padding: 16px 48px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 -8px 24px rgba(0,0,0,0.08);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    .pe-save-info { font-size: 0.88rem; color: #64748B; font-weight: 600; }
    .pe-save-info strong { color: #F59E0B; }
    .pe-save-btns { display: flex; gap: 12px; }
    .pe-btn-cancel {
      padding: 11px 24px; border-radius: 12px;
      border: 2px solid #E2E8F0; background: white;
      font-family: 'Quicksand',sans-serif; font-size:0.9rem; font-weight:700;
      color: #64748B; cursor: pointer; transition: all 0.2s;
    }
    .pe-btn-cancel:hover { border-color: #EF4444; color: #EF4444; }
    .pe-btn-save {
      padding: 11px 28px; border-radius: 12px;
      background: linear-gradient(135deg, #F59E0B, #EF4444);
      color: white; border: none;
      font-family: 'Quicksand',sans-serif; font-size:0.9rem; font-weight:800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(245,158,11,0.4);
      transition: all 0.25s;
    }
    .pe-btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.5); }

    /* ── Toast ── */
    .pe-toast {
      position: fixed; top: 24px; right: 24px; z-index: 999;
      background: #0F172A; color: white;
      padding: 14px 22px; border-radius: 14px;
      font-weight: 700; font-size: 0.9rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex; align-items: center; gap: 10px;
      animation: peSlide 0.3s ease;
    }

    /* ── Danger Zone ── */
    .danger-zone {
      background: #FFF1F2; border: 1.5px solid #FECDD3;
      border-radius: 16px; padding: 20px;
    }
    .danger-zone h4 {
      font-family: 'Baloo 2', cursive; font-size:1rem; font-weight:800;
      color:#E11D48; margin-bottom:8px;
    }
    .danger-zone p { font-size:0.82rem; color:#64748B; margin-bottom:14px; }
    .danger-btn {
      padding: 10px 20px; border-radius: 10px;
      border: 2px solid #FECDD3; background: white;
      color: #E11D48; font-family:'Quicksand',sans-serif;
      font-size:0.85rem; font-weight:700;
      cursor:pointer; transition:all 0.2s;
    }
    .danger-btn:hover { background:#E11D48; color:white; border-color:#E11D48; }

    @media (max-width: 768px) {
      .pe-body { grid-template-columns: 1fr; }
      .pe-hero { padding: 48px 24px 64px; }
      .pe-hero h1 { font-size:1.6rem; }
      .pe-tabs { padding: 0 16px; overflow-x: auto; }
      .pe-grid-2 { grid-template-columns: 1fr; }
      .pe-save-bar { padding: 14px 20px; }
      .avatar-grid { grid-template-columns: repeat(5,1fr); }
    }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const AVATARS = ['👩','👨','👩‍🦱','👩‍🦳','👨‍🦱','👨‍🦳','👩‍🏫','👨‍🏫','👩‍⚕️','👨‍⚕️','🧑','👧','👦','🧒','👶','🌟','🌈','🎀','🦋','🌸','🍀','🎉','🌻','🐣'];
const CITIES = ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Mumbai','Delhi','Bangalore','Pune','Chennai'];
const LANGUAGES = ['English','Hindi','Gujarati','Marathi','Tamil','Telugu','Kannada','Bengali'];
const EXPERIENCE_YEARS = ['Less than 1 year','1-2 years','3-5 years','5-8 years','8-10 years','10+ years'];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function ProfileEdit() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  // Load user from localStorage
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = savedUser.role || 'parent';

  const [activeTab, setActiveTab] = useState('personal');
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPw, setShowPw] = useState({ curr:false, new:false, conf:false });

  // Helper to get avatar display (image or emoji)
  const getAvatarDisplay = (avatar) => {
    if (!avatar || typeof avatar !== 'string') return '👩';
    if (avatar.startsWith('/uploads/') || avatar.startsWith('http')) return null;
    return avatar;
  };

  const getPhotoUrl = (photo) => {
    if (!photo || typeof photo !== 'string') return null;
    if (photo.startsWith('/uploads/') || photo.startsWith('http')) {
      return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
    }
    return null;
  };

  const hasAvatarImage = savedUser?.avatar && typeof savedUser.avatar === 'string' && (savedUser.avatar.startsWith('/uploads/') || savedUser.avatar.startsWith('http'));
  const avatarImageUrl = hasAvatarImage 
    ? (savedUser.avatar.startsWith('http') ? savedUser.avatar : `http://localhost:5000${savedUser.avatar}`)
    : null;

  // Personal info
  const [form, setForm] = useState({
    avatar:    savedUser.avatar    || '👩',
    firstName: savedUser.firstName || savedUser.name?.split(' ')[0] || '',
    lastName:  savedUser.lastName  || savedUser.name?.split(' ')[1] || '',
    email:     savedUser.email     || '',
    phone:     savedUser.phone     || '',
    city:      savedUser.city      || 'Ahmedabad',
    address:   savedUser.address   || '',
    bio:       savedUser.bio       || '',
    language:  savedUser.language  || 'English',
    // Caretaker specific
    experience:    savedUser.experience    || '1-2 years',
    specialization:savedUser.specialization|| '',
    certifications:savedUser.certifications|| '',
    availability:  savedUser.availability  || 'Full-time',
    hourlyRate:    savedUser.hourlyRate    || '',
    // Parent specific
    childrenCount: savedUser.childrenCount || '1',
    emergencyName: savedUser.emergencyName || '',
    emergencyPhone:savedUser.emergencyPhone|| '',
  });

  // Photo files state
  const [photoFiles, setPhotoFiles] = useState({
    avatar: null,
    parentPhoto: null,
    fatherPhoto: null,
  });

  // Tags/skills for caretaker
  const [skills, setSkills] = useState(savedUser.skills || ['Child Safety', 'First Aid']);
  const [skillInput, setSkillInput] = useState('');

  // Password
  const [pw, setPw] = useState({ curr:'', new:'', conf:'' });

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [otpCode, setOtpCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');

  useEffect(() => { injectCSS(); }, []);

  // Fetch 2FA status
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const res = await twoFAAPI.getStatus();
        setIs2FAEnabled(res.is2FAEnabled);
      } catch (error) {
        console.log('2FA status check failed');
      }
    };
    fetch2FAStatus();
  }, []);

  // File input refs
  const avatarInputRef = useRef(null);
  const parentPhotoInputRef = useRef(null);
  const fatherPhotoInputRef = useRef(null);

  const handlePhotoChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFiles(prev => ({ ...prev, [field]: file }));
      setHasChanges(true);
    }
  };

  const update = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setHasChanges(true);
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      setSkills(s => [...s, skillInput.trim()]);
      setSkillInput('');
      setHasChanges(true);
    }
  };

  const removeSkill = (i) => {
    setSkills(s => s.filter((_,idx) => idx !== i));
    setHasChanges(true);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveProfile = async () => {
    try {
      const profileData = {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        address: form.address,
        bio: form.bio,
        language: form.language,
        city: form.city,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : 0,
        specialization: form.specialization,
        certifications: form.certifications,
        availability: form.availability,
        experience: form.experience,
        skills: skills,
        childrenCount: form.childrenCount ? Number(form.childrenCount) : 0,
        emergencyName: form.emergencyName,
        emergencyPhone: form.emergencyPhone,
      };

      // Add file uploads if selected
      if (photoFiles.avatar) profileData.avatar = photoFiles.avatar;
      if (photoFiles.parentPhoto) profileData.parentPhoto = photoFiles.parentPhoto;
      if (photoFiles.fatherPhoto) profileData.fatherPhoto = photoFiles.fatherPhoto;

      // Use AuthContext updateUser to update profile and user state
      await updateUser(profileData);
      
      // Clear photo files after successful upload
      setPhotoFiles({ avatar: null, parentPhoto: null, fatherPhoto: null });
      
      setHasChanges(false);
      showToast('✅ Profile updated successfully!');
    } catch (error) {
      showToast('❌ ' + (error.message || 'Failed to save profile'));
    }
  };

  const savePassword = async () => {
    if (!pw.curr) { showToast('❌ Enter your current password'); return; }
    if (pw.new.length < 6) { showToast('❌ New password must be at least 6 characters'); return; }
    if (pw.new !== pw.conf) { showToast('❌ Passwords do not match'); return; }
    
    try {
      await authAPI.changePassword({ currentPassword: pw.curr, newPassword: pw.new });
      showToast('✅ Password updated successfully!');
      setPw({ curr:'', new:'', conf:'' });
    } catch (error) {
      showToast('❌ ' + (error.message || 'Failed to update password'));
    }
  };

  // 2FA Functions
  const setup2FA = async () => {
    try {
      const res = await twoFAAPI.setup();
      setQrCode(res.qrCode);
      setBackupCodes(res.backupCodes);
      setShow2FASetup(true);
      showToast('📱 Scan QR code with your authenticator app');
    } catch (error) {
      showToast('❌ Failed to setup 2FA');
    }
  };

  const enable2FA = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast('❌ Enter valid 6-digit OTP');
      return;
    }
    try {
      const res = await twoFAAPI.enable(otpCode);
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setBackupCodes(res.backupCodes);
      setOtpCode('');
      showToast('✅ 2FA enabled successfully!');
    } catch (error) {
      showToast('❌ ' + (error.message || 'Invalid OTP'));
    }
  };

  const disable2FA = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast('❌ Enter valid 6-digit OTP');
      return;
    }
    if (!disablePassword) {
      showToast('❌ Enter your password');
      return;
    }
    try {
      await twoFAAPI.disable(otpCode, disablePassword);
      setIs2FAEnabled(false);
      setOtpCode('');
      setDisablePassword('');
      showToast('✅ 2FA disabled');
    } catch (error) {
      showToast('❌ ' + (error.message || 'Failed to disable 2FA'));
    }
  };

  const tabs = [
    { id:'personal',  label:'Personal Info',  icon:'👤' },
    { id:'profile',   label:'Profile Details', icon:'📋' },
    { id:'security',  label:'Security',        icon:'🔐' },
    ...(role === 'caretaker' ? [{ id:'work', label:'Work Info', icon:'💼' }] : []),
    { id:'danger',    label:'Account',         icon:'⚙️' },
  ];

  return (
    <div className="pe-root">

      {/* Toast */}
      {toast && <div className="pe-toast">{toast}</div>}

      {/* Hidden File Inputs */}
      <input type="file" ref={avatarInputRef} accept="image/*" style={{ display:'none' }} onChange={(e) => handlePhotoChange('avatar', e)} />
      <input type="file" ref={parentPhotoInputRef} accept="image/*" style={{ display:'none' }} onChange={(e) => handlePhotoChange('parentPhoto', e)} />
      <input type="file" ref={fatherPhotoInputRef} accept="image/*" style={{ display:'none' }} onChange={(e) => handlePhotoChange('fatherPhoto', e)} />

      {/* Hero */}
      <div className="pe-hero">
        <button className="pe-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="pe-hero-inner">
          <div className="pe-avatar-wrap">
            <div className="pe-avatar" onClick={() => avatarInputRef.current?.click()}>
              {photoFiles.avatar instanceof File ? (
                <img src={URL.createObjectURL(photoFiles.avatar)} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'28px' }} />
              ) : avatarImageUrl ? (
                <img src={avatarImageUrl} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'28px' }} />
              ) : (
                <span style={{ fontSize:'3.5rem' }}>{form.avatar}</span>
              )}
              <div className="pe-avatar-edit">📷</div>
            </div>
            <div className="pe-avatar-badge" onClick={() => avatarInputRef.current?.click()} style={{ cursor:'pointer' }}>📷</div>
          </div>
          <div className="pe-hero-text">
            <h1>{form.firstName || 'Your'} {form.lastName || 'Profile'}</h1>
            <p>{form.email || 'No email set'}</p>
            <div className="pe-role-badge">
              {role === 'parent' ? '👨‍👩‍👧 Parent' : role === 'caretaker' ? '👩‍🍼 Caretaker' : '🔐 Admin'}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload Hint */}
      <div style={{ background:'#F0F9FF', padding:'12px 48px', borderBottom:'1px solid #E2E8F0', textAlign:'center' }}>
        <span style={{ fontSize:'0.85rem', color:'#0288D1', fontWeight:600 }}>
          💡 Click on your profile photo to upload a new photo
        </span>
      </div>

      {/* Tabs */}
      <div className="pe-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`pe-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Body */}
      <div className="pe-body">
        <div>

          {/* ── PERSONAL INFO ── */}
          {activeTab === 'personal' && (
            <>
              <div className="pe-card">
                <div className="pe-section-title">👤 Basic Information</div>
                <div className="pe-grid-2" style={{ marginBottom:16 }}>
                  <div className="pe-field">
                    <label className="pe-label">First Name</label>
                    <input className="pe-input" value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="First name" />
                  </div>
                  <div className="pe-field">
                    <label className="pe-label">Last Name</label>
                    <input className="pe-input" value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Last name" />
                  </div>
                </div>
                <div className="pe-grid-2" style={{ marginBottom:16 }}>
                  <div className="pe-field">
                    <label className="pe-label">Email Address</label>
                    <input className="pe-input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div className="pe-field">
                    <label className="pe-label">Phone Number</label>
                    <input className="pe-input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="pe-grid-2">
                  <div className="pe-field">
                    <label className="pe-label">City</label>
                    <select className="pe-select" value={form.city} onChange={e => update('city', e.target.value)}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pe-field">
                    <label className="pe-label">Preferred Language</label>
                    <select className="pe-select" value={form.language} onChange={e => update('language', e.target.value)}>
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pe-card">
                <div className="pe-section-title">🏠 Address</div>
                <div className="pe-field">
                  <label className="pe-label">Full Address</label>
                  <textarea className="pe-textarea" rows={3} value={form.address} onChange={e => update('address', e.target.value)} placeholder="House no, Street, Area, City, PIN..." />
                </div>
              </div>

              {role === 'parent' && (
                <div className="pe-card">
                  <div className="pe-section-title">🚨 Emergency Contact</div>
                  <div className="pe-grid-2">
                    <div className="pe-field">
                      <label className="pe-label">Contact Name</label>
                      <input className="pe-input" value={form.emergencyName} onChange={e => update('emergencyName', e.target.value)} placeholder="Emergency contact name" />
                    </div>
                    <div className="pe-field">
                      <label className="pe-label">Contact Phone</label>
                      <input className="pe-input" value={form.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── PROFILE DETAILS ── */}
          {activeTab === 'profile' && (
            <>
              <div className="pe-card">
                <div className="pe-section-title">📝 About You</div>
                <div className="pe-field">
                  <label className="pe-label">Bio / About</label>
                  <textarea className="pe-textarea" rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell families a bit about yourself — your background, personality, and why you love childcare..." />
                </div>
              </div>

              {role === 'caretaker' && (
                <div className="pe-card">
                  <div className="pe-section-title">🎯 Skills & Expertise</div>
                  <div className="pe-field" style={{ marginBottom:0 }}>
                    <label className="pe-label">Skills (press Enter to add)</label>
                    <div className="pe-tag-wrap">
                      {skills.map((s, i) => (
                        <div className="pe-tag" key={i}>
                          {s}
                          <span className="pe-tag-remove" onClick={() => removeSkill(i)}>✕</span>
                        </div>
                      ))}
                      <input
                        className="pe-tag-input"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="Type a skill and press Enter..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'parent' && (
                <div className="pe-card">
                  <div className="pe-section-title">👶 Children Info</div>
                  <div className="pe-field">
                    <label className="pe-label">Number of Children</label>
                    <select className="pe-select" value={form.childrenCount} onChange={e => update('childrenCount', e.target.value)}>
                      {['1','2','3','4','5+'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Parent Photos Section - for parents only */}
              {role === 'parent' && (
                <div className="pe-card">
                  <div className="pe-section-title">📸 Family Photos</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                    <div style={{ textAlign:'center' }}>
                      <label style={{ fontSize:'0.85rem', fontWeight:700, color:'#475569', marginBottom:'10px', display:'block' }}>👩 Mother's Photo</label>
                      <div 
                        onClick={() => parentPhotoInputRef.current?.click()}
                        style={{ 
                          width:'120px', height:'120px', borderRadius:'50%', 
                          background: savedUser?.parentPhoto || photoFiles.parentPhoto instanceof File ? 'transparent' : 'linear-gradient(135deg,#FCE7F3,#FBCFE8)',
                          border:'3px dashed #E879F9', cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          margin:'0 auto', overflow:'hidden',
                          transition:'all 0.2s'
                        }}
                      >
                        {photoFiles.parentPhoto instanceof File ? (
                          <img src={URL.createObjectURL(photoFiles.parentPhoto)} alt="Mother" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : savedUser?.parentPhoto ? (
                          <img src={getPhotoUrl(savedUser.parentPhoto)} alt="Mother" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                          <span style={{ fontSize:'2.5rem' }}>👩</span>
                        )}
                      </div>
                      <p style={{ fontSize:'0.75rem', color:'#94A3B8', marginTop:'8px' }}>Click to upload</p>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <label style={{ fontSize:'0.85rem', fontWeight:700, color:'#475569', marginBottom:'10px', display:'block' }}>👨 Father's Photo</label>
                      <div 
                        onClick={() => fatherPhotoInputRef.current?.click()}
                        style={{ 
                          width:'120px', height:'120px', borderRadius:'50%', 
                          background: savedUser?.fatherPhoto || photoFiles.fatherPhoto instanceof File ? 'transparent' : 'linear-gradient(135deg,#DBEAFE,#BFDBFE)',
                          border:'3px dashed #3B82F6', cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          margin:'0 auto', overflow:'hidden',
                          transition:'all 0.2s'
                        }}
                      >
                        {photoFiles.fatherPhoto instanceof File ? (
                          <img src={URL.createObjectURL(photoFiles.fatherPhoto)} alt="Father" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : savedUser?.fatherPhoto ? (
                          <img src={getPhotoUrl(savedUser.fatherPhoto)} alt="Father" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                          <span style={{ fontSize:'2.5rem' }}>👨</span>
                        )}
                      </div>
                      <p style={{ fontSize:'0.75rem', color:'#94A3B8', marginTop:'8px' }}>Click to upload</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── WORK INFO (Caretaker only) ── */}
          {activeTab === 'work' && role === 'caretaker' && (
            <>
              <div className="pe-card">
                <div className="pe-section-title">💼 Professional Details</div>
                <div className="pe-grid-2" style={{ marginBottom:16 }}>
                  <div className="pe-field">
                    <label className="pe-label">Years of Experience</label>
                    <select className="pe-select" value={form.experience} onChange={e => update('experience', e.target.value)}>
                      {EXPERIENCE_YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="pe-field">
                    <label className="pe-label">Hourly Rate (₹)</label>
                    <input className="pe-input" type="number" value={form.hourlyRate} onChange={e => update('hourlyRate', e.target.value)} placeholder="e.g. 350" />
                  </div>
                </div>
                <div className="pe-grid-2" style={{ marginBottom:16 }}>
                  <div className="pe-field">
                    <label className="pe-label">Specialization</label>
                    <input className="pe-input" value={form.specialization} onChange={e => update('specialization', e.target.value)} placeholder="e.g. Infant Care, Toddlers..." />
                  </div>
                  <div className="pe-field">
                    <label className="pe-label">Availability</label>
                    <select className="pe-select" value={form.availability} onChange={e => update('availability', e.target.value)}>
                      {['Full-time','Part-time','Weekends Only','Flexible'].map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pe-field">
                  <label className="pe-label">Certifications / Qualifications</label>
                  <textarea className="pe-textarea" rows={3} value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="e.g. CPR Certified, Early Childhood Diploma, First Aid Training..." />
                </div>
              </div>
            </>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div className="pe-card">
              <div className="pe-section-title">🔐 Change Password</div>
              <div className="pe-grid-1">
                <div className="pe-field">
                  <label className="pe-label">Current Password</label>
                  <div className="pw-field">
                    <input
                      className="pe-input"
                      type={showPw.curr ? 'text' : 'password'}
                      value={pw.curr} onChange={e => setPw(p => ({ ...p, curr:e.target.value }))}
                      placeholder="Enter current password"
                      style={{ paddingRight:44 }}
                    />
                    <button className="pw-toggle" onClick={() => setShowPw(p => ({ ...p, curr:!p.curr }))}>
                      {showPw.curr ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="pe-field">
                  <label className="pe-label">New Password</label>
                  <div className="pw-field">
                    <input
                      className="pe-input"
                      type={showPw.new ? 'text' : 'password'}
                      value={pw.new} onChange={e => setPw(p => ({ ...p, new:e.target.value }))}
                      placeholder="Min. 6 characters"
                      style={{ paddingRight:44 }}
                    />
                    <button className="pw-toggle" onClick={() => setShowPw(p => ({ ...p, new:!p.new }))}>
                      {showPw.new ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {pw.new && (
                    <div style={{ marginTop:6, fontSize:'0.78rem', fontWeight:700,
                      color: pw.new.length >= 6 ? '#059669' : '#EF4444' }}>
                      {pw.new.length >= 6 ? '✅ Strong enough' : '❌ Too short'}
                    </div>
                  )}
                </div>
                <div className="pe-field">
                  <label className="pe-label">Confirm New Password</label>
                  <div className="pw-field">
                    <input
                      className="pe-input"
                      type={showPw.conf ? 'text' : 'password'}
                      value={pw.conf} onChange={e => setPw(p => ({ ...p, conf:e.target.value }))}
                      placeholder="Re-enter new password"
                      style={{ paddingRight:44 }}
                    />
                    <button className="pw-toggle" onClick={() => setShowPw(p => ({ ...p, conf:!p.conf }))}>
                      {showPw.conf ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {pw.conf && (
                    <div style={{ marginTop:6, fontSize:'0.78rem', fontWeight:700,
                      color: pw.new === pw.conf ? '#059669' : '#EF4444' }}>
                      {pw.new === pw.conf ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={savePassword}
                style={{
                  marginTop:20, padding:'12px 28px', borderRadius:12,
                  background:'linear-gradient(135deg,#F59E0B,#EF4444)',
                  color:'white', border:'none',
                  fontFamily:'Quicksand,sans-serif', fontWeight:800, fontSize:'0.95rem',
                  cursor:'pointer',
                }}
              >🔐 Update Password</button>

              {/* 2FA Section */}
              <div style={{ marginTop:32, paddingTop:24, borderTop:'2px solid #E2E8F0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div>
                    <h3 style={{ fontFamily:'Baloo 2,cursive', fontSize:'1.1rem', color:'#0F172A', margin:0 }}>🔐 Two-Factor Authentication</h3>
                    <p style={{ fontSize:'0.82rem', color:'#64748B', margin:'4px 0 0' }}>Add extra security to your account</p>
                  </div>
                  <span style={{ 
                    padding:'6px 14px', borderRadius:20, fontSize:'0.78rem', fontWeight:800,
                    background: is2FAEnabled ? '#D1FAE5' : '#FEF3C7',
                    color: is2FAEnabled ? '#059669' : '#D97706'
                  }}>
                    {is2FAEnabled ? '✅ ENABLED' : '⚠️ DISABLED'}
                  </span>
                </div>

                {!is2FAEnabled && !show2FASetup && (
                  <button
                    onClick={setup2FA}
                    style={{
                      padding:'12px 24px', borderRadius:12,
                      background:'linear-gradient(135deg,#059669,#10B981)',
                      color:'white', border:'none',
                      fontFamily:'Quicksand,sans-serif', fontWeight:800, fontSize:'0.9rem',
                      cursor:'pointer',
                    }}
                  >🔒 Enable 2FA</button>
                )}

                {show2FASetup && (
                  <div style={{ background:'#F0FDF4', border:'2px solid #86EFAC', borderRadius:16, padding:20 }}>
                    <h4 style={{ margin:'0 0 12px', color:'#166534', fontFamily:'Baloo 2,cursive' }}>📱 Scan QR Code</h4>
                    <p style={{ fontSize:'0.82rem', color:'#64748B', margin:'0 0 16px' }}>Scan this QR code with Google Authenticator or Authy app</p>
                    
                    {qrCode && (
                      <div style={{ textAlign:'center', marginBottom:16 }}>
                        <img src={qrCode} alt="2FA QR Code" style={{ width:180, height:180, borderRadius:12 }} />
                      </div>
                    )}

                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Enter 6-digit OTP from app:</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                        placeholder="000000"
                        maxLength={6}
                        style={{
                          width:'120px', padding:'12px', borderRadius:10,
                          border:'2px solid #D1D5DB', fontSize:'1.4rem', fontWeight:800,
                          textAlign:'center', letterSpacing:'8px'
                        }}
                      />
                    </div>

                    <div style={{ display:'flex', gap:10 }}>
                      <button
                        onClick={enable2FA}
                        style={{
                          padding:'10px 20px', borderRadius:10,
                          background:'linear-gradient(135deg,#059669,#10B981)',
                          color:'white', border:'none', fontWeight:800, cursor:'pointer'
                        }}
                      >✅ Verify & Enable</button>
                      <button
                        onClick={() => { setShow2FASetup(false); setQrCode(''); setOtpCode(''); }}
                        style={{
                          padding:'10px 20px', borderRadius:10,
                          background:'white', border:'2px solid #E5E7EB', color:'#6B7280', fontWeight:800, cursor:'pointer'
                        }}
                      >Cancel</button>
                    </div>
                  </div>
                )}

                {is2FAEnabled && !show2FASetup && (
                  <div style={{ background:'#F0FDF4', border:'2px solid #86EFAC', borderRadius:16, padding:20 }}>
                    <p style={{ fontSize:'0.88rem', color:'#166534', margin:'0 0 16px' }}>
                      ✅ Two-Factor Authentication is enabled. You'll need your authenticator app to sign in.
                    </p>
                    
                    <details style={{ marginBottom:16 }}>
                      <summary style={{ cursor:'pointer', fontWeight:700, color:'#374151', fontSize:'0.88rem' }}>📋 View Backup Codes</summary>
                      <div style={{ marginTop:12, padding:12, background:'white', borderRadius:8 }}>
                        {backupCodes.length > 0 ? (
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                            {backupCodes.slice(0,5).map((code, i) => (
                              <span key={i} style={{ 
                                padding:'8px 12px', background:'#FEF3C7', borderRadius:6,
                                fontFamily:'monospace', fontSize:'0.9rem', fontWeight:800, color:'#92400E'
                              }}>{code}</span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color:'#6B7280', fontSize:'0.82rem' }}>No backup codes available</p>
                        )}
                        <p style={{ marginTop:12, fontSize:'0.75rem', color:'#92400E' }}>⚠️ Save these codes somewhere safe. Each can only be used once.</p>
                      </div>
                    </details>

                    <button
                      onClick={setup2FA}
                      style={{
                        padding:'10px 20px', borderRadius:10, marginRight:10,
                        background:'white', border:'2px solid #D1D5DB', color:'#374151', fontWeight:800, cursor:'pointer'
                      }}
                    >🔄 Reset 2FA</button>
                    
                    <button
                      onClick={() => setShow2FASetup(true)}
                      style={{
                        padding:'10px 20px', borderRadius:10,
                        background:'white', border:'2px solid #FECACA', color:'#DC2626', fontWeight:800, cursor:'pointer'
                      }}
                    >❌ Disable 2FA</button>
                  </div>
                )}

                {is2FAEnabled && show2FASetup && (
                  <div style={{ background:'#FEF2F2', border:'2px solid #FECACA', borderRadius:16, padding:20, marginTop:16 }}>
                    <h4 style={{ margin:'0 0 12px', color:'#991B1B', fontFamily:'Baloo 2,cursive' }}>❌ Disable 2FA</h4>
                    <p style={{ fontSize:'0.82rem', color:'#64748B', margin:'0 0 16px' }}>Enter OTP and password to disable 2FA</p>
                    
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
                      <div>
                        <label style={{ fontSize:'0.78rem', fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>OTP Code:</label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                          placeholder="000000"
                          maxLength={6}
                          style={{
                            width:'100px', padding:'10px', borderRadius:8,
                            border:'2px solid #D1D5DB', fontSize:'1rem', fontWeight:800,
                            textAlign:'center'
                          }}
                        />
                      </div>
                      <div style={{ flex:1 }}>
                        <label style={{ fontSize:'0.78rem', fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Your Password:</label>
                        <input
                          type="password"
                          value={disablePassword}
                          onChange={e => setDisablePassword(e.target.value)}
                          placeholder="Enter password"
                          style={{
                            width:'100%', padding:'10px', borderRadius:8,
                            border:'2px solid #D1D5DB', fontSize:'0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display:'flex', gap:10 }}>
                      <button
                        onClick={disable2FA}
                        style={{
                          padding:'10px 20px', borderRadius:10,
                          background:'linear-gradient(135deg,#DC2626,#EF4444)',
                          color:'white', border:'none', fontWeight:800, cursor:'pointer'
                        }}
                      >❌ Disable 2FA</button>
                      <button
                        onClick={() => { setShow2FASetup(false); setOtpCode(''); setDisablePassword(''); }}
                        style={{
                          padding:'10px 20px', borderRadius:10,
                          background:'white', border:'2px solid #E5E7EB', color:'#6B7280', fontWeight:800, cursor:'pointer'
                        }}
                      >Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ACCOUNT / DANGER ── */}
          {activeTab === 'danger' && (
            <div className="pe-card">
              <div className="pe-section-title">⚙️ Account Settings</div>

              <div className="danger-zone" style={{ marginBottom:20 }}>
                <h4>🚪 Log Out</h4>
                <p>You will be signed out of your account on this device.</p>
                <button className="danger-btn" onClick={() => {
                  localStorage.removeItem('user');
                  navigate('/login');
                }}>Log Out</button>
              </div>

              <div className="danger-zone">
                <h4>🗑️ Delete Account</h4>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button className="danger-btn" onClick={() => {
                  if (window.confirm('Are you sure? This will permanently delete your account.')) {
                    localStorage.clear();
                    navigate('/');
                  }
                }}>Delete My Account</button>
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR */}
        <div className="pe-sidebar">
          <div className="pe-profile-preview">
            <div className="ppp-avatar" style={{ background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', overflow:'hidden' }}>
              {avatarImageUrl ? (
                <img src={avatarImageUrl} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                form.avatar
              )}
            </div>
            <div className="ppp-name">{form.firstName || 'Your'} {form.lastName || 'Name'}</div>
            <div className="ppp-role">
              {role === 'parent' ? '👨‍👩‍👧 Parent' : role === 'caretaker' ? '👩‍🍼 Caretaker' : '🔐 Admin'}
            </div>
            <div className="ppp-divider" />
            <div className="ppp-stat"><span className="ppp-stat-label">📧 Email</span><span className="ppp-stat-val" style={{fontSize:'0.75rem',maxWidth:140,textAlign:'right',wordBreak:'break-all'}}>{form.email || '—'}</span></div>
            <div className="ppp-stat"><span className="ppp-stat-label">📱 Phone</span><span className="ppp-stat-val">{form.phone || '—'}</span></div>
            <div className="ppp-stat"><span className="ppp-stat-label">📍 City</span><span className="ppp-stat-val">{form.city}</span></div>
            {role === 'caretaker' && <div className="ppp-stat"><span className="ppp-stat-label">💰 Rate</span><span className="ppp-stat-val">{form.hourlyRate ? `₹${form.hourlyRate}/hr` : '—'}</span></div>}
            {role === 'caretaker' && <div className="ppp-stat"><span className="ppp-stat-label">⏱️ Exp</span><span className="ppp-stat-val">{form.experience}</span></div>}
          </div>

          <div className="pe-tips-card">
            <div className="pe-tips-title">💡 Profile Tips</div>
            <div className="pe-tip">✅ Add a friendly avatar to build trust</div>
            <div className="pe-tip">✅ Complete your bio for better matches</div>
            <div className="pe-tip">✅ Add an emergency contact for safety</div>
            {role === 'caretaker' && <div className="pe-tip">✅ List your certifications to stand out</div>}
            {role === 'caretaker' && <div className="pe-tip">✅ Set your correct hourly rate</div>}
          </div>
        </div>
      </div>

      {/* Save Bar */}
      {hasChanges && (
        <div className="pe-save-bar">
          <div className="pe-save-info">You have <strong>unsaved changes</strong> — don't forget to save!</div>
          <div className="pe-save-btns">
            <button className="pe-btn-cancel" onClick={() => { setHasChanges(false); window.location.reload(); }}>
              Discard
            </button>
            <button className="pe-btn-save" onClick={saveProfile}>
              💾 Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
