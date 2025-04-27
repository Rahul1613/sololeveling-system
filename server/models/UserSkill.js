const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  isEquipped: {
    type: Boolean,
    default: false
  },
  equipSlot: {
    type: Number,
    default: -1 // -1 means not equipped
  },
  lastUsed: {
    type: Date,
    default: null
  },
  cooldownEnds: {
    type: Date,
    default: null
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if skill is on cooldown
userSkillSchema.methods.isOnCooldown = function() {
  if (!this.cooldownEnds) return false;
  return new Date() < this.cooldownEnds;
};

// Method to calculate cooldown remaining in seconds
userSkillSchema.methods.cooldownRemaining = function() {
  if (!this.isOnCooldown()) return 0;
  
  const now = new Date();
  const diff = this.cooldownEnds - now;
  return Math.ceil(diff / 1000); // Convert ms to seconds
};

// Method to use skill and set cooldown
userSkillSchema.methods.useSkill = async function(skillData) {
  if (this.isOnCooldown()) {
    return {
      success: false,
      message: `Skill is on cooldown for ${this.cooldownRemaining()} seconds`,
      cooldownRemaining: this.cooldownRemaining()
    };
  }
  
  // Set cooldown if skill has one
  if (skillData.cooldown > 0) {
    const cooldownEnd = new Date();
    cooldownEnd.setSeconds(cooldownEnd.getSeconds() + skillData.cooldown);
    this.cooldownEnds = cooldownEnd;
  }
  
  this.lastUsed = new Date();
  await this.save();
  
  return {
    success: true,
    message: 'Skill used successfully'
  };
};

// Method to add experience and level up skill
userSkillSchema.methods.addExperience = async function(amount, skillData) {
  this.experience += amount;
  
  let leveledUp = false;
  let oldLevel = this.level;
  
  // Check if skill can level up
  while (this.experience >= this.experienceToNextLevel && this.level < skillData.maxLevel) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    leveledUp = true;
    
    // Recalculate experience needed for next level (increases with each level)
    this.experienceToNextLevel = Math.floor(100 * Math.pow(1.5, this.level - 1));
  }
  
  // Cap experience if at max level
  if (this.level >= skillData.maxLevel) {
    this.experience = 0;
    this.experienceToNextLevel = 0;
  }
  
  await this.save();
  
  return {
    leveledUp,
    oldLevel,
    newLevel: this.level
  };
};

const UserSkill = mongoose.model('UserSkill', userSkillSchema);

module.exports = UserSkill;
