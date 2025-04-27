const mongoose = require('mongoose');

const shadowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['soldier', 'knight', 'mage', 'archer', 'assassin', 'tank', 'healer', 'boss'],
    default: 'soldier'
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  rank: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E'
  },
  experience: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  image: {
    type: String,
    default: 'default-shadow.png'
  },
  stats: {
    strength: { type: Number, default: 10 },
    agility: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    vitality: { type: Number, default: 10 },
    endurance: { type: Number, default: 10 }
  },
  hp: {
    current: { type: Number, default: 100 },
    max: { type: Number, default: 100 }
  },
  mp: {
    current: { type: Number, default: 50 },
    max: { type: Number, default: 50 }
  },
  abilities: [{
    name: { type: String },
    description: { type: String },
    damage: { type: Number, default: 0 },
    mpCost: { type: Number, default: 0 },
    cooldown: { type: Number, default: 0 }, // in seconds
    unlockLevel: { type: Number, default: 1 }
  }],
  equipment: {
    weapon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    armor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    accessory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeployed: {
    type: Boolean,
    default: false
  },
  deployedUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to update stats based on level and rank
shadowSchema.pre('save', function(next) {
  // Calculate base stats based on level and type
  const levelMultiplier = 1 + (this.level - 1) * 0.1;
  
  const typeBaseStats = {
    soldier: { strength: 12, agility: 10, intelligence: 8, vitality: 10, endurance: 10 },
    knight: { strength: 15, agility: 8, intelligence: 7, vitality: 12, endurance: 15 },
    mage: { strength: 5, agility: 8, intelligence: 18, vitality: 7, endurance: 7 },
    archer: { strength: 8, agility: 15, intelligence: 10, vitality: 8, endurance: 9 },
    assassin: { strength: 10, agility: 18, intelligence: 10, vitality: 7, endurance: 8 },
    tank: { strength: 12, agility: 5, intelligence: 7, vitality: 18, endurance: 18 },
    healer: { strength: 5, agility: 8, intelligence: 15, vitality: 10, endurance: 8 },
    boss: { strength: 20, agility: 15, intelligence: 15, vitality: 20, endurance: 20 }
  };
  
  // Rank multiplier
  const rankMultiplier = {
    'E': 1,
    'D': 1.2,
    'C': 1.5,
    'B': 2,
    'A': 3,
    'S': 5
  };
  
  // Apply multipliers to base stats
  const baseStats = typeBaseStats[this.type];
  Object.keys(baseStats).forEach(stat => {
    this.stats[stat] = Math.floor(baseStats[stat] * levelMultiplier * rankMultiplier[this.rank]);
  });
  
  // Update HP and MP based on stats
  this.hp.max = 100 + (this.level - 1) * 10 + this.stats.vitality * 5;
  this.mp.max = 50 + (this.level - 1) * 5 + this.stats.intelligence * 2;
  
  next();
});

// Method to add experience and handle level ups
shadowSchema.methods.addExperience = function(amount) {
  this.experience += amount;
  
  let leveledUp = false;
  let oldLevel = this.level;
  
  while (this.experience >= this.experienceToNextLevel) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    leveledUp = true;
    
    // Recalculate experience needed for next level
    this.experienceToNextLevel = Math.floor(100 * Math.pow(1.5, this.level - 1));
  }
  
  if (leveledUp) {
    // Update rank based on level
    if (this.level >= 50) this.rank = 'S';
    else if (this.level >= 40) this.rank = 'A';
    else if (this.level >= 30) this.rank = 'B';
    else if (this.level >= 20) this.rank = 'C';
    else if (this.level >= 10) this.rank = 'D';
    else this.rank = 'E';
    
    // Restore HP and MP on level up
    this.hp.current = this.hp.max;
    this.mp.current = this.mp.max;
  }
  
  return {
    leveledUp,
    oldLevel,
    newLevel: this.level,
    newRank: this.rank
  };
};

// Calculate shadow power level
shadowSchema.methods.calculatePower = function() {
  const statSum = Object.values(this.stats).reduce((sum, stat) => sum + stat, 0);
  const equipmentBonus = 0; // This would be calculated based on equipped items
  
  const rankMultiplier = {
    'E': 1,
    'D': 1.5,
    'C': 2,
    'B': 3,
    'A': 5,
    'S': 10
  };
  
  return Math.floor((statSum + equipmentBonus) * rankMultiplier[this.rank]);
};

const Shadow = mongoose.model('Shadow', shadowSchema);

module.exports = Shadow;
