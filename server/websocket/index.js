const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Store active connections with additional metadata
const activeConnections = new Map();

// Track connection statistics
const stats = {
  totalConnections: 0,
  activeConnections: 0,
  authFailures: 0,
  messagesSent: 0,
  messagesReceived: 0,
  errors: 0
};

// Ping interval in milliseconds (15 seconds)
const PING_INTERVAL = 15000;

// Initialize WebSocket server
const initializeWebSocketServer = (server) => {
  try {
    console.log('Initializing WebSocket server...');
    
    const wss = new WebSocket.Server({ 
      server,
      // Add a verification function to prevent unauthorized connections
      verifyClient: (info, cb) => {
        // Always accept the connection here, we'll authenticate later with JWT
        // This allows us to send proper error messages to the client
        cb(true);
      }
    });
    
    // Set up heartbeat interval to detect dead connections
    const pingInterval = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          console.log(`Terminating inactive WebSocket connection for user: ${ws.userId || 'unknown'}`);
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, PING_INTERVAL);

  wss.on('connection', async (ws, req) => {
    // Update connection statistics
    stats.totalConnections++;
    stats.activeConnections++;
    
    // Set up connection properties
    ws.isAlive = true;
    ws.connectionTime = new Date();
    ws.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Handle pong responses (heartbeat)
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    // Extract token from URL query parameters
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    
    if (!token) {
      console.log(`WebSocket connection rejected: No token provided (IP: ${ws.ip})`);
      stats.authFailures++;
      ws.close(4001, 'Authentication token is required');
      stats.activeConnections--;
      return;
    }
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'solo-leveling-secret-key-change-in-production');
      const userId = decoded.id;
      
      // Get user from database
      const user = await User.findById(userId);
      if (!user) {
        console.log(`WebSocket connection rejected: User not found (ID: ${userId}, IP: ${ws.ip})`);
        stats.authFailures++;
        ws.close(4004, 'User not found');
        stats.activeConnections--;
        return;
      }
      
      // Check if user already has an active connection
      const existingConnection = activeConnections.get(userId.toString());
      if (existingConnection && existingConnection.readyState === WebSocket.OPEN) {
        console.log(`Closing previous WebSocket connection for user: ${userId}`);
        existingConnection.close(4000, 'New connection established');
      }
      
      // Store connection with user ID
      activeConnections.set(userId.toString(), ws);
      
      // Add user info to the websocket client
      ws.userId = userId;
      ws.username = user.username;
      ws.userLevel = user.level;
      ws.userRank = user.rank;
      
      console.log(`WebSocket connection established for user: ${userId} (${user.username}, Level ${user.level}, Rank ${user.rank})`);
      
      // Send unread notifications
      const unreadNotifications = await Notification.find({ 
        user: userId, 
        isRead: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 }).limit(10);
      
      if (unreadNotifications.length > 0) {
        ws.send(JSON.stringify({
          type: 'unread_notifications',
          data: unreadNotifications
        }));
      }
      
      // Handle connection close
      ws.on('close', (code, reason) => {
        activeConnections.delete(userId.toString());
        stats.activeConnections--;
        console.log(`WebSocket connection closed for user: ${userId} (${user.username}) - Code: ${code}, Reason: ${reason || 'No reason provided'}`);
      });
      
      // Handle messages from clients
      ws.on('message', async (message) => {
        try {
          stats.messagesReceived++;
          const parsedMessage = JSON.parse(message);
          
          console.log(`Received WebSocket message from user ${userId} (${user.username}): ${parsedMessage.type}`);
          
          switch (parsedMessage.type) {
            case 'mark_notification_read':
              if (parsedMessage.notificationId) {
                const notification = await Notification.findOne({ 
                  _id: parsedMessage.notificationId,
                  user: userId
                });
                
                if (notification) {
                  await notification.markAsRead();
                }
              }
              break;
              
            case 'mark_notification_displayed':
              if (parsedMessage.notificationId) {
                const notification = await Notification.findOne({ 
                  _id: parsedMessage.notificationId,
                  user: userId
                });
                
                if (notification) {
                  await notification.markAsDisplayed();
                }
              }
              break;
              
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
              
            default:
              console.log(`Unknown message type: ${parsedMessage.type}`);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      stats.authFailures++;
      stats.errors++;
      stats.activeConnections--;
      ws.close(4003, 'Authentication failed: ' + (error.message || 'Unknown error'));
    }
  });
  
    // Clean up on server close
    wss.on('close', () => {
      clearInterval(pingInterval);
      console.log('WebSocket server closed');
    });
    
    // Add server statistics method
    wss.getStats = () => {
      return {
        ...stats,
        connectedUsers: Array.from(activeConnections.keys()).length
      };
    };
    
    console.log('WebSocket server initialized successfully');
    return wss;
  } catch (error) {
    console.error('Error creating WebSocket server:', error);
    stats.errors++;
    // Return a dummy WebSocket server that does nothing
    return {
      on: () => {},
      clients: new Set(),
      close: () => {},
      getStats: () => ({ ...stats, error: error.message })
    };
  }
};

// Send notification to specific user
const sendNotificationToUser = async (userId, notification) => {
  const connection = activeConnections.get(userId.toString());
  
  if (connection && connection.readyState === WebSocket.OPEN) {
    try {
      connection.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
      
      stats.messagesSent++;
      console.log(`Notification sent to user ${userId}: ${notification.title}`);
      
      // Mark notification as displayed
      await notification.markAsDisplayed();
      return true;
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      stats.errors++;
      return false;
    }
  }
  
  console.log(`User ${userId} not connected, notification not sent: ${notification.title}`);
  return false;
};

// Send notification to all connected users
const broadcastNotification = async (notification) => {
  let sentCount = 0;
  let errorCount = 0;
  
  activeConnections.forEach((connection) => {
    if (connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(JSON.stringify({
          type: 'system_notification',
          data: notification
        }));
        
        stats.messagesSent++;
        sentCount++;
      } catch (error) {
        console.error(`Error broadcasting to user ${connection.userId}:`, error);
        stats.errors++;
        errorCount++;
      }
    }
  });
  
  console.log(`Broadcast notification sent to ${sentCount} users (${errorCount} errors): ${notification.title}`);
  return { sentCount, errorCount };
};

// Send event to specific user
const sendEventToUser = (userId, eventType, eventData) => {
  const connection = activeConnections.get(userId.toString());
  
  if (connection && connection.readyState === WebSocket.OPEN) {
    connection.send(JSON.stringify({
      type: eventType,
      data: eventData
    }));
    return true;
  }
  
  return false;
};

// Check if user is connected
const isUserConnected = (userId) => {
  const connection = activeConnections.get(userId.toString());
  return connection && connection.readyState === WebSocket.OPEN;
};

// Get number of connected users
const getConnectedUsersCount = () => {
  return activeConnections.size;
};

module.exports = {
  initializeWebSocketServer,
  sendNotificationToUser,
  broadcastNotification,
  sendEventToUser,
  isUserConnected,
  getConnectedUsersCount
};
