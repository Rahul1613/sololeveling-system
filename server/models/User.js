const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  rank: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E'
  },
  stats: {
    strength: { type: Number, default: 10 },
    agility: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    vitality: { type: Number, default: 10 },
    endurance: { type: Number, default: 10 },
    luck: { type: Number, default: 10 }
  },
  hp: {
    current: { type: Number, default: 100 },
    max: { type: Number, default: 100 }
  },
  mp: {
    current: { type: Number, default: 50 },
    max: { type: Number, default: 50 }
  },
  currency: {
    type: Number,
    default: 100
  },
  statPoints: {
    type: Number,
    default: 0
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSkill'
  }],
  equippedSkills: {
    slot1: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    slot2: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    slot3: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    slot4: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    passive1: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    passive2: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    ultimate: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null }
  },
  titles: [{
    title: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Title'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    isEquipped: {
      type: Boolean,
      default: false
    }
  }],
  equippedTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Title',
    default: null
  },
  class: {
    type: String,
    enum: ['None', 'Shadow Monarch', 'Mage', 'Tank', 'Assassin', 'Healer', 'Archer'],
    default: 'None'
  },
  classLevel: {
    type: Number,
    default: 0
  },
  dungeonKeys: [{
    key: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DungeonKey'
    },
    obtainedAt: {
      type: Date,
      default: Date.now
    }
  }],
  guild: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild',
    default: null
  },
  guildRole: {
    type: String,
    enum: ['Member', 'Officer', 'Leader', 'None'],
    default: 'None'
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  completedQuests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  }],
  activeQuests: [{
    quest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    },
    progress: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date
    }
  }],
  penalties: [{
    reason: String,
    amount: Number,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  penaltyZone: {
    isActive: { type: Boolean, default: false },
    startedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // in minutes
    reason: { type: String, default: '' },
    questToComplete: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', default: null }
  },
  settings: {
    notifications: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true },
    voiceAnnouncements: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    privacyLevel: { type: String, enum: ['public', 'friends', 'private'], default: 'public' }
  },
  twoFactorAuth: {
    isEnabled: { type: Boolean, default: false },
    secret: { type: String, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate experience needed for next level
userSchema.methods.calculateExperienceForLevel = function(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Method to add experience and handle level ups
userSchema.methods.addExperience = function(amount) {
  this.experience += amount;
  
  while (this.experience >= this.experienceToNextLevel) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    this.statPoints += 5;
    
    // Recalculate experience needed for next level
    this.experienceToNextLevel = this.calculateExperienceForLevel(this.level);
    
    // Update HP and MP based on level
    this.hp.max = 100 + (this.level - 1) * 10 + this.stats.vitality * 5;
    this.hp.current = this.hp.max;
    
    this.mp.max = 50 + (this.level - 1) * 5 + this.stats.intelligence * 2;
    this.mp.current = this.mp.max;
    
    // Update rank based on level
    if (this.level >= 50) this.rank = 'S';
    else if (this.level >= 40) this.rank = 'A';
    else if (this.level >= 30) this.rank = 'B';
    else if (this.level >= 20) this.rank = 'C';
    else if (this.level >= 10) this.rank = 'D';
    else this.rank = 'E';
  }
  
  return {
    leveledUp: this.level > 1,
    newLevel: this.level,
    newRank: this.rank
  };
};

// Method to activate penalty zone
userSchema.methods.activatePenaltyZone = function(duration, reason, questId = null) {
  this.penaltyZone = {
    isActive: true,
    startedAt: new Date(),
    duration: duration,
    reason: reason,
    questToComplete: questId
  };
  
  return this.save();
};

// Method to check if penalty zone is active
userSchema.methods.isPenaltyZoneActive = function() {
  if (!this.penaltyZone.isActive) return false;
  
  const now = new Date();
  const endTime = new Date(this.penaltyZone.startedAt);
  endTime.setMinutes(endTime.getMinutes() + this.penaltyZone.duration);
  
  return now < endTime;
};

// Method to complete penalty zone
userSchema.methods.completePenaltyZone = function() {
  this.penaltyZone.isActive = false;
  return this.save();
};

// Method to equip a title
userSchema.methods.equipTitle = function(titleId) {
  // First unequip any currently equipped title
  if (this.titles.length > 0) {
    this.titles.forEach(title => {
      if (title.isEquipped) {
        title.isEquipped = false;
      }
    });
  }
  
  // Now equip the new title
  const titleIndex = this.titles.findIndex(t => t.title.toString() === titleId.toString());
  
  if (titleIndex === -1) {
    return {
      success: false,
      message: 'Title not found'
    };
  }
  
  this.titles[titleIndex].isEquipped = true;
  this.equippedTitle = titleId;
  
  return {
    success: true,
    message: 'Title equipped successfully'
  };
};

// Method to equip a skill
userSchema.methods.equipSkill = function(skillId, slot) {
  // Validate slot
  const validSlots = ['slot1', 'slot2', 'slot3', 'slot4', 'passive1', 'passive2', 'ultimate'];
  if (!validSlots.includes(slot)) {
    return {
      success: false,
      message: 'Invalid skill slot'
    };
  }
  
  // Check if user has the skill
  const hasSkill = this.skills.some(s => s.toString() === skillId.toString());
  if (!hasSkill) {
    return {
      success: false,
      message: 'Skill not found in your list of skills'
    };
  }
  
  // Equip the skill
  this.equippedSkills[slot] = skillId;
  
  return {
    success: true,
    message: `Skill equipped in ${slot}`
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
