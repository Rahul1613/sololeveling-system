import { io } from 'socket.io-client';
import { addNotification } from '../redux/slices/notificationSlice';
import { store } from '../redux/store';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  init(userId) {
    // In development or mock mode, use a mock socket implementation
    if (process.env.NODE_ENV === 'development' || 
        process.env.REACT_APP_USE_MOCK_API === 'true' || 
        window.location.hostname === 'localhost') {
      
      console.log('Using mock socket implementation');
      
      // Create a mock socket object
      this.socket = {
        connected: true,
        id: 'mock-socket-id',
        on: (event, callback) => {
          console.log(`Mock socket: Registered listener for event "${event}"`);
          // Store the callback in a map for simulating events
          if (!this._mockListeners) this._mockListeners = {};
          if (!this._mockListeners[event]) this._mockListeners[event] = [];
          this._mockListeners[event].push(callback);
        },
        off: (event, callback) => {
          console.log(`Mock socket: Removed listener for event "${event}"`);
          if (this._mockListeners && this._mockListeners[event]) {
            const index = this._mockListeners[event].indexOf(callback);
            if (index !== -1) {
              this._mockListeners[event].splice(index, 1);
            }
          }
        },
        emit: (event, data) => {
          console.log(`Mock socket: Emitted event "${event}"`, data);
          // For join event, simulate a successful connection
          if (event === 'join' && data) {
            console.log(`Mock socket: User ${data} joined their room`);
          }
        },
        disconnect: () => {
          console.log('Mock socket: Disconnected');
          this.isConnected = false;
        }
      };
      
      // Set connected state
      this.isConnected = true;
      
      // Simulate connection event
      setTimeout(() => {
        if (this._mockListeners && this._mockListeners['connect']) {
          this._mockListeners['connect'].forEach(callback => callback());
        }
        
        // Join user's personal room for targeted notifications
        if (userId) {
          this.socket.emit('join', userId);
        }
      }, 100);
      
      return;
    }
    
    // For production, use the real socket.io implementation
    // Import from config.js instead of hardcoding
    const { SOCKET_URL } = require('../config');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      
      // Join user's personal room for targeted notifications
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    // Set up event listeners for different notification types
    this.setupEventListeners();
  }

  // Set up socket event listeners
  setupEventListeners() {
    // Quest notifications
    this.socket.on('quest_accepted', (data) => {
      store.dispatch(addNotification({
        type: 'quest_accepted',
        title: 'Quest Accepted',
        message: `You have accepted the quest: ${data.title}`,
        data
      }));
    });

    this.socket.on('quest_completed', (data) => {
      store.dispatch(addNotification({
        type: 'quest_completed',
        title: 'Quest Completed',
        message: `You have completed the quest: ${data.title}`,
        data
      }));
    });

    this.socket.on('quest_failed', (data) => {
      store.dispatch(addNotification({
        type: 'quest_failed',
        title: 'Quest Failed',
        message: `You have failed the quest: ${data.title}`,
        data
      }));
    });

    this.socket.on('quest_abandoned', (data) => {
      store.dispatch(addNotification({
        type: 'quest_abandoned',
        title: 'Quest Abandoned',
        message: `You have abandoned the quest: ${data.title}`,
        data
      }));
    });

    // Level up notification
    this.socket.on('level_up', (data) => {
      store.dispatch(addNotification({
        type: 'level_up',
        title: 'Level Up!',
        message: `You have reached level ${data.newLevel}!`,
        data
      }));
    });

    // Shadow notifications
    this.socket.on('shadow_acquired', (data) => {
      store.dispatch(addNotification({
        type: 'shadow_acquired',
        title: 'Shadow Acquired',
        message: `You have acquired a new shadow: ${data.name}`,
        data
      }));
    });

    this.socket.on('shadow_level_up', (data) => {
      store.dispatch(addNotification({
        type: 'shadow_level_up',
        title: 'Shadow Level Up',
        message: `${data.name} has reached level ${data.newLevel}!`,
        data
      }));
    });

    this.socket.on('shadow_deployed', (data) => {
      store.dispatch(addNotification({
        type: 'shadow_deployed',
        title: 'Shadow Deployed',
        message: `${data.name} has been deployed on a mission`,
        data
      }));
    });

    this.socket.on('shadow_returned', (data) => {
      store.dispatch(addNotification({
        type: 'shadow_returned',
        title: 'Shadow Returned',
        message: `${data.name} has returned from their mission`,
        data
      }));
    });

    // Item notifications
    this.socket.on('item_equipped', (data) => {
      store.dispatch(addNotification({
        type: 'item_equipped',
        title: 'Item Equipped',
        message: `You have equipped ${data.name}`,
        data
      }));
    });

    this.socket.on('item_unequipped', (data) => {
      store.dispatch(addNotification({
        type: 'item_unequipped',
        title: 'Item Unequipped',
        message: `You have unequipped ${data.name}`,
        data
      }));
    });

    this.socket.on('item_used', (data) => {
      store.dispatch(addNotification({
        type: 'item_used',
        title: 'Item Used',
        message: `You have used ${data.name}`,
        data
      }));
    });

    this.socket.on('item_purchased', (data) => {
      store.dispatch(addNotification({
        type: 'item_purchased',
        title: 'Item Purchased',
        message: `You have purchased ${data.quantity} ${data.name}`,
        data
      }));
    });

    this.socket.on('item_sold', (data) => {
      store.dispatch(addNotification({
        type: 'item_sold',
        title: 'Item Sold',
        message: `You have sold ${data.quantity} ${data.name}`,
        data
      }));
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Emit an event
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Subscribe to an event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
