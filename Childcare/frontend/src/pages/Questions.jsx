// File Path: src/pages/Questions.jsx
// Description: List of questions parents can ask nannies before/after booking

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, messagesAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('questions-styles')) return;
  const style = document.createElement('style');
  style.id = 'questions-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .q-root {
      font-family: 'Quicksand', sans-serif;
      background: linear-gradient(160deg, #E0F2FE 0%, #F0FDF4 45%, #FFF1F2 100%);
      min-height: 100vh;
      color: #0F172A;
    }

    .q-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px;
      height: 68px;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(56,189,248,0.15);
    }

    .q-logo {
      font-family: 'Baloo 2', cursive;
      font-size: 1.5rem; font-weight: 800;
      background: linear-gradient(135deg, #0EA5E9, #059669);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      display: flex; align-items: center; gap: 8px; text-decoration: none;
      cursor: pointer;
    }

    .q-nav-links { display: flex; gap: 8px; }
    .q-nav-btn {
      padding: 8px 18px; border-radius: 999px; font-weight: 600; font-size: 0.88rem;
      text-decoration: none; color: #334155; transition: all 0.2s;
      background: none; border: none; cursor: pointer; font-family: 'Quicksand', sans-serif;
    }
    .q-nav-btn:hover { background: #F0F9FF; color: #0EA5E9; }

    .q-main {
      max-width: 900px; margin: 0 auto;
      padding: 100px 48px 60px;
    }

    .q-hero {
      text-align: center;
      margin-bottom: 48px;
    }

    .q-hero-tag {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(56,189,248,0.15);
      border: 1px solid rgba(56,189,248,0.3);
      border-radius: 999px; padding: 8px 20px;
      font-size: 0.85rem; font-weight: 700; color: #0EA5E9;
      margin-bottom: 16px;
    }

    .q-hero h1 {
      font-family: 'Baloo 2', cursive;
      font-size: 2.4rem; font-weight: 800; color: #0F172A;
      margin-bottom: 12px;
    }

    .q-hero h1 span { 
      background: linear-gradient(135deg, #0EA5E9, #059669);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .q-hero p { color: #64748B; font-size: 1rem; max-width: 500px; margin: 0 auto 24px; }

    .q-booking-select {
      max-width: 400px; margin: 0 auto 32px;
    }

    .q-select-label {
      display: block; font-weight: 700; font-size: 0.78rem; color: #64748B;
      margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;
    }

    .q-select {
      width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 14px;
      font-family: 'Quicksand', sans-serif; font-size: 0.95rem; font-weight: 600;
      background: white; outline: none; transition: all 0.2s; cursor: pointer;
    }
    .q-select:focus { border-color: #0EA5E9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }

    .q-select-all-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 999px;
      border: 2px solid #0EA5E9; background: white;
      color: #0EA5E9; font-family: 'Quicksand', sans-serif;
      font-size: 0.85rem; font-weight: 700; cursor: pointer;
      transition: all 0.25s; margin: 8px 4px;
    }
    .q-select-all-btn:hover { background: #0EA5E9; color: white; }
    .q-select-all-btn.selected { background: #059669; border-color: #059669; color: white; }
    .q-link { color: #0EA5E9; cursor: pointer; font-weight: 700; }

    .q-section {
      margin-bottom: 36px;
    }

    .q-section-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.3rem; font-weight: 700; color: #0F172A;
      margin-bottom: 16px;
      display: flex; align-items: center; gap: 10px;
    }

    .q-section-title .icon { font-size: 1.4rem; }

    .q-question-card {
      background: white; border-radius: 16px; padding: 20px 24px;
      margin-bottom: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      border: 2px solid transparent; transition: all 0.25s;
      cursor: pointer;
    }
    .q-question-card:hover { 
      border-color: rgba(56,189,248,0.3); 
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    .q-question-card.selected {
      border-color: #0EA5E9;
      background: linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(5,150,105,0.05) 100%);
    }

    .q-question-header {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 8px;
    }

    .q-question-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #0EA5E9, #059669);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 0.9rem; flex-shrink: 0;
    }

    .q-question-text {
      font-weight: 700; font-size: 0.95rem; color: #0F172A;
      flex: 1;
    }

    .q-question-desc {
      font-size: 0.88rem; color: #64748B; line-height: 1.6;
      padding-left: 44px;
    }

    .q-checkbox {
      width: 22px; height: 22px; border-radius: 6px;
      border: 2px solid #E5E7EB; background: white;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    .q-question-card.selected .q-checkbox {
      background: #0EA5E9; border-color: #0EA5E9;
    }
    .q-question-card.selected .q-checkbox::after {
      content: '✓'; color: white; font-weight: 700; font-size: 0.8rem;
    }

    .q-action {
      text-align: center; margin-top: 40px;
    }

    .q-send-btn {
      padding: 14px 40px; border-radius: 999px; border: none;
      background: linear-gradient(135deg, #0EA5E9, #059669);
      color: white; font-family: 'Quicksand', sans-serif;
      font-size: 1rem; font-weight: 800; cursor: pointer;
      box-shadow: 0 4px 14px rgba(14,165,233,0.35);
      transition: all 0.25s;
    }
    .q-send-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,233,0.4); }
    .q-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .q-empty {
      text-align: center; padding: 60px 20px;
      background: white; border-radius: 24px;
    }
    .q-empty-icon { font-size: 3rem; margin-bottom: 12px; }
    .q-empty-text { font-size: 0.95rem; color: #64748B; }

    .q-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #0F172A; color: white; padding: 12px 24px;
      border-radius: 999px; font-weight: 600; font-size: 0.88rem;
      z-index: 1000; animation: toastIn 0.3s ease;
    }
    @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

    @media (max-width: 768px) {
      .q-main { padding: 100px 20px 40px; }
      .q-nav { padding: 0 20px; }
      .q-question-desc { padding-left: 0; margin-top: 8px; }
    }
  `;
  document.head.appendChild(style);
};

const QUESTION_CATEGORIES = [
  {
    title: 'Experience & Background',
    icon: '👩‍🏫',
    questions: [
      { id: 1, text: 'How long have you been working as a childcare provider?', desc: 'Understand their experience level and tenure in childcare.' },
      { id: 2, text: 'What ages of children have you worked with?', desc: 'Ensure they have experience with your child\'s age group.' },
      { id: 3, text: 'Do you have any formal childcare training or certifications?', desc: 'Ask about CPR, first aid, or early childhood education.' },
      { id: 4, text: 'Have you worked with children with special needs?', desc: 'If applicable, discuss any specific requirements.' },
    ]
  },
  {
    title: 'Daily Routine & Activities',
    icon: '📋',
    questions: [
      { id: 5, text: 'What does a typical day look like with you?', desc: 'Get an idea of their daily schedule and structure.' },
      { id: 6, text: 'What activities do you do with the children?', desc: 'Discuss educational, creative, and physical activities.' },
      { id: 7, text: 'How do you handle mealtime and nap time?', desc: 'Understand their approach to daily routines.' },
      { id: 8, text: 'Do you take children on outings or field trips?', desc: 'Clarify if outdoor activities and outings are included.' },
    ]
  },
  {
    title: 'Discipline & Communication',
    icon: '💬',
    questions: [
      { id: 9, text: 'What is your approach to discipline?', desc: 'Ensure their methods align with your parenting style.' },
      { id: 10, text: 'How do you communicate with parents about the child\'s day?', desc: 'Discuss preferred communication methods and frequency.' },
      { id: 11, text: 'How do you handle behavioral issues?', desc: 'Understand their strategies for managing challenging behavior.' },
      { id: 12, text: 'What would you do in case of an emergency?', desc: 'Verify their emergency preparedness and protocols.' },
    ]
  },
  {
    title: 'Logistics & Availability',
    icon: '📅',
    questions: [
      { id: 13, text: 'What are your working hours and availability?', desc: 'Confirm they can accommodate your schedule.' },
      { id: 14, text: 'Are you available on weekends or holidays if needed?', desc: 'Discuss flexibility for special occasions.' },
      { id: 15, text: 'What is your policy on sick days and time off?', desc: 'Understand their reliability and backup plans.' },
      { id: 16, text: 'Are you comfortable with pets in the home?', desc: 'If applicable, discuss pet-related arrangements.' },
    ]
  },
  {
    title: 'Safety & Security',
    icon: '🔒',
    questions: [
      { id: 17, text: 'Are you comfortable with home security systems?', desc: 'Discuss access to your home and security protocols.' },
      { id: 18, text: 'Who else might be present during childcare hours?', desc: 'Clarify if family members or others will be around.' },
      { id: 19, text: 'What is your comfort level with driving children?', desc: 'If transportation is needed, discuss vehicle and licensing.' },
      { id: 20, text: 'How do you ensure the child\'s safety at all times?', desc: 'Understand their safety practices and vigilance.' },
    ]
  },
];

export default function Questions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [toast, setToast] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    injectCSS();
    fetchConfirmedBookings();
  }, []);

  const fetchConfirmedBookings = async () => {
    try {
      const res = await bookingsAPI.getAll();
      console.log('Bookings response:', res);
      if (res.success) {
        // Show ALL bookings (pending + confirmed) so parent can ask questions
        const allBookings = (res.bookings || []).filter(b => 
          b.status === 'pending' || b.status === 'confirmed' || b.status === 'Pending' || b.status === 'Confirmed'
        );
        console.log('Filtered bookings:', allBookings);
        setBookings(allBookings);
      }
    } catch (err) {
      console.log('Error fetching bookings:', err);
    }
  };

  const toggleQuestion = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const getAllQuestionIds = () => {
    const ids = [];
    QUESTION_CATEGORIES.forEach(cat => {
      cat.questions.forEach(q => ids.push(q.id));
    });
    return ids;
  };

  const selectAll = () => {
    if (selectedQuestions.length === getAllQuestionIds().length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(getAllQuestionIds());
    }
  };

  const sendQuestions = async () => {
    console.log('Button clicked!');
    console.log('selectedBooking:', selectedBooking);
    console.log('selectedQuestions:', selectedQuestions);
    
    if (!selectedBooking) {
      setToast('❌ Please select a booking first!');
      return;
    }
    
    if (selectedQuestions.length === 0) {
      setToast('❌ Please select at least one question!');
      return;
    }
    
    const booking = bookings.find(b => b._id === selectedBooking);
    console.log('Found booking:', booking);
    
    if (!booking) {
      setToast('❌ Booking not found!');
      return;
    }

    // Handle caretaker ID - it might be populated object or just ID
    let caretakerId;
    if (typeof booking.caretaker === 'object' && booking.caretaker !== null) {
      caretakerId = booking.caretaker._id || booking.caretaker.id;
    } else {
      caretakerId = booking.caretaker;
    }
    
    console.log('Caretaker ID:', caretakerId);
    console.log('Caretaker Name:', booking.caretakerName);
    
    if (!caretakerId) {
      setToast('❌ Could not find caretaker in booking!');
      return;
    }

    setToast('Sending...');
    
    try {
      let sentCount = 0;
      let failedCount = 0;

      for (const qId of selectedQuestions) {
        let questionText = '';
        QUESTION_CATEGORIES.forEach(cat => {
          cat.questions.forEach(q => {
            if (q.id === qId) {
              questionText = q.text;
            }
          });
        });

        if (questionText) {
          console.log('Sending:', questionText);
          try {
            const result = await messagesAPI.sendMessage(caretakerId, questionText);
            console.log('Result:', result);
            if (result.success) {
              sentCount++;
            } else {
              failedCount++;
            }
          } catch (msgErr) {
            console.error('Message error:', msgErr);
            failedCount++;
          }
        }
        
        // Small delay between messages
        await new Promise(r => setTimeout(r, 200));
      }

      console.log(`Sent: ${sentCount}, Failed: ${failedCount}`);
      if (sentCount > 0) {
        setToast(`✅ ${sentCount} questions sent to ${booking.caretakerName}!`);
        setSelectedQuestions([]);
      } else {
        setToast('❌ Failed to send questions. Please try again.');
      }
      
      setTimeout(() => {
        setToast('');
      }, 4000);
    } catch (err) {
      console.error('Error:', err);
      setToast('❌ Error: ' + (err.message || 'Unknown error'));
      setTimeout(() => setToast(''), 4000);
    }
  };

  return (
    <div className="q-root">
      <nav className="q-nav">
        <div className="q-logo" onClick={() => navigate('/')}>
          <span style={{ fontSize: '1.6rem' }}>🌟</span>
          Trusted Care
        </div>
        <div className="q-nav-links">
          <button className="q-nav-btn" onClick={() => navigate('/parent-dashboard')}>Dashboard</button>
          <button className="q-nav-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </nav>

      <div className="q-main">
        <div className="q-hero">
          <div className="q-hero-tag">💬 Important Questions</div>
          <h1>Questions to Ask Your <span>Nanny</span></h1>
          <p>Select questions you want to ask before your booking. We'll send them to your nanny via message.</p>

          {bookings.length > 0 && (
            <div className="q-booking-select">
              <label className="q-select-label">Select Confirmed Booking</label>
              <select 
                className="q-select"
                value={selectedBooking}
                onChange={e => setSelectedBooking(e.target.value)}
              >
                <option value="">Choose a booking...</option>
                {bookings.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.caretakerName} - {b.date}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="q-empty">
            <div className="q-empty-icon">📅</div>
            <div className="q-empty-text">
              No confirmed bookings yet. Complete a booking with a nanny to access questions.
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <button 
                className={`q-select-all-btn ${selectedQuestions.length === getAllQuestionIds().length ? 'selected' : ''}`}
                onClick={selectAll}
              >
                {selectedQuestions.length === getAllQuestionIds().length ? '✓ Deselect All' : 'Select All Questions'}
              </button>
            </div>

            {QUESTION_CATEGORIES.map(category => (
              <div key={category.title} className="q-section">
                <div className="q-section-title">
                  <span className="icon">{category.icon}</span>
                  {category.title}
                </div>
                {category.questions.map(question => (
                  <div 
                    key={question.id}
                    className={`q-question-card ${selectedQuestions.includes(question.id) ? 'selected' : ''}`}
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="q-question-header">
                      <div className="q-question-icon">{question.id}</div>
                      <div className="q-question-text">{question.text}</div>
                      <div className="q-checkbox"></div>
                    </div>
                    <div className="q-question-desc">{question.desc}</div>
                  </div>
                ))}
              </div>
            ))}

            <div className="q-action">
              <button 
                className="q-send-btn"
                onClick={sendQuestions}
                disabled={!selectedBooking || selectedQuestions.length === 0}
              >
                Send {selectedQuestions.length > 0 ? `(${selectedQuestions.length}) ` : ''}Questions to Nanny
              </button>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '16px' }}>
                💬 You can also <span className="q-link" onClick={() => navigate('/messages')}>message directly</span> or send questions anytime!
              </p>
            </div>
          </>
        )}
      </div>

      {toast && <div className="q-toast">{toast}</div>}
    </div>
  );
}
