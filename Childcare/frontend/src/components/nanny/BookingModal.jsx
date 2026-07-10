import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BookingModal.css';

const BookingModal = ({ nanny, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Details, 2: Confirmation
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    frequency: 'one-time',
    selectedDays: [],
    startTime: '',
    endTime: '',
    childName: '',
    childAge: '',
    specialInstructions: ''
  });
  const [calculatedCost, setCalculatedCost] = useState(0);

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day) => {
    setBookingData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const calculateCost = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;

    const [startHour] = bookingData.startTime.split(':').map(Number);
    const [endHour] = bookingData.endTime.split(':').map(Number);
    const hours = endHour - startHour;

    if (hours <= 0) return 0;

    let totalCost = hours * nanny.hourlyRate;

    if (bookingData.frequency === 'recurring') {
      const daysCount = bookingData.selectedDays.length;
      totalCost = totalCost * daysCount * 4; // Estimate 4 weeks per month
    }

    return totalCost;
  };

  const handleNext = () => {
    const cost = calculateCost();
    setCalculatedCost(cost);
    setStep(2);
  };

  const handleConfirmBooking = () => {
    // Here you would normally send the booking to your backend
    console.log('Booking confirmed:', {
      nannyId: nanny.id,
      ...bookingData,
      totalCost: calculatedCost
    });

    // Navigate to payment page
    navigate('/payment', {
      state: {
        bookingType: 'nanny',
        nanny: nanny,
        bookingData: bookingData,
        amount: calculatedCost
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book {nanny.name}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {step === 1 && (
          <div className="modal-body">
            <div className="nanny-summary">
              <img src={nanny.photo} alt={nanny.name} />
              <div>
                <h3>{nanny.name}</h3>
                <p>${nanny.hourlyRate}/hour</p>
              </div>
            </div>

            <form className="booking-form">
              {/* Date Range */}
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={bookingData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {bookingData.frequency === 'recurring' && (
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={bookingData.startDate}
                  />
                </div>
              )}

              {/* Frequency */}
              <div className="form-group">
                <label>Booking Type *</label>
                <select
                  value={bookingData.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                >
                  <option value="one-time">One-Time</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>

              {/* Days Selection for Recurring */}
              {bookingData.frequency === 'recurring' && (
                <div className="form-group">
                  <label>Select Days *</label>
                  <div className="days-selector">
                    {nanny.availability.map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${bookingData.selectedDays.includes(day) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time */}
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={bookingData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    value={bookingData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Child Details */}
              <div className="form-group">
                <label>Child's Name *</label>
                <input
                  type="text"
                  value={bookingData.childName}
                  onChange={(e) => handleInputChange('childName', e.target.value)}
                  placeholder="Enter child's name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Child's Age *</label>
                <select
                  value={bookingData.childAge}
                  onChange={(e) => handleInputChange('childAge', e.target.value)}
                  required
                >
                  <option value="">Select age</option>
                  <option value="0-1">0-1 years (Infant)</option>
                  <option value="1-3">1-3 years (Toddler)</option>
                  <option value="3-5">3-5 years (Preschool)</option>
                  <option value="5-12">5-12 years (School Age)</option>
                  <option value="12+">12+ years (Teen)</option>
                </select>
              </div>

              {/* Special Instructions */}
              <div className="form-group">
                <label>Special Instructions (Optional)</label>
                <textarea
                  value={bookingData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any allergies, preferences, or special needs?"
                  rows="4"
                />
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="modal-body">
            <div className="confirmation-summary">
              <h3>Booking Summary</h3>
              
              <div className="summary-item">
                <span>Nanny:</span>
                <strong>{nanny.name}</strong>
              </div>

              <div className="summary-item">
                <span>Date:</span>
                <strong>{bookingData.startDate}</strong>
              </div>

              {bookingData.frequency === 'recurring' && (
                <>
                  <div className="summary-item">
                    <span>Days:</span>
                    <strong>{bookingData.selectedDays.join(', ')}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Until:</span>
                    <strong>{bookingData.endDate || 'Ongoing'}</strong>
                  </div>
                </>
              )}

              <div className="summary-item">
                <span>Time:</span>
                <strong>{bookingData.startTime} - {bookingData.endTime}</strong>
              </div>

              <div className="summary-item">
                <span>Child:</span>
                <strong>{bookingData.childName} ({bookingData.childAge})</strong>
              </div>

              {bookingData.specialInstructions && (
                <div className="summary-item">
                  <span>Instructions:</span>
                  <p>{bookingData.specialInstructions}</p>
                </div>
              )}

              <div className="summary-total">
                <span>Total Cost:</span>
                <strong className="total-amount">${calculatedCost}</strong>
                {bookingData.frequency === 'recurring' && (
                  <small>Estimated monthly cost</small>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          {step === 1 ? (
            <>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={
                  !bookingData.startDate ||
                  !bookingData.startTime ||
                  !bookingData.endTime ||
                  !bookingData.childName ||
                  !bookingData.childAge ||
                  (bookingData.frequency === 'recurring' && bookingData.selectedDays.length === 0)
                }
              >
                Continue to Review
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleConfirmBooking}>
                Proceed to Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;