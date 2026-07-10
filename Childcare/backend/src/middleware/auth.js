const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect: verify JWT ────────────────────────────────────────
const protect = async(req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
};

// ── Role Guard: restrict to specific roles ─────────────────────
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not allowed to access this route`,
            });
        }
        next();
    };
};

// ── Admin Only: shortcut for admin-only routes ──────────────────
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required',
        });
    }
    next();
};

module.exports = { protect, authorize, adminOnly };