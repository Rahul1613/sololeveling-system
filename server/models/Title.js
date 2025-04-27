const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'default-title.png'
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
    default: 'common'
  },
  effects: [{
    stat: {
      type: String,
      enum: ['strength', 'agility', 'intelligence', 'vitality', 'endurance', 'luck', 'hp', 'mp', 'experience', 'currency'],
    },
    value: Number,
    isPercentage: {
      type: Boolean,
      default: false
    }
  }],
  requirements: {
    quests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    }],
    achievements: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    }],
    level: {
      type: Number,
      default: 0
    },
    stats: {
      strength: { type: Number, default: 0 },
      agility: { type: Number, default: 0 },
      intelligence: { type: Number, default: 0 },
      vitality: { type: Number, default: 0 },
      endurance: { type: Number, default: 0 },
      luck: { type: Number, default: 0 }
    },
    shadowCount: {
      type: Number,
      default: 0
    },
    itemsCollected: {
      type: Number,
      default: 0
    },
    specialCondition: {
      type: String,
      default: ''
    }
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if a user meets the requirements for this title
titleSchema.methods.checkRequirements = function(user) {
  // Check level requirement
  if (user.level < this.requirements.level) {
    return {
      meetsRequirements: false,
      reason: `Required level: ${this.requirements.level}`
    };
  }
  
  // Check stat requirements
  for (const [stat, value] of Object.entries(this.requirements.stats)) {
    if (value > 0 && user.stats[stat] < value) {
      return {
        meetsRequirements: false,
        reason: `Required ${stat}: ${value}`
      };
    }
  }
  
  // Check shadow count if required
  if (this.requirements.shadowCount > 0) {
    const shadowCount = user.shadows ? user.shadows.length : 0;
    if (shadowCount < this.requirements.shadowCount) {
      return {
        meetsRequirements: false,
        reason: `Required shadow count: ${this.requirements.shadowCount}`
      };
    }
  }
  
  // Check items collected if required
  if (this.requirements.itemsCollected > 0) {
    const itemCount = user.inventory ? user.inventory.items.length : 0;
    if (itemCount < this.requirements.itemsCollected) {
      return {
        meetsRequirements: false,
        reason: `Required items collected: ${this.requirements.itemsCollected}`
      };
    }
  }
  
  // Check quests completion if required
  if (this.requirements.quests && this.requirements.quests.length > 0) {
    const completedQuestIds = user.completedQuests.map(q => q.toString());
    const requiredQuestIds = this.requirements.quests.map(q => q.toString());
    
    const missingQuests = requiredQuestIds.filter(q => !completedQuestIds.includes(q));
    
    if (missingQuests.length > 0) {
      return {
        meetsRequirements: false,
        reason: `Missing required quests: ${missingQuests.length}`
      };
    }
  }
  
  // Check achievements if required
  if (this.requirements.achievements && this.requirements.achievements.length > 0) {
    const completedAchievementIds = user.achievements.map(a => a.toString());
    const requiredAchievementIds = this.requirements.achievements.map(a => a.toString());
    
    const missingAchievements = requiredAchievementIds.filter(a => !completedAchievementIds.includes(a));
    
    if (missingAchievements.length > 0) {
      return {
        meetsRequirements: false,
        reason: `Missing required achievements: ${missingAchievements.length}`
      };
    }
  }
  
  // If we got here, all requirements are met
  return {
    meetsRequirements: true
  };
};

// Calculate title power based on effects and rarity
titleSchema.methods.calculatePower = function() {
  let power = 0;
  
  // Base power from rarity
  const rarityMultiplier = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 5,
    legendary: 8,
    mythic: 12
  };
  
  power += rarityMultiplier[this.rarity] * 10;
  
  // Add power from effects
  this.effects.forEach(effect => {
    let effectValue = effect.value;
    if (effect.isPercentage) {
      effectValue = effectValue / 100 * 10; // Normalize percentage effects
    }
    power += effectValue;
  });
  
  return Math.round(power);
};

const Title = mongoose.model('Title', titleSchema);

module.exports = Title;
