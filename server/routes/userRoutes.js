const express = require('express');
const { getUserProfile, updateUserProfile, getUserSwaps, getDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/me/dashboard', protect, getDashboard);
router.get('/:id', getUserProfile);
router.put('/:id', protect, upload.single('profileImage'), updateUserProfile);
router.get('/:id/swaps', protect, getUserSwaps);

module.exports = router;
