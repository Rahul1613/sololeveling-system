const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Get unread notifications count
router.get('/unread/count', authMiddleware, notificationController.getUnreadCount);

// Mark notification as read
router.post('/:notificationId/read', authMiddleware, notificationController.markAsRead);

// Mark all notifications as read
router.post('/read-all', authMiddleware, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

// Admin routes
router.post('/system', authMiddleware, notificationController.createSystemNotification);
router.post('/broadcast', authMiddleware, notificationController.createBroadcastNotification);

module.exports = router;
