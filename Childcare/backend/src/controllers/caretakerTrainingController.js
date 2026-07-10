// File Path: backend/src/controllers/caretakerTrainingController.js
// Caretaker Training System Controller

const { Module, CaretakerProgress, CaretakerAchievement, TrainingStreak } = require('../models/CaretakerTraining');

// ── Achievement definitions ────────────────────────────────
const ACHIEVEMENTS = {
    FIRST_STEP: { id: 'first_step', title: 'First Step', description: 'Complete your first module', icon: '🌟' },
    ON_A_ROLL: { id: 'on_a_roll', title: 'On a Roll', description: 'Complete 3 modules', icon: '🔥' },
    HALFWAY_HERO: { id: 'halfway_hero', title: 'Halfway Hero', description: 'Complete 50% of training', icon: '💪' },
    SAFETY_EXPERT: { id: 'safety_expert', title: 'Safety Expert', description: 'Complete Child Safety Basics', icon: '🏅' },
    NUTRITION_PRO: { id: 'nutrition_pro', title: 'Nutrition Pro', description: 'Complete Nutrition module', icon: '🥗' },
    FIRST_AID_HERO: { id: 'first_aid_hero', title: 'First Aid Hero', description: 'Complete First Aid module', icon: '🏥' },
    SCHOLAR: { id: 'scholar', title: 'Scholar', description: 'Complete all modules', icon: '🎓' },
    CERTIFIED_PRO: { id: 'certified_pro', title: 'Certified Pro', description: 'Earn your training certificate', icon: '🏆' },
    STREAK_MASTER: { id: 'streak_master', title: 'Streak Master', description: 'Train 7 days in a row', icon: '⚡' },
    QUICK_LEARNER: { id: 'quick_learner', title: 'Quick Learner', description: 'Complete a module in one session', icon: '🚀' }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get all training modules
// @route GET /api/caretaker-training/modules
// ─────────────────────────────────────────────────────────────
const getAllModules = async (req, res) => {
    try {
        let modules = await Module.find({ isActive: true }).sort({ order: 1 });

        if (modules.length === 0) {
            await seedModules();
            modules = await Module.find({ isActive: true }).sort({ order: 1 });
        }

        res.status(200).json({ success: true, modules });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get caretaker's training progress
// @route GET /api/caretaker-training/progress
// ─────────────────────────────────────────────────────────────
const getProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        const [progress, achievements, streak, modules] = await Promise.all([
            CaretakerProgress.find({ userId }),
            CaretakerAchievement.find({ userId }),
            TrainingStreak.findOne({ userId }),
            Module.find({ isActive: true })
        ]);

        const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0);
        const completedCount = progress.filter(p => p.status === 'completed').length;
        const overallProgress = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

        res.status(200).json({
            success: true,
            progress,
            achievements,
            streak: streak || { currentStreak: 0, longestStreak: 0 },
            stats: {
                totalXP,
                completedModules: completedCount,
                totalModules: modules.length,
                overallProgress
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Start a module
// @route POST /api/caretaker-training/start-module
// ─────────────────────────────────────────────────────────────
const startModule = async (req, res) => {
    try {
        const { moduleId } = req.body;
        const userId = req.user._id;

        const module = await Module.findOne({ moduleId, isActive: true });
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        let progress = await CaretakerProgress.findOne({ userId, moduleId });

        if (!progress) {
            progress = await CaretakerProgress.create({
                userId,
                moduleId,
                status: 'in_progress',
                startedAt: new Date()
            });
        }

        // Update streak
        await updateStreak(userId);

        res.status(200).json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Complete a lesson
// @route PUT /api/caretaker-training/complete-lesson
// ─────────────────────────────────────────────────────────────
const completeLesson = async (req, res) => {
    try {
        const { moduleId, lessonIndex } = req.body;
        const userId = req.user._id;

        const module = await Module.findOne({ moduleId, isActive: true });
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        let progress = await CaretakerProgress.findOne({ userId, moduleId });

        if (!progress) {
            progress = await CaretakerProgress.create({
                userId,
                moduleId,
                status: 'in_progress',
                startedAt: new Date()
            });
        }

        const existingLesson = progress.completedLessons.find(l => l.lessonIndex === lessonIndex);
        if (!existingLesson) {
            progress.completedLessons.push({
                lessonIndex,
                completedAt: new Date()
            });
            progress.xpEarned += 5; // XP per lesson
            progress.lastAccessedAt = new Date();
            await progress.save();
        }

        res.status(200).json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Submit quiz
// @route POST /api/caretaker-training/submit-quiz
// ─────────────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
    try {
        const { moduleId, answers } = req.body;
        const userId = req.user._id;

        const module = await Module.findOne({ moduleId, isActive: true });
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Calculate score
        let correctCount = 0;
        module.quiz.forEach((q, i) => {
            if (answers[i] === q.correct) correctCount++;
        });
        const score = Math.round((correctCount / module.quiz.length) * 100);
        const passed = score >= 70;

        let progress = await CaretakerProgress.findOne({ userId, moduleId });

        if (!progress) {
            progress = await CaretakerProgress.create({
                userId,
                moduleId,
                status: 'in_progress',
                startedAt: new Date()
            });
        }

        progress.quizAttempts += 1;
        progress.lastAccessedAt = new Date();

        if (passed && progress.status !== 'completed') {
            progress.status = 'completed';
            progress.completedAt = new Date();
            progress.quizScore = score;
            progress.xpEarned += module.xpReward;
        } else {
            progress.quizScore = score;
        }

        await progress.save();

        // Check achievements
        const newAchievements = await checkAchievements(userId);

        // Update streak
        await updateStreak(userId);

        res.status(200).json({
            success: true,
            score,
            passed,
            progress,
            achievements: newAchievements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc  Get certificate data
// @route GET /api/caretaker-training/certificate
// ─────────────────────────────────────────────────────────────
const getCertificate = async (req, res) => {
    try {
        const userId = req.user._id;

        const progress = await CaretakerProgress.find({ userId, status: 'completed' });
        const modules = await Module.find({ isActive: true });

        if (progress.length < modules.length) {
            return res.status(400).json({ success: false, message: 'Complete all modules to get certificate' });
        }

        const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0);
        const certificateId = `TC-${userId.toString().slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        res.status(200).json({
            success: true,
            certificate: {
                userName: req.user.name,
                completedModules: progress.length,
                totalModules: modules.length,
                totalXP,
                issuedAt: new Date(),
                certificateId,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// Helper: Update training streak
// ─────────────────────────────────────────────────────────────
const updateStreak = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = await TrainingStreak.findOne({ userId });

        if (!streak) {
            streak = await TrainingStreak.create({
                userId,
                currentStreak: 1,
                longestStreak: 1,
                lastTrainingDate: today,
                totalTrainingDays: 1
            });
            return;
        }

        const lastDate = new Date(streak.lastTrainingDate);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return; // Already trained today
        } else if (diffDays === 1) {
            streak.currentStreak += 1;
            streak.totalTrainingDays += 1;
        } else {
            streak.currentStreak = 1;
        }

        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }

        streak.lastTrainingDate = today;
        await streak.save();
    } catch (error) {
        console.error('Streak update error:', error);
    }
};

// ─────────────────────────────────────────────────────────────
// Helper: Check and award achievements
// ─────────────────────────────────────────────────────────────
const checkAchievements = async (userId) => {
    try {
        const existingAchievements = await CaretakerAchievement.find({ userId });
        const existingIds = existingAchievements.map(a => a.achievementId);

        const [completedProgress, allProgress, streak] = await Promise.all([
            CaretakerProgress.find({ userId, status: 'completed' }),
            CaretakerProgress.find({ userId }),
            TrainingStreak.findOne({ userId })
        ]);

        const completedCount = completedProgress.length;
        const totalProgress = allProgress.length;
        const modules = await Module.find({ isActive: true });
        const overallProgress = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

        const toAward = [];

        if (completedCount >= 1 && !existingIds.includes(ACHIEVEMENTS.FIRST_STEP.id)) {
            toAward.push(ACHIEVEMENTS.FIRST_STEP);
        }
        if (completedCount >= 3 && !existingIds.includes(ACHIEVEMENTS.ON_A_ROLL.id)) {
            toAward.push(ACHIEVEMENTS.ON_A_ROLL);
        }
        if (overallProgress >= 50 && !existingIds.includes(ACHIEVEMENTS.HALFWAY_HERO.id)) {
            toAward.push(ACHIEVEMENTS.HALFWAY_HERO);
        }
        if (completedProgress.some(p => p.moduleId === 'child-safety') && !existingIds.includes(ACHIEVEMENTS.SAFETY_EXPERT.id)) {
            toAward.push(ACHIEVEMENTS.SAFETY_EXPERT);
        }
        if (completedProgress.some(p => p.moduleId === 'nutrition') && !existingIds.includes(ACHIEVEMENTS.NUTRITION_PRO.id)) {
            toAward.push(ACHIEVEMENTS.NUTRITION_PRO);
        }
        if (completedProgress.some(p => p.moduleId === 'first-aid') && !existingIds.includes(ACHIEVEMENTS.FIRST_AID_HERO.id)) {
            toAward.push(ACHIEVEMENTS.FIRST_AID_HERO);
        }
        if (completedCount >= modules.length && modules.length > 0 && !existingIds.includes(ACHIEVEMENTS.SCHOLAR.id)) {
            toAward.push(ACHIEVEMENTS.SCHOLAR);
        }
        if (overallProgress === 100 && !existingIds.includes(ACHIEVEMENTS.CERTIFIED_PRO.id)) {
            toAward.push(ACHIEVEMENTS.CERTIFIED_PRO);
        }
        if (streak && streak.currentStreak >= 7 && !existingIds.includes(ACHIEVEMENTS.STREAK_MASTER.id)) {
            toAward.push(ACHIEVEMENTS.STREAK_MASTER);
        }
        if (completedCount >= 1 && !existingIds.includes(ACHIEVEMENTS.QUICK_LEARNER.id)) {
            toAward.push(ACHIEVEMENTS.QUICK_LEARNER);
        }

        for (const achievement of toAward) {
            await CaretakerAchievement.create({
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
const seedModules = async () => {
    const modules = [
        {
            moduleId: 'child-safety',
            icon: '🧸',
            title: 'Child Safety Basics',
            description: 'Learn essential safety protocols, emergency procedures, and how to create a safe environment for children.',
            duration: '45 min',
            totalLessons: 6,
            level: 'Beginner',
            color: '#4FC3F7',
            background: '#E3F2FD',
            topics: ['Emergency contacts', 'Childproofing spaces', 'First aid basics', 'Fire safety', 'Stranger danger protocol', 'Safe sleep practices'],
            lessons: [
                { 
                    title: 'Introduction to Child Safety', 
                    duration: 5, 
                    content: '<h3>Why Child Safety Matters</h3><p>Children are curious explorers. As caretakers, we must ensure their environment is safe while allowing them to learn and grow. Children under 5 are especially vulnerable to accidents.</p><p>As a caretaker, you are responsible for creating a safe environment and responding appropriately to emergencies.</p>',
                    keyPoints: ['Always supervise children at all times', 'Identify potential hazards in the environment', 'Know emergency procedures', 'Stay alert and focused'],
                    examples: [
                        { title: 'Supervision Tip', description: 'Never turn your back on a child near water, even for a moment.' },
                        { title: 'Environment Check', description: 'Before starting your shift, walk through the space and identify potential dangers.' }
                    ]
                },
                { 
                    title: 'Emergency Contacts & Protocols', 
                    duration: 8, 
                    content: '<h3>Emergency Planning</h3><p>Always have emergency contacts readily available. Know the local emergency number and child\'s medical information.</p><p>Keep a list of emergency contacts in an easily accessible place.</p>',
                    keyPoints: ['Save emergency numbers on your phone', 'Know the child\'s medical history', 'Keep parents\' contact numbers handy', 'Know the address of your location'],
                    examples: [
                        { title: 'Emergency Contact Card', description: 'Create a card with: Parents, Doctor, Hospital, and Emergency Services numbers.' },
                        { title: 'Medical Information', description: 'Note any allergies, medications, or special conditions the child has.' }
                    ]
                },
                { 
                    title: 'Childproofing Your Space', 
                    duration: 10, 
                    content: '<h3>Making Spaces Safe</h3><p>Cover outlets, secure furniture, lock cabinets, and remove small objects that could be choking hazards.</p><p>Get down to the child\'s level to see what dangers they can reach.</p>',
                    keyPoints: ['Cover all electrical outlets', 'Lock cabinets with chemicals/medicines', 'Secure heavy furniture to walls', 'Remove small choking hazards'],
                    examples: [
                        { title: 'Outlet Safety', description: 'Use safety plugs or outlet covers on all unused outlets.' },
                        { title: 'Cabinet Safety', description: 'Use child-proof locks on cabinets containing cleaning products.' }
                    ]
                },
                { 
                    title: 'Fire & Hazard Safety', 
                    duration: 8, 
                    content: '<h3>Preventing Accidents</h3><p>Install smoke detectors, keep lighters away, and teach children about dangerous items.</p><p>Never leave children unattended near fire, stoves, or hot surfaces.</p>',
                    keyPoints: ['Keep matches and lighters out of reach', 'Know fire escape routes', 'Keep a fire extinguisher accessible', 'Teach children "hot" means danger'],
                    examples: [
                        { title: 'Kitchen Safety', description: 'Turn pot handles away from the edge of the stove.' },
                        { title: 'Fire Awareness', description: 'Teach children to stay away from the stove, fireplace, and candles.' }
                    ]
                },
                { 
                    title: 'Stranger Safety', 
                    duration: 7, 
                    content: '<h3>Teaching Boundaries</h3><p>Teach children about safe vs unsafe situations, appropriate vs inappropriate touch, and when to seek help.</p><p>Build trust so children feel comfortable telling you if something happens.</p>',
                    keyPoints: ['Children should know their full name and address', 'Teach "no" to unwanted touch', 'Identify safe adults they can approach', 'Know when to call for help'],
                    examples: [
                        { title: 'Safe vs Unsafe Touch', description: 'Safe: Hugs from family. Unsafe: Touches to private areas.' },
                        { title: 'Stranger Rules', description: 'Never go anywhere with a stranger. Always tell a trusted adult.' }
                    ]
                },
                { 
                    title: 'Safe Sleep Practices', 
                    duration: 7, 
                    content: '<h3>Sleep Safety</h3><p>Follow ABCs of safe sleep: Alone, on Back, in Crib. No loose blankets, pillows, or toys in the crib.</p><p>Safe sleep reduces the risk of SIDS (Sudden Infant Death Syndrome).</p>',
                    keyPoints: ['Always place babies on their back to sleep', 'Use a firm, flat sleep surface', 'Keep soft objects out of the sleep area', 'Avoid overheating'],
                    examples: [
                        { title: 'Crib Setup', description: 'Firm mattress, fitted sheet, no pillows, blankets, or stuffed animals.' },
                        { title: 'Room Sharing', description: 'Babies can sleep in the same room as parents, but on a separate surface.' }
                    ]
                }
            ],
            quiz: [
                { question: 'What is the FIRST thing you should do in a medical emergency?', options: ["Call the child's parents", 'Call emergency services (112)', 'Give medicine', 'Wait and observe'], correct: 1 },
                { question: 'At what age can a child be left alone at home briefly?', options: ['5 years', '8 years', '12 years', '10 years'], correct: 2 },
                { question: 'Which of these is a childproofing measure?', options: ['Leave cleaning supplies on low shelves', 'Install outlet covers', 'Keep sharp objects accessible', 'Remove stair gates'], correct: 1 }
            ],
            xpReward: 100,
            order: 1
        },
        {
            moduleId: 'nutrition',
            icon: '🥗',
            title: 'Nutrition & Meal Planning',
            description: 'Understand child nutrition requirements, age-appropriate foods, allergy management and healthy meal preparation.',
            duration: '35 min',
            totalLessons: 5,
            level: 'Beginner',
            color: '#69F0AE',
            background: '#E8F5E9',
            topics: ['Age-appropriate diets', 'Common food allergies', 'Balanced meals', 'Hydration needs', 'Healthy snack ideas'],
            lessons: [
                { 
                    title: 'Understanding Child Nutrition', 
                    duration: 7, 
                    content: '<h3>Building Healthy Habits</h3><p>Children need balanced nutrition for growth and development. Learn about portion sizes and food groups.</p><p>A healthy diet includes proteins, carbohydrates, fruits, vegetables, and dairy.</p>',
                    keyPoints: ['Children need 3 meals and 2-3 snacks daily', 'Portion sizes are smaller than adult portions', 'Variety is key to getting all nutrients', 'Eating together models healthy habits'],
                    examples: [
                        { title: 'Balanced Plate', description: 'Half vegetables, quarter protein, quarter grains.' },
                        { title: 'Snack Ideas', description: 'Apple slices with peanut butter, cheese cubes, or yogurt.' }
                    ]
                },
                { 
                    title: 'Food Allergies & Intolerances', 
                    duration: 8, 
                    content: '<h3>Allergy Awareness</h3><p>Recognize signs of allergic reactions and know how to respond. Common allergens include nuts, dairy, and shellfish.</p><p>Always ask parents about known allergies before feeding a child.</p>',
                    keyPoints: ['Know the top 8 allergens', 'Watch for signs of allergic reaction', 'Always read food labels', 'When in doubt, don\'t serve it'],
                    examples: [
                        { title: 'Common Allergens', description: 'Peanuts, tree nuts, milk, eggs, wheat, soy, fish, shellfish.' },
                        { title: 'Reaction Signs', description: 'Hives, swelling, vomiting, difficulty breathing - act immediately!' }
                    ]
                },
                { 
                    title: 'Planning Balanced Meals', 
                    duration: 8, 
                    content: '<h3>Meal Planning Guide</h3><p>Create meals with protein, carbs, vegetables, and healthy fats. Make food visually appealing for children.</p><p>Children eat with their eyes first - make meals colorful and fun.</p>',
                    keyPoints: ['Include a protein source at each meal', 'Offer vegetables even if child resists', 'Make food finger-friendly for young kids', 'Let children help prepare meals'],
                    examples: [
                        { title: 'Easy Meal: Pasta', description: 'Whole grain pasta with turkey meatballs and steamed broccoli.' },
                        { title: 'Fun Presentation', description: 'Make a smiley face with food: egg eyes, carrot nose, broccoli hair.' }
                    ]
                },
                { 
                    title: 'Hydration for Children', 
                    duration: 6, 
                    content: '<h3>Water Needs</h3><p>Children need appropriate water intake based on age and activity level. Limit sugary drinks.</p><p>Water is the best choice for hydration. Avoid soda and excessive juice.</p>',
                    keyPoints: ['Water needs increase with activity', 'Offer water with every meal and snack', 'Limit juice to 4oz per day max', 'Milk provides hydration plus nutrients'],
                    examples: [
                        { title: 'Daily Water Guide', description: 'Toddlers: 4 cups, Preschoolers: 5 cups, School-age: 7-8 cups.' },
                        { title: 'Water Bottles', description: 'Keep a water bottle handy and remind children to drink regularly.' }
                    ]
                },
                { 
                    title: 'Healthy Snacks', 
                    duration: 6, 
                    content: '<h3>Smart Snacking</h3><p>Offer nutritious snacks between meals. Avoid processed foods and excessive sugar.</p><p>Snacks should complement meals, not replace them.</p>',
                    keyPoints: ['Plan snacks like mini meals', 'Include protein and fiber', 'Avoid sugary cereals and candies', 'Timing matters - snack 2 hours before meals'],
                    examples: [
                        { title: 'Good Snack Ideas', description: 'Hummus with veggies, whole grain crackers with cheese, fruit with yogurt.' },
                        { title: 'Snack Timing', description: 'Afternoon snack at 3-4pm helps bridge gap before dinner.' }
                    ]
                }
            ],
            quiz: [
                { question: 'Which food is a common allergen in children?', options: ['Rice', 'Peanuts', 'Cucumber', 'Carrots'], correct: 1 },
                { question: 'How much water should a 5-year-old drink daily?', options: ['500ml', '1 litre', '1.5 litres', '3 litres'], correct: 1 },
                { question: 'What should you do if a child has a known food allergy?', options: ['Ignore it if reaction is mild', 'Check all food labels carefully', 'Give a small amount to test', 'Avoid all solid foods'], correct: 1 }
            ],
            xpReward: 80,
            order: 2
        },
        {
            moduleId: 'development',
            icon: '🎨',
            title: 'Child Development & Activities',
            description: 'Explore developmental milestones, age-appropriate activities, and how to support cognitive and emotional growth.',
            duration: '50 min',
            totalLessons: 7,
            level: 'Intermediate',
            color: '#CE93D8',
            background: '#F3E5F5',
            topics: ['Developmental milestones', 'Play-based learning', 'Creative activities', 'Language development', 'Social skills', 'Emotional regulation', 'Screen time guidelines'],
            lessons: [
                { 
                    title: 'Understanding Milestones', 
                    duration: 7, 
                    content: '<h3>Track Growth</h3><p>Every child develops at their own pace. Learn typical milestones for different age groups.</p><p>Milestones are guidelines, not strict deadlines. Celebrate progress, not just achievements.</p>',
                    keyPoints: ['Milestones are approximate - every child is different', 'Track progress over months, not days', 'Share concerns with parents if you notice delays', 'Celebrate small victories'],
                    examples: [
                        { title: 'Walking Timeline', description: 'Most children walk between 9-15 months. Both are normal!' },
                        { title: 'Language Variations', description: 'Some children say first words at 10 months, others at 18 months.' }
                    ]
                },
                { 
                    title: 'Play-Based Learning', 
                    duration: 8, 
                    content: '<h3>Learning Through Play</h3><p>Play is a child\'s work. Structured and unstructured play both have important benefits.</p><p>Through play, children learn problem-solving, social skills, and creativity.</p>',
                    keyPoints: ['Play should be child-led, not adult-directed', 'Free play builds imagination', 'Guided play teaches specific skills', 'Balance active and quiet play'],
                    examples: [
                        { title: 'Building Blocks', description: 'Teaches physics concepts, patience, and hand-eye coordination.' },
                        { title: 'Pretend Play', description: 'Cooking, doctor, or house play builds social and language skills.' }
                    ]
                },
                { 
                    title: 'Creative Activities', 
                    duration: 7, 
                    content: '<h3>Art & Creativity</h3><p>Art activities help develop fine motor skills and self-expression. Provide safe, non-toxic materials.</p><p>The process matters more than the product. Focus on exploration, not perfection.</p>',
                    keyPoints: ['Use non-toxic, washable supplies', 'Focus on process, not product', 'Let children lead their creativity', 'Display their work to build confidence'],
                    examples: [
                        { title: 'Finger Painting', description: 'Great for sensory development and color recognition.' },
                        { title: 'Playdough Fun', description: 'Strengthens hand muscles and encourages creativity.' }
                    ]
                },
                { 
                    title: 'Language Development', 
                    duration: 7, 
                    content: '<h3>Building Communication</h3><p>Read, sing, and talk to children daily. This builds vocabulary and communication skills.</p><p>Children learn language best through conversation and interaction.</p>',
                    keyPoints: ['Read aloud every day', 'Name objects and describe actions', 'Ask open-ended questions', 'Expand on what children say'],
                    examples: [
                        { title: 'Reading Time', description: 'Point to pictures and ask "What is that?" Encourage turning pages.' },
                        { title: 'Daily Narrating', description: '"Now we\'re putting on your shoes. Left shoe, right shoe!"' }
                    ]
                },
                { 
                    title: 'Social Skills', 
                    duration: 7, 
                    content: '<h3>Building Friendships</h3><p>Teach sharing, taking turns, and empathy. Model positive social behavior.</p><p>Social skills develop through practice and guidance.</p>',
                    keyPoints: ['Practice sharing with small groups first', 'Use "I" statements: "I feel sad when..."', 'Model good social behavior', 'Praise kind actions'],
                    examples: [
                        { title: 'Turn-Taking Game', description: 'Roll a ball back and forth. Practice "My turn, your turn."' },
                        { title: 'Empathy Building', description: '"How do you think she feels?" after seeing someone upset.' }
                    ]
                },
                { 
                    title: 'Emotional Regulation', 
                    duration: 7, 
                    content: '<h3>Managing Emotions</h3><p>Help children identify and express emotions. Teach coping strategies appropriate for their age.</p><p>Big emotions are normal. Children need help learning to manage them.</p>',
                    keyPoints: ['Name emotions: "You look frustrated"', 'Offer calm-down strategies', 'Validate feelings before correcting behavior', 'Be a calm role model'],
                    examples: [
                        { title: 'Emotion Thermometer', description: 'Teach children to identify their emotion level from 1-10.' },
                        { title: 'Calm Down Corner', description: 'Create a safe space with sensory toys for emotional regulation.' }
                    ]
                },
                { 
                    title: 'Screen Time Guidelines', 
                    duration: 7, 
                    content: '<h3>Healthy Screen Use</h3><p>Limit screen time based on age. Choose quality educational content when screens are used.</p><p>Screens should complement, not replace, other activities.</p>',
                    keyPoints: ['Under 2: No screen time except video calls', 'Ages 2-5: Max 1 hour per day', 'Choose educational, slow-paced programs', 'Never use screens during meals'],
                    examples: [
                        { title: 'Interactive vs Passive', description: 'Video calls are better than passive TV watching.' },
                        { title: 'Screen-Free Activities', description: 'Replace 30 min screen time with outdoor play or reading.' }
                    ]
                }
            ],
            quiz: [
                { question: "What type of play best supports a toddler's development?", options: ['Screen-based play', 'Solitary structured play', 'Free unstructured play', 'No play needed'], correct: 2 },
                { question: "At what age do children typically start speaking 2-word phrases?", options: ['6 months', '12 months', '18-24 months', '36 months'], correct: 2 },
                { question: 'Which activity supports fine motor skill development?', options: ['Running', 'Drawing and colouring', 'Watching TV', 'Sleeping'], correct: 1 }
            ],
            xpReward: 120,
            order: 3
        },
        {
            moduleId: 'communication',
            icon: '🤝',
            title: 'Communication with Parents',
            description: 'Build trust with families, communicate effectively, handle difficult situations professionally.',
            duration: '30 min',
            totalLessons: 4,
            level: 'Intermediate',
            color: '#FFD54F',
            background: '#FFF8E1',
            topics: ['Daily reporting to parents', 'Handling complaints', 'Setting boundaries', 'Emergency communication'],
            lessons: [
                { 
                    title: 'Building Trust', 
                    duration: 7, 
                    content: '<h3>Trust Foundation</h3><p>Open, honest communication builds trust. Keep parents informed about their child\'s day.</p><p>Parents are entrusting you with their most precious possession - build that trust every day.</p>',
                    keyPoints: ['Be honest, even about mistakes', 'Follow through on commitments', 'Respect family values and parenting style', 'Maintain confidentiality'],
                    examples: [
                        { title: 'Daily Report', description: '"Today Emma played well with others and tried new foods!"' },
                        { title: 'Honest Update', description: '"Jake had a difficult afternoon. Here\'s what we did about it."' }
                    ]
                },
                { 
                    title: 'Daily Updates', 
                    duration: 8, 
                    content: '<h3>Regular Communication</h3><p>Share highlights, challenges, and milestones. Use apps or daily logs to track activities.</p><p>Consistent communication prevents misunderstandings and builds confidence.</p>',
                    keyPoints: ['Report both highlights and challenges', 'Share developmental milestones observed', 'Use photos or notes when appropriate', 'Ask parents about their preferences'],
                    examples: [
                        { title: 'End-of-Day Handoff', description: 'Quick verbal update on meals, naps, activities, and mood.' },
                        { title: 'Milestone Moment', description: '"Leo learned a new word today! He said \'more\' for more crackers!"' }
                    ]
                },
                { 
                    title: 'Handling Concerns', 
                    duration: 8, 
                    content: '<h3>Professional Approach</h3><p>Address complaints calmly and professionally. Listen first, then respond thoughtfully.</p><p>Difficult conversations are opportunities to build deeper trust.</p>',
                    keyPoints: ['Listen without becoming defensive', 'Acknowledge the concern fully', 'Offer solutions or alternatives', 'Follow up to ensure satisfaction'],
                    examples: [
                        { title: 'Active Listening', description: '"I hear that you\'re concerned about nap time. Let me understand better..."' },
                        { title: 'Problem Solving', description: '"Let\'s try a new approach and check in next week about how it\'s working."' }
                    ]
                },
                { 
                    title: 'Emergency Communication', 
                    duration: 7, 
                    content: '<h3>Crisis Communication</h3><p>Know when and how to contact parents in emergencies. Have backup contact numbers ready.</p><p>Clear communication during emergencies is critical for child safety.</p>',
                    keyPoints: ['Know which situations require immediate call', 'Have multiple contact numbers', 'Document all incident details', 'Be calm and factual in communication'],
                    examples: [
                        { title: 'Emergency Call', description: '"There\'s been a minor fall. Noah bumped his knee. We\'re applying first aid now."' },
                        { title: 'Medical Emergency', description: '"Call 112 first, then notify parents. Follow the emergency plan."' }
                    ]
                }
            ],
            quiz: [
                { question: "How often should you update parents about their child's day?", options: ['Only if something goes wrong', 'Once a week', 'Daily, at pickup or via message', 'Never, parents should ask'], correct: 2 },
                { question: "A parent is unhappy with your service. What should you do first?", options: ['Argue your point', 'Listen calmly and acknowledge their concern', 'Ignore them', 'Immediately resign'], correct: 1 },
                { question: 'What information should ALWAYS be shared with parents?', options: ["Child's mood only", 'Any injury, illness or unusual behaviour', 'Only positive things', 'Nothing personal'], correct: 1 }
            ],
            xpReward: 80,
            order: 4
        },
        {
            moduleId: 'first-aid',
            icon: '🏥',
            title: 'First Aid & Emergency Response',
            description: 'Master CPR, choking response, wound care, and emergency protocols every caretaker must know.',
            duration: '60 min',
            totalLessons: 8,
            level: 'Advanced',
            color: '#FF7043',
            background: '#FBE9E7',
            topics: ['CPR for children', 'Choking response', 'Wound care', 'Fever management', 'Seizure response', 'Poisoning response', 'Burns treatment', 'Emergency contacts'],
            lessons: [
                { title: 'First Aid Fundamentals', duration: 7, content: '<h3>Being Prepared</h3><p>Know your limits and when to call professionals. First aid training is essential for all caretakers.</p>' },
                { title: 'CPR for Children', duration: 8, content: '<h3>Life-Saving Skills</h3><p>Learn child and infant CPR. Practice on mannequins if possible. Stay calm during emergencies.</p>' },
                { title: 'Choking Response', duration: 8, content: '<h3>Clearing Airways</h3><p>Know the difference between infant, child, and adult choking techniques. Act quickly.</p>' },
                { title: 'Wound Care', duration: 7, content: '<h3>Treating Injuries</h3><p>Clean wounds properly, apply bandages, and know when stitches are needed.</p>' },
                { title: 'Fever Management', duration: 7, content: '<h3>When to Act</h3><p>Know fever thresholds by age. Understand when to give medication and when to seek help.</p>' },
                { title: 'Allergic Reactions', duration: 7, content: '<h3>Anaphylaxis Response</h3><p>Recognize severe allergic reactions. Know how to use epinephrine auto-injectors if prescribed.</p>' },
                { title: 'Burns & Falls', duration: 8, content: '<h3>Common Injuries</h3><p>Treat minor burns with cool water. Assess falls for head injuries. Watch for signs of concussion.</p>' },
                { title: 'Emergency Action Plan', duration: 8, content: '<h3>Be Prepared</h3><p>Create an emergency action plan. Keep first aid kit stocked. Know location of nearest hospital.</p>' }
            ],
            quiz: [
                { question: 'For a choking child over 1 year old, what technique do you use?', options: ['Back blows only', 'Abdominal thrusts (Heimlich)', 'Mouth to mouth', 'Lay them flat'], correct: 1 },
                { question: 'What fever temperature in a child requires immediate medical attention?', options: ['37°C', '38°C', '40°C or above', '36.5°C'], correct: 2 },
                { question: 'For a minor cut, you should first:', options: ['Apply butter', 'Rinse with clean water and apply pressure', 'Ignore it', 'Apply toothpaste'], correct: 1 }
            ],
            xpReward: 150,
            order: 5
        },
        {
            moduleId: 'ethics',
            icon: '📋',
            title: 'Professional Standards & Ethics',
            description: 'Understand your professional responsibilities, privacy obligations, and ethical standards as a caretaker.',
            duration: '25 min',
            totalLessons: 4,
            level: 'Advanced',
            color: '#1A237E',
            background: '#E8EAF6',
            topics: ['Privacy and confidentiality', 'Professional boundaries', 'Mandatory reporting', 'Code of conduct'],
            lessons: [
                { title: 'Confidentiality', duration: 6, content: '<h3>Protecting Privacy</h3><p>Never share personal information about families or children. What happens in the home stays private.</p>' },
                { title: 'Professional Boundaries', duration: 7, content: '<h3>Setting Limits</h3><p>Maintain professional relationships. Set clear boundaries with families about working hours and responsibilities.</p>' },
                { title: 'Mandatory Reporting', duration: 6, content: '<h3>Legal Obligations</h3><p>Know your legal duty to report suspected abuse or neglect. Protection for reporters varies by location.</p>' },
                { title: 'Code of Conduct', duration: 6, content: '<h3>Ethical Practice</h3><p>Act with integrity. Be reliable, punctual, and professional. Treat all children equally.</p>' }
            ],
            quiz: [
                { question: "You suspect a child is being abused at home. What should you do?", options: ["Do nothing, it's not your business", 'Report to the appropriate authorities', 'Confront the parents directly', 'Tell other parents'], correct: 1 },
                { question: 'Which of these is a professional boundary violation?', options: ['Sending daily reports to parents', "Sharing child's info with neighbours", 'Maintaining activity logs', 'Following safety protocols'], correct: 1 },
                { question: 'Child information you learn must be:', options: ['Shared freely with anyone', 'Kept strictly confidential', 'Posted on social media', 'Discussed publicly'], correct: 1 }
            ],
            xpReward: 80,
            order: 6
        },
        {
            moduleId: 'sleep',
            icon: '😴',
            title: 'Sleep Training & Routines',
            description: 'Learn age-appropriate sleep schedules, sleep training methods, and creating healthy bedtime routines.',
            duration: '40 min',
            totalLessons: 5,
            level: 'Intermediate',
            color: '#7986CB',
            background: '#E8EAF6',
            topics: ['Sleep requirements by age', 'Bedtime routines', 'Sleep training methods', 'Handling night wakings', 'Nap schedules'],
            lessons: [
                { title: 'Understanding Sleep Needs', duration: 8, content: '<h3>Sleep Science</h3><p>Children need different amounts of sleep at different ages. Understand circadian rhythms and sleep cycles.</p>' },
                { title: 'Building Bedtime Routines', duration: 8, content: '<h3>Consistent Rituals</h3><p>Create calming pre-sleep routines. Include bath, story, and quiet time activities.</p>' },
                { title: 'Sleep Training Methods', duration: 9, content: '<h3>Different Approaches</h3><p>Learn various sleep training techniques. Choose methods that align with family values.</p>' },
                { title: 'Managing Night Wakings', duration: 8, content: '<h3>Staying Calm</h3><p>Respond appropriately to night wakings. Know the difference between hunger, discomfort, and habit.</p>' },
                { title: 'Nap Schedules', duration: 7, content: '<h3>Daytime Sleep</h3><p>Understand nap transitions as children grow. Create flexible nap schedules that work for the family.</p>' }
            ],
            quiz: [
                { question: 'How many hours of sleep does a 3-year-old typically need (including naps)?', options: ['8 hours', '10 hours', '12-14 hours', '16 hours'], correct: 2 },
                { question: 'Which is NOT part of a healthy bedtime routine?', options: ['Bath time', 'Story time', 'Active play', 'Quiet activities'], correct: 2 },
                { question: 'When sleep training, consistency from caregivers is:', options: ['Unimportant', 'Nice to have', 'Essential', 'Only needed the first week'], correct: 2 }
            ],
            xpReward: 90,
            order: 7
        },
        {
            moduleId: 'special-needs',
            icon: '🌟',
            title: 'Special Needs Awareness',
            description: 'Learn to support children with developmental delays, physical disabilities, and learning differences.',
            duration: '45 min',
            totalLessons: 5,
            level: 'Advanced',
            color: '#AB47BC',
            background: '#F3E5F5',
            topics: ['Understanding developmental delays', 'Inclusive activities', 'Communication strategies', 'Sensory processing', 'Collaboration with specialists'],
            lessons: [
                { title: 'Introduction to Special Needs', duration: 9, content: '<h3>Diversity in Development</h3><p>Every child learns differently. Understanding individual needs helps provide better care.</p>' },
                { title: 'Creating Inclusive Environments', duration: 9, content: '<h3>Accessible Spaces</h3><p>Adapt activities and spaces to include all children. Focus on abilities, not limitations.</p>' },
                { title: 'Communication Strategies', duration: 9, content: '<h3>Alternative Methods</h3><p>Learn visual supports, sign language basics, and adaptive communication tools.</p>' },
                { title: 'Sensory Processing', duration: 9, content: '<h3>Sensory Awareness</h3><p>Understand sensory sensitivities. Create sensory-friendly environments.</p>' },
                { title: 'Working with Specialists', duration: 9, content: '<h3>Team Approach</h3><p>Collaborate with therapists and specialists. Follow individualized care plans.</p>' }
            ],
            quiz: [
                { question: 'When a child has sensory sensitivities, you should:', options: ['Ignore their reactions', 'Force them to cope', 'Create a sensory-friendly environment', 'Limit all activities'], correct: 2 },
                { question: 'Inclusive care means:', options: ['Treating all children exactly the same', 'Adapting to meet individual needs', 'Only focusing on typical development', 'Avoiding children with special needs'], correct: 1 },
                { question: 'Visual supports can help children with:', options: ['Only physical disabilities', 'Communication and routine understanding', 'Only academic learning', 'Nothing, they are not useful'], correct: 1 }
            ],
            xpReward: 100,
            order: 8
        },
        {
            moduleId: 'multi-child',
            icon: '👨‍👩‍👧‍👦',
            title: 'Managing Multiple Children',
            description: 'Techniques for caring for siblings, managing different age groups, and fostering positive sibling relationships.',
            duration: '35 min',
            totalLessons: 4,
            level: 'Intermediate',
            color: '#26A69A',
            background: '#E0F2F1',
            topics: ['Age-appropriate supervision', 'Sibling dynamics', 'Individual attention', 'Conflict resolution'],
            lessons: [
                { title: 'Supervision Strategies', duration: 8, content: '<h3>Keeping All Safe</h3><p>Balance supervision with independence. Know safe activities for different ages.</p>' },
                { title: 'Understanding Sibling Dynamics', duration: 9, content: '<h3>Family Relationships</h3><p>Siblings have unique relationships. Foster positive interactions and model conflict resolution.</p>' },
                { title: 'One-on-One Time', duration: 9, content: '<h3>Special Connections</h3><p>Schedule individual time with each child. This reduces jealousy and strengthens bonds.</p>' },
                { title: 'Managing Conflicts', duration: 9, content: '<h3>Peaceful Solutions</h3><p>Teach sharing, turn-taking, and apology. Let children problem-solve with guidance.</p>' }
            ],
            quiz: [
                { question: 'When siblings fight, the best approach is usually:', options: ['Let them work it out completely', 'Step in immediately and punish', 'Guide them to find solutions', 'Separate them permanently'], correct: 2 },
                { question: 'One-on-one time with each child helps:', options: ['Only the oldest child', 'Build individual relationships', 'Waste time that could be spent together', 'Only children who misbehave'], correct: 1 },
                { question: 'Age-appropriate supervision means:', options: ['Never leaving children alone', 'Matching supervision to developmental stage', 'Treating all ages the same', 'Only watching babies'], correct: 1 }
            ],
            xpReward: 80,
            order: 9
        },
        {
            moduleId: 'water-safety',
            icon: '🏊',
            title: 'Water Safety',
            description: 'Essential water safety knowledge for pools, beaches, bathtubs, and preventing drowning accidents.',
            duration: '30 min',
            totalLessons: 4,
            level: 'Beginner',
            color: '#29B6F6',
            background: '#E1F5FE',
            topics: ['Drowning prevention', 'Pool safety', 'Bathtub safety', 'Emergency water rescue'],
            lessons: [
                { title: 'Drowning Risks', duration: 7, content: '<h3>Understanding Danger</h3><p>Drowning can happen quickly and silently. Never leave children unattended near water.</p>' },
                { title: 'Pool & Beach Safety', duration: 8, content: '<h3>Safe Swimming</h3><p>Fences, barriers, and constant supervision save lives. Know the depth and conditions.</p>' },
                { title: 'Bathtub Safety', duration: 8, content: '<h3>Daily Routines</h3><p>Never leave children alone in the bathtub. Check water temperature and depth.</p>' },
                { title: 'Emergency Response', duration: 7, content: '<h3>Act Fast</h3><p>If a child is in distress, remove them from water immediately. Begin CPR if needed.</p>' }
            ],
            quiz: [
                { question: 'A child can drown in as little as how much water?', options: ['A full bathtub', 'An inch of water', 'A swimming pool only', 'Only deep water'], correct: 1 },
                { question: 'When children are swimming, supervision should be:', options: ['At the poolside on phone', 'Constant and attentive', 'Checked every few minutes', 'Not necessary if they can swim'], correct: 1 },
                { question: 'Babies should never be left:', options: ['In a bathtub', 'With an older sibling', 'Unattended near any water', 'In a small wading pool'], correct: 2 }
            ],
            xpReward: 70,
            order: 10
        }
    ];

    await Module.insertMany(modules);
};

// ─────────────────────────────────────────────────────────────
// @desc  Auto-update existing modules (call on server startup)
// ─────────────────────────────────────────────────────────────
const updateModules = async () => {
    try {
        const moduleDefinitions = getModuleDefinitions();
        let updatedCount = 0;
        let insertedCount = 0;

        for (const moduleDef of moduleDefinitions) {
            const existing = await Module.findOne({ moduleId: moduleDef.moduleId });

            if (existing) {
                // Update existing module with latest data (lessons, quiz, etc.)
                await Module.updateOne(
                    { moduleId: moduleDef.moduleId },
                    {
                        $set: {
                            icon: moduleDef.icon,
                            title: moduleDef.title,
                            description: moduleDef.description,
                            duration: moduleDef.duration,
                            totalLessons: moduleDef.totalLessons,
                            level: moduleDef.level,
                            color: moduleDef.color,
                            background: moduleDef.background,
                            topics: moduleDef.topics,
                            lessons: moduleDef.lessons,
                            quiz: moduleDef.quiz,
                            xpReward: moduleDef.xpReward,
                            isActive: true
                        }
                    }
                );
                updatedCount++;
                console.log(`✅ Updated module: ${moduleDef.title}`);
            } else {
                // Insert new module
                await Module.create(moduleDef);
                insertedCount++;
                console.log(`➕ Inserted module: ${moduleDef.title}`);
            }
        }

        console.log(`📚 Training modules sync complete: ${updatedCount} updated, ${insertedCount} new`);
    } catch (error) {
        console.error('❌ Error updating training modules:', error);
    }
};

// Get all module definitions (for seeding and updating)
const getModuleDefinitions = () => [
    {
        moduleId: 'child-safety',
        icon: '🧸',
        title: 'Child Safety Basics',
        description: 'Learn essential safety protocols, emergency procedures, and how to create a safe environment for children.',
        duration: '45 min',
        totalLessons: 6,
        level: 'Beginner',
        color: '#4FC3F7',
        background: '#E3F2FD',
        topics: ['Emergency contacts', 'Childproofing spaces', 'First aid basics', 'Fire safety', 'Stranger danger protocol', 'Safe sleep practices'],
        lessons: [
            { 
                title: 'Introduction to Child Safety', 
                duration: 5, 
                content: '<h3>Why Child Safety Matters</h3><p>Children are curious explorers. As caretakers, we must ensure their environment is safe while allowing them to learn and grow. Children under 5 are especially vulnerable to accidents.</p><p>As a caretaker, you are responsible for creating a safe environment and responding appropriately to emergencies.</p>',
                keyPoints: ['Always supervise children at all times', 'Identify potential hazards in the environment', 'Know emergency procedures', 'Stay alert and focused'],
                examples: [
                    { title: 'Supervision Tip', description: 'Never turn your back on a child near water, even for a moment.' },
                    { title: 'Environment Check', description: 'Before starting your shift, walk through the space and identify potential dangers.' }
                ]
            },
            { 
                title: 'Emergency Contacts & Protocols', 
                duration: 8, 
                content: '<h3>Emergency Planning</h3><p>Always have emergency contacts readily available. Know the local emergency number and child\'s medical information.</p><p>Keep a list of emergency contacts in an easily accessible place.</p>',
                keyPoints: ['Save emergency numbers on your phone', 'Know the child\'s medical history', 'Keep parents\' contact numbers handy', 'Know the address of your location'],
                examples: [
                    { title: 'Emergency Contact Card', description: 'Create a card with: Parents, Doctor, Hospital, and Emergency Services numbers.' },
                    { title: 'Medical Information', description: 'Note any allergies, medications, or special conditions the child has.' }
                ]
            },
            { 
                title: 'Childproofing Your Space', 
                duration: 10, 
                content: '<h3>Making Spaces Safe</h3><p>Cover outlets, secure furniture, lock cabinets, and remove small objects that could be choking hazards.</p><p>Get down to the child\'s level to see what dangers they can reach.</p>',
                keyPoints: ['Cover all electrical outlets', 'Lock cabinets with chemicals/medicines', 'Secure heavy furniture to walls', 'Remove small choking hazards'],
                examples: [
                    { title: 'Outlet Safety', description: 'Use safety plugs or outlet covers on all unused outlets.' },
                    { title: 'Cabinet Safety', description: 'Use child-proof locks on cabinets containing cleaning products.' }
                ]
            },
            { 
                title: 'Fire & Hazard Safety', 
                duration: 8, 
                content: '<h3>Preventing Accidents</h3><p>Install smoke detectors, keep lighters away, and teach children about dangerous items.</p><p>Never leave children unattended near fire, stoves, or hot surfaces.</p>',
                keyPoints: ['Keep matches and lighters out of reach', 'Know fire escape routes', 'Keep a fire extinguisher accessible', 'Teach children "hot" means danger'],
                examples: [
                    { title: 'Kitchen Safety', description: 'Turn pot handles away from the edge of the stove.' },
                    { title: 'Fire Awareness', description: 'Teach children to stay away from the stove, fireplace, and candles.' }
                ]
            },
            { 
                title: 'Stranger Safety', 
                duration: 7, 
                content: '<h3>Teaching Boundaries</h3><p>Teach children about safe vs unsafe situations, appropriate vs inappropriate touch, and when to seek help.</p><p>Build trust so children feel comfortable telling you if something happens.</p>',
                keyPoints: ['Children should know their full name and address', 'Teach "no" to unwanted touch', 'Identify safe adults they can approach', 'Know when to call for help'],
                examples: [
                    { title: 'Safe vs Unsafe Touch', description: 'Safe: Hugs from family. Unsafe: Touches to private areas.' },
                    { title: 'Stranger Rules', description: 'Never go anywhere with a stranger. Always tell a trusted adult.' }
                ]
            },
            { 
                title: 'Safe Sleep Practices', 
                duration: 7, 
                content: '<h3>Sleep Safety</h3><p>Follow ABCs of safe sleep: Alone, on Back, in Crib. No loose blankets, pillows, or toys in the crib.</p><p>Safe sleep reduces the risk of SIDS (Sudden Infant Death Syndrome).</p>',
                keyPoints: ['Always place babies on their back to sleep', 'Use a firm, flat sleep surface', 'Keep soft objects out of the sleep area', 'Avoid overheating'],
                examples: [
                    { title: 'Crib Setup', description: 'Firm mattress, fitted sheet, no pillows, blankets, or stuffed animals.' },
                    { title: 'Room Sharing', description: 'Babies can sleep in the same room as parents, but on a separate surface.' }
                ]
            }
        ],
        quiz: [
            { question: 'What is the FIRST thing you should do in a medical emergency?', options: ["Call the child's parents", 'Call emergency services (112)', 'Give medicine', 'Wait and observe'], correct: 1 },
            { question: 'At what age can a child be left alone at home briefly?', options: ['5 years', '8 years', '12 years', '10 years'], correct: 2 },
            { question: 'Which of these is a childproofing measure?', options: ['Leave cleaning supplies on low shelves', 'Install outlet covers', 'Keep sharp objects accessible', 'Remove stair gates'], correct: 1 }
        ],
        xpReward: 100,
        order: 1
    },
    {
        moduleId: 'nutrition',
        icon: '🥗',
        title: 'Nutrition & Meal Planning',
        description: 'Understand child nutrition requirements, age-appropriate foods, allergy management and healthy meal preparation.',
        duration: '35 min',
        totalLessons: 5,
        level: 'Beginner',
        color: '#69F0AE',
        background: '#E8F5E9',
        topics: ['Age-appropriate diets', 'Common food allergies', 'Balanced meals', 'Hydration needs', 'Healthy snack ideas'],
        lessons: [
            { 
                title: 'Understanding Child Nutrition', 
                duration: 7, 
                content: '<h3>Building Healthy Habits</h3><p>Children need balanced nutrition for growth and development. Learn about portion sizes and food groups.</p><p>A healthy diet includes proteins, carbohydrates, fruits, vegetables, and dairy.</p>',
                keyPoints: ['Children need 3 meals and 2-3 snacks daily', 'Portion sizes are smaller than adult portions', 'Variety is key to getting all nutrients', 'Eating together models healthy habits'],
                examples: [
                    { title: 'Balanced Plate', description: 'Half vegetables, quarter protein, quarter grains.' },
                    { title: 'Snack Ideas', description: 'Apple slices with peanut butter, cheese cubes, or yogurt.' }
                ]
            },
            { 
                title: 'Food Allergies & Intolerances', 
                duration: 8, 
                content: '<h3>Allergy Awareness</h3><p>Recognize signs of allergic reactions and know how to respond. Common allergens include nuts, dairy, and shellfish.</p><p>Always ask parents about known allergies before feeding a child.</p>',
                keyPoints: ['Know the top 8 allergens', 'Watch for signs of allergic reaction', 'Always read food labels', 'When in doubt, don\'t serve it'],
                examples: [
                    { title: 'Common Allergens', description: 'Peanuts, tree nuts, milk, eggs, wheat, soy, fish, shellfish.' },
                    { title: 'Reaction Signs', description: 'Hives, swelling, vomiting, difficulty breathing - act immediately!' }
                ]
            },
            { 
                title: 'Planning Balanced Meals', 
                duration: 8, 
                content: '<h3>Meal Planning Guide</h3><p>Create meals with protein, carbs, vegetables, and healthy fats. Make food visually appealing for children.</p><p>Children eat with their eyes first - make meals colorful and fun.</p>',
                keyPoints: ['Include a protein source at each meal', 'Offer vegetables even if child resists', 'Make food finger-friendly for young kids', 'Let children help prepare meals'],
                examples: [
                    { title: 'Easy Meal: Pasta', description: 'Whole grain pasta with turkey meatballs and steamed broccoli.' },
                    { title: 'Fun Presentation', description: 'Make a smiley face with food: egg eyes, carrot nose, broccoli hair.' }
                ]
            },
            { 
                title: 'Hydration for Children', 
                duration: 6, 
                content: '<h3>Water Needs</h3><p>Children need appropriate water intake based on age and activity level. Limit sugary drinks.</p><p>Water is the best choice for hydration. Avoid soda and excessive juice.</p>',
                keyPoints: ['Water needs increase with activity', 'Offer water with every meal and snack', 'Limit juice to 4oz per day max', 'Milk provides hydration plus nutrients'],
                examples: [
                    { title: 'Daily Water Guide', description: 'Toddlers: 4 cups, Preschoolers: 5 cups, School-age: 7-8 cups.' },
                    { title: 'Water Bottles', description: 'Keep a water bottle handy and remind children to drink regularly.' }
                ]
            },
            { 
                title: 'Healthy Snacks', 
                duration: 6, 
                content: '<h3>Smart Snacking</h3><p>Offer nutritious snacks between meals. Avoid processed foods and excessive sugar.</p><p>Snacks should complement meals, not replace them.</p>',
                keyPoints: ['Plan snacks like mini meals', 'Include protein and fiber', 'Avoid sugary cereals and candies', 'Timing matters - snack 2 hours before meals'],
                examples: [
                    { title: 'Good Snack Ideas', description: 'Hummus with veggies, whole grain crackers with cheese, fruit with yogurt.' },
                    { title: 'Snack Timing', description: 'Afternoon snack at 3-4pm helps bridge gap before dinner.' }
                ]
            }
        ],
        quiz: [
            { question: 'Which food is a common allergen in children?', options: ['Rice', 'Peanuts', 'Cucumber', 'Carrots'], correct: 1 },
            { question: 'How much water should a 5-year-old drink daily?', options: ['500ml', '1 litre', '1.5 litres', '3 litres'], correct: 1 },
            { question: 'What should you do if a child has a known food allergy?', options: ['Ignore it if reaction is mild', 'Check all food labels carefully', 'Give a small amount to test', 'Avoid all solid foods'], correct: 1 }
        ],
        xpReward: 80,
        order: 2
    },
    {
        moduleId: 'development',
        icon: '🎨',
        title: 'Child Development & Activities',
        description: 'Explore developmental milestones, age-appropriate activities, and how to support cognitive and emotional growth.',
        duration: '50 min',
        totalLessons: 7,
        level: 'Intermediate',
        color: '#CE93D8',
        background: '#F3E5F5',
        topics: ['Developmental milestones', 'Play-based learning', 'Creative activities', 'Language development', 'Social skills', 'Emotional regulation', 'Screen time guidelines'],
        lessons: [
            { 
                title: 'Understanding Milestones', 
                duration: 7, 
                content: '<h3>Track Growth</h3><p>Every child develops at their own pace. Learn typical milestones for different age groups.</p><p>Milestones are guidelines, not strict deadlines. Celebrate progress, not just achievements.</p>',
                keyPoints: ['Milestones are approximate - every child is different', 'Track progress over months, not days', 'Share concerns with parents if you notice delays', 'Celebrate small victories'],
                examples: [
                    { title: 'Walking Timeline', description: 'Most children walk between 9-15 months. Both are normal!' },
                    { title: 'Language Variations', description: 'Some children say first words at 10 months, others at 18 months.' }
                ]
            },
            { 
                title: 'Play-Based Learning', 
                duration: 8, 
                content: '<h3>Learning Through Play</h3><p>Play is a child\'s work. Structured and unstructured play both have important benefits.</p><p>Through play, children learn problem-solving, social skills, and creativity.</p>',
                keyPoints: ['Play should be child-led, not adult-directed', 'Free play builds imagination', 'Guided play teaches specific skills', 'Balance active and quiet play'],
                examples: [
                    { title: 'Building Blocks', description: 'Teaches physics concepts, patience, and hand-eye coordination.' },
                    { title: 'Pretend Play', description: 'Cooking, doctor, or house play builds social and language skills.' }
                ]
            },
            { 
                title: 'Creative Activities', 
                duration: 7, 
                content: '<h3>Art & Creativity</h3><p>Art activities help develop fine motor skills and self-expression. Provide safe, non-toxic materials.</p><p>The process matters more than the product. Focus on exploration, not perfection.</p>',
                keyPoints: ['Use non-toxic, washable supplies', 'Focus on process, not product', 'Let children lead their creativity', 'Display their work to build confidence'],
                examples: [
                    { title: 'Finger Painting', description: 'Great for sensory development and color recognition.' },
                    { title: 'Playdough Fun', description: 'Strengthens hand muscles and encourages creativity.' }
                ]
            },
            { 
                title: 'Language Development', 
                duration: 7, 
                content: '<h3>Building Communication</h3><p>Read, sing, and talk to children daily. This builds vocabulary and communication skills.</p><p>Children learn language best through conversation and interaction.</p>',
                keyPoints: ['Read aloud every day', 'Name objects and describe actions', 'Ask open-ended questions', 'Expand on what children say'],
                examples: [
                    { title: 'Reading Time', description: 'Point to pictures and ask "What is that?" Encourage turning pages.' },
                    { title: 'Daily Narrating', description: '"Now we\'re putting on your shoes. Left shoe, right shoe!"' }
                ]
            },
            { 
                title: 'Social Skills', 
                duration: 7, 
                content: '<h3>Building Friendships</h3><p>Teach sharing, taking turns, and empathy. Model positive social behavior.</p><p>Social skills develop through practice and guidance.</p>',
                keyPoints: ['Practice sharing with small groups first', 'Use "I" statements: "I feel sad when..."', 'Model good social behavior', 'Praise kind actions'],
                examples: [
                    { title: 'Turn-Taking Game', description: 'Roll a ball back and forth. Practice "My turn, your turn."' },
                    { title: 'Empathy Building', description: '"How do you think she feels?" after seeing someone upset.' }
                ]
            },
            { 
                title: 'Emotional Regulation', 
                duration: 7, 
                content: '<h3>Managing Emotions</h3><p>Help children identify and express emotions. Teach coping strategies appropriate for their age.</p><p>Big emotions are normal. Children need help learning to manage them.</p>',
                keyPoints: ['Name emotions: "You look frustrated"', 'Offer calm-down strategies', 'Validate feelings before correcting behavior', 'Be a calm role model'],
                examples: [
                    { title: 'Emotion Thermometer', description: 'Teach children to identify their emotion level from 1-10.' },
                    { title: 'Calm Down Corner', description: 'Create a safe space with sensory toys for emotional regulation.' }
                ]
            },
            { 
                title: 'Screen Time Guidelines', 
                duration: 7, 
                content: '<h3>Healthy Screen Use</h3><p>Limit screen time based on age. Choose quality educational content when screens are used.</p><p>Screens should complement, not replace, other activities.</p>',
                keyPoints: ['Under 2: No screen time except video calls', 'Ages 2-5: Max 1 hour per day', 'Choose educational, slow-paced programs', 'Never use screens during meals'],
                examples: [
                    { title: 'Interactive vs Passive', description: 'Video calls are better than passive TV watching.' },
                    { title: 'Screen-Free Activities', description: 'Replace 30 min screen time with outdoor play or reading.' }
                ]
            }
        ],
        quiz: [
            { question: "What type of play best supports a toddler's development?", options: ['Screen-based play', 'Solitary structured play', 'Free unstructured play', 'No play needed'], correct: 2 },
            { question: "At what age do children typically start speaking 2-word phrases?", options: ['6 months', '12 months', '18-24 months', '36 months'], correct: 2 },
            { question: 'Which activity supports fine motor skill development?', options: ['Running', 'Drawing and colouring', 'Watching TV', 'Sleeping'], correct: 1 }
        ],
        xpReward: 120,
        order: 3
    },
    {
        moduleId: 'communication',
        icon: '🤝',
        title: 'Communication with Parents',
        description: 'Build trust with families, communicate effectively, handle difficult situations professionally.',
        duration: '30 min',
        totalLessons: 4,
        level: 'Intermediate',
        color: '#FFD54F',
        background: '#FFF8E1',
        topics: ['Daily reporting to parents', 'Handling complaints', 'Setting boundaries', 'Emergency communication'],
        lessons: [
            { 
                title: 'Building Trust', 
                duration: 7, 
                content: '<h3>Trust Foundation</h3><p>Open, honest communication builds trust. Keep parents informed about their child\'s day.</p><p>Parents are entrusting you with their most precious possession - build that trust every day.</p>',
                keyPoints: ['Be honest, even about mistakes', 'Follow through on commitments', 'Respect family values and parenting style', 'Maintain confidentiality'],
                examples: [
                    { title: 'Daily Report', description: '"Today Emma played well with others and tried new foods!"' },
                    { title: 'Honest Update', description: '"Jake had a difficult afternoon. Here\'s what we did about it."' }
                ]
            },
            { 
                title: 'Daily Updates', 
                duration: 8, 
                content: '<h3>Regular Communication</h3><p>Share highlights, challenges, and milestones. Use apps or daily logs to track activities.</p><p>Consistent communication prevents misunderstandings and builds confidence.</p>',
                keyPoints: ['Report both highlights and challenges', 'Share developmental milestones observed', 'Use photos or notes when appropriate', 'Ask parents about their preferences'],
                examples: [
                    { title: 'End-of-Day Handoff', description: 'Quick verbal update on meals, naps, activities, and mood.' },
                    { title: 'Milestone Moment', description: '"Leo learned a new word today! He said \'more\' for more crackers!"' }
                ]
            },
            { 
                title: 'Handling Concerns', 
                duration: 8, 
                content: '<h3>Professional Approach</h3><p>Address complaints calmly and professionally. Listen first, then respond thoughtfully.</p><p>Difficult conversations are opportunities to build deeper trust.</p>',
                keyPoints: ['Listen without becoming defensive', 'Acknowledge the concern fully', 'Offer solutions or alternatives', 'Follow up to ensure satisfaction'],
                examples: [
                    { title: 'Active Listening', description: '"I hear that you\'re concerned about nap time. Let me understand better..."' },
                    { title: 'Problem Solving', description: '"Let\'s try a new approach and check in next week about how it\'s working."' }
                ]
            },
            { 
                title: 'Emergency Communication', 
                duration: 7, 
                content: '<h3>Crisis Communication</h3><p>Know when and how to contact parents in emergencies. Have backup contact numbers ready.</p><p>Clear communication during emergencies is critical for child safety.</p>',
                keyPoints: ['Know which situations require immediate call', 'Have multiple contact numbers', 'Document all incident details', 'Be calm and factual in communication'],
                examples: [
                    { title: 'Emergency Call', description: '"There\'s been a minor fall. Noah bumped his knee. We\'re applying first aid now."' },
                    { title: 'Medical Emergency', description: '"Call 112 first, then notify parents. Follow the emergency plan."' }
                ]
            }
        ],
        quiz: [
            { question: "How often should you update parents about their child's day?", options: ['Only if something goes wrong', 'Once a week', 'Daily, at pickup or via message', 'Never, parents should ask'], correct: 2 },
            { question: "A parent is unhappy with your service. What should you do first?", options: ['Argue your point', 'Listen calmly and acknowledge their concern', 'Ignore them', 'Immediately resign'], correct: 1 },
            { question: 'What information should ALWAYS be shared with parents?', options: ["Child's mood only", 'Any injury, illness or unusual behaviour', 'Only positive things', 'Nothing personal'], correct: 1 }
        ],
        xpReward: 80,
        order: 4
    },
    {
        moduleId: 'first-aid',
        icon: '🏥',
        title: 'First Aid & Emergency Response',
        description: 'Master CPR, choking response, wound care, and emergency protocols every caretaker must know.',
        duration: '60 min',
        totalLessons: 8,
        level: 'Advanced',
        color: '#FF7043',
        background: '#FBE9E7',
        topics: ['CPR for children', 'Choking response', 'Wound care', 'Fever management', 'Seizure response', 'Poisoning response', 'Burns treatment', 'Emergency contacts'],
        lessons: [
            { title: 'First Aid Fundamentals', duration: 7, content: '<h3>Being Prepared</h3><p>Know your limits and when to call professionals. First aid training is essential for all caretakers.</p>' },
            { title: 'CPR for Children', duration: 8, content: '<h3>Life-Saving Skills</h3><p>Learn child and infant CPR. Practice on mannequins if possible. Stay calm during emergencies.</p>' },
            { title: 'Choking Response', duration: 8, content: '<h3>Clearing Airways</h3><p>Know the difference between infant, child, and adult choking techniques. Act quickly.</p>' },
            { title: 'Wound Care', duration: 7, content: '<h3>Treating Injuries</h3><p>Clean wounds properly, apply bandages, and know when stitches are needed.</p>' },
            { title: 'Fever Management', duration: 7, content: '<h3>When to Act</h3><p>Know fever thresholds by age. Understand when to give medication and when to seek help.</p>' },
            { title: 'Allergic Reactions', duration: 7, content: '<h3>Anaphylaxis Response</h3><p>Recognize severe allergic reactions. Know how to use epinephrine auto-injectors if prescribed.</p>' },
            { title: 'Burns & Falls', duration: 8, content: '<h3>Common Injuries</h3><p>Treat minor burns with cool water. Assess falls for head injuries. Watch for signs of concussion.</p>' },
            { title: 'Emergency Action Plan', duration: 8, content: '<h3>Be Prepared</h3><p>Create an emergency action plan. Keep first aid kit stocked. Know location of nearest hospital.</p>' }
        ],
        quiz: [
            { question: 'For a choking child over 1 year old, what technique do you use?', options: ['Back blows only', 'Abdominal thrusts (Heimlich)', 'Mouth to mouth', 'Lay them flat'], correct: 1 },
            { question: 'What fever temperature in a child requires immediate medical attention?', options: ['37°C', '38°C', '40°C or above', '36.5°C'], correct: 2 },
            { question: 'For a minor cut, you should first:', options: ['Apply butter', 'Rinse with clean water and apply pressure', 'Ignore it', 'Apply toothpaste'], correct: 1 }
        ],
        xpReward: 150,
        order: 5
    },
    {
        moduleId: 'ethics',
        icon: '📋',
        title: 'Professional Standards & Ethics',
        description: 'Understand your professional responsibilities, privacy obligations, and ethical standards as a caretaker.',
        duration: '25 min',
        totalLessons: 4,
        level: 'Advanced',
        color: '#1A237E',
        background: '#E8EAF6',
        topics: ['Privacy and confidentiality', 'Professional boundaries', 'Mandatory reporting', 'Code of conduct'],
        lessons: [
            { title: 'Confidentiality', duration: 6, content: '<h3>Protecting Privacy</h3><p>Never share personal information about families or children. What happens in the home stays private.</p>' },
            { title: 'Professional Boundaries', duration: 7, content: '<h3>Setting Limits</h3><p>Maintain professional relationships. Set clear boundaries with families about working hours and responsibilities.</p>' },
            { title: 'Mandatory Reporting', duration: 6, content: '<h3>Legal Obligations</h3><p>Know your legal duty to report suspected abuse or neglect. Protection for reporters varies by location.</p>' },
            { title: 'Code of Conduct', duration: 6, content: '<h3>Ethical Practice</h3><p>Act with integrity. Be reliable, punctual, and professional. Treat all children equally.</p>' }
        ],
        quiz: [
            { question: "You suspect a child is being abused at home. What should you do?", options: ["Do nothing, it's not your business", 'Report to the appropriate authorities', 'Confront the parents directly', 'Tell other parents'], correct: 1 },
            { question: 'Which of these is a professional boundary violation?', options: ['Sending daily reports to parents', "Sharing child's info with neighbours", 'Maintaining activity logs', 'Following safety protocols'], correct: 1 },
            { question: 'Child information you learn must be:', options: ['Shared freely with anyone', 'Kept strictly confidential', 'Posted on social media', 'Discussed publicly'], correct: 1 }
        ],
        xpReward: 80,
        order: 6
    },
    {
        moduleId: 'sleep',
        icon: '😴',
        title: 'Sleep Training & Routines',
        description: 'Learn age-appropriate sleep schedules, sleep training methods, and creating healthy bedtime routines.',
        duration: '40 min',
        totalLessons: 5,
        level: 'Intermediate',
        color: '#7986CB',
        background: '#E8EAF6',
        topics: ['Sleep requirements by age', 'Bedtime routines', 'Sleep training methods', 'Handling night wakings', 'Nap schedules'],
        lessons: [
            { title: 'Understanding Sleep Needs', duration: 8, content: '<h3>Sleep Science</h3><p>Children need different amounts of sleep at different ages. Understand circadian rhythms and sleep cycles.</p>' },
            { title: 'Building Bedtime Routines', duration: 8, content: '<h3>Consistent Rituals</h3><p>Create calming pre-sleep routines. Include bath, story, and quiet time activities.</p>' },
            { title: 'Sleep Training Methods', duration: 9, content: '<h3>Different Approaches</h3><p>Learn various sleep training techniques. Choose methods that align with family values.</p>' },
            { title: 'Managing Night Wakings', duration: 8, content: '<h3>Staying Calm</h3><p>Respond appropriately to night wakings. Know the difference between hunger, discomfort, and habit.</p>' },
            { title: 'Nap Schedules', duration: 7, content: '<h3>Daytime Sleep</h3><p>Understand nap transitions as children grow. Create flexible nap schedules that work for the family.</p>' }
        ],
        quiz: [
            { question: 'How many hours of sleep does a 3-year-old typically need (including naps)?', options: ['8 hours', '10 hours', '12-14 hours', '16 hours'], correct: 2 },
            { question: 'Which is NOT part of a healthy bedtime routine?', options: ['Bath time', 'Story time', 'Active play', 'Quiet activities'], correct: 2 },
            { question: 'When sleep training, consistency from caregivers is:', options: ['Unimportant', 'Nice to have', 'Essential', 'Only needed the first week'], correct: 2 }
        ],
        xpReward: 90,
        order: 7
    },
    {
        moduleId: 'special-needs',
        icon: '🌟',
        title: 'Special Needs Awareness',
        description: 'Learn to support children with developmental delays, physical disabilities, and learning differences.',
        duration: '45 min',
        totalLessons: 5,
        level: 'Advanced',
        color: '#AB47BC',
        background: '#F3E5F5',
        topics: ['Understanding developmental delays', 'Inclusive activities', 'Communication strategies', 'Sensory processing', 'Collaboration with specialists'],
        lessons: [
            { title: 'Introduction to Special Needs', duration: 9, content: '<h3>Diversity in Development</h3><p>Every child learns differently. Understanding individual needs helps provide better care.</p>' },
            { title: 'Creating Inclusive Environments', duration: 9, content: '<h3>Accessible Spaces</h3><p>Adapt activities and spaces to include all children. Focus on abilities, not limitations.</p>' },
            { title: 'Communication Strategies', duration: 9, content: '<h3>Alternative Methods</h3><p>Learn visual supports, sign language basics, and adaptive communication tools.</p>' },
            { title: 'Sensory Processing', duration: 9, content: '<h3>Sensory Awareness</h3><p>Understand sensory sensitivities. Create sensory-friendly environments.</p>' },
            { title: 'Working with Specialists', duration: 9, content: '<h3>Team Approach</h3><p>Collaborate with therapists and specialists. Follow individualized care plans.</p>' }
        ],
        quiz: [
            { question: 'When a child has sensory sensitivities, you should:', options: ['Ignore their reactions', 'Force them to cope', 'Create a sensory-friendly environment', 'Limit all activities'], correct: 2 },
            { question: 'Inclusive care means:', options: ['Treating all children exactly the same', 'Adapting to meet individual needs', 'Only focusing on typical development', 'Avoiding children with special needs'], correct: 1 },
            { question: 'Visual supports can help children with:', options: ['Only physical disabilities', 'Communication and routine understanding', 'Only academic learning', 'Nothing, they are not useful'], correct: 1 }
        ],
        xpReward: 100,
        order: 8
    },
    {
        moduleId: 'multi-child',
        icon: '👨‍👩‍👧‍👦',
        title: 'Managing Multiple Children',
        description: 'Techniques for caring for siblings, managing different age groups, and fostering positive sibling relationships.',
        duration: '35 min',
        totalLessons: 4,
        level: 'Intermediate',
        color: '#26A69A',
        background: '#E0F2F1',
        topics: ['Age-appropriate supervision', 'Sibling dynamics', 'Individual attention', 'Conflict resolution'],
        lessons: [
            { title: 'Supervision Strategies', duration: 8, content: '<h3>Keeping All Safe</h3><p>Balance supervision with independence. Know safe activities for different ages.</p>' },
            { title: 'Understanding Sibling Dynamics', duration: 9, content: '<h3>Family Relationships</h3><p>Siblings have unique relationships. Foster positive interactions and model conflict resolution.</p>' },
            { title: 'One-on-One Time', duration: 9, content: '<h3>Special Connections</h3><p>Schedule individual time with each child. This reduces jealousy and strengthens bonds.</p>' },
            { title: 'Managing Conflicts', duration: 9, content: '<h3>Peaceful Solutions</h3><p>Teach sharing, turn-taking, and apology. Let children problem-solve with guidance.</p>' }
        ],
        quiz: [
            { question: 'When siblings fight, the best approach is usually:', options: ['Let them work it out completely', 'Step in immediately and punish', 'Guide them to find solutions', 'Separate them permanently'], correct: 2 },
            { question: 'One-on-one time with each child helps:', options: ['Only the oldest child', 'Build individual relationships', 'Waste time that could be spent together', 'Only children who misbehave'], correct: 1 },
            { question: 'Age-appropriate supervision means:', options: ['Never leaving children alone', 'Matching supervision to developmental stage', 'Treating all ages the same', 'Only watching babies'], correct: 1 }
        ],
        xpReward: 80,
        order: 9
    },
    {
        moduleId: 'water-safety',
        icon: '🏊',
        title: 'Water Safety',
        description: 'Essential water safety knowledge for pools, beaches, bathtubs, and preventing drowning accidents.',
        duration: '30 min',
        totalLessons: 4,
        level: 'Beginner',
        color: '#29B6F6',
        background: '#E1F5FE',
        topics: ['Drowning prevention', 'Pool safety', 'Bathtub safety', 'Emergency water rescue'],
        lessons: [
            { title: 'Drowning Risks', duration: 7, content: '<h3>Understanding Danger</h3><p>Drowning can happen quickly and silently. Never leave children unattended near water.</p>' },
            { title: 'Pool & Beach Safety', duration: 8, content: '<h3>Safe Swimming</h3><p>Fences, barriers, and constant supervision save lives. Know the depth and conditions.</p>' },
            { title: 'Bathtub Safety', duration: 8, content: '<h3>Daily Routines</h3><p>Never leave children alone in the bathtub. Check water temperature and depth.</p>' },
            { title: 'Emergency Response', duration: 7, content: '<h3>Act Fast</h3><p>If a child is in distress, remove them from water immediately. Begin CPR if needed.</p>' }
        ],
        quiz: [
            { question: 'A child can drown in as little as how much water?', options: ['A full bathtub', 'An inch of water', 'A swimming pool only', 'Only deep water'], correct: 1 },
            { question: 'When children are swimming, supervision should be:', options: ['At the poolside on phone', 'Constant and attentive', 'Checked every few minutes', 'Not necessary if they can swim'], correct: 1 },
            { question: 'Babies should never be left:', options: ['In a bathtub', 'With an older sibling', 'Unattended near any water', 'In a small wading pool'], correct: 2 }
        ],
        xpReward: 70,
        order: 10
    }
];

module.exports = {
    getAllModules,
    getProgress,
    startModule,
    completeLesson,
    submitQuiz,
    getCertificate,
    updateModules
};
