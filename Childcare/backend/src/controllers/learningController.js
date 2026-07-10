// File Path: backend/src/controllers/learningController.js
// Learning System Controller - Courses, Progress, Quizzes, Certificates

const { Course, UserProgress, Certificate, Achievement } = require('../models/Learning');
const User = require('../models/User');

// ── Helper: Generate verification code ──────────────────────
const generateVerificationCode = () => {
    return 'TC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
};

// ── Achievement definitions ────────────────────────────────
const ACHIEVEMENTS = {
    FIRST_STEPS: { id: 'first_steps', title: 'First Steps', description: 'Complete your first course', icon: '🎯' },
    QUICK_LEARNER: { id: 'quick_learner', title: 'Quick Learner', description: 'Complete 3 courses', icon: '⚡' },
    SCHOLAR: { id: 'scholar', title: 'Scholar', description: 'Complete 5 courses', icon: '📚' },
    EXPERT: { id: 'expert', title: 'Expert', description: 'Complete all courses', icon: '🏆' },
    PERFECT_SCORE: { id: 'perfect_score', title: 'Perfect Score', description: 'Score 100% on a quiz', icon: '💯' },
    SAFETY_FIRST: { id: 'safety_first', title: 'Safety First', description: 'Complete the Safety course', icon: '🛡️' },
    NUTRITION_NINJA: { id: 'nutrition_ninja', title: 'Nutrition Ninja', description: 'Complete the Nutrition course', icon: '🥗' },
    STREAK_7: { id: 'streak_7', title: '7-Day Streak', description: 'Learn for 7 days in a row', icon: '🔥' },
    LEVEL_10: { id: 'level_10', title: 'Rising Star', description: 'Reach Level 10', icon: '⭐' },
    FIRST_QUIZ: { id: 'first_quiz', title: 'Quiz Starter', description: 'Complete your first quiz', icon: '📝' }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get all courses (for parents)
// @route GET /api/learning/courses
// ─────────────────────────────────────────────────────────────
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true }).sort({ order: 1 });
        
        // If no courses exist, seed default courses
        if (courses.length === 0) {
            const defaultCourses = await seedDefaultCourses();
            return res.status(200).json({ success: true, courses: defaultCourses });
        }
        
        res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get course by ID with lessons and quiz
