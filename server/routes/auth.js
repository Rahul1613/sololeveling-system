const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  requestPasswordReset,
  verifyOtp,
  resetPassword,
  googleLogin,
  facebookLogin,
  demoLogin
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, getUserProfile);

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', googleLogin);

// @route   POST /api/auth/facebook
// @desc    Facebook OAuth login
// @access  Public
router.post('/facebook', facebookLogin);

// @route   POST /api/auth/demo
// @desc    Demo account login
// @access  Public
router.post('/demo', demoLogin);

// @route   POST /api/auth/request-reset
// @desc    Request password reset (send OTP)
// @access  Public
router.post('/request-reset', requestPasswordReset);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post('/verify-otp', verifyOtp);

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', resetPassword);

module.exports = router;
