/**
 * Custom error class for application errors
 * Extends the built-in Error class with additional properties
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} errorType - Type of error (e.g., 'validation', 'auth', 'db', etc.)
   */
  constructor(message, statusCode, errorType = 'server_error') {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = true; // Indicates this is a known operational error
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async function wrapper to catch errors in async route handlers
 * This eliminates the need for try/catch blocks in every route
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Create a validation error
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createValidationError = (message) => {
  return new AppError(message, 400, 'validation_error');
};

/**
 * Create an authentication error
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createAuthError = (message = 'Authentication failed') => {
  return new AppError(message, 401, 'auth_error');
};

/**
 * Create a forbidden error
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createForbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, 403, 'forbidden_error');
};

/**
 * Create a not found error
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createNotFoundError = (message = 'Resource not found') => {
  return new AppError(message, 404, 'not_found_error');
};

/**
 * Create a database error
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createDatabaseError = (message = 'Database operation failed') => {
  return new AppError(message, 500, 'database_error');
};

/**
 * Create a server error
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createServerError = (message = 'Internal server error') => {
  return new AppError(message, 500, 'server_error');
};

/**
 * Format error for response
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @returns {Object} - Formatted error response
 */
const formatError = (err, req) => {
  const statusCode = err.statusCode || 500;
  const errorType = err.errorType || 'server_error';
  
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      type: errorType,
      code: statusCode,
      path: req.path
    }
  };
  
  // Add request ID if available
  if (req.headers['x-request-id']) {
    errorResponse.error.requestId = req.headers['x-request-id'];
  }
  
  // Add more details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.timestamp = new Date().toISOString();
  }
  
  return errorResponse;
};

module.exports = {
  AppError,
  catchAsync,
  createValidationError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createDatabaseError,
  createServerError,
  formatError
};
