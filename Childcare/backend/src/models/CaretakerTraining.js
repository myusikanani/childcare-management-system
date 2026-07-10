// File Path: backend/src/models/CaretakerTraining.js
// Caretaker Training System Models

const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    moduleId: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    totalLessons: { type: Number, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    color: { type: String, required: true },
    background: { type: String, required: true },
    topics: [{ type: String }],
    lessons: [{
        title: { type: String, required: true },
        duration: { type: Number, required: true },
        content: { type: String },
        videoPlaceholder: { type: String, default: '' }
    }],
    quiz: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correct: { type: Number, required: true }
    }],
    xpReward: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});

const caretakerProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moduleId: { type: String, required: true },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
    startedAt: { type: Date },
    completedAt: { type: Date },
    completedLessons: [{
        lessonIndex: Number,
        completedAt: { type: Date, default: Date.now }
    }],
    quizScore: { type: Number },
    quizAttempts: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    lastAccessedAt: { type: Date, default: Date.now }
});

const caretakerAchievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now }
});

const trainingStreakSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastTrainingDate: { type: Date },
    totalTrainingDays: { type: Number, default: 0 }
});

const Module = mongoose.model('CaretakerModule', moduleSchema);
const CaretakerProgress = mongoose.model('CaretakerProgress', caretakerProgressSchema);
const CaretakerAchievement = mongoose.model('CaretakerAchievement', caretakerAchievementSchema);
const TrainingStreak = mongoose.model('TrainingStreak', trainingStreakSchema);

module.exports = { Module, CaretakerProgress, CaretakerAchievement, TrainingStreak };
