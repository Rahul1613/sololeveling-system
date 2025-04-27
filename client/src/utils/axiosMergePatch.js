/**
 * Axios Merge Patch
 * 
 * This file provides a safe implementation of the merge function used by Axios
 * to prevent "Cannot read properties of undefined (reading 'slice')" errors.
 */

import axios from 'axios';

/**
 * Safe implementation of merge that handles undefined values properly
 * @param {Object} obj1 - First object to merge
 * @param {Object} obj2 - Second object to merge
 * @returns {Object} - Merged object
 */
export const safeMerge = (obj1 = {}, obj2 = {}) => {
  // Create a deep copy of obj1 to avoid modifying the original
  const result = JSON.parse(JSON.stringify(obj1 || {}));
  
  // If obj2 is undefined or null, just return obj1
  if (!obj2) return result;
  
  // Process each key in obj2
  Object.keys(obj2).forEach(key => {
    const val1 = result[key];
    const val2 = obj2[key];
    
    // Skip undefined values
    if (val2 === undefined) return;
    
    // Handle arrays - avoid using slice() directly
    if (Array.isArray(val2)) {
      // If val1 is also an array, concatenate them
      if (Array.isArray(val1)) {
        result[key] = [...val1, ...val2];
      } else {
        // If val1 is not an array, just use val2
        result[key] = [...val2];
      }
    }
    // Handle objects (recursive merge)
    else if (val2 !== null && typeof val2 === 'object') {
      // If val1 is also an object, merge them
      if (val1 !== null && typeof val1 === 'object') {
        result[key] = safeMerge(val1, val2);
      } else {
        // If val1 is not an object, just use a copy of val2
        result[key] = JSON.parse(JSON.stringify(val2));
      }
    }
    // Handle primitive values
    else {
      result[key] = val2;
    }
  });
  
  return result;
};

/**
 * Safe implementation of mergeDeepProperties that handles undefined values properly
 * This is specifically targeting the function that's causing the slice() error
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @param {Object} options - Merge options
 * @returns {Object} - Merged object
 */
export const safeMergeDeepProperties = (target = {}, source = {}, options = {}) => {
  // Create a deep copy of target to avoid modifying the original
  const result = JSON.parse(JSON.stringify(target || {}));
  
  // If source is undefined or null, just return target
  if (!source) return result;
  
  // Process each key in source
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    
    // Skip undefined values
    if (sourceValue === undefined) return;
    
    // Handle arrays - this is where the slice() error typically occurs
    if (Array.isArray(sourceValue)) {
      // Create a safe copy of the array without using slice()
      const safeCopy = [...sourceValue];
      
      // If target has this key and it's an array, merge them
      if (Array.isArray(result[key])) {
        result[key] = [...result[key], ...safeCopy];
      } else {
        // Otherwise just use the safe copy
        result[key] = safeCopy;
      }
    }
    // Handle objects (recursive merge)
    else if (sourceValue !== null && typeof sourceValue === 'object') {
      // If target has this key and it's an object, merge them
      if (result[key] !== null && typeof result[key] === 'object') {
        result[key] = safeMergeDeepProperties(result[key], sourceValue, options);
      } else {
        // Otherwise just use a copy of source value
        result[key] = JSON.parse(JSON.stringify(sourceValue));
      }
    }
    // Handle primitive values
    else {
      result[key] = sourceValue;
    }
  });
  
  return result;
};

/**
 * Safe implementation of mergeConfig that handles undefined values properly
 * @param {Object} config1 - First config to merge
 * @param {Object} config2 - Second config to merge
 * @returns {Object} - Merged config
 */
export const safeMergeConfig = (config1 = {}, config2 = {}) => {
  // Create safe copies
  const safeConfig1 = config1 || {};
  const safeConfig2 = config2 || {};
  
  // Ensure headers exist
  safeConfig1.headers = safeConfig1.headers || {};
  safeConfig2.headers = safeConfig2.headers || {};
  
  // Special handling for headers to avoid slice() error
  const mergedHeaders = { ...safeConfig1.headers };
  
  // Add headers from config2 safely
  Object.keys(safeConfig2.headers).forEach(key => {
    const headerValue = safeConfig2.headers[key];
    if (headerValue !== undefined) {
      mergedHeaders[key] = headerValue;
    }
  });
  
  // Merge the rest of the properties
  return {
    ...safeConfig1,
    ...safeConfig2,
    headers: mergedHeaders
  };
};

/**
 * Apply the Axios merge patch
 * This overrides the default Axios merge functions with our safe implementations
 */
export const applyAxiosMergePatch = () => {
  try {
    console.log('Applying Axios merge patch...');
    
    // Store original functions
    const originalMergeConfig = axios.mergeConfig;
    
    // Override mergeConfig
    axios.mergeConfig = function(config1, config2) {
      try {
        console.log('Merging configs with safe implementation');
        console.log('Config1:', config1);
        console.log('Config2:', config2);
        
        return safeMergeConfig(config1, config2);
      } catch (error) {
        console.error('Error in safe mergeConfig:', error);
        
        // Try original as fallback
        try {
          return originalMergeConfig(config1 || {}, config2 || {});
        } catch (fallbackError) {
          console.error('Error in original mergeConfig:', fallbackError);
          
          // Last resort fallback
          return {
            ...(config1 || {}),
            ...(config2 || {}),
            headers: {
              ...(config1?.headers || {}),
              ...(config2?.headers || {})
            }
          };
        }
      }
    };
    
    // If we can access the internal utils
    if (axios.utils && typeof axios.utils.merge === 'function') {
      const originalMerge = axios.utils.merge;
      
      // Override utils.merge
      axios.utils.merge = function(...args) {
        try {
          return safeMerge(...args);
        } catch (error) {
          console.error('Error in safe merge:', error);
          
          // Try original as fallback
          try {
            return originalMerge(...args);
          } catch (fallbackError) {
            console.error('Error in original merge:', fallbackError);
            
            // Last resort fallback
            return Object.assign({}, ...args);
          }
        }
      };
    }
    
    // Try to patch mergeDeepProperties if we can find it
    // This is internal to Axios so we may not be able to access it directly
    try {
      // This is a bit hacky but might work in some cases
      const axiosUtils = axios.utils || {};
      if (axiosUtils.mergeDeepProperties) {
        const originalMergeDeepProperties = axiosUtils.mergeDeepProperties;
        
        axiosUtils.mergeDeepProperties = function(...args) {
          try {
            return safeMergeDeepProperties(...args);
          } catch (error) {
            console.error('Error in safe mergeDeepProperties:', error);
            
            // Try original as fallback
            try {
              return originalMergeDeepProperties(...args);
            } catch (fallbackError) {
              console.error('Error in original mergeDeepProperties:', fallbackError);
              
              // Last resort fallback
              return Object.assign({}, ...args);
            }
          }
        };
      }
    } catch (e) {
      console.warn('Could not patch mergeDeepProperties:', e);
    }
    
    console.log('Axios merge patch applied successfully');
    return true;
  } catch (error) {
    console.error('Failed to apply Axios merge patch:', error);
    return false;
  }
};

export default {
  safeMerge,
  safeMergeConfig,
  safeMergeDeepProperties,
  applyAxiosMergePatch
};
