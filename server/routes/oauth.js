const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauthController');
const authMiddleware = require('../middleware/auth');

// Google OAuth routes
router.post('/google', oauthController.googleAuth);

// Facebook OAuth routes
router.post('/facebook', oauthController.facebookAuth);

// Link accounts (requires authentication)
router.post('/link/google', authMiddleware, oauthController.linkGoogleAccount);
router.post('/link/facebook', authMiddleware, oauthController.linkFacebookAccount);

module.exports = router;
