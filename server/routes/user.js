const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Shadow = require('../models/Shadow');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /api/user/stats
// @desc    Get user stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      stats: user.stats,
      hp: user.hp,
      mp: user.mp,
      level: user.level,
      experience: user.experience,
      experienceToNextLevel: user.experienceToNextLevel,
      rank: user.rank,
      statPoints: user.statPoints
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      message: 'Server error getting user stats', 
      error: error.message 
    });
  }
});

// @route   PUT /api/user/stats
// @desc    Allocate stat points
// @access  Private
router.put('/stats', auth, async (req, res) => {
  try {
    const { stat, points } = req.body;
    
    // Validate input
    if (!stat || !points || points <= 0) {
      return res.status(400).json({ message: 'Invalid stat allocation request' });
    }
    
    // Check if stat is valid
    const validStats = ['strength', 'agility', 'intelligence', 'vitality', 'endurance', 'luck'];
    if (!validStats.includes(stat)) {
      return res.status(400).json({ message: 'Invalid stat type' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if user has enough stat points
    if (user.statPoints < points) {
      return res.status(400).json({ message: 'Not enough stat points' });
    }
    
    // Allocate stat points
    user.stats[stat] += points;
    user.statPoints -= points;
    
    // Update HP and MP based on new stats
    user.hp.max = 100 + (user.level - 1) * 10 + user.stats.vitality * 5;
    user.mp.max = 50 + (user.level - 1) * 5 + user.stats.intelligence * 2;
    
    await user.save();
    
    res.json({
      message: 'Stat points allocated successfully',
      stats: user.stats,
      hp: user.hp,
      mp: user.mp,
      statPoints: user.statPoints
    });
  } catch (error) {
    console.error('Allocate stat points error:', error);
    res.status(500).json({ 
      message: 'Server error allocating stat points', 
      error: error.message 
    });
  }
});

// @route   GET /api/user/inventory
// @desc    Get user inventory
// @access  Private
router.get('/inventory', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ user: req.user._id })
      .populate('items.item')
      .populate('equipped.weapon')
      .populate('equipped.head')
      .populate('equipped.chest')
      .populate('equipped.legs')
      .populate('equipped.feet')
      .populate('equipped.hands')
      .populate('equipped.offhand')
      .populate('equipped.accessory1')
      .populate('equipped.accessory2');
    
    if (!inventory) {
      // Create inventory if it doesn't exist
      const newInventory = new Inventory({
        user: req.user._id
      });
      
      await newInventory.save();
      
      return res.json({
        inventory: {
          items: [],
          equipped: {},
          capacity: newInventory.capacity
        }
      });
    }
    
    res.json({
      inventory: {
        items: inventory.items,
        equipped: inventory.equipped,
        capacity: inventory.capacity
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ 
      message: 'Server error getting inventory', 
      error: error.message 
    });
  }
});

// @route   GET /api/user/shadows
// @desc    Get user shadow army
// @access  Private
router.get('/shadows', auth, async (req, res) => {
  try {
    const shadows = await Shadow.find({ owner: req.user._id })
      .populate('equipment.weapon')
      .populate('equipment.armor')
      .populate('equipment.accessory');
    
    res.json({
      shadows
    });
  } catch (error) {
    console.error('Get shadows error:', error);
    res.status(500).json({ 
      message: 'Server error getting shadow army', 
      error: error.message 
    });
  }
});

// @route   POST /api/user/shadows/:id/level
// @desc    Level up a shadow
// @access  Private
router.post('/shadows/:id/level', auth, async (req, res) => {
  try {
    const shadow = await Shadow.findOne({ 
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Add experience to shadow
    const { experience } = req.body;
    
    if (!experience || experience <= 0) {
      return res.status(400).json({ message: 'Invalid experience amount' });
    }
    
    const levelUpResult = shadow.addExperience(experience);
    await shadow.save();
    
    // Notify client about level up
    if (levelUpResult.leveledUp) {
      const io = req.app.get('io');
      io.to(req.user._id.toString()).emit('shadow_level_up', {
        shadowId: shadow._id,
        oldLevel: levelUpResult.oldLevel,
        newLevel: levelUpResult.newLevel,
        newRank: levelUpResult.newRank
      });
    }
    
    res.json({
      message: 'Shadow gained experience',
      shadow,
      levelUp: levelUpResult
    });
  } catch (error) {
    console.error('Shadow level up error:', error);
    res.status(500).json({ 
      message: 'Server error leveling up shadow', 
      error: error.message 
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if username or email already exists
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user._id } },
          {
            $or: [
              { username: username || '' },
              { email: email || '' }
            ]
          }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username or email already in use' 
        });
      }
    }
    
    // Update user profile
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error updating profile', 
      error: error.message 
    });
  }
});

