const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Public routes
router.post(
  '/register',
  upload.single('avatar'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'caretaker', 'admin'])
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Verify 2FA for login (public route)
router.post('/verify-login-2fa', authController.verifyLogin2FA);

// Protected routes
router.get('/users', protect, authController.getAllUsers);
router.get('/caretakers', protect, authController.getAllCaretakers);
router.get('/user/:id', protect, authController.getUserById);
router.put('/user/:id', protect, upload.single('avatar'), authController.updateUser);
router.delete('/user/:id', protect, authController.deleteUser);
router.put('/user/:id/reset-password', protect, authController.resetPassword);

// Caretaker specific routes
router.put('/caretaker/:id/verify', protect, authController.verifyCaretaker);
router.put('/caretaker/:id/reject', protect, authController.rejectCaretaker);
router.put('/caretaker/:id/pricing', protect, authController.updateCaretakerPricing);

// Profile routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'parentPhoto', maxCount: 1 },
    { name: 'fatherPhoto', maxCount: 1 },
    { name: 'childPhoto_0', maxCount: 1 },
    { name: 'childPhoto_1', maxCount: 1 },
    { name: 'childPhoto_2', maxCount: 1 },
    { name: 'childPhoto_3', maxCount: 1 },
    { name: 'childPhoto_4', maxCount: 1 },
]), authController.updateProfile);

module.exports = router;
