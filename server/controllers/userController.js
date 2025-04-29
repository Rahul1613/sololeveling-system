const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('achievements')
      .populate({
        path: 'activeQuests.quest',
        model: 'Quest'
      })
      .populate({
        path: 'completedQuests',
        model: 'Quest'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    
    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        username: username || undefined,
        email: email || undefined,
        profilePicture: profilePicture || undefined
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Allocate stat points
exports.allocateStatPoints = async (req, res) => {
  try {
    const { stat, points } = req.body;
    
    if (!stat || !points || points <= 0) {
      return res.status(400).json({ message: 'Invalid stat allocation request' });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has enough stat points
    if (user.statPoints < points) {
      return res.status(400).json({ message: 'Not enough stat points available' });
    }
    
    // Check if stat is valid
    if (!user.stats.hasOwnProperty(stat)) {
      return res.status(400).json({ message: 'Invalid stat type' });
    }
    
    // Update stat and reduce available points
    user.stats[stat] += points;
    user.statPoints -= points;
    
    // Update HP and MP based on new stats
    user.hp.max = 100 + (user.level - 1) * 10 + user.stats.vitality * 5;
    user.mp.max = 50 + (user.level - 1) * 5 + user.stats.intelligence * 2;
    
    await user.save();
    
    // Notify clients about stat update
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('stats-updated', {
      stats: user.stats,
      statPoints: user.statPoints,
      hp: user.hp,
      mp: user.mp
    });
    
    res.status(200).json({
      stats: user.stats,
      statPoints: user.statPoints,
      hp: user.hp,
      mp: user.mp
    });
  } catch (error) {
    console.error('Error allocating stat points:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get global rankings
exports.getGlobalRankings = async (req, res) => {
  try {
    // Get rankings sorted by level (descending) and experience (descending)
    const rankings = await User.find({})
      .select('username profilePicture level experience experienceToNextLevel rank stats')
      .sort({ rank: 1, level: -1, experience: -1 })
      .limit(100);
    
    res.status(200).json(rankings);
  } catch (error) {
    console.error('Error getting global rankings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get rankings by rank
exports.getRankingsByRank = async (req, res) => {
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
    
    res.status(200).json(rankings);
  } catch (error) {
    console.error('Error getting rankings by rank:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's ranking position
exports.getUserRanking = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user's data
    const user = await User.findById(userId)
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
    
    res.status(200).json({ ranking });
  } catch (error) {
    console.error('Error getting user ranking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
