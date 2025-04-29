/**
 * Database Service
 * 
 * Central service for handling all database operations in the Solo Leveling system.
 * Provides methods for data persistence, synchronization, and recovery.
 */

import axios from 'axios';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Local storage keys
const STORAGE_KEYS = {
  AUTH: 'soloLevelingAuth',
  USER: 'user',
  TOKEN: 'token',
  SHADOWS: 'shadows',
  INVENTORY: 'inventory',
  QUESTS: 'quests',
  SKILLS: 'skills',
  TITLES: 'titles',
  STATS: 'stats',
  SETTINGS: 'settings',
  LAST_SYNC: 'lastSync'
};

/**
 * Get authentication headers
 * @returns {Object} Headers with authorization token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

/**
 * Save data to localStorage and sessionStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 */
const saveToStorage = (key, data) => {
  try {
    if (data !== undefined && data !== null) {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      sessionStorage.setItem(key, serializedData);
      console.log(`DatabaseService: Saved ${key} to storage`);
    }
  } catch (error) {
    console.error(`DatabaseService: Error saving ${key} to storage`, error);
  }
};

/**
 * Load data from localStorage or sessionStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} The loaded data or default value
 */
const loadFromStorage = (key, defaultValue = null) => {
  try {
    let data = localStorage.getItem(key);
    if (!data) {
      data = sessionStorage.getItem(key);
    }
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`DatabaseService: Error loading ${key} from storage`, error);
    return defaultValue;
  }
};

/**
 * Sync local data with server
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to sync
 * @returns {Promise} Promise with response
 */
const syncWithServer = async (endpoint, data) => {
  try {
    // In development mode, just save to local storage
    if (process.env.NODE_ENV === 'development') {
      saveToStorage(endpoint, data);
      return { success: true, data };
    }
    
    // In production, send to server
    const response = await axios.post(`${API_URL}/${endpoint}/sync`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`DatabaseService: Error syncing ${endpoint} with server`, error);
    // Save locally even if server sync fails
    saveToStorage(endpoint, data);
    throw error;
  }
};

/**
 * Database service methods
 */
