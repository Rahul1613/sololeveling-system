/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns {string} The JWT token or empty string if not found
 */
export function getToken() {
  return localStorage.getItem('token') || '';
}

/**
 * Save the authentication token to localStorage
 * @param {string} token - The JWT token to save
 */
export function setToken(token) {
  localStorage.setItem('token', token);
}

/**
 * Remove the authentication token from localStorage
 */
export function removeToken() {
  localStorage.removeItem('token');
}

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token;
}

/**
 * Get the current user from localStorage
 * @returns {Object|null} The user object or null if not found
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Save the user data to localStorage
 * @param {Object} user - The user object to save
 */
export function setCurrentUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Remove the user data from localStorage
 */
export function removeCurrentUser() {
  localStorage.removeItem('user');
}

/**
 * Logout the user by removing token and user data
 */
export function logout() {
  removeToken();
  removeCurrentUser();
}
