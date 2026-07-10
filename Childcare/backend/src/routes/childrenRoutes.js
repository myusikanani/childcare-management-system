const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getChildren, 
    addChild, 
    updateChild, 
    deleteChild,
    updateChildPhoto 
} = require('../controllers/childrenController');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Children CRUD
router.route('/')
    .get(getChildren)
    .post(addChild);

router.route('/:childId')
    .put(updateChild)
    .delete(deleteChild);

// Child photo upload
router.post('/:childId/photo', upload.single('photo'), updateChildPhoto);

module.exports = router;
