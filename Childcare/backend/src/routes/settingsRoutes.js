const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

router.get('/', protect, adminOnly, settingsController.getSettings);
router.put('/', protect, adminOnly, settingsController.updateSettings);
router.get('/backup', protect, adminOnly, settingsController.backupDatabase);
router.post('/clear-cache', protect, adminOnly, settingsController.clearCache);

module.exports = router;
