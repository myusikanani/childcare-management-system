// File Path: backend/src/routes/adminCourseRoutes.js
// Admin routes for managing courses and lessons

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse,
    addLesson, updateLesson, deleteLesson
} = require('../controllers/adminCourseController');

// All routes require auth + admin
router.use(protect, adminOnly);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

router.post('/:id/lessons', addLesson);
router.put('/:id/lessons/:lessonIndex', updateLesson);
router.delete('/:id/lessons/:lessonIndex', deleteLesson);

module.exports = router;
