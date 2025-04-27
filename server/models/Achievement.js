const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['leveling', 'quests', 'shadows', 'items', 'stats', 'special'],
    default: 'leveling'
  },
  icon: {
    type: String,
    default: 'default-achievement.png'
  },
  requirements: {
    type: {
      type: String,
      enum: ['level', 'quests_completed', 'shadows_collected', 'items_collected', 'stat_value', 'special'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    additionalParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  rewards: {
    experience: {
      type: Number,
      default: 0
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
      }
    }],
    statPoints: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: null
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isRepeatable: {
    type: Boolean,
    default: false
  },
  cooldown: {
    type: Number, // in hours
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if a user meets the achievement requirements
achievementSchema.methods.checkRequirements = function(user) {
  switch (this.requirements.type) {
    case 'level':
      return user.level >= this.requirements.value;
      
    case 'quests_completed':
      return user.completedQuests.length >= this.requirements.value;
      
    case 'shadows_collected':
      // This would require querying the Shadow model
      return false;
      
    case 'items_collected':
      // This would require querying the Inventory model
      return false;
      
    case 'stat_value':
      const statName = this.requirements.additionalParams.statName;
      if (!statName || !user.stats[statName]) return false;
      return user.stats[statName] >= this.requirements.value;
      
    case 'special':
      // Special achievements would have custom logic
      return false;
      
    default:
      return false;
  }
};

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
