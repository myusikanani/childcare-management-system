// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../common/LoginModal';
import './Navbar.css';

const Navbar = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const isDev = process.env.NODE_ENV === 'development';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'Admin':
        return '/admin-dashboard';
      case 'Caretaker':
        return '/caretaker-dashboard';
      case 'Parent':
      default:
        return '/parent-dashboard';
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src="/logo.chidcare.png" alt="Trusted Care" className="logo-emoji" style={{ height: '36px', width: 'auto' }} />
            <span className="logo-text">
              Trusted Care
            </span>
          </Link>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <Link 
              to="/" 
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/learning" 
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learning
            </Link>
            <Link 
              to="/training" 
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Training
            </Link>

            <div className="navbar-actions">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="nav-btn nav-btn-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    className="nav-btn nav-btn-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="nav-btn nav-btn-login"
                    onClick={handleLoginClick}
                  >
                    Login
                  </button>
                  <button 
                    className="nav-btn nav-btn-signup"
                    onClick={() => navigate('/signup')}
                  >
                    Signup
                  </button>
                </>
              )}
              {isDev && (
                <div className="dev-auth-badge">
                  Auth: {String(isAuthenticated)} {user?.role ? `· ${user.role}` : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        canClose={true}
      />
    </>
  );
};

export default Navbar;