// API configuration with fallback mechanism
const getServerUrl = () => {
  // Primary URL from environment variables
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Try to read from localStorage (might have been saved during a successful connection)
  const savedUrl = localStorage.getItem('server_url');
  if (savedUrl) {
    return savedUrl;
  }
  
  // In development, try common development ports
  if (process.env.NODE_ENV === 'development') {
    // Instead of reading from port.json, we'll use common ports
    // The networkManager will try these in sequence if needed
    console.log('Using development default ports');
    return 'http://localhost:5002';
  }
  
  // Fallback to default ports in sequence
  // The axios instance will try these URLs in sequence if the primary fails
  return 'http://localhost:5002';
};

export const API_URL = getServerUrl();

// Fallback URLs to try if the main URL fails
export const FALLBACK_URLS = [
  'http://localhost:5002',
  'http://localhost:5003',
  'http://localhost:5004',
  'http://localhost:5005',
  'http://localhost:5006'
];

// Socket configuration with the same URL as the API
export const SOCKET_URL = API_URL;

// Network configuration
export const NETWORK_CONFIG = {
  // Retry settings
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 15000,
  // Health check settings
  connectionCheckInterval: 5000, // 5 seconds
  healthCheckTimeout: 5000, // 5 seconds
  reconnectBaseDelay: 2000, // 2 seconds
  reconnectMaxDelay: 30000, // 30 seconds
  // Cache settings
  cacheEnabled: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  // Offline mode settings
  offlineMode: false,
  offlineFallbackData: true
};

// Voice service configuration
export const VOICE_CONFIG = {
  enabled: true,
  volume: 0.8,
  rate: 1.0,
  pitch: 1.0,
  voice: 'en-US'
};

// Animation configuration
export const ANIMATION_CONFIG = {
  enabled: true,
  duration: 500
};

// Theme configuration
export const THEME_CONFIG = {
  darkMode: true,
  primaryColor: '#7B68EE', // Medium slate blue
  secondaryColor: '#4CAF50', // Green
  accentColor: '#FFC107' // Amber
};

// Feature flags
export const FEATURES = {
  skills: true,
  titles: true,
  shadows: true,
  dungeonKeys: false,
  guilds: false,
  chat: false,
  aiVerification: true,
  realWorldIntegration: false
};

// Rank colors
export const RANK_COLORS = {
  'S': '#FFD700', // Gold
  'A': '#FF5733', // Orange-Red
  'B': '#9370DB', // Medium Purple
  'C': '#3498DB', // Dodger Blue
  'D': '#2ECC71', // Emerald Green
  'E': '#95A5A6'  // Gray
};

// Rarity colors
export const RARITY_COLORS = {
  'common': '#9E9E9E',
  'uncommon': '#4CAF50',
  'rare': '#2196F3',
  'epic': '#9C27B0',
  'legendary': '#FFC107',
  'mythic': '#F44336'
};

// Skill type colors
export const SKILL_TYPE_COLORS = {
  'active': '#2196F3',
  'passive': '#4CAF50',
  'ultimate': '#F44336'
};

// Default settings
export const DEFAULT_SETTINGS = {
  notifications: true,
  sounds: true,
  voiceAnnouncements: true,
  animations: true,
  darkMode: true,
  autoEquipItems: false,
  showTutorials: true
};
