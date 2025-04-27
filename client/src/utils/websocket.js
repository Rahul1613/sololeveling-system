import { getToken } from './auth';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10; // Increased from 5 to 10 for better resilience
    this.reconnectTimeout = null;
    this.pingInterval = null;
    this.connected = false;
    this.connectionStartTime = null;
    this.networkOnline = navigator.onLine;
    
    // Listen for online/offline events to handle network changes
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));
  }

  connect() {
    // Don't attempt to connect if we know we're offline
    if (!navigator.onLine) {
      console.log('Network is offline, not attempting WebSocket connection');
      this.notifyListeners('connection', { status: 'offline' });
      // Schedule a reconnect attempt when we come back online
      return;
    }
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    const token = getToken();
    if (!token) {
      console.error('No authentication token available');
      this.notifyListeners('error', { error: 'Authentication token not available' });
      return;
    }

    // Import from config.js instead of hardcoding
    const { SOCKET_URL } = require('../config');
    
    // Determine the WebSocket protocol based on the connection security
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Extract the host from the SOCKET_URL, removing any protocol prefix
    const host = SOCKET_URL.replace(/^https?:\/\//, '');
    
    // Construct the WebSocket URL with the token for authentication
    // Make sure the path matches the server's WebSocket endpoint
    const wsUrl = `${protocol}//${host}/ws?token=${token}`;
    
    console.log('Attempting to connect to WebSocket:', wsUrl);
    this.connectionStartTime = Date.now();

    try {
      this.socket = new WebSocket(wsUrl);
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout after 10 seconds');
          this.socket.close(4000, 'Connection timeout');
        }
      }, 10000);

      this.socket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connection established');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.notifyListeners('connection', { status: 'connected' });
        
        // Send initial handshake message
        this.sendMessage('handshake', { clientTime: Date.now() });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data.type, data.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        const connectionDuration = this.connectionStartTime ? Date.now() - this.connectionStartTime : 0;
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}, connection lasted ${connectionDuration/1000}s`);
        this.connected = false;
        this.clearPingInterval();
        this.notifyListeners('connection', { status: 'disconnected', code: event.code, reason: event.reason });
        
        // Check if this was a very short-lived connection (less than 1 second)
        // This might indicate a server rejection rather than a network issue
        const wasShortConnection = connectionDuration < 1000;
        
        // Determine if we should attempt to reconnect
        const shouldReconnect = (
          // We're online
          navigator.onLine &&
          // Not a normal closure
          event.code !== 1000 && event.code !== 1001 &&
          // Not at max attempts
          this.reconnectAttempts < this.maxReconnectAttempts &&
          // Not explicitly told not to reconnect in the close reason
          !event.reason?.includes('no-reconnect') &&
          // If it was a short connection and we've already tried several times, 
          // it might be a server-side issue rather than network
          !(wasShortConnection && this.reconnectAttempts >= 3)
        );
        
        if (shouldReconnect) {
          // Calculate backoff time: 1s, 2s, 4s, 8s, 16s...
          // For very short connections, use a longer initial backoff
          const baseBackoff = wasShortConnection ? 3000 : 1000;
          const backoffTime = Math.min(baseBackoff * Math.pow(2, this.reconnectAttempts), 60000);
          
          console.log(`WebSocket reconnect scheduled in ${backoffTime/1000}s (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect();
          }, backoffTime);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('WebSocket max reconnection attempts reached. Please refresh the page.');
          this.notifyListeners('error', { 
            error: 'Max reconnection attempts reached', 
            message: 'Unable to establish a stable connection to the server. Please refresh the page or try again later.'
          });
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        // Provide more detailed error information when possible
        let errorInfo = { type: 'unknown' };
        
        if (error.message) {
          errorInfo.message = error.message;
        }
        
        if (error.type) {
          errorInfo.type = error.type;
        }
        
        // Check if this might be a network-related error
        const isNetworkError = !navigator.onLine || 
          (error.message && (
            error.message.includes('network') || 
            error.message.includes('connection') ||
            error.message.includes('timeout')
          ));
        
        if (isNetworkError) {
          errorInfo.type = 'network';
          errorInfo.message = 'Network connection issue detected';
        }
        
        // Notify listeners about the error
        this.notifyListeners('error', { error: errorInfo });
        
        // If we're not connected, try to reconnect
        if (!this.connected && this.reconnectAttempts < this.maxReconnectAttempts && navigator.onLine) {
          console.log('WebSocket error occurred while not connected, scheduling reconnect...');
          // Schedule a reconnect attempt if not already scheduled
          if (!this.reconnectTimeout) {
            const backoffTime = Math.min(3000 * Math.pow(1.5, this.reconnectAttempts), 30000);
            this.reconnectTimeout = setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Attempting to reconnect after error (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
              this.connect();
            }, backoffTime);
          }
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.clearPingInterval();
    this.connected = false;
  }

  startPingInterval() {
    this.clearPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        } catch (error) {
          console.error('Error sending ping:', error);
          // If we can't send a ping, the connection might be dead
          // Force a reconnection
          this.socket.close(4001, 'Ping failed');
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(type, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
      return true;
    }
    return false;
  }

  markNotificationRead(notificationId) {
    return this.send('mark_notification_read', { notificationId });
  }

  markNotificationDisplayed(notificationId) {
    return this.send('mark_notification_displayed', { notificationId });
  }

  addListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    return () => this.removeListener(eventType, callback);
  }

  removeListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  notifyListeners(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }

  handleNetworkChange() {
    const wasOnline = this.networkOnline;
    this.networkOnline = navigator.onLine;
    
    console.log(`Network status changed: ${this.networkOnline ? 'online' : 'offline'}`);
    
    // Notify listeners about the network change
    this.notifyListeners('network', { 
      status: this.networkOnline ? 'online' : 'offline' 
    });
    
    // If we're coming back online and we were trying to connect, try again
    if (this.networkOnline && !wasOnline && this.reconnectAttempts > 0) {
      console.log('Network is back online, attempting to reconnect WebSocket...');
      // Clear any existing reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      // Try to connect immediately
      this.connect();
    }
  }

  sendMessage(type, data = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not open');
      return false;
    }
    
    try {
      const message = JSON.stringify({
        type,
        data,
        timestamp: Date.now()
      });
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return this;
    
    if (!callback) {
      this.listeners.delete(event);
      return this;
    }
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    return this;
  }

  isConnected() {
    return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
