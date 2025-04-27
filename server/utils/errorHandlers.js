/**
 * Utility functions for error handling and data validation
 */

/**
 * Safely access nested properties without throwing errors
 * @param {Object} obj - The object to access
 * @param {String} path - The path to the property (e.g., 'user.activeQuests.0.quest')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} - The property value or defaultValue
 */
const safeGet = (obj, path, defaultValue = null) => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    
    if (Array.isArray(result) && !isNaN(key)) {
      result = result[parseInt(key)];
    } else {
      result = result[key];
    }
    
    if (result === undefined) {
      return defaultValue;
    }
  }
  
  return result !== undefined ? result : defaultValue;
};

/**
 * Safely filter an array with null checks
 * @param {Array} arr - The array to filter
 * @param {Function} predicate - Filter function
 * @returns {Array} - Filtered array
 */
const safeFilter = (arr, predicate) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.filter(item => item !== null && item !== undefined && predicate(item));
};

/**
 * Safely find an index in an array with null checks
 * @param {Array} arr - The array to search
 * @param {Function} predicate - Find function
 * @returns {Number} - Found index or -1
 */
const safeFindIndex = (arr, predicate) => {
  if (!arr || !Array.isArray(arr)) return -1;
  return arr.findIndex(item => item !== null && item !== undefined && predicate(item));
};

/**
 * Create a standardized error response
 * @param {String} message - Error message
 * @param {Number} status - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Object} - Error response object
 */
const errorResponse = (message, status = 500, details = null) => {
  const response = { message, status };
  if (details) response.details = details;
  return response;
};

module.exports = {
  safeGet,
  safeFilter,
  safeFindIndex,
  errorResponse
};
