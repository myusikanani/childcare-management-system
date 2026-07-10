const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    caretaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // ── Progress ───────────────────────────────────────────────
    completedModules: [{ type: String }], // e.g. ["mod1","mod2"]
    inProgressModules: [{ type: String }],
    totalModules: { type: Number, default: 6 },

    // ── Completion ─────────────────────────────────────────────
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    certificateUrl: { type: String, default: '' },

    // ── Quiz Scores ────────────────────────────────────────────
    quizScores: [{
        moduleId: String,
        score: Number,
        passed: Boolean,
        attempts: { type: Number, default: 1 },
        passedAt: Date,
    }, ],
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);