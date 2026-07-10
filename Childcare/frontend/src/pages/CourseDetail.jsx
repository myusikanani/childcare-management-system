// File Path: src/pages/CourseDetail.jsx
// Course Detail Page - Actual lessons with videos and content

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parentLearningAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('course-detail-styles')) return;
  const style = document.createElement('style');
  style.id = 'course-detail-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Righteous&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    
    .cd-root { min-height:100vh; background:#F8FAFC; font-family:'Nunito',sans-serif; }
    .cd-nav { background:#1A1A2E; padding:16px 32px; display:flex; align-items:center; gap:16px; border-bottom:2px solid #2D2D5E; position:sticky; top:0; z-index:100; }
    .cd-back { padding:8px 16px; border-radius:999px; border:2px solid #4A4A7A; background:white; font-weight:700; cursor:pointer; font-size:0.88rem; color:#1A1A2E; }
    .cd-back:hover { border-color:#34D399; color:#059669; }
    .cd-title { font-family:'Righteous',cursive; font-size:1.2rem; color:#FFFFFF; flex:1; }
    .cd-progress { display:flex; align-items:center; gap:12px; }
    .cd-progress-bar { width:150px; height:8px; background:#E5F7EE; border-radius:999px; overflow:hidden; }
    .cd-progress-fill { height:100%; background:linear-gradient(90deg,#34D399,#059669); transition:width 0.5s ease; }
    .cd-progress-text { font-size:0.82rem; font-weight:700; color:#34D399; }
    
    .cd-layout { display:grid; grid-template-columns:350px 1fr; min-height:calc(100vh - 70px); }
    
    /* Sidebar */
    .cd-sidebar { background:#1A1A2E; border-right:2px solid #2D2D5E; overflow-y:auto; }
    .cd-lessons { padding:20px; }
    .cd-lesson-header { font-weight:800; font-size:0.88rem; color:#34D399; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px; }
    .cd-lesson-item { padding:14px 16px; border-radius:12px; margin-bottom:8px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:12px; }
    .cd-lesson-item:hover { background:rgba(52,211,153,0.1); }
    .cd-lesson-item.active { background:rgba(52,211,153,0.15); border:2px solid #34D399; }
    .cd-lesson-item.completed { opacity:0.7; }
    .cd-lesson-num { width:28px; height:28px; border-radius:50%; background:rgba(52,211,153,0.2); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.78rem; color:#34D399; flex-shrink:0; }
    .cd-lesson-item.active .cd-lesson-num { background:#059669; color:white; }
    .cd-lesson-item.completed .cd-lesson-num { background:#34D399; color:white; }
    .cd-lesson-info { flex:1; }
    .cd-lesson-name { font-weight:700; font-size:0.88rem; color:#FFFFFF; margin-bottom:2px; }
    .cd-lesson-duration { font-size:0.75rem; color:#A0AEC0; }
    
    /* Main Content */
    .cd-content { padding:32px; overflow-y:auto; }
    .cd-video-container { position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:16px; margin-bottom:24px; background:#000; }
    .cd-video { position:absolute; top:0; left:0; width:100%; height:100%; border:none; }
    .cd-video-placeholder { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(135deg,#059669,#0EA5E9); color:white !important; }
    .cd-video-placeholder-icon { font-size:4rem; margin-bottom:12px; color:white; }
    .cd-video-placeholder-text { font-weight:700; font-size:1.1rem; color:white; }
    
    .cd-lesson-title { font-family:'Righteous',cursive; font-size:1.8rem; color:#1A1A2E; margin-bottom:8px; }
    .cd-lesson-meta { display:flex; gap:16px; margin-bottom:24px; }
    .cd-meta-tag { background:#F0FDF4; color:#059669; padding:6px 14px; border-radius:999px; font-size:0.82rem; font-weight:700; }
    
    .cd-lesson-body { font-size:1rem; color:#374151; line-height:1.8; margin-bottom:24px; }
    .cd-lesson-body h3 { font-weight:800; color:#1A1A2E; margin:24px 0 12px; font-size:1.1rem; }
    .cd-lesson-body ul { padding-left:24px; margin:12px 0; }
    .cd-lesson-body li { margin-bottom:8px; }
    .cd-lesson-body p { margin-bottom:16px; }
    
    .cd-tip-box { background:#FEF3C7; border:2px solid #FDE68A; border-radius:16px; padding:20px; margin-bottom:24px; }
    .cd-tip-title { font-weight:800; color:#92400E; margin-bottom:8px; display:flex; align-items:center; gap:8px; }
    .cd-tip-text { color:#B45309; font-size:0.95rem; line-height:1.6; }
    
    .cd-action { display:flex; gap:12px; margin-top:32px; }
    .cd-btn { padding:14px 28px; border-radius:999px; font-family:'Nunito',sans-serif; font-weight:800; font-size:0.95rem; cursor:pointer; transition:all 0.2s; }
    .cd-btn-primary { background:linear-gradient(135deg,#34D399,#059669); color:white; border:none; }
    .cd-btn-primary:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(52,211,153,0.4); }
    .cd-btn-secondary { background:white; color:#059669; border:2px solid #34D399; }
    .cd-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    
    /* Completion */
    .cd-complete-card { background:white; border-radius:24px; padding:48px; text-align:center; border:2px solid #BBF7D0; }
    .cd-complete-icon { font-size:5rem; margin-bottom:20px; }
    .cd-complete-title { font-family:'Righteous',cursive; font-size:2rem; color:#059669; margin-bottom:12px; }
    .cd-complete-text { color:#666; font-size:1.1rem; margin-bottom:24px; }
    .cd-complete-xp { background:linear-gradient(135deg,#F0FDF4,#DCFCE7); border-radius:16px; padding:20px; margin-bottom:24px; display:inline-block; }
    .cd-complete-xp-num { font-family:'Righteous',cursive; font-size:2.5rem; color:#059669; }
    .cd-complete-xp-label { font-size:0.85rem; color:#666; }
    
    /* Loading */
    .cd-loading { display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .cd-spinner { width:48px; height:48px; border:4px solid #E5F7EE; border-top-color:#059669; border-radius:50%; animation:spin 1s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    
    /* Achievement Toast */
    .cd-achievement-toast { position:fixed; bottom:24px; right:24px; background:linear-gradient(135deg,#FEF3C7,#FDE68A); border:2px solid #F59E0B; border-radius:16px; padding:16px 24px; display:flex; align-items:center; gap:12px; z-index:300; animation:slideInRight 0.4s ease; }
    @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
    .cd-achievement-icon { font-size:2rem; }
    .cd-achievement-text { font-weight:700; color:#92400E; }
    
    @media (max-width:768px) {
      .cd-layout { grid-template-columns:1fr; }
      .cd-sidebar { display:none; }
    }
  `;
  document.head.appendChild(style);
};

// ── Helper: extract embed URL from YouTube/Vimeo links ────────
const getEmbedUrl = (url) => {
  if (!url) return null;
  // YouTube
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // Vimeo
  match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  // Already an embed URL
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  return null;
};

const CourseDetail = () => {
  injectCSS();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      // Fetch all content
      const contentRes = await parentLearningAPI.getContent();
      if (contentRes.success) {
        const foundCourse = contentRes.courses.find(c => c._id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          
          // Use lessons from the database
          if (foundCourse.lessons && foundCourse.lessons.length > 0) {
            setLessons(foundCourse.lessons);
          } else {
            setLessons([{ title: 'Coming Soon', duration: 0, content: '<p>Lessons are being prepared.</p>' }]);
          }
        }
      }
      
      // Fetch progress
      if (isAuthenticated) {
        const progressRes = await parentLearningAPI.getProgress();
        if (progressRes.success) {
          const courseProgress = progressRes.progress.find(p => 
            p.courseId === courseId || p.courseId?._id === courseId
          );
          if (courseProgress) {
            setCompletedLessons(courseProgress.completedLessons?.map(l => l.lessonIndex) || []);
            setProgress(courseProgress.progress || 0);
            
            // Set current lesson to first uncompleted
            const nextLesson = courseProgress.completedLessons?.length || 0;
            setCurrentLesson(Math.min(nextLesson, lessons.length - 1));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    }
    setLoading(false);
  };

  const handleCompleteLesson = async () => {
    if (!isAuthenticated) {
      alert('Please login to track progress');
      return;
    }

    try {
      // Mark lesson complete
      const res = await parentLearningAPI.completeLesson(courseId, currentLesson);
      
      if (res.success) {
        const newCompleted = [...completedLessons, currentLesson];
        setCompletedLessons(newCompleted);
        
        // Update progress
        const newProgress = Math.round((newCompleted.length / lessons.length) * 100);
        setProgress(newProgress);
        
        // Show achievement if earned
        if (res.achievements?.length > 0) {
          setNewAchievement(res.achievements[0]);
          setTimeout(() => setNewAchievement(null), 4000);
        }
        
        // Check if course completed
        if (newCompleted.length >= lessons.length) {
          setShowCompletion(true);
        } else {
          // Move to next lesson
          setCurrentLesson(currentLesson + 1);
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
      // Still move to next lesson locally
      const newCompleted = [...completedLessons, currentLesson];
      setCompletedLessons(newCompleted);
      const newProgress = Math.round((newCompleted.length / lessons.length) * 100);
      setProgress(newProgress);
      
      if (newCompleted.length >= lessons.length) {
        setShowCompletion(true);
      } else {
        setCurrentLesson(currentLesson + 1);
      }
    }
  };

  const lesson = lessons[currentLesson];

  if (loading) {
    return (
      <div className="cd-loading">
        <div className="cd-spinner" />
      </div>
    );
  }

  if (!course && !lessons.length) {
    return (
      <div className="cd-root">
        <div className="cd-nav">
          <button className="cd-back" onClick={() => navigate('/learning')}>← Back to Learning</button>
        </div>
        <div style={{ padding: 48, textAlign: 'center' }}>
          <h2>Course not found</h2>
          <button className="cd-back" onClick={() => navigate('/learning')}>Return to Learning Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-root">
      {/* Navigation */}
      <nav className="cd-nav">
        <button className="cd-back" onClick={() => navigate('/learning')}>← Back</button>
        <h1 className="cd-title">{course?.title || 'Course'}</h1>
        <div className="cd-progress">
          <div className="cd-progress-bar">
            <div className="cd-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="cd-progress-text">{progress}%</span>
        </div>
      </nav>

      <div className="cd-layout">
        {/* Sidebar - Lessons List */}
        <aside className="cd-sidebar">
          <div className="cd-lessons">
            <div className="cd-lesson-header">Course Content</div>
            {lessons.map((l, idx) => {
              const isCompleted = completedLessons.includes(idx);
              const isActive = idx === currentLesson;
              return (
                <div
                  key={idx}
                  className={`cd-lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setCurrentLesson(idx)}
                >
                  <div className="cd-lesson-num">
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className="cd-lesson-info">
                    <div className="cd-lesson-name">{l.title}</div>
                    <div className="cd-lesson-duration">⏱ {l.duration} min</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="cd-content">
          {showCompletion ? (
            /* Course Completion */
            <div className="cd-complete-card">
              <div className="cd-complete-icon">🎉</div>
              <h2 className="cd-complete-title">Course Completed!</h2>
              <p className="cd-complete-text">
                Congratulations! You've successfully completed this course.
              </p>
              <div className="cd-complete-xp">
                <div className="cd-complete-xp-num">+{course?.xpReward || 100}</div>
                <div className="cd-complete-xp-label">XP Earned!</div>
              </div>
              <div>
                <button className="cd-btn cd-btn-primary" onClick={() => navigate('/learning')}>
                  Continue Learning
                </button>
              </div>
            </div>
          ) : lesson ? (
            /* Lesson Content */
            <>
              {/* Video */}
              <div className="cd-video-container">
                {getEmbedUrl(lesson.videoUrl) ? (
                  <iframe
                    className="cd-video"
                    src={getEmbedUrl(lesson.videoUrl)}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="cd-video-placeholder">
                    <div className="cd-video-placeholder-icon">🎬</div>
                    <div className="cd-video-placeholder-text">Lesson Video</div>
                    <div style={{ fontSize: '0.85rem', marginTop: 8, opacity: 0.8, color: 'white' }}>
                      {lesson.duration} minutes
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              <h1 className="cd-lesson-title">{lesson.title}</h1>
              <div className="cd-lesson-meta">
                <span className="cd-meta-tag">📺 Video Lesson</span>
                <span className="cd-meta-tag">⏱ {lesson.duration} min</span>
                <span className="cd-meta-tag">📝 Lesson {currentLesson + 1} of {lessons.length}</span>
              </div>

              {/* Content */}
              <div className="cd-lesson-body" dangerouslySetInnerHTML={{ __html: lesson.content }} />

              {/* Tip Box */}
              {lesson.tip && (
                <div className="cd-tip-box">
                  <div className="cd-tip-title">💡 Pro Tip</div>
                  <div className="cd-tip-text">{lesson.tip}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="cd-action">
                {currentLesson > 0 && (
                  <button
                    className="cd-btn cd-btn-secondary"
                    onClick={() => setCurrentLesson(currentLesson - 1)}
                  >
                    ← Previous
                  </button>
                )}
                
                {completedLessons.includes(currentLesson) ? (
                  <button className="cd-btn cd-btn-secondary" disabled>
                    ✓ Completed
                  </button>
                ) : (
                  <button className="cd-btn cd-btn-primary" onClick={handleCompleteLesson}>
                    ✓ Mark as Complete (+10 XP)
                  </button>
                )}

                {currentLesson < lessons.length - 1 && completedLessons.includes(currentLesson) && (
                  <button
                    className="cd-btn cd-btn-secondary"
                    onClick={() => setCurrentLesson(currentLesson + 1)}
                  >
                    Next →
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <p>Loading lesson content...</p>
            </div>
          )}
        </main>
      </div>

      {/* Achievement Toast */}
      {newAchievement && (
        <div className="cd-achievement-toast">
          <span className="cd-achievement-icon">{newAchievement.icon}</span>
          <span className="cd-achievement-text">Achievement: {newAchievement.title}</span>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
