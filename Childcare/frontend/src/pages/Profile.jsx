// File Path: src/pages/Profile.jsx
// Description: Full Profile page connected to real backend API
// NO UI STYLE CHANGES — built from scratch using authAPI

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('profile-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .pf-root {
      font-family: 'Quicksand', sans-serif;
      background: #F0F9FF;
      min-height: 100vh;
      color: #0F172A;
    }

    /* ── Hero ── */
    .pf-hero {
      background: linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%);
      padding: 60px 48px 80px;
      position: relative;
      overflow: hidden;
      text-align: center;
    }
    .pf-hero::before {
      content: '';
      position: absolute; top: -60px; left: -60px;
      width: 260px; height: 260px; border-radius: 50%;
      background: rgba(255,255,255,0.07);
      animation: pfBlob 10s ease-in-out infinite;
    }
    .pf-hero::after {
      content: '';
      position: absolute; bottom: -50px; right: -50px;
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(255,255,255,0.05);
      animation: pfBlob 13s ease-in-out infinite reverse;
    }
    @keyframes pfBlob {
      0%,100% { transform: translate(0,0) scale(1); }
      50%      { transform: translate(20px,-20px) scale(1.08); }
    }
    .pf-avatar-wrap {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;
      z-index: 1;
    }
    .pf-avatar {
      width: 100px; height: 100px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
      border: 4px solid rgba(255,255,255,0.4);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      margin: 0 auto;
    }
    .pf-hero-name {
      font-family: 'Baloo 2', cursive;
      font-size: 1.8rem; font-weight: 800; color: white;
      margin-bottom: 6px;
      position: relative; z-index: 1;
    }
    .pf-hero-role {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: white; font-weight: 700; font-size: 0.82rem;
      padding: 4px 16px; border-radius: 999px;
      position: relative; z-index: 1;
    }
    .pf-hero-email {
      color: rgba(255,255,255,0.7);
      font-size: 0.88rem; margin-top: 8px;
      position: relative; z-index: 1;
    }

    /* ── Body ── */
    .pf-body {
      max-width: 860px; margin: -32px auto 60px;
      padding: 0 24px;
      display: flex; flex-direction: column; gap: 24px;
      position: relative; z-index: 2;
    }

    /* ── Card ── */
    .pf-card {
      background: white; border-radius: 24px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      animation: pfIn 0.4s ease;
    }
    @keyframes pfIn {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .pf-card-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.15rem; font-weight: 800;
      color: #0F172A; margin-bottom: 24px;
      display: flex; align-items: center; gap: 10px;
      border-bottom: 2px solid #F1F5F9;
      padding-bottom: 14px;
    }

    /* ── Form ── */
    .pf-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .pf-grid.full { grid-template-columns: 1fr; }
    .pf-form-group {
      display: flex; flex-direction: column; gap: 6px;
    }
    .pf-label {
      font-size: 0.82rem; font-weight: 700;
      color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .pf-input {
      padding: 12px 16px;
      border: 2px solid #E0F2FE;
      border-radius: 12px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem; font-weight: 600;
      color: #0F172A;
      background: #F8FAFC;
      outline: none;
      transition: all 0.2s;
    }
    .pf-input:focus {
      border-color: #0EA5E9;
      background: white;
      box-shadow: 0 0 0 4px rgba(14,165,233,0.1);
    }
    .pf-input:disabled {
      background: #F1F5F9;
      color: #94A3B8;
      cursor: not-allowed;
    }
    .pf-textarea {
      padding: 12px 16px;
      border: 2px solid #E0F2FE;
      border-radius: 12px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem; font-weight: 600;
      color: #0F172A;
      background: #F8FAFC;
      outline: none;
      transition: all 0.2s;
      resize: none;
      min-height: 100px;
    }
    .pf-textarea:focus {
      border-color: #0EA5E9;
      background: white;
      box-shadow: 0 0 0 4px rgba(14,165,233,0.1);
    }

    /* ── Buttons ── */
    .pf-btn-row {
      display: flex; gap: 12px; justify-content: flex-end;
      margin-top: 24px;
    }
    .pf-btn {
      padding: 12px 28px; border-radius: 14px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.95rem; font-weight: 800;
      cursor: pointer; transition: all 0.2s; border: none;
    }
    .pf-btn-primary {
      background: linear-gradient(135deg, #0EA5E9, #6366F1);
      color: white;
    }
    .pf-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14,165,233,0.35); }
    .pf-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .pf-btn-secondary {
      background: #F1F5F9; color: #64748B;
      border: 2px solid #E0F2FE;
    }
    .pf-btn-secondary:hover { background: #E0F2FE; color: #0EA5E9; }

    /* ── Password section ── */
    .pf-pwd-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;
    }

    /* ── Info row ── */
    .pf-info-row {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .pf-info-row:last-child { border-bottom: none; }
    .pf-info-icon { font-size: 1.2rem; width: 32px; text-align: center; }
    .pf-info-label { font-size: 0.8rem; color: #94A3B8; font-weight: 600; }
    .pf-info-val   { font-size: 0.95rem; font-weight: 700; color: #0F172A; }

    /* ── Toast ── */
    .pf-toast {
      position: fixed; top: 20px; right: 24px; z-index: 999;
      padding: 14px 24px; border-radius: 14px;
      font-weight: 700; font-size: 0.9rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      animation: pfPop 0.3s ease;
    }
    @keyframes pfPop {
      from { opacity:0; transform:translateY(-10px) scale(0.95); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    .pf-toast.success { background: #ECFDF5; color: #059669; border: 1.5px solid #6EE7B7; }
    .pf-toast.error   { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FCA5A5; }

    /* ── Loading ── */
    .pf-loading {
      min-height: 60vh; display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 16px;
    }
    .pf-loading-icon { font-size: 3rem; animation: bounce 1s ease-in-out infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

    @media (max-width: 768px) {
      .pf-hero { padding: 48px 24px 64px; }
      .pf-grid { grid-template-columns: 1fr; }
      .pf-pwd-grid { grid-template-columns: 1fr; }
      .pf-body { padding: 0 16px; }
    }
  `;
  document.head.appendChild(style);
};

const ROLE_EMOJI = { Parent: '👨‍👩‍👧', Caretaker: '👩‍🍼', Admin: '🔐' };

export default function Profile() {
  const navigate      = useNavigate();
  const { user, updateUser, getDashboardPath } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);

  // Edit form state
  const [form, setForm] = useState({
    fullName:      '',
    phone:         '',
    address:       '',
    bio:           '',
    specialization:'',
    hourlyRate:    '',
    childrenCount: '',
  });

  // Password form state
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    injectCSS();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getMe();
      const u   = res.user;
      setProfileData(u);
      setForm({
        fullName:       u.fullName       || '',
        phone:          u.phone          || '',
        address:        u.address        || '',
        bio:            u.bio            || '',
        specialization: u.specialization || '',
        hourlyRate:     u.hourlyRate     || '',
        childrenCount:  u.childrenCount  || '',
      });
    } catch {
      showToast('Could not load profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone:    form.phone,
        address:  form.address,
      };
      if (profileData?.role === 'Caretaker') {
        payload.bio            = form.bio;
        payload.specialization = form.specialization;
        payload.hourlyRate     = Number(form.hourlyRate) || 0;
      }
      if (profileData?.role === 'Parent') {
        payload.childrenCount = Number(form.childrenCount) || 0;
      }

      await updateUser(payload);
      showToast('✅ Profile updated successfully!');
      fetchProfile();
    } catch {
      showToast('Failed to update profile. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    setPwdSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      showToast('✅ Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pf-root">
        <div className="pf-loading">
          <div className="pf-loading-icon">👶</div>
          <p style={{ color:'#94A3B8', fontWeight:700 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  const roleEmoji = ROLE_EMOJI[profileData?.role] || '👤';

  return (
    <div className="pf-root">

      {/* Toast */}
      {toast && (
        <div className={`pf-toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* Hero */}
      <div className="pf-hero">
        <div className="pf-avatar-wrap">
          <div className="pf-avatar">{roleEmoji}</div>
        </div>
        <div className="pf-hero-name">{profileData?.fullName || user?.name}</div>
        <div className="pf-hero-role">{profileData?.role}</div>
        <div className="pf-hero-email">📧 {profileData?.email || user?.email}</div>
      </div>

      <div className="pf-body">

        {/* Account Info */}
        <div className="pf-card">
          <div className="pf-card-title">📋 Account Information</div>
          <div className="pf-info-row">
            <div className="pf-info-icon">👤</div>
            <div>
              <div className="pf-info-label">Full Name</div>
              <div className="pf-info-val">{profileData?.fullName || '—'}</div>
            </div>
          </div>
          <div className="pf-info-row">
            <div className="pf-info-icon">📧</div>
            <div>
              <div className="pf-info-label">Email</div>
              <div className="pf-info-val">{profileData?.email || '—'}</div>
            </div>
          </div>
          <div className="pf-info-row">
            <div className="pf-info-icon">🎭</div>
            <div>
              <div className="pf-info-label">Role</div>
              <div className="pf-info-val">{profileData?.role || '—'}</div>
            </div>
          </div>
          <div className="pf-info-row">
            <div className="pf-info-icon">📅</div>
            <div>
              <div className="pf-info-label">Member Since</div>
              <div className="pf-info-val">
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
                  : '—'}
              </div>
            </div>
          </div>
          {profileData?.role === 'Caretaker' && (
            <div className="pf-info-row">
              <div className="pf-info-icon">⭐</div>
              <div>
                <div className="pf-info-label">Rating</div>
                <div className="pf-info-val">
                  {profileData?.rating
                    ? `${profileData.rating} / 5 (${profileData.totalRatings} reviews)`
                    : 'No reviews yet'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile */}
        <div className="pf-card">
          <div className="pf-card-title">✏️ Edit Profile</div>
          <div className="pf-grid">
            <div className="pf-form-group">
              <label className="pf-label">Full Name</label>
              <input
                className="pf-input"
                value={form.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">Phone</label>
              <input
                className="pf-input"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="Your phone number"
              />
            </div>
            <div className="pf-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="pf-label">Address</label>
              <input
                className="pf-input"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="Your address"
              />
            </div>

            {/* Caretaker-only fields */}
            {profileData?.role === 'Caretaker' && (
              <>
                <div className="pf-form-group">
                  <label className="pf-label">Specialization</label>
                  <input
                    className="pf-input"
                    value={form.specialization}
                    onChange={e => handleChange('specialization', e.target.value)}
                    placeholder="e.g. Infant Care, Toddlers"
                  />
                </div>
                <div className="pf-form-group">
                  <label className="pf-label">Hourly Rate (₹)</label>
                  <input
                    className="pf-input"
                    type="number"
                    value={form.hourlyRate}
                    onChange={e => handleChange('hourlyRate', e.target.value)}
                    placeholder="e.g. 350"
                    min="0"
                  />
                </div>
                <div className="pf-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="pf-label">Bio</label>
                  <textarea
                    className="pf-textarea"
                    value={form.bio}
                    onChange={e => handleChange('bio', e.target.value)}
                    placeholder="Tell parents about yourself, your experience and approach..."
                  />
                </div>
              </>
            )}

            {/* Parent-only fields */}
            {profileData?.role === 'Parent' && (
              <div className="pf-form-group">
                <label className="pf-label">Number of Children</label>
                <input
                  className="pf-input"
                  type="number"
                  value={form.childrenCount}
                  onChange={e => handleChange('childrenCount', e.target.value)}
                  placeholder="e.g. 2"
                  min="0"
                />
              </div>
            )}
          </div>

          <div className="pf-btn-row">
            <button
              className="pf-btn pf-btn-secondary"
              onClick={() => navigate(getDashboardPath())}
            >
              Cancel
            </button>
            <button
              className="pf-btn pf-btn-primary"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="pf-card">
          <div className="pf-card-title">🔐 Change Password</div>
          <div className="pf-pwd-grid">
            <div className="pf-form-group">
              <label className="pf-label">Current Password</label>
              <input
                className="pf-input"
                type="password"
                value={pwdForm.currentPassword}
                onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Current password"
              />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">New Password</label>
              <input
                className="pf-input"
                type="password"
                value={pwdForm.newPassword}
                onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="New password"
              />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">Confirm New Password</label>
              <input
                className="pf-input"
                type="password"
                value={pwdForm.confirmPassword}
                onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="pf-btn-row">
            <button
              className="pf-btn pf-btn-primary"
              onClick={handleChangePassword}
              disabled={pwdSaving}
            >
              {pwdSaving ? '⏳ Updating...' : '🔐 Update Password'}
            </button>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div style={{ textAlign:'center', paddingBottom: 16 }}>
          <button
            className="pf-btn pf-btn-secondary"
            onClick={() => navigate(getDashboardPath())}
            style={{ padding:'14px 40px' }}
          >
            ← Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}