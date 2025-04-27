const Title = require('../models/Title');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all titles
exports.getAllTitles = async (req, res) => {
  try {
    const titles = await Title.find({ isHidden: false });
    res.status(200).json({
      success: true,
      count: titles.length,
      data: titles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get titles for a specific user (both owned and available)
exports.getUserTitles = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('titles.title');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get all titles
    const allTitles = await Title.find({ isHidden: false });
    
    // Get user's owned titles
    const ownedTitles = user.titles.map(t => {
      return {
        ...t.title.toObject(),
        unlockedAt: t.unlockedAt,
        isEquipped: t.isEquipped,
        isOwned: true
      };
    });
    
    // Get titles user doesn't own yet
    const ownedTitleIds = user.titles.map(t => t.title._id.toString());
    const availableTitles = allTitles
      .filter(title => !ownedTitleIds.includes(title._id.toString()))
      .map(title => {
        const requirements = title.checkRequirements(user);
        return {
          ...title.toObject(),
          isOwned: false,
          meetsRequirements: requirements.meetsRequirements,
          requirementReason: requirements.meetsRequirements ? null : requirements.reason
        };
      });
    
    res.status(200).json({
      success: true,
      data: {
        owned: ownedTitles,
        available: availableTitles
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

// Get a single title by ID
exports.getTitleById = async (req, res) => {
  try {
    const title = await Title.findById(req.params.id);
    
    if (!title) {
      return res.status(404).json({
        success: false,
        message: 'Title not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: title
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Equip a title
exports.equipTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const titleId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user owns the title
    const titleIndex = user.titles.findIndex(t => t.title.toString() === titleId);
    
    if (titleIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You do not own this title'
      });
    }
    
    // Equip the title
    const result = user.equipTitle(titleId);
    await user.save();
    
    res.status(200).json({
      success: result.success,
      message: result.message,
      data: {
        equippedTitle: user.equippedTitle
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

// Unlock a title (admin only or system)
exports.unlockTitle = async (req, res) => {
  try {
    const { userId, titleId } = req.body;
    
    // Validate input
    if (!userId || !titleId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Title ID are required'
      });
    }
    
    // Check if user and title exist
    const user = await User.findById(userId);
    const title = await Title.findById(titleId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!title) {
      return res.status(404).json({
        success: false,
        message: 'Title not found'
      });
    }
    
    // Check if user already has the title
    const hasTitle = user.titles.some(t => t.title.toString() === titleId);
    
    if (hasTitle) {
      return res.status(400).json({
        success: false,
        message: 'User already has this title'
      });
    }
    
    // Add title to user
    user.titles.push({
      title: titleId,
      unlockedAt: new Date(),
      isEquipped: false
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Title unlocked successfully',
      data: {
        title: title.name
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

// Check if user meets requirements for a title
exports.checkTitleRequirements = async (req, res) => {
  try {
    const userId = req.user.id;
    const titleId = req.params.id;
    
    const user = await User.findById(userId)
      .populate('completedQuests')
      .populate('achievements');
    
    const title = await Title.findById(titleId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!title) {
      return res.status(404).json({
        success: false,
        message: 'Title not found'
      });
    }
    
    const requirements = title.checkRequirements(user);
    
    res.status(200).json({
      success: true,
      data: {
        title: title.name,
        meetsRequirements: requirements.meetsRequirements,
        reason: requirements.reason || null
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

// Create a new title (admin only)
exports.createTitle = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const title = await Title.create(req.body);
    
    res.status(201).json({
      success: true,
      data: title
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update a title (admin only)
exports.updateTitle = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const title = await Title.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!title) {
      return res.status(404).json({
        success: false,
        message: 'Title not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: title
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete a title (admin only)
exports.deleteTitle = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const title = await Title.findByIdAndDelete(req.params.id);
    
    if (!title) {
      return res.status(404).json({
        success: false,
        message: 'Title not found'
      });
    }
    
    // Remove title from all users who have it
    await User.updateMany(
      { 'titles.title': req.params.id },
      { $pull: { titles: { title: req.params.id } } }
    );
    
    // Update equipped title for users who had this title equipped
    await User.updateMany(
      { equippedTitle: req.params.id },
      { $set: { equippedTitle: null } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Title deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
