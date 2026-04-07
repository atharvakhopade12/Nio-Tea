const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTP } = require('../utils/sendOTP');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTPHandler = async (req, res) => {
  const { phone, name } = req.body;

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number.' });
  }

  // Rate limiting: block if an OTP was sent within the last 60 seconds
  const recentOTP = await OTP.findRecentByPhone(phone, 60_000);
  if (recentOTP) {
    return res.status(429).json({ success: false, message: 'Please wait 1 minute before requesting a new OTP.' });
  }

  const existingUser = await User.findOne({ phone });
  const purpose = existingUser ? 'login' : 'register';

  if (purpose === 'register' && !name) {
    return res.status(400).json({ success: false, message: 'Name is required for new registration.' });
  }

  await OTP.deleteByPhone(phone);

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await OTP.create({ phone, otp, purpose, expiresAt });
  await sendOTP(phone, otp);

  res.status(200).json({
    success: true,
    message: `OTP sent to ${phone}`,
    purpose,
    devOTP: otp,
  });
};

// @desc    Verify OTP and authenticate
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPHandler = async (req, res) => {
  const { phone, otp, name } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
  }

  // findAnyByPhone includes expired records so we can return the right error message
  const otpRecord = await OTP.findAnyByPhone(phone);
  if (!otpRecord) {
    return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
  }

  // Check expiry
  if (new Date(otpRecord.expiresAt) < new Date()) {
    await OTP.deleteById(otpRecord._id);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  // Check attempts (max 5)
  if (otpRecord.attempts >= 5) {
    await OTP.deleteById(otpRecord._id);
    return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
  }

  if (otpRecord.otp !== otp.toString()) {
    await OTP.incrementAttempts(otpRecord._id);
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }

  await OTP.markVerified(otpRecord._id);

  let user = await User.findOne({ phone });
  const isNewUser = !user;

  if (!user) {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required for registration.' });
    }
    user = await User.create({ phone, name, isVerified: true });
  } else {
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: isNewUser ? 'Account created successfully!' : 'Login successful!',
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { sendOTPHandler, verifyOTPHandler, getMe };

