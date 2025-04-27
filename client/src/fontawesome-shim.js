/**
 * Font Awesome Shim
 * 
 * This file provides a compatibility layer for Font Awesome imports
 * It redirects all Font Awesome imports to our custom icon components
 */

// Re-export everything from our custom icon components
export * from './components/icons';

// Export a default object to satisfy module imports
import * as icons from './components/icons';
export default icons;
