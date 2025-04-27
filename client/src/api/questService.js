import api from './axios';
import mockQuestService from './mockQuestService';

// Determine if we should use mock service
const shouldUseMockService = () => {
  // Always use mock service for now
  // In a real app, this would be based on environment variables
  return true;
};

/**
 * Quest Service - Handles all quest-related API calls
 */
const questService = {
  /**
   * Get all available quests
   * @param {Object} filters - Optional filters (category, difficulty, etc.)
   * @returns {Promise<Array>} List of available quests
   */
  getQuests: async (filters = {}) => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.getQuests(filters);
      }
      
      const response = await api.get('/api/quests', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching quests:', error);
      throw error;
    }
  },

  /**
   * Get user's active quests
   * @returns {Promise<Array>} List of user's active quests
   */
  getActiveQuests: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.getActiveQuests();
      }
      
      const response = await api.get('/api/quests/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active quests:', error);
      throw error;
    }
  },

  /**
   * Get user's completed quests
   * @returns {Promise<Array>} List of user's completed quests
   */
  getCompletedQuests: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.getCompletedQuests();
      }
      
      const response = await api.get('/api/quests/completed');
      return response.data;
    } catch (error) {
      console.error('Error fetching completed quests:', error);
      throw error;
    }
  },

  /**
   * Accept a quest
   * @param {string} questId - ID of the quest to accept
   * @returns {Promise<Object>} The accepted quest
   */
  acceptQuest: async (questId) => {
    try {
      console.log('QuestService: Accepting quest with ID:', questId);
      
      if (shouldUseMockService()) {
        const response = await mockQuestService.acceptQuest(questId);
        console.log('QuestService: Mock service response:', response);
        return response;
      }
      
      const response = await api.post(`/api/quests/accept/${questId}`);
      return response.data;
    } catch (error) {
      console.error('Error accepting quest:', error);
      throw error;
    }
  },

  /**
   * Update quest progress
   * @param {string} questId - ID of the quest to update
   * @param {number} progress - Progress value (0-100)
   * @returns {Promise<Object>} Updated quest data
   */
  updateQuestProgress: async (questId, progress) => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.updateQuestProgress(questId, progress);
      }
      
      const response = await api.post(`/api/quests/${questId}/progress`, { progress });
      return response.data;
    } catch (error) {
      console.error(`Error updating progress for quest ${questId}:`, error);
      throw error;
    }
  },

  /**
   * Complete a quest
   * @param {string} questId - ID of the quest to complete
   * @param {File} proofFile - Optional proof file (image/video)
   * @returns {Promise<Object>} Completed quest data with rewards
   */
  completeQuest: async (questId, proofFile = null) => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.completeQuest(questId, proofFile);
      }
      
      let formData = null;
      
      if (proofFile) {
        formData = new FormData();
        formData.append('proof', proofFile);
        
        // Add metadata about the proof
        if (proofFile.type) {
          formData.append('proofType', proofFile.type);
        }
      }
      
      const response = await api.post(
        `/api/quests/${questId}/complete`, 
        formData || {},
        {
          headers: {
            'Content-Type': formData ? 'multipart/form-data' : 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error completing quest ${questId}:`, error);
      throw error;
    }
  },

  /**
   * Abandon a quest
   * @param {string} questId - ID of the quest to abandon
   * @returns {Promise<Object>} Result of abandoning the quest
   */
  abandonQuest: async (questId) => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.abandonQuest(questId);
      }
      
      const response = await api.post(`/api/quests/${questId}/abandon`);
      return response.data;
    } catch (error) {
      console.error(`Error abandoning quest ${questId}:`, error);
      throw error;
    }
  },

  /**
   * Get daily quests
   * @returns {Promise<Array>} List of daily quests
   */
  getDailyQuests: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.getDailyQuests();
      }
      
      const response = await api.get('/api/quests/daily');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily quests:', error);
      throw error;
    }
  },

  /**
   * Get emergency quests
   * @returns {Promise<Array>} List of emergency quests
   */
  getEmergencyQuests: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.getEmergencyQuests();
      }
      
      const response = await api.get('/api/quests/emergency');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency quests:', error);
      throw error;
    }
  },
  
  /**
   * Get punishment quests
   * @returns {Promise<Array>} List of punishment quests
   */
  getPunishmentQuests: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.getPunishmentQuests();
      }
      
      const response = await api.get('/api/quests/punishment');
      return response.data;
    } catch (error) {
      console.error('Error fetching punishment quests:', error);
      throw error;
    }
  },
  
  /**
   * Create a custom quest
   * @param {Object} questData - Quest data (title, description, etc.)
   * @returns {Promise<Object>} Created quest data
   */
  createCustomQuest: async (questData) => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.createCustomQuest(questData);
      }
      
      const response = await api.post('/api/custom-quests', questData);
      return response.data;
    } catch (error) {
      console.error('Error creating custom quest:', error);
      throw error;
    }
  },
  
  /**
   * Get custom quests
   * @returns {Promise<Array>} List of custom quests
   */
  getCustomQuests: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.getCustomQuests();
      }
      
      const response = await api.get('/api/custom-quests');
      return response.data;
    } catch (error) {
      console.error('Error fetching custom quests:', error);
      throw error;
    }
  },
  
  /**
   * Submit verification for a quest
   * @param {string} questId - ID of the quest to verify
   * @param {Object} verificationData - Verification data
   * @returns {Promise<Object>} Verification result
   */
  submitVerification: async (questId, verificationData) => {
    try {
      if (shouldUseMockService()) {
        return await mockQuestService.submitVerification(questId, verificationData);
      }
      
      const response = await api.post(`/api/verification/${questId}`, verificationData);
      return response.data;
    } catch (error) {
      console.error(`Error submitting verification for quest ${questId}:`, error);
      throw error;
    }
  }
};

export default questService;
