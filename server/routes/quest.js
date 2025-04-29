const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Quest = require('../models/Quest');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { safeGet, safeFilter, safeFindIndex, errorResponse } = require('../utils/errorHandlers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/quest-proofs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|mp4|mov|avi|webm/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image and video files are allowed'));
  }
});

// @route   GET /api/quests
// @desc    Get all available quests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, difficulty, category } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    
    // Find quests
    const quests = await Quest.find(query);
    
    // Get user's active quests
    const user = await User.findById(req.user._id)
      .select('activeQuests completedQuests')
      .populate('activeQuests.quest');
    
    // Defensive: Ensure arrays
    const completedQuestsArr = Array.isArray(user.completedQuests) ? user.completedQuests : [];
    const activeQuestsArr = Array.isArray(user.activeQuests) ? user.activeQuests : [];
    // Filter out quests that user has already completed or are active using safe utilities
    const availableQuests = quests.filter(quest => {
      if (!quest || !quest._id) return false;
      
      // Check if quest is already completed
      const isCompleted = safeFilter(completedQuestsArr, 
        completedQuest => completedQuest && completedQuest.toString() === quest._id.toString()
      ).length > 0;
      
      // Check if quest is already active
      const isActive = safeFilter(activeQuestsArr, 
        activeQuest => safeGet(activeQuest, 'quest') && 
          safeGet(activeQuest, 'quest').toString() === quest._id.toString()
      ).length > 0;
      
      return !isCompleted && !isActive;
    });
    
    // Log available quests for debugging
    console.log(`Found ${availableQuests.length} available quests out of ${quests.length} total quests`);
    
    res.json({
      quests: availableQuests
    });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ 
      message: 'Server error getting quests', 
      error: error.message 
    });
  }
});

// @route   GET /api/quests/active
// @desc    Get user's active quests
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('activeQuests')
      .populate('activeQuests.quest');
    
    // Defensive: Ensure array
    const activeQuestsArr = Array.isArray(user.activeQuests) ? user.activeQuests : [];
    // Filter out any null or invalid quests using safe utilities
    const validActiveQuests = safeFilter(activeQuestsArr, activeQuest => 
      safeGet(activeQuest, 'quest')
    );
    
    console.log(`Found ${validActiveQuests.length} active quests`);
    
    res.json({
      quests: validActiveQuests
    });
  } catch (error) {
    console.error('Get active quests error:', error);
    res.status(500).json({ 
      message: 'Server error getting active quests', 
      error: error.message 
    });
  }
});

// @route   GET /api/quests/completed
// @desc    Get user's completed quests
// @access  Private
router.get('/completed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('completedQuests')
      .populate('completedQuests');
    
    // Defensive: Ensure array
    const completedQuestsArr = Array.isArray(user.completedQuests) ? user.completedQuests : [];
    // Filter out any null or invalid quests using safe utilities
    const validCompletedQuests = safeFilter(completedQuestsArr, quest => quest);
    
    console.log(`Found ${validCompletedQuests.length} completed quests`);
    
    res.json({
      quests: validCompletedQuests
    });
  } catch (error) {
    console.error('Get completed quests error:', error);
    res.status(500).json({ 
      message: 'Server error getting completed quests', 
      error: error.message 
    });
  }
});

// @route   POST /api/quests/:id/accept
// @desc    Accept a quest
// @access  Private
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    if (!quest.isActive) {
      return res.status(400).json({ message: 'This quest is no longer available' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if user already has this quest using safe utilities
    const hasQuest = safeFilter(user.activeQuests, 
      activeQuest => safeGet(activeQuest, 'quest') && 
        safeGet(activeQuest, 'quest').toString() === quest._id.toString()
    ).length > 0;
    
    if (hasQuest) {
      return res.status(400).json({ message: 'You already have this quest' });
    }
    
    // Check if user has already completed this quest using safe utilities
    const completedQuest = safeFilter(user.completedQuests,
      completedQuest => completedQuest && completedQuest.toString() === quest._id.toString()
    ).length > 0;
    
    if (completedQuest) {
      return res.status(400).json({ message: 'You have already completed this quest' });
    }
    
    // Calculate deadline
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + quest.timeLimit);
    
    // Add quest to user's active quests
    user.activeQuests.push({
      quest: quest._id,
      progress: 0,
      startedAt: new Date(),
      deadline
    });
    
    await user.save();
    
    // Notify client about new quest
    // Get the WebSocket server from the app settings
    const wss = req.app.get('wss');
    if (wss) {
      // Find the client connection for this user
      const userConnections = Array.from(wss.clients).filter(client => 
        client.userId && client.userId.toString() === user._id.toString()
      );
      
      // Send notification to all user's connections
      userConnections.forEach(client => {
        client.send(JSON.stringify({
          type: 'quest_accepted',
          data: {
            questId: quest._id,
            title: quest.title,
            deadline
          }
        }));
      });
    }
    
    res.json({
      message: 'Quest accepted successfully',
      quest: {
        id: quest._id,
        title: quest.title,
        description: quest.description,
        deadline,
        rewards: quest.rewards
      }
    });
  } catch (error) {
    console.error('Accept quest error:', error);
    res.status(500).json({ 
      message: 'Server error accepting quest', 
      error: error.message 
    });
  }
});

