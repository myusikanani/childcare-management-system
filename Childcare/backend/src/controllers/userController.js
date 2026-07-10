const User = require('../models/User');
const Booking = require('../models/Booking');

// ─────────────────────────────────────────────────────────────
// @desc  Get all available caretakers (public)
// @route GET /api/users/caretakers
// ─────────────────────────────────────────────────────────────
const getCaretakers = async(req, res) => {
    const { name, minRating, available, trained } = req.query;
    const filter = { role: 'caretaker' };

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const caretakers = await User.find(filter)
        .select('name email phone avatar rating totalReviews hourlyRate bio specializations availability certifications experience isVerified')
        .sort({ rating: -1 });

    res.status(200).json({ success: true, count: caretakers.length, caretakers });
};

// ─────────────────────────────────────────────────────────────
// @desc  Get single caretaker profile
// @route GET /api/users/caretakers/:id
// ─────────────────────────────────────────────────────────────
const getCaretakerById = async(req, res) => {
    const caretaker = await User.findById(req.params.id)
        .select('-password');

    if (!caretaker || caretaker.role !== 'caretaker') {
        return res.status(404).json({ success: false, message: 'Caretaker not found' });
    }

    // Get their reviews
    const reviews = await Booking.find({
            caretaker: caretaker._id,
            rating: { $ne: null },
        })
        .select('rating review reviewedAt parentName')
        .sort({ reviewedAt: -1 })
        .limit(20);

    res.status(200).json({ success: true, caretaker, reviews });
};

// ─────────────────────────────────────────────────────────────
// @desc  Admin: Get all users
// @route GET /api/users  (Admin only)
// ─────────────────────────────────────────────────────────────
const getAllUsers = async(req, res) => {
    const { role, search, page = 1, limit = 500 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    res.status(200).json({
        success: true,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        users,
    });
};

// ─────────────────────────────────────────────────────────────
// @desc  Admin: Toggle user active/inactive
// @route PUT /api/users/:id/toggle-active  (Admin only)
// ─────────────────────────────────────────────────────────────
const toggleUserActive = async(req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        user,
    });
};

// ─────────────────────────────────────────────────────────────
// @desc  Admin: Get dashboard stats
// @route GET /api/users/admin/stats  (Admin only)
// ─────────────────────────────────────────────────────────────
const getAdminStats = async(req, res) => {
    const [
        totalUsers,
        totalParents,
        totalCaretakers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
    ] = await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'caretaker' }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'pending' }),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.countDocuments({ status: 'completed' }),
        Booking.countDocuments({ status: 'cancelled' }),
    ]);

    // Revenue (sum of totalAmount for completed bookings)
    const revenueData = await Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Recent bookings
    const recentBookings = await Booking.find()
        .populate('parent', 'name email')
        .populate('caretaker', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

    // Recent users
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5);

    res.status(200).json({
        success: true,
        stats: {
            users: { total: totalUsers, parents: totalParents, caretakers: totalCaretakers },
            bookings: { total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings, completed: completedBookings, cancelled: cancelledBookings },
            revenue: totalRevenue,
        },
        recentBookings,
        recentUsers,
    });
};

// ─────────────────────────────────────────────────────────────
// @desc  Update caretaker availability
// @route PUT /api/users/availability  (Caretaker only)
// ─────────────────────────────────────────────────────────────
const updateAvailability = async(req, res) => {
    const { availability } = req.body;
    if (availability === undefined) {
        return res.status(400).json({ success: false, message: 'availability field is required' });
    }

    const user = await User.findByIdAndUpdate(
        req.user._id, { availability }, { new: true }
    );

    res.status(200).json({ success: true, message: 'Availability updated', user });
};

module.exports = {
    getCaretakers,
    getCaretakerById,
    getAllUsers,
    toggleUserActive,
    getAdminStats,
    updateAvailability,
};