const VerificationSubmission = require('../models/VerificationSubmission');
const Quest = require('../models/Quest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendNotificationToUser } = require('../websocket');

// Debug logs for imports
console.log('DEBUG: VerificationSubmission:', typeof VerificationSubmission);
console.log('DEBUG: Quest:', typeof Quest);
console.log('DEBUG: User:', typeof User);
console.log('DEBUG: Notification:', typeof Notification);
console.log('DEBUG: sendNotificationToUser:', typeof sendNotificationToUser);

// Helper function to save uploaded media
const saveMedia = (base64Data, fileType, metadata = null) => {
  // Extract the base64 data without the prefix
  const base64Content = base64Data.split(';base64,').pop();
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Generate unique filename
  const extension = fileType === 'video' ? 'mp4' : 'jpg';
  const filename = `${uuidv4()}.${extension}`;
  const filePath = path.join(uploadsDir, filename);
  
  // Save the file
  fs.writeFileSync(filePath, base64Content, { encoding: 'base64' });
  
  // If metadata is provided, save it alongside the media file
  if (metadata && typeof metadata === 'object') {
    const metadataFilePath = path.join(uploadsDir, `${filename}.metadata.json`);
    fs.writeFileSync(metadataFilePath, JSON.stringify({
      ...metadata,
      originalFilename: filename,
      fileType,
      uploadedAt: new Date().toISOString()
    }, null, 2));
  }
  
  return `/uploads/${filename}`;
};

// Submit verification for a quest
exports.submitVerification = async (req, res) => {
  try {
    const { questId, submissionType, mediaData, gpsData, metadata } = req.body;
    const userId = req.user.id;
    
    // Check if quest exists and requires verification
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    if (!quest.requiresProof) {
      return res.status(400).json({ message: 'This quest does not require verification' });
    }
    
    // Validate submission type
    if (quest.proofType !== submissionType) {
      return res.status(400).json({ 
        message: `This quest requires ${quest.proofType} verification, but ${submissionType} was provided` 
      });
    }
    
    // Save media if provided
    let mediaUrl = null;
    if (mediaData && (submissionType === 'video' || submissionType === 'image')) {
      mediaUrl = saveMedia(mediaData, submissionType, metadata);
    }
    
    // Create verification submission
    const submission = new VerificationSubmission({
      user: userId,
      quest: questId,
      submissionType,
      mediaUrl,
      gpsData: submissionType === 'gps' ? gpsData : undefined,
      verificationStatus: 'pending'
    });
    
    await submission.save();
    
    // If AI verification is enabled, process it immediately
    if (quest.verificationMethod === 'ai' && submission.mediaUrl) {
      // This would call an AI service in a production environment
      // For now, we'll simulate AI verification with a random result
      const simulateAIVerification = async () => {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate AI verification (70% success rate for demo)
        const success = Math.random() > 0.3;
        const confidence = success ? 0.7 + (Math.random() * 0.3) : 0.2 + (Math.random() * 0.5);
        
        const aiResult = {
          success,
          confidence,
          detectedObjects: ['person'],
          detectedActivities: quest.aiVerificationType === 'activity' ? ['exercise'] : [],
          poseData: quest.aiVerificationType === 'pose' ? { valid: success } : null,
          feedback: success ? 'Verification successful!' : 'Could not verify the exercise. Please try again with clearer video.'
        };
        
        // Update submission with AI result
        await submission.verifyWithAI(aiResult);
        
        // If verified successfully, complete the quest
        if (success) {
          const user = await User.findById(userId);
          
          // Add quest to completed quests
          if (!user.completedQuests.includes(questId)) {
            user.completedQuests.push(questId);
          }
          
          // Remove from active quests
          user.activeQuests = user.activeQuests.filter(q => q.quest.toString() !== questId.toString());
          
          // Add rewards
          const experienceGained = quest.rewards.experience;
          const currencyGained = quest.rewards.currency;
          const statPointsGained = quest.rewards.statPoints;
          
          user.currency += currencyGained;
          user.statPoints += statPointsGained;
          
          // Add experience and handle level ups
          const levelUpResult = user.addExperience(experienceGained);
          
          await user.save();
          
          // Create notification
          const notification = await Notification.createQuestCompletionNotification(
            userId,
            quest.title,
            {
              experience: experienceGained,
              currency: currencyGained,
              statPoints: statPointsGained
            }
          );
          
          // Send real-time notification
          sendNotificationToUser(userId, notification);
          
          // If user leveled up, send level up notification
          if (levelUpResult.leveledUp) {
            const levelUpNotification = await Notification.createLevelUpNotification(
              userId,
              levelUpResult.newLevel,
              user.statPoints
            );
            
            sendNotificationToUser(userId, levelUpNotification);
          }
        }
      };
      
      // Start AI verification process (non-blocking)
      simulateAIVerification().catch(err => console.error('AI verification error:', err));
      
      return res.status(202).json({ 
        message: 'Verification submission received and being processed by AI',
        submissionId: submission._id
      });
    }
    
    return res.status(201).json({ 
      message: 'Verification submission received',
      submissionId: submission._id
    });
  } catch (error) {
    console.error('Verification submission error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get verification status
exports.getVerificationStatus = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;
    
    const submission = await VerificationSubmission.findOne({
      _id: submissionId,
      user: userId
    });
    
    if (!submission) {
      return res.status(404).json({ message: 'Verification submission not found' });
    }
    
    return res.status(200).json({ 
      status: submission.verificationStatus,
      aiResult: submission.aiVerificationResult,
      submittedAt: submission.submittedAt
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all verification submissions for a user
exports.getUserVerifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const submissions = await VerificationSubmission.find({ user: userId })
      .populate('quest', 'title type')
      .sort({ submittedAt: -1 });
    
    return res.status(200).json(submissions);
  } catch (error) {
    console.error('Get user verifications error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get pending verifications
exports.getPendingVerifications = async (req, res) => {
  try {
    // Check if user is admin (should be done via middleware)
    
    const submissions = await VerificationSubmission.find({ 
      verificationStatus: 'pending',
      'aiVerificationResult.success': { $ne: true } // Exclude those already verified by AI
    })
      .populate('user', 'username')
      .populate('quest', 'title type')
      .sort({ submittedAt: 1 });
    
    return res.status(200).json(submissions);
  } catch (error) {
    console.error('Get pending verifications error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Manually verify a submission
exports.manuallyVerify = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { isVerified, notes } = req.body;
    const adminId = req.user.id;
    
    // Check if user is admin (should be done via middleware)
    
    const submission = await VerificationSubmission.findById(submissionId)
      .populate('quest')
      .populate('user');
    
    if (!submission) {
      return res.status(404).json({ message: 'Verification submission not found' });
    }
    
    // Update verification status
    await submission.manualVerify(adminId, isVerified, notes);
    
    // If verified, complete the quest
    if (isVerified) {
      const user = submission.user;
      const quest = submission.quest;
      
      // Add quest to completed quests
      if (!user.completedQuests.includes(quest._id)) {
        user.completedQuests.push(quest._id);
      }
      
      // Remove from active quests
      user.activeQuests = user.activeQuests.filter(q => q.quest.toString() !== quest._id.toString());
      
      // Add rewards
      const experienceGained = quest.rewards.experience;
      const currencyGained = quest.rewards.currency;
      const statPointsGained = quest.rewards.statPoints;
      
      user.currency += currencyGained;
      user.statPoints += statPointsGained;
      
      // Add experience and handle level ups
      const levelUpResult = user.addExperience(experienceGained);
      
      await user.save();
      
      // Create notification
      const notification = await Notification.createQuestCompletionNotification(
        user._id,
        quest.title,
        {
          experience: experienceGained,
          currency: currencyGained,
          statPoints: statPointsGained
        }
      );
      
      // Send real-time notification
      sendNotificationToUser(user._id, notification);
      
      // If user leveled up, send level up notification
      if (levelUpResult.leveledUp) {
        const levelUpNotification = await Notification.createLevelUpNotification(
          user._id,
          levelUpResult.newLevel,
          user.statPoints
        );
        
        sendNotificationToUser(user._id, levelUpNotification);
      }
    } else {
      // Create rejection notification
      const notification = await Notification.create({
        user: submission.user._id,
        type: 'system_message',
        title: 'Verification Rejected',
        message: `Your verification for quest "${submission.quest.title}" was rejected: ${notes || 'No specific reason provided.'}`,
        style: 'danger'
      });
      
      // Send real-time notification
      sendNotificationToUser(submission.user._id, notification);
    }
    
    return res.status(200).json({ 
      message: `Verification ${isVerified ? 'approved' : 'rejected'}`,
      submission
    });
  } catch (error) {
    console.error('Manual verification error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