// @route   POST /api/quests/:id/progress
// @desc    Update quest progress
// @access  Private
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Invalid progress value' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Find quest in user's active quests using safe utility
    const questIndex = safeFindIndex(user.activeQuests, 
      activeQuest => safeGet(activeQuest, 'quest') && 
        safeGet(activeQuest, 'quest').toString() === req.params.id
    );
    
    if (questIndex === -1) {
      return res.status(404).json({ message: 'Quest not found in active quests' });
    }
    
    // Update progress
    user.activeQuests[questIndex].progress = progress;
    
    await user.save();
    
    res.json({
      message: 'Quest progress updated',
      quest: user.activeQuests[questIndex]
    });
  } catch (error) {
    console.error('Update quest progress error:', error);
    res.status(500).json({ 
      message: 'Server error updating quest progress', 
      error: error.message 
    });
  }
});

// @route   POST /api/quests/:id/complete
// @desc    Complete a quest
// @access  Private
router.post('/:id/complete', upload.single('proof'), auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Find quest in user's active quests using safe utility
    const questIndex = safeFindIndex(user.activeQuests, 
      activeQuest => safeGet(activeQuest, 'quest') && 
        safeGet(activeQuest, 'quest').toString() === req.params.id
    );
    
    if (questIndex === -1) {
      return res.status(404).json({ message: 'Quest not found in active quests' });
    }
    
    // Get quest details
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    // Check if quest requires proof
    if (quest.requiresProof && !req.file) {
      return res.status(400).json({ message: 'This quest requires proof of completion' });
    }
    
    // Check if quest is expired
    const activeQuest = user.activeQuests[questIndex];
    if (activeQuest.deadline && new Date() > activeQuest.deadline) {
      // Apply penalties for expired quest
      if (quest.penalties.experience > 0) {
        user.experience = Math.max(0, user.experience - quest.penalties.experience);
      }
      
      if (quest.penalties.currency > 0) {
        user.currency = Math.max(0, user.currency - quest.penalties.currency);
      }
      
      // Create penalty transaction
      await Transaction.createPenalty(
        user._id,
        `Failed to complete quest: ${quest.title}`,
        {
          experience: -quest.penalties.experience,
          currency: -quest.penalties.currency
        }
      );
      
      // Remove quest from active quests
      user.activeQuests.splice(questIndex, 1);
      await user.save();
      
      // Notify client about quest failure
      const wss = req.app.get('wss');
      if (wss) {
        // Find the client connection for this user
        const userConnections = Array.from(wss.clients).filter(client => 
          client.userId && client.userId.toString() === user._id.toString()
        );
        
        // Send notification to all user's connections
        userConnections.forEach(client => {
          client.send(JSON.stringify({
            type: 'quest_failed',
            data: {
              questId: quest._id,
              title: quest.title,
              penalties: quest.penalties
            }
          }));
        });
      }
      
      return res.status(400).json({ 
        message: 'Quest expired, penalties applied',
        penalties: quest.penalties
      });
    }
    
    // Process quest completion
    
    // Add experience
    const levelUpResult = user.addExperience(quest.rewards.experience);
    
    // Add currency
    user.currency += quest.rewards.currency;
    
    // Add stat points
    user.statPoints += quest.rewards.statPoints;
    
    // Add quest to completed quests
    user.completedQuests.push(quest._id);
    
    // Remove from active quests
    user.activeQuests.splice(questIndex, 1);
    
    await user.save();
    
    // Create transaction for quest rewards
    await Transaction.createQuestReward(
      user._id,
      quest._id,
      quest.rewards
    );
    
    // Notify client about quest completion and rewards
    const wss = req.app.get('wss');
    if (wss) {
      // Find the client connection for this user
      const userConnections = Array.from(wss.clients).filter(client => 
        client.userId && client.userId.toString() === user._id.toString()
      );
      
      // Send notification to all user's connections
      userConnections.forEach(client => {
        client.send(JSON.stringify({
          type: 'quest_completed',
          data: {
            questId: quest._id,
            title: quest.title,
            rewards: quest.rewards,
            levelUp: levelUpResult.leveledUp,
            newLevel: levelUpResult.newLevel,
            newRank: levelUpResult.newRank
          }
        }));
      });
    }
    
    res.json({
      message: 'Quest completed successfully',
      rewards: quest.rewards,
      levelUp: levelUpResult
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ 
      message: 'Server error completing quest', 
      error: error.message 
    });
  }
});

