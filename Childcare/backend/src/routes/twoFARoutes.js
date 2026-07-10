const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const twoFAController = require('../controllers/twoFAController');

// All routes require authentication
router.use(protect);

router.get('/status', twoFAController.get2FAStatus);
router.post('/setup', twoFAController.setup2FA);
router.post('/enable', twoFAController.enable2FA);
router.post('/disable', twoFAController.disable2FA);
router.post('/verify', twoFAController.verify2FA);

module.exports = router;
