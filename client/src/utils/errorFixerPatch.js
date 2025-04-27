/**
 * Error Fixer Patch
 * 
 * This utility patches common error patterns in the application
 * to prevent [object Object] errors from appearing in the console.
 */

/**
 * Patch the error handling in the application
 * This function runs immediately when imported
 */
(function patchErrorHandling() {
  if (typeof window === 'undefined') return;

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // Helper function to format error objects
  const formatError = (error) => {
    // Handle null/undefined
    if (error == null) return 'Unknown error';
    
    // Handle strings
    if (typeof error === 'string') return error;
    
    // Handle Error objects
    if (error instanceof Error) return error.message || error.toString();
    
    // Handle objects with message property
    if (error.message) return error.message;
    
    // Handle response objects
    if (error.response && error.response.data) {
      const { data } = error.response;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      try {
        return JSON.stringify(data);
      } catch (e) {
        return `Error ${error.response.status || 'unknown'}`;
      }
    }
    
    // Try to stringify the object
    try {
      return JSON.stringify(error);
    } catch (e) {
      return '[Complex Error Object]';
    }
  };

  // Override console.error
  console.error = function(...args) {
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error || (arg && typeof arg === 'object')) {
        return formatError(arg);
      }
      return arg;
    });
    
    originalConsoleError.apply(console, formattedArgs);
  };

  // Override console.warn
  console.warn = function(...args) {
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error || (arg && typeof arg === 'object')) {
        return formatError(arg);
      }
      return arg;
    });
    
    originalConsoleWarn.apply(console, formattedArgs);
  };

  // Override console.log
  console.log = function(...args) {
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error || (arg && typeof arg === 'object')) {
        return formatError(arg);
      }
      return arg;
    });
    
    originalConsoleLog.apply(console, formattedArgs);
  };

  // Direct patch for the specific error in bundle.js
  window.handleError = function(error) {
    if (error == null) return 'Unknown error';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message || error.toString();
    if (error.message) return error.message;
    
    try {
      return JSON.stringify(error);
    } catch (e) {
      return '[Complex Error Object]';
    }
  };

  // Fix for Axios mergeDeepProperties slice() error
  try {
    // Only apply if axios is available
    const axios = require('axios');
    
    // Check if mergeConfig exists
    if (typeof axios.mergeConfig === 'function') {
      // Store the original function
      const originalMergeConfig = axios.mergeConfig;
      
      // Override with a safer version
      axios.mergeConfig = function safeConfigMerge(config1, config2) {
        // Ensure both configs exist
        config1 = config1 || {};
        config2 = config2 || {};
        
        // Ensure headers exist
        config1.headers = config1.headers || {};
        config2.headers = config2.headers || {};
        
        try {
          // Try the original merge
          return originalMergeConfig(config1, config2);
        } catch (error) {
          console.warn('Error in axios.mergeConfig, using safe fallback:', error.message);
          
          // Manual merge as fallback
          const result = { ...config1, ...config2 };
          
          // Manually merge headers
          result.headers = { ...config1.headers, ...config2.headers };
          
          return result;
        }
      };
      
      // Patch the utils.merge function if it exists (internal axios function)
      if (axios.utils && typeof axios.utils.merge === 'function') {
        const originalMerge = axios.utils.merge;
        
        axios.utils.merge = function safeMerge(...args) {
          try {
            // Try the original merge
            return originalMerge(...args);
          } catch (error) {
            console.warn('Error in axios.utils.merge, using safe fallback:', error.message);
            
            // Simple object spread as fallback
            return Object.assign({}, ...args);
          }
        };
      }
      
      console.log('Applied Axios mergeConfig patch successfully');
    }
  } catch (e) {
    console.warn('Failed to apply Axios patch:', e);
  }

  console.log('Error fixer patch applied');
})();
