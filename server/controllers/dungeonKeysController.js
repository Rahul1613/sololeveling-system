const DungeonKey = require('../models/DungeonKey');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all dungeon keys
exports.getAllDungeonKeys = async (req, res) => {
  try {
    const dungeonKeys = await DungeonKey.find({ isHidden: false });
    res.status(200).json({
      success: true,
      count: dungeonKeys.length,
      data: dungeonKeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get dungeon keys for a specific user
exports.getUserDungeonKeys = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('dungeonKeys.key');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format user's dungeon keys
    const userDungeonKeys = user.dungeonKeys.map(dk => {
      return {
        ...dk.key.toObject(),
        obtainedAt: dk.obtainedAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: userDungeonKeys.length,
      data: userDungeonKeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get a single dungeon key by ID
exports.getDungeonKeyById = async (req, res) => {
  try {
    const dungeonKey = await DungeonKey.findById(req.params.id);
    
    if (!dungeonKey) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon key not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: dungeonKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Generate a random dungeon key for a user
exports.generateRandomKey = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate a random key based on user level
    const randomKey = await DungeonKey.generateRandomKey(user.level);
    
    // Save the key
    await randomKey.save();
    
    // Add key to user's dungeon keys
    user.dungeonKeys.push({
      key: randomKey._id,
      obtainedAt: new Date()
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Dungeon key generated successfully',
      data: randomKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Use a dungeon key
exports.useDungeonKey = async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has the key
    const keyIndex = user.dungeonKeys.findIndex(dk => dk.key.toString() === keyId);
    
    if (keyIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You do not have this dungeon key'
      });
    }
    
    // Get the key
    const dungeonKey = await DungeonKey.findById(keyId);
    
    if (!dungeonKey) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon key not found'
      });
    }
    
    // Check if user meets requirements
    const requirements = dungeonKey.checkRequirements(user);
    
    if (!requirements.meetsRequirements) {
      return res.status(400).json({
        success: false,
        message: `Cannot use this key: ${requirements.reason}`
      });
    }
    
    // If key is consumable, remove it from user's inventory
    if (dungeonKey.isConsumable) {
      user.dungeonKeys.splice(keyIndex, 1);
      await user.save();
    } else if (dungeonKey.isLimited) {
      // If key has limited uses, decrement uses
      if (user.dungeonKeys[keyIndex].uses === undefined) {
        user.dungeonKeys[keyIndex].uses = dungeonKey.limitedUses - 1;
      } else {
        user.dungeonKeys[keyIndex].uses -= 1;
      }
      
      // If no uses left, remove the key
      if (user.dungeonKeys[keyIndex].uses <= 0) {
        user.dungeonKeys.splice(keyIndex, 1);
      }
      
      await user.save();
    }
    
    // Return dungeon details and rewards
    res.status(200).json({
      success: true,
      message: `Successfully entered ${dungeonKey.name}`,
      data: {
        dungeonKey: dungeonKey,
        rewards: dungeonKey.rewards,
        timeLimit: dungeonKey.timeLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Complete a dungeon and get rewards
exports.completeDungeon = async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;
    const { completionTime, success } = req.body;
    
    const user = await User.findById(userId);
    const dungeonKey = await DungeonKey.findById(keyId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!dungeonKey) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon key not found'
      });
    }
    
    // Check if completion was successful
    if (!success) {
      return res.status(200).json({
        success: true,
        message: 'Dungeon failed. No rewards earned.',
        data: {
          experienceGained: 0,
          currencyGained: 0,
          itemsGained: [],
          statPointsGained: 0
        }
      });
    }
    
    // Check if completed within time limit
    if (completionTime > dungeonKey.timeLimit * 60) { // Convert minutes to seconds
      return res.status(200).json({
        success: true,
        message: 'Dungeon time limit exceeded. Reduced rewards earned.',
        data: {
          experienceGained: Math.floor(dungeonKey.rewards.experience * 0.5),
          currencyGained: Math.floor(dungeonKey.rewards.currency * 0.5),
          itemsGained: [],
          statPointsGained: 0
        }
      });
    }
    
    // Calculate rewards
    const experienceGained = dungeonKey.rewards.experience;
    const currencyGained = dungeonKey.rewards.currency;
    const statPointsGained = dungeonKey.rewards.statPoints || 0;
    
    // Add experience and handle level ups
    const levelUpResult = user.addExperience(experienceGained);
    
    // Add currency
    user.currency += currencyGained;
    
    // Add stat points
    user.statPoints += statPointsGained;
    
    // Determine item drops based on drop rates
    const itemsGained = [];
    if (dungeonKey.rewards.items && dungeonKey.rewards.items.length > 0) {
      for (const itemReward of dungeonKey.rewards.items) {
        const roll = Math.random() * 100;
        if (roll <= itemReward.dropRate) {
          // Add item to user's inventory
          // This would be handled by inventory controller in a real implementation
          itemsGained.push({
            item: itemReward.item,
            quantity: itemReward.quantity
          });
        }
      }
    }
    
    // Determine skill drops based on drop rates
    const skillsGained = [];
    if (dungeonKey.rewards.skills && dungeonKey.rewards.skills.length > 0) {
      for (const skillReward of dungeonKey.rewards.skills) {
        const roll = Math.random() * 100;
        if (roll <= skillReward.dropRate) {
          // Add skill to user's skills
          // This would be handled by skills controller in a real implementation
          skillsGained.push(skillReward.skill);
        }
      }
    }
    
    // Determine title drops based on drop rates
    const titlesGained = [];
    if (dungeonKey.rewards.titles && dungeonKey.rewards.titles.length > 0) {
      for (const titleReward of dungeonKey.rewards.titles) {
        const roll = Math.random() * 100;
        if (roll <= titleReward.dropRate) {
          // Add title to user's titles
          // This would be handled by titles controller in a real implementation
          titlesGained.push(titleReward.title);
        }
      }
    }
    
    // Determine shadow drops based on drop rates
    const shadowsGained = [];
    if (dungeonKey.rewards.shadows && dungeonKey.rewards.shadows.length > 0) {
      for (const shadowReward of dungeonKey.rewards.shadows) {
        const roll = Math.random() * 100;
        if (roll <= shadowReward.dropRate) {
          // Add shadow to user's shadows
          // This would be handled by shadows controller in a real implementation
          shadowsGained.push({
            type: shadowReward.type,
            level: shadowReward.level,
            rank: shadowReward.rank
          });
        }
      }
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Dungeon completed successfully!',
      data: {
        experienceGained,
        currencyGained,
        statPointsGained,
        itemsGained,
        skillsGained,
        titlesGained,
        shadowsGained,
        leveledUp: levelUpResult.leveledUp,
        newLevel: levelUpResult.newLevel,
        newRank: levelUpResult.newRank
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Give a dungeon key to a user (admin only)
exports.giveDungeonKey = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const { userId, keyId } = req.body;
    
    // Validate input
    if (!userId || !keyId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Key ID are required'
      });
    }
    
    // Check if user and key exist
    const user = await User.findById(userId);
    const dungeonKey = await DungeonKey.findById(keyId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!dungeonKey) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon key not found'
      });
    }
    
    // Add key to user
    user.dungeonKeys.push({
      key: keyId,
      obtainedAt: new Date()
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Dungeon key given successfully',
      data: {
        key: dungeonKey.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create a new dungeon key (admin only)
exports.createDungeonKey = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const dungeonKey = await DungeonKey.create(req.body);
    
    res.status(201).json({
      success: true,
      data: dungeonKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update a dungeon key (admin only)
exports.updateDungeonKey = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const dungeonKey = await DungeonKey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!dungeonKey) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon key not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: dungeonKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete a dungeon key (admin only)
exports.deleteDungeonKey = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const dungeonKey = await DungeonKey.findByIdAndDelete(req.params.id);
    
    if (!dungeonKey) {
      return res.status(404).json({
        success: false,
        message: 'Dungeon key not found'
      });
    }
    
    // Remove key from all users who have it
    await User.updateMany(
      { 'dungeonKeys.key': req.params.id },
      { $pull: { dungeonKeys: { key: req.params.id } } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Dungeon key deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
