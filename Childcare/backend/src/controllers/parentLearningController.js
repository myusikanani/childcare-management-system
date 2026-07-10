// File Path: backend/src/controllers/parentLearningController.js
// Parent Learning System Controller

const {
    Article,
    Activity,
    Recipe,
    ParentCourse,
    ParentProgress,
    ArticleRead,
    ParentAchievement,
    ArticleComment
} = require('../models/ParentLearning');

// ── Achievement definitions ────────────────────────────────
const ACHIEVEMENTS = {
    FIRST_ARTICLE: { id: 'first_article', title: 'First Read', description: 'Read your first article', icon: '📖' },
    FAMILY_READER: { id: 'family_reader', title: 'Family Reader', description: 'Read 10 articles', icon: '📚' },
    SUPER_PARENT: { id: 'super_parent', title: 'Super Parent', description: 'Complete 5 courses', icon: '🏆' },
    CHEF_PARENT: { id: 'chef_parent', title: 'Chef Parent', description: 'Try 5 recipes', icon: '👨‍🍳' },
    ACTIVITY_STAR: { id: 'activity_star', title: 'Activity Star', description: 'Save 10 activities', icon: '⭐' },
    STREAK_7: { id: 'streak_7', title: '7-Day Streak', description: 'Learn 7 days in a row', icon: '🔥' },
    XP_MASTER: { id: 'xp_master', title: 'XP Master', description: 'Earn 1000 XP', icon: '💯' },
    MILESTONE_TRACKER: { id: 'milestone_tracker', title: 'Milestone Tracker', description: 'Track 3 child milestones', icon: '🎯' },
    FIRST_COURSE: { id: 'first_course', title: 'First Course', description: 'Complete your first course', icon: '🎓' },
    RECIPE_SAVER: { id: 'recipe_saver', title: 'Recipe Saver', description: 'Save 5 recipes', icon: '📝' }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get all learning content (articles, activities, recipes)
// @route GET /api/parent-learning/content
// ─────────────────────────────────────────────────────────────
const getAllContent = async (req, res) => {
    try {
        const [articles, activities, recipes, courses] = await Promise.all([
            Article.find({ isPublished: true }).sort({ publishedAt: -1 }),
            Activity.find(),
            Recipe.find(),
            ParentCourse.find({ isActive: true })
        ]);

        // Seed default content if empty
        if (articles.length === 0) await seedArticles();
        if (activities.length === 0) await seedActivities();
        if (recipes.length === 0) await seedRecipes();
        if (courses.length === 0) await seedCourses();

        // Fetch fresh data
        const [freshArticles, freshActivities, freshRecipes, freshCourses] = await Promise.all([
            Article.find({ isPublished: true }).sort({ publishedAt: -1 }),
            Activity.find(),
            Recipe.find(),
            ParentCourse.find({ isActive: true })
        ]);

        res.status(200).json({
            success: true,
            articles: freshArticles,
            activities: freshActivities,
            recipes: freshRecipes,
            courses: freshCourses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get user's learning progress
// @route GET /api/parent-learning/progress
// ─────────────────────────────────────────────────────────────
const getProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        const [progress, achievements, articleReads, savedActivities, savedRecipes] = await Promise.all([
            ParentProgress.find({ userId }).populate('courseId', 'title banner'),
            ParentAchievement.find({ userId }),
            ArticleRead.find({ userId }),
            Activity.find({ savedBy: userId }),
            Recipe.find({ savedBy: userId })
        ]);

        // Calculate stats
        const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0) + (articleReads.length * 5);
        const level = Math.floor(totalXP / 100) + 1;
        const xpToNextLevel = 100 - (totalXP % 100);

        const completedCourses = progress.filter(p => p.status === 'completed').length;

        res.status(200).json({
            success: true,
            progress,
            achievements,
            stats: {
                totalXP,
                level,
                xpToNextLevel,
                articlesRead: articleReads.length,
                completedCourses,
                savedActivities: savedActivities.length,
                savedRecipes: savedRecipes.length
            },
            savedActivities: savedActivities.map(a => a._id),
            savedRecipes: savedRecipes.map(r => r._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Mark article as read
// @route POST /api/parent-learning/article-read
// ─────────────────────────────────────────────────────────────
const markArticleRead = async (req, res) => {
    try {
        const { articleId } = req.body;
        const userId = req.user._id;

        const article = await Article.findByIdAndUpdate(
            articleId,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        // Create or update read record
        let readRecord = await ArticleRead.findOne({ userId, articleId });
        let xpEarned = 0;

        if (!readRecord) {
            readRecord = await ArticleRead.create({
                userId,
                articleId,
                xpEarned: 5
            });
            xpEarned = 5;

            // Update article views
            await Article.findByIdAndUpdate(articleId, { $inc: { views: 1 } });
        }

        // Check achievements
        const achievements = await checkAchievements(userId);

        res.status(200).json({
            success: true,
            xpEarned,
            achievements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Enroll in a course
// @route POST /api/parent-learning/enroll
// ─────────────────────────────────────────────────────────────
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const course = await ParentCourse.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        let progress = await ParentProgress.findOne({ userId, courseId });

        if (progress) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled',
                progress
            });
        }

        progress = await ParentProgress.create({
            userId,
            courseId,
            status: 'in_progress',
            startedAt: new Date()
        });

        res.status(201).json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Complete a lesson
// @route PUT /api/parent-learning/lesson-complete
// ─────────────────────────────────────────────────────────────
const completeLesson = async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.body;
        const userId = req.user._id;

        const course = await ParentCourse.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        let progress = await ParentProgress.findOne({ userId, courseId });

        if (!progress) {
            progress = await ParentProgress.create({
                userId,
                courseId,
                status: 'in_progress',
                startedAt: new Date()
            });
        }

        // Check if lesson already completed
        const existingLesson = progress.completedLessons.find(l => l.lessonIndex === lessonIndex);
        if (!existingLesson) {
            progress.completedLessons.push({
                lessonIndex,
                completed: true,
                completedAt: new Date()
            });

            const completedCount = progress.completedLessons.length;
            progress.progress = Math.round((completedCount / course.totalLessons) * 100);
            progress.currentLesson = lessonIndex + 1;
            progress.xpEarned += 10; // XP per lesson

            // Check if course completed
            if (completedCount >= course.totalLessons) {
                progress.status = 'completed';
                progress.completedAt = new Date();
                progress.xpEarned += course.xpReward; // Bonus XP for completion
            }

            await progress.save();

            // Check achievements
            const achievements = await checkAchievements(userId);

            res.status(200).json({
                success: true,
                progress,
                xpEarned: 10,
                courseCompleted: progress.status === 'completed',
                achievements
            });
        } else {
            res.status(200).json({
                success: true,
                progress,
                xpEarned: 0,
                alreadyCompleted: true
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Save/unsave activity
// @route PUT /api/parent-learning/activity-save
// ─────────────────────────────────────────────────────────────
const toggleActivitySave = async (req, res) => {
    try {
        const { activityId } = req.body;
        const userId = req.user._id;

        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }

        const isSaved = activity.savedBy.includes(userId);

        if (isSaved) {
            await Activity.findByIdAndUpdate(activityId, {
                $pull: { savedBy: userId },
                $inc: { saveCount: -1 }
            });
        } else {
            await Activity.findByIdAndUpdate(activityId, {
                $addToSet: { savedBy: userId },
                $inc: { saveCount: 1 }
            });
        }

        // Check achievements
        const achievements = await checkAchievements(userId);

        res.status(200).json({
            success: true,
            saved: !isSaved,
            achievements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Save/unsave recipe
// @route PUT /api/parent-learning/recipe-save
// ─────────────────────────────────────────────────────────────
const toggleRecipeSave = async (req, res) => {
    try {
        const { recipeId } = req.body;
        const userId = req.user._id;

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        const isSaved = recipe.savedBy.includes(userId);

        if (isSaved) {
            await Recipe.findByIdAndUpdate(recipeId, {
                $pull: { savedBy: userId },
                $inc: { saveCount: -1 }
            });
        } else {
            await Recipe.findByIdAndUpdate(recipeId, {
                $addToSet: { savedBy: userId },
                $inc: { saveCount: 1 }
            });
        }

        // Check achievements
        const achievements = await checkAchievements(userId);

        res.status(200).json({
            success: true,
            saved: !isSaved,
            achievements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get article comments
// @route GET /api/parent-learning/article/:id/comments
// ─────────────────────────────────────────────────────────────
const getArticleComments = async (req, res) => {
    try {
        const comments = await ArticleComment.find({ articleId: req.params.id })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Add article comment
// @route POST /api/parent-learning/article/:id/comment
// ─────────────────────────────────────────────────────────────
const addArticleComment = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const userName = req.user.name;

        const comment = await ArticleComment.create({
            articleId: req.params.id,
            userId,
            userName,
            text
        });

        res.status(201).json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Like/unlike comment
// @route PUT /api/parent-learning/comment/:id/like
// ─────────────────────────────────────────────────────────────
const toggleCommentLike = async (req, res) => {
    try {
        const { articleId, commentId } = req.body;
        const userId = req.user._id;

        const comment = await ArticleComment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        const hasLiked = comment.likedBy.includes(userId);

        if (hasLiked) {
            await ArticleComment.findByIdAndUpdate(commentId, {
                $pull: { likedBy: userId },
                $inc: { likes: -1 }
            });
        } else {
            await ArticleComment.findByIdAndUpdate(commentId, {
                $addToSet: { likedBy: userId },
                $inc: { likes: 1 }
            });
        }

        res.status(200).json({
            success: true,
            liked: !hasLiked
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// Helper: Check and award achievements
// ─────────────────────────────────────────────────────────────
const checkAchievements = async (userId) => {
    try {
        const existingAchievements = await ParentAchievement.find({ userId });
        const existingIds = existingAchievements.map(a => a.achievementId);

        const [articleReads, progress, savedActivities, savedRecipes] = await Promise.all([
            ArticleRead.countDocuments({ userId }),
            ParentProgress.find({ userId }),
            Activity.countDocuments({ savedBy: userId }),
            Recipe.countDocuments({ savedBy: userId })
        ]);

        const completedCourses = progress.filter(p => p.status === 'completed').length;
        const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0) + (articleReads * 5);

        const toAward = [];

        if (articleReads >= 1 && !existingIds.includes(ACHIEVEMENTS.FIRST_ARTICLE.id)) {
            toAward.push(ACHIEVEMENTS.FIRST_ARTICLE);
        }
        if (articleReads >= 10 && !existingIds.includes(ACHIEVEMENTS.FAMILY_READER.id)) {
            toAward.push(ACHIEVEMENTS.FAMILY_READER);
        }
        if (completedCourses >= 1 && !existingIds.includes(ACHIEVEMENTS.FIRST_COURSE.id)) {
            toAward.push(ACHIEVEMENTS.FIRST_COURSE);
        }
        if (completedCourses >= 5 && !existingIds.includes(ACHIEVEMENTS.SUPER_PARENT.id)) {
            toAward.push(ACHIEVEMENTS.SUPER_PARENT);
        }
        if (savedRecipes >= 5 && !existingIds.includes(ACHIEVEMENTS.CHEF_PARENT.id)) {
            toAward.push(ACHIEVEMENTS.CHEF_PARENT);
        }
        if (savedRecipes >= 5 && !existingIds.includes(ACHIEVEMENTS.RECIPE_SAVER.id)) {
            toAward.push(ACHIEVEMENTS.RECIPE_SAVER);
        }
        if (savedActivities >= 10 && !existingIds.includes(ACHIEVEMENTS.ACTIVITY_STAR.id)) {
            toAward.push(ACHIEVEMENTS.ACTIVITY_STAR);
        }
        if (totalXP >= 1000 && !existingIds.includes(ACHIEVEMENTS.XP_MASTER.id)) {
            toAward.push(ACHIEVEMENTS.XP_MASTER);
        }

        // Award new achievements
        for (const achievement of toAward) {
            await ParentAchievement.create({
                userId,
                achievementId: achievement.id,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon
            });
        }

        return toAward;
    } catch (error) {
        console.error('Achievement check error:', error);
        return [];
    }
};

// ─────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────
const seedArticles = async () => {
    const articles = [
        { title: '10 Signs Your Child is Ready for Preschool', icon: '🧠', category: 'development', readTime: 5, tags: ['Education', 'Milestones'], content: '<p>Starting preschool is a big milestone!</p>' },
        { title: 'Sleep Training: Methods That Actually Work', icon: '😴', category: 'health', readTime: 8, tags: ['Sleep', 'Routines'], content: '<p>Getting your baby to sleep through the night.</p>' },
        { title: 'Screen Time Guidelines for Every Age', icon: '📱', category: 'health', readTime: 6, tags: ['Screen Time', 'Tech'], content: '<p>How much screen time is okay?</p>' },
        { title: 'Picky Eaters: Expert Strategies That Help', icon: '🥦', category: 'nutrition', readTime: 7, tags: ['Feeding', 'Meals'], content: '<p>Dealing with picky eaters.</p>' },
        { title: 'Building Resilience in Anxious Kids', icon: '💪', category: 'emotional', readTime: 6, tags: ['Anxiety', 'Mental Health'], content: '<p>Helping your child build resilience.</p>' },
        { title: 'Baby Sign Language: Communicate Before They Talk', icon: '👶', category: 'development', readTime: 4, tags: ['Communication', 'Baby'], content: '<p>Teach your baby to communicate.</p>' }
    ];
    await Article.insertMany(articles);
};

const seedActivities = async () => {
    const activities = [
        { title: 'Finger Painting Fun', icon: '🎨', description: 'Let toddlers explore colors and textures with safe, washable finger paints.', ageRangeMin: 12, ageRangeMax: 36, difficulty: 'Easy', category: 'Sensory', materials: ['Finger paints', 'Plastic tablecloth', 'Smock'], benefits: ['Sensory development', 'Motor skills', 'Creativity'] },
        { title: 'Block Stacking Tower', icon: '🏗️', description: 'Stack soft blocks and encourage your little one to knock them down!', ageRangeMin: 6, ageRangeMax: 24, difficulty: 'Easy', category: 'Cognitive', materials: ['Soft building blocks', 'Cushion mat'], benefits: ['Hand-eye coordination', 'Problem solving'] },
        { title: 'Homemade Music Band', icon: '🎵', description: 'Create instruments from household items.', ageRangeMin: 18, ageRangeMax: 48, difficulty: 'Medium', category: 'Musical', materials: ['Empty containers', 'Rice or pasta', 'Spoons'], benefits: ['Rhythm awareness', 'Creativity'] },
        { title: 'Shape Sorter Challenge', icon: '🧩', description: 'Challenge your baby to sort shapes into the correct holes.', ageRangeMin: 9, ageRangeMax: 18, difficulty: 'Medium', category: 'Problem Solving', materials: ['Shape sorter toy', 'Basket'], benefits: ['Shape recognition', 'Problem solving'] }
    ];
    await Activity.insertMany(activities);
};

const seedRecipes = async () => {
    const recipes = [
        { title: 'Banana Oat Pancakes', icon: '🥣', description: 'Blend 1 ripe banana, 1 egg, and 3 tbsp oats. Cook small circles on a low-heat pan.', category: 'Breakfast', ageGroup: '12m+', prepTime: 15, ingredients: ['1 banana', '1 egg', '3 tbsp oats'], steps: ['Blend ingredients', 'Cook on low heat', 'Serve with fruit'], tags: ['No sugar', 'High fiber'] },
        { title: 'Veggie Pasta Stars', icon: '🍜', description: 'Blend cauliflower into tomato sauce for a creamy, veggie-packed pasta.', category: 'Lunch', ageGroup: '12m+', prepTime: 25, ingredients: ['Pasta', 'Cauliflower', 'Tomato sauce'], steps: ['Blend cauliflower', 'Mix with sauce', 'Cook pasta', 'Combine'], tags: ['Hidden veggies', 'Protein'] },
        { title: 'Mini Chicken Meatballs', icon: '🧁', description: 'Mix minced chicken with breadcrumbs and finely grated zucchini.', category: 'Dinner', ageGroup: '10m+', prepTime: 30, ingredients: ['Minced chicken', 'Breadcrumbs', 'Zucchini', 'Egg'], steps: ['Mix ingredients', 'Form balls', 'Bake until cooked'], tags: ['Iron rich', 'Soft'] },
        { title: 'Mango Lassi Smoothie', icon: '🥤', description: 'Blend half a ripe mango with plain yogurt.', category: 'Snack', ageGroup: '12m+', prepTime: 5, ingredients: ['1/2 mango', '100ml yogurt', 'Splash of water'], steps: ['Blend mango', 'Add yogurt', 'Blend until smooth'], tags: ['Calcium', 'Vitamin C'] }
    ];
    await Recipe.insertMany(recipes);
};

const seedCourses = async () => {
    const courses = [
        { title: "Understanding Your Baby's First Year", banner: '👶', color: '#0EA5E9', background: '#E0F2FE', badge: 'Popular', category: 'development', description: 'Learn about your baby\'s development in the first year.', totalLessons: 8, duration: '2h', xpReward: 100, lessons: [{ title: 'Month 1-3', duration: 15 }, { title: 'Month 4-6', duration: 15 }, { title: 'Month 7-9', duration: 15 }, { title: 'Month 10-12', duration: 15 }] },
        { title: 'Positive Discipline Techniques', banner: '🌱', color: '#34D399', background: '#DCFCE7', badge: 'New', category: 'emotional', description: 'Learn effective discipline strategies.', totalLessons: 6, duration: '1.5h', xpReward: 80, lessons: [{ title: 'Understanding Behavior', duration: 12 }, { title: 'Positive Reinforcement', duration: 12 }, { title: 'Setting Boundaries', duration: 12 }] },
        { title: 'Introducing Solids: A Complete Guide', banner: '🥦', color: '#F59E0B', background: '#FEF3C7', badge: null, category: 'nutrition', description: 'Everything about starting solid foods.', totalLessons: 5, duration: '1h', xpReward: 60, lessons: [{ title: 'When to Start', duration: 10 }, { title: 'First Foods', duration: 10 }, { title: 'Allergy Prevention', duration: 10 }] },
        { title: 'Toddler Tantrums: What Parents Need to Know', banner: '😤', color: '#F472B6', background: '#FCE7F3', badge: 'Trending', category: 'emotional', description: 'Understanding and managing tantrums.', totalLessons: 7, duration: '1.5h', xpReward: 90, lessons: [{ title: 'Why Tantrums Happen', duration: 12 }, { title: 'Staying Calm', duration: 12 }, { title: 'Prevention Tips', duration: 12 }] }
    ];
    await ParentCourse.insertMany(courses);
};

// ─────────────────────────────────────────────────────────────
// @desc  Auto-update/seed parent learning content
// ─────────────────────────────────────────────────────────────
const updateParentLearningData = async () => {
    try {
        const articleCount = await Article.countDocuments();
        const activityCount = await Activity.countDocuments();
        const recipeCount = await Recipe.countDocuments();
        const courseCount = await ParentCourse.countDocuments();

        if (articleCount === 0) {
            await seedArticles();
            console.log('📚 Seeded articles');
        }
        if (activityCount === 0) {
            await seedActivities();
            console.log('🎨 Seeded activities');
        }
        if (recipeCount === 0) {
            await seedRecipes();
            console.log('🍳 Seeded recipes');
        }
        if (courseCount === 0) {
            await seedCourses();
            console.log('🎓 Seeded courses');
        }
    } catch (error) {
        console.error('⚠️ Error updating parent learning data:', error);
    }
};

module.exports = {
    getAllContent,
    getProgress,
    markArticleRead,
    enrollInCourse,
    completeLesson,
    toggleActivitySave,
    toggleRecipeSave,
    getArticleComments,
    addArticleComment,
    toggleCommentLike,
    updateParentLearningData
};
