const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // ── References ─────────────────────────────────────────────
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    caretaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // ── Denormalized fields (for quick display without populate) ─
    parentName: { type: String, default: '' },
    parentEmail: { type: String, default: '' },
    caretakerName: { type: String, default: '' },
    caretakerEmail: { type: String, default: '' },

    // ── Schedule ───────────────────────────────────────────────
    date: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true }, // "HH:MM"
    duration: { type: Number, default: 0 }, // hours

    // ── Children Info ──────────────────────────────────────────
    childrenCount: { type: Number, default: 1 },
    childrenAges: [{ type: Number }],
    specialNeeds: { type: String, default: '' },

    // ── Status ─────────────────────────────────────────────────
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },

    // ── Payment ────────────────────────────────────────────────
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    paymentMethod: { type: String, default: '' },
    paymentIntentId: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    paidAt: { type: Date, default: null },
    refundRequested: { type: Boolean, default: false },
    refundReason: { type: String, default: '' },
    
    // ── Commission ──────────────────────────────────────────────
    platformCommission: { type: Number, default: 10 }, // percentage
    platformEarns: { type: Number, default: 0 }, // amount platform keeps
    caretakerReceives: { type: Number, default: 0 }, // amount caretaker gets

    // ── Notes ──────────────────────────────────────────────────
    notes: { type: String, default: '' },
    cancellationNote: { type: String, default: '' },

    // ── Review (filled after completion) ───────────────────────
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
}, { timestamps: true });

// Index for fast queries
bookingSchema.index({ parent: 1, date: 1 });
bookingSchema.index({ caretaker: 1, date: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);