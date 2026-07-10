const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Who sent it
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Who receives it
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Denormalized for quick display
    fromEmail: { type: String, default: '' },
    toEmail: { type: String, default: '' },
    fromName: { type: String, default: '' },

    // The message text
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
    },

    // Has the receiver read it?
    read: {
        type: Boolean,
        default: false,
    },

    readAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

// Index for fast conversation loading
// A conversation = all messages between two users
messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ to: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);