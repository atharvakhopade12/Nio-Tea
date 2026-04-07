const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendOTPHandler, verifyOTPHandler, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Please wait a minute.' },
});

router.post('/send-otp', otpLimiter, sendOTPHandler);
router.post('/verify-otp', verifyOTPHandler);
router.get('/me', protect, getMe);

module.exports = router;