// @route GET /api/learning/courses/:id
// ─────────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        // Get user's progress for this course
        let progress = null;
        if (req.user) {
            progress = await UserProgress.findOne({ 
                userId: req.user._id, 
                courseId: course._id 
            });
        }
        
        res.status(200).json({ success: true, course, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get user's learning progress
// @route GET /api/learning/progress
// ─────────────────────────────────────────────────────────────
const getProgress = async (req, res) => {
    try {
        const progress = await UserProgress.find({ userId: req.user._id })
            .populate('courseId', 'title icon duration')
            .sort({ updatedAt: -1 });
        
        // Calculate stats
        const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0);
        const completedCourses = progress.filter(p => p.status === 'completed').length;
        const totalCourses = await Course.countDocuments({ isActive: true });
        
        // Calculate level (100 XP per level)
        const level = Math.floor(totalXP / 100) + 1;
        const xpToNextLevel = 100 - (totalXP % 100);
        
        // Get achievements
        const achievements = await Achievement.find({ userId: req.user._id });
        
        res.status(200).json({
            success: true,
            progress,
            stats: {
                totalXP,
                level,
                xpToNextLevel,
                completedCourses,
                totalCourses,
                percentageComplete: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
            },
            achievements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Start/Enroll in a course
// @route POST /api/learning/enroll
// ─────────────────────────────────────────────────────────────
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        // Check if already enrolled
        let progress = await UserProgress.findOne({ 
            userId: req.user._id, 
            courseId 
        });
        
        if (progress) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already enrolled in this course',
                progress 
            });
        }
        
        // Create new progress
        progress = await UserProgress.create({
            userId: req.user._id,
            courseId,
            status: 'in_progress',
            startedAt: new Date()
        });
        
        // Update course enrollment count
        await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
        
        res.status(201).json({ success: true, message: 'Enrolled successfully', progress });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Complete a lesson
// @route PUT /api/learning/lesson-complete
// ─────────────────────────────────────────────────────────────
const completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        
        let progress = await UserProgress.findOne({ userId: req.user._id, courseId });
        
        if (!progress) {
            // Auto-enroll if not enrolled
            progress = await UserProgress.create({
                userId: req.user._id,
                courseId,
                status: 'in_progress'
            });
        }
        
        const course = await Course.findById(courseId);
        const lesson = course.lessons.id(lessonId);
        const xpEarned = lesson?.xpReward || 10;
        
        // Check if already completed
        const lessonProgress = progress.completedLessons.find(l => l.lessonId === lessonId);
        if (!lessonProgress?.completed) {
            progress.completedLessons.push({
                lessonId,
                completed: true,
                completedAt: new Date()
            });
            progress.xpEarned += xpEarned;
            progress.currentLesson = lessonId;
            await progress.save();
            
            // Check if all lessons complete
            if (progress.completedLessons.length === course.lessons.length) {
                // Ready for quiz
                progress.status = 'in_progress';
                await progress.save();
            }
        }
        
        res.status(200).json({ success: true, progress, xpEarned });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Submit quiz answers
// @route POST /api/learning/quiz-submit
// ─────────────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
    try {
        const { courseId, answers } = req.body; // answers: [{ questionId, answer }]
        
        const course = await Course.findById(courseId);
        if (!course || !course.quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        
        let progress = await UserProgress.findOne({ userId: req.user._id, courseId });
        
        if (!progress) {
            return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
        }
        
        // Check attempt limit
        const attemptCount = progress.quizAttempts.length;
        if (attemptCount >= course.quiz.maxAttempts) {
            return res.status(400).json({ 
                success: false, 
                message: 'Maximum attempts reached',
                attemptsRemaining: 0 
            });
        }
        
        // Calculate score
        let correctCount = 0;
        const results = course.quiz.questions.map((q, idx) => {
            const userAnswer = answers[idx]?.answer;
            let isCorrect = false;
            
            if (q.type === 'mcq') {
                isCorrect = userAnswer === q.correctAnswer;
            } else if (q.type === 'truefalse') {
                isCorrect = userAnswer === q.correctAnswer;
            }
            
            if (isCorrect) correctCount++;
            
            return {
                questionId: q._id,
                question: q.text,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation
            };
        });
        
        const score = Math.round((correctCount / course.quiz.questions.length) * 100);
        const passed = score >= course.quiz.passingScore;
        
        // Save attempt
        progress.quizAttempts.push({
            score,
            passed,
            answers: results,
            attemptedAt: new Date()
        });
        
        // Update best score
        if (score > progress.bestQuizScore) {
            progress.bestQuizScore = score;
        }
        
        // Award XP for quiz
        let xpEarned = 0;
        if (passed) {
            xpEarned = course.quiz.xpReward || 25;
            
            if (!progress.quizPassed) {
                progress.quizPassed = true;
                progress.xpEarned += xpEarned;
                
                // Complete course
                progress.status = 'completed';
                progress.completedAt = new Date();
                progress.xpEarned += course.xpReward || 100;
                xpEarned += course.xpReward || 100;
            }
        }
        
        await progress.save();
        
        // Award achievements
        await checkAndAwardAchievements(req.user._id, progress, score);
        
        res.status(200).json({
            success: true,
            score,
            passed,
            passingScore: course.quiz.passingScore,
            results,
            xpEarned,
            attemptsRemaining: course.quiz.maxAttempts - progress.quizAttempts.length - 1
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Generate certificate
// @route POST /api/learning/certificate
// ─────────────────────────────────────────────────────────────
const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.body;
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        let progress = await UserProgress.findOne({ 
            userId: req.user._id, 
            courseId,
            status: 'completed'
        });
        
        if (!progress) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course not completed yet' 
            });
        }
        
        // Check if certificate already exists
        let certificate = await Certificate.findOne({ 
            userId: req.user._id, 
            courseId 
        });
        
        if (certificate) {
            return res.status(200).json({ success: true, certificate });
        }
        
        // Get user details
        const user = await User.findById(req.user._id);
        
        // Create certificate
        certificate = await Certificate.create({
            userId: req.user._id,
            courseId,
            verificationCode: generateVerificationCode(),
            courseName: course.title,
            userName: user.name,
            finalScore: progress.bestQuizScore,
            completionDate: progress.completedAt || new Date()
        });
        
        // Update progress
        progress.certificateEarned = true;
        progress.certificateId = certificate._id;
        await progress.save();
        
        res.status(201).json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get all user certificates
// @route GET /api/learning/certificates
// ─────────────────────────────────────────────────────────────
const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ 
            userId: req.user._id,
            isValid: true 
        }).sort({ completionDate: -1 });
        
        res.status(200).json({ success: true, certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get leaderboard
// @route GET /api/learning/leaderboard
// ─────────────────────────────────────────────────────────────
const getLeaderboard = async (req, res) => {
    try {
        const progress = await UserProgress.aggregate([
            { $group: {
                _id: '$userId',
                totalXP: { $sum: '$xpEarned' },
                coursesCompleted: { $sum: { $cond: ['$certificateEarned', 1, 0] } }
            }},
            { $sort: { totalXP: -1 } },
            { $limit: 20 }
        ]);
        
        // Populate user names
        const userIds = progress.map(p => p._id);
        const users = await User.find({ _id: { $in: userIds } }).select('name avatar');
        
        const leaderboard = progress.map((p, index) => {
            const user = users.find(u => u._id.toString() === p._id.toString());
            return {
                rank: index + 1,
                userId: p._id,
                name: user?.name || 'User',
                avatar: user?.avatar,
                totalXP: p.totalXP,
                coursesCompleted: p.coursesCompleted,
                level: Math.floor(p.totalXP / 100) + 1
            };
        });
        
        // Find current user rank
        const userRank = leaderboard.findIndex(l => l.userId.toString() === req.user._id.toString()) + 1;
        
        res.status(200).json({ success: true, leaderboard, userRank: userRank || null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// Helper: Check and award achievements
// ─────────────────────────────────────────────────────────────
const checkAndAwardAchievements = async (userId, progress, score) => {
    try {
        const existingAchievements = await Achievement.find({ userId });
        const existingIds = existingAchievements.map(a => a.achievementId);
        
        const allProgress = await UserProgress.find({ userId });
        const completedCount = allProgress.filter(p => p.status === 'completed').length;
        const totalXP = allProgress.reduce((sum, p) => sum + p.xpEarned, 0);
        
        const toAward = [];
        
        // Check each achievement
        if (completedCount >= 1 && !existingIds.includes(ACHIEVEMENTS.FIRST_STEPS.id)) {
            toAward.push(ACHIEVEMENTS.FIRST_STEPS);
        }
        if (completedCount >= 3 && !existingIds.includes(ACHIEVEMENTS.QUICK_LEARNER.id)) {
            toAward.push(ACHIEVEMENTS.QUICK_LEARNER);
        }
        if (completedCount >= 5 && !existingIds.includes(ACHIEVEMENTS.SCHOLAR.id)) {
            toAward.push(ACHIEVEMENTS.SCHOLAR);
        }
        if (completedCount >= 6 && !existingIds.includes(ACHIEVEMENTS.EXPERT.id)) {
            toAward.push(ACHIEVEMENTS.EXPERT);
        }
        if (score === 100 && !existingIds.includes(ACHIEVEMENTS.PERFECT_SCORE.id)) {
            toAward.push(ACHIEVEMENTS.PERFECT_SCORE);
        }
        if (totalXP >= 1000 && !existingIds.includes(ACHIEVEMENTS.LEVEL_10.id)) {
            toAward.push(ACHIEVEMENTS.LEVEL_10);
        }
        
        // Award achievements
        for (const achievement of toAward) {
            await Achievement.create({
                userId,
                achievementId: achievement.id,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon
            });
        }
        
        return toAward;
    } catch (error) {
        console.error('Achievement award error:', error);
        return [];
    }
};

// ─────────────────────────────────────────────────────────────
// Seed default courses
// ─────────────────────────────────────────────────────────────
const seedDefaultCourses = async () => {
    const courses = [
        {
            title: 'Child Safety Basics',
            icon: '🛡️',
            description: 'Learn essential safety protocols, emergency procedures, and how to create a safe environment for children.',
            category: 'safety',
            level: 'beginner',
            duration: 45,
            xpReward: 100,
            order: 1,
            lessons: [
                { title: 'Introduction to Child Safety', type: 'text', content: 'Child safety is the foundation of good childcare...', duration: 10, order: 1, xpReward: 10 },
                { title: 'Emergency Contacts & Protocols', type: 'text', content: 'Knowing who to call in an emergency is crucial...', duration: 15, order: 2, xpReward: 10 },
                { title: 'Childproofing Your Space', type: 'text', content: 'A safe environment prevents accidents...', duration: 12, order: 3, xpReward: 10 },
                { title: 'First Aid Basics', type: 'text', content: 'Basic first aid knowledge can save lives...', duration: 15, order: 4, xpReward: 10 },
                { title: 'Fire & Safety Hazards', type: 'text', content: 'Identifying and preventing fire hazards...', duration: 10, order: 5, xpReward: 10 },
            ],
            quiz: {
                questions: [
                    { text: 'What is the FIRST thing you should do in a medical emergency?', type: 'mcq', options: ['Call the child\'s parents', 'Call emergency services (112)', 'Give medicine', 'Wait and observe'], correctAnswer: '1', explanation: 'Emergency services should always be contacted first in a medical emergency.', points: 10 },
                    { text: 'At what age can a child be left alone at home briefly?', type: 'mcq', options: ['5 years', '8 years', '12 years', '10 years'], correctAnswer: '2', explanation: 'Children under 12 should generally not be left home alone.', points: 10 },
                    { text: 'Which is NOT a childproofing measure?', type: 'mcq', options: ['Install outlet covers', 'Keep cleaning supplies low', 'Use stair gates', 'Lock cabinets with chemicals'], correctAnswer: '1', explanation: 'Cleaning supplies should always be stored high up and locked away.', points: 10 },
                    { text: 'True or False: You should never leave a child under 5 unsupervised near water.', type: 'truefalse', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Young children should never be left unsupervised near water, even for a moment.', points: 10 },
                    { text: 'What should you do if a stranger approaches your child?', type: 'mcq', options: ['Ignore it', 'Teach the child to run away and yell', 'Let the child handle it', 'Approach the stranger'], correctAnswer: '1', explanation: 'Children should be taught to shout for help and run to a trusted adult.', points: 10 },
                ],
                passingScore: 70,
                timeLimit: 10,
                maxAttempts: 3,
                xpReward: 25
            }
        },
        {
            title: 'Child Nutrition & Healthy Eating',
            icon: '🥗',
            description: 'Understand child nutrition requirements, age-appropriate foods, allergy management and healthy meal preparation.',
            category: 'nutrition',
            level: 'beginner',
            duration: 35,
            xpReward: 80,
            order: 2,
            lessons: [
                { title: 'Understanding Nutrition Needs', type: 'text', content: 'Children have unique nutritional needs...', duration: 12, order: 1, xpReward: 10 },
                { title: 'Common Food Allergies', type: 'text', content: 'Recognizing and managing food allergies...', duration: 10, order: 2, xpReward: 10 },
                { title: 'Planning Healthy Meals', type: 'text', content: 'Creating balanced, nutritious meals...', duration: 15, order: 3, xpReward: 10 },
                { title: 'Healthy Snacks & Hydration', type: 'text', content: 'Snack ideas that nourish and satisfy...', duration: 8, order: 4, xpReward: 10 },
            ],
            quiz: {
                questions: [
                    { text: 'Which food is a common allergen in children?', type: 'mcq', options: ['Rice', 'Peanuts', 'Cucumber', 'Carrots'], correctAnswer: '1', explanation: 'Peanuts are one of the most common food allergens in children.', points: 10 },
                    { text: 'How much water should a 5-year-old drink daily?', type: 'mcq', options: ['500ml', '1 litre', '1.5 litres', '3 litres'], correctAnswer: '1', explanation: 'Children aged 5-8 should drink about 1-1.5 litres of water daily.', points: 10 },
                    { text: 'What should you do if a child has a known food allergy?', type: 'mcq', options: ['Ignore it if reaction is mild', 'Check all food labels carefully', 'Give a small amount to test', 'Avoid all solid foods'], correctAnswer: '1', explanation: 'Always check food labels and be aware of cross-contamination risks.', points: 10 },
                    { text: 'True or False: Sugary drinks are good for children.', type: 'truefalse', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Sugary drinks can lead to health issues and should be avoided.', points: 10 },
                ],
                passingScore: 70,
                timeLimit: 8,
                maxAttempts: 3,
                xpReward: 25
            }
        },
        {
            title: 'Child Development Milestones',
            icon: '🎯',
            description: 'Explore developmental milestones, age-appropriate activities, and how to support cognitive and emotional growth.',
            category: 'development',
            level: 'intermediate',
            duration: 50,
            xpReward: 120,
            order: 3,
            lessons: [
                { title: 'Physical Development', type: 'text', content: 'Understanding physical milestones...', duration: 15, order: 1, xpReward: 10 },
                { title: 'Cognitive Development', type: 'text', content: 'How children think and learn...', duration: 15, order: 2, xpReward: 10 },
                { title: 'Social & Emotional Growth', type: 'text', content: 'Building emotional intelligence...', duration: 12, order: 3, xpReward: 10 },
                { title: 'Language Development', type: 'text', content: 'Communication milestones...', duration: 10, order: 4, xpReward: 10 },
            ],
            quiz: {
                questions: [
                    { text: 'What type of play best supports a toddler\'s development?', type: 'mcq', options: ['Screen-based play', 'Solitary structured play', 'Free unstructured play', 'No play needed'], correctAnswer: '2', explanation: 'Free play encourages creativity, problem-solving, and social skills.', points: 10 },
                    { text: 'At what age do children typically start speaking 2-word phrases?', type: 'mcq', options: ['6 months', '12 months', '18-24 months', '36 months'], correctAnswer: '2', explanation: 'Most children start combining words around 18-24 months.', points: 10 },
                    { text: 'Which activity supports fine motor skill development?', type: 'mcq', options: ['Running', 'Drawing and colouring', 'Watching TV', 'Sleeping'], correctAnswer: '1', explanation: 'Fine motor skills are developed through activities like drawing, cutting, and manipulating objects.', points: 10 },
                ],
                passingScore: 70,
                timeLimit: 10,
                maxAttempts: 3,
                xpReward: 30
            }
        },
        {
            title: 'Communication with Parents',
            icon: '💬',
            description: 'Build trust with families, communicate effectively, handle difficult situations professionally.',
            category: 'professional',
            level: 'intermediate',
            duration: 30,
            xpReward: 70,
            order: 4,
            lessons: [
                { title: 'Building Trust', type: 'text', content: 'The foundation of good parent-caretaker relationship...', duration: 10, order: 1, xpReward: 10 },
                { title: 'Daily Reporting', type: 'text', content: 'How to communicate about the child\'s day...', duration: 10, order: 2, xpReward: 10 },
                { title: 'Handling Concerns', type: 'text', content: 'Addressing complaints and concerns professionally...', duration: 10, order: 3, xpReward: 10 },
            ],
            quiz: {
                questions: [
                    { text: 'How often should you update parents about their child\'s day?', type: 'mcq', options: ['Only if something goes wrong', 'Once a week', 'Daily, at pickup or via message', 'Never, parents should ask'], correctAnswer: '2', explanation: 'Regular communication keeps parents informed and builds trust.', points: 10 },
                    { text: 'A parent is unhappy with your service. What should you do first?', type: 'mcq', options: ['Argue your point', 'Listen calmly and acknowledge their concern', 'Ignore them', 'Immediately resign'], correctAnswer: '1', explanation: 'Active listening and empathy are key to resolving concerns.', points: 10 },
                ],
                passingScore: 70,
                timeLimit: 5,
                maxAttempts: 3,
                xpReward: 20
            }
        },
        {
            title: 'First Aid & Emergency Response',
            icon: '🏥',
            description: 'Master CPR, choking response, wound care, and emergency protocols every caretaker must know.',
            category: 'safety',
            level: 'advanced',
            duration: 60,
            xpReward: 150,
            order: 5,
            lessons: [
                { title: 'CPR for Children', type: 'text', content: 'Life-saving CPR techniques...', duration: 15, order: 1, xpReward: 15 },
                { title: 'Choking Response', type: 'text', content: 'How to help a choking child...', duration: 12, order: 2, xpReward: 15 },
                { title: 'Wound Care & Burns', type: 'text', content: 'Treating injuries properly...', duration: 15, order: 3, xpReward: 15 },
                { title: 'Fever & Illness', type: 'text', content: 'When to call a doctor...', duration: 10, order: 4, xpReward: 10 },
            ],
            quiz: {
                questions: [
                    { text: 'For a choking child over 1 year old, what technique do you use?', type: 'mcq', options: ['Back blows only', 'Abdominal thrusts (Heimlich)', 'Mouth to mouth', 'Lay them flat'], correctAnswer: '1', explanation: 'Abdominal thrusts (Heimlich maneuver) is the recommended technique for choking in children over 1 year.', points: 15 },
                    { text: 'What fever temperature in a child requires immediate medical attention?', type: 'mcq', options: ['37°C', '38°C', '40°C or above', '36.5°C'], correctAnswer: '2', explanation: 'A fever of 40°C or above in a child requires immediate medical attention.', points: 15 },
                    { text: 'For a minor cut, you should first:', type: 'mcq', options: ['Apply butter', 'Rinse with clean water and apply pressure', 'Ignore it', 'Apply toothpaste'], correctAnswer: '1', explanation: 'Cleaning a wound with water and applying pressure helps stop bleeding and prevents infection.', points: 10 },
                ],
                passingScore: 80,
                timeLimit: 15,
                maxAttempts: 3,
                xpReward: 40
            }
        },
        {
            title: 'Professional Standards & Ethics',
            icon: '⭐',
            description: 'Understand your professional responsibilities, privacy obligations, and ethical standards as a caretaker.',
            category: 'professional',
            level: 'advanced',
            duration: 25,
            xpReward: 60,
            order: 6,
            lessons: [
                { title: 'Professional Boundaries', type: 'text', content: 'Maintaining appropriate relationships...', duration: 10, order: 1, xpReward: 10 },
                { title: 'Confidentiality & Privacy', type: 'text', content: 'Protecting family information...', duration: 10, order: 2, xpReward: 10 },
                { title: 'Mandatory Reporting', type: 'text', content: 'When and how to report concerns...', duration: 10, order: 3, xpReward: 10 },
            ],
            quiz: {
                questions: [
                    { text: 'You suspect a child is being abused. What should you do?', type: 'mcq', options: ['Do nothing', 'Report to authorities', 'Confront parents directly', 'Tell other parents'], correctAnswer: '1', explanation: 'Child abuse must be reported to the appropriate authorities.', points: 15 },
                    { text: 'Which is a professional boundary violation?', type: 'mcq', options: ['Sending daily reports', 'Sharing info with neighbours', 'Maintaining logs', 'Following protocols'], correctAnswer: '1', explanation: 'Sharing family information violates confidentiality.', points: 10 },
                ],
                passingScore: 80,
                timeLimit: 8,
                maxAttempts: 3,
                xpReward: 20
            }
        }
    ];
    
    const createdCourses = await Course.insertMany(courses);
    return createdCourses;
};

module.exports = {
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
};
