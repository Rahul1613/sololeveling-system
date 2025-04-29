// Network Manager
// Handles network status, API URL management, and connection health monitoring

import { API_URL, FALLBACK_URLS, NETWORK_CONFIG } from '../config';

/**
 * Network Manager
 * Manages network status, API URLs, and connection health
 */
class NetworkManager {
  constructor() {
    // Initialize properties
    this.isOnline = navigator.onLine;
    this.currentApiUrl = API_URL || 'http://localhost:5002';
    this.fallbackUrls = FALLBACK_URLS || [];
    this.currentFallbackIndex = 0;
    this.lastSuccessfulConnection = null;
    this.connectionCheckInterval = null;
    this.listeners = [];
    this.showErrors = true; // Flag to control error display
    this.skipConnectionCheck = false; // Flag to completely skip connection checks
    this.isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.REACT_APP_USE_MOCK_API === 'true' || 
                         window.location.hostname === 'localhost';
    
    // Initialize event listeners
    this._initEventListeners();
  }
  
  /**
   * Initialize network event listeners
   * @private
   */
  _initEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => this._handleOnlineStatus(true));
    window.addEventListener('offline', () => this._handleOnlineStatus(false));
    
    // Start connection health check if configured and not in development
    if (NETWORK_CONFIG && NETWORK_CONFIG.connectionCheckInterval && !this.isDevelopment && !this.skipConnectionCheck) {
      this._startConnectionHealthCheck();
    } else if (this.isDevelopment) {
      // In development, set as online and don't check connection
      this.lastSuccessfulConnection = Date.now();
      this._handleOnlineStatus(true);
      console.log('Development mode: Network connection checks disabled');
    }
  }
  
  /**
   * Initialize the network manager
   */
  init() {
    try {
      // In development mode, just set as online and don't check connection
      if (this.isDevelopment) {
        this.lastSuccessfulConnection = Date.now();
        this._handleOnlineStatus(true);
        return;
      }
      
      // Try to restore API URL from localStorage
      const savedUrl = localStorage.getItem('server_url');
      if (savedUrl) {
        this.currentApiUrl = savedUrl;
      }
      
      // Check initial connection
      if (!this.skipConnectionCheck) {
        this.checkServerConnection();
      }
      
    } catch (error) {
      if (this.showErrors) {
        console.error('Failed to initialize network manager:', error);
      }
    }
  }
  
  /**
   * Handle online/offline status changes
   * @param {boolean} isOnline - Whether the browser is online
   * @private
   */
  _handleOnlineStatus(isOnline) {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;
    
    // Notify listeners if status changed
    if (wasOnline !== isOnline) {
      this.notifyListeners({
        type: isOnline ? 'online' : 'offline',
        timestamp: Date.now()
      });
      
      console.log(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
      
      // If we're back online, try to reconnect
      if (isOnline && !wasOnline && !this.isDevelopment && !this.skipConnectionCheck) {
        this.checkServerConnection();
      }
    }
  }
  
  /**
   * Start connection health check interval
   * @private
   */
  _startConnectionHealthCheck() {
    // Skip if connection check is disabled
    if (this.skipConnectionCheck) {
      console.log('Connection health check disabled');
      return;
    }
    
    // Clear any existing interval
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    // Set up new interval
    const interval = NETWORK_CONFIG?.connectionCheckInterval || 5000;
    this.connectionCheckInterval = setInterval(() => {
      this.checkServerConnection();
    }, interval);
    
    console.log(`Started connection health check (interval: ${interval}ms)`);
  }
  
  /**
   * Get the current API URL
   * @returns {string} The current API URL
   */
  getApiUrl() {
    return this.currentApiUrl || API_URL || 'http://localhost:5002';
  }
  
  /**
   * Set the current API URL
   * @param {string} url - The new API URL
   */
  setApiUrl(url) {
    if (!url) return;
    
    this.currentApiUrl = url;
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('server_url', url);
    } catch (error) {
      if (this.showErrors) {
        console.error('Failed to save API URL to localStorage:', error);
      }
    }
    
    console.log(`API URL set to: ${url}`);
    
    // Notify listeners
    this.notifyListeners({
      type: 'api_url_changed',
      url,
      timestamp: Date.now()
    });
  }
  
  /**
   * Check if the network is online
   * @returns {boolean} Whether the network is online
   */
  isNetworkOnline() {
    return this.isOnline;
  }
  
  /**
   * Try the next fallback URL
   * @returns {string|null} The next fallback URL or null if none available
   */
  tryNextFallbackUrl() {
    try {
      // If we've tried all fallbacks, reset to the primary URL
      if (this.currentFallbackIndex >= this.fallbackUrls.length) {
        this.currentFallbackIndex = 0;
        this.setApiUrl(API_URL);
        return API_URL;
      }
      
      // Get the next fallback URL
      const nextUrl = this.fallbackUrls[this.currentFallbackIndex];
      this.currentFallbackIndex++;
      
      // Set and return the new URL
      if (nextUrl) {
        this.setApiUrl(nextUrl);
        console.log(`Trying fallback URL: ${nextUrl}`);
        return nextUrl;
      }
      
      // If no fallbacks available, reset to primary
      this.setApiUrl(API_URL);
      return API_URL;
    } catch (error) {
      if (this.showErrors) {
        console.error('Error in tryNextFallbackUrl:', error);
      }
      return API_URL;
    }
  }
  
  /**
   * Check server connection
   * @returns {Promise<boolean>} Whether the server is reachable
   */
  async checkServerConnection() {
    // Skip if we're in development mode
    if (this.isDevelopment) {
      this.lastSuccessfulConnection = Date.now();
      this._handleOnlineStatus(true);
      return true;
    }
    
    // Skip if connection check is disabled
    if (this.skipConnectionCheck) {
      this.lastSuccessfulConnection = Date.now();
      this._handleOnlineStatus(true);
      return true;
    }
    
    // Skip if browser is offline
    if (!navigator.onLine) {
      this._handleOnlineStatus(false);
      return false;
    }
    
    try {
      // Construct health check URL based on environment
      let url;
      
      // For production on render.com, use a relative URL
      if (window.location.hostname.includes('render.com') || 
          window.location.hostname.includes('sololeveling-system')) {
        url = '/api/health';
      } else {
        url = `${this.getApiUrl()}/api/health`;
      }
      
      // Set up timeout
      const timeout = NETWORK_CONFIG?.healthCheckTimeout || 5000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Health-Check': 'true'
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Check if response is ok
      if (response.ok) {
        // Update last successful connection time
        this.lastSuccessfulConnection = Date.now();
        this._handleOnlineStatus(true);
        return true;
      } else {
        // Try fallback URL
        this.tryNextFallbackUrl();
        return false;
      }
    } catch (error) {
      // Only log error if showErrors is true
      if (this.showErrors && error.name !== 'AbortError') {
        console.error('Server connection check failed:', error.message);
      }
      
      // Check if we should try a fallback URL
      const timeSinceLastSuccess = this.lastSuccessfulConnection ? 
        Date.now() - this.lastSuccessfulConnection : 
        Infinity;
      
      const maxOfflineTime = NETWORK_CONFIG?.maxOfflineTimeBeforeFallback || 10000;
      
      if (timeSinceLastSuccess > maxOfflineTime) {
        this.tryNextFallbackUrl();
      }
      
      return false;
    }
  }
  
  /**
   * Add a listener for network events
   * @param {Function} callback - The callback function
   * @returns {Function} A function to remove the listener
   */
  addListener(callback) {
    if (typeof callback !== 'function') return () => {};
    
    this.listeners.push(callback);
    
    // Return a function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  /**
   * Notify all listeners of an event
   * @param {Object} event - The event object
   * @private
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        if (this.showErrors) {
          console.error('Error in network event listener:', error);
        }
      }
    });
  }
  
  /**
   * Get the time since the last successful connection
   * @returns {number|null} Time in milliseconds or null if never connected
   */
  getTimeSinceLastConnection() {
    if (!this.lastSuccessfulConnection) return null;
    return Date.now() - this.lastSuccessfulConnection;
  }
  
  /**
   * Check if the server connection is healthy
   * @returns {boolean} Whether the connection is healthy
   */
  isConnectionHealthy() {
    // In development, always return true
    if (this.isDevelopment) return true;
    
    // If never connected, return false
    if (!this.lastSuccessfulConnection) return false;
    
    // Check time since last successful connection
    const maxHealthyTime = NETWORK_CONFIG?.maxHealthyTime || 10000;
    return (Date.now() - this.lastSuccessfulConnection) < maxHealthyTime;
  }
  
  /**
   * Stop connection health check
   */
  stopConnectionHealthCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
      console.log('Stopped connection health check');
    }
  }
  
  /**
   * Check if the server is reachable
   * @returns {boolean} Whether the server is reachable
   */
  isServerReachable() {
    // In development mode or if connection checks are skipped, always return true
    if (this.isDevelopment || this.skipConnectionCheck) {
      return true;
    }
    
    // Otherwise, return based on the last connection check
    return this.isOnline && this.lastSuccessfulConnection !== null;
  }
}

// Create and export singleton instance
const networkManager = new NetworkManager();
export default networkManager;
