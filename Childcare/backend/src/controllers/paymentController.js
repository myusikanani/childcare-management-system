const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createNotif = async(recipientId, type, title, message, relatedId = null) => {
    await Notification.create({ recipient: recipientId, type, title, message, relatedId });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get payment config
// @route GET /api/payments/config
// ─────────────────────────────────────────────────────────────
const getConfig = (req, res) => {
    res.status(200).json({
        success: true,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
};

// ─────────────────────────────────────────────────────────────
// @desc  Create dummy payment (simulates payment without Stripe)
// @route POST /api/payments/create-intent
// ─────────────────────────────────────────────────────────────
const createPaymentIntent = async(req, res) => {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isParent = booking.parent.toString() === req.user._id.toString();
    if (!isParent && req.user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    // Dummy payment ID (simulates Stripe without actually using it)
    const dummyPaymentId = `DUMMY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
        success: true,
        clientSecret: dummyPaymentId,
        amount: booking.totalAmount,
        isDummy: true, // Flag to indicate dummy payment
    });
};

// ─────────────────────────────────────────────────────────────
// @desc  Confirm dummy payment
// @route POST /api/payments/confirm
// ─────────────────────────────────────────────────────────────
const confirmPayment = async(req, res) => {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isParent = booking.parent.toString() === req.user._id.toString();
    if (!isParent && req.user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    // Get platform commission from settings
    const Settings = require('../models/Settings');
    const platformCommission = await Settings.getValue('platformCommission', 10);
    
    // Calculate amounts
    const caretakerFee = booking.totalAmount || booking.amount || 0;
    const parentPays = caretakerFee; // Parent pays caretaker fee (in real app, add commission here)
    const platformEarns = Math.round(caretakerFee * (platformCommission / 100));
    const caretakerReceives = caretakerFee - platformEarns;

    // Mark booking as paid (dummy payment always succeeds)
    booking.paymentStatus = 'paid';
    booking.paidAt = new Date();
    booking.paymentIntentId = paymentIntentId || `DUMMY_${Date.now()}`;
    booking.paymentMethod = req.body.method || 'cash';
    booking.platformCommission = platformCommission;
    booking.platformEarns = platformEarns;
    booking.caretakerReceives = caretakerReceives;
    await booking.save();

    // Notify caretaker about payment
    await createNotif(
        booking.caretaker,
        'payment_received',
        'Payment Received! 💰',
        `Payment of ₹${caretakerReceives} received for booking on ${booking.date} (After ₹${platformEarns} platform fee)`,
        booking._id
    );

    res.status(200).json({ 
        success: true, 
        message: 'Payment confirmed successfully', 
        booking,
        transactionId: booking.paymentIntentId,
        breakdown: {
            parentPays: caretakerFee,
            caretakerFee: caretakerFee,
            platformCommission: platformCommission,
            platformEarns: platformEarns,
            caretakerReceives: caretakerReceives,
        }
    });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get payment history
// @route GET /api/payments/history
// ─────────────────────────────────────────────────────────────
const getPaymentHistory = async(req, res) => {
    const myId = req.user._id;
    const myRole = req.user.role;

    let query = { paymentStatus: 'paid' };

    if (myRole === 'Parent') query.parent = myId;
    if (myRole === 'Caretaker') query.caretaker = myId;

    const bookings = await Booking.find(query)
        .sort({ paidAt: -1 })
        .populate('parent', 'fullName email avatar')
        .populate('caretaker', 'fullName email avatar');

    // Calculate totals based on role
    let totalSpent = 0;
    let totalEarned = 0;
    let totalCommission = 0;

    bookings.forEach(b => {
        const amount = b.totalAmount || b.amount || 0;
        if (myRole === 'Parent') {
            totalSpent += amount;
        } else if (myRole === 'Caretaker') {
            totalEarned += (b.caretakerReceives || amount);
            totalCommission += (b.platformEarns || Math.round(amount * 0.1));
        }
    });

    res.status(200).json({ 
        success: true, 
        count: bookings.length, 
        payments: bookings,
        totals: {
            totalSpent,
            totalEarned,
            totalCommission,
        }
    });
};

// ─────────────────────────────────────────────────────────────
// @desc  Request refund
// @route POST /api/payments/refund
// ─────────────────────────────────────────────────────────────
const requestRefund = async(req, res) => {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isParent = booking.parent.toString() === req.user._id.toString();
    if (!isParent) {
        return res.status(403).json({ success: false, message: 'Only parent can request refund' });
    }

    if (booking.paymentStatus !== 'paid') {
        return res.status(400).json({ success: false, message: 'Booking not paid yet' });
    }

    if (booking.refundRequested) {
        return res.status(400).json({ success: false, message: 'Refund already requested' });
    }

    booking.refundRequested = true;
    booking.refundReason = reason || '';
    await booking.save();

    await createNotif(
        booking.caretaker,
        'refund_requested',
        'Refund Requested',
        `A refund has been requested for booking on ${booking.date}. Reason: ${reason || 'Not specified'}`,
        booking._id
    );

    res.status(200).json({ success: true, message: 'Refund requested successfully' });
};

module.exports = {
    getConfig,
    createPaymentIntent,
    confirmPayment,
    getPaymentHistory,
    requestRefund,
};
