// File Path: backend/src/routes/parentLearningRoutes.js
// Parent Learning Routes

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAllContent,
    getProgress,
    markArticleRead,
    enrollInCourse,
    completeLesson,
    toggleActivitySave,
    toggleRecipeSave,
    getArticleComments,
    addArticleComment,
    toggleCommentLike
} = require('../controllers/parentLearningController');

// Public routes
router.get('/content', getAllContent);

// Protected routes
router.get('/progress', protect, getProgress);
router.post('/article-read', protect, markArticleRead);
router.post('/enroll', protect, enrollInCourse);
router.put('/lesson-complete', protect, completeLesson);
router.put('/activity-save', protect, toggleActivitySave);
router.put('/recipe-save', protect, toggleRecipeSave);

// Article comments
router.get('/article/:id/comments', getArticleComments);
router.post('/article/:id/comment', protect, addArticleComment);
router.put('/comment/:id/like', protect, toggleCommentLike);

module.exports = router;
