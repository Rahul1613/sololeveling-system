import api from './axios';

/**
 * Inventory Service - Handles all inventory-related API calls
 */
const inventoryService = {
  /**
   * Get user inventory
   * @returns {Promise<Array>} List of user's inventory items
   */
  getInventory: async () => {
    try {
      const response = await api.get('/api/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  /**
   * Equip an item
   * @param {string} itemId - ID of the item to equip
   * @returns {Promise<Object>} Updated inventory data
   */
  equipItem: async (itemId) => {
    try {
      const response = await api.post(`/api/inventory/equip/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error equipping item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Unequip an item
   * @param {string} itemId - ID of the item to unequip
   * @returns {Promise<Object>} Updated inventory data
   */
  unequipItem: async (itemId) => {
    try {
      const response = await api.post(`/api/inventory/unequip/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error unequipping item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Use a consumable item
   * @param {string} itemId - ID of the item to use
   * @returns {Promise<Object>} Result of using the item
   */
  consumeItem: async (itemId) => {
    try {
      const response = await api.post(`/api/inventory/use/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error using item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Discard an item
   * @param {string} itemId - ID of the item to discard
   * @param {number} quantity - Quantity to discard
   * @returns {Promise<Object>} Updated inventory data
   */
  discardItem: async (itemId, quantity = 1) => {
    try {
      const response = await api.post(`/api/inventory/discard/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error(`Error discarding item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Get all available items
   * @param {Object} filters - Optional filters (type, rarity, etc.)
   * @returns {Promise<Array>} List of available items
   */
  getItems: async (filters = {}) => {
    try {
      const response = await api.get('/api/inventory/items', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },
  
  /**
   * Get item details
   * @param {string} itemId - ID of the item
   * @returns {Promise<Object>} Item details
   */
  getItemDetails: async (itemId) => {
    try {
      const response = await api.get(`/api/inventory/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching item details for ${itemId}:`, error);
      throw error;
    }
  },
  
  /**
   * Craft an item
   * @param {string} recipeId - ID of the recipe to craft
   * @returns {Promise<Object>} Crafted item data
   */
  craftItem: async (recipeId) => {
    try {
      const response = await api.post(`/api/inventory/craft/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error crafting item with recipe ${recipeId}:`, error);
      throw error;
    }
  },
  
  /**
   * Enhance an item
   * @param {string} itemId - ID of the item to enhance
   * @param {Array} materialItemIds - IDs of material items to use
   * @returns {Promise<Object>} Enhanced item data
   */
  enhanceItem: async (itemId, materialItemIds = []) => {
    try {
      const response = await api.post(`/api/inventory/enhance/${itemId}`, { materialItemIds });
      return response.data;
    } catch (error) {
      console.error(`Error enhancing item ${itemId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get available recipes
   * @returns {Promise<Array>} List of available recipes
   */
  getRecipes: async () => {
    try {
      const response = await api.get('/api/inventory/recipes');
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }
};

export default inventoryService;
