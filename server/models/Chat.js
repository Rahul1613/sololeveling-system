const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'file', 'location', 'quest', 'item', 'achievement'],
      default: 'image'
    },
    url: String,
    name: String,
    size: Number,
    referenceId: mongoose.Schema.Types.ObjectId
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group', 'guild', 'global'],
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }],
  guild: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild'
  },
  messages: [chatMessageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to add a message to the chat
chatSchema.methods.addMessage = async function(senderId, content, attachments = []) {
  // Check if sender is a participant
  const isParticipant = this.participants.some(p => p.user.toString() === senderId.toString());
  
  if (!isParticipant && this.type !== 'global') {
    return {
      success: false,
      message: 'User is not a participant in this chat'
    };
  }
  
  // Create message
  const message = {
    sender: senderId,
    content,
    attachments,
    readBy: [{ user: senderId }],
    createdAt: new Date()
  };
  
  // Add message to chat
  this.messages.push(message);
  
  // Update last activity
  this.lastActivity = new Date();
  
  await this.save();
  
  return {
    success: true,
    message: 'Message sent successfully',
    chatMessage: message
  };
};

// Method to add a participant to the chat
chatSchema.methods.addParticipant = async function(userId, isAdmin = false) {
  // Check if user is already a participant
  const isParticipant = this.participants.some(p => p.user.toString() === userId.toString());
  
  if (isParticipant) {
    return {
      success: false,
      message: 'User is already a participant in this chat'
    };
  }
  
  // Add participant
  this.participants.push({
    user: userId,
    joinedAt: new Date(),
    isAdmin
  });
  
  await this.save();
  
  return {
    success: true,
    message: 'Participant added successfully'
  };
};

// Method to remove a participant from the chat
chatSchema.methods.removeParticipant = async function(userId) {
  // Check if user is a participant
  const participantIndex = this.participants.findIndex(p => p.user.toString() === userId.toString());
  
  if (participantIndex === -1) {
    return {
      success: false,
      message: 'User is not a participant in this chat'
    };
  }
  
  // Remove participant
  this.participants.splice(participantIndex, 1);
  
  await this.save();
  
  return {
    success: true,
    message: 'Participant removed successfully'
  };
};

// Method to mark messages as read for a user
chatSchema.methods.markAsRead = async function(userId) {
  // Check if user is a participant
  const isParticipant = this.participants.some(p => p.user.toString() === userId.toString());
  
  if (!isParticipant && this.type !== 'global') {
    return {
      success: false,
      message: 'User is not a participant in this chat'
    };
  }
  
  // Mark unread messages as read
  let unreadCount = 0;
  
  this.messages.forEach(message => {
    const hasRead = message.readBy.some(r => r.user.toString() === userId.toString());
    
    if (!hasRead) {
      message.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      unreadCount++;
    }
  });
  
  await this.save();
  
  return {
    success: true,
    message: `Marked ${unreadCount} messages as read`,
    unreadCount
  };
};

// Method to get unread messages count for a user
chatSchema.methods.getUnreadCount = function(userId) {
  let unreadCount = 0;
  
  this.messages.forEach(message => {
    const hasRead = message.readBy.some(r => r.user.toString() === userId.toString());
    
    if (!hasRead) {
      unreadCount++;
    }
  });
  
  return unreadCount;
};

// Static method to create a direct chat between two users
chatSchema.statics.createDirectChat = async function(user1Id, user2Id) {
  // Check if a direct chat already exists between these users
  const existingChat = await this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] }
  });
  
  if (existingChat) {
    return existingChat;
  }
  
  // Create new direct chat
  const newChat = new this({
    type: 'direct',
    participants: [
      { user: user1Id, isAdmin: false },
      { user: user2Id, isAdmin: false }
    ]
  });
  
  await newChat.save();
  
  return newChat;
};

// Static method to create a guild chat
chatSchema.statics.createGuildChat = async function(guildId, guildName, leaderId) {
  // Create new guild chat
  const newChat = new this({
    type: 'guild',
    name: guildName,
    guild: guildId,
    participants: [
      { user: leaderId, isAdmin: true }
    ]
  });
  
  await newChat.save();
  
  return newChat;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
