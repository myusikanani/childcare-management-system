import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    // Navigate to specific signup page based on role
    switch(role) {
      case 'Parent':
        navigate('/signup/parent');
        break;
      case 'Caretaker':
        navigate('/signup/caretaker');
        break;
      case 'Admin':
        navigate('/signup/admin');
        break;
      default:
        break;
    }
  };

  return (
    <div className="signup-page">
      <a href="/" className="nl-back-btn" style={{ position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', zIndex: 10 }}>
        ← Back to Home
      </a>
      <div className="signup-container">
        <div className="signup-header">
          <h1>Join Trusted Care</h1>
          <p>Select your role to get started</p>
        </div>

        <div className="role-selection-grid">
          <div 
            className="role-card"
            onClick={() => handleRoleSelect('Parent')}
          >
            <div className="role-icon">👨‍👩‍👧</div>
            <h3>Parent</h3>
            <p>Find trusted caretakers for your children</p>
            <ul className="role-features">
              <li>✓ Browse verified nannies</li>
              <li>✓ Book childcare services</li>
              <li>✓ Track child's progress</li>
              <li>✓ Real-time updates</li>
            </ul>
            <button className="btn-select-role">Sign Up as Parent</button>
          </div>

          <div 
            className="role-card"
            onClick={() => handleRoleSelect('Caretaker')}
          >
            <div className="role-icon">👩‍🍼</div>
            <h3>Caretaker</h3>
            <p>Start your career in childcare</p>
            <ul className="role-features">
              <li>✓ Find job opportunities</li>
              <li>✓ Flexible scheduling</li>
              <li>✓ Competitive pay</li>
              <li>✓ Professional training</li>
            </ul>
            <button className="btn-select-role">Sign Up as Caretaker</button>
          </div>

          <div 
            className="role-card"
            onClick={() => handleRoleSelect('Admin')}
          >
            <div className="role-icon">🛠️</div>
            <h3>Admin</h3>
            <p>Manage the platform</p>
            <ul className="role-features">
              <li>✓ Manage users</li>
              <li>✓ Approve caretakers</li>
              <li>✓ View reports</li>
              <li>✓ System control</li>
            </ul>
            <button className="btn-select-role">Sign Up as Admin</button>
          </div>
        </div>

        <div className="signup-footer">
          <p>
            Already have an account? 
            <Link to="/login" className="login-link"> Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;