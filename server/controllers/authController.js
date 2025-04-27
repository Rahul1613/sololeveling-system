const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const { 
  AppError, 
  catchAsync, 
  createValidationError, 
  createAuthError, 
  createNotFoundError, 
  createDatabaseError 
} = require('../utils/errorHandler');

// Initialize Google OAuth client if credentials are available
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
} else {
  console.warn('GOOGLE_CLIENT_ID not set. Google OAuth will only work with mock tokens.');
  // Create a mock client for development
  googleClient = {
    verifyIdToken: async () => ({
      getPayload: () => ({
        email: 'google-demo@example.com',
        name: 'Google Demo User',
        picture: 'https://ui-avatars.com/api/?name=Google+User&background=random'
      })
    })
  };
}

// In-memory OTP storage (replace with Redis in production)
const otpStore = new Map();

// In-memory demo account
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';

/**
 * Generate JWT token for authentication
 * @param {string} id - User ID to include in the token
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'solo-leveling-secret-key-change-in-production', 
    { expiresIn: '30d' }
  );
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    throw createValidationError('Please provide username, email and password');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createValidationError('Please provide a valid email address');
  }

  // Validate password strength
  if (password.length < 6) {
    throw createValidationError('Password must be at least 6 characters long');
  }

  // Check if user exists by email or username
  const userExists = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (userExists) {
    if (userExists.email === email) {
      throw createValidationError('Email already in use');
    } else {
      throw createValidationError('Username already taken');
    }
  }

  // Create user with hashed password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  }).catch(err => {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      throw createValidationError(`Validation error: ${messages}`);
    }
    throw createDatabaseError(`Failed to create user: ${err.message}`);
  });

  // Create inventory for the user
  await require('../models/Inventory').create({
    user: user._id
  }).catch(err => {
    throw createDatabaseError(`Failed to create inventory: ${err.message}`);
  });

  // Generate token and return user data
  const token = generateToken(user._id);
  
  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      level: user.level,
      rank: user.rank
    },
    token
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw createValidationError('Please provide email and password');
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    // Use generic message to prevent user enumeration
    throw createAuthError('Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw createAuthError('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save().catch(err => {
    throw createDatabaseError(`Failed to update last login: ${err.message}`);
  });

  // Generate token
  const token = generateToken(user._id);

  // Return user data with token
  res.json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      level: user.level,
      rank: user.rank,
      stats: user.stats,
      hp: user.hp,
      mp: user.mp,
      experience: user.experience,
      experienceToNextLevel: user.experienceToNextLevel,
      currency: user.currency,
      statPoints: user.statPoints
    },
    token
  });
});

/**
 * Get user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    // Get user with populated references
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('skills')
      .populate('equippedSkills.slot1')
      .populate('equippedSkills.slot2')
      .populate('equippedSkills.slot3')
      .populate('equippedSkills.slot4')
      .populate('equippedSkills.passive1')
      .populate('equippedSkills.passive2')
      .populate('equippedSkills.ultimate')
      .populate('titles.title')
      .populate('equippedTitle')
      .populate({
        path: 'activeQuests.quest',
        populate: {
          path: 'rewards.item',
          model: 'Item'
        }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get inventory
    const inventory = await require('../models/Inventory').findOne({ user: user._id })
      .populate('items.item');

    // Get unread notifications count
    const unreadNotificationsCount = await require('../models/Notification').countDocuments({
      user: user._id,
      isRead: false
    });

    res.json({
      success: true,
      user,
      inventory: inventory || { items: [] },
      unreadNotifications: unreadNotificationsCount
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error getting user profile', 
      error: error.message 
    });
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-email-password'
  },
  tls: {
    rejectUnauthorized: false // For development only, remove in production
  }
});

// Generate and send OTP for password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // In development, allow reset for any email
      if (process.env.NODE_ENV !== 'production') {
        console.log(`User not found for ${email}, but allowing password reset in development mode`);
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Store OTP
    otpStore.set(email, { otp, expiry });

    // For development/testing, always return OTP in response
    console.log(`OTP for ${email}: ${otp}`);
    
    // Skip actual email sending in development or if no email credentials
    if (process.env.NODE_ENV !== 'production' || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.json({
        success: true,
        message: 'OTP generated (email sending skipped)',
        otp: otp // Include OTP in response for testing
      });
    }

    // Send email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #7B68EE; text-align: center;">Solo Leveling</h2>
            <h3 style="text-align: center;">Password Reset Request</h3>
            <p>Hello Hunter,</p>
            <p>You have requested to reset your password. Please use the following OTP to verify your identity:</p>
            <div style="text-align: center; padding: 10px; background-color: #f5f5f5; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <p>Happy Hunting!</p>
            <p>- The Solo Leveling Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails, since we're showing OTP in development
    }

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verify OTP for password reset
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpData.expiry < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP again
    const otpData = otpStore.get(email);
    
    if (!otpData || otpData.expiry < Date.now() || otpData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Clear OTP
    otpStore.delete(email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

/**
 * Google OAuth login
 * @route POST /api/auth/google
 * @access Public
 */
