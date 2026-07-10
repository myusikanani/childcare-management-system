const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefault
} = require('../controllers/paymentMethodController');

// All routes require authentication
router.use(protect);

// Payment Methods CRUD
router.route('/')
    .get(getPaymentMethods)
    .post(addPaymentMethod);

router.route('/:methodId')
    .put(updatePaymentMethod)
    .delete(deletePaymentMethod);

// Set as default
router.put('/:methodId/default', setDefault);

module.exports = router;
