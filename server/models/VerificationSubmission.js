const mongoose = require('mongoose');

const verificationSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true
  },
  submissionType: {
    type: String,
    enum: ['video', 'image', 'gps'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: function() {
      return this.submissionType === 'video' || this.submissionType === 'image';
    }
  },
  gpsData: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  aiVerificationResult: {
    success: Boolean,
    confidence: Number,
    detectedObjects: [String],
    detectedActivities: [String],
    poseData: mongoose.Schema.Types.Mixed,
    feedback: String
  },
  manualVerification: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to verify submission using AI
verificationSubmissionSchema.methods.verifyWithAI = async function(aiResult) {
  this.aiVerificationResult = {
    ...aiResult
  };
  
  if (aiResult.success) {
    this.verificationStatus = 'verified';
  } else {
    this.verificationStatus = 'rejected';
  }
  
  return this.save();
};

// Method to manually verify submission
verificationSubmissionSchema.methods.manualVerify = async function(userId, isVerified, notes = '') {
  this.manualVerification = {
    verifiedBy: userId,
    verifiedAt: new Date(),
    notes
  };
  
  this.verificationStatus = isVerified ? 'verified' : 'rejected';
  
  return this.save();
};

const VerificationSubmission = mongoose.model('VerificationSubmission', verificationSubmissionSchema);

module.exports = VerificationSubmission;
