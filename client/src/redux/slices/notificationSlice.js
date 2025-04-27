import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import websocketService from '../../utils/websocket';
import api from '../../api/axios';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

// Async thunks for notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      // Try to mark via WebSocket first
      const wsSuccess = websocketService.markNotificationRead(notificationId);
      
      // If WebSocket fails, use HTTP fallback
      if (!wsSuccess) {
        await api.post(`/notifications/${notificationId}/read`);
      }
      
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // Add notification to the queue
      const notification = {
        id: action.payload._id || Date.now(),
        timestamp: action.payload.createdAt || new Date().toISOString(),
        type: action.payload.type || 'info',
        title: action.payload.title || '',
        message: action.payload.message || '',
        data: action.payload.data || null,
        style: action.payload.style || 'info',
        isRead: action.payload.isRead || false,
        soundEffect: action.payload.soundEffect || 'notification.mp3',
        voiceAnnouncement: action.payload.voiceAnnouncement || { enabled: false },
        ...action.payload
      };
      
      state.notifications.unshift(notification);
      
      if (!notification.isRead) {
        state.unreadCount += 1;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      // Remove notification by ID
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].isRead) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    clearAllNotifications: (state) => {
      // Clear all notifications
      state.notifications = [];
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark notification as read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1 && !state.notifications[index].isRead) {
          state.notifications[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

export const { addNotification, removeNotification, clearAllNotifications, markAllNotificationsRead } = notificationSlice.actions;

// Thunks for specific notification types with voice announcements
export const notifyLevelUp = (level) => (dispatch) => {
  dispatch(addNotification({
    type: 'levelup',
    title: 'Level Up!',
    message: `You have reached level ${level}!`,
    icon: '🔼',
    duration: 8000,
    announce: true,
    priority: 3
  }));
  
  // Trigger voice announcement
  // voiceService.announceLevelUp(level);
};

export const notifyQuestComplete = (questName, rewards) => (dispatch) => {
  dispatch(addNotification({
    type: 'quest',
    title: 'Quest Complete!',
    message: `You have completed the quest: ${questName}`,
    icon: '✅',
    duration: 7000,
    announce: true,
    priority: 2,
    details: rewards
  }));
  
  // Trigger voice announcement
  // voiceService.announceQuestComplete(questName);
};

export const notifyRankChange = (rank) => (dispatch) => {
  dispatch(addNotification({
    type: 'rank',
    title: 'Rank Up!',
    message: `You have achieved rank ${rank}!`,
    icon: '⭐',
    duration: 8000,
    announce: true,
    priority: 3
  }));
  
  // Trigger voice announcement
  // voiceService.announceRankChange(rank);
};

export const notifyAchievement = (achievementName) => (dispatch) => {
  dispatch(addNotification({
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: achievementName,
    icon: '🏆',
    duration: 7000,
    announce: true,
    priority: 2
  }));
  
  // Trigger voice announcement
  // voiceService.announceAchievement(achievementName);
};

export const notifyDailyQuests = () => (dispatch) => {
  dispatch(addNotification({
    type: 'info',
    title: 'Daily Quests Available',
    message: 'New daily quests are now available!',
    icon: '📜',
    duration: 6000,
    announce: true,
    priority: 1
  }));
  
  // Trigger voice announcement
  // voiceService.announceDailyQuests();
};

export const notifySpecialEvent = (eventName, details) => (dispatch) => {
  dispatch(addNotification({
    type: 'warning',
    title: 'Special Event',
    message: eventName,
    icon: '⚠️',
    duration: 8000,
    announce: true,
    priority: 3,
    details
  }));
  
  // Trigger voice announcement
  // voiceService.announceSpecialEvent(eventName);
};

export default notificationSlice.reducer;
