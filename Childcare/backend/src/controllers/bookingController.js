const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ── Helper: create notification ────────────────────────────────
const createNotif = async(recipientId, type, title, message, relatedId = null) => {
    await Notification.create({ recipient: recipientId, type, title, message, relatedId });
};

// ─────────────────────────────────────────────────────────────
// @desc  Create booking (Parent only)
// @route POST /api/bookings
// ─────────────────────────────────────────────────────────────
const createBooking = async(req, res) => {
    const {
        caretakerId,
        date,
        startTime,
        endTime,
        childrenCount,
        childrenAges,
        specialNeeds,
        notes,
    } = req.body;

    // Check caretaker exists
    const caretaker = await User.findById(caretakerId);
    if (!caretaker || caretaker.role !== 'caretaker') {
        return res.status(404).json({ success: false, message: 'Caretaker not found' });
    }

    // Check for slot conflict
    const conflict = await Booking.findOne({
        caretaker: caretakerId,
        date,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
        ],
    });

    if (conflict) {
        return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    // Calculate duration in hours
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = ((eh * 60 + em) - (sh * 60 + sm)) / 60;

    const totalAmount = Math.round(duration * (caretaker.hourlyRate || 0) * 100) / 100;

    // Get platform commission
    const Settings = require('../models/Settings');
    const platformCommission = await Settings.getValue('platformCommission', 10);
    const platformEarns = Math.round(totalAmount * (platformCommission / 100));
    const caretakerReceives = totalAmount - platformEarns;

    const booking = await Booking.create({
        parent: req.user._id,
        caretaker: caretakerId,
        parentName: req.user.name,
        parentEmail: req.user.email,
        caretakerName: caretaker.name,
        caretakerEmail: caretaker.email,
        date,
        startTime,
        endTime,
        duration,
        childrenCount: childrenCount || 1,
        childrenAges: childrenAges || [],
        specialNeeds: specialNeeds || '',
        notes: notes || '',
        totalAmount,
        platformCommission,
        platformEarns,
        caretakerReceives,
    });

    // Notify caretaker
    await createNotif(
        caretaker._id,
        'booking_request',
        'New Booking Request',
        `${req.user.name} has requested a booking on ${date} from ${startTime} to ${endTime} for ₹${caretakerReceives}`,
        booking._id
    );

    const populated = await booking.populate('parent caretaker', 'name email phone avatar');
    
    // Add breakdown to response
    const response = populated.toObject();
    response.priceBreakdown = {
        caretakerFee: totalAmount,
        platformCommission: platformCommission,
        platformEarns,
        caretakerReceives,
    };
    
    res.status(201).json({ success: true, booking: response });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get all bookings for logged-in user
// @route GET /api/bookings
// ─────────────────────────────────────────────────────────────
const getMyBookings = async(req, res) => {
    const { status, date } = req.query;
    let filter = {};

    if (req.user.role === 'user') filter.parent = req.user._id;
    if (req.user.role === 'caretaker') filter.caretaker = req.user._id;
    // Admin gets all bookings (no filter)

    if (status) filter.status = status;
    if (date) filter.date = date;

    const bookings = await Booking.find(filter)
        .populate('parent', 'name email phone avatar')
        .populate('caretaker', 'name email phone avatar rating hourlyRate')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get single booking by ID
// @route GET /api/bookings/:id
// ─────────────────────────────────────────────────────────────
const getBookingById = async(req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('parent', 'name email phone avatar address')
        .populate('caretaker', 'name email phone avatar rating hourlyRate bio specializations');

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only allow owner or admin
    const isOwner =
        booking.parent._id.toString() === req.user._id.toString() ||
        booking.caretaker._id.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, booking });
};

// ─────────────────────────────────────────────────────────────
// @desc  Confirm booking (Caretaker)
// @route PUT /api/bookings/:id/confirm
// ─────────────────────────────────────────────────────────────
const confirmBooking = async(req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.caretaker.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only the assigned caretaker can confirm' });
    }

    if (booking.status !== 'pending') {
        return res.status(400).json({ success: false, message: `Cannot confirm a ${booking.status} booking` });
    }

    booking.status = 'confirmed';
    await booking.save();

    await createNotif(
        booking.parent,
        'booking_confirmed',
        'Booking Confirmed! 🎉',
        `Your booking on ${booking.date} with ${booking.caretakerName} has been confirmed.`,
        booking._id
    );

    res.status(200).json({ success: true, message: 'Booking confirmed', booking });
};

