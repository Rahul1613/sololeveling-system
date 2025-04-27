/**
 * AI Verification Service
 * 
 * This service provides AI-based verification for quest submissions using:
 * - Pose detection for exercise verification
 * - Object detection for physical task verification
 * - Activity recognition for complex task verification
 * - Location verification for GPS-based tasks
 */

const VerificationSubmission = require('../models/VerificationSubmission');
const Quest = require('../models/Quest');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Mock function for pose detection (in production, would use TensorFlow.js or Mediapipe)
const detectPoses = async (imageData) => {
  // In a real implementation, this would use a machine learning model
  // to detect human poses in the image
  console.log('Detecting poses in image...');
  
  // Mock response
  return {
    poses: [
      {
        keypoints: [
          { part: 'nose', position: { x: 100, y: 100 }, score: 0.9 },
          { part: 'leftEye', position: { x: 90, y: 90 }, score: 0.8 },
          { part: 'rightEye', position: { x: 110, y: 90 }, score: 0.8 },
          { part: 'leftShoulder', position: { x: 80, y: 150 }, score: 0.7 },
          { part: 'rightShoulder', position: { x: 120, y: 150 }, score: 0.7 },
          { part: 'leftElbow', position: { x: 60, y: 180 }, score: 0.8 },
          { part: 'rightElbow', position: { x: 140, y: 180 }, score: 0.8 },
          { part: 'leftWrist', position: { x: 40, y: 210 }, score: 0.7 },
          { part: 'rightWrist', position: { x: 160, y: 210 }, score: 0.7 },
          { part: 'leftHip', position: { x: 90, y: 220 }, score: 0.7 },
          { part: 'rightHip', position: { x: 110, y: 220 }, score: 0.7 },
          { part: 'leftKnee', position: { x: 90, y: 270 }, score: 0.7 },
          { part: 'rightKnee', position: { x: 110, y: 270 }, score: 0.7 },
          { part: 'leftAnkle', position: { x: 90, y: 320 }, score: 0.7 },
          { part: 'rightAnkle', position: { x: 110, y: 320 }, score: 0.7 }
        ],
        score: 0.85
      }
    ],
    success: true,
    confidence: 0.85
  };
};

// Mock function for object detection
const detectObjects = async (imageData) => {
  // In a real implementation, this would use a machine learning model
  // to detect objects in the image
  console.log('Detecting objects in image...');
  
  // Mock response
  return {
    objects: [
      { class: 'person', score: 0.95, bbox: { x: 50, y: 50, width: 100, height: 200 } },
      { class: 'book', score: 0.85, bbox: { x: 200, y: 100, width: 50, height: 70 } },
      { class: 'laptop', score: 0.9, bbox: { x: 300, y: 150, width: 120, height: 80 } }
    ],
    success: true,
    confidence: 0.9
  };
};

// Mock function for activity recognition
const recognizeActivity = async (videoData) => {
  // In a real implementation, this would use a machine learning model
  // to recognize activities in the video
  console.log('Recognizing activity in video...');
  
  // Mock response
  return {
    activities: [
      { class: 'push_up', score: 0.85, count: 10 },
      { class: 'rest', score: 0.9, duration: 5 }
    ],
    success: true,
    confidence: 0.85
  };
};

// Mock function for GPS verification
const verifyLocation = async (gpsData, targetLocation) => {
  // In a real implementation, this would verify the GPS coordinates
  // against the target location
  console.log('Verifying GPS location...');
  
  // Calculate distance between points (simplified)
  const distance = Math.sqrt(
    Math.pow(gpsData.latitude - targetLocation.latitude, 2) +
    Math.pow(gpsData.longitude - targetLocation.longitude, 2)
  ) * 111000; // Rough conversion to meters
  
  return {
    distance: distance,
    isWithinRange: distance <= targetLocation.radius,
    success: distance <= targetLocation.radius,
    confidence: 1 - (distance / (targetLocation.radius * 2))
  };
};