// @route   POST /api/quests/:id/abandon
// @desc    Abandon a quest
// @access  Private
router.post('/:id/abandon', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Find quest in user's active quests using safe utility
    const questIndex = safeFindIndex(user.activeQuests, 
      activeQuest => safeGet(activeQuest, 'quest') && 
        safeGet(activeQuest, 'quest').toString() === req.params.id
    );
    
    if (questIndex === -1) {
      return res.status(404).json({ message: 'Quest not found in active quests' });
    }
    
    // Get quest details
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    // Apply penalties for abandoning quest
    if (quest.penalties.experience > 0) {
      user.experience = Math.max(0, user.experience - quest.penalties.experience);
    }
    
    if (quest.penalties.currency > 0) {
      user.currency = Math.max(0, user.currency - quest.penalties.currency);
    }
    
    // Create penalty transaction
    await Transaction.createPenalty(
      user._id,
      `Abandoned quest: ${quest.title}`,
      {
        experience: -quest.penalties.experience,
        currency: -quest.penalties.currency
      }
    );
    
    // Remove quest from active quests
    user.activeQuests.splice(questIndex, 1);
    await user.save();
    
    // Notify client about quest abandonment
    const wss = req.app.get('wss');
    if (wss) {
      // Find the client connection for this user
      const userConnections = Array.from(wss.clients).filter(client => 
        client.userId && client.userId.toString() === user._id.toString()
      );
      
      // Send notification to all user's connections
      userConnections.forEach(client => {
        client.send(JSON.stringify({
          type: 'quest_abandoned',
          data: {
            questId: quest._id,
            title: quest.title,
            penalties: quest.penalties
          }
        }));
      });
    }
    
    res.json({
      message: 'Quest abandoned, penalties applied',
      penalties: quest.penalties
    });
  } catch (error) {
    console.error('Abandon quest error:', error);
    res.status(500).json({ 
      message: 'Server error abandoning quest', 
      error: error.message 
    });
  }
});

// @route   GET /api/quests/daily
// @desc    Get daily quests
// @access  Private
router.get('/daily', auth, async (req, res) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find daily quests created today
    const dailyQuests = await Quest.find({
      type: 'daily',
      isActive: true,
      createdAt: { $gte: today }
    });
    
    // Get user's active and completed quests
    const user = await User.findById(req.user._id)
      .select('activeQuests completedQuests')
      .populate('activeQuests.quest');
    
    // Defensive: Ensure arrays
    const completedQuestsArr = Array.isArray(user.completedQuests) ? user.completedQuests : [];
    const activeQuestsArr = Array.isArray(user.activeQuests) ? user.activeQuests : [];
    // Filter out quests that user has already completed or are active
    const availableDailyQuests = dailyQuests.filter(quest => {
      // Check if quest is completed
      const isCompleted = safeFilter(completedQuestsArr, 
        completedQuest => completedQuest && completedQuest.toString() === quest._id.toString()
      ).length > 0;
      // Check if quest is already active
      const isActive = safeFilter(activeQuestsArr, 
        activeQuest => safeGet(activeQuest, 'quest') && safeGet(activeQuest, 'quest').toString() === quest._id.toString()
      ).length > 0;
      return !isCompleted && !isActive;
    });
    
    res.json({
      quests: availableDailyQuests
    });
  } catch (error) {
    console.error('Get daily quests error:', error);
    res.status(500).json({ 
      message: 'Server error getting daily quests', 
      error: error.message 
    });
  }
});

// @route   GET /api/quests/emergency
// @desc    Get emergency quests
// @access  Private
router.get('/emergency', auth, async (req, res) => {
  try {
    // Find active emergency quests
    const emergencyQuests = await Quest.find({
      type: 'emergency',
      isActive: true
    });
    
    // Get user's active and completed quests
    const user = await User.findById(req.user._id)
      .select('activeQuests completedQuests')
      .populate('activeQuests.quest');
    
    // Defensive: Ensure arrays
    const completedQuestsArr = Array.isArray(user.completedQuests) ? user.completedQuests : [];
    const activeQuestsArr = Array.isArray(user.activeQuests) ? user.activeQuests : [];
    // Filter out quests that user has already completed or are active
    const availableEmergencyQuests = emergencyQuests.filter(quest => {
      // Check if quest is completed
      const isCompleted = safeFilter(completedQuestsArr, 
        completedQuest => completedQuest && completedQuest.toString() === quest._id.toString()
      ).length > 0;
      // Check if quest is already active
      const isActive = safeFilter(activeQuestsArr, 
        activeQuest => safeGet(activeQuest, 'quest') && safeGet(activeQuest, 'quest').toString() === quest._id.toString()
      ).length > 0;
      return !isCompleted && !isActive;
    });
    
    res.json({
      quests: availableEmergencyQuests
    });
  } catch (error) {
    console.error('Get emergency quests error:', error);
    res.status(500).json({ 
      message: 'Server error getting emergency quests', 
      error: error.message 
    });
  }
});

module.exports = router;
