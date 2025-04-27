const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'quest_reward', 'achievement_reward', 'system_gift', 'penalty', 'skill_unlock', 'skill_levelup', 'title_unlock'],
    required: true
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
    price: {
      type: Number,
      default: 0
    }
  }],
  currency: {
    type: Number,
    default: 0
  },
  experience: {
    type: Number,
    default: 0
  },
  statPoints: {
    type: Number,
    default: 0
  },
  skillPoints: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  reference: {
    type: {
      type: String,
      enum: ['quest', 'achievement', 'item', 'penalty', 'skill', 'title']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    },
    name: {
      type: String
    },
    level: {
      type: Number
    },
    rarity: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to calculate total transaction value
transactionSchema.methods.calculateTotal = function() {
  let total = this.currency;
  
  this.items.forEach(item => {
    total += item.price * item.quantity;
  });
  
  return total;
};

// Static method to create a purchase transaction
transactionSchema.statics.createPurchase = async function(userId, items, description = 'Item purchase') {
  const transaction = new this({
    user: userId,
    type: 'purchase',
    items,
    description,
    status: 'pending',
    reference: {
      type: 'marketplace'
    }
  });
  
  return await transaction.save();
};

// Static method to create a quest reward transaction
transactionSchema.statics.createQuestReward = async function(userId, questId, rewards) {
  const transaction = new this({
    user: userId,
    type: 'quest_reward',
    items: rewards.items || [],
    currency: rewards.currency || 0,
    experience: rewards.experience || 0,
    statPoints: rewards.statPoints || 0,
    description: 'Quest reward',
    status: 'completed',
    reference: {
      type: 'quest',
      id: questId
    }
  });
  
  return await transaction.save();
};

// Static method to create an achievement reward transaction
transactionSchema.statics.createAchievementReward = async function(userId, achievementId, rewards) {
  const transaction = new this({
    user: userId,
    type: 'achievement_reward',
    items: rewards.items || [],
    currency: rewards.currency || 0,
    experience: rewards.experience || 0,
    statPoints: rewards.statPoints || 0,
    description: 'Achievement reward',
    status: 'completed',
    reference: {
      type: 'achievement',
      id: achievementId
    }
  });
  
  return await transaction.save();
};

// Static method to create a penalty transaction
transactionSchema.statics.createPenalty = async function(userId, reason, penalties) {
  const transaction = new this({
    user: userId,
    type: 'penalty',
    currency: penalties.currency || 0,
    experience: penalties.experience || 0,
    description: reason || 'System penalty',
    status: 'completed',
    reference: {
      type: 'penalty'
    }
  });
  
  return await transaction.save();
};

// Static method to create a skill unlock transaction
transactionSchema.statics.createSkillUnlockTransaction = async function(userId, skillName, skillPointCost) {
  try {
    const transaction = new this({
      user: userId,
      type: 'skill_unlock',
      skillPoints: -skillPointCost,
      description: `Unlocked skill: ${skillName}`,
      status: 'completed',
      reference: {
        type: 'skill',
        name: skillName
      }
    });
    
    return await transaction.save();
  } catch (error) {
    console.error('Error creating skill unlock transaction:', error);
    throw error;
  }
};

// Static method to create a skill level up transaction
transactionSchema.statics.createSkillLevelUpTransaction = async function(userId, skillName, newLevel, skillPointCost) {
  try {
    const transaction = new this({
      user: userId,
      type: 'skill_levelup',
      skillPoints: -skillPointCost,
      description: `Leveled up skill: ${skillName} to level ${newLevel}`,
      status: 'completed',
      reference: {
        type: 'skill',
        name: skillName,
        level: newLevel
      }
    });
    
    return await transaction.save();
  } catch (error) {
    console.error('Error creating skill level up transaction:', error);
    throw error;
  }
};

// Static method to create a title unlock transaction
transactionSchema.statics.createTitleUnlockTransaction = async function(userId, titleName, rarity) {
  try {
    const transaction = new this({
      user: userId,
      type: 'title_unlock',
      description: `Unlocked title: ${titleName}`,
      status: 'completed',
      reference: {
        type: 'title',
        name: titleName,
        rarity: rarity
      }
    });
    
    return await transaction.save();
  } catch (error) {
    console.error('Error creating title unlock transaction:', error);
    throw error;
  }
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
