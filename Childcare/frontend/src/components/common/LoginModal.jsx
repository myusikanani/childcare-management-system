// src/components/common/LoginModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, canClose = true }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'parent'
  });
  const [signupData, setSignupData] = useState({
    parentName: '',
    childName: '',
    age: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Capitalize role to match AuthContext: 'parent' → 'Parent'
      const capitalizedRole = loginData.role.charAt(0).toUpperCase() + loginData.role.slice(1);

      const result = await login({
        email: loginData.email,
        password: loginData.password,
        role: capitalizedRole
      });
      
      if (result && result.success) {
        onClose();
        // Navigate based on capitalized role
        switch (capitalizedRole) {
          case 'Admin':
            navigate('/admin-dashboard', { replace: true });
            break;
          case 'Caretaker':
            navigate('/caretaker-dashboard', { replace: true });
            break;
          case 'Parent':
          default:
            navigate('/parent-dashboard', { replace: true });
            break;
        }
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupData.parentName || !signupData.childName || !signupData.age || 
        !signupData.email || !signupData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await signup({
        email: signupData.email,
        password: signupData.password,
        role: 'parent',
        fullName: signupData.parentName,
        childName: signupData.childName,
        age: signupData.age
      });

      if (result) {
        navigate('/parent-dashboard');
        onClose();
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  const handleOverlayClick = (e) => {
    if (canClose && e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {canClose && (
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        )}

        <div className="modal-header">
          <div className="modal-logo">
            <span className="logo-emoji">😊</span>
            <h2>Trusted Care</h2>
          </div>
          {!canClose && (
            <p className="modal-subtitle">Please sign in to continue browsing</p>
          )}
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'login' ? (
          <form className="modal-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Login as</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-btn ${loginData.role === 'parent' ? 'active' : ''}`}
                  onClick={() => setLoginData({ ...loginData, role: 'parent' })}
                >
                  Parent
                </button>
                <button
                  type="button"
                  className={`role-btn ${loginData.role === 'caretaker' ? 'active' : ''}`}
                  onClick={() => setLoginData({ ...loginData, role: 'caretaker' })}
                >
                  Caretaker
                </button>
                <button
                  type="button"
                  className={`role-btn ${loginData.role === 'admin' ? 'active' : ''}`}
                  onClick={() => setLoginData({ ...loginData, role: 'admin' })}
                >
                  Admin
                </button>
              </div>
            </div>

            <button type="submit" className="submit-button">
              Login
            </button>

            <div className="form-footer">
              <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
            </div>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label>Parent Name</label>
              <input
                type="text"
                placeholder="Enter parent name"
                value={signupData.parentName}
                onChange={(e) => setSignupData({ ...signupData, parentName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Child's Name</label>
              <input
                type="text"
                placeholder="Enter child's name"
                value={signupData.childName}
                onChange={(e) => setSignupData({ ...signupData, childName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <select
                  value={signupData.age}
                  onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                >
                  <option value="">Select age</option>
                  {[...Array(13)].map((_, i) => (
                    <option key={i} value={i}>{i} years</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
            </div>

            <button type="submit" className="submit-button">
              Enroll Now
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;