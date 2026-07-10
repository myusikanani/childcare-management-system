import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BookingModal from '../components/nanny/BookingModal';
import { usersAPI } from '../services/api';
import '../styles/NannyDetails.css';

const NannyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [nanny, setNanny] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchNanny = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getCaretakerById(id);
        if (response.caretaker) {
          const c = response.caretaker;
          setNanny({
            id: c._id,
            name: c.name,
            photo: c.avatar || null,
            rating: c.rating || 4.5,
            reviewCount: c.totalReviews || 0,
            location: c.address || 'Available',
            experience: c.experience ? `${c.experience} years` : 'New',
            education: c.specializations?.[0] || 'Childcare Training',
            hourlyRate: c.hourlyRate || 500,
            bio: c.bio || `${c.name} is a passionate childcare provider.`,
            specialties: c.specializations?.length ? c.specializations : ['Child Care'],
            availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            languages: c.languages?.length ? c.languages : ['English'],
            certifications: c.certifications || ['CPR Certified'],
            verified: c.isVerified || false,
            reviews: [
              {
                id: 1,
                author: 'Emma Thompson',
                rating: 5,
                date: '2 weeks ago',
                text: 'Amazing caretaker! Very professional.'
              },
              {
                id: 2,
                author: 'Michael Chen',
                rating: 5,
                date: '1 month ago',
                text: 'Very professional and caring.'
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching caretaker:', error);
      } finally {
        setLoading(false);
        if (location.state?.openBooking) {
          setShowBookingModal(true);
        }
      }
    };
    
    fetchNanny();
  }, [id, location.state]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (!nanny) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '4rem' }}>🔍</div>
        <h2>Caretaker Not Found</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/nannies')}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #38BDF8, #34D399)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="nanny-details-page">
      <div className="container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back to Search
        </button>

        <div className="nanny-details-content">
          {/* Left Column - Profile */}
          <div className="profile-section">
            <div className="profile-card">
              {nanny.photo ? (
                <img 
                  src={nanny.photo} 
                  alt={nanny.name} 
                  className="profile-photo" 
                  style={{ objectFit: 'cover' }} 
                />
              ) : (
                <div 
                  className="profile-photo" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '3rem', 
                    background: 'linear-gradient(135deg, #BAE6FD, #93C5FD)' 
                  }}
                >
                  👩
                </div>
              )}
              {nanny.verified && <span className="verified-badge">✓ Verified</span>}
              {nanny.featured && <span className="featured-badge">★ Featured</span>}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{nanny.name}</h1>
              <p className="profile-location">📍 {nanny.location}</p>
              <div className="profile-rating">
                <span className="stars">{'★'.repeat(Math.round(nanny.rating))}{'☆'.repeat(5 - Math.round(nanny.rating))}</span>
                <span className="rating-value">{nanny.rating.toFixed(1)}</span>
                <span className="review-count">({nanny.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="profile-tags">
              {nanny.specialties.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>

            <div className="profile-section-card">
              <h3>About</h3>
              <p>{nanny.about || nanny.bio}</p>
            </div>

            <div className="profile-section-card">
              <h3>Certifications</h3>
              <div className="certifications-list">
                {nanny.certifications.map((cert, index) => (
                  <div key={index} className="certification-item">
                    <span className="cert-icon">📜</span>
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-section-card">
              <h3>Languages</h3>
              <div className="languages-list">
                {nanny.languages.map((lang, index) => (
                  <span key={index} className="language-tag">{lang}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details & Booking */}
          <div className="details-section">
            <div className="booking-card">
              <div className="hourly-rate-display">
                <span className="rate-label">Hourly Rate</span>
                <span className="rate-value">₹{nanny.hourlyRate}</span>
                <span className="rate-period">per hour</span>
              </div>

              <div className="quick-info">
                <div className="info-item">
                  <span className="info-label">Experience</span>
                  <span className="info-value">{nanny.experience}+ years</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Education</span>
                  <span className="info-value">{nanny.education}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-book"
                onClick={() => setShowBookingModal(true)}
              >
                📅 Book Now
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/messages', { state: { caretakerId: nanny.id } })}
              >
                💬 Send Message
              </button>
            </div>

            <div className="details-card">
              <h3>Specialties</h3>
              <div className="specialties-grid">
                {nanny.specialties.map((specialty, index) => (
                  <div key={index} className="specialty-item">
                    <span className="specialty-icon">✓</span>
                    <span>{specialty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-card">
              <h3>Availability</h3>
              <div className="availability-grid">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div 
                    key={day} 
                    className={`day-item ${nanny.availability.includes(day) ? 'available' : 'unavailable'}`}
                  >
                    {nanny.availability.includes(day) ? '✓' : '✗'} {day}
                  </div>
                ))}
              </div>
            </div>

            <div className="details-card">
              <h3>Reviews</h3>
              <div className="reviews-summary">
                <div className="overall-rating">
                  <span className="big-rating">{nanny.rating.toFixed(1)}</span>
                  <div className="rating-details">
                    <span className="stars">{'★'.repeat(Math.round(nanny.rating))}{'☆'.repeat(5 - Math.round(nanny.rating))}</span>
                    <span>{nanny.reviewCount} reviews</span>
                  </div>
                </div>
              </div>
              <div className="reviews-list">
                {nanny.reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-avatar">{review.author[0]}</div>
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.author}</span>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal 
          nanny={nanny}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default NannyDetails;
