const { body, validationResult } = require('express-validator');

// ── Run validations and return errors ──────────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array(),
        });
    }
    next();
};

// ── Auth validators ────────────────────────────────────────────
const registerParentRules = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
];

const registerCaretakerRules = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
];

const registerAdminRules = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('secretCode').notEmpty().withMessage('Admin secret code is required'),
];

const loginRules = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

// ── Booking validators ─────────────────────────────────────────
const createBookingRules = [
    body('caretakerId').notEmpty().withMessage('Caretaker ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
];

// ── Review validator ───────────────────────────────────────────
const reviewRules = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').trim().notEmpty().withMessage('Review text is required'),
];

module.exports = {
    validate,
    registerParentRules,
    registerCaretakerRules,
    registerAdminRules,
    loginRules,
    createBookingRules,
    reviewRules,
};