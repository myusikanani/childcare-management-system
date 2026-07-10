// File Path: backend/src/models/ParentLearning.js
// Parent Learning System Models - Articles, Activities, Recipes, Progress, Achievements

const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
// ARTICLE SCHEMA
// ─────────────────────────────────────────────────────────────
const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    icon: { type: String, default: '📖' },
    category: {
        type: String,
        enum: ['development', 'play', 'nutrition', 'emotional', 'health', 'education'],
        default: 'development'
    },
    content: { type: String, default: '' },
    readTime: { type: Number, default: 5 }, // minutes
    author: { type: String, default: 'Parenting Expert' },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now }
});

// ─────────────────────────────────────────────────────────────
// ACTIVITY SCHEMA
// ─────────────────────────────────────────────────────────────
const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    icon: { type: String, default: '🎨' },
    description: { type: String, default: '' },
    ageRangeMin: { type: Number, default: 6 }, // months
    ageRangeMax: { type: Number, default: 48 }, // months
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    },
    category: {
        type: String,
        enum: ['Creative', 'Cognitive', 'Physical', 'Musical', 'Sensory', 'Problem Solving'],
        default: 'Creative'
    },
    materials: [{ type: String }],
    instructions: { type: String, default: '' },
    benefits: [{ type: String }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    saveCount: { type: Number, default: 0 }
});

// ─────────────────────────────────────────────────────────────
// RECIPE SCHEMA
// ─────────────────────────────────────────────────────────────
const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    icon: { type: String, default: '🍽️' },
    description: { type: String, default: '' },
    category: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'],
        default: 'Snack'
    },
    ageGroup: { type: String, default: '12m+' },
    prepTime: { type: Number, default: 10 }, // minutes
    cookTime: { type: Number, default: 0 }, // minutes
    ingredients: [{ type: String }],
    steps: [{ type: String }],
    nutritionInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fiber: Number
    },
    tags: [{ type: String }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    saveCount: { type: Number, default: 0 }
});

// ─────────────────────────────────────────────────────────────
// COURSE SCHEMA (for parents)
// ─────────────────────────────────────────────────────────────
const parentCourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    banner: { type: String, default: '📚' },
    color: { type: String, default: '#059669' },
    background: { type: String, default: '#E8F5E9' },
    category: {
        type: String,
        enum: ['development', 'play', 'nutrition', 'emotional', 'health', 'education'],
        default: 'development'
    },
    description: { type: String, default: '' },
    lessons: [{
        title: String,
        duration: Number,
        content: String,
        videoUrl: { type: String, default: '' },
        tip: { type: String, default: '' },
        order: { type: Number, default: 0 }
    }],
    totalLessons: { type: Number, default: 1 },
    duration: { type: String, default: '1h' },
    xpReward: { type: Number, default: 50 },
    badge: { type: String, default: null },
    isActive: { type: Boolean, default: true }
});

// ─────────────────────────────────────────────────────────────
// PARENT PROGRESS SCHEMA
// ─────────────────────────────────────────────────────────────
const lessonProgressSchema = new mongoose.Schema({
    lessonIndex: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
});

const parentProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParentCourse' },
    completedLessons: [lessonProgressSchema],
    currentLesson: { type: Number, default: 0 },
    progress: { type: Number, default: 0 }, // percentage
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    xpEarned: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    }
});

parentProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────
// ARTICLE READ HISTORY
// ─────────────────────────────────────────────────────────────
const articleReadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    readAt: { type: Date, default: Date.now },
    xpEarned: { type: Number, default: 5 }
});

articleReadSchema.index({ userId: 1, articleId: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────
// ACHIEVEMENT SCHEMA
// ─────────────────────────────────────────────────────────────
const parentAchievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
});

parentAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────
// ARTICLE COMMENT SCHEMA
// ─────────────────────────────────────────────────────────────
const articleCommentSchema = new mongoose.Schema({
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

// ─────────────────────────────────────────────────────────────
// EXPORT MODELS
// ─────────────────────────────────────────────────────────────
const Article = mongoose.model('Article', articleSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Recipe = mongoose.model('Recipe', recipeSchema);
const ParentCourse = mongoose.model('ParentCourse', parentCourseSchema);
const ParentProgress = mongoose.model('ParentProgress', parentProgressSchema);
const ArticleRead = mongoose.model('ArticleRead', articleReadSchema);
const ParentAchievement = mongoose.model('ParentAchievement', parentAchievementSchema);
const ArticleComment = mongoose.model('ArticleComment', articleCommentSchema);

module.exports = {
    Article,
    Activity,
    Recipe,
    ParentCourse,
    ParentProgress,
    ArticleRead,
    ParentAchievement,
    ArticleComment
};
