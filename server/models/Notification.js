const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quest_completed', 'level_up', 'rank_up', 'achievement_unlocked', 'new_quest', 'item_acquired', 'shadow_leveled', 'penalty', 'system_message'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  soundEffect: {
    type: String,
    default: 'notification.mp3'
  },
  voiceAnnouncement: {
    enabled: {
      type: Boolean,
      default: false
    },
    text: String,
    audioUrl: String
  },
  style: {
    type: String,
    enum: ['success', 'warning', 'danger', 'info', 'quest', 'achievement', 'level', 'rank', 'shadow', 'item'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDisplayed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 7); // Expire after 7 days
      return date;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark notification as displayed
notificationSchema.methods.markAsDisplayed = function() {
  this.isDisplayed = true;
  return this.save();
};

// Static method to create level up notification
notificationSchema.statics.createLevelUpNotification = async function(userId, level, statPoints) {
  return this.create({
    user: userId,
    type: 'level_up',
    title: 'Level Up!',
    message: `Congratulations! You have reached level ${level}. You have ${statPoints} stat points to allocate.`,
    data: { level, statPoints },
    soundEffect: 'level_up.mp3',
    voiceAnnouncement: {
      enabled: true,
      text: `Level up! You have reached level ${level}.`,
    },
    style: 'level'
  });
};

// Static method to create quest completion notification
notificationSchema.statics.createQuestCompletionNotification = async function(userId, questTitle, rewards) {
  return this.create({
    user: userId,
    type: 'quest_completed',
    title: 'Quest Completed',
    message: `You have completed the quest: ${questTitle}`,
    data: { rewards },
    soundEffect: 'quest_complete.mp3',
    voiceAnnouncement: {
      enabled: true,
      text: `Quest completed: ${questTitle}.`,
    },
    style: 'quest'
  });
};

// Static method to create rank up notification
notificationSchema.statics.createRankUpNotification = async function(userId, newRank) {
  return this.create({
    user: userId,
    type: 'rank_up',
    title: 'Rank Increased!',
    message: `Congratulations! Your rank has increased to ${newRank}!`,
    data: { rank: newRank },
    soundEffect: 'rank_up.mp3',
    voiceAnnouncement: {
      enabled: true,
      text: `Rank up! You have reached rank ${newRank}.`,
    },
    style: 'rank'
  });
};

// Static method to create achievement notification
notificationSchema.statics.createAchievementNotification = async function(userId, achievementTitle, description) {
  return this.create({
    user: userId,
    type: 'achievement_unlocked',
    title: 'Achievement Unlocked',
    message: `You have unlocked the achievement: ${achievementTitle}`,
    data: { title: achievementTitle, description },
    soundEffect: 'achievement.mp3',
    voiceAnnouncement: {
      enabled: true,
      text: `Achievement unlocked: ${achievementTitle}.`,
    },
    style: 'achievement'
  });
};

// Static method to create new quest notification
notificationSchema.statics.createNewQuestNotification = async function(userId, questTitle, questType) {
  return this.create({
    user: userId,
    type: 'new_quest',
    title: 'New Quest Available',
    message: `A new ${questType} quest is available: ${questTitle}`,
    data: { title: questTitle, type: questType },
    soundEffect: 'new_quest.mp3',
    voiceAnnouncement: {
      enabled: true,
      text: `New ${questType} quest available: ${questTitle}.`,
    },
    style: 'quest'
  });
};

// Static method to create penalty notification
notificationSchema.statics.createPenaltyNotification = async function(userId, reason, penalties) {
  return this.create({
    user: userId,
    type: 'penalty',
    title: 'Penalty Applied',
    message: `You have received a penalty: ${reason}`,
    data: { reason, penalties },
    soundEffect: 'penalty.mp3',
    voiceAnnouncement: {
      enabled: true,
      text: `Penalty applied: ${reason}.`,
    },
    style: 'danger'
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
