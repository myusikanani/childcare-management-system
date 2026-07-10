const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getConfig,
    createPaymentIntent,
    confirmPayment,
    getPaymentHistory,
    requestRefund,
} = require('../controllers/paymentController');

router.get('/config', getConfig);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/refund', protect, requestRefund);

module.exports = router;
