const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const { generateToken } = require('../utils/auth');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Handle Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    console.log('DEBUG: Google payload:', payload);
    let email = payload.email;
    let name = payload.name;
    let picture = payload.picture;
    // Fallbacks for missing email
    if (!email) {
      email = `missing${Date.now()}@example.com`;
    }
    // Fallback for missing name
    if (!name) {
      name = email.split('@')[0];
    }
    // Robust fallback for username
    let username = (email && typeof email === 'string' && email.includes('@')) ? email.split('@')[0] : (name || `user${Date.now()}`);
    if (!username) {
      username = `user${Date.now()}`;
    }
    console.log('DEBUG: About to create user with:', { email, username, name });
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      // Set a random password since password is required by schema but not used for OAuth
      const randomPassword = Math.random().toString(36).slice(-8) + Date.now();
      // FINAL fallback before creation
      if (!email) email = `missing${Date.now()}@example.com`;
      if (!username) username = `user${Date.now()}`;
      if (!randomPassword) randomPassword = Math.random().toString(36).slice(-8) + Date.now();
      const userObj = {
        email: email || `missing${Date.now()}@example.com`,
        username: username || `user${Date.now()}`,
        password: randomPassword,
        name: name || username || `user${Date.now()}`,
        profilePicture: picture || '',
        authProvider: 'google',
        isEmailVerified: true // Google accounts are already verified
      };
      console.log('DEBUG: FINAL user object to create:', userObj);
      user = new User(userObj);
      await user.save();
    } else {
      // Update existing user with Google info if needed
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        user.isEmailVerified = true;
        if (!user.profileImage && picture) {
          user.profileImage = picture;
        }
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data and token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage,
        level: user.level,
        rank: user.rank,
        experience: user.experience,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

// Handle Facebook OAuth
exports.facebookAuth = async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    
    // Verify Facebook token by making a request to Facebook Graph API
    const response = await axios.get(
      `https://graph.facebook.com/v12.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
    );
    
    const { email, name, picture } = response.data;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email not available from Facebook. Please ensure your Facebook account has a verified email.' 
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email,
        username: email.split('@')[0],
        name,
        profileImage: picture?.data?.url,
        authProvider: 'facebook',
        isEmailVerified: true // Facebook accounts are already verified
      });
      
      await user.save();
    } else {
      // Update existing user with Facebook info if needed
      if (user.authProvider !== 'facebook') {
        user.authProvider = 'facebook';
        user.isEmailVerified = true;
        if (!user.profileImage && picture?.data?.url) {
          user.profileImage = picture.data.url;
        }
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data and token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage,
        level: user.level,
        rank: user.rank,
        experience: user.experience,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

// Link Google account to existing user
exports.linkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tokenId } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email } = payload;
    
    // Check if another user already has this Google account
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'This Google account is already linked to another user.' 
      });
    }
    
    // Update user with Google info
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.googleId = payload.sub;
    user.isEmailVerified = true;
    
    await user.save();
    
    res.status(200).json({ 
      message: 'Google account linked successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({ message: 'Failed to link Google account', error: error.message });
  }
};

// Link Facebook account to existing user
exports.linkFacebookAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accessToken, userID } = req.body;
    
    // Verify Facebook token
    const response = await axios.get(
      `https://graph.facebook.com/v12.0/${userID}?fields=id,email&access_token=${accessToken}`
    );
    
    const { email } = response.data;
    
    // Check if another user already has this Facebook account
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'This Facebook account is already linked to another user.' 
      });
    }
    
    // Update user with Facebook info
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.facebookId = userID;
    user.isEmailVerified = true;
    
    await user.save();
    
    res.status(200).json({ 
      message: 'Facebook account linked successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Link Facebook account error:', error);
    res.status(500).json({ message: 'Failed to link Facebook account', error: error.message });
  }
};
