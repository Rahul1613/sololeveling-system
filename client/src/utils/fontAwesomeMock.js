/**
 * Font Awesome Mock Module
 * 
 * This file creates a mock implementation of the @fortawesome/fontawesome-svg-core module
 * to resolve the dependency error without requiring the actual package.
 */

// Create a mock icon object
const createMockIcon = (name) => ({
  iconName: name,
  prefix: 'fas',
  icon: [512, 512, [], name, "M0 0h512v512H0z"]
});

// Mock the core library functions
const library = {
  add: () => {},
  reset: () => {}
};

// Mock the dom functions
const dom = {
  css: () => {},
  watch: () => {}
};

// Mock the parse functions
const parse = {
  transform: () => ({}),
  icon: () => ({})
};

// Export all the mock functions and objects
export {
  library,
  dom,
  parse,
  createMockIcon
};

// Export a default object to satisfy module imports
export default {
  library,
  dom,
  parse,
  createMockIcon
};
