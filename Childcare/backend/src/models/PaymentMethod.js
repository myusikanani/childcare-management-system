const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    last4: {
        type: String,
        required: true,
        length: 4
    },
    expiry: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    cardType: {
        type: String,
        enum: ['credit', 'debit', 'prepaid'],
        default: 'credit'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one default card per user
paymentMethodSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
