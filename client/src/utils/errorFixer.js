/**
 * Error Fixer Utility
 * 
 * This utility provides functions to fix common errors in the application,
 * particularly those related to Font Awesome and other dependencies.
 */

/**
 * Fix Font Awesome errors by patching the global window object
 * This prevents "[object Object]" errors from Font Awesome
 */
export const fixFontAwesomeErrors = () => {
  // Check if window is defined (we're in a browser environment)
  if (typeof window !== 'undefined') {
    // Create a mock FontAwesome object if it doesn't exist
    if (!window.FontAwesome) {
      window.FontAwesome = {
        icon: () => null,
        layer: () => null,
        text: () => null,
        dom: {
          css: () => null,
          watch: () => null
        },
        parse: {
          transform: () => null
        },
        findIconDefinition: () => null
      };
    }
    
    // Create a mock fontawesome-svg-core module
    if (!window.__FONT_AWESOME__) {
      window.__FONT_AWESOME__ = {
        styles: {},
        hooks: {},
        shims: [],
        layers: () => null,
        parse: {
          icon: () => null,
          transform: () => null
        }
      };
    }
    
    console.log('Font Awesome error patches applied');
  }
};

/**
 * Initialize all error fixes
 * Call this function early in the application lifecycle
 */
export const initErrorFixes = () => {
  try {
    fixFontAwesomeErrors();
    console.log('Error fixes initialized successfully');
  } catch (error) {
    console.error('Failed to initialize error fixes:', error);
  }
};

export default {
  fixFontAwesomeErrors,
  initErrorFixes
};
