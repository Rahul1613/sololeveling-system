const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
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
    enum: ['active', 'passive', 'ultimate'],
    default: 'active'
  },
  icon: {
    type: String,
    default: 'default-skill.png'
  },
  effects: [{
    stat: {
      type: String,
      enum: ['strength', 'agility', 'intelligence', 'vitality', 'endurance', 'luck', 'hp', 'mp', 'damage', 'defense', 'speed'],
    },
    value: Number,
    isPercentage: {
      type: Boolean,
      default: false
    }
  }],
  requirements: {
    level: {
      type: Number,
      default: 1
    },
    rank: {
      type: String,
      enum: ['E', 'D', 'C', 'B', 'A', 'S'],
      default: 'E'
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
    }]
  },
  cooldown: {
    type: Number, // in seconds
    default: 0
  },
  mpCost: {
    type: Number,
    default: 0
  },
  maxLevel: {
    type: Number,
    default: 10
  },
  isUnlockable: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  unlockCondition: {
    type: String,
    default: ''
  },
  rankLocked: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate skill power based on effects and level
skillSchema.methods.calculatePower = function(level = 1) {
  let power = 0;
  
  // Base power from level
  power += level * 10;
  
  // Add power from effects
  this.effects.forEach(effect => {
    let effectValue = effect.value * level;
    if (effect.isPercentage) {
      effectValue = effectValue / 100 * 10; // Normalize percentage effects
    }
    power += effectValue;
  });
  
  return Math.round(power);
};

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
