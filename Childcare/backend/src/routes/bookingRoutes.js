const express = require('express');
const router = express.Router();

const {
    createBooking,
    getMyBookings,
    getBookingById,
    confirmBooking,
    cancelBooking,
    completeBooking,
    addReview,
    getBookedSlots,
    getPaymentHistory,
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');
const { validate, createBookingRules, reviewRules } = require('../middleware/validators');

router.use(protect);

router.get('/slots/:caretakerId', getBookedSlots);
router.get('/payments', getPaymentHistory);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);

router.post('/', authorize('user'), createBookingRules, validate, createBooking);
router.put('/:id/confirm', authorize('caretaker'), confirmBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', authorize('caretaker', 'admin'), completeBooking);
router.post('/:id/review', authorize('user'), reviewRules, validate, addReview);

module.exports = router;