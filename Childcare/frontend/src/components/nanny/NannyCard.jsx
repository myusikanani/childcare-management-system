import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/NannyCard.css';

const NannyCard = ({ nanny }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/nanny/${nanny.id}`);
  };

  const handleBookNow = () => {
    navigate(`/nanny/${nanny.id}`, { state: { openBooking: true } });
  };

  return (
    <div className="nanny-card">
      <div className="nanny-card-header">
        <img 
          src={nanny.photo || '/default-avatar.png'} 
          alt={nanny.name}
          className="nanny-photo"
        />
        <div className="nanny-badge-container">
          {nanny.verified && (
            <span className="badge badge-verified">✓ Verified</span>
          )}
          {nanny.featured && (
            <span className="badge badge-featured">⭐ Featured</span>
          )}
        </div>
      </div>

      <div className="nanny-card-body">
        <h3 className="nanny-name">{nanny.name}</h3>
        
        <div className="nanny-rating">
          <span className="stars">
            {'⭐'.repeat(Math.floor(nanny.rating))}
            {nanny.rating % 1 !== 0 && '½'}
          </span>
          <span className="rating-text">
            {nanny.rating} ({nanny.reviewCount} reviews)
          </span>
        </div>

        <div className="nanny-info">
          <div className="info-item">
            <span className="info-icon">📍</span>
            <span>{nanny.location}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💼</span>
            <span>{nanny.experience} years experience</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🎓</span>
            <span>{nanny.education}</span>
          </div>
        </div>

        <div className="nanny-specialties">
          {nanny.specialties.slice(0, 3).map((specialty, index) => (
            <span key={index} className="specialty-tag">
              {specialty}
            </span>
          ))}
        </div>

        <div className="nanny-availability">
          <span className="availability-label">Available:</span>
          <span className="availability-days">
            {nanny.availability.join(', ')}
          </span>
        </div>

        <div className="nanny-rate">
          <span className="rate-amount">${nanny.hourlyRate}/hr</span>
        </div>

        <p className="nanny-bio">{nanny.bio.substring(0, 100)}...</p>
      </div>

      <div className="nanny-card-footer">
        <button 
          className="btn btn-secondary"
          onClick={handleViewProfile}
        >
          View Profile
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleBookNow}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default NannyCard;