/**
 * Mock Quest Service for Solo Leveling
 * This provides mock data for quest-related functionality
 */

import { v4 as uuidv4 } from 'uuid';

// Helper function to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock quest database
const mockQuestDB = {
  quests: [
    // Sample quests
    {
      _id: 'quest-1',
      title: 'Morning Exercise',
      description: 'Complete a 30-minute morning workout to energize your day.',
      type: 'daily',
      difficulty: 'medium',
      category: 'fitness',
      requirements: 'Complete at least 30 minutes of exercise in the morning.',
      timeLimit: 24,
      requiresProof: true,
      proofType: 'video',
      status: 'available',
      rewards: {
        experience: 100,
        currency: 50,
        statPoints: 0
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      _id: 'quest-2',
      title: 'Study Session',
      description: 'Complete a focused 1-hour study session without distractions.',
      type: 'daily',
      difficulty: 'easy',
      category: 'study',
      requirements: 'Study for at least 1 hour without checking social media or other distractions.',
      timeLimit: 24,
      requiresProof: false,
      status: 'available',
      rewards: {
        experience: 80,
        currency: 30,
        statPoints: 0
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      _id: 'quest-3',
      title: 'Meditation Challenge',
      description: 'Complete a 15-minute meditation session for mental clarity.',
      type: 'daily',
      difficulty: 'easy',
      category: 'wellness',
      requirements: 'Meditate for at least 15 minutes using any meditation technique.',
      timeLimit: 24,
      requiresProof: false,
      status: 'available',
      rewards: {
        experience: 70,
        currency: 25,
        statPoints: 0
      },
      createdAt: new Date().toISOString() // Today
    }
  ],
  activeQuests: [],
  completedQuests: [],
  customQuests: [
    {
      _id: 'custom-1',
      title: 'Learn a New Programming Language',
      description: 'Complete a basic tutorial in a programming language you\'ve never used before.',
      type: 'custom',
      difficulty: 'hard',
      category: 'study',
      requirements: 'Complete at least one project or exercise in the new language.',
      timeLimit: 72,
      requiresProof: true,
      proofType: 'image',
      isPublic: false,
      createdBy: {
        _id: 'user-1',
        username: 'CurrentUser'
      },
      rewards: {
        experience: 200,
        currency: 100,
        statPoints: 1
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
  ],
  publicCustomQuests: []
};

// Mock quest service
const mockQuestService = {
  // Get all available quests
  getQuests: async (filters = {}) => {
    await delay();
    
    let filteredQuests = [...mockQuestDB.quests];
    
    // Apply filters
    if (filters.type) {
      filteredQuests = filteredQuests.filter(quest => quest.type === filters.type);
    }
    
    if (filters.difficulty) {
      filteredQuests = filteredQuests.filter(quest => quest.difficulty === filters.difficulty);
    }
    
    if (filters.status) {
      filteredQuests = filteredQuests.filter(quest => quest.status === filters.status);
    }
    
    return filteredQuests;
  },
  
  // Get active quests
  getActiveQuests: async () => {
    await delay();
    
    console.log('Getting active quests, current count:', mockQuestDB.activeQuests.length);
    console.log('Active quests:', mockQuestDB.activeQuests);
    
    // If there are no active quests, add a sample one for testing
    if (!mockQuestDB.activeQuests || mockQuestDB.activeQuests.length === 0) {
      console.log('No active quests found, adding a sample one');
      
      // Add a sample active quest
      const sampleActiveQuest = {
        _id: 'active-sample-1',
        title: 'Sample Active Quest',
        description: 'This is a sample active quest to demonstrate the feature',
        type: 'daily',
        difficulty: 'medium',
        category: 'fitness',
        requirements: 'Complete the sample task',
        timeLimit: 24,
        requiresProof: false,
        status: 'active',
        progress: 0,
        acceptedAt: new Date().toISOString(),
        rewards: {
          experience: 100,
          currency: 50,
          statPoints: 0
        }
      };
      
      mockQuestDB.activeQuests.push(sampleActiveQuest);
    }
    
    return mockQuestDB.activeQuests;
  },
  
  // Get user's completed quests
  getCompletedQuests: async () => {
    await delay();
    return mockQuestDB.completedQuests;
  },
  
  // Accept a quest
  acceptQuest: async (questId) => {
    await delay();
    
    console.log('Accepting quest with ID:', questId);
    
    // Check if it's a custom quest from public quests
    if (questId && questId.startsWith && questId.startsWith('public-custom-')) {
      // Find the quest in public custom quests
      const publicCustomQuests = await mockQuestService.getPublicCustomQuests();
      const quest = publicCustomQuests.find(q => q._id === questId);
      
      console.log('Found public custom quest:', quest);
      
      if (!quest) {
        throw new Error('Public custom quest not found');
      }
      
      // Create a deep copy of the quest to avoid read-only issues
      const acceptedQuest = {
        ...JSON.parse(JSON.stringify(quest)),
        _id: `active-${quest._id}`, // Change ID to avoid conflicts
        status: 'active',
        progress: 0,
        acceptedAt: new Date().toISOString()
      };
      
      // Add to active quests
      mockQuestDB.activeQuests.push(acceptedQuest);
      
      console.log('Added to active quests:', acceptedQuest);
      console.log('Active quests count:', mockQuestDB.activeQuests.length);
      console.log('Active quests:', mockQuestDB.activeQuests);
      
      return {
        success: true,
        message: 'Custom quest accepted',
        quest: acceptedQuest
      };
    }
    // Check if it's a user's custom quest
    else if (questId && questId.startsWith && questId.startsWith('custom-')) {
      // Find the quest in user's custom quests
      const quest = mockQuestDB.customQuests.find(q => q._id === questId);
      
      console.log('Found user custom quest:', quest);
      
      if (!quest) {
        throw new Error('User custom quest not found');
      }
      
      // Create a deep copy of the quest to avoid read-only issues
      const acceptedQuest = {
        ...JSON.parse(JSON.stringify(quest)),
        _id: `active-${quest._id}`, // Change ID to avoid conflicts
        status: 'active',
        progress: 0,
        acceptedAt: new Date().toISOString()
      };
      
      // Add to active quests
      mockQuestDB.activeQuests.push(acceptedQuest);
      
      console.log('Added to active quests:', acceptedQuest);
      console.log('Active quests count:', mockQuestDB.activeQuests.length);
      console.log('Active quests:', mockQuestDB.activeQuests);
      
      return {
        success: true,
        message: 'Custom quest accepted',
        quest: acceptedQuest
      };
    }
    // Handle regular quests
    else {
      console.log('Treating as regular quest');
      
      // Find the quest in available quests
      const quest = mockQuestDB.quests.find(q => q._id === questId);
      
      console.log('Found regular quest:', quest);
      
      if (!quest) {
        throw new Error(`Quest not found with ID: ${questId}`);
      }
      
      // Create a deep copy of the quest to avoid read-only issues
      const questCopy = JSON.parse(JSON.stringify(quest));
      
      // Update quest status on the copy
      questCopy.status = 'active';
      questCopy.acceptedAt = new Date().toISOString();
      questCopy.progress = 0;
      questCopy._id = `active-${quest._id}`; // Change ID to avoid conflicts
      
      // Add to active quests
      mockQuestDB.activeQuests.push(questCopy);
      
      console.log('Added to active quests:', questCopy);
      console.log('Active quests count:', mockQuestDB.activeQuests.length);
      console.log('Active quests:', mockQuestDB.activeQuests);
      
      return {
        success: true,
        message: 'Quest accepted',
        quest: questCopy
      };
    }
  },
  
  // Complete a quest
  completeQuest: async (questId, completionNotes = '') => {
    await delay();
    
    console.log('Completing quest with ID:', questId, 'Notes:', completionNotes);
    
    // Find the quest in active quests
    const questIndex = mockQuestDB.activeQuests.findIndex(q => q._id === questId);
    
    if (questIndex === -1) {
      throw new Error('Active quest not found');
    }
    
    // Create a deep copy of the quest to avoid read-only issues
    const quest = JSON.parse(JSON.stringify(mockQuestDB.activeQuests[questIndex]));
    
    // Update quest status
    quest.status = 'completed';
    quest.completedAt = new Date().toISOString();
    quest.completionNotes = completionNotes;
    
    // Add to completed quests
    mockQuestDB.completedQuests.push(quest);
    
    // Remove from active quests
    mockQuestDB.activeQuests.splice(questIndex, 1);
    
    // Calculate rewards
    const rewards = {
      experience: quest.rewards?.experience || 100,
      currency: quest.rewards?.currency || 50,
      statPoints: quest.rewards?.statPoints || 0
    };
    
    // In a real app, this would update the user's stats
    console.log('Quest completed! Rewards:', rewards);
    
    return {
      success: true,
      message: 'Quest completed successfully',
      quest,
      rewards
    };
  },
  
  // Update quest progress
  updateQuestProgress: async (questId, progress) => {
    await delay();
    
    console.log('Updating progress for quest:', questId, 'Progress:', progress);
    
    // Find the quest in active quests
    const questIndex = mockQuestDB.activeQuests.findIndex(q => q._id === questId);
    
    if (questIndex === -1) {
      throw new Error('Active quest not found');
    }
    
    // Update progress
    mockQuestDB.activeQuests[questIndex].progress = progress;
    
    return {
      success: true,
      message: 'Progress updated successfully',
      quest: mockQuestDB.activeQuests[questIndex]
    };
  },
  
  // Abandon a quest
  abandonQuest: async (questId) => {
    await delay();
    
    // Find the quest in active quests
    const questIndex = mockQuestDB.activeQuests.findIndex(quest => quest._id === questId);
    
    if (questIndex === -1) {
      throw new Error('Active quest not found');
    }
    
    const quest = { ...mockQuestDB.activeQuests[questIndex] };
    
    // Update quest status
    quest.status = 'abandoned';
    quest.abandonedAt = new Date().toISOString();
    
    // Remove from active quests
    mockQuestDB.activeQuests.splice(questIndex, 1);
    
    // Find in available quests and make available again
    const availableIndex = mockQuestDB.quests.findIndex(q => q._id === questId);
    if (availableIndex !== -1) {
      mockQuestDB.quests[availableIndex].status = 'available';
    }
    
    return {
      success: true,
      message: 'Quest abandoned successfully'
    };
  },
  
  // Get daily quests
  getDailyQuests: async () => {
    await delay();
    
    const dailyQuests = mockQuestDB.quests.filter(quest => quest.type === 'daily');
    
    return {
      quests: dailyQuests,
      refreshTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString() // Next midnight
    };
  },
  
  // Get emergency quests
  getEmergencyQuests: async () => {
    await delay();
    
    return mockQuestDB.quests.filter(quest => quest.type === 'emergency');
  },
  
  // Get punishment quests
  getPunishmentQuests: async () => {
    await delay();
    
    return mockQuestDB.quests.filter(quest => quest.type === 'punishment');
  },
  
  // Create a custom quest
  createCustomQuest: async (questData) => {
    await delay();
    
    // Create a new custom quest with default values for missing fields
    const newQuest = {
      _id: `custom-${uuidv4()}`,
      type: 'custom',
      title: questData.title || 'Unnamed Quest',
      description: questData.description || '',
      difficulty: questData.difficulty || 'medium',
      category: questData.category || 'other',
      requirements: questData.requirements || '',
      timeLimit: questData.timeLimit || 24,
      requiresProof: questData.requiresProof || false,
      proofType: questData.proofType || 'none',
      verificationMethod: questData.verificationMethod || 'none',
      rewards: {
        experience: questData.rewards?.experience || 100,
        currency: questData.rewards?.currency || 50,
        statPoints: questData.rewards?.statPoints || 0
      },
      createdBy: {
        _id: 'user-1', // In a real app, this would be the current user's ID
        username: 'CurrentUser' // In a real app, this would be the current user's username
      },
      createdAt: new Date().toISOString(),
      status: 'available',
      progress: 0
    };
    
    // Add to user's custom quests
    mockQuestDB.customQuests.push(newQuest);
    
    return newQuest;
  },
  
  // Get custom quests
  getCustomQuests: async () => {
    await delay();
    
    return mockQuestDB.customQuests;
  },
  
  // Get public custom quests
  getPublicCustomQuests: async () => {
    await delay();
    
    console.log('Getting public custom quests');
    
    // Create some sample public custom quests if none exist
    if (!mockQuestDB.publicCustomQuests || mockQuestDB.publicCustomQuests.length === 0) {
      mockQuestDB.publicCustomQuests = [
        {
          _id: 'public-custom-1',
          title: 'Community Fitness Challenge',
          description: 'Complete a 30-minute workout session and share your progress',
          difficulty: 'medium',
          category: 'fitness',
          requirements: 'Record a video of your workout session',
          timeLimit: 24,
          requiresProof: true,
          proofType: 'video',
          isPublic: true,
          createdBy: 'community',
          createdAt: new Date().toISOString(),
          status: 'available',
          rewards: {
            experience: 150,
            currency: 100,
            statPoints: 1
          }
        },
        {
          _id: 'public-custom-2',
          title: 'Reading Challenge',
          description: 'Read a book chapter and write a short summary',
          difficulty: 'easy',
          category: 'study',
          requirements: 'Submit a summary of at least 200 words',
          timeLimit: 48,
          requiresProof: true,
          proofType: 'text',
          isPublic: true,
          createdBy: 'community',
          createdAt: new Date().toISOString(),
          status: 'available',
          rewards: {
            experience: 100,
            currency: 50,
            statPoints: 0
          }
        },
        {
          _id: 'public-custom-3',
          title: 'Meditation Marathon',
          description: 'Complete a 20-minute meditation session for mental clarity',
          difficulty: 'easy',
          category: 'wellness',
          requirements: 'Use a meditation app and screenshot your session',
          timeLimit: 24,
          requiresProof: true,
          proofType: 'image',
          isPublic: true,
          createdBy: 'community',
          createdAt: new Date().toISOString(),
          status: 'available',
          rewards: {
            experience: 80,
            currency: 40,
            statPoints: 0
          }
        }
      ];
    }
    
    console.log('Public custom quests:', mockQuestDB.publicCustomQuests);
    return mockQuestDB.publicCustomQuests;
  },
  
  // Submit verification for a quest
  submitVerification: async (questId, verificationData) => {
    await delay();
    
    console.log('Submitting verification for quest:', questId, 'Data:', verificationData);
    
    // Find the quest in active quests
    const questIndex = mockQuestDB.activeQuests.findIndex(q => q._id === questId);
    
    if (questIndex === -1) {
      throw new Error('Active quest not found');
    }
    
    // Create a deep copy of the quest to avoid read-only issues
    const quest = JSON.parse(JSON.stringify(mockQuestDB.activeQuests[questIndex]));
    
    // Update verification status
    quest.verification = {
      status: 'pending',
      submittedAt: new Date().toISOString(),
      data: verificationData
    };
    
    // Update the quest in active quests
    mockQuestDB.activeQuests[questIndex] = quest;
    
    // Simulate AI verification process (in a real app, this would be a separate process)
    setTimeout(() => {
      // 80% chance of success
      const success = Math.random() < 0.8;
      
      if (success) {
        // Update verification status
        mockQuestDB.activeQuests[questIndex].verification.status = 'approved';
        mockQuestDB.activeQuests[questIndex].verification.approvedAt = new Date().toISOString();
        mockQuestDB.activeQuests[questIndex].progress = 100;
        
        console.log('Verification approved for quest:', questId);
      } else {
        // Update verification status
        mockQuestDB.activeQuests[questIndex].verification.status = 'rejected';
        mockQuestDB.activeQuests[questIndex].verification.rejectedAt = new Date().toISOString();
        mockQuestDB.activeQuests[questIndex].verification.reason = 'Verification failed. Please try again.';
        
        console.log('Verification rejected for quest:', questId);
      }
    }, 3000); // 3 seconds delay to simulate processing
    
    return {
      success: true,
      message: 'Verification submitted successfully',
      quest,
      verificationId: `verification-${Date.now()}`
    };
  },
  
  // Check verification status
  checkVerificationStatus: async (verificationId) => {
    await delay();
    
    console.log('Checking verification status for:', verificationId);
    
    // In a real app, this would check the status of a specific verification
    // For the mock implementation, we'll just return a random status
    
    const statuses = ['pending', 'approved', 'rejected'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // If approved, also return rewards
    if (randomStatus === 'approved') {
      return {
        success: true,
        status: randomStatus,
        message: 'Verification approved',
        questCompleted: true,
        rewards: {
          experience: 150,
          currency: 75,
          statPoints: 1
        }
      };
    }
    
    // If rejected, return a reason
    if (randomStatus === 'rejected') {
      return {
        success: false,
        status: randomStatus,
        message: 'Verification rejected',
        reason: 'The verification did not meet the requirements. Please try again.'
      };
    }
    
    // If pending, return a pending message
    return {
      success: true,
      status: randomStatus,
      message: 'Verification is still being processed'
    };
  },
};

export default mockQuestService;
