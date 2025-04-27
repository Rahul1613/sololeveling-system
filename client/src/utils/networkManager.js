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
    
    // Start connection health check if configured
    if (NETWORK_CONFIG && NETWORK_CONFIG.connectionCheckInterval) {
      this._startConnectionHealthCheck();
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
      if (isOnline && !wasOnline) {
        this.checkServerConnection();
      }
    }
  }
  
  /**
   * Start connection health check interval
   * @private
   */
  _startConnectionHealthCheck() {
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
      console.error('Failed to save API URL to localStorage:', error);
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
      console.error('Error in tryNextFallbackUrl:', error);
      return API_URL;
    }
  }
  
  /**
   * Check server connection
   * @returns {Promise<boolean>} Whether the server is reachable
   */
  async checkServerConnection() {
    // In mock environment, always return true to avoid network errors
    if (process.env.NODE_ENV === 'development' || 
        process.env.REACT_APP_USE_MOCK_API === 'true' || 
        window.location.hostname === 'localhost') {
      
      // Simulate successful connection
      this.lastSuccessfulConnection = Date.now();
      this._handleOnlineStatus(true);
      
      // Log for debugging
      console.log('Mock environment detected: Simulating successful server connection');
      
      return true;
    }
    
    // For production environment, proceed with actual connection check
    if (!navigator.onLine) {
      this._handleOnlineStatus(false);
      return false;
    }
    
    try {
      // Use a simple endpoint that should respond quickly
      const url = `${this.getApiUrl()}/api/health`;
      
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
        
        // If we were using a fallback, reset to primary if it's working
        if (this.currentApiUrl !== API_URL) {
          // Try the primary URL next time
          this.currentFallbackIndex = 0;
        }
        
        // We're online
        this._handleOnlineStatus(true);
        return true;
      }
      
      // Server responded but with an error
      console.warn(`Server health check failed: ${response.status} ${response.statusText}`);
      
      // Try a fallback URL
      this.tryNextFallbackUrl();
      
      // We're online but server has issues
      this._handleOnlineStatus(true);
      return false;
    } catch (error) {
      // Request failed
      console.error('Server connection check failed:', error.name === 'AbortError' ? 'Timeout' : error.message);
      
      // Try a fallback URL
      this.tryNextFallbackUrl();
      
      // If it's been too long since last successful connection, mark as offline
      const offlineThreshold = 30000; // 30 seconds
      if (!this.lastSuccessfulConnection || (Date.now() - this.lastSuccessfulConnection > offlineThreshold)) {
        this._handleOnlineStatus(false);
      }
      
      return false;
    }
  }
  
  /**
   * Check if the server is reachable
   * @returns {boolean} Whether the server is reachable
   */
  isServerReachable() {
    // In mock/development mode, always return true to avoid showing "Server Unreachable"
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK_API === 'true') {
      return true;
    }
    
    // Return true if we've had a successful connection recently
    // Consider the server reachable if we've connected in the last 30 seconds
    const recentConnectionThreshold = 30000; // 30 seconds
    
    if (!this.lastSuccessfulConnection) {
      return false;
    }
    
    return (Date.now() - this.lastSuccessfulConnection) < recentConnectionThreshold;
  }
  
  /**
   * Add a network status listener
   * @param {Function} listener - The listener function
   * @returns {Function} A function to remove the listener
   */
  addListener(listener) {
    if (typeof listener === 'function' && !this.listeners.includes(listener)) {
      this.listeners.push(listener);
      // Return a function that removes this specific listener
      return () => this.removeListener(listener);
    }
    // Return a no-op function if listener wasn't added
    return () => {};
  }
  
  /**
   * Remove a network status listener
   * @param {Function} listener - The listener function to remove
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of a network event
   * @param {Object} event - The event object
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }
}

// Create and export a singleton instance
const networkManager = new NetworkManager();
export default networkManager;
