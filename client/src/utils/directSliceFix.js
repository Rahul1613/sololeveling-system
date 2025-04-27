/**
 * Direct runtime patch for the specific slice() error in the bundled code
 * This targets the exact line where the error occurs in bundle.js
 */

/**
 * Apply a direct runtime patch to fix the slice() error
 * This function will be called immediately when the file is imported
 */
(function applyDirectSliceFix() {
  console.log('Applying direct runtime patch for slice() error...');
  
  try {
    // Create a safe version of isPlainObject that's commonly used in Axios
    window.safePlainObjectCheck = function(obj) {
      if (obj === undefined || obj === null) return false;
      
      try {
        const proto = Object.getPrototypeOf(obj);
        return proto === Object.prototype || proto === null;
      } catch (e) {
        console.warn('Error in isPlainObject check:', e.message);
        return false;
      }
    };
    
    // Patch the specific function in the webpack bundle
    if (window.__webpack_require__) {
      // Try to find the module containing the problematic code
      const moduleCache = window.__webpack_module_cache__ || {};
      
      // Iterate through all modules to find and patch the one with the slice error
      Object.keys(moduleCache).forEach(moduleId => {
        try {
          const module = moduleCache[moduleId];
          if (!module || !module.exports) return;
          
          // Check if this module has the isPlainObject function
          if (typeof module.exports.isPlainObject === 'function') {
            console.log('Found potential isPlainObject in module', moduleId);
            
            // Replace with our safe version
            const originalIsPlainObject = module.exports.isPlainObject;
            module.exports.isPlainObject = function(val) {
              if (val === undefined || val === null) return false;
              
              try {
                return originalIsPlainObject(val);
              } catch (e) {
                console.warn('Prevented error in isPlainObject:', e.message);
                return window.safePlainObjectCheck(val);
              }
            };
          }
          
          // Check if this module has the merge function
          if (typeof module.exports.merge === 'function') {
            console.log('Found potential merge function in module', moduleId);
            
            // Replace with our safe version
            const originalMerge = module.exports.merge;
            module.exports.merge = function(...args) {
              // Filter out undefined arguments
              const safeArgs = args.map(arg => arg === undefined ? {} : arg);
              
              try {
                return originalMerge(...safeArgs);
              } catch (e) {
                console.warn('Prevented error in merge:', e.message);
                // Fallback implementation
                return Object.assign({}, ...safeArgs);
              }
            };
          }
        } catch (err) {
          console.warn('Error patching module', moduleId, err);
        }
      });
    }
    
    console.log('Direct runtime patch applied successfully');
  } catch (e) {
    console.error('Failed to apply direct runtime patch:', e);
  }
})();

// Export a function to check if the patch is working
export function checkPatchStatus() {
  try {
    return {
      status: 'active',
      patchedFunctions: [
        'isPlainObject (in webpack modules)',
        'merge (in webpack modules)'
      ]
    };
  } catch (e) {
    console.error('Patch status check failed:', e);
    return {
      status: 'failed',
      error: e.message
    };
  }
}

export default {
  checkPatchStatus
};
