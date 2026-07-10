import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('questionnaire-styles')) return;
  const style = document.createElement('style');
  style.id = 'questionnaire-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .nq-root {
      font-family: 'Quicksand', sans-serif;
      background: linear-gradient(160deg, #FDF4FF 0%, #F0F9FF 50%, #F0FDF4 100%);
      min-height: 100vh;
      color: #1A1A2E;
    }

    .nq-header {
      background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
      padding: 40px 48px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .nq-header::before {
      content: '';
      position: absolute;
      top: -50px;
      left: -50px;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
    }
    .nq-header::after {
      content: '';
      position: absolute;
      bottom: -30px;
      right: -30px;
      width: 150px;
      height: 150px;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
    }
    .nq-header-content {
      position: relative;
      z-index: 1;
    }
    .nq-tag {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: white;
      padding: 5px 16px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }
    .nq-header h1 {
      font-family: 'Baloo 2', cursive;
      font-size: 2.2rem;
      color: white;
      margin-bottom: 8px;
    }
    .nq-header p {
      color: rgba(255,255,255,0.85);
      font-size: 1rem;
    }

    .nq-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 36px 24px 60px;
    }

    .nq-caretaker-select {
      background: white;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 28px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .nq-select-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.1rem;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nq-caretaker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .nq-caretaker-opt {
      border: 2px solid #E5E7EB;
      border-radius: 14px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nq-caretaker-opt:hover {
      border-color: #8B5CF6;
      background: #FAF5FF;
    }
    .nq-caretaker-opt.selected {
      border-color: #8B5CF6;
      background: linear-gradient(135deg, #FAF5FF, #F5F3FF);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
    }
    .nq-caretaker-opt input {
      display: none;
    }
    .nq-caretaker-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #BAE6FD, #C4B5FD);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .nq-caretaker-name {
      font-weight: 700;
      font-size: 0.9rem;
      color: #1A1A2E;
    }
    .nq-caretaker-special {
      font-size: 0.72rem;
      color: #8B5CF6;
      font-weight: 600;
    }

    .nq-category {
      background: white;
      border-radius: 20px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .nq-category-header {
      background: linear-gradient(135deg, var(--cat-color-1) 0%, var(--cat-color-2) 100%);
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nq-category-icon {
      font-size: 1.8rem;
    }
    .nq-category-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.15rem;
      color: white;
    }
    .nq-category-subtitle {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.85);
    }
    .nq-category-body {
      padding: 20px 24px;
    }

    .nq-question {
      margin-bottom: 20px;
    }
    .nq-question-label {
      font-weight: 700;
      font-size: 0.9rem;
      color: #1A1A2E;
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .nq-question-num {
      background: linear-gradient(135deg, #8B5CF6, #EC4899);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
    }
    .nq-question-required {
      color: #EC4899;
      font-size: 0.75rem;
    }
    .nq-options {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .nq-option {
      padding: 10px 18px;
      border: 2px solid #E5E7EB;
      border-radius: 999px;
      background: white;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      color: #555;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nq-option:hover {
      border-color: #8B5CF6;
      color: #8B5CF6;
    }
    .nq-option.selected {
      background: linear-gradient(135deg, #8B5CF6, #A78BFA);
      color: white;
      border-color: #8B5CF6;
    }
    .nq-textarea {
      width: 100%;
      padding: 14px;
      border: 2px solid #E5E7EB;
      border-radius: 14px;
      font-family: 'Quicksand', sans-serif;
      font-size: 0.9rem;
      resize: vertical;
      min-height: 100px;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    .nq-textarea:focus {
      border-color: #8B5CF6;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
    }

    .nq-submit-area {
      background: white;
      border-radius: 20px;
      padding: 28px;
      margin-top: 20px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .nq-submit-btn {
      background: linear-gradient(135deg, #8B5CF6, #EC4899);
      color: white;
      border: none;
      padding: 16px 48px;
      border-radius: 999px;
      font-family: 'Quicksand', sans-serif;
      font-size: 1.05rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
    }
    .nq-submit-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.45);
    }
    .nq-submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .nq-submit-note {
      font-size: 0.8rem;
      color: #888;
      margin-top: 12px;
    }

    .nq-success {
      background: white;
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.1);
      animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    .nq-success-icon {
      font-size: 5rem;
      margin-bottom: 16px;
    }
    .nq-success h2 {
      font-family: 'Baloo 2', cursive;
      font-size: 1.8rem;
      color: #059669;
      margin-bottom: 12px;
    }
    .nq-success p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .nq-success-btn {
      background: linear-gradient(135deg, #059669, #34D399);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 999px;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .nq-header { padding: 32px 24px; }
      .nq-header h1 { font-size: 1.6rem; }
      .nq-content { padding: 24px 16px 48px; }
    }
  `;
  document.head.appendChild(style);
};

const CATEGORIES = [
  {
    id: 'experience',
    icon: '👶',
    title: 'Experience & Background',
    subtitle: 'Questions about qualifications and experience',
    color1: '#0EA5E9',
    color2: '#38BDF8',
    questions: [
      { id: 'q1', question: 'How many years of childcare experience do you have?', type: 'options', options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'], required: true },
      { id: 'q2', question: 'What age groups have you worked with?', type: 'multi', options: ['Infants (0-1)', 'Toddlers (1-3)', 'Preschool (3-5)', 'School age (5-12)', 'Teenagers'], required: true },
      { id: 'q3', question: 'Do you have any formal childcare training or certifications?', type: 'options', options: ['Yes - CPR/First Aid', 'Yes - Early Childhood Education', 'Yes - Special Needs Training', 'No formal training'], required: false },
      { id: 'q4', question: 'Tell us more about your experience (optional)', type: 'textarea', placeholder: 'Share any relevant experience, background, or details...' },
    ]
  },
  {
    id: 'availability',
    icon: '📅',
    title: 'Availability & Schedule',
    subtitle: 'When can you provide care?',
    color1: '#059669',
    color2: '#34D399',
    questions: [
      { id: 'q5', question: 'What days are you available?', type: 'multi', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
      { id: 'q6', question: 'What hours can you work?', type: 'options', options: ['Morning (6AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-10PM)', 'Full Day', 'Overnight'], required: true },
      { id: 'q7', question: 'Are you available for emergency or last-minute bookings?', type: 'options', options: ['Yes, always available', 'Sometimes', 'Rarely', 'No'], required: false },
    ]
  },
  {
    id: 'care',
    icon: '🍼',
    title: 'Childcare Approach',
    subtitle: 'How do you care for children?',
    color1: '#F59E0B',
    color2: '#FBBF24',
    questions: [
      { id: 'q8', question: 'How do you handle bedtime routines?', type: 'options', options: ['Follow parent\'s routine', 'Create a new routine', 'Flexible approach', 'Depends on child\'s mood'], required: false },
      { id: 'q9', question: 'How do you handle meal times?', type: 'multi', options: ['Prepare meals', 'Feed children', 'Both', 'Follow parent\'s instructions'], required: false },
      { id: 'q10', question: 'What activities do you enjoy doing with children?', type: 'textarea', placeholder: 'Describe activities, games, educational pursuits...' },
      { id: 'q11', question: 'How do you discipline children?', type: 'options', options: ['Positive reinforcement', 'Time-outs', 'Natural consequences', 'Discussion & guidance', 'Follow parent\'s methods'], required: true },
    ]
  },
  {
    id: 'emergency',
    icon: '🚨',
    title: 'Emergency & Safety',
    subtitle: 'Health and safety protocols',
    color1: '#EF4444',
    color2: '#F87171',
    questions: [
      { id: 'q12', question: 'Are you comfortable administering medication?', type: 'options', options: ['Yes', 'Only in emergencies', 'With training', 'No'], required: false },
      { id: 'q13', question: 'Have you handled medical emergencies before?', type: 'options', options: ['Yes, frequently', 'Yes, a few times', 'Only basic first aid', 'No'], required: false },
      { id: 'q14', question: 'What would you do if a child gets injured?', type: 'textarea', placeholder: 'Describe your emergency response approach...' },
    ]
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧',
    title: 'Family Communication',
    subtitle: 'How do you stay connected with parents?',
    color1: '#8B5CF6',
    color2: '#A78BFA',
    questions: [
      { id: 'q15', question: 'How do you prefer to communicate with parents?', type: 'multi', options: ['Phone calls', 'Text messages', 'Video calls', 'App/portal', 'Daily notes'], required: true },
      { id: 'q16', question: 'How often would you provide updates?', type: 'options', options: ['Real-time photos/videos', 'Daily summary', 'Weekly report', 'As needed'], required: false },
      { id: 'q17', question: 'Any additional information you\'d like to share?', type: 'textarea', placeholder: 'Hobbies, interests, anything else parents should know...' },
    ]
  },
];

export default function NannyQuestionnaire() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const preselectedCaretaker = location.state?.caretaker || null;

  const [selectedCaretaker, setSelectedCaretaker] = useState(preselectedCaretaker?._id || '');
  const [caretakers, setCaretakers] = useState(preselectedCaretaker ? [preselectedCaretaker] : []);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState('');

  React.useEffect(() => {
    injectCSS();
    if (!preselectedCaretaker) {
      fetchCaretakers();
    }
  }, []);

  const fetchCaretakers = async () => {
    try {
      const res = await usersAPI.getCaretakers({ trained: 'true' });
      if (res.success) {
        setCaretakers(res.caretakers);
      }
    } catch (err) {
      console.log('Failed to fetch caretakers');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOption = (questionId, value, type) => {
    setAnswers(prev => {
      if (type === 'multi') {
        const current = prev[questionId] || [];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [questionId]: updated };
      }
      return { ...prev, [questionId]: value };
    });
  };

  const handleTextarea = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isOptionSelected = (questionId, value) => {
    const answer = answers[questionId];
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  };

  const requiredAnswered = () => {
    const requiredIds = CATEGORIES.flatMap(cat =>
      cat.questions.filter(q => q.required).map(q => q.id)
    );
    return requiredIds.every(id => answers[id] && (Array.isArray(answers[id]) ? answers[id].length > 0 : true));
  };

  const handleSubmit = () => {
    if (!selectedCaretaker) {
      showToast('Please select a caretaker');
      return;
    }
    if (!requiredAnswered()) {
      showToast('Please answer all required questions');
      return;
    }
    
    // Save questionnaire to localStorage (in real app, send to backend)
    const questionnaireData = {
      id: Date.now().toString(),
      caretakerId: selectedCaretaker,
      answers,
      submittedAt: new Date().toISOString(),
      parentId: user?.id || user?._id,
    };
    
    const existing = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    existing.push(questionnaireData);
    localStorage.setItem('questionnaires', JSON.stringify(existing));
    
    setSubmitted(true);
  };

  const selectedCaretakerData = caretakers.find(c => c._id === selectedCaretaker);

  if (submitted) {
    return (
      <div className="nq-root">
        <div className="nq-header">
          <div className="nq-header-content">
            <div className="nq-tag">✨ Complete</div>
            <h1>Questionnaire Submitted!</h1>
          </div>
        </div>
        <div className="nq-content">
          <div className="nq-success">
            <div className="nq-success-icon">🎉</div>
            <h2>Thank You!</h2>
            <p>
              Your questionnaire has been sent to <strong>{selectedCaretakerData?.fullName || 'the caretaker'}</strong>.<br/>
              They will review your questions and respond through the messaging system.
            </p>
            <button className="nq-success-btn" onClick={() => navigate('/messages')}>
              💬 Go to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nq-root">
      <div className="nq-header">
        <div className="nq-header-content">
          <div className="nq-tag">📋 Get to Know Your Caretaker</div>
          <h1>Nanny Questionnaire</h1>
          <p>Ask important questions before booking - get to know your caretaker better!</p>
        </div>
      </div>

      <div className="nq-content">
        {/* Caretaker Selection */}
        <div className="nq-caretaker-select">
          <div className="nq-select-title">
            👤 Select Caretaker to Ask
          </div>
          <div className="nq-caretaker-grid">
            {caretakers.map((c, i) => (
              <label
                key={c._id}
                className={`nq-caretaker-opt ${selectedCaretaker === c._id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="caretaker"
                  value={c._id}
                  checked={selectedCaretaker === c._id}
                  onChange={() => setSelectedCaretaker(c._id)}
                />
                <div className="nq-caretaker-avatar">
                  {['👩', '👨', '👩‍🦱', '👩‍🦳'][i % 4]}
                </div>
                <div>
                  <div className="nq-caretaker-name">{c.fullName}</div>
                  <div className="nq-caretaker-special">{c.specialization || 'Childcare'}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Question Categories */}
        {CATEGORIES.map(category => (
          <div key={category.id} className="nq-category">
            <div
              className="nq-category-header"
              style={{ '--cat-color-1': category.color1, '--cat-color-2': category.color2 }}
            >
              <span className="nq-category-icon">{category.icon}</span>
              <div>
                <div className="nq-category-title">{category.title}</div>
                <div className="nq-category-subtitle">{category.subtitle}</div>
              </div>
            </div>
            <div className="nq-category-body">
              {category.questions.map((q, qIdx) => (
                <div key={q.id} className="nq-question">
                  <div className="nq-question-label">
                    <span className="nq-question-num">{qIdx + 1}</span>
                    <span>{q.question}</span>
                    {q.required && <span className="nq-question-required">*</span>}
                  </div>
                  
                  {q.type === 'options' && (
                    <div className="nq-options">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          className={`nq-option ${isOptionSelected(q.id, opt) ? 'selected' : ''}`}
                          onClick={() => handleOption(q.id, opt, 'options')}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {q.type === 'multi' && (
                    <div className="nq-options">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          className={`nq-option ${isOptionSelected(q.id, opt) ? 'selected' : ''}`}
                          onClick={() => handleOption(q.id, opt, 'multi')}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {q.type === 'textarea' && (
                    <textarea
                      className="nq-textarea"
                      placeholder={q.placeholder}
                      value={answers[q.id] || ''}
                      onChange={e => handleTextarea(q.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit */}
        <div className="nq-submit-area">
          <button
            className="nq-submit-btn"
            onClick={handleSubmit}
            disabled={!selectedCaretaker}
          >
            Send Questionnaire ✉️
          </button>
          <p className="nq-submit-note">
            Your caretaker will receive these questions and can respond via messages
          </p>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1A2E',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '999px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
