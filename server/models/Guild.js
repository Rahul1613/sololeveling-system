const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: 'default-guild.png'
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  officers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    contribution: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ['Member', 'Officer', 'Leader'],
      default: 'Member'
    }
  }],
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
    default: 1000
  },
  currency: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  maxMembers: {
    type: Number,
    default: 20
  },
  achievements: [{
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
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
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      contribution: {
        type: Number,
        default: 0
      }
    }]
  }],
  completedQuests: [{
    quest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  announcements: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: true
    },
    minLevelToJoin: {
      type: Number,
      default: 1
    }
  },
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      default: ''
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to add a member to the guild
guildSchema.methods.addMember = function(userId, role = 'Member') {
  // Check if user is already a member
  const isMember = this.members.some(member => member.user.toString() === userId.toString());
  
  if (isMember) {
    return {
      success: false,
      message: 'User is already a member of this guild'
    };
  }
  
  // Check if guild is full
  if (this.members.length >= this.maxMembers) {
    return {
      success: false,
      message: 'Guild has reached maximum member capacity'
    };
  }
  
  // Add member
  this.members.push({
    user: userId,
    joinedAt: new Date(),
    contribution: 0,
    role
  });
  
  // If the role is Officer, add to officers array
  if (role === 'Officer') {
    this.officers.push(userId);
  }
  
  // Remove from pending requests if exists
  const requestIndex = this.pendingRequests.findIndex(req => req.user.toString() === userId.toString());
  if (requestIndex > -1) {
    this.pendingRequests.splice(requestIndex, 1);
  }
  
  return {
    success: true,
    message: 'Member added successfully'
  };
};

// Method to remove a member from the guild
guildSchema.methods.removeMember = function(userId) {
  // Check if user is a member
  const memberIndex = this.members.findIndex(member => member.user.toString() === userId.toString());
  
  if (memberIndex === -1) {
    return {
      success: false,
      message: 'User is not a member of this guild'
    };
  }
  
  // Check if user is the leader
  if (this.leader.toString() === userId.toString()) {
    return {
      success: false,
      message: 'Guild leader cannot be removed. Transfer leadership first.'
    };
  }
  
  // Remove from officers if applicable
  const officerIndex = this.officers.findIndex(officer => officer.toString() === userId.toString());
  if (officerIndex > -1) {
    this.officers.splice(officerIndex, 1);
  }
  
  // Remove member
  this.members.splice(memberIndex, 1);
  
  return {
    success: true,
    message: 'Member removed successfully'
  };
};

// Method to transfer leadership
guildSchema.methods.transferLeadership = function(newLeaderId) {
  // Check if new leader is a member
  const isMember = this.members.some(member => member.user.toString() === newLeaderId.toString());
  
  if (!isMember) {
    return {
      success: false,
      message: 'New leader must be a guild member'
    };
  }
  
  // Update old leader's role
  const oldLeaderId = this.leader;
  const oldLeaderIndex = this.members.findIndex(member => member.user.toString() === oldLeaderId.toString());
  
  if (oldLeaderIndex > -1) {
    this.members[oldLeaderIndex].role = 'Member';
  }
  
  // Update new leader's role
  const newLeaderIndex = this.members.findIndex(member => member.user.toString() === newLeaderId.toString());
  this.members[newLeaderIndex].role = 'Leader';
  
  // Update leader
  this.leader = newLeaderId;
  
  // Add to officers if not already
  const isOfficer = this.officers.some(officer => officer.toString() === newLeaderId.toString());
  if (!isOfficer) {
    this.officers.push(newLeaderId);
  }
  
  return {
    success: true,
    message: 'Leadership transferred successfully'
  };
};

// Method to add experience and handle level ups
guildSchema.methods.addExperience = function(amount) {
  this.experience += amount;
  
  let leveledUp = false;
  let oldLevel = this.level;
  
  while (this.experience >= this.experienceToNextLevel) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    leveledUp = true;
    
    // Increase max members with level
    this.maxMembers = 20 + (this.level - 1) * 5;
    
    // Recalculate experience needed for next level
    this.experienceToNextLevel = Math.floor(1000 * Math.pow(1.5, this.level - 1));
  }
  
  return {
    leveledUp,
    oldLevel,
    newLevel: this.level
  };
};

// Method to add a guild quest
guildSchema.methods.addQuest = function(questId, deadline) {
  // Check if quest is already active
  const isActive = this.activeQuests.some(q => q.quest.toString() === questId.toString());
  
  if (isActive) {
    return {
      success: false,
      message: 'Quest is already active'
    };
  }
  
  // Add quest
  this.activeQuests.push({
    quest: questId,
    progress: 0,
    startedAt: new Date(),
    deadline: deadline || null,
    participants: []
  });
  
  return {
    success: true,
    message: 'Quest added successfully'
  };
};

// Method to complete a guild quest
guildSchema.methods.completeQuest = function(questId) {
  // Find the quest
  const questIndex = this.activeQuests.findIndex(q => q.quest.toString() === questId.toString());
  
  if (questIndex === -1) {
    return {
      success: false,
      message: 'Quest not found in active quests'
    };
  }
  
  // Move to completed quests
  const completedQuest = {
    quest: this.activeQuests[questIndex].quest,
    completedAt: new Date()
  };
  
  this.completedQuests.push(completedQuest);
  
  // Remove from active quests
  this.activeQuests.splice(questIndex, 1);
  
  return {
    success: true,
    message: 'Quest completed successfully'
  };
};

const Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
