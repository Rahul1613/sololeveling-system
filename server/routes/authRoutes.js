const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  requestPasswordReset,
  verifyOtp,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Password reset routes
router.post('/reset-password/request', requestPasswordReset);
router.post('/reset-password/verify-otp', verifyOtp);
router.post('/reset-password/reset', resetPassword);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router;
