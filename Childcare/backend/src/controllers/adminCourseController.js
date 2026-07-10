// File Path: backend/src/controllers/adminCourseController.js
// Admin Course Management - CRUD for ParentCourses and Lessons

const { ParentCourse } = require('../models/ParentLearning');

// GET /api/admin-courses/ - Get all courses (including inactive)
const getAllCourses = async (req, res) => {
    const courses = await ParentCourse.find().sort({ _id: -1 });
    res.json({ success: true, courses });
};

// GET /api/admin-courses/:id - Get single course
const getCourseById = async (req, res) => {
    const course = await ParentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
};

// POST /api/admin-courses/ - Create course
const createCourse = async (req, res) => {
    const { title, banner, color, background, category, description, duration, xpReward, badge, lessons } = req.body;
    const course = await ParentCourse.create({
        title, banner, color, background, category, description, duration, xpReward, badge,
        lessons: lessons || [],
        totalLessons: lessons?.length || 0
    });
    res.status(201).json({ success: true, course });
};

// PUT /api/admin-courses/:id - Update course
const updateCourse = async (req, res) => {
    const course = await ParentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const { title, banner, color, background, category, description, duration, xpReward, badge, isActive } = req.body;
    if (title !== undefined) course.title = title;
    if (banner !== undefined) course.banner = banner;
    if (color !== undefined) course.color = color;
    if (background !== undefined) course.background = background;
    if (category !== undefined) course.category = category;
    if (description !== undefined) course.description = description;
    if (duration !== undefined) course.duration = duration;
    if (xpReward !== undefined) course.xpReward = xpReward;
    if (badge !== undefined) course.badge = badge;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();
    res.json({ success: true, course });
};

// DELETE /api/admin-courses/:id - Delete course
const deleteCourse = async (req, res) => {
    const course = await ParentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await ParentCourse.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
};

// POST /api/admin-courses/:id/lessons - Add lesson
const addLesson = async (req, res) => {
    const course = await ParentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const { title, duration, content, videoUrl, tip } = req.body;
    course.lessons.push({
        title: title || 'New Lesson',
        duration: duration || 5,
        content: content || '',
        videoUrl: videoUrl || '',
        tip: tip || '',
        order: course.lessons.length
    });
    course.totalLessons = course.lessons.length;
    await course.save();
    res.json({ success: true, course });
};

// PUT /api/admin-courses/:id/lessons/:lessonIndex - Update lesson
const updateLesson = async (req, res) => {
    const course = await ParentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const idx = parseInt(req.params.lessonIndex);
    if (idx < 0 || idx >= course.lessons.length) {
        return res.status(400).json({ success: false, message: 'Invalid lesson index' });
    }

    const { title, duration, content, videoUrl, tip } = req.body;
    if (title !== undefined) course.lessons[idx].title = title;
    if (duration !== undefined) course.lessons[idx].duration = duration;
    if (content !== undefined) course.lessons[idx].content = content;
    if (videoUrl !== undefined) course.lessons[idx].videoUrl = videoUrl;
    if (tip !== undefined) course.lessons[idx].tip = tip;

    await course.save();
    res.json({ success: true, course });
};

// DELETE /api/admin-courses/:id/lessons/:lessonIndex - Delete lesson
const deleteLesson = async (req, res) => {
    const course = await ParentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const idx = parseInt(req.params.lessonIndex);
    if (idx < 0 || idx >= course.lessons.length) {
        return res.status(400).json({ success: false, message: 'Invalid lesson index' });
    }

    course.lessons.splice(idx, 1);
    course.totalLessons = course.lessons.length;
    await course.save();
    res.json({ success: true, course });
};

module.exports = {
    getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse,
    addLesson, updateLesson, deleteLesson
};
