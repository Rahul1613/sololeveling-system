/**
 * Offline Synchronization Utility
 * 
 * This utility handles data synchronization when the application goes offline and comes back online.
 * It stores pending operations in localStorage and processes them when the connection is restored.
 */
import networkManager from './networkManager';
import api from '../api/axios';

// Storage keys
const STORAGE_KEYS = {
  PENDING_OPERATIONS: 'solo-leveling-pending-operations',
  OFFLINE_DATA: 'solo-leveling-offline-data'
};

// Helper functions for localStorage
function getStoredOperations() {
  try {
    const storedOps = localStorage.getItem(STORAGE_KEYS.PENDING_OPERATIONS);
    return storedOps ? JSON.parse(storedOps) : [];
  } catch (error) {
    console.error('Failed to get stored operations:', error);
    return [];
  }
}

function storeOperations(operations) {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_OPERATIONS, JSON.stringify(operations));
  } catch (error) {
    console.error('Failed to store operations:', error);
  }
}

function getStoredData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
    return storedData ? JSON.parse(storedData) : {};
  } catch (error) {
    console.error('Failed to get stored data:', error);
    return {};
  }
}

function storeData(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to store data:', error);
  }
}

/**
 * Queue an operation to be performed when online
 * @param {string} type - Operation type (e.g., 'quest', 'inventory', etc.)
 * @param {string} action - Action to perform (e.g., 'create', 'update', 'delete')
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Operation data
 * @param {string} method - HTTP method
 * @returns {Promise<number>} Operation ID
 */
async function queueOperation(type, action, endpoint, data, method = 'POST') {
  const operations = getStoredOperations();
  
  const operation = {
    id: Date.now(),
    type,
    action,
    endpoint,
    data,
    method,
    attempts: 0,
    lastAttempt: null
  };
  
  operations.push(operation);
  storeOperations(operations);
  
  console.log(`Operation queued for offline sync: ${type}.${action}`, operation);
  
  return operation.id;
}

/**
 * Process pending operations when online
 * @returns {Array} Results of processed operations
 */
async function processPendingOperations() {
  if (!networkManager.isNetworkOnline()) {
    console.log('Cannot process pending operations: network is offline');
    return [];
  }
  
  try {
    const operations = getStoredOperations();
    
    if (operations.length === 0) {
      console.log('No pending operations to process');
      return [];
    }
    
    console.log(`Processing ${operations.length} pending operations...`);
    
    const results = [];
    const completedOps = [];
    const failedOps = [];
    const updatedOps = [];
    
    for (const operation of operations) {
      try {
        // Update attempt count
        operation.attempts += 1;
        operation.lastAttempt = Date.now();
        
        // Skip operations that have been attempted too many times
        if (operation.attempts > 5) {
          console.warn(`Operation ${operation.id} has been attempted too many times, skipping`);
          failedOps.push(operation.id);
          continue;
        }
        
        // Process the operation
        console.log(`Processing operation ${operation.id}: ${operation.type} ${operation.action}`);
        
        const response = await api({
          method: operation.method,
          url: operation.endpoint,
          data: operation.data,
          headers: {
            'X-Offline-Operation': 'true',
            'X-Offline-Operation-ID': operation.id.toString()
          }
        });
        
        results.push({
          id: operation.id,
          success: true,
          data: response.data
        });
        
        completedOps.push(operation.id);
      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        
        // If it's a server error, we'll retry later
        if (error.response && error.response.status >= 500) {
          updatedOps.push(operation);
        } else {
          // For client errors, we won't retry
          failedOps.push(operation.id);
          
          results.push({
            id: operation.id,
            success: false,
            error: error.message || 'Unknown error'
          });
        }
      }
    }
    
    // Update the operations list
    const remainingOps = operations.filter(op => {
      return !completedOps.includes(op.id) && !failedOps.includes(op.id);
    });
    
    // Add the updated operations
    const newOperations = [...remainingOps, ...updatedOps];
    storeOperations(newOperations);
    
    console.log(`Removed ${completedOps.length} completed and ${failedOps.length} failed operations`);
    
    return results;
  } catch (error) {
    console.error('Failed to process pending operations:', error);
    return [];
  }
}

/**
 * Store data for offline use
 * @param {string} key - Data key
 * @param {Object} data - Data to store
 * @param {number} ttl - Time to live in milliseconds (default: 24 hours)
 * @returns {Promise<void>}
 */
async function storeOfflineData(key, data, ttl = 24 * 60 * 60 * 1000) {
  const offlineData = getStoredData();
  
  const item = {
    data,
    expiresAt: Date.now() + ttl
  };
  
  offlineData[key] = item;
  storeData(offlineData);
}

/**
 * Get stored offline data
 * @param {string} key - Data key
 * @returns {Object|null} Stored data or null if not found or expired
 */
function getOfflineData(key) {
  try {
    const offlineData = getStoredData();
    const item = offlineData[key];
    
    if (!item) {
      console.log(`No offline data found for key: ${key}`);
      return null;
    }
    
    // Check if data has expired
    if (item.expiresAt < Date.now()) {
      console.log(`Offline data for key ${key} has expired`);
      
      // Delete expired data
      delete offlineData[key];
      storeData(offlineData);
      
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error(`Failed to get offline data for key ${key}:`, error);
    return null;
  }
}

/**
 * Clear expired offline data
 * @returns {number} Number of items cleared
 */
function clearExpiredData() {
  try {
    const offlineData = getStoredData();
    const now = Date.now();
    let clearedCount = 0;
    
    // Find and remove expired items
    Object.keys(offlineData).forEach(key => {
      if (offlineData[key].expiresAt < now) {
        delete offlineData[key];
        clearedCount++;
      }
    });
    
    if (clearedCount > 0) {
      storeData(offlineData);
      console.log(`Cleared ${clearedCount} expired offline data items`);
    }
    
    return clearedCount;
  } catch (error) {
    console.error('Failed to clear expired data:', error);
    return 0;
  }
}

/**
 * Initialize offline sync
 * Sets up event listeners for online/offline events
 */
const initOfflineSync = () => {
  // Process pending operations when we come back online
  window.addEventListener('online', async () => {
    console.log('Device is online, processing pending operations');
    await processPendingOperations();
  });
  
  // Also process when the network manager detects a server connection
  networkManager.addListener(async (event) => {
    if (event.type === 'server' && event.isReachable) {
      console.log('Server is reachable, processing pending operations');
      await processPendingOperations();
    }
  });
  
  // Clear expired data periodically
  setInterval(async () => {
    const cleared = await clearExpiredData();
    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired offline data items`);
    }
  }, 30 * 60 * 1000); // Every 30 minutes
  
  // Initial cleanup
  clearExpiredData();
};

// Initialize when imported
initOfflineSync();

export default {
  queueOperation,
  processPendingOperations,
  storeOfflineData,
  getOfflineData,
  clearExpiredData
};
