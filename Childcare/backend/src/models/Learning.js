// File Path: backend/src/models/Learning.js
// Learning System Models - Courses, Lessons, Quizzes, Progress, Certificates

const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
// QUIZ QUESTION SCHEMA
// ─────────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    type: {
        type: String,
        enum: ['mcq', 'truefalse', 'fillblank'],
        default: 'mcq'
    },
    options: [{ type: String }], // For MCQ
    correctAnswer: { type: String, required: true }, // Index for MCQ, "true"/"false" for T/F
    explanation: { type: String, default: '' },
    points: { type: Number, default: 10 }
});

// ─────────────────────────────────────────────────────────────
// QUIZ SCHEMA
// ─────────────────────────────────────────────────────────────
const quizSchema = new mongoose.Schema({
    questions: [questionSchema],
    passingScore: { type: Number, default: 70 }, // Percentage
    timeLimit: { type: Number, default: 0 }, // Minutes, 0 = no limit
    maxAttempts: { type: Number, default: 3 },
    xpReward: { type: Number, default: 25 }
});

// ─────────────────────────────────────────────────────────────
// LESSON SCHEMA
// ─────────────────────────────────────────────────────────────
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'assignment'],
        default: 'text'
    },
    content: { type: String, default: '' }, // Video URL or text content
    duration: { type: Number, default: 5 }, // Minutes
    order: { type: Number, required: true },
    resources: [{
        name: String,
        type: { type: String, enum: ['pdf', 'link', 'download'] },
        url: String
    }],
    xpReward: { type: Number, default: 10 }
});

// ─────────────────────────────────────────────────────────────
// COURSE SCHEMA
// ─────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    icon: { type: String, default: '📚' },
    description: { type: String, default: '' },
    category: {
        type: String,
        enum: ['development', 'play', 'nutrition', 'emotional', 'safety', 'professional'],
        default: 'development'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    thumbnail: { type: String, default: '' },
    duration: { type: Number, default: 30 }, // Total minutes
    lessons: [lessonSchema],
    quiz: quizSchema,
    xpReward: { type: Number, default: 100 }, // XP for completing course
    certificateTemplate: { type: String, default: 'default' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 }
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────
// USER PROGRESS SCHEMA
// ─────────────────────────────────────────────────────────────
const lessonProgressSchema = new mongoose.Schema({
    lessonId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    watchedSeconds: { type: Number, default: 0 },
    completedAt: { type: Date }
});

const quizAttemptSchema = new mongoose.Schema({
    quizId: { type: String },
    score: { type: Number, required: true },
    passed: { type: Boolean, default: false },
    answers: [{ questionId: String, answer: String, correct: Boolean }],
    attemptedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 } // Seconds
});

const userProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    
    // Lesson progress
    completedLessons: [lessonProgressSchema],
    currentLesson: { type: String, default: null },
    
    // Quiz attempts
    quizAttempts: [quizAttemptSchema],
    quizPassed: { type: Boolean, default: false },
    bestQuizScore: { type: Number, default: 0 },
    
    // XP tracking
    xpEarned: { type: Number, default: 0 },
    
    // Certificate
    certificateEarned: { type: Boolean, default: false },
    certificateId: { type: String },
    
    // Status
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    }
}, { timestamps: true });

// Compound index for user progress
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────
// CERTIFICATE SCHEMA
// ─────────────────────────────────────────────────────────────
const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    verificationCode: { type: String, required: true, unique: true },
    
    // Certificate details
    courseName: { type: String, required: true },
    userName: { type: String, required: true },
    
    // Performance
    finalScore: { type: Number, required: true },
    completionDate: { type: Date, default: Date.now },
    validUntil: { type: Date }, // null = never expires
    
    // Status
    isValid: { type: Boolean, default: true },
    issuedBy: { type: String, default: 'Trusted Care Platform' }
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────
// USER ACHIEVEMENTS SCHEMA
// ─────────────────────────────────────────────────────────────
const achievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
});

achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────
// EXPORT MODELS
// ─────────────────────────────────────────────────────────────
const Course = mongoose.model('Course', courseSchema);
const UserProgress = mongoose.model('UserProgress', userProgressSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = {
    Course,
    UserProgress,
    Certificate,
    Achievement,
    questionSchema,
    quizSchema,
    lessonSchema
};
