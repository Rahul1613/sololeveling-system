const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'emergency', 'hidden', 'main', 'custom'],
    default: 'daily'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'extreme'],
    default: 'easy'
  },
  requirements: {
    type: String,
    required: true
  },
  rewards: {
    experience: {
      type: Number,
      required: true
    },
    currency: {
      type: Number,
      default: 0
    },
    items: [{
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      quantity: {
        type: Number,
        default: 1
      },
      dropRate: {
        type: Number,
        default: 100 // percentage
      }
    }],
    statPoints: {
      type: Number,
      default: 0
    }
  },
  penalties: {
    experience: {
      type: Number,
      default: 0
    },
    currency: {
      type: Number,
      default: 0
    }
  },
  timeLimit: {
    type: Number, // in hours
    default: 24
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiresProof: {
    type: Boolean,
    default: false
  },
  proofType: {
    type: String,
    enum: ['video', 'image', 'gps', 'none'],
    default: 'none'
  },
  verificationMethod: {
    type: String,
    enum: ['manual', 'ai', 'gps', 'none'],
    default: 'none'
  },
  aiVerificationType: {
    type: String,
    enum: ['pose', 'object', 'activity', 'none'],
    default: 'none'
  },
  aiVerificationCriteria: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  category: {
    type: String,
    enum: ['fitness', 'learning', 'productivity', 'social', 'other'],
    default: 'other'
  },
  completionCriteria: {
    type: {
      type: String,
      enum: ['time', 'count', 'boolean', 'reps'],
      default: 'boolean'
    },
    target: {
      type: Number,
      default: 1
    }
  },
  fitnessDetails: {
    exerciseType: {
      type: String,
      enum: ['cardio', 'strength', 'flexibility', 'balance', 'other', 'none'],
      default: 'none'
    },
    targetMuscleGroups: [{
      type: String,
      enum: ['arms', 'legs', 'chest', 'back', 'shoulders', 'core', 'full-body', 'none']
    }],
    duration: {
      type: Number, // in minutes
      default: 0
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high', 'none'],
      default: 'none'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

// Pre-save hook to set expiration date
questSchema.pre('save', function(next) {
  if (!this.expiresAt && this.timeLimit) {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + this.timeLimit);
    this.expiresAt = expirationDate;
  }
  next();
});

// Method to check if quest is expired
questSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Method to calculate rewards based on difficulty
questSchema.statics.calculateRewards = function(difficulty) {
  let rewards = {
    experience: 0,
    currency: 0,
    statPoints: 0
  };
  
  switch(difficulty) {
    case 'easy':
      rewards.experience = 50;
      rewards.currency = 10;
      break;
    case 'medium':
      rewards.experience = 100;
      rewards.currency = 25;
      break;
    case 'hard':
      rewards.experience = 200;
      rewards.currency = 50;
      rewards.statPoints = 1;
      break;
    case 'extreme':
      rewards.experience = 500;
      rewards.currency = 100;
      rewards.statPoints = 2;
      break;
    default:
      rewards.experience = 50;
      rewards.currency = 10;
  }
  
  return rewards;
};

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;