// ─────────────────────────────────────────────────────────────
// @desc  Cancel booking (Parent or Caretaker or Admin)
// @route PUT /api/bookings/:id/cancel
// ─────────────────────────────────────────────────────────────
const cancelBooking = async(req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isParent = booking.parent.toString() === req.user._id.toString();
    const isCaretaker = booking.caretaker.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isParent && !isCaretaker && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
        return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    booking.status = 'cancelled';
    booking.cancellationNote = req.body.reason || '';
    await booking.save();

    // Notify the other party
    const notifyId = isParent ? booking.caretaker : booking.parent;
    const byWho = req.user.name;
    await createNotif(
        notifyId,
        'booking_cancelled',
        'Booking Cancelled',
        `Booking on ${booking.date} was cancelled by ${byWho}.`,
        booking._id
    );

    res.status(200).json({ success: true, message: 'Booking cancelled', booking });
};

// ─────────────────────────────────────────────────────────────
// @desc  Mark booking as completed (Caretaker or Admin)
// @route PUT /api/bookings/:id/complete
// ─────────────────────────────────────────────────────────────
const completeBooking = async(req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCaretaker = booking.caretaker.toString() === req.user._id.toString();
    if (!isCaretaker && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
        return res.status(400).json({ success: false, message: 'Only confirmed bookings can be completed' });
    }

    booking.status = 'completed';
    await booking.save();

    await createNotif(
        booking.parent,
        'booking_completed',
        'Session Completed',
        `Your session on ${booking.date} is complete. Please leave a review for ${booking.caretakerName}.`,
        booking._id
    );

    res.status(200).json({ success: true, message: 'Booking marked as completed', booking });
};

// ─────────────────────────────────────────────────────────────
// @desc  Add review to completed booking (Parent only)
// @route POST /api/bookings/:id/review
// ─────────────────────────────────────────────────────────────
const addReview = async(req, res) => {
    const { rating, review } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.parent.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only the parent can leave a review' });
    }

    if (booking.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    if (booking.rating) {
        return res.status(400).json({ success: false, message: 'Review already submitted' });
    }

    booking.rating = rating;
    booking.review = review;
    booking.reviewedAt = new Date();
    await booking.save();

    // Update caretaker's average rating
    const allReviews = await Booking.find({
        caretaker: booking.caretaker,
        rating: { $ne: null },
    }).select('rating');

    const avgRating = allReviews.reduce((sum, b) => sum + b.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(booking.caretaker, {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
    });

    await createNotif(
        booking.caretaker,
        'review_received',
        'New Review! ⭐',
        `${req.user.name} left you a ${rating}-star review.`,
        booking._id
    );

    res.status(200).json({ success: true, message: 'Review submitted', booking });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get booked time slots for a caretaker on a date
// @route GET /api/bookings/slots/:caretakerId?date=YYYY-MM-DD
// ─────────────────────────────────────────────────────────────
const getBookedSlots = async(req, res) => {
    const { caretakerId } = req.params;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, message: 'date query param is required' });
    }

    const bookings = await Booking.find({
        caretaker: caretakerId,
        date,
        status: { $in: ['pending', 'confirmed'] },
    }).select('startTime endTime');

    res.status(200).json({ success: true, slots: bookings });
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    confirmBooking,
    cancelBooking,
    completeBooking,
    addReview,
    getBookedSlots,
    getPaymentHistory,
};

// ─────────────────────────────────────────────────────────────
// @desc  Get payment history for logged-in user
// @route GET /api/bookings/payments
// ─────────────────────────────────────────────────────────────
async function getPaymentHistory(req, res) {
    const myId = req.user._id;
    const myRole = req.user.role;

    let query = { paymentStatus: 'paid' };

    if (myRole === 'user') query.parent = myId;
    if (myRole === 'caretaker') query.caretaker = myId;
    const bookings = await Booking.find(query)
        .populate('parent', 'name email avatar')
        .populate('caretaker', 'name email avatar');

    res.status(200).json({ success: true, payments: bookings });
}