// Main verification function
const verifySubmission = async (submissionId) => {
  try {
    // Get the submission
    const submission = await VerificationSubmission.findById(submissionId)
      .populate('quest')
      .populate('user');
    
    if (!submission) {
      return {
        success: false,
        message: 'Submission not found'
      };
    }
    
    // Check verification type
    let verificationResult = {
      success: false,
      confidence: 0,
      message: 'Verification failed'
    };
    
    switch (submission.submissionType) {
      case 'video':
        if (submission.quest.aiVerificationType === 'pose') {
          // For pose verification, we'd analyze frames from the video
          verificationResult = await recognizeActivity(submission.mediaUrl);
          
          // Check if the activity matches the quest requirements
          if (submission.quest.aiVerificationCriteria && 
              submission.quest.aiVerificationCriteria.activity) {
            const requiredActivity = submission.quest.aiVerificationCriteria.activity;
            const requiredCount = submission.quest.aiVerificationCriteria.count || 1;
            
            const detectedActivity = verificationResult.activities.find(
              a => a.class === requiredActivity
            );
            
            if (detectedActivity && detectedActivity.count >= requiredCount) {
              verificationResult.success = true;
              verificationResult.message = `Detected ${detectedActivity.count} ${requiredActivity}(s)`;
            } else {
              verificationResult.success = false;
              verificationResult.message = `Failed to detect required ${requiredActivity} (${requiredCount})`;
            }
          }
        } else if (submission.quest.aiVerificationType === 'activity') {
          verificationResult = await recognizeActivity(submission.mediaUrl);
        }
        break;
        
      case 'image':
        if (submission.quest.aiVerificationType === 'pose') {
          verificationResult = await detectPoses(submission.mediaUrl);
          
          // Check if the pose matches the quest requirements
          if (submission.quest.aiVerificationCriteria && 
              submission.quest.aiVerificationCriteria.pose) {
            const requiredPose = submission.quest.aiVerificationCriteria.pose;
            
            // In a real implementation, we would compare the detected pose
            // with the required pose using a similarity metric
            verificationResult.success = verificationResult.confidence > 0.7;
            verificationResult.message = verificationResult.success
              ? `Detected ${requiredPose} pose`
              : `Failed to detect ${requiredPose} pose`;
          }
        } else if (submission.quest.aiVerificationType === 'object') {
          verificationResult = await detectObjects(submission.mediaUrl);
          
          // Check if the required objects are in the image
          if (submission.quest.aiVerificationCriteria && 
              submission.quest.aiVerificationCriteria.objects) {
            const requiredObjects = submission.quest.aiVerificationCriteria.objects;
            
            const allObjectsFound = requiredObjects.every(obj => {
              return verificationResult.objects.some(
                detected => detected.class === obj && detected.score > 0.7
              );
            });
            
            verificationResult.success = allObjectsFound;
            verificationResult.message = allObjectsFound
              ? `Detected all required objects: ${requiredObjects.join(', ')}`
              : `Failed to detect all required objects`;
          }
        }
        break;
        
      case 'gps':
        if (submission.quest.aiVerificationType === 'gps') {
          verificationResult = await verifyLocation(
            submission.gpsData,
            submission.quest.aiVerificationCriteria.location
          );
        }
        break;
        
      default:
        verificationResult = {
          success: false,
          confidence: 0,
          message: 'Unsupported verification type'
        };
    }
    
    // Update the submission with the verification result
    submission.aiVerificationResult = {
      success: verificationResult.success,
      confidence: verificationResult.confidence,
      detectedObjects: verificationResult.objects ? verificationResult.objects.map(o => o.class) : [],
      detectedActivities: verificationResult.activities ? verificationResult.activities.map(a => a.class) : [],
      poseData: verificationResult.poses ? verificationResult.poses[0] : null,
      feedback: verificationResult.message
    };
    
    submission.verificationStatus = verificationResult.success ? 'verified' : 'rejected';
    
    await submission.save();
    
    // If verification was successful, update user progress
    if (verificationResult.success) {
      // Find the active quest in the user's list
      const user = await User.findById(submission.user._id);
      
      const activeQuestIndex = user.activeQuests.findIndex(
        q => q.quest.toString() === submission.quest._id.toString()
      );
      
      if (activeQuestIndex !== -1) {
        // Update progress
        const quest = submission.quest;
        const activeQuest = user.activeQuests[activeQuestIndex];
        
        if (quest.completionCriteria.type === 'boolean') {
          // For boolean quests, mark as complete
          activeQuest.progress = 1;
        } else if (quest.completionCriteria.type === 'count' || quest.completionCriteria.type === 'reps') {
          // For count/reps quests, increment by the detected count
          const detectedActivity = verificationResult.activities ? 
            verificationResult.activities.find(a => a.class === quest.aiVerificationCriteria.activity) : null;
          
          const incrementAmount = detectedActivity ? detectedActivity.count : 1;
          activeQuest.progress += incrementAmount;
        } else {
          // For other types, increment by 1
          activeQuest.progress += 1;
        }
        
        // Check if quest is complete
        if (activeQuest.progress >= quest.completionCriteria.target) {
          // Complete the quest
          user.completedQuests.push(quest._id);
          
          // Remove from active quests
          user.activeQuests.splice(activeQuestIndex, 1);
          
          // Add rewards
          const levelUpResult = user.addExperience(quest.rewards.experience);
          user.currency += quest.rewards.currency;
          user.statPoints += quest.rewards.statPoints;
          
          // Create transaction record
          await Transaction.createQuestReward(
            user._id,
            quest._id,
            quest.rewards
          );
          
          // Save user
          await user.save();
          
          return {
            success: true,
            message: 'Verification successful and quest completed',
            questCompleted: true,
            rewards: quest.rewards,
            levelUp: levelUpResult.leveledUp,
            newLevel: levelUpResult.newLevel,
            newRank: levelUpResult.newRank
          };
        } else {
          // Save user with updated progress
          await user.save();
          
          return {
            success: true,
            message: 'Verification successful and progress updated',
            questCompleted: false,
            progress: activeQuest.progress,
            target: quest.completionCriteria.target
          };
        }
      } else {
        return {
          success: true,
          message: 'Verification successful but quest not found in active quests',
          questCompleted: false
        };
      }
    } else {
      return {
        success: false,
        message: 'Verification failed: ' + verificationResult.message
      };
    }
  } catch (error) {
    console.error('AI verification error:', error);
    return {
      success: false,
      message: 'Error during verification: ' + error.message
    };
  }
};

module.exports = {
  verifySubmission,
  detectPoses,
  detectObjects,
  recognizeActivity,
  verifyLocation
};
