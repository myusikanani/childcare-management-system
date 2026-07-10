const Training = require('../models/Training');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// @desc  Get my training progress
// @route GET /api/training/me
// ─────────────────────────────────────────────────────────────
const getMyTraining = async(req, res) => {
    let training = await Training.findOne({ caretaker: req.user._id });

    if (!training) {
        // Create fresh record if not exists
        training = await Training.create({ caretaker: req.user._id });
    }

    res.status(200).json({ success: true, training });
};

// ─────────────────────────────────────────────────────────────
// @desc  Update training progress (pass a module quiz)
// @route PUT /api/training/complete-module
// ─────────────────────────────────────────────────────────────
const completeModule = async(req, res) => {
    const { moduleId, score } = req.body;

    if (!moduleId) {
        return res.status(400).json({ success: false, message: 'moduleId is required' });
    }

    let training = await Training.findOne({ caretaker: req.user._id });
    if (!training) training = await Training.create({ caretaker: req.user._id });

    // Avoid duplicate entries
    if (!training.completedModules.includes(moduleId)) {
        training.completedModules.push(moduleId);
    }
    training.inProgressModules = training.inProgressModules.filter(id => id !== moduleId);

    // Record quiz score
    const existingScore = training.quizScores.find(q => q.moduleId === moduleId);
    if (existingScore) {
        existingScore.score = score || 100;
        existingScore.passed = true;
        existingScore.attempts += 1;
        existingScore.passedAt = new Date();
    } else {
        training.quizScores.push({
            moduleId,
            score: score || 100,
            passed: true,
            attempts: 1,
            passedAt: new Date(),
        });
    }

    // Check if all modules done
    if (training.completedModules.length >= training.totalModules) {
        training.isCompleted = true;
        training.completedAt = new Date();

        // Update User flag
        await User.findByIdAndUpdate(req.user._id, { trainingCompleted: true });

        // Notify
        await Notification.create({
            recipient: req.user._id,
            type: 'training_completed',
            title: '🎓 Training Completed!',
            message: 'Congratulations! You have completed all training modules. You can now accept bookings.',
        });
    }

    await training.save();
    res.status(200).json({ success: true, training });
};

// ─────────────────────────────────────────────────────────────
// @desc  Mark module as in-progress
// @route PUT /api/training/start-module
// ─────────────────────────────────────────────────────────────
const startModule = async(req, res) => {
    const { moduleId } = req.body;
    if (!moduleId) return res.status(400).json({ success: false, message: 'moduleId is required' });

    let training = await Training.findOne({ caretaker: req.user._id });
    if (!training) training = await Training.create({ caretaker: req.user._id });

    if (!training.inProgressModules.includes(moduleId) &&
        !training.completedModules.includes(moduleId)) {
        training.inProgressModules.push(moduleId);
    }

    await training.save();
    res.status(200).json({ success: true, training });
};

// ─────────────────────────────────────────────────────────────
// @desc  Admin: Get all caretaker training records
// @route GET /api/training/all  (Admin only)
// ─────────────────────────────────────────────────────────────
const getAllTraining = async(req, res) => {
    const records = await Training.find()
        .populate('caretaker', 'fullName email phone avatar')
        .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: records.length, records });
};

module.exports = { getMyTraining, completeModule, startModule, getAllTraining };