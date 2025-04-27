const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const authMiddleware = require('../middleware/auth');

// Submit verification for a quest
router.post('/submit', authMiddleware, verificationController.submitVerification);

// Get verification status
router.get('/status/:submissionId', authMiddleware, verificationController.getVerificationStatus);

// Get all verification submissions for a user
router.get('/user', authMiddleware, verificationController.getUserVerifications);

// Admin routes
router.get('/pending', authMiddleware, verificationController.getPendingVerifications);
router.post('/manual/:submissionId', authMiddleware, verificationController.manuallyVerify);

module.exports = router;
