/**
 * Global Error Interceptor
 * 
 * This utility intercepts and formats all errors in the application
 * to prevent [object Object] errors from appearing in the console.
 */

/**
 * Format an error object into a readable string
 * @param {Error|Object|string} error - The error to format
 * @returns {string} Formatted error message
 */
const formatError = (error) => {
  // If error is null or undefined
  if (error == null) return 'Unknown error occurred';
  
  // If error is already a string
  if (typeof error === 'string') return error;
  
  // If error is an Error object
  if (error instanceof Error) return error.message || error.toString();
  
  // If error is a response object from axios or fetch
  if (error.response) {
    const { response } = error;
    if (response.data) {
      if (typeof response.data === 'string') return response.data;
      if (response.data.message) return response.data.message;
      if (response.data.error) return response.data.error;
      try {
        return JSON.stringify(response.data);
      } catch (e) {
        return `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
      }
    }
    return `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
  }
  
  // If error has a message property
  if (error.message) return error.message;
  
  // Last resort: try to stringify the object
  try {
    return JSON.stringify(error);
  } catch (e) {
    return 'Error object could not be serialized';
  }
};

/**
 * Initialize the global error interceptor
 */
export const initGlobalErrorInterceptor = () => {
  // Save original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  
  // Override console.error to intercept and format errors
  console.error = function(...args) {
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error || (arg && typeof arg === 'object')) {
        return formatError(arg);
      }
      return arg;
    });
    
    originalConsoleError.apply(console, formattedArgs);
  };
  
  // Override console.warn to intercept and format errors
  console.warn = function(...args) {
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error || (arg && typeof arg === 'object')) {
        return formatError(arg);
      }
      return arg;
    });
    
    originalConsoleWarn.apply(console, formattedArgs);
  };
  
  // Override console.log to intercept and format errors
  console.log = function(...args) {
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error || (arg && typeof arg === 'object')) {
        return formatError(arg);
      }
      return arg;
    });
    
    originalConsoleLog.apply(console, formattedArgs);
  };
  
  // Override Error.prototype.toString
  const originalToString = Error.prototype.toString;
  Error.prototype.toString = function() {
    if (this.message) {
      return `${this.name}: ${this.message}`;
    }
    return originalToString.call(this);
  };
  
  // Add a global error handler function
  window.handleError = formatError;
  
  // Override JSON.stringify to handle circular references
  const originalStringify = JSON.stringify;
  JSON.stringify = function(obj, replacer, space) {
    const cache = new Set();
    const safeReplacer = (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular Reference]';
        }
        cache.add(value);
      }
      return replacer ? replacer(key, value) : value;
    };
    
    try {
      return originalStringify(obj, safeReplacer, space);
    } catch (error) {
      return '[Object cannot be stringified]';
    }
  };
  
  // Intercept global errors
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', formatError(error || message));
    return false; // Let the default handler run
  };
  
  // Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', formatError(event.reason));
    event.preventDefault();
  });
  
  console.log('Global error interceptor initialized');
};

export default {
  formatError,
  initGlobalErrorInterceptor
};
