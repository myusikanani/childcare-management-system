// File Path: backend/src/routes/caretakerTrainingRoutes.js
// Caretaker Training API Routes

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAllModules,
    getProgress,
    startModule,
    completeLesson,
    submitQuiz,
    getCertificate
} = require('../controllers/caretakerTrainingController');

// Public route - get all modules
router.get('/modules', getAllModules);

// Protected routes - require authentication
router.get('/progress', protect, getProgress);
router.post('/start-module', protect, startModule);
router.put('/complete-lesson', protect, completeLesson);
router.post('/submit-quiz', protect, submitQuiz);
router.get('/certificate', protect, getCertificate);

module.exports = router;
