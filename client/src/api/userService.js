import mockAuthService from './mockService';
import axios from 'axios';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to determine if we should use mock service
const shouldUseMockService = () => {
  // Always use mock service for now
  // In a real app, this would check environment variables or other configuration
  return true;
};

// User service for handling user-related API calls
const userService = {
  // Get global rankings
  getRankings: async () => {
    try {
      console.log('User Service: Fetching global rankings');
      
      // Check if we should use the mock service or real API
      if (shouldUseMockService()) {
        const rankings = await mockAuthService.user.getRankings();
        
        // Validate the response
        if (!rankings || !Array.isArray(rankings)) {
          console.error('Invalid rankings data received from mock service');
          return [];
        }
        
        return rankings;
      } else {
        const response = await axios.get(`${API_URL}/rankings`);
        
        // Validate the response
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid rankings data received from API');
          return [];
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching global rankings:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },
  
  // Update user rank based on experience
  updateRank: async (userId) => {
    try {
      console.log('User Service: Updating rank for user', userId);
      return await mockAuthService.user.updateRank(userId);
    } catch (error) {
      console.error('Error updating rank:', error);
      throw error;
    }
  },
  
  // Get user stats
  getUserStats: async (userId) => {
    try {
      console.log('User Service: Fetching stats for user', userId);
      // Use the getCurrentUser function from mockAuthService
      const userData = await mockAuthService.getCurrentUser();
      return userData.user;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },
  
  // Update user experience
  updateExperience: async (userId, experiencePoints) => {
    try {
      console.log('User Service: Updating experience for user', userId, 'by', experiencePoints, 'points');
      
      // Find the user in the mock database
      const user = mockAuthService.mockDB.users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update experience
      user.experience += experiencePoints;
      
      // Calculate level based on experience
      // Simple formula: level = sqrt(experience / 100)
      const newLevel = Math.floor(Math.sqrt(user.experience / 100)) + 1;
      
      // Check if level up occurred
      const levelUp = newLevel > user.level;
      if (levelUp) {
        user.level = newLevel;
        
        // Add stat points for level up (1 per level)
        user.statPoints += (newLevel - user.level);
      }
      
      // Calculate experience to next level
      user.experienceToNextLevel = Math.pow(newLevel + 1, 2) * 100 - user.experience;
      
      // Update rank
      await mockAuthService.user.updateRank(userId);
      
      return {
        success: true,
        message: levelUp ? `Level up! You are now level ${newLevel}!` : `Gained ${experiencePoints} experience points!`,
        levelUp,
        newLevel: user.level,
        experience: user.experience,
        experienceToNextLevel: user.experienceToNextLevel,
        statPoints: user.statPoints
      };
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  },
  
  // Allocate stat points
  allocateStatPoints: async (userId, statType, points) => {
    try {
      console.log('User Service: Allocating', points, 'points to', statType, 'for user', userId);
      
      // Find the user in the mock database
      const user = mockAuthService.mockDB.users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user has enough stat points
      if (user.statPoints < points) {
        throw new Error('Not enough stat points');
      }
      
      // Check if stat type is valid
      const validStats = ['strength', 'agility', 'intelligence', 'endurance', 'luck'];
      if (!validStats.includes(statType)) {
        throw new Error('Invalid stat type');
      }
      
      // Allocate stat points
      user.stats[statType] += points;
      user.statPoints -= points;
      
      return {
        success: true,
        message: `Successfully allocated ${points} points to ${statType}!`,
        stats: user.stats,
        statPoints: user.statPoints
      };
    } catch (error) {
      console.error('Error allocating stat points:', error);
      throw error;
    }
  },
  
  // Get user skills
  getUserSkills: async (userId) => {
    try {
      console.log('User Service: Fetching skills for user', userId);
      return await mockAuthService.user.getUserSkills(userId);
    } catch (error) {
      console.error('Error fetching user skills:', error);
      throw error;
    }
  },
  
  // Get user titles
  getUserTitles: async (userId) => {
    try {
      console.log('User Service: Fetching titles for user', userId);
      return await mockAuthService.user.getUserTitles(userId);
    } catch (error) {
      console.error('Error fetching user titles:', error);
      throw error;
    }
  },
  
  // Get user dungeon keys
  getUserDungeonKeys: async (userId) => {
    try {
      console.log('User Service: Fetching dungeon keys for user', userId);
      return await mockAuthService.user.getUserDungeonKeys(userId);
    } catch (error) {
      console.error('Error fetching dungeon keys:', error);
      throw error;
    }
  }
};

export default userService;
