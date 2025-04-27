/**
 * Mock implementation of @fortawesome/fontawesome-svg-core
 * This file provides a mock implementation of the Font Awesome core library
 * to resolve dependency issues without requiring the actual package.
 */

// Mock icon creation function
export function icon() {
  return { 
    html: [], 
    node: document.createElement('span'),
    abstract: []
  };
}

// Mock library functions
export const library = {
  add: () => {},
  reset: () => {}
};

// Mock DOM functions
export const dom = {
  css: () => {},
  watch: () => {}
};

// Mock parse functions
export const parse = {
  transform: () => ({}),
  icon: () => ({})
};

// Mock layer function
export function layer() {
  return {
    html: [],
    abstract: []
  };
}

// Mock text function
export function text() {
  return {
    html: [],
    abstract: []
  };
}

// Mock counter function
export function counter() {
  return {
    html: [],
    abstract: []
  };
}

// Export a default object to satisfy module imports
export default {
  icon,
  library,
  dom,
  parse,
  layer,
  text,
  counter
};
