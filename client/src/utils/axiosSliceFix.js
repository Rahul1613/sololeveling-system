/**
 * Direct fix for Axios slice() error
 * 
 * This file provides a runtime patch for the specific Axios error:
 * "Cannot read properties of undefined (reading 'slice')"
 */

/**
 * Apply a direct fix for the Axios slice error by monkey patching
 * the internal functions that are causing the issue
 */
export function fixAxiosSliceError() {
  console.log('Applying direct fix for Axios slice error...');
  
  try {
    // Get the webpack module cache
    const webpackModuleCache = window.__webpack_module_cache__;
    if (!webpackModuleCache) {
      console.warn('Cannot find webpack module cache, fix may not work');
      return false;
    }
    
    // Find all modules
    const moduleIds = Object.keys(webpackModuleCache);
    
    // Find the axios modules
    let axiosModules = [];
    for (const id of moduleIds) {
      const module = webpackModuleCache[id];
      if (!module || !module.exports) continue;
      
      // Check if this is an axios module by looking for common axios exports
      const exports = module.exports;
      if (
        (exports.isAxiosError || exports.CanceledError || exports.Axios) ||
        (typeof exports === 'function' && exports.toString().includes('axios'))
      ) {
        axiosModules.push({ id, module });
      }
    }
    
    console.log(`Found ${axiosModules.length} potential Axios modules`);
    
    // Apply fixes to each module
    let fixesApplied = 0;
    for (const { id, module } of axiosModules) {
      try {
        // Fix 1: Patch isPlainObject function (where the slice error occurs)
        if (module.exports.isPlainObject) {
          const originalIsPlainObject = module.exports.isPlainObject;
          module.exports.isPlainObject = function safeIsPlainObject(val) {
            try {
              if (val === undefined || val === null) return false;
              return originalIsPlainObject(val);
            } catch (e) {
              console.warn('Prevented error in isPlainObject:', e.message);
              return false;
            }
          };
          fixesApplied++;
        }
        
        // Fix 2: Patch utils.merge function
        if (module.exports.merge) {
          const originalMerge = module.exports.merge;
          module.exports.merge = function safeMerge(...args) {
            try {
              // Filter out undefined arguments
              const safeArgs = args.map(arg => arg === undefined ? {} : arg);
              return originalMerge(...safeArgs);
            } catch (e) {
              console.warn('Prevented error in merge:', e.message);
              // Fallback implementation
              return Object.assign({}, ...args.map(arg => arg === undefined ? {} : arg));
            }
          };
          fixesApplied++;
        }
        
        // Fix 3: Find and patch mergeConfig
        if (module.exports.mergeConfig) {
          const originalMergeConfig = module.exports.mergeConfig;
          module.exports.mergeConfig = function safeMergeConfig(config1, config2) {
            try {
              // Ensure configs are objects
              config1 = config1 || {};
              config2 = config2 || {};
              
              // Ensure headers exist
              config1.headers = config1.headers || {};
              config2.headers = config2.headers || {};
              
              return originalMergeConfig(config1, config2);
            } catch (e) {
              console.warn('Prevented error in mergeConfig:', e.message);
              // Fallback implementation
              return {
                ...config1,
                ...config2,
                headers: {
                  ...config1.headers,
                  ...config2.headers
                }
              };
            }
          };
          fixesApplied++;
        }
      } catch (e) {
        console.error(`Error patching Axios module ${id}:`, e);
      }
    }
    
    console.log(`Applied ${fixesApplied} fixes to Axios modules`);
    return fixesApplied > 0;
  } catch (e) {
    console.error('Failed to apply Axios slice error fix:', e);
    return false;
  }
}

export default {
  fixAxiosSliceError
};
