// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.5rem',
        color: '#667eea'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If allowedRoles is specified, check if user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their appropriate dashboard
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'caretaker':
        return <Navigate to="/caretaker-dashboard" replace />;
      case 'parent':
      default:
        return <Navigate to="/parent-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;