// @route   GET /api/user/progress
// @desc    Get user progress summary
// @access  Private
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('activeQuests.quest')
      .populate('achievements');
    
    const shadows = await Shadow.find({ owner: req.user._id });
    const inventory = await Inventory.findOne({ user: req.user._id });
    
    // Calculate total power
    const statSum = Object.values(user.stats).reduce((sum, stat) => sum + stat, 0);
    const shadowPower = shadows.reduce((sum, shadow) => sum + shadow.calculatePower(), 0);
    const totalPower = statSum + shadowPower;
    
    res.json({
      level: user.level,
      rank: user.rank,
      experience: {
        current: user.experience,
        total: user.experienceToNextLevel
      },
      quests: {
        active: user.activeQuests.length,
        completed: user.completedQuests.length
      },
      shadows: {
        count: shadows.length,
        power: shadowPower
      },
      inventory: {
        itemCount: inventory ? inventory.items.length : 0,
        capacity: inventory ? inventory.capacity : 0
      },
      achievements: user.achievements.length,
      totalPower,
      currency: user.currency,
      statPoints: user.statPoints
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      message: 'Server error getting progress', 
      error: error.message 
    });
  }
});

// @route   GET /api/user/rankings
// @desc    Get global rankings for all users
// @access  Public
router.get('/rankings', async (req, res) => {
  try {
    // Get global rankings for all users
    const users = await User.find()
      .select('username profilePicture level experience experienceToNextLevel rank stats titles')
      .sort({ 
        rank: 1, // Sort by rank (S < A < B < C < D < E)
        level: -1, // Then by level (descending)
        experience: -1 // Then by experience (descending)
      })
      .limit(100);
    
    // Format the user data to match what the client expects
    const rankings = users.map(user => {
      // Extract the user data we need
      const { _id, username, profilePicture, level, experience, experienceToNextLevel, rank, stats } = user;
      
      // Get the equipped title if any
      const equippedTitle = user.titles && user.titles.length > 0 
        ? user.titles.find(t => t.isEquipped)?.title 
        : null;
      
      return {
        _id,
        username,
        profilePicture,
        level,
        experience,
        experienceToNextLevel,
        rank,
        stats,
        title: equippedTitle
      };
    });
    
    res.json(rankings);
  } catch (error) {
    console.error('Get global rankings error:', error);
    res.status(500).json({ 
      message: 'Server error getting global rankings', 
      error: error.message 
    });
  }
});

// @route   GET /api/user/rankings/:rank
// @desc    Get rankings for a specific rank
// @access  Public
router.get('/rankings/:rank', async (req, res) => {
  try {
    const { rank } = req.params;
    
    if (!['E', 'D', 'C', 'B', 'A', 'S'].includes(rank)) {
      return res.status(400).json({ message: 'Invalid rank' });
    }
    
    // Get rankings for specific rank
    const rankings = await User.find({ rank })
      .select('username profilePicture level experience experienceToNextLevel rank stats')
      .sort({ level: -1, experience: -1 })
      .limit(50);
    
    res.json(rankings);
  } catch (error) {
    console.error('Get rankings by rank error:', error);
    res.status(500).json({ 
      message: 'Server error getting rankings by rank', 
      error: error.message 
    });
  }
});

// @route   GET /api/user/my-ranking
// @desc    Get user's ranking position
// @access  Private
router.get('/my-ranking', auth, async (req, res) => {
  try {
    // Get user's data
    const user = await User.findById(req.user._id)
      .select('rank level experience');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count users with higher rank/level/experience
    const higherRankedCount = await User.countDocuments({
      $or: [
        { rank: { $lt: user.rank } }, // Lower letter = higher rank (S < A < B...)
        {
          rank: user.rank,
          $or: [
            { level: { $gt: user.level } },
            {
              level: user.level,
              experience: { $gt: user.experience }
            }
          ]
        }
      ]
    });
    
    // User's position is the count of higher ranked users + 1
    const ranking = higherRankedCount + 1;
    
    res.json({ ranking });
  } catch (error) {
    console.error('Get user ranking error:', error);
    res.status(500).json({ 
      message: 'Server error getting user ranking', 
      error: error.message 
    });
  }
});

module.exports = router;
