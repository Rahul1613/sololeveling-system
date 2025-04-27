const mongoose = require('mongoose');

const dungeonKeySchema = new mongoose.Schema({
  name: {
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
    enum: ['normal', 'rare', 'epic', 'legendary', 'mythic', 'special'],
    default: 'normal'
  },
  icon: {
    type: String,
    default: 'default-key.png'
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  dungeonType: {
    type: String,
    enum: ['monster', 'boss', 'treasure', 'puzzle', 'training', 'special'],
    default: 'monster'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'extreme', 'nightmare'],
    default: 'easy'
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
    },
    skills: [{
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
      },
      dropRate: {
        type: Number,
        default: 10 // percentage
      }
    }],
    titles: [{
      title: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Title'
      },
      dropRate: {
        type: Number,
        default: 5 // percentage
      }
    }],
    shadows: [{
      type: {
        type: String,
        enum: ['soldier', 'knight', 'mage', 'archer', 'assassin', 'tank', 'healer', 'boss'],
      },
      level: {
        type: Number,
        default: 1
      },
      rank: {
        type: String,
        enum: ['E', 'D', 'C', 'B', 'A', 'S'],
        default: 'E'
      },
      dropRate: {
        type: Number,
        default: 20 // percentage
      }
    }]
  },
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
    class: {
      type: String,
      default: ''
    }
  },
  timeLimit: {
    type: Number, // in minutes
    default: 60
  },
  cooldown: {
    type: Number, // in hours
    default: 24
  },
  isConsumable: {
    type: Boolean,
    default: true
  },
  isLimited: {
    type: Boolean,
    default: false
  },
  limitedUses: {
    type: Number,
    default: 1
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

// Method to check if a user meets the requirements for this dungeon key
dungeonKeySchema.methods.checkRequirements = function(user) {
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
  
  // Check class requirement if any
  if (this.requirements.class && this.requirements.class !== '' && user.class !== this.requirements.class) {
    return {
      meetsRequirements: false,
      reason: `Required class: ${this.requirements.class}`
    };
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
  
  // If we got here, all requirements are met
  return {
    meetsRequirements: true
  };
};

// Static method to generate a random dungeon key
dungeonKeySchema.statics.generateRandomKey = async function(userLevel) {
  // Determine key type based on user level and random chance
  let keyType = 'normal';
  const typeChance = Math.random() * 100;
  
  if (userLevel >= 50 && typeChance < 5) {
    keyType = 'mythic';
  } else if (userLevel >= 40 && typeChance < 10) {
    keyType = 'legendary';
  } else if (userLevel >= 30 && typeChance < 20) {
    keyType = 'epic';
  } else if (userLevel >= 20 && typeChance < 35) {
    keyType = 'rare';
  } else if (userLevel >= 10 && typeChance < 60) {
    keyType = 'normal';
  }
  
  // Determine dungeon type
  const dungeonTypes = ['monster', 'boss', 'treasure', 'puzzle', 'training'];
  const dungeonTypeIndex = Math.floor(Math.random() * dungeonTypes.length);
  const dungeonType = dungeonTypes[dungeonTypeIndex];
  
  // Determine difficulty based on user level
  let difficulty = 'easy';
  if (userLevel >= 50) {
    difficulty = 'nightmare';
  } else if (userLevel >= 40) {
    difficulty = 'extreme';
  } else if (userLevel >= 30) {
    difficulty = 'hard';
  } else if (userLevel >= 20) {
    difficulty = 'medium';
  }
  
  // Calculate rewards based on key type and difficulty
  const experienceReward = 100 * Math.pow(1.5, userLevel / 10) * (dungeonType === 'boss' ? 2 : 1);
  const currencyReward = 50 * Math.pow(1.3, userLevel / 10) * (dungeonType === 'treasure' ? 3 : 1);
  const statPointsReward = Math.floor(userLevel / 10) + (keyType === 'mythic' ? 5 : keyType === 'legendary' ? 3 : keyType === 'epic' ? 2 : keyType === 'rare' ? 1 : 0);
  
  // Create the key
  const key = new this({
    name: `${keyType.charAt(0).toUpperCase() + keyType.slice(1)} ${dungeonType.charAt(0).toUpperCase() + dungeonType.slice(1)} Key`,
    description: `A ${keyType} key that unlocks a ${difficulty} ${dungeonType} dungeon.`,
    type: keyType,
    dungeonType: dungeonType,
    difficulty: difficulty,
    level: Math.max(1, userLevel - 5 + Math.floor(Math.random() * 10)),
    rewards: {
      experience: Math.round(experienceReward),
      currency: Math.round(currencyReward),
      statPoints: statPointsReward
    },
    requirements: {
      level: Math.max(1, userLevel - 5)
    },
    timeLimit: 30 + (dungeonType === 'boss' ? 30 : 0) + (difficulty === 'nightmare' ? 60 : difficulty === 'extreme' ? 45 : difficulty === 'hard' ? 30 : difficulty === 'medium' ? 15 : 0),
    cooldown: 24 - (keyType === 'mythic' ? 12 : keyType === 'legendary' ? 8 : keyType === 'epic' ? 4 : keyType === 'rare' ? 2 : 0)
  });
  
  return key;
};

const DungeonKey = mongoose.model('DungeonKey', dungeonKeySchema);

module.exports = DungeonKey;
