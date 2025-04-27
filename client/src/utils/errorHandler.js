/**
 * Global Error Handler for Solo Leveling Application
 * This utility provides consistent error handling across the application
 */

/**
 * Format error message from various error types
 * @param {Error|Object|string} error - The error to format
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // If error is a string, return it directly
  if (typeof error === 'string') return error;
  
  // If error is an Error object
  if (error instanceof Error) return error.message || error.toString();
  
  // If error is a response object
  if (error.response && error.response.data) {
    const { data } = error.response;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    return JSON.stringify(data);
  }
  
  // If error is an object with message property
  if (error.message) return error.message;
  
  // Last resort: stringify the object
  try {
    return JSON.stringify(error);
  } catch (e) {
    return 'An error occurred';
  }
};

/**
 * Handle API errors consistently
 * @param {Error|Object|string} error - The error to handle
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @param {Function} setError - State setter for error (optional)
 * @returns {string} Formatted error message
 */
export const handleApiError = (error, dispatch = null, setError = null) => {
  const errorMessage = formatErrorMessage(error);
  
  // If dispatch is provided, dispatch notification action
  if (dispatch && typeof dispatch === 'function') {
    try {
      dispatch({
        type: 'notifications/addNotification',
        payload: {
          type: 'error',
          message: errorMessage,
          title: 'Error',
          duration: 5000
        }
      });
    } catch (e) {
      console.error('Failed to dispatch notification:', e);
    }
  }
  
  // If setError is provided, update local state
  if (setError && typeof setError === 'function') {
    setError(errorMessage);
  }
  
  // Always log the error
  console.error('API Error:', error);
  
  return errorMessage;
};

/**
 * Initialize error tracking
 * This sets up global error handlers for uncaught exceptions
 */
export const initErrorTracking = () => {
  // Set up global error handler
  window.onerror = function(message, source, lineno, colno, error) {
    // Ignore ResizeObserver errors as they're generally harmless
    if (message && message.includes('ResizeObserver loop') || 
        (error && error.message && error.message.includes('ResizeObserver loop'))) {
      // Suppress ResizeObserver warnings
      return true; // Prevent default handling
    }
    
    console.error('Global error:', {
      message,
      source,
      lineno,
      colno,
      error
    });
    
    // Format and display error message
    const formattedError = formatErrorMessage(error || message);
    console.error('Formatted error:', formattedError);
    
    return false; // Let the default handler run
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    // Ignore ResizeObserver errors in promise rejections
    if (event.reason && 
        ((typeof event.reason.message === 'string' && event.reason.message.includes('ResizeObserver loop')) ||
         (typeof event.reason === 'string' && event.reason.includes('ResizeObserver loop')))) {
      event.preventDefault();
      return;
    }
    
    console.error('Unhandled promise rejection:', event.reason);
    
    // Format and display error message
    const formattedError = formatErrorMessage(event.reason);
    console.error('Formatted error:', formattedError);
  });
  
  console.log('Global error tracking initialized');
};

// Patch the global Error object to improve error formatting
if (typeof window !== 'undefined') {
  // Override Error.toString to provide better formatting
  const originalToString = Error.prototype.toString;
  Error.prototype.toString = function() {
    if (this.message) {
      return `${this.name}: ${this.message}`;
    }
    return originalToString.call(this);
  };
  
  // Add a global error handler for the specific [object Object] error
  window.handleError = function(error) {
    return formatErrorMessage(error);
  };
}

export default {
  formatErrorMessage,
  handleApiError,
  initErrorTracking
};
