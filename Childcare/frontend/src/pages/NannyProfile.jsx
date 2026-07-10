import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import BookingModal from '../components/nanny/BookingModal';
import { usersAPI } from '../services/api';
import '../styles/NannyProfile.css';

const NannyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [nanny, setNanny] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchNanny = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getCaretakerById(id);
        if (response.caretaker) {
          const c = response.caretaker;
          
          // Fetch reviews for this caretaker from bookings
          let reviews = [];
          try {
            const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const bookingsData = await bookingsRes.json();
            if (bookingsData.bookings) {
              reviews = bookingsData.bookings
                .filter(b => b.caretaker?._id === id || b.caretaker === id)
                .filter(b => b.rating && b.review)
                .map(b => ({
                  id: b._id,
                  parent: b.parentName || 'Parent',
                  rating: b.rating,
                  date: new Date(b.reviewedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                  comment: b.review
                }));
            }
          } catch (err) {
            console.log('Could not fetch reviews');
          }
          
          setNanny({
            id: c._id,
            name: c.name,
            photo: c.avatar ? (c.avatar.startsWith('http') ? c.avatar : `http://localhost:5000${c.avatar}`) : null,
            rating: c.rating || 4.5,
            reviewCount: reviews.length || c.totalReviews || 0,
            location: c.address || 'Available',
            experience: c.experience ? `${c.experience} years` : 'New',
            education: c.specializations?.[0] || 'Childcare Training',
            specialties: c.specializations?.length ? c.specializations : ['Child Care'],
            availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            hourlyRate: c.hourlyRate || 500,
            bio: c.bio || `${c.name} is a dedicated and caring childcare professional.`,
            verified: c.isVerified || false,
            languages: c.languages?.length ? c.languages : ['English'],
            certifications: c.certifications || ['CPR Certified'],
            about: c.bio || `Meet ${c.name}, a passionate childcare professional committed to providing the best care for your little ones.`,
            reviews: reviews
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
  }, [id, location]);

  if (loading) {
    return <Loader />;
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
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-left">
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
          <div className="profile-basic-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{nanny.name}</h1>
              {nanny.verified && <span className="verified-badge">✓ Verified</span>}
              {nanny.featured && <span className="featured-badge">★ Featured</span>}
            </div>
            <p className="profile-location">📍 {nanny.location}</p>
            <div className="profile-rating">
              <span className="stars">{'★'.repeat(Math.round(nanny.rating))}{'☆'.repeat(5 - Math.round(nanny.rating))}</span>
              <span className="rating-value">{nanny.rating.toFixed(1)}</span>
              <span className="review-count">({nanny.reviewCount} reviews)</span>
            </div>
            <div className="profile-tags">
              {nanny.specialties.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="profile-header-right">
          <div className="hourly-rate">
            <span className="rate-label">Hourly Rate</span>
            <span className="rate-value">₹{nanny.hourlyRate}</span>
          </div>
          <button 
            className="btn btn-primary book-btn"
            onClick={() => setShowBookingModal(true)}
          >
            📅 Book Now
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button 
          className={`tab ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Experience
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        <button 
          className={`tab ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          Availability
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'about' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>About Me</h2>
              <p>{nanny.about}</p>
            </div>
            <div className="content-card">
              <h2>Certifications</h2>
              <div className="certifications-list">
                {nanny.certifications.map((cert, index) => (
                  <div key={index} className="certification-item">
                    <span className="cert-icon">📜</span>
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="content-card">
              <h2>Languages</h2>
              <div className="languages-list">
                {nanny.languages.map((lang, index) => (
                  <span key={index} className="language-tag">{lang}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>Experience</h2>
              <p>{nanny.experience}+ years of professional childcare experience</p>
            </div>
            <div className="content-card">
              <h2>Education</h2>
              <p>{nanny.education}</p>
            </div>
            <div className="content-card">
              <h2>Specialties</h2>
              <div className="specialties-grid">
                {nanny.specialties.map((specialty, index) => (
                  <div key={index} className="specialty-item">
                    <span className="specialty-icon">✓</span>
                    <span>{specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-content">
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
                    <div className="reviewer-avatar">{review.parent[0]}</div>
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.parent}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>Available Days</h2>
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
            <div className="content-card">
              <h2>Booking Information</h2>
              <p>Minimum booking: 2 hours</p>
              <p>Maximum booking: 12 hours per day</p>
              <p>Advance booking: At least 24 hours in advance</p>
            </div>
          </div>
        )}
      </div>

      <div className="mobile-booking-bar">
        <div className="hourly-rate">
          <span className="rate-label">Rate</span>
          <span className="rate-value">₹{nanny.hourlyRate}/hr</span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowBookingModal(true)}
        >
          Book Now
        </button>
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

export default NannyProfile;
