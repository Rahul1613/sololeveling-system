import api from './axios';
import mockMarketplaceService from './mockMarketplaceService';
import databaseService from './databaseService';

// Determine if we should use mock service
const shouldUseMockService = () => {
  // Use mock service in development or when explicitly set
  return process.env.NODE_ENV === 'development' || 
         process.env.REACT_APP_USE_MOCK_API === 'true' || 
         window.location.hostname === 'localhost';
};

const marketplaceService = {
  // Get marketplace items
  getMarketplaceItems: async (filters = {}) => {
    try {
      console.log('MarketplaceService: Getting items with filters:', filters);
      
      // Check if we should use mock service
      const useMock = shouldUseMockService();
      
      // Try to get from database service first if we're not refreshing
      if (!filters.refresh) {
        const storedItems = databaseService.loadFromStorage('marketplace_items', []);
        if (storedItems && storedItems.length > 0) {
          console.log('MarketplaceService: Using cached items from storage');
          
          // Apply filters to stored items
          let filteredItems = [...storedItems];
          
          // Apply type filter
          if (filters.type && filters.type !== '') {
            filteredItems = filteredItems.filter(item => item.type === filters.type);
          }
          
          // Apply rarity filter
          if (filters.rarity && filters.rarity !== '') {
            filteredItems = filteredItems.filter(item => item.rarity === filters.rarity);
          }
          
          // Apply level range filter
          if (filters.minLevel !== undefined && filters.maxLevel !== undefined) {
            filteredItems = filteredItems.filter(item => 
              item.level >= filters.minLevel && item.level <= filters.maxLevel
            );
          }
          
          // Apply price range filter
          if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
            filteredItems = filteredItems.filter(item => 
              item.price >= filters.minPrice && item.price <= filters.maxPrice
            );
          }
          
          // If we have results, return them
          if (filteredItems.length > 0) {
            return { items: filteredItems };
          }
        }
      }
      
      // If not in storage, no items match filters, or refresh requested, get from API/mock
      if (useMock) {
        const response = await mockMarketplaceService.getMarketplaceItems(filters);
        
        // Save all items to storage for future use if no specific filters applied
        if (!filters.type && !filters.rarity && !filters.minLevel && !filters.maxLevel && !filters.minPrice && !filters.maxPrice) {
          databaseService.saveToStorage('marketplace_items', response.items);
          
          // Also sync with server if we're connected
          try {
            databaseService.syncInventory(response.items).catch(err => {
              console.log('Failed to sync marketplace items with server:', err);
            });
          } catch (syncError) {
            console.error('Error during marketplace sync:', syncError);
          }
        }
        
        return response;
      }
      
      // If not using mock, get from real API
      const response = await api.get('/api/marketplace', { params: filters });
      
      // Save all items to storage for future use if no filters applied
      if (!filters.type && !filters.rarity && !filters.minLevel && !filters.maxLevel && !filters.minPrice && !filters.maxPrice) {
        databaseService.saveToStorage('marketplace_items', response.data.items);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      // If error occurs and we have cached data, use that as fallback
      const storedItems = databaseService.loadFromStorage('marketplace_items', []);
      if (storedItems && storedItems.length > 0) {
        console.log('MarketplaceService: Using cached items as fallback due to error');
        return { items: storedItems, fromCache: true };
      }
      throw error;
    }
  },

  // Buy an item from the marketplace
  buyItem: async (itemId, quantity = 1) => {
    try {
      console.log(`MarketplaceService: Buying item ${itemId}, quantity: ${quantity}`);
      
      if (shouldUseMockService()) {
        const response = await mockMarketplaceService.buyItem(itemId, quantity);
        
        // Update stored items if the item is limited
        if (response.item.isLimited) {
          const storedItems = databaseService.loadFromStorage('marketplace_items', []);
          if (storedItems && storedItems.length > 0) {
            const updatedItems = storedItems.map(item => 
              item._id === itemId 
                ? { ...item, limitedQuantity: response.item.limitedQuantity }
                : item
            );
            databaseService.saveToStorage('marketplace_items', updatedItems);
          }
        }
        
        // Add item to inventory using the databaseService's proper method
        const inventory = databaseService.loadFromStorage('inventory', []);
        const existingItem = inventory.find(item => item._id === itemId);
        
        let updatedInventory;
        if (existingItem) {
          // Update quantity if item already exists
          updatedInventory = inventory.map(item => 
            item._id === itemId 
              ? { ...item, quantity: (item.quantity || 1) + quantity }
              : item
          );
        } else {
          // Add new item to inventory
          const newItem = { ...response.item, quantity: quantity };
          updatedInventory = [...inventory, newItem];
        }
        
        // Use the proper databaseService method to ensure syncing
        databaseService.saveInventoryItem({
          items: updatedInventory,
          lastUpdated: new Date().toISOString()
        });
        
        // Update user currency through proper channels
        const user = databaseService.loadFromStorage('user', null);
        if (user) {
          const updatedUser = { 
            ...user, 
            currency: (user.currency || 0) - (response.item.price * quantity) 
          };
          databaseService.saveToStorage('user', updatedUser);
          
          // Sync user data with server
          try {
            databaseService.syncUser(updatedUser).catch(err => {
              console.log('Failed to sync user data after purchase:', err);
            });
          } catch (syncError) {
            console.error('Error during user sync after purchase:', syncError);
          }
        }
        
        // Save transaction history
        const transactions = databaseService.loadFromStorage('transactions', []);
        const updatedTransactions = [response.transaction, ...transactions];
        databaseService.saveToStorage('transactions', updatedTransactions);
        
        return response;
      }
      
      const response = await api.post(`/api/marketplace/buy/${itemId}`, { quantity });
      
      // If successful API call, update local data
      if (response.data && response.data.success) {
        // Update inventory
        const inventory = databaseService.loadFromStorage('inventory', []);
        const item = response.data.item;
        
        // Update inventory locally to match server response
        databaseService.saveInventoryItem({
          items: response.data.inventory || inventory,
          lastUpdated: new Date().toISOString()
        });
        
        // Update user data
        if (response.data.user) {
          databaseService.saveToStorage('user', response.data.user);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error buying item ${itemId}:`, error);
      throw error;
    }
  },

  // Sell an item to the marketplace
  sellItem: async (itemId, quantity = 1) => {
    try {
      console.log(`MarketplaceService: Selling item ${itemId}, quantity: ${quantity}`);
      
      if (shouldUseMockService()) {
        const response = await mockMarketplaceService.sellItem(itemId, quantity);
        
        // Update stored items if the item is limited
        if (response.item.isLimited) {
          const storedItems = databaseService.loadFromStorage('marketplace_items', []);
          if (storedItems && storedItems.length > 0) {
            const updatedItems = storedItems.map(item => 
              item._id === itemId 
                ? { ...item, limitedQuantity: response.item.limitedQuantity }
                : item
            );
            databaseService.saveToStorage('marketplace_items', updatedItems);
          }
        }
        
        // Remove item from inventory
        const inventory = databaseService.loadFromStorage('inventory', []);
        const existingItem = inventory.find(item => item._id === itemId);
        
        if (existingItem) {
          if ((existingItem.quantity || 1) <= quantity) {
            // Remove item completely if selling all
            const updatedInventory = inventory.filter(item => item._id !== itemId);
            databaseService.saveToStorage('inventory', updatedInventory);
          } else {
            // Decrease quantity
            const updatedInventory = inventory.map(item => 
              item._id === itemId 
                ? { ...item, quantity: (item.quantity || 1) - quantity }
                : item
            );
            databaseService.saveToStorage('inventory', updatedInventory);
          }
        }
        
        // Update user currency
        const user = databaseService.loadFromStorage('user', null);
        if (user) {
          const sellPrice = Math.floor(response.item.price * 0.7) * quantity; // 70% of original price
          const updatedUser = { 
            ...user, 
            currency: (user.currency || 0) + sellPrice 
          };
          databaseService.saveToStorage('user', updatedUser);
        }
        
        // Save transaction history
        const transactions = databaseService.loadFromStorage('transactions', []);
        databaseService.saveToStorage('transactions', [response.transaction, ...transactions]);
        
        return response;
      }
      
      const response = await api.post(`/api/marketplace/sell/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error(`Error selling item ${itemId}:`, error);
      throw error;
    }
  },

  // Get featured marketplace items
  getFeaturedItems: async () => {
    try {
      console.log('MarketplaceService: Getting featured items');
      
      // Try to get from database service first
      const storedFeatured = databaseService.loadFromStorage('featured_items', []);
      if (storedFeatured && storedFeatured.length > 0) {
        console.log('MarketplaceService: Using cached featured items from storage');
        return { items: storedFeatured };
      }
      
      if (shouldUseMockService()) {
        const response = await mockMarketplaceService.getFeaturedItems();
        
        // Save to storage for future use
        databaseService.saveToStorage('featured_items', response.items);
        
        return response;
      }
      
      const response = await api.get('/api/marketplace/featured');
      
      // Save to storage for future use
      databaseService.saveToStorage('featured_items', response.data.items);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching featured items:', error);
      throw error;
    }
  },

  // Get recommended items based on user level and stats
  getRecommendedItems: async () => {
    try {
      console.log('MarketplaceService: Getting recommended items');
      
      // Try to get from database service first
      const storedRecommended = databaseService.loadFromStorage('recommended_items', []);
      if (storedRecommended && storedRecommended.length > 0) {
        console.log('MarketplaceService: Using cached recommended items from storage');
        return { items: storedRecommended };
      }
      
      if (shouldUseMockService()) {
        const response = await mockMarketplaceService.getRecommendedItems();
        
        // Save to storage for future use
        databaseService.saveToStorage('recommended_items', response.items);
        
        return response;
      }
      
      const response = await api.get('/api/marketplace/recommended');
      
      // Save to storage for future use
      databaseService.saveToStorage('recommended_items', response.data.items);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended items:', error);
      throw error;
    }
  },
  
  // Get transaction history
  getTransactionHistory: async () => {
    try {
      console.log('MarketplaceService: Getting transaction history');
      
      // Try to get from database service first
      const transactions = databaseService.loadFromStorage('transactions', []);
      
      if (shouldUseMockService()) {
        // If using mock service, just return the stored transactions
        return { transactions };
      }
      
      const response = await api.get('/api/marketplace/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }
};

export default marketplaceService;
