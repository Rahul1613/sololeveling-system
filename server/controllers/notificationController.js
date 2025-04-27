const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationToUser } = require('../websocket');

// Get all notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ 
      user: userId,
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Get user notifications error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.countDocuments({ 
      user: userId,
      isRead: false,
      expiresAt: { $gt: new Date() }
    });
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.remove();
    
    return res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a system notification for a user
exports.createSystemNotification = async (req, res) => {
  try {
    // Check if user is admin (should be done via middleware)
    
    const { userId, title, message, type, style, voiceAnnouncement } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create notification
    const notification = await Notification.create({
      user: userId,
      type: type || 'system_message',
      title,
      message,
      style: style || 'info',
      voiceAnnouncement: {
        enabled: voiceAnnouncement || false,
        text: message
      }
    });
    
    // Send real-time notification
    sendNotificationToUser(userId, notification);
    
    return res.status(201).json({ 
      message: 'System notification created',
      notification
    });
  } catch (error) {
    console.error('Create system notification error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a broadcast notification for all users
exports.createBroadcastNotification = async (req, res) => {
  try {
    // Check if user is admin (should be done via middleware)
    
    const { title, message, type, style, voiceAnnouncement } = req.body;
    
    // Get all users
    const users = await User.find({}, '_id');
    
    // Create notifications for all users
    const notifications = [];
    
    for (const user of users) {
      const notification = await Notification.create({
        user: user._id,
        type: type || 'system_message',
        title,
        message,
        style: style || 'info',
        voiceAnnouncement: {
          enabled: voiceAnnouncement || false,
          text: message
        }
      });
      
      notifications.push(notification);
      
      // Send real-time notification
      sendNotificationToUser(user._id, notification);
    }
    
    return res.status(201).json({ 
      message: 'Broadcast notification created',
      count: notifications.length
    });
  } catch (error) {
    console.error('Create broadcast notification error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
