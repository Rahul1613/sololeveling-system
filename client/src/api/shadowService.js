import api from './axios';
import mockShadowService from './mockShadowService';

// Determine if we should use mock service
const shouldUseMockService = () => {
  // Always use mock service for now
  // In a real app, this would be based on environment variables
  return true;
};

/**
 * Shadow Service - Handles all shadow-related API calls
 */
const shadowService = {
  /**
   * Get user's shadow army
   * @returns {Promise<Array>} List of user's shadows
   */
  getShadows: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.getShadows();
      }
      
      const response = await api.get('/api/shadows');
      return response.data;
    } catch (error) {
      console.error('Error fetching shadows:', error);
      throw error;
    }
  },

  /**
   * Get a specific shadow
   * @param {string} shadowId - ID of the shadow to fetch
   * @returns {Promise<Object>} Shadow data
   */
  getShadow: async (shadowId) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.getShadowById(shadowId);
      }
      
      const response = await api.get(`/api/shadows/${shadowId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shadow ${shadowId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new shadow (extract)
   * @param {Object} shadowData - Shadow data (name, type, etc.)
   * @returns {Promise<Object>} Created shadow data
   */
  createShadow: async (shadowData) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.extractShadow(shadowData.targetId);
      }
      
      const response = await api.post('/api/shadows', shadowData);
      return response.data;
    } catch (error) {
      console.error('Error creating shadow:', error);
      throw error;
    }
  },

  /**
   * Update a shadow
   * @param {string} shadowId - ID of the shadow to update
   * @param {Object} shadowData - Updated shadow data
   * @returns {Promise<Object>} Updated shadow data
   */
  updateShadow: async (shadowId, shadowData) => {
    try {
      if (shouldUseMockService()) {
        // Mock service doesn't have a direct equivalent, so we'll use toggleShadowStatus
        // if the update is about active status
        if (shadowData.hasOwnProperty('isActive')) {
          return await mockShadowService.toggleShadowStatus(shadowId);
        }
        // Otherwise, we'll just return the shadow
        return await mockShadowService.getShadowById(shadowId);
      }
      
      const response = await api.put(`/api/shadows/${shadowId}`, shadowData);
      return response.data;
    } catch (error) {
      console.error(`Error updating shadow ${shadowId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a shadow
   * @param {string} shadowId - ID of the shadow to delete
   * @returns {Promise<Object>} Result of deletion
   */
  deleteShadow: async (shadowId) => {
    try {
      if (shouldUseMockService()) {
        // Mock service doesn't support deletion, so we'll just return success
        return { success: true, message: 'Shadow deleted successfully' };
      }
      
      const response = await api.delete(`/api/shadows/${shadowId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting shadow ${shadowId}:`, error);
      throw error;
    }
  },

  /**
   * Level up a shadow
   * @param {string} shadowId - ID of the shadow to level up
   * @param {number} experience - Experience points to add
   * @returns {Promise<Object>} Updated shadow data
   */
  levelUpShadow: async (shadowId, experience) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.levelUpShadow(shadowId);
      }
      
      const response = await api.post(`/api/shadows/${shadowId}/level`, { experience });
      return response.data;
    } catch (error) {
      console.error(`Error leveling up shadow ${shadowId}:`, error);
      throw error;
    }
  },

  /**
   * Equip an item to a shadow
   * @param {string} shadowId - ID of the shadow
   * @param {string} itemId - ID of the item to equip
   * @returns {Promise<Object>} Updated shadow data
   */
  equipItemToShadow: async (shadowId, itemId) => {
    try {
      if (shouldUseMockService()) {
        // Mock service doesn't support equipment, so we'll just return the shadow
        return await mockShadowService.getShadowById(shadowId);
      }
      
      const response = await api.post(`/api/shadows/${shadowId}/equip/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error equipping item ${itemId} to shadow ${shadowId}:`, error);
      throw error;
    }
  },

  /**
   * Unequip an item from a shadow
   * @param {string} shadowId - ID of the shadow
   * @param {string} slot - Equipment slot to unequip
   * @returns {Promise<Object>} Updated shadow data
   */
  unequipItemFromShadow: async (shadowId, slot) => {
    try {
      if (shouldUseMockService()) {
        // Mock service doesn't support equipment, so we'll just return the shadow
        return await mockShadowService.getShadowById(shadowId);
      }
      
      const response = await api.post(`/api/shadows/${shadowId}/unequip/${slot}`);
      return response.data;
    } catch (error) {
      console.error(`Error unequipping item from slot ${slot} of shadow ${shadowId}:`, error);
      throw error;
    }
  },

  /**
   * Deploy a shadow on a quest
   * @param {string} shadowId - ID of the shadow to deploy
   * @param {string} questId - ID of the quest
   * @returns {Promise<Object>} Deployment result
   */
  deployShadow: async (shadowId, questId) => {
    try {
      if (shouldUseMockService()) {
        // Mock service doesn't support deployment, so we'll just return success
        return { 
          success: true, 
          message: 'Shadow deployed successfully',
          shadow: await mockShadowService.getShadowById(shadowId)
        };
      }
      
      const response = await api.post(`/api/shadows/${shadowId}/deploy`, { questId });
      return response.data;
    } catch (error) {
      console.error(`Error deploying shadow ${shadowId} to quest ${questId}:`, error);
      throw error;
    }
  },

  /**
   * Return a deployed shadow
   * @param {string} shadowId - ID of the shadow to return
   * @returns {Promise<Object>} Updated shadow data
   */
  returnShadow: async (shadowId) => {
    try {
      if (shouldUseMockService()) {
        // Mock service doesn't support deployment, so we'll just return the shadow
        return { 
          success: true, 
          message: 'Shadow returned successfully',
          shadow: await mockShadowService.getShadowById(shadowId)
        };
      }
      
      const response = await api.post(`/api/shadows/${shadowId}/return`);
      return response.data;
    } catch (error) {
      console.error(`Error returning shadow ${shadowId}:`, error);
      throw error;
    }
  },

  /**
   * Extract a shadow from a defeated enemy
   * @param {Object} extractionData - Data about the extraction (enemy type, etc.)
   * @returns {Promise<Object>} Extracted shadow data
   */
  extractShadow: async (extractionData) => {
    try {
      console.log('ShadowService: Extracting shadow with data:', extractionData);
      
      // Make sure we have valid extraction data
      if (!extractionData || typeof extractionData !== 'object') {
        console.error('Invalid extraction data:', extractionData);
        throw new Error('Invalid extraction data');
      }
      
      if (shouldUseMockService()) {
        // Generate a mock shadow based on the extraction data
        const mockShadow = {
          _id: `shadow_${Date.now()}`,
          name: extractionData.name || 'Unnamed Shadow',
          type: extractionData.type || 'soldier',
          level: extractionData.level || 1,
          power: extractionData.power || 10,
          rank: extractionData.rank || 'E',
          stats: extractionData.stats || {
            strength: 10,
            intelligence: 10,
            agility: 10,
            endurance: 10
          },
          abilities: extractionData.abilities || [],
          source: 'extraction',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('ShadowService: Created mock shadow:', mockShadow);
        return mockShadow;
      }
      
      const response = await api.post('/api/shadows/extract', extractionData);
      return response.data;
    } catch (error) {
      console.error('Error extracting shadow:', error);
      throw error;
    }
  },

  /**
   * Get available shadow extraction targets
   * @returns {Promise<Array>} List of available extraction targets
   */
  getExtractionTargets: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.getExtractionTargets();
      }
      
      const response = await api.get('/api/shadows/extraction-targets');
      return response.data;
    } catch (error) {
      console.error('Error fetching extraction targets:', error);
      throw error;
    }
  },

  /**
   * Merge shadows to create a stronger one
   * @param {string} primaryShadowId - ID of the primary shadow
   * @param {string} secondaryShadowId - ID of the secondary shadow to merge
   * @returns {Promise<Object>} Merged shadow data
   */
  mergeShadows: async (primaryShadowId, secondaryShadowId) => {
    try {
      if (shouldUseMockService()) {
        // Mock service doesn't support merging, so we'll just level up the primary shadow
        return await mockShadowService.levelUpShadow(primaryShadowId);
      }
      
      const response = await api.post('/api/shadows/merge', {
        primaryShadowId,
        secondaryShadowId
      });
      return response.data;
    } catch (error) {
      console.error(`Error merging shadows ${primaryShadowId} and ${secondaryShadowId}:`, error);
      throw error;
    }
  },

  /**
   * Get all formations
   * @returns {Promise<Array>} List of formations
   */
  getFormations: async () => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.getFormations();
      }
      
      const response = await api.get('/api/shadows/formations');
      return response.data;
    } catch (error) {
      console.error('Error fetching formations:', error);
      throw error;
    }
  },

  /**
   * Get formation by ID
   * @param {string} formationId - ID of the formation
   * @returns {Promise<Object>} Formation data
   */
  getFormation: async (formationId) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.getFormationById(formationId);
      }
      
      const response = await api.get(`/api/shadows/formations/${formationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new formation
   * @param {Object} formationData - Formation data
   * @returns {Promise<Object>} Created formation data
   */
  createFormation: async (formationData) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.createFormation(formationData);
      }
      
      const response = await api.post('/api/shadows/formations', formationData);
      return response.data;
    } catch (error) {
      console.error('Error creating formation:', error);
      throw error;
    }
  },

  /**
   * Update a formation
   * @param {string} formationId - ID of the formation
   * @param {Object} formationData - Updated formation data
   * @returns {Promise<Object>} Updated formation data
   */
  updateFormation: async (formationId, formationData) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.updateFormation(formationId, formationData);
      }
      
      const response = await api.put(`/api/shadows/formations/${formationId}`, formationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Activate a formation
   * @param {string} formationId - ID of the formation
   * @returns {Promise<Object>} Activation result
   */
  activateFormation: async (formationId) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.activateFormation(formationId);
      }
      
      const response = await api.post(`/api/shadows/formations/${formationId}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Error activating formation ${formationId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a formation
   * @param {string} formationId - ID of the formation
   * @returns {Promise<Object>} Deletion result
   */
  deleteFormation: async (formationId) => {
    try {
      if (shouldUseMockService()) {
        return await mockShadowService.deleteFormation(formationId);
      }
      
      const response = await api.delete(`/api/shadows/formations/${formationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting formation ${formationId}:`, error);
      throw error;
    }
  }
};

export default shadowService;
