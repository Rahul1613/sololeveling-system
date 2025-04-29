const express = require('express');
const router = express.Router();
const Title = require('../models/title.model');
const UserTitle = require('../models/userTitle.model');
const User = require('../models/user.model');
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all available titles based on user's performance
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all titles
    const allTitles = await Title.findAll();
    
    // Check which titles the user meets requirements for
    const availableTitles = allTitles.map(title => {
      const requirements = title.requirements;
      let allRequirementsMet = true;
      let unmetRequirements = [];
      
      requirements.forEach(req => {
        switch(req.type) {
          case 'hunts':
            if (user.hunts < req.value) {
              allRequirementsMet = false;
              unmetRequirements.push(`Need ${req.value - user.hunts} more hunts`);
            }
            break;
          case 'kills':
            if (user.kills < req.value) {
              allRequirementsMet = false;
              unmetRequirements.push(`Need ${req.value - user.kills} more kills`);
            }
            break;
          case 'dungeons':
            if (user.dungeons < req.value) {
              allRequirementsMet = false;
              unmetRequirements.push(`Need ${req.value - user.dungeons} more dungeons`);
            }
            break;
          case 'rank':
            const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
            const userRankIndex = rankOrder.indexOf(user.rank);
            const requiredRankIndex = rankOrder.indexOf(req.value);
            if (userRankIndex < requiredRankIndex) {
              allRequirementsMet = false;
              unmetRequirements.push(`Need to reach rank ${req.value}`);
            }
            break;
          case 'boss_kills':
            if (user.bossKills < req.value) {
              allRequirementsMet = false;
              unmetRequirements.push(`Need ${req.value - user.bossKills} more boss kills`);
            }
            break;
          case 'solo_hunts':
            if (user.soloHunts < req.value) {
              allRequirementsMet = false;
              unmetRequirements.push(`Need ${req.value - user.soloHunts} more solo hunts`);
            }
            break;
          // Add more requirement types as needed
        }
      });
      
      return {
        ...title.get({ plain: true }),
        allRequirementsMet,
        unmetRequirements
      };
    });
    
    res.json(availableTitles);
  } catch (error) {
    console.error('Error fetching available titles:', error);
    res.status(500).json({ message: 'Failed to fetch available titles' });
  }
});

// Get user's titles
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userTitles = await UserTitle.findAll({
      where: { user_id: req.user.id },
      include: [Title]
    });
    
    // Get equipped title
    const equippedTitle = await UserTitle.findOne({
      where: { 
        user_id: req.user.id,
        is_equipped: true
      },
      include: [Title]
    });
    
    res.json({
      userTitles,
      equippedTitle
    });
  } catch (error) {
    console.error('Error fetching user titles:', error);
    res.status(500).json({ message: 'Failed to fetch user titles' });
  }
});

// Buy a title
router.post('/buy', authenticateToken, async (req, res) => {
  const { titleId } = req.body;
  const userId = req.user.id;
  
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    // Find the title
    const title = await Title.findByPk(titleId);
    if (!title) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Title not found' });
    }
    
    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has enough gold
    if (user.gold < title.price) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Not enough gold' });
    }
    
    // Check if user meets requirements
    const requirements = title.requirements;
    let allRequirementsMet = true;
    let unmetRequirements = [];
    
    requirements.forEach(req => {
      switch(req.type) {
        case 'hunts':
          if (user.hunts < req.value) {
            allRequirementsMet = false;
            unmetRequirements.push(`Need ${req.value - user.hunts} more hunts`);
          }
          break;
        case 'kills':
          if (user.kills < req.value) {
            allRequirementsMet = false;
            unmetRequirements.push(`Need ${req.value - user.kills} more kills`);
          }
          break;
        case 'dungeons':
          if (user.dungeons < req.value) {
            allRequirementsMet = false;
            unmetRequirements.push(`Need ${req.value - user.dungeons} more dungeons`);
          }
          break;
        case 'rank':
          const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
          const userRankIndex = rankOrder.indexOf(user.rank);
          const requiredRankIndex = rankOrder.indexOf(req.value);
          if (userRankIndex < requiredRankIndex) {
            allRequirementsMet = false;
            unmetRequirements.push(`Need to reach rank ${req.value}`);
          }
          break;
        case 'boss_kills':
          if (user.bossKills < req.value) {
            allRequirementsMet = false;
            unmetRequirements.push(`Need ${req.value - user.bossKills} more boss kills`);
          }
          break;
        case 'solo_hunts':
          if (user.soloHunts < req.value) {
            allRequirementsMet = false;
            unmetRequirements.push(`Need ${req.value - user.soloHunts} more solo hunts`);
          }
          break;
        // Add more requirement types as needed
      }
    });
    
    if (!allRequirementsMet) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'You do not meet the requirements for this title',
        unmetRequirements
      });
    }
    
    // Check if user already has this title
    const existingTitle = await UserTitle.findOne({
      where: {
        user_id: userId,
        title_id: titleId
      }
    });
    
    if (existingTitle) {
      await transaction.rollback();
      return res.status(400).json({ message: 'You already own this title' });
    }
    
    // Create user title entry
    const userTitle = await UserTitle.create({
      user_id: userId,
      title_id: titleId,
      is_equipped: false
    }, { transaction });
    
    // Deduct gold from user
    user.gold -= title.price;
    await user.save({ transaction });
    
    // Commit the transaction
    await transaction.commit();
    
    res.json({
      message: `Successfully acquired the title "${title.name}"`,
      title: userTitle,
      gold: user.gold
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error buying title:', error);
    res.status(500).json({ message: 'Failed to buy title' });
  }
});

// Equip a title
router.post('/equip', authenticateToken, async (req, res) => {
  const { userTitleId } = req.body;
  const userId = req.user.id;
  
  try {
    // Find the user title
    const userTitle = await UserTitle.findOne({
      where: {
        id: userTitleId,
        user_id: userId
      },
      include: [Title]
    });
    
    if (!userTitle) {
      return res.status(404).json({ message: 'Title not found in your titles' });
    }
    
    // Unequip any currently equipped title
    await UserTitle.update(
      { is_equipped: false },
      {
        where: {
          user_id: userId,
          is_equipped: true
        }
      }
    );
    
    // Equip the new title
    userTitle.is_equipped = true;
    await userTitle.save();
    
    // Apply title bonuses to user (simplified for this example)
    // In a real application, this would be more complex and might involve a separate system
    
    res.json({
      message: `Successfully equipped the title "${userTitle.Title.name}"`,
      title: userTitle
    });
  } catch (error) {
    console.error('Error equipping title:', error);
    res.status(500).json({ message: 'Failed to equip title' });
  }
});

// Unequip a title
router.post('/unequip', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Find the equipped title
    const equippedTitle = await UserTitle.findOne({
      where: {
        user_id: userId,
        is_equipped: true
      },
      include: [Title]
    });
    
    if (!equippedTitle) {
      return res.status(404).json({ message: 'No title is currently equipped' });
    }
    
    // Unequip the title
    equippedTitle.is_equipped = false;
    await equippedTitle.save();
    
    // Remove title bonuses from user (simplified for this example)
    
    res.json({
      message: `Successfully unequipped the title "${equippedTitle.Title.name}"`,
      title: equippedTitle
    });
  } catch (error) {
    console.error('Error unequipping title:', error);
    res.status(500).json({ message: 'Failed to unequip title' });
  }
});

module.exports = router;
