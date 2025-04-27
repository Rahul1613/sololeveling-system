const Quest = require('../models/Quest');
const User = require('../models/User');

// Create a custom quest
const createCustomQuest = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      requirements,
      rewards,
      timeLimit,
      requiresProof,
      proofType,
      verificationMethod,
      category
    } = req.body;

    // Validate required fields
    if (!title || !description || !requirements) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and requirements'
      });
    }

    // Create custom quest
    const quest = await Quest.create({
      title,
      description,
      type: 'custom',
      difficulty: difficulty || 'medium',
      requirements,
      rewards: {
        experience: rewards?.experience || Quest.calculateRewards(difficulty || 'medium').experience,
        currency: rewards?.currency || Quest.calculateRewards(difficulty || 'medium').currency,
        statPoints: rewards?.statPoints || Quest.calculateRewards(difficulty || 'medium').statPoints,
        items: rewards?.items || []
      },
      timeLimit: timeLimit || 24,
      requiresProof: requiresProof || false,
      proofType: proofType || 'none',
      verificationMethod: verificationMethod || 'none',
      category: category || 'other',
      createdBy: req.user._id,
      isCustom: true
    });

    res.status(201).json({
      success: true,
      quest
    });
  } catch (error) {
    console.error('Create custom quest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all custom quests created by the user
const getUserCustomQuests = async (req, res) => {
  try {
    const quests = await Quest.find({
      createdBy: req.user._id,
      isCustom: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      quests
    });
  } catch (error) {
    console.error('Get user custom quests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all public custom quests
const getPublicCustomQuests = async (req, res) => {
  try {
    const quests = await Quest.find({
      isCustom: true,
      isActive: true
    })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      quests
    });
  } catch (error) {
    console.error('Get public custom quests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update a custom quest
const updateCustomQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    const {
      title,
      description,
      difficulty,
      requirements,
      rewards,
      timeLimit,
      requiresProof,
      proofType,
      verificationMethod,
      category,
      isActive
    } = req.body;

    // Find quest
    const quest = await Quest.findById(questId);

    // Check if quest exists
    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check if quest is custom and created by the user
    if (!quest.isCustom || quest.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quest'
      });
    }

    // Update quest
    quest.title = title || quest.title;
    quest.description = description || quest.description;
    quest.difficulty = difficulty || quest.difficulty;
    quest.requirements = requirements || quest.requirements;
    
    if (rewards) {
      quest.rewards.experience = rewards.experience || quest.rewards.experience;
      quest.rewards.currency = rewards.currency || quest.rewards.currency;
      quest.rewards.statPoints = rewards.statPoints || quest.rewards.statPoints;
      quest.rewards.items = rewards.items || quest.rewards.items;
    }
    
    quest.timeLimit = timeLimit || quest.timeLimit;
    quest.requiresProof = requiresProof !== undefined ? requiresProof : quest.requiresProof;
    quest.proofType = proofType || quest.proofType;
    quest.verificationMethod = verificationMethod || quest.verificationMethod;
    quest.category = category || quest.category;
    quest.isActive = isActive !== undefined ? isActive : quest.isActive;

    // Save updated quest
    await quest.save();

    res.json({
      success: true,
      quest
    });
  } catch (error) {
    console.error('Update custom quest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a custom quest
const deleteCustomQuest = async (req, res) => {
  try {
    const { questId } = req.params;

    // Find quest
    const quest = await Quest.findById(questId);

    // Check if quest exists
    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check if quest is custom and created by the user
    if (!quest.isCustom || quest.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quest'
      });
    }

    // Delete quest - using deleteOne instead of deprecated remove()
    await Quest.deleteOne({ _id: questId });

    res.json({
      success: true,
      message: 'Quest deleted successfully'
    });
  } catch (error) {
    console.error('Delete custom quest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createCustomQuest,
  getUserCustomQuests,
  getPublicCustomQuests,
  updateCustomQuest,
  deleteCustomQuest
};
