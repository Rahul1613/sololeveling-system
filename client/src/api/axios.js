import axios from 'axios';

// Import config and utilities
import { API_URL, NETWORK_CONFIG } from '../config';
import { logout } from '../utils/auth';
import networkManager from '../utils/networkManager';
import offlineSync from '../utils/offlineSync';

// Utility function to safely merge config objects and prevent slice() errors
const safeMergeConfig = (config1, config2) => {
  // Create a safe copy of config1
  const safeConfig1 = config1 || {};
  
  // Create a safe copy of config2
  const safeConfig2 = config2 || {};
  
  // Ensure headers are objects
  safeConfig1.headers = safeConfig1.headers || {};
  safeConfig2.headers = safeConfig2.headers || {};
  
  // Safely merge headers
  const mergedHeaders = { ...safeConfig1.headers };
  
  // Add headers from config2, ensuring we don't try to slice undefined
  Object.keys(safeConfig2.headers).forEach(key => {
    const headerValue = safeConfig2.headers[key];
    // Only copy if the header value is defined
    if (headerValue !== undefined) {
      mergedHeaders[key] = headerValue;
    }
  });
  
  // Return merged config with safe headers
  return {
    ...safeConfig1,
    ...safeConfig2,
    headers: mergedHeaders
  };
};

// Create axios instance with dynamic base URL
const api = axios.create({
  // We'll set the baseURL dynamically in the request interceptor
  baseURL: API_URL, // Set a default baseURL
  headers: {
    'Content-Type': 'application/json'
  },
  // Increased timeout to prevent timeout errors
  timeout: 60000 // 60 seconds timeout instead of using config value
});

// Override axios.mergeConfig to use our safe version
const originalMergeConfig = axios.mergeConfig;
axios.mergeConfig = (config1, config2) => {
  try {
    // First try our safe merge
    return safeMergeConfig(config1, config2);
  } catch (error) {
    console.error('Error in safeMergeConfig:', error);
    // Fall back to original if our safe version fails
    try {
      return originalMergeConfig(config1, config2);
    } catch (fallbackError) {
      console.error('Error in original mergeConfig:', fallbackError);
      // Last resort: return a basic config
      return {
        headers: {},
        ...(config1 || {}),
        ...(config2 || {})
      };
    }
  }
};

// Configure retry settings
api.defaults.retry = NETWORK_CONFIG?.maxRetries || 3;
api.defaults.retryDelay = NETWORK_CONFIG?.retryDelay || 1000;

// Add a request ID generator for tracking requests
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Enable request debugging in development
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(request => {
    const requestId = generateRequestId();
    // Ensure headers object exists before adding to it
    request.headers = request.headers || {};
    request.headers['X-Request-ID'] = requestId;
    console.log(`Starting API Request [${requestId}]:`, request.method, request.url);
    return request;
  });
}

