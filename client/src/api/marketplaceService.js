import api from './axios';

const marketplaceService = {
  // Get marketplace items
  getMarketplaceItems: async (filters = {}) => {
    const response = await api.get('/api/marketplace', { params: filters });
    return response.data;
  },

  // Buy an item from the marketplace
  buyItem: async (itemId, quantity = 1) => {
    const response = await api.post(`/api/marketplace/buy/${itemId}`, { quantity });
    return response.data;
  },

  // Sell an item to the marketplace
  sellItem: async (itemId, quantity = 1) => {
    const response = await api.post(`/api/marketplace/sell/${itemId}`, { quantity });
    return response.data;
  },

  // Get featured marketplace items
  getFeaturedItems: async () => {
    const response = await api.get('/api/marketplace/featured');
    return response.data;
  },

  // Get recommended items based on user level and stats
  getRecommendedItems: async () => {
    const response = await api.get('/api/marketplace/recommended');
    return response.data;
  }
};

export default marketplaceService;
