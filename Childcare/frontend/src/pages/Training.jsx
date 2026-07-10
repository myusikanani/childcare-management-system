// File Path: src/pages/Training.jsx
// Description: Complete Training page for Caretakers - modules, progress, quizzes, certificates
// Features: Backend integration, 10 modules, XP, streaks, achievements, PDF certificate

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caretakerTrainingAPI } from '../services/api';

/* ── Animated Progress Ring ── */
const ProgressRing = ({ pct, size = 100, stroke = 10, color = '#4FC3F7' }) => {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E3F2FD" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', fontSize: size * 0.22 + 'px', fontWeight: 800, fill: color, fontFamily: "'Fredoka One',cursive" }}>
        {pct}%
      </text>
    </svg>
  );
};

/* ── Quiz Modal ── */
const QuizModal = ({ module, onClose, onPass, onSubmitQuiz }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const q = module.quiz[current];

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const newAnswers = [...answers, idx];
    
    setTimeout(() => {
      if (current + 1 < module.quiz.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setAnswers(newAnswers);
      } else {
        // Submit quiz to backend
        setLoading(true);
        setAnswers(newAnswers);
        onSubmitQuiz(module.moduleId, newAnswers, (result) => {
          setScore(result.score);
          setFinished(true);
          setLoading(false);
          if (result.passed) onPass();
        });
      }
    }, 900);
  };

  return (
    <div style={qm.overlay} onClick={onClose}>
      <div style={qm.modal} onClick={e => e.stopPropagation()}>
        {!finished ? (
          <>
            <div style={qm.header}>
              <span style={qm.moduleTag}>{module.icon} {module.title}</span>
              <span style={qm.progress}>{current + 1} / {module.quiz.length}</span>
            </div>
            <div style={qm.progressBar}>
              <div style={{ ...qm.progressFill, width: `${((current) / module.quiz.length) * 100}%` }} />
            </div>
            <h2 style={qm.question}>{q.question}</h2>
            <div style={qm.options}>
              {q.options.map((opt, i) => {
                let bg = 'white'; let border = '#E3F2FD'; let color = '#1A237E';
                if (selected !== null) {
                  if (i === q.correct) { bg = '#E8F5E9'; border = '#43A047'; color = '#2E7D32'; }
                  else if (i === selected && i !== q.correct) { bg = '#FFEBEE'; border = '#E53935'; color = '#C62828'; }
                }
                return (
                  <button key={i} style={{ ...qm.option, background: bg, borderColor: border, color }}
                    onClick={() => handleAnswer(i)} disabled={loading}>
                    <span style={qm.optionLetter}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div style={qm.result}>
            <div style={qm.resultEmoji}>{score >= 70 ? '🎉' : '😔'}</div>
            <h2 style={qm.resultTitle}>{score >= 70 ? 'Congratulations!' : 'Try Again'}</h2>
            <p style={qm.resultScore}>You scored <strong style={{ color: score >= 70 ? '#43A047' : '#E53935' }}>{score}%</strong></p>
            <p style={qm.resultSub}>{score >= 70 ? 'Module completed! Keep up the great work.' : 'You need 70% to pass. Review the material and try again.'}</p>
            <button style={qm.resultBtn} onClick={onClose}>
              {score >= 70 ? '🏆 Continue' : '📖 Back to Module'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const qm = {
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(26,35,126,0.45)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:        { background: 'white', borderRadius: '24px', width: '100%', maxWidth: '540px', padding: '36px', boxShadow: '0 32px 80px rgba(26,35,126,0.2)', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  moduleTag:    { background: '#E3F2FD', color: '#1565C0', padding: '5px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700 },
  progress:     { color: '#90A4AE', fontWeight: 700, fontSize: '0.85rem' },
  progressBar:  { height: '6px', background: '#E3F2FD', borderRadius: '999px', overflow: 'hidden', marginBottom: '28px' },
  progressFill: { height: '100%', background: 'linear-gradient(135deg,#4FC3F7,#43C6AC)', borderRadius: '999px', transition: 'width 0.5s ease' },
  question:     { fontFamily: "'Fredoka One',cursive", fontSize: '1.3rem', color: '#1A237E', marginBottom: '24px', lineHeight: 1.4 },
  options:      { display: 'flex', flexDirection: 'column', gap: '10px' },
  option:       { border: '2px solid #E3F2FD', borderRadius: '14px', padding: '14px 18px', cursor: 'pointer', textAlign: 'left', fontFamily: "'Nunito',sans-serif", fontSize: '0.93rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.25s ease' },
  optionLetter: { width: '28px', height: '28px', borderRadius: '8px', background: '#E3F2FD', color: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0 },
  result:       { textAlign: 'center', padding: '20px 0' },
  resultEmoji:  { fontSize: '4rem', marginBottom: '16px', display: 'block', animation: 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)' },
  resultTitle:  { fontFamily: "'Fredoka One',cursive", fontSize: '2rem', color: '#1A237E', marginBottom: '8px' },
  resultScore:  { fontSize: '1.1rem', color: '#37474F', marginBottom: '8px' },
  resultSub:    { color: '#90A4AE', fontSize: '0.9rem', marginBottom: '28px', lineHeight: 1.5 },
  resultBtn:    { background: 'linear-gradient(135deg,#4FC3F7,#43C6AC)', color: 'white', border: 'none', padding: '14px 36px', borderRadius: '999px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,195,247,0.4)' },
};

/* ── Lesson Modal ── */
const LessonModal = ({ lesson, module, isCompleted, onClose, onComplete }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  
  return (
    <div style={qm.overlay} onClick={onClose}>
      <div style={{ ...qm.modal, maxWidth: '680px', padding: 0 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '24px 28px', background: module.background, borderRadius: '24px 24px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, display: 'inline-block' }}>
                📖 Lesson {lesson.index + 1}
              </span>
              <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: '1.4rem', color: '#1A237E', margin: '8px 0 4px' }}>{lesson.title}</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                  ⏱ {lesson.duration} min
                </span>
                <span style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                  ⭐ +5 XP
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.3)', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: '24px 28px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Theory Section */}
          <div 
            style={{ 
              background: '#F0F7FF', 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 16,
              border: hoveredSection === 'theory' ? `2px solid ${module.color}` : '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={() => setHoveredSection('theory')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>📚</span>
              <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: '1.1rem', color: '#1A237E', margin: 0 }}>Theory</h3>
            </div>
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} style={{ fontSize: '0.92rem', lineHeight: 1.7, color: '#37474F' }} />
          </div>
          
          {/* Key Points Section */}
          <div 
            style={{ 
              background: '#FFF8E1', 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 16,
              border: hoveredSection === 'points' ? `2px solid #F59E0B` : '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={() => setHoveredSection('points')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>🎯</span>
              <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: '1.1rem', color: '#92400E', margin: 0 }}>Key Points</h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {lesson.keyPoints?.map((point, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: '0.9rem', color: '#37474F', lineHeight: 1.5 }}>{point}</li>
              )) || (
                <>
                  <li style={{ marginBottom: 8, fontSize: '0.9rem', color: '#37474F', lineHeight: 1.5 }}>Understand the core concepts thoroughly</li>
                  <li style={{ marginBottom: 8, fontSize: '0.9rem', color: '#37474F', lineHeight: 1.5 }}>Apply knowledge in real-world situations</li>
                  <li style={{ marginBottom: 8, fontSize: '0.9rem', color: '#37474F', lineHeight: 1.5 }}>Practice regularly to reinforce learning</li>
                </>
              )}
            </ul>
          </div>
          
          {/* Examples Section */}
          <div 
            style={{ 
              background: '#E8F5E9', 
              borderRadius: 16, 
              padding: 20, 
              border: hoveredSection === 'examples' ? `2px solid #43A047` : '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={() => setHoveredSection('examples')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: '1.1rem', color: '#2E7D32', margin: 0 }}>Examples</h3>
            </div>
            {lesson.examples?.map((ex, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E7D32', marginBottom: 4 }}>{ex.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#37474F', lineHeight: 1.5 }}>{ex.description}</div>
              </div>
            )) || (
              <>
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E7D32', marginBottom: 4 }}>Scenario 1</div>
                  <div style={{ fontSize: '0.85rem', color: '#37474F', lineHeight: 1.5 }}>A child is playing with toys and suddenly starts crying. What would you do?</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E7D32', marginBottom: 4 }}>Scenario 2</div>
                  <div style={{ fontSize: '0.85rem', color: '#37474F', lineHeight: 1.5 }}>During meal time, a child refuses to eat. How do you handle this?</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', display: 'flex', gap: 12, justifyContent: 'center' }}>
          {isCompleted ? (
            <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 24px', borderRadius: 999, fontWeight: 700 }}>
              ✅ Lesson Completed
            </div>
          ) : (
            <button 
              onClick={onComplete}
              style={{ 
                background: `linear-gradient(135deg,${module.color},${module.color}bb)`, 
                color: 'white', 
                border: 'none', 
                padding: '12px 32px', 
                borderRadius: 999, 
                fontWeight: 800, 
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${module.color}40`
              }}
            >
              ✓ Mark as Complete (+5 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const Training = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Data from backend
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [stats, setStats] = useState({ totalXP: 0, completedModules: 0, totalModules: 0, overallProgress: 0 });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [quizModule, setQuizModule] = useState(null);
  const [activeTab, setActiveTab] = useState('modules');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showCert, setShowCert] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const isNewCaretaker = location.state?.fromSignup === true;

  // Fetch all data from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch modules (public)
      const modulesRes = await caretakerTrainingAPI.getModules();
      if (modulesRes.success) {
        setModules(modulesRes.modules || []);
      }
      
      // Fetch progress, achievements, streak (protected)
      try {
        const progressRes = await caretakerTrainingAPI.getProgress();
        if (progressRes.success) {
          setProgress(progressRes.progress || []);
          setAchievements(progressRes.achievements || []);
          setStreak(progressRes.streak || { currentStreak: 0, longestStreak: 0 });
          setStats(progressRes.stats || { totalXP: 0, completedModules: 0, totalModules: 0, overallProgress: 0 });
        }
      } catch (progressErr) {
        // Protected route might fail if not logged in - that's ok
        console.log('Progress fetch skipped (might not be logged in)');
      }
    } catch (err) {
      console.error('Error fetching training data:', err);
      setError('Unable to load training modules. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const getModuleProgress = (moduleId) => {
    return progress.find(p => p.moduleId === moduleId);
  };

  const getCompletedCount = () => {
    return progress.filter(p => p.status === 'completed').length;
  };

  const pct = stats.totalModules > 0 ? Math.round((getCompletedCount() / stats.totalModules) * 100) : 0;

  const levelColor = { Beginner: { bg: '#E8F5E9', color: '#2E7D32' }, Intermediate: { bg: '#FFF8E1', color: '#F57F17' }, Advanced: { bg: '#FFEBEE', color: '#C62828' } };

  const startModule = async (mod) => {
    try {
      await caretakerTrainingAPI.startModule(mod.moduleId);
      await fetchData();
    } catch (err) {
      console.error('Error starting module:', err);
    }
    setActiveModule(mod);
    setCurrentLesson(0);
  };

  const completeLesson = async () => {
    if (!activeModule) return;
    try {
      const modProgress = getModuleProgress(activeModule.moduleId);
      const completedCount = modProgress?.completedLessons?.length || 0;
      
      await caretakerTrainingAPI.completeLesson(activeModule.moduleId, completedCount);
      await fetchData();
      
      if (completedCount + 1 >= activeModule.lessons.length) {
        setQuizModule(activeModule);
      } else {
        setCurrentLesson(currentLesson + 1);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleQuizSubmit = async (moduleId, answers, callback) => {
    try {
      const res = await caretakerTrainingAPI.submitQuiz(moduleId, answers);
      if (res.success) {
        await fetchData();
        if (res.achievements?.length > 0) {
          res.achievements.forEach(a => {
            setNewAchievement(a);
            setTimeout(() => setNewAchievement(null), 4000);
          });
        }
        callback({ score: res.score, passed: res.passed });
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      callback({ score: 0, passed: false });
    }
  };

  const passQuiz = async (modId) => {
    await fetchData();
  };

  const handleGetCertificate = async () => {
    try {
      const res = await caretakerTrainingAPI.getCertificate();
      if (res.success) {
        setCertificateData(res.certificate);
        setShowCert(true);
      }
    } catch (err) {
      console.error('Error getting certificate:', err);
      alert('Complete all modules to get your certificate!');
    }
  };

  const downloadCertificate = () => {
    if (!certificateData) return;
    
    // Create a simple printable certificate
    const certWindow = window.open('', '_blank');
    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Training Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
          .cert { border: 10px solid #1A237E; padding: 60px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1A237E; font-size: 2.5rem; }
          .stamp { font-size: 5rem; }
          .name { font-size: 2rem; color: #1A237E; margin: 20px 0; }
          .course { font-size: 1.5rem; color: #4FC3F7; }
          .info { color: #666; margin-top: 30px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="stamp">🏆</div>
          <h1>Trusted Care</h1>
          <p style="letter-spacing: 3px;">CERTIFICATE OF COMPLETION</p>
          <p>This is to certify that</p>
          <div class="name">${user?.name || 'Caretaker'}</div>
          <p>has successfully completed</p>
          <div class="course">Professional Caretaker Training Program</div>
          <p>${certificateData.completedModules} of ${certificateData.totalModules} modules completed</p>
          <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p>Certificate ID: ${certificateData.certificateId}</p>
            <p>Issued: ${new Date(certificateData.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Total XP Earned: ${certificateData.totalXP}</p>
          </div>
        </div>
        <button onclick="window.print()" style="padding: 15px 30px; background: #1A237E; color: white; border: none; border-radius: 25px; font-size: 1rem; cursor: pointer; margin-top: 30px;">
          Print Certificate
        </button>
      </body>
      </html>
    `);
    certWindow.document.close();
  };

  // Achievement definitions
  const ACHIEVEMENT_DEFS = [
    { icon: '🌟', title: 'First Step', desc: 'Complete your first module', condition: () => getCompletedCount() >= 1 },
    { icon: '🔥', title: 'On a Roll', desc: 'Complete 3 modules', condition: () => getCompletedCount() >= 3 },
    { icon: '💪', title: 'Halfway Hero', desc: 'Complete 50% of training', condition: () => pct >= 50 },
    { icon: '🏅', title: 'Safety Expert', desc: 'Complete Child Safety module', condition: () => progress.some(p => p.moduleId === 'child-safety' && p.status === 'completed') },
    { icon: '🥗', title: 'Nutrition Pro', desc: 'Complete Nutrition module', condition: () => progress.some(p => p.moduleId === 'nutrition' && p.status === 'completed') },
    { icon: '🏥', title: 'First Aid Hero', desc: 'Complete First Aid module', condition: () => progress.some(p => p.moduleId === 'first-aid' && p.status === 'completed') },
    { icon: '🎓', title: 'Scholar', desc: 'Complete all modules', condition: () => getCompletedCount() >= modules.length && modules.length > 0 },
    { icon: '🏆', title: 'Certified Pro', desc: 'Earn your certificate', condition: () => pct === 100 },
    { icon: '⚡', title: 'Streak Master', desc: 'Train 7 days in a row', condition: () => streak.currentStreak >= 7 },
    { icon: '🚀', title: 'Quick Learner', desc: 'Complete a module', condition: () => getCompletedCount() >= 1 },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7FF' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="cd-spinner" style={{ width: 48, height: 48, border: '4px solid #E3F2FD', borderTopColor: '#4FC3F7', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 16, color: '#90A4AE', fontWeight: 600 }}>Loading training modules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7FF', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Fredoka One',cursive", color: '#1A237E', marginBottom: 12 }}>Connection Error</h2>
          <p style={{ color: '#90A4AE', marginBottom: 24 }}>{error}</p>
          <button 
            onClick={fetchData}
            style={{ 
              background: 'linear-gradient(135deg,#4FC3F7,#43C6AC)', 
              color: 'white', 
              border: 'none', 
              padding: '12px 28px', 
              borderRadius: '999px', 
              fontWeight: 800, 
              cursor: 'pointer' 
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* bg blobs */}
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.blob3} />

      {/* Lesson Modal */}
      {selectedLesson && activeModule && (
        <LessonModal
          lesson={selectedLesson}
          module={activeModule}
          isCompleted={getModuleProgress(activeModule.moduleId)?.completedLessons?.some(l => l.lessonIndex === selectedLesson.index)}
          onClose={() => setSelectedLesson(null)}
          onComplete={async () => {
            await completeLesson();
            setSelectedLesson(null);
          }}
        />
      )}

      {/* Quiz Modal */}
      {quizModule && (
        <QuizModal
          module={quizModule}
          onClose={() => setQuizModule(null)}
          onPass={() => { passQuiz(quizModule.moduleId); setActiveModule(null); }}
          onSubmitQuiz={handleQuizSubmit}
        />
      )}

      {/* Certificate Modal */}
      {showCert && certificateData && (
        <div style={cert.overlay} onClick={() => setShowCert(false)}>
          <div style={cert.modal} onClick={e => e.stopPropagation()}>
            <div style={cert.top}>
              <span style={cert.stamp}>🏆</span>
              <h1 style={cert.brand}>Trusted Care</h1>
              <p style={cert.subhead}>CERTIFICATE OF COMPLETION</p>
            </div>
            <div style={cert.body}>
              <p style={cert.presented}>This is to certify that</p>
              <h2 style={cert.name}>{user?.name || 'Caretaker'}</h2>
              <p style={cert.presented}>has successfully completed</p>
              <h3 style={cert.course}>Professional Caretaker Training Program</h3>
              <p style={cert.modules}>{certificateData.completedModules} of {certificateData.totalModules} modules completed • {certificateData.totalXP} XP</p>
              <div style={cert.divider} />
              <p style={cert.certId}>Certificate ID: {certificateData.certificateId}</p>
              <p style={cert.date}>Issued: {new Date(certificateData.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <button style={cert.btn} onClick={downloadCertificate}>🖨️ Download / Print Certificate</button>
          </div>
        </div>
      )}

      {/* Module Detail Drawer with Lessons */}
      {activeModule && (
        <div style={s.drawerOverlay} onClick={() => setActiveModule(null)}>
          <div style={s.drawer} onClick={e => e.stopPropagation()}>
            <div style={{ ...s.drawerHeader, background: activeModule.background }}>
              <span style={s.drawerIcon}>{activeModule.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ ...s.levelTag, background: levelColor[activeModule.level].bg, color: levelColor[activeModule.level].color }}>{activeModule.level}</span>
                <h2 style={s.drawerTitle}>{activeModule.title}</h2>
                <p style={s.drawerMeta}>⏱ {activeModule.duration}  •  📖 {activeModule.totalLessons} lessons • ⭐ {activeModule.xpReward} XP</p>
              </div>
              <button style={s.drawerClose} onClick={() => setActiveModule(null)}>✕</button>
            </div>
            <div style={s.drawerBody}>
              <p style={s.drawerDesc}>{activeModule.description}</p>
              
              {/* Lesson List */}
              <h3 style={s.drawerSub}>📚 Lessons</h3>
              <div style={{ marginBottom: 20 }}>
                {activeModule.lessons?.map((lesson, idx) => {
                  const modProg = getModuleProgress(activeModule.moduleId);
                  const isCompleted = modProg?.completedLessons?.some(l => l.lessonIndex === idx);
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        ...s.lessonItem, 
                        background: isCompleted ? '#E8F5E9' : '#F8FAFC',
                        border: `1px solid ${isCompleted ? '#43A047' : '#E3F2FD'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setSelectedLesson({ ...lesson, index: idx })}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${activeModule.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ ...s.lessonNum, background: isCompleted ? '#43A047' : activeModule.color }}>
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...s.lessonTitle, color: isCompleted ? '#2E7D32' : '#1A237E' }}>{lesson.title}</div>
                        <div style={s.lessonDuration}>⏱ {lesson.duration} min</div>
                      </div>
                      <span style={{ color: '#90A4AE', fontSize: '1rem' }}>→</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Current Lesson Content */}
              {activeModule.lessons?.[currentLesson] && (
                <div style={{ ...s.lessonContent, background: activeModule.background + '40' }}>
                  <h4 style={{ fontFamily: "'Fredoka One',cursive", color: '#1A237E', marginBottom: 12 }}>
                    {activeModule.lessons[currentLesson].title}
                  </h4>
                  <div dangerouslySetInnerHTML={{ __html: activeModule.lessons[currentLesson].content }} style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#37474F' }} />
                </div>
              )}
              
              {/* Topics */}
              <h3 style={s.drawerSub}>📋 Topics Covered</h3>
              <div style={s.topicsGrid}>
                {activeModule.topics?.map((t, i) => (
                  <div key={i} style={s.topicChip}>
                    <span style={{ color: activeModule.color, marginRight: '6px' }}>✓</span>{t}
                  </div>
                ))}
              </div>
              
              <div style={s.drawerActions}>
                {getModuleProgress(activeModule.moduleId)?.status === 'completed'
                  ? <div style={s.completedBanner}>✅ Module Completed! Great job.</div>
                  : (
                    <button style={{ ...s.btnStart, background: `linear-gradient(135deg,${activeModule.color},${activeModule.color}bb)` }}
                      onClick={() => { setQuizModule(activeModule); }}>
                      🚀 Take Quiz
                    </button>
                  )}
                <button style={s.btnBack} onClick={() => setActiveModule(null)}>← Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ NAVBAR ════ */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <button style={s.menuBtn} onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div style={s.brand}>
            <span style={{ fontSize: '1.5rem' }}>👶</span>
            <span style={s.brandText}>Trusted Care</span>
          </div>
        </div>
        <span style={s.navTitle}>📚 Training Center</span>
        <div style={s.navRight}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: 'rgba(255,255,255,0.15)',color: 'white', padding: '6px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 700 }}>
              ⚡ {stats.totalXP} XP
            </span>
            {streak.currentStreak > 0 && (
              <span style={{ background: 'rgba(255,213,79,0.3)', padding: '6px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 700, color: '#FFD54F' }}>
                🔥 {streak.currentStreak} day streak
              </span>
            )}
          </div>
          <button style={s.iconBtn} onClick={() => navigate('/caretaker-dashboard')}>🏠 Dashboard</button>
          <div style={s.avatarCircle}>{user?.name?.[0]?.toUpperCase() || 'C'}</div>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={s.layout}>
        {/* ════ SIDEBAR ════ */}
        <aside style={{ ...s.sidebar, width: sidebarOpen ? '240px' : '0', overflow: 'hidden' }}>
          <div style={s.sideInner}>
            {/* Progress Ring in sidebar */}
            <div style={s.sideProgress}>
              <ProgressRing pct={pct} size={90} stroke={9} color="#4FC3F7" />
              <p style={s.sideProgressLabel}>Overall Progress</p>
              <p style={s.sideProgressSub}>{getCompletedCount()}/{modules.length} modules</p>
              <p style={{ ...s.sideProgressSub, marginTop: 4 }}>⚡ {stats.totalXP} XP</p>
            </div>

            <p style={s.sideLabel}>NAVIGATE</p>
            {[
              { icon: '📚', label: 'All Modules',   tab: 'modules'      },
              { icon: '📊', label: 'My Progress',   tab: 'progress'     },
              { icon: '🏆', label: 'Achievements',  tab: 'achievements' },
            ].map(item => (
              <button key={item.tab}
                style={{ ...s.sideBtn, ...(activeTab === item.tab ? s.sideBtnActive : {}) }}
                onClick={() => setActiveTab(item.tab)}>
                <span>{item.icon}</span><span>{item.label}</span>
                {activeTab === item.tab && <span style={s.sideBar} />}
              </button>
            ))}

            {pct === 100 && (
              <button style={s.certBtn} onClick={handleGetCertificate}>
                🏆 Get Certificate
              </button>
            )}

            <div style={s.profileCard}>
              <div style={s.profileAvatar}>{user?.name?.[0]?.toUpperCase() || 'C'}</div>
              <div>
                <p style={s.profileName}>{user?.name}</p>
                <p style={s.profileRole}>Caretaker</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ════ MAIN CONTENT ════ */}
        <main style={s.main}>

          {/* ── MODULES TAB ── */}
          {activeTab === 'modules' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>Training Modules</h1>
                  <p style={s.subtitle}>{modules.length} modules • Complete all to earn your certificate</p>
                </div>
                <div style={s.progressPill}>
                  <span style={s.progressPillFill(pct)} />
                  <span style={s.progressPillText}>{pct}% Complete</span>
                </div>
              </div>

              {/* Hero Banner */}
              <div style={s.heroBanner}>
                <div style={s.heroLeft}>
                  <h2 style={s.heroTitle}>
                    {pct === 0 ? "Let's begin your journey! 🚀"
                      : pct === 100 ? "You're a certified pro! 🏆"
                      : `Keep going, ${user?.name}! 💪`}
                  </h2>
                  <p style={s.heroSub}>
                    {pct === 0 ? 'Start with Module 1 — Child Safety Basics'
                      : pct === 100 ? 'All modules completed. Download your certificate now!'
                      : `${modules.length - getCompletedCount()} modules remaining`}
                  </p>
                  {pct === 100
                    ? <button style={s.heroBtnGold} onClick={handleGetCertificate}>🏆 Get Certificate</button>
                    : <button style={s.heroBtn} onClick={() => {
                        const next = modules.find(m => !getModuleProgress(m.moduleId)?.status || getModuleProgress(m.moduleId)?.status !== 'completed');
                        if (next) startModule(next);
                      }}>
                        {pct === 0 ? '▶ Start Training' : '▶ Continue Training'}
                      </button>
                  }
                </div>
                <div style={s.heroRight}>
                  <ProgressRing pct={pct} size={130} stroke={12} color="white" />
                </div>
              </div>

              {/* Modules Grid */}
              <div style={s.modulesGrid}>
                {modules.map((mod, i) => {
                  const modProg = getModuleProgress(mod.moduleId);
                  const isDone = modProg?.status === 'completed';
                  const isInProg = modProg?.status === 'in_progress';
                  return (
                    <div key={mod.moduleId}
                      style={{ ...s.moduleCard, borderTop: `4px solid ${mod.color}`, animationDelay: `${i * 0.08}s` }}
                      onClick={() => startModule(mod)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = `0 16px 40px ${mod.color}30`;
                        e.currentTarget.style.borderColor = mod.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,35,126,0.08)';
                        e.currentTarget.style.borderTopColor = mod.color;
                      }}
                    >
                      <div style={s.moduleCardTop}>
                        <div style={{ ...s.moduleIconBox, background: mod.background }}>
                          <span style={{ fontSize: '1.8rem' }}>{mod.icon}</span>
                        </div>
                        <div style={s.moduleCardBadges}>
                          <span style={{ ...s.levelBadge, background: levelColor[mod.level].bg, color: levelColor[mod.level].color }}>{mod.level}</span>
                          {isDone    && <span style={s.doneBadge}>✅ Done</span>}
                          {isInProg  && <span style={s.inProgBadge}>▶ In Progress</span>}
                        </div>
                      </div>
                      <h3 style={s.moduleTitle}>{mod.title}</h3>
                      <p style={s.moduleDesc}>{mod.description}</p>
                      <div style={s.moduleMeta}>
                        <span style={s.metaChip}>⏱ {mod.duration}</span>
                        <span style={s.metaChip}>📖 {mod.totalLessons} lessons</span>
                        <span style={s.metaChip}>⭐ {mod.xpReward} XP</span>
                      </div>
                      <div style={{ ...s.moduleProgress, background: mod.background }}>
                        <div style={{ height: '5px', background: mod.color, borderRadius: '999px', width: isDone ? '100%' : isInProg ? '40%' : '0%', transition: 'width 1s ease' }} />
                      </div>
                      <button style={{ ...s.moduleBtn, background: isDone ? '#E8F5E9' : `linear-gradient(135deg,${mod.color}dd,${mod.color}99)`, color: isDone ? '#2E7D32' : 'white' }}>
                        {isDone ? '✅ Completed' : isInProg ? '▶ Continue' : '🚀 Start'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PROGRESS TAB ── */}
          {activeTab === 'progress' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>My Progress</h1>
                  <p style={s.subtitle}>Track your learning journey</p>
                </div>
              </div>

              {/* Big progress cards */}
              <div style={s.progCards}>
                {[
                  { label: 'Completed',   val: getCompletedCount(), icon: '✅', color: '#43A047', bg: '#E8F5E9' },
                  { label: 'In Progress', val: progress.filter(p => p.status === 'in_progress').length, icon: '▶', color: '#FB8C00', bg: '#FFF8E1' },
                  { label: 'Not Started', val: modules.length - getCompletedCount() - progress.filter(p => p.status === 'in_progress').length, icon: '⏳', color: '#90A4AE', bg: '#F5F5F5' },
                  { label: 'Total XP', val: stats.totalXP, icon: '⚡', color: '#1565C0', bg: '#E3F2FD' },
                ].map((c, i) => (
                  <div key={i} style={{ ...s.progCard, background: c.bg }}>
                    <span style={s.progCardIcon}>{c.icon}</span>
                    <span style={{ ...s.progCardVal, color: c.color }}>{c.val}</span>
                    <span style={s.progCardLabel}>{c.label}</span>
                  </div>
                ))}
              </div>

              {/* Streak Card */}
              <div style={{ ...s.sectionCard, marginBottom: 24 }}>
                <h2 style={s.sectionTitle}>🔥 Training Streak</h2>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: streak.currentStreak > 0 ? '#FF8F00' : '#90A4AE' }}>
                      {streak.currentStreak}
                    </div>
                    <div style={{ color: '#90A4AE', fontWeight: 600, fontSize: '0.85rem' }}>Current Streak</div>
                  </div>
                  <div style={{ height: 50, width: 1, background: '#E3F2FD' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: '#43A047' }}>{streak.longestStreak}</div>
                    <div style={{ color: '#90A4AE', fontWeight: 600, fontSize: '0.85rem' }}>Longest Streak</div>
                  </div>
                </div>
              </div>

              {/* Per-module progress */}
              <div style={s.sectionCard}>
                <h2 style={s.sectionTitle}>📋 Module Progress Breakdown</h2>
                {modules.map((mod, i) => {
                  const modProg = getModuleProgress(mod.moduleId);
                  const isDone = modProg?.status === 'completed';
                  const isInProg = modProg?.status === 'in_progress';
                  const pctMod = isDone ? 100 : isInProg ? 40 : 0;
                  return (
                    <div key={mod.moduleId} style={s.progRow}>
                      <div style={{ ...s.progRowIcon, background: mod.background }}>
                        <span style={{ fontSize: '1.3rem' }}>{mod.icon}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={s.progRowTitle}>{mod.title}</span>
                          <span style={{ color: mod.color, fontWeight: 800, fontSize: '0.85rem' }}>{pctMod}%</span>
                        </div>
                        <div style={s.progBarTrack}>
                          <div style={{ ...s.progBarFill, width: `${pctMod}%`, background: mod.color, transitionDelay: `${i * 0.1}s` }} />
                        </div>
                        <span style={s.progRowStatus}>
                          {isDone ? '✅ Completed' : isInProg ? '▶ In Progress' : '⏳ Not Started'}
                          {modProg?.xpEarned > 0 && ` • ${modProg.xpEarned} XP`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ACHIEVEMENTS TAB ── */}
          {activeTab === 'achievements' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>Achievements</h1>
                  <p style={s.subtitle}>Earn badges by completing modules</p>
                </div>
              </div>

              <div style={s.badgesGrid}>
                {ACHIEVEMENT_DEFS.map((b, i) => {
                  const isUnlocked = b.condition();
                  return (
                    <div key={i} style={{ ...s.badgeCard, opacity: isUnlocked ? 1 : 0.45, filter: isUnlocked ? 'none' : 'grayscale(1)', animationDelay: `${i * 0.08}s` }}>
                      {isUnlocked && <div style={s.badgeGlow} />}
                      <span style={s.badgeIcon}>{b.icon}</span>
                      <h3 style={s.badgeTitle}>{b.title}</h3>
                      <p style={s.badgeDesc}>{b.desc}</p>
                      <span style={{ ...s.badgeStatus, background: isUnlocked ? '#E8F5E9' : '#F5F5F5', color: isUnlocked ? '#2E7D32' : '#90A4AE' }}>
                        {isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Achievement Toast */}
      {newAchievement && (
        <div style={s.achievementToast}>
          <span style={s.achievementToastIcon}>{newAchievement.icon}</span>
          <div>
            <div style={s.achievementToastTitle}>Achievement Unlocked!</div>
            <div style={s.achievementToastText}>{newAchievement.title}</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Certificate styles ── */
const cert = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(26,35,126,0.5)', backdropFilter: 'blur(8px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:   { background: 'white', borderRadius: '24px', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(26,35,126,0.3)', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' },
  top:     { background: 'linear-gradient(135deg,#1A237E,#3949AB)', padding: '40px 40px 28px', textAlign: 'center' },
  stamp:   { fontSize: '3rem', display: 'block', marginBottom: '12px', animation: 'bounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1)' },
  brand:   { fontFamily: "'Fredoka One',cursive", fontSize: '2.2rem', color: 'white', margin: '0 0 4px' },
  subhead: { color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', fontSize: '0.78rem', fontWeight: 700, margin: 0 },
  body:    { padding: '36px 48px', textAlign: 'center' },
  presented:{ color: '#90A4AE', fontSize: '0.92rem', fontWeight: 600, margin: '0 0 6px' },
  name:    { fontFamily: "'Fredoka One',cursive", fontSize: '2rem', color: '#1A237E', margin: '0 0 12px' },
  course:  { fontFamily: "'Fredoka One',cursive", fontSize: '1.2rem', color: '#4FC3F7', margin: '0 0 8px' },
  modules: { color: '#90A4AE', fontSize: '0.88rem', fontWeight: 600, margin: '0 0 20px' },
  certId:  { color: '#1565C0', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 4px' },
  divider: { height: '1px', background: '#E3F2FD', margin: '20px 0' },
  date:    { color: '#B0BEC5', fontSize: '0.82rem', fontWeight: 600, margin: 0 },
  btn:     { display: 'block', width: 'calc(100% - 96px)', margin: '0 48px 36px', background: 'linear-gradient(135deg,#4FC3F7,#43C6AC)', color: 'white', border: 'none', padding: '14px', borderRadius: '999px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,195,247,0.4)' },
};

const F = "'Nunito', sans-serif";

const s = {
  page:    { minHeight: '100vh', background: '#F0F7FF', fontFamily: F, position: 'relative', overflow: 'hidden' },
  layout:  { display: 'flex', position: 'relative', zIndex: 1 },
  main:    { flex: 1, padding: '32px 40px', minHeight: 'calc(100vh - 70px)', overflowX: 'hidden' },

  blob1:   { position: 'fixed', top: '-100px', left: '-100px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,195,247,0.15) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'floatBlob 9s ease-in-out infinite' },
  blob2:   { position: 'fixed', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(206,147,216,0.13) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'floatBlob 11s ease-in-out infinite reverse' },
  blob3:   { position: 'fixed', top: '30%', right: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(105,240,174,0.1) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'floatBlob 14s ease-in-out infinite 2s' },

  nav:     { position: 'sticky', top: 0, zIndex: 100, height: '70px', background: 'linear-gradient(135deg,#1A237E 0%,#283593 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', boxShadow: '0 4px 20px rgba(26,35,126,0.3)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  navRight:{ display: 'flex', alignItems: 'center', gap: '12px' },
  navTitle:{ fontFamily: "'Fredoka One',cursive", fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' },
  menuBtn: { background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '1.2rem', width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F },
  brand:   { display: 'flex', alignItems: 'center', gap: '8px' },
  brandText:{ fontFamily: "'Fredoka One',cursive", fontSize: '1.4rem', color: 'white' },
  iconBtn: { background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '999px', fontFamily: F, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },
  avatarCircle:{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#4FC3F7,#69F0AE)', color: '#1A237E', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' },
  logoutBtn:{ background: 'linear-gradient(135deg,#FF5252,#FF1744)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '999px', fontFamily: F, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },

  sidebar:  { background: 'linear-gradient(180deg,#1A237E 0%,#283593 60%,#3949AB 100%)', transition: 'width 0.35s ease', flexShrink: 0 },
  sideInner:{ padding: '20px 14px', width: '240px', height: '100%', display: 'flex', flexDirection: 'column' },
  sideProgress:{ textAlign: 'center', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: '16px' },
  sideProgressLabel:{ color: 'white', fontWeight: 700, fontSize: '0.85rem', margin: '8px 0 2px' },
  sideProgressSub:{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', margin: 0, fontWeight: 600 },
  sideLabel:{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '8px', marginTop: '4px', paddingLeft: '10px' },
  sideBtn:  { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', background: 'transparent', border: 'none', borderRadius: '12px', color: 'rgba(255,255,255,0.72)', fontFamily: F, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginBottom: '4px', textAlign: 'left', position: 'relative', transition: 'all 0.2s' },
  sideBtnActive:{ background: 'rgba(255,255,255,0.15)', color: 'white' },
  sideBar:  { position: 'absolute', left: 0, top: '20%', height: '60%', width: '3px', background: '#4FC3F7', borderRadius: '0 3px 3px 0' },
  certBtn:  { background: 'linear-gradient(135deg,#FFD54F,#FF8F00)', color: '#1A237E', border: 'none', borderRadius: '12px', padding: '12px 16px', fontFamily: F, fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', margin: '12px 0', width: '100%', boxShadow: '0 4px 12px rgba(255,213,79,0.4)' },
  profileCard:{ marginTop: 'auto', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '13px 14px', display: 'flex', gap: '10px', alignItems: 'center' },
  profileAvatar:{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#4FC3F7,#69F0AE)', color: '#1A237E', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 },
  profileName:{ color: 'white', fontWeight: 700, fontSize: '0.88rem', margin: 0 },
  profileRole:{ color: 'rgba(255,255,255,0.5)', fontSize: '0.74rem', margin: 0 },

  fadeIn:   { animation: 'fadeUp 0.5s ease' },
  pageTitle:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  h1:       { fontFamily: "'Fredoka One',cursive", fontSize: '2rem', color: '#1A237E', margin: 0 },
  subtitle: { color: '#90A4AE', fontSize: '0.88rem', marginTop: '4px', fontWeight: 600 },

  progressPill:{ position: 'relative', background: '#E3F2FD', borderRadius: '999px', height: '34px', width: '180px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  progressPillFill: pct => ({ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: 'linear-gradient(135deg,#4FC3F7,#43C6AC)', borderRadius: '999px', transition: 'width 1s ease' }),
  progressPillText: { position: 'relative', zIndex: 1, fontWeight: 800, fontSize: '0.85rem', color: '#1A237E' },

  heroBanner:{ background: 'linear-gradient(135deg,#1A237E 0%,#283593 60%,#3949AB 100%)', borderRadius: '24px', padding: '36px 40px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  heroLeft: { flex: 1 },
  heroTitle:{ fontFamily: "'Fredoka One',cursive", fontSize: '1.8rem', color: 'white', margin: '0 0 8px' },
  heroSub:  { color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', margin: '0 0 20px', fontWeight: 600 },
  heroBtn:  { background: 'linear-gradient(135deg,#4FC3F7,#43C6AC)', color: 'white', border: 'none', padding: '13px 32px', borderRadius: '999px', fontFamily: F, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,195,247,0.4)' },
  heroBtnGold:{ background: 'linear-gradient(135deg,#FFD54F,#FF8F00)', color: '#1A237E', border: 'none', padding: '13px 32px', borderRadius: '999px', fontFamily: F, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,213,79,0.5)' },
  heroRight:{ flexShrink: 0, marginLeft: '32px' },

  modulesGrid:{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' },
  moduleCard: { background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(26,35,126,0.08)', border: '1px solid #E3F2FD', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both', overflow: 'hidden' },
  moduleCardTop:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  moduleIconBox:{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  moduleCardBadges:{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' },
  levelBadge: { padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 },
  doneBadge:  { background: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 },
  inProgBadge:{ background: '#E3F2FD', color: '#1565C0', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 },
  moduleTitle:{ fontFamily: "'Fredoka One',cursive", fontSize: '1.15rem', color: '#1A237E', margin: '0 0 8px' },
  moduleDesc: { color: '#607D8B', fontSize: '0.85rem', lineHeight: 1.55, margin: '0 0 14px' },
  moduleMeta: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
  metaChip:   { background: '#F0F7FF', color: '#90A4AE', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 },
  moduleProgress:{ borderRadius: '999px', height: '5px', marginBottom: '14px', overflow: 'hidden' },
  moduleBtn:  { width: '100%', border: 'none', padding: '11px', borderRadius: '12px', fontFamily: F, fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s' },

  drawerOverlay:{ position: 'fixed', inset: 0, background: 'rgba(26,35,126,0.4)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', justifyContent: 'flex-end' },
  drawer:     { background: 'white', width: '100%', maxWidth: '520px', height: '100%', overflowY: 'auto', animation: 'slideFromRight 0.35s ease' },
  drawerHeader:{ padding: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start' },
  drawerIcon: { fontSize: '2.5rem', flexShrink: 0 },
  drawerTitle:{ fontFamily: "'Fredoka One',cursive", fontSize: '1.4rem', color: '#1A237E', margin: '6px 0 0' },
  drawerMeta: { color: '#90A4AE', fontSize: '0.82rem', fontWeight: 600, margin: '4px 0 0' },
  drawerClose:{ marginLeft: 'auto', background: 'rgba(0,0,0,0.06)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: F },
  drawerBody: { padding: '0 28px 36px' },
  drawerDesc: { color: '#607D8B', fontSize: '0.93rem', lineHeight: 1.65, marginBottom: '24px' },
  drawerSub:  { fontFamily: "'Fredoka One',cursive", fontSize: '1.1rem', color: '#1A237E', marginBottom: '14px' },
  levelTag:   { display: 'inline-block', padding: '3px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' },
  topicsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' },
  topicChip:  { background: '#F0F7FF', padding: '9px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, color: '#37474F' },
  lessonItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', marginBottom: '8px' },
  lessonNum:  { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 },
  lessonTitle:{ fontWeight: 700, fontSize: '0.88rem', color: '#1A237E' },
  lessonDuration:{ fontSize: '0.75rem', color: '#90A4AE' },
  lessonContent:{ background: '#F0F7FF', padding: '20px', borderRadius: '16px', marginBottom: '20px' },
  drawerActions:{ display: 'flex', flexDirection: 'column', gap: '10px' },
  completedBanner:{ background: '#E8F5E9', color: '#2E7D32', padding: '16px', borderRadius: '14px', fontWeight: 700, textAlign: 'center', fontSize: '0.95rem' },
  btnStart:   { border: 'none', padding: '15px', borderRadius: '14px', color: 'white', fontFamily: F, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' },
  btnBack:    { background: '#F0F7FF', border: 'none', padding: '13px', borderRadius: '14px', color: '#607D8B', fontFamily: F, fontWeight: 700, fontSize: '0.93rem', cursor: 'pointer' },

  progCards:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '24px' },
  progCard:   { borderRadius: '20px', padding: '24px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 12px rgba(26,35,126,0.07)' },
  progCardIcon:{ fontSize: '2rem', display: 'block', marginBottom: '10px' },
  progCardVal: { fontFamily: "'Fredoka One',cursive", fontSize: '2.2rem', display: 'block' },
  progCardLabel:{ color: '#90A4AE', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginTop: '4px' },
  sectionCard: { background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 14px rgba(26,35,126,0.07)', border: '1px solid #E3F2FD' },
  sectionTitle:{ fontFamily: "'Fredoka One',cursive", fontSize: '1.2rem', color: '#1A237E', margin: '0 0 18px' },
  progRow:    { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' },
  progRowIcon:{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  progRowTitle:{ fontWeight: 700, color: '#1A237E', fontSize: '0.92rem' },
  progBarTrack:{ height: '8px', background: '#F0F7FF', borderRadius: '999px', overflow: 'hidden', marginBottom: '4px' },
  progBarFill: { height: '100%', borderRadius: '999px', transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' },
  progRowStatus:{ color: '#90A4AE', fontSize: '0.76rem', fontWeight: 600 },

  badgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '18px' },
  badgeCard:  { background: 'white', borderRadius: '20px', padding: '28px 20px', textAlign: 'center', boxShadow: '0 4px 14px rgba(26,35,126,0.08)', border: '1px solid #E3F2FD', position: 'relative', overflow: 'hidden', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both', transition: 'all 0.3s ease' },
  badgeGlow:  { position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,195,247,0.18) 0%,transparent 70%)' },
  badgeIcon:  { fontSize: '3rem', display: 'block', marginBottom: '12px', position: 'relative' },
  badgeTitle: { fontFamily: "'Fredoka One',cursive", fontSize: '1.1rem', color: '#1A237E', margin: '0 0 6px' },
  badgeDesc:  { color: '#90A4AE', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 14px', lineHeight: 1.4 },
  badgeStatus:{ display: 'inline-block', padding: '4px 14px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 700 },

  achievementToast: { position: 'fixed', bottom: '24px', right: '24px', background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', border: '2px solid #F59E0B', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 600, animation: 'slideInRight 0.4s ease', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' },
  achievementToastIcon: { fontSize: '2rem' },
  achievementToastTitle: { fontWeight: 700, color: '#92400E', fontSize: '0.78rem' },
  achievementToastText: { fontSize: '0.95rem', color: '#B45309' },
};

/* inject keyframes */
if (!document.getElementById('training-kf')) {
  const t = document.createElement('style');
  t.id = 'training-kf';
  t.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
    @keyframes fadeUp        { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn         { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
    @keyframes bounceIn      { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
    @keyframes floatBlob     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
    @keyframes slideFromRight{ from{transform:translateX(100%)} to{transform:translateX(0)} }
    @keyframes slideDown     { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideInRight  { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes spin          { to{transform:rotate(360deg)} }
    .module-card:hover       { transform: translateY(-6px) !important; box-shadow: 0 12px 32px rgba(26,35,126,0.15) !important; }
    .badge-card:hover        { transform: translateY(-5px) !important; }
    aside button:hover       { background: rgba(255,255,255,0.15) !important; color: white !important; }
  `;
  document.head.appendChild(t);
}

export default Training;
