const express = require('express');
const router = express.Router();

const {
    getMyTraining,
    completeModule,
    startModule,
    getAllTraining,
} = require('../controllers/trainingController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/me', authorize('caretaker'), getMyTraining);
router.put('/start-module', authorize('caretaker'), startModule);
router.put('/complete-module', authorize('caretaker'), completeModule);
router.get('/all', authorize('admin'), getAllTraining);

module.exports = router;