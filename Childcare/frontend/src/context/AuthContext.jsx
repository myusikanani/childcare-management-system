// File Path: src/context/AuthContext.jsx
// Description: AuthContext connected to real backend API
// NO UI CHANGES — only data layer replaced (localStorage → backend API)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading,         setLoading]         = useState(true);

  /* ── On mount: restore session from localStorage ── */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token  = localStorage.getItem('token');
        const stored = localStorage.getItem('user');

        if (token && stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setIsAuthenticated(true);

          // Silently verify token is still valid with backend
          try {
            const res = await authAPI.getMe();
            if (res?.user || res?._id) {
              const freshUser = res.user || res;
              // Don't store Map objects or other non-primitive values
              const fresh = {
                id:              freshUser._id,
                name:            freshUser.name,
                email:           freshUser.email,
                role:            freshUser.role,
                avatar:          freshUser.avatar,
                phone:          freshUser.phone,
                parentPhoto:     freshUser.parentPhoto,
                fatherPhoto:     freshUser.fatherPhoto,
                bio:             freshUser.bio,
                experience:      freshUser.experience,
                hourlyRate:      freshUser.hourlyRate,
                isVerified:      freshUser.isVerified,
              };
              setUser(fresh);
              localStorage.setItem('user', JSON.stringify(fresh));
            }
          } catch {
            // Token expired — clear session
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Session restore error:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* ══════════════════════════════════════
     LOGIN
     Accepts: { email, password, role }
     Calls real backend POST /api/auth/login
  ══════════════════════════════════════ */
  const login = async ({ email, password, role }) => {
    const res = await authAPI.login({ email, password, role });

    // Check if 2FA is required
    if (res.requires2FA || res.requires2FASetup) {
      return {
        requires2FA: res.requires2FA,
        requires2FASetup: res.requires2FASetup,
        userId: res.userId,
        message: res.message
      };
    }

    if (!res.token || !res.user) {
      throw new Error('Invalid response from server');
    }

    const userData = {
      id:              res.user._id || res.user.id,
      name:            res.user.name,
      email:           res.user.email,
      role:            res.user.role,
      phone:           res.user.phone           || '',
      avatar:          res.user.avatar          || '',
      parentPhoto:     res.user.parentPhoto     || '',
      fatherPhoto:     res.user.fatherPhoto     || '',
      bio:             res.user.bio             || '',
      experience:      res.user.experience      || 0,
      hourlyRate:      res.user.hourlyRate      || 0,
      isVerified:      res.user.isVerified      || false,
      is2FAEnabled:    res.user.is2FAEnabled    || false,
    };

    localStorage.setItem('token', res.token);
    localStorage.setItem('user',  JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);

    // Check for profile completion and show notification
    checkAndCreateNotifications(userData);

    return { success: true, user: userData };
  };

  const checkAndCreateNotifications = async (userData) => {
    const token = localStorage.getItem('token');
    const missingFields = [];
    
    if (userData.role === 'caretaker') {
      if (!userData.bio) missingFields.push('bio');
      if (!userData.experience || userData.experience === 0) missingFields.push('experience');
      if (!userData.phone) missingFields.push('phone');
    } else {
      if (!userData.phone) missingFields.push('phone');
    }

    if (missingFields.length > 0) {
      // Store in localStorage to show on dashboard
      const profileNotif = {
        type: 'profile_incomplete',
        title: '📋 Complete Your Profile',
        message: `Please add your ${missingFields.join(', ')} to get more bookings!`,
        time: new Date().toISOString(),
        link: '/profile/edit',
      };
      localStorage.setItem('showProfileNotif', JSON.stringify(profileNotif));
    }
  };

  /* ══════════════════════════════════════
     SIGNUP
  ══════════════════════════════════════ */
  const signup = async (data) => {
    // Handle avatar file upload
    if (data.avatar && data.avatar instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', data.role || 'user');
      formData.append('phone', data.phone || '');
      formData.append('address', data.address || '');
      formData.append('bio', data.bio || '');
      formData.append('experience', data.experience || 0);
      formData.append('skills', JSON.stringify(data.skills || []));
      formData.append('avatar', data.avatar);
      formData.append('adminSecret', data.adminSecret || '');

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Registration failed');

      if (!result.token || !result.user) {
        throw new Error('Invalid response from server');
      }

      const userData = {
        id:    result.user._id,
        name:  result.user.name,
        email: result.user.email,
        role:  result.user.role,
        avatar: result.user.avatar || '',
      };

      localStorage.setItem('token', result.token);
      localStorage.setItem('user',  JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    }

    // Regular signup without avatar
    const res = await authAPI.register({
      name:     data.name,
      email:    data.email,
      password: data.password,
      role:     data.role || 'user',
      phone:    data.phone || '',
      address:  data.address || '',
      bio:      data.bio || '',
      experience: data.experience || 0,
      skills:   data.skills || [],
      adminSecret: data.adminSecret || '',
    });

    if (!res.token || !res.user) {
      throw new Error('Invalid response from server');
    }

    const userData = {
      id:    res.user._id,
      name:  res.user.name,
      email: res.user.email,
      role:  res.user.role,
      avatar: res.user.avatar || '',
    };

    localStorage.setItem('token', res.token);
    localStorage.setItem('user',  JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);

    return { success: true, user: userData };
  };

  /* ══════════════════════════════════════
     LOGOUT
  ══════════════════════════════════════ */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  /* ══════════════════════════════════════
     UPDATE USER (for profile edits)
  ══════════════════════════════════════ */
  const updateUser = async (updatedData) => {
    try {
      // Call backend to persist changes
      const res = await authAPI.updateProfile(updatedData);
      // Backend returns { user: { ... } } format
      const freshUser = res.user || res;
      // Only copy primitive values to avoid storing Maps/objects
      const fresh = {
        id:              freshUser._id  || user?.id,
        name:            freshUser.name  || user?.name,
        email:           freshUser.email || user?.email,
        role:            freshUser.role  || user?.role,
        avatar:          freshUser.avatar,
        phone:          freshUser.phone,
        parentPhoto:     freshUser.parentPhoto,
        fatherPhoto:     freshUser.fatherPhoto,
        bio:             freshUser.bio,
        experience:      freshUser.experience,
        hourlyRate:      freshUser.hourlyRate,
        isVerified:      freshUser.isVerified,
      };
      localStorage.setItem('user', JSON.stringify(fresh));
      setUser(fresh);
    } catch {
      // Fallback: update locally if backend call fails
      const merged = { ...user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
    }
  };

  /* helper: get dashboard path for current user — unchanged */
  const getDashboardPath = () => {
    const paths = {
      user:       '/parent-dashboard',
      caretaker:  '/caretaker-dashboard',
      admin:      '/admin-dashboard',
    };
    return paths[user?.role] || '/';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
    getDashboardPath,
    isParent:    user?.role === 'user',
    isCaretaker: user?.role === 'caretaker',
    isAdmin:     user?.role === 'admin',
  };

  /* Loading screen — identical to original, no UI change */
  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#F0F7FF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif" }}>
        <div style={{ textAlign:'center' }}>
          <span style={{ fontSize:'3rem', display:'block', marginBottom:'12px', animation:'bounce 1s ease-in-out infinite' }}>👶</span>
          <p style={{ color:'#90A4AE', fontWeight:700, fontSize:'0.9rem' }}>Loading Trusted Care...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* ── Hook — unchanged ── */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;