// Add a special mock interceptor for development environment
if (process.env.NODE_ENV === 'development' || 
    process.env.REACT_APP_USE_MOCK_API === 'true' || 
    window.location.hostname === 'localhost') {
  
  console.log('Setting up mock API interceptor to prevent network errors');
  
  // This interceptor runs before the regular request interceptor
  api.interceptors.request.use(
    async (config) => {
      // Set a flag to indicate this is a mock request
      config.headers = config.headers || {};
      config.headers['X-Mock-Request'] = 'true';
      
      // If the URL doesn't include 'mock' and we're using mock services,
      // we should prevent the actual network request
      if (!config.url.includes('mock') && 
          (window.USING_MOCK_API || 
           process.env.REACT_APP_USE_MOCK_API === 'true')) {
        
        console.log(`Mock interceptor: Preventing real network request to ${config.url}`);
        
        // Create a canceled request that will be caught by the response interceptor
        const mockController = new AbortController();
        config.signal = mockController.signal;
        
        // Abort immediately but in the next tick to allow the request to be processed
        setTimeout(() => {
          mockController.abort('Mock environment: Real network requests are disabled');
        }, 0);
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Special response interceptor for mock environment
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // If this is an aborted request from our mock interceptor
      if (error.name === 'AbortError' || 
          (error.code === 'ERR_CANCELED' && 
           error.message?.includes('Mock environment'))) {
        
        console.log('Mock interceptor: Simulating successful response for aborted request');
        
        // Create a mock successful response
        return Promise.resolve({
          data: { 
            success: true, 
            message: 'Mock response (network requests disabled)',
            mockData: true
          },
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: error.config,
          isMockResponse: true
        });
      }
      
      // For other errors, continue to the next interceptor
      return Promise.reject(error);
    }
  );
}

// Add request interceptor to handle token and network status
api.interceptors.request.use(
  async (config) => {
    // Debug logging to track config object
    console.log('Request config before processing:', {
      url: config.url,
      method: config.method,
      hasHeaders: !!config.headers,
      headerKeys: config.headers ? Object.keys(config.headers) : []
    });
    
    // Ensure headers object exists to prevent slice() errors
    config.headers = config.headers || {};
    
    // Generate a unique request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Request-ID'] = requestId;
    
    // Set the baseURL dynamically based on NetworkManager
    config.baseURL = networkManager.getApiUrl() || API_URL;
    
    // Record request start time for performance monitoring
    config._requestStartTime = Date.now();
    
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ensure params is always an object
    config.params = config.params || {};
    
    // Check if we're online before making request
    if (!navigator.onLine) {
      console.log('Device is offline, checking for cached data...');
      
      // For GET requests, try to use cached data
      if (config.method?.toLowerCase() === 'get' && NETWORK_CONFIG?.cacheEnabled) {
        const cacheKey = `cache_${config.url}_${JSON.stringify(config.params)}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            // Check if cache is still valid
            if (parsed.expires > Date.now()) {
              console.log(`Using cached data for ${config.url}`);
              
              // Create an error with offline flag to be caught by response interceptor
              const offlineError = new Error('Device is offline');
              offlineError.isOffline = true;
              offlineError.cachedData = parsed.data;
              offlineError.config = config;
              
              return Promise.reject(offlineError);
            }
          } catch (e) {
            console.warn('Failed to parse cached data:', e);
          }
        }
      }
      
      // If we're offline and no cache, reject with offline error
      const offlineError = new Error('Device is offline');
      offlineError.isOffline = true;
      offlineError.config = config;
      
      return Promise.reject(offlineError);
    }
    
    // Final debug log before request is sent
    console.log('Final request config:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      hasHeaders: !!config.headers,
      headerCount: config.headers ? Object.keys(config.headers).length : 0,
      requestId
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and other errors
api.interceptors.response.use(
  (response) => {
    // Debug logging to track response object
    console.log('Response received:', {
      url: response.config?.url,
      status: response.status,
      hasData: !!response.data,
      configHeaders: response.config?.headers ? Object.keys(response.config.headers) : []
    });
    
    // Ensure response and config objects are valid
    if (!response) {
      console.error('Axios response is undefined');
      return Promise.resolve({});
    }
    
    // Ensure response.config exists
    response.config = response.config || {};
    
    // Ensure headers object exists
    response.config.headers = response.config.headers || {};
    
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      const requestId = response.config.headers['X-Request-ID'] || 'unknown';
      console.log(`API Response [${requestId}]:`, response.status, response.config.url);
    }
    
    // Record successful connection
    networkManager.lastSuccessfulConnection = Date.now();
    
    // If we're using a fallback URL and it worked, save it
    const currentUrl = networkManager.getApiUrl();
    if (currentUrl !== API_URL) {
      localStorage.setItem('server_url', currentUrl);
    }
    
    // Calculate request duration
    if (response.config._requestStartTime) {
      const duration = Date.now() - response.config._requestStartTime;
      console.log(`Request to ${response.config.url} completed in ${duration}ms`);
    }
    
    // Cache the response if caching is enabled
    if (NETWORK_CONFIG?.cacheEnabled && response.config.method?.toLowerCase() === 'get') {
      try {
        const cacheKey = `cache_${response.config.url}_${JSON.stringify(response.config.params || {})}`;
        const cacheData = {
          data: response.data,
          timestamp: Date.now(),
          expires: Date.now() + (NETWORK_CONFIG?.cacheDuration || 300000)
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        console.warn('Failed to cache response:', e);
      }
    }
    
    return response;
  },
  async (error) => {
    // Debug logging for error tracking
    console.log('Response error details:', {
      message: error?.message,
      code: error?.code,
      hasResponse: !!error?.response,
      hasConfig: !!error?.config,
      configUrl: error?.config?.url,
      responseStatus: error?.response?.status
    });
    
    // Ensure error object is valid
    if (!error) {
      console.error('Axios error is undefined');
      return Promise.reject(new Error('Unknown error occurred'));
    }
    
    // Ensure error.config exists
    const originalRequest = error.config || {};
    
    // Ensure headers object exists
    originalRequest.headers = originalRequest.headers || {};
    
    const requestId = originalRequest.headers['X-Request-ID'] || 'unknown';
    
    // Log request error details
    console.error('Request error details:', {
      url: originalRequest.url,
      method: originalRequest.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    // Log the full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error [${requestId}]:`, {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.error?.message || error.response?.data?.message || error.message,
        code: error.code,
        type: error.response?.data?.error?.type || 'unknown'
      });
    }
    
    // Handle offline mode
    if (error.isOffline) {
      // No valid cache, reject with offline error
      error.userMessage = 'You are currently offline. Please check your internet connection and try again.';
      error.isOffline = true;
      
      // If this is a mutation (POST, PUT, DELETE), queue it for later
      if (originalRequest && ['post', 'put', 'delete'].includes(originalRequest.method?.toLowerCase())) {
        try {
          // Queue the operation for when we're back online
          offlineSync.queueOperation(
            'api',
            originalRequest.method?.toLowerCase(),
            originalRequest.url || '',
            originalRequest.data || {},
            originalRequest.method?.toUpperCase() || 'GET'
          );
          
          // Return a mock response
          return Promise.resolve({
            data: {
              success: false,
              message: 'You are offline. This request has been queued and will be processed when you are back online.',
              offlineQueued: true
            },
            status: 202,
            statusText: 'Accepted (Offline Queue)',
            headers: {},
            config: originalRequest,
            offlineQueued: true
          });
        } catch (e) {
          console.error('Failed to queue offline operation:', e);
        }
      }
      
      // Try to get cached data if available and we're configured to use it
      if (NETWORK_CONFIG?.offlineMode && NETWORK_CONFIG?.offlineFallbackData) {
        try {
          // Fall back to localStorage cache
          const cacheKey = `cache_${originalRequest.url}_${JSON.stringify(originalRequest.params)}`;
          const cachedData = localStorage.getItem(cacheKey);
          
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              console.log(`Using cached data for ${originalRequest.url} while offline`);
              return Promise.resolve({
                data: parsed.data,
                status: 200,
                statusText: 'OK (Cached)',
                headers: {},
                config: originalRequest,
                fromCache: true
              });
            } catch (parseError) {
              console.warn('Failed to parse cached data:', parseError);
            }
          }
        } catch (e) {
          console.warn('Failed to retrieve cached/offline data:', e);
        }
      }
      
      return Promise.reject(error);
    }
    
    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Only logout if the error is related to authentication
      const authErrorMessages = ['Invalid token', 'Token expired', 'Not authenticated', 'Authentication required'];
      const errorMessage = error.response.data?.message || error.response.data?.error || '';
      
      if (authErrorMessages.some(msg => errorMessage.includes(msg))) {
        console.log(`Authentication error [${requestId}] - logging out user`);
        // Use the logout utility function to ensure consistent logout behavior
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Try alternative server URLs for network errors
    if (!error.response && originalRequest && !originalRequest._serverUrlRetried) {
      originalRequest._serverUrlRetried = true;
      
      try {
        // Try a different server URL
        const newUrl = networkManager.tryNextFallbackUrl();
        if (newUrl) {
          console.log(`Retrying request with alternative server URL: ${newUrl}`);
          originalRequest.baseURL = newUrl;
          return api(originalRequest);
        }
      } catch (e) {
        console.error('Error trying alternative server URL:', e);
      }
    }
    
    // Initialize retry count if it doesn't exist
    if (originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }
    
    // Retry on server errors (5xx) and certain network errors
    const serverErrorCodes = [500, 502, 503, 504];
    if (
      originalRequest && 
      serverErrorCodes.includes(error.response?.status) && 
      originalRequest._retryCount < (NETWORK_CONFIG?.maxRetries || 3) && 
      ['get', 'head', 'options'].includes(originalRequest.method?.toLowerCase() || '') // Only retry safe methods
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(
        originalRequest._retryCount * (NETWORK_CONFIG?.retryDelay || 1000),
        (NETWORK_CONFIG?.retryDelay || 1000) * 10
      );
      
      console.log(`Retrying request [${requestId}] after server error... (Attempt ${originalRequest._retryCount}/${NETWORK_CONFIG?.maxRetries || 3})`);
      
      return new Promise(resolve => {
        setTimeout(() => resolve(api(originalRequest)), delay);
      });
    }
    
    // Handle network errors (ECONNABORTED, Network Error)
    if (error.code === 'ECONNABORTED' || !error.response) {
      // Show user-friendly message for network errors
      console.error(`Network error detected [${requestId}]:`, error.message);
      
      // If we have offline data available
      if (NETWORK_CONFIG?.offlineMode && originalRequest.method?.toLowerCase() === 'get') {
        try {
          // Try to get cached data
          const cacheKey = `cache_${originalRequest.url}_${JSON.stringify(originalRequest.params)}`;
          const cachedData = localStorage.getItem(cacheKey);
          
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              console.log(`Using cached data for ${originalRequest.url} due to network error`);
              return Promise.resolve({
                data: parsed.data,
                status: 200,
                statusText: 'OK (Cached)',
                headers: {},
                config: originalRequest,
                fromCache: true
              });
            } catch (parseError) {
              console.warn('Failed to parse cached data:', parseError);
            }
          }
        } catch (e) {
          console.warn('Failed to retrieve cached data:', e);
        }
      }
      
      // Attempt to retry network errors for GET requests
      if (
        originalRequest && 
        (originalRequest._retryCount || 0) < (NETWORK_CONFIG?.maxRetries || 3) && 
        ['get', 'head', 'options'].includes(originalRequest.method?.toLowerCase() || '') // Only retry safe methods
      ) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(
          originalRequest._retryCount * (NETWORK_CONFIG?.retryDelay || 1000) * 2, // Longer delay for network errors
          (NETWORK_CONFIG?.retryDelay || 1000) * 20
        );
        console.log(`Retrying after network error... (Attempt ${originalRequest._retryCount}/${NETWORK_CONFIG?.maxRetries || 3})`);
        
        return new Promise(resolve => {
          setTimeout(() => resolve(api(originalRequest)), delay);
        });
      }
      
      // If we've exhausted retries, show a more specific error
      if (error.code === 'ECONNABORTED') {
        error.userMessage = 'The request timed out. Please check your internet connection and try again.';
      } else {
        error.userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      // Notify the network manager of the connection failure
      networkManager.notifyListeners({
        type: 'error',
        error: error.message,
        url: originalRequest?.url,
        timestamp: Date.now()
      });
    }
    
    // Add user-friendly messages for common HTTP errors
    if (error.response) {
      // Extract error details from the response if available
      const errorDetails = error.response.data?.error || {};
      const errorType = errorDetails.type || 'unknown';
      const errorMessage = errorDetails.message || error.response.data?.message;
      
      switch (error.response.status) {
        case 400:
          error.userMessage = errorMessage || 'The request was invalid. Please check your input and try again.';
          error.errorType = errorType || 'validation_error';
          break;
        case 401:
          error.userMessage = errorMessage || 'Authentication required. Please log in again.';
          error.errorType = errorType || 'auth_error';
          break;
        case 403:
          error.userMessage = errorMessage || 'You do not have permission to access this resource.';
          error.errorType = errorType || 'permission_error';
          break;
        case 404:
          error.userMessage = errorMessage || 'The requested resource was not found.';
          error.errorType = errorType || 'not_found_error';
          break;
        case 429:
          error.userMessage = errorMessage || 'Too many requests. Please try again later.';
          error.errorType = errorType || 'rate_limit_error';
          break;
        case 500:
          error.userMessage = errorMessage || 'An internal server error occurred. Please try again later.';
          error.errorType = errorType || 'server_error';
          break;
        default:
          error.userMessage = errorMessage || 'An unexpected error occurred. Please try again.';
          error.errorType = errorType;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
