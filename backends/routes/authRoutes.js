const express = require('express');
const router = express.Router();
const { sendOTP, registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/send-otp', sendOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getMe).put(protect, updateProfile);

module.exports = router;
