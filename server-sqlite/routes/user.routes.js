const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../config/database');

// Get user stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      rank: user.rank,
      level: user.level,
      experience: user.experience,
      gold: user.gold,
      health: user.health,
      mana: user.mana,
      strength: user.strength,
      intelligence: user.intelligence,
      agility: user.agility,
      skillPoints: user.skillPoints,
      hunts: user.hunts,
      kills: user.kills,
      dungeons: user.dungeons,
      bossKills: user.bossKills,
      soloHunts: user.soloHunts
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
});

// Update user stats (for testing purposes)
router.put('/stats', authenticateToken, async (req, res) => {
  try {
    const { 
      experience, gold, health, mana, strength, 
      intelligence, agility, skillPoints, hunts, 
      kills, dungeons, bossKills, soloHunts 
    } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Update user stats
      if (experience !== undefined) user.experience = experience;
      if (gold !== undefined) user.gold = gold;
      if (health !== undefined) user.health = health;
      if (mana !== undefined) user.mana = mana;
      if (strength !== undefined) user.strength = strength;
      if (intelligence !== undefined) user.intelligence = intelligence;
      if (agility !== undefined) user.agility = agility;
      if (skillPoints !== undefined) user.skillPoints = skillPoints;
      if (hunts !== undefined) user.hunts = hunts;
      if (kills !== undefined) user.kills = kills;
      if (dungeons !== undefined) user.dungeons = dungeons;
      if (bossKills !== undefined) user.bossKills = bossKills;
      if (soloHunts !== undefined) user.soloHunts = soloHunts;
      
      // Check if user should level up
      if (experience !== undefined) {
        const expToNextLevel = user.level * 100;
        if (user.experience >= expToNextLevel) {
          user.level += 1;
          user.experience -= expToNextLevel;
          user.skillPoints += 3; // Award skill points on level up
        }
      }
      
      // Check if user should rank up
      if (user.level >= 20 && user.rank === 'E') {
        user.rank = 'D';
      } else if (user.level >= 40 && user.rank === 'D') {
        user.rank = 'C';
      } else if (user.level >= 60 && user.rank === 'C') {
        user.rank = 'B';
      } else if (user.level >= 80 && user.rank === 'B') {
        user.rank = 'A';
      } else if (user.level >= 100 && user.rank === 'A') {
        user.rank = 'S';
      }
      
      await user.save({ transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      res.json({
        message: 'User stats updated successfully',
        user: {
          id: user.id,
          username: user.username,
          rank: user.rank,
          level: user.level,
          experience: user.experience,
          gold: user.gold,
          health: user.health,
          mana: user.mana,
          strength: user.strength,
          intelligence: user.intelligence,
          agility: user.agility,
          skillPoints: user.skillPoints,
          hunts: user.hunts,
          kills: user.kills,
          dungeons: user.dungeons,
          bossKills: user.bossKills,
          soloHunts: user.soloHunts
        }
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({ message: 'Failed to update user stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['id', 'username', 'rank', 'level', 'experience', 'kills', 'hunts', 'dungeons', 'bossKills'],
      order: [
        ['rank', 'ASC'],
        ['level', 'DESC'],
        ['experience', 'DESC']
      ],
      limit: 100
    });
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