const databaseService = {
  /**
   * Initialize the database service
   */
  init: () => {
    console.log('DatabaseService: Initializing');
    // Set up sync interval
    setInterval(() => {
      databaseService.syncAll();
    }, 60000); // Sync every minute
  },

  /**
   * Sync all data with server
   */
  syncAll: async () => {
    try {
      console.log('DatabaseService: Syncing all data');
      
      // Get stored user data
      const user = loadFromStorage(STORAGE_KEYS.USER);
      if (!user) {
        console.log('DatabaseService: No user data to sync');
        return;
      }
      
      // Sync user data
      const userData = loadFromStorage(STORAGE_KEYS.USER);
      if (userData) {
        await databaseService.syncUser(userData);
      }
      
      // Sync shadows
      const shadows = loadFromStorage(STORAGE_KEYS.SHADOWS, []);
      if (shadows && shadows.length > 0) {
        await databaseService.syncShadows(shadows);
      }
      
      // Sync inventory
      const inventory = loadFromStorage(STORAGE_KEYS.INVENTORY, []);
      if (inventory && inventory.length > 0) {
        await databaseService.syncInventory(inventory);
      }
      
      // Sync quests
      const quests = loadFromStorage(STORAGE_KEYS.QUESTS, {});
      if (quests && Object.keys(quests).length > 0) {
        await databaseService.syncQuests(quests);
      }
      
      // Sync skills
      const skills = loadFromStorage(STORAGE_KEYS.SKILLS, []);
      if (skills && skills.length > 0) {
        await databaseService.syncSkills(skills);
      }
      
      // Sync titles
      const titles = loadFromStorage(STORAGE_KEYS.TITLES, []);
      if (titles && titles.length > 0) {
        await databaseService.syncTitles(titles);
      }
      
      // Update last sync timestamp
      saveToStorage(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('DatabaseService: Error syncing all data', error);
    }
  },

  /**
   * Sync user data
   * @param {Object} userData - User data to sync
   * @returns {Promise} Promise with response
   */
  syncUser: async (userData) => {
    try {
      return await syncWithServer('users', userData);
    } catch (error) {
      console.error('DatabaseService: Error syncing user data', error);
      throw error;
    }
  },

  /**
   * Sync shadows
   * @param {Array} shadows - Shadows to sync
   * @returns {Promise} Promise with response
   */
  syncShadows: async (shadows) => {
    try {
      return await syncWithServer('shadows', { shadows });
    } catch (error) {
      console.error('DatabaseService: Error syncing shadows', error);
      throw error;
    }
  },

  /**
   * Sync inventory
   * @param {Array} items - Inventory items to sync
   * @returns {Promise} Promise with response
   */
  syncInventory: async (items) => {
    try {
      return await syncWithServer('inventory', { items });
    } catch (error) {
      console.error('DatabaseService: Error syncing inventory', error);
      throw error;
    }
  },

  /**
   * Sync quests
   * @param {Object} quests - Quests to sync
   * @returns {Promise} Promise with response
   */
  syncQuests: async (quests) => {
    try {
      return await syncWithServer('quests', quests);
    } catch (error) {
      console.error('DatabaseService: Error syncing quests', error);
      throw error;
    }
  },

  /**
   * Sync skills
   * @param {Array} skills - Skills to sync
   * @returns {Promise} Promise with response
   */
  syncSkills: async (skills) => {
    try {
      return await syncWithServer('skills', { skills });
    } catch (error) {
      console.error('DatabaseService: Error syncing skills', error);
      throw error;
    }
  },

  /**
   * Sync titles
   * @param {Array} titles - Titles to sync
   * @returns {Promise} Promise with response
   */
  syncTitles: async (titles) => {
    try {
      return await syncWithServer('titles', { titles });
    } catch (error) {
      console.error('DatabaseService: Error syncing titles', error);
      throw error;
    }
  },

  /**
   * Load all data from storage
   * @returns {Object} All loaded data
   */
  loadAllData: () => {
    try {
      console.log('DatabaseService: Loading all data from storage');
      
      return {
        user: loadFromStorage(STORAGE_KEYS.USER),
        shadows: loadFromStorage(STORAGE_KEYS.SHADOWS, []),
        inventory: loadFromStorage(STORAGE_KEYS.INVENTORY, []),
        quests: loadFromStorage(STORAGE_KEYS.QUESTS, {}),
        skills: loadFromStorage(STORAGE_KEYS.SKILLS, []),
        titles: loadFromStorage(STORAGE_KEYS.TITLES, []),
        stats: loadFromStorage(STORAGE_KEYS.STATS, {}),
        settings: loadFromStorage(STORAGE_KEYS.SETTINGS, {}),
        lastSync: loadFromStorage(STORAGE_KEYS.LAST_SYNC)
      };
    } catch (error) {
      console.error('DatabaseService: Error loading all data', error);
      return {};
    }
  },

  /**
   * Save authentication data
   * @param {Object} authData - Authentication data
   */
  saveAuthData: (authData) => {
    try {
      console.log('DatabaseService: Saving auth data');
      
      if (authData.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
      }
      
      if (authData.user) {
        saveToStorage(STORAGE_KEYS.USER, authData.user);
      }
      
      // Save to persistent auth storage
      saveToStorage(STORAGE_KEYS.AUTH, {
        token: authData.token,
        user: authData.user,
        timestamp: new Date().getTime()
      });
      
      // Set login flag
      localStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error('DatabaseService: Error saving auth data', error);
    }
  },

  /**
   * Load authentication data
   * @returns {Object} Authentication data
   */
  loadAuthData: () => {
    try {
      console.log('DatabaseService: Loading auth data');
      
      let token = localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      let user = loadFromStorage(STORAGE_KEYS.USER);
      
      // If not found, try to recover from persistent auth storage
      if (!token || !user) {
        const persistentAuth = loadFromStorage(STORAGE_KEYS.AUTH);
        if (persistentAuth && persistentAuth.token && persistentAuth.user) {
          token = persistentAuth.token;
          user = persistentAuth.user;
          
          // Restore to standard storage
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
          saveToStorage(STORAGE_KEYS.USER, user);
          
          // Set login flag
          localStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('isLoggedIn', 'true');
        }
      }
      
      return { token, user };
    } catch (error) {
      console.error('DatabaseService: Error loading auth data', error);
      return { token: null, user: null };
    }
  },

  /**
   * Clear authentication data (logout)
   */
  clearAuthData: () => {
    try {
      console.log('DatabaseService: Clearing auth data');
      
      // Save current user data before logout
      const user = loadFromStorage(STORAGE_KEYS.USER);
      if (user) {
        const savedUsers = loadFromStorage('soloLevelingUsers', []);
        const existingUserIndex = savedUsers.findIndex(u => u._id === user._id || u.email === user.email);
        
        if (existingUserIndex !== -1) {
          savedUsers[existingUserIndex] = { ...savedUsers[existingUserIndex], ...user };
        } else {
          savedUsers.push(user);
        }
        
        saveToStorage('soloLevelingUsers', savedUsers);
      }
      
      // Clear auth data
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('isLoggedIn');
    } catch (error) {
      console.error('DatabaseService: Error clearing auth data', error);
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      const user = loadFromStorage(STORAGE_KEYS.USER);
      const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
      
      return !!(token && user) || isLoggedIn === 'true';
    } catch (error) {
      console.error('DatabaseService: Error checking authentication', error);
      return false;
    }
  },

  /**
   * Get current user
   * @returns {Object} Current user
   */
  getCurrentUser: async () => {
    try {
      // First try to get from storage
      const authData = databaseService.loadAuthData();
      if (authData.user) {
        return { user: authData.user, token: authData.token };
      }
      
      // If not in storage, try to get from server
      if (process.env.NODE_ENV === 'development') {
        // In development, use mock service
        return { user: null, token: null };
      } else {
        // In production, get from server
        const response = await axios.get(`${API_URL}/users/me`, getAuthHeaders());
        return response.data;
      }
    } catch (error) {
      console.error('DatabaseService: Error getting current user', error);
      return { user: null, token: null };
    }
  },

  /**
   * Save shadow data
   * @param {Object} shadow - Shadow data
   */
  saveShadow: (shadow) => {
    try {
      console.log('DatabaseService: Saving shadow', shadow);
      
      // Get existing shadows
      const shadows = loadFromStorage(STORAGE_KEYS.SHADOWS, []);
      
      // Check if shadow already exists
      const existingIndex = shadows.findIndex(s => s._id === shadow._id);
      if (existingIndex !== -1) {
        // Update existing shadow
        shadows[existingIndex] = shadow;
      } else {
        // Add new shadow
        shadows.push(shadow);
      }
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.SHADOWS, shadows);
      
      // Sync with server
      databaseService.syncShadows(shadows).catch(error => {
        console.error('DatabaseService: Error syncing shadows after save', error);
      });
      
      return shadow;
    } catch (error) {
      console.error('DatabaseService: Error saving shadow', error);
      throw error;
    }
  },

  /**
   * Save inventory item
   * @param {Object} item - Inventory item
   */
  saveInventoryItem: (item) => {
    try {
      console.log('DatabaseService: Saving inventory item', item);
      
      // Get existing items
      const items = loadFromStorage(STORAGE_KEYS.INVENTORY, []);
      
      // Check if item already exists
      const existingIndex = items.findIndex(i => i._id === item._id);
      if (existingIndex !== -1) {
        // Update existing item
        items[existingIndex] = item;
      } else {
        // Add new item
        items.push(item);
      }
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.INVENTORY, items);
      
      // Sync with server
      databaseService.syncInventory(items).catch(error => {
        console.error('DatabaseService: Error syncing inventory after save', error);
      });
      
      return item;
    } catch (error) {
      console.error('DatabaseService: Error saving inventory item', error);
      throw error;
    }
  },

  /**
   * Save quest data
   * @param {Object} questData - Quest data
   */
  saveQuest: (questData) => {
    try {
      console.log('DatabaseService: Saving quest data', questData);
      
      // Get existing quests
      const quests = loadFromStorage(STORAGE_KEYS.QUESTS, {
        dailyQuests: [],
        weeklyQuests: [],
        customQuests: [],
        activeQuests: [],
        completedQuests: []
      });
      
      // Update quests object with new data
      const updatedQuests = { ...quests, ...questData };
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.QUESTS, updatedQuests);
      
      // Sync with server
      databaseService.syncQuests(updatedQuests).catch(error => {
        console.error('DatabaseService: Error syncing quests after save', error);
      });
      
      return updatedQuests;
    } catch (error) {
      console.error('DatabaseService: Error saving quest data', error);
      throw error;
    }
  },

  /**
   * Save skill data
   * @param {Object} skill - Skill data
   */
  saveSkill: (skill) => {
    try {
      console.log('DatabaseService: Saving skill', skill);
      
      // Get existing skills
      const skills = loadFromStorage(STORAGE_KEYS.SKILLS, []);
      
      // Check if skill already exists
      const existingIndex = skills.findIndex(s => s._id === skill._id);
      if (existingIndex !== -1) {
        // Update existing skill
        skills[existingIndex] = skill;
      } else {
        // Add new skill
        skills.push(skill);
      }
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.SKILLS, skills);
      
      // Sync with server
      databaseService.syncSkills(skills).catch(error => {
        console.error('DatabaseService: Error syncing skills after save', error);
      });
      
      return skill;
    } catch (error) {
      console.error('DatabaseService: Error saving skill', error);
      throw error;
    }
  },

  /**
   * Save title data
   * @param {Object} title - Title data
   */
  saveTitle: (title) => {
    try {
      console.log('DatabaseService: Saving title', title);
      
      // Get existing titles
      const titles = loadFromStorage(STORAGE_KEYS.TITLES, []);
      
      // Check if title already exists
      const existingIndex = titles.findIndex(t => t._id === title._id);
      if (existingIndex !== -1) {
        // Update existing title
        titles[existingIndex] = title;
      } else {
        // Add new title
        titles.push(title);
      }
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.TITLES, titles);
      
      // Sync with server
      databaseService.syncTitles(titles).catch(error => {
        console.error('DatabaseService: Error syncing titles after save', error);
      });
      
      return title;
    } catch (error) {
      console.error('DatabaseService: Error saving title', error);
      throw error;
    }
  },

  /**
   * Save user stats
   * @param {Object} stats - User stats
   */
  saveStats: (stats) => {
    try {
      console.log('DatabaseService: Saving stats', stats);
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.STATS, stats);
      
      // Sync with server
      databaseService.syncUser({ stats }).catch(error => {
        console.error('DatabaseService: Error syncing stats after save', error);
      });
      
      return stats;
    } catch (error) {
      console.error('DatabaseService: Error saving stats', error);
      throw error;
    }
  },

  /**
   * Save user settings
   * @param {Object} settings - User settings
   */
  saveSettings: (settings) => {
    try {
      console.log('DatabaseService: Saving settings', settings);
      
      // Save to storage
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
      
      return settings;
    } catch (error) {
      console.error('DatabaseService: Error saving settings', error);
      throw error;
    }
  },
  
  /**
   * Save data to localStorage and sessionStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to save
   */
  saveToStorage: (key, data) => {
    try {
      if (data !== undefined && data !== null) {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
        sessionStorage.setItem(key, serializedData);
        console.log(`DatabaseService: Saved ${key} to storage`);
      }
    } catch (error) {
      console.error(`DatabaseService: Error saving ${key} to storage`, error);
    }
  },
  
  /**
   * Load data from localStorage or sessionStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} The loaded data or default value
   */
  loadFromStorage
};

export default databaseService;
