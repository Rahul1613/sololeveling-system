const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const User = require('../models/user.model');
const { generateToken, authenticateToken } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Create new user with default values
    const newUser = await User.create({
      username,
      email,
      password, // Will be hashed by the model hooks
      rank: 'E',
      level: 1,
      experience: 0,
      gold: 1000,
      health: 100,
      mana: 50,
      strength: 10,
      intelligence: 10,
      agility: 10,
      hunts: 0,
      kills: 0,
      dungeons: 0,
      bossKills: 0,
      soloHunts: 0,
      skillPoints: 0,
      avatar: 'default-avatar.png',
      isAdmin: false
    });
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        rank: newUser.rank,
        level: newUser.level,
        gold: newUser.gold
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        level: user.level,
        gold: user.gold
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