const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    if (!tokenId) {
      return res.status(400).json({ success: false, message: 'Token ID is required' });
    }

    // For development/testing environment, allow mock tokens
    let email, name, picture;
    
    // Check if this is a mock token
    if (tokenId.startsWith('mock-google-token-')) {
      console.log('Using mock Google token');
      // Use demo user data for mock token
      email = 'google-demo@example.com';
      name = 'Google Demo User';
      picture = 'https://ui-avatars.com/api/?name=Google+User&background=random';
    } else {
      // This is a real token, verify with Google
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokenId,
          audience: process.env.GOOGLE_CLIENT_ID || 'mock-client-id'
        });
        
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
      } catch (verifyError) {
        console.error('Google token verification error:', verifyError);
        // In development, allow login even with invalid token
        if (process.env.NODE_ENV !== 'production') {
          console.log('Using fallback demo data for Google login in development');
          email = 'google-demo@example.com';
          name = 'Google Demo User';
          picture = 'https://ui-avatars.com/api/?name=Google+User&background=random';
        } else {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid Google token' 
          });
        }
      }
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      const password = crypto.randomBytes(16).toString('hex');
      
      user = await User.create({
        username,
        email,
        password,
        profileImage: picture,
        authProvider: 'google'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        profileImage: user.profileImage || picture
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Facebook OAuth login
 * @route POST /api/auth/facebook
 * @access Public
 */
const facebookLogin = async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    
    if (!accessToken || !userID) {
      return res.status(400).json({ success: false, message: 'Access token and user ID are required' });
    }

    // For development/testing environment, allow mock tokens
    let email, name, pictureUrl;
    
    // Check if this is a mock token or if we're in development mode
    if (process.env.NODE_ENV !== 'production' && 
        ((accessToken.startsWith('mock-facebook-token-') && userID.startsWith('mock-user-id-')) || 
         !process.env.FACEBOOK_APP_ID)) {
      console.log('Using mock Facebook token in development mode');
      // Use demo user data for mock token
      email = 'facebook-demo@example.com';
      name = 'Facebook Demo User';
      pictureUrl = 'https://ui-avatars.com/api/?name=Facebook+User&background=random';
    } else if (process.env.NODE_ENV === 'production' && !process.env.FACEBOOK_APP_ID) {
      // No Facebook credentials in production mode
      console.error('Facebook authentication failed: Facebook credentials not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Facebook authentication is not configured on the server' 
      });
    } else {
      // This is a real token, verify with Facebook
      try {
        const fbResponse = await axios.get(
          `https://graph.facebook.com/v13.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
        );

        if (!fbResponse.data || !fbResponse.data.email) {
          return res.status(400).json({ success: false, message: 'Failed to get user data from Facebook' });
        }

        email = fbResponse.data.email;
        name = fbResponse.data.name;
        pictureUrl = fbResponse.data.picture?.data?.url;
      } catch (verifyError) {
        console.error('Facebook token verification error:', verifyError);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid Facebook token' 
        });
      }
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      const password = crypto.randomBytes(16).toString('hex');
      
      user = await User.create({
        username,
        email,
        password,
        profileImage: pictureUrl,
        authProvider: 'facebook'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        profileImage: user.profileImage || pictureUrl
      }
    });
  } catch (error) {
    console.error('Facebook login error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      success: false, 
      message: 'Facebook authentication failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Demo account login
 * @route POST /api/auth/demo
 * @access Public
 */
const demoLogin = async (req, res) => {
  try {
    console.log('Demo login request received:', req.body);
    
    // Check if demo user exists
    let user = await User.findOne({ email: DEMO_EMAIL });
    console.log('Demo user found in database:', !!user);

    if (!user) {
      try {
        console.log('Creating new demo user...');
        // Create demo user if not exists
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);
        
        user = await User.create({
          username: 'demouser',
          email: DEMO_EMAIL,
          password: hashedPassword,
          level: 10, // Start with some progress
          experience: 5000,
          stats: {
            strength: 25,
            agility: 25,
            intelligence: 25,
            endurance: 25,
            luck: 25
          },
          isDemoAccount: true
        });
        console.log('Demo user created successfully:', user._id);
      } catch (createError) {
        console.error('Error creating demo user:', createError);
        // If we can't create, try to find again (race condition)
        user = await User.findOne({ email: DEMO_EMAIL });
        console.log('After error, demo user found:', !!user);
        
        if (!user) {
          console.error('Failed to create or find demo user');
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to create demo account' 
          });
        }
      }
    }

    // Create inventory for the user if it doesn't exist
    const inventory = await require('../models/Inventory').findOne({ user: user._id });
    if (!inventory) {
      console.log('Creating inventory for demo user...');
      await require('../models/Inventory').create({
        user: user._id
      });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Generated token for demo user');

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const response = {
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        rank: user.rank,
        stats: user.stats,
        hp: user.hp,
        mp: user.mp,
        experience: user.experience,
        experienceToNextLevel: user.experienceToNextLevel,
        currency: user.currency,
        statPoints: user.statPoints,
        isDemoAccount: true
      }
    };
    
    console.log('Sending demo login response');
    res.json(response);
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Demo login failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  requestPasswordReset,
  verifyOtp,
  resetPassword,
  googleLogin,
  facebookLogin,
  demoLogin
};
