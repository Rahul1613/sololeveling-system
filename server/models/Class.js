const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
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
    default: 'default-class.png'
  },
  tier: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // Tier 1 is basic, Tier 5 is highest
    default: 1
  },
  baseStats: {
    strength: { type: Number, default: 0 },
    agility: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    vitality: { type: Number, default: 0 },
    endurance: { type: Number, default: 0 },
    luck: { type: Number, default: 0 }
  },
  statGrowth: {
    strength: { type: Number, default: 1 },
    agility: { type: Number, default: 1 },
    intelligence: { type: Number, default: 1 },
    vitality: { type: Number, default: 1 },
    endurance: { type: Number, default: 1 },
    luck: { type: Number, default: 1 }
  },
  skills: [{
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    levelRequirement: {
      type: Number,
      default: 1
    }
  }],
  passives: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    effect: {
      stat: {
        type: String,
        enum: ['strength', 'agility', 'intelligence', 'vitality', 'endurance', 'luck', 'hp', 'mp', 'experience', 'currency', 'damage', 'defense', 'critical', 'evasion', 'accuracy', 'cooldown', 'range', 'area', 'duration', 'mana_cost', 'hp_regen', 'mp_regen']
      },
      value: Number,
      isPercentage: {
        type: Boolean,
        default: false
      },
      levelRequirement: {
        type: Number,
        default: 1
      }
    }
  }],
  requirements: {
    level: {
      type: Number,
      default: 1
    },
    stats: {
      strength: { type: Number, default: 0 },
      agility: { type: Number, default: 0 },
      intelligence: { type: Number, default: 0 },
      vitality: { type: Number, default: 0 },
      endurance: { type: Number, default: 0 },
      luck: { type: Number, default: 0 }
    },
    quests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    }],
    achievements: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    }],
    titles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Title'
    }],
    previousClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null
    },
    previousClassLevel: {
      type: Number,
      default: 0
    }
  },
  maxLevel: {
    type: Number,
    default: 100
  },
  advancementOptions: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    levelRequirement: {
      type: Number,
      default: 50
    }
  }],
  specialAbilities: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    levelRequirement: {
      type: Number,
      default: 10
    },
    cooldown: {
      type: Number, // in hours
      default: 24
    }
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if a user meets the requirements for this class
classSchema.methods.checkRequirements = function(user) {
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
  
  // Check previous class requirement
  if (this.requirements.previousClass) {
    if (user.class !== this.requirements.previousClass.toString()) {
      return {
        meetsRequirements: false,
        reason: 'Required previous class not met'
      };
    }
    
    if (user.classLevel < this.requirements.previousClassLevel) {
      return {
        meetsRequirements: false,
        reason: `Required previous class level: ${this.requirements.previousClassLevel}`
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
  
  // Check titles if required
  if (this.requirements.titles && this.requirements.titles.length > 0) {
    const userTitleIds = user.titles.map(t => t.title.toString());
    const requiredTitleIds = this.requirements.titles.map(t => t.toString());
    
    const missingTitles = requiredTitleIds.filter(t => !userTitleIds.includes(t));
    
    if (missingTitles.length > 0) {
      return {
        meetsRequirements: false,
        reason: `Missing required titles: ${missingTitles.length}`
      };
    }
  }
  
  // If we got here, all requirements are met
  return {
    meetsRequirements: true
  };
};

// Method to get available skills for a given class level
classSchema.methods.getAvailableSkills = function(classLevel) {
  return this.skills.filter(skill => skill.levelRequirement <= classLevel);
};

// Method to get available passives for a given class level
classSchema.methods.getAvailablePassives = function(classLevel) {
  return this.passives.filter(passive => passive.effect.levelRequirement <= classLevel);
};

// Method to get available special abilities for a given class level
classSchema.methods.getAvailableSpecialAbilities = function(classLevel) {
  return this.specialAbilities.filter(ability => ability.levelRequirement <= classLevel);
};

// Method to check if class advancement is available
classSchema.methods.canAdvance = function(classLevel) {
  if (!this.advancementOptions || this.advancementOptions.length === 0) {
    return {
      canAdvance: false,
      reason: 'No advancement options available for this class'
    };
  }
  
  const availableAdvancements = this.advancementOptions.filter(
    option => option.levelRequirement <= classLevel
  );
  
  if (availableAdvancements.length === 0) {
    return {
      canAdvance: false,
      reason: `Class level too low. Minimum required: ${Math.min(...this.advancementOptions.map(o => o.levelRequirement))}`
    };
  }
  
  return {
    canAdvance: true,
    availableAdvancements
  };
};

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
