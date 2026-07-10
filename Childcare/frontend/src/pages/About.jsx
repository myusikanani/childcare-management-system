import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* About Hero */}
      <section className="about-hero">
        <div className="container">
          <button className="back-home-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <div className="about-content">
            <div className="about-text">
              <h1 className="animate-fade-in">About Trusted Care</h1>
              <p className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Trusted Care is a comprehensive childcare management platform that connects 
                parents with verified, caring nannies. We ensure safe, reliable, and 
                affordable childcare services for every family.
              </p>
            </div>
            <div className="about-illustration animate-slide-in">
              <div className="illustration-circle">
                <span className="illustration-emoji">👨‍👩‍👧‍👦</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Why Choose Trusted Care?</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card animate-fade-in">
              <div className="testimonial-icon">🔒</div>
              <h3>Verified Nannies</h3>
              <p>All our nannies undergo thorough background checks and verification process.</p>
            </div>
            <div className="testimonial-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="testimonial-icon">💰</div>
              <h3>Affordable Rates</h3>
              <p>Competitive pricing with flexible payment options for every budget.</p>
            </div>
            <div className="testimonial-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="testimonial-icon">⭐</div>
              <h3>Real Reviews</h3>
              <p>Read authentic reviews from parents who have used our services.</p>
            </div>
            <div className="testimonial-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="testimonial-icon">💬</div>
              <h3>Direct Communication</h3>
              <p>Message nannies directly and get your questions answered quickly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="updates-section">
        <div className="container">
          <div className="updates-card">
            <div className="updates-header">
              <h2>🌟 Our Mission</h2>
            </div>
            <div className="updates-list">
              <div className="update-item">
                <div className="update-avatar">🎯</div>
                <div className="update-content">
                  <p><strong>Provide Safe Childcare</strong></p>
                  <span className="update-time">Ensuring the safety and well-being of every child</span>
                </div>
              </div>
              <div className="update-item">
                <div className="update-avatar">🤝</div>
                <div className="update-content">
                  <p><strong>Build Trust</strong></p>
                  <span className="update-time">Creating transparent relationships between parents and nannies</span>
                </div>
              </div>
              <div className="update-item">
                <div className="update-avatar">📚</div>
                <div className="update-content">
                  <p><strong>Support Learning</strong></p>
                  <span className="update-time">Offering training resources for nannies to grow their skills</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
