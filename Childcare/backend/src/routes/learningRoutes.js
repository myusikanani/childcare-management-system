// File Path: backend/src/routes/learningRoutes.js
// Learning System Routes

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getCourses,
    getCourseById,
    getProgress,
    enrollInCourse,
    completeLesson,
    submitQuiz,
    generateCertificate,
    getCertificates,
    getLeaderboard,
    seedDefaultCourses
} = require('../controllers/learningController');

// Public routes
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.get('/leaderboard', protect, getLeaderboard);

// Protected routes
router.get('/progress', protect, getProgress);
router.post('/enroll', protect, enrollInCourse);
router.put('/lesson-complete', protect, completeLesson);
router.post('/quiz-submit', protect, submitQuiz);
router.post('/certificate', protect, generateCertificate);
router.get('/certificates', protect, getCertificates);

// Admin route - seed courses
router.post('/seed', seedDefaultCourses);

module.exports = router;
