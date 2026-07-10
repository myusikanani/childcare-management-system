const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: [
            'booking_request',
            'booking_confirmed',
            'booking_cancelled',
            'booking_completed',
            'training_completed',
            'review_received',
            'message',
            'profile_incomplete',
            'general',
        ],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);