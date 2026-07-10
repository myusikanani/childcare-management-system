const express = require('express');
const router = express.Router();

const {
    getCaretakers,
    getCaretakerById,
    getAllUsers,
    toggleUserActive,
    getAdminStats,
    updateAvailability,
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/caretakers', getCaretakers);
router.get('/caretakers/:id', getCaretakerById);

// Protected
router.put('/availability', protect, authorize('caretaker'), updateAvailability);

// Admin only
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleUserActive);

module.exports = router;