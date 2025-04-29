/**
 * Mock Quest Service for Solo Leveling
 * This provides mock data for quest-related functionality
 */

import { v4 as uuidv4 } from 'uuid';

// Helper function to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Get current user ID from localStorage or session
const getCurrentUserId = () => {
  try {
    // Try to get user from localStorage or sessionStorage
    const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
    return user && user._id ? user._id : 'guest';
  } catch (error) {
    console.error('Error getting current user:', error);
    return 'guest';
  }
};

// Load data from localStorage if available or use defaults
const loadFromStorage = (key, defaultValue) => {
  try {
    // Get user-specific key
    const userId = getCurrentUserId();
    const userKey = `${userId}_${key}`;
    
    console.log(`Loading data for user ${userId} with key ${userKey}`);
    
    // Try localStorage first
    let stored = localStorage.getItem(userKey);
    
    // If not in localStorage, try sessionStorage
    if (!stored) {
      stored = sessionStorage.getItem(userKey);
    }
    
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

// Save data to localStorage and sessionStorage
const saveToStorage = (key, data) => {
  try {
    // Get user-specific key
    const userId = getCurrentUserId();
    const userKey = `${userId}_${key}`;
    
    console.log(`Saving data for user ${userId} with key ${userKey}`);
    const serializedData = JSON.stringify(data);
    
    // Save to both localStorage and sessionStorage for redundancy
    localStorage.setItem(userKey, serializedData);
    sessionStorage.setItem(userKey, serializedData);
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'quest-2',
      title: 'Read a Book',
      description: 'Read at least 30 pages of a book to improve your knowledge.',
      type: 'daily',
      difficulty: 'easy',
      category: 'education',
      requirements: 'Read at least 30 pages of any book.',
      timeLimit: 24,
      requiresProof: false,
      status: 'available',
      rewards: {
        experience: 80,
        currency: 30,
        statPoints: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Emergency Quest
    {
      _id: 'emergency-1',
      title: 'Critical Bug Fix',
      description: 'A critical bug has been discovered in the system. Fix it immediately!',
      type: 'emergency',
      difficulty: 'hard',
      category: 'work',
      requirements: 'Identify and fix the critical bug in the system.',
      timeLimit: 4,
      requiresProof: true,
      proofType: 'screenshot',
      status: 'available',
      rewards: {
        experience: 300,
        currency: 200,
        statPoints: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Punishment Quest
    {
      _id: 'punishment-1',
      title: 'Extra Training',
      description: 'You failed to complete your daily tasks. Complete extra training as punishment.',
      type: 'punishment',
      difficulty: 'hard',
      category: 'fitness',
      requirements: 'Complete 100 push-ups, 100 sit-ups, and 100 squats.',
      timeLimit: 24,
      requiresProof: true,
      proofType: 'video',
      status: 'available',
      rewards: {
        experience: 50,
        currency: 0,
        statPoints: 0
      },
      penalty: {
        experience: -100,
        currency: -50,
        statPoints: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  dailyQuests: loadFromStorage('dailyQuests', []),
  activeQuests: loadFromStorage('activeQuests', []),
  completedQuests: loadFromStorage('completedQuests', []),
  customQuests: loadFromStorage('customQuests', []),
  publicCustomQuests: loadFromStorage('publicCustomQuests', [])
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
    
    console.log('Getting active quests, current count:', mockQuestDB.activeQuests?.length || 0);
    
    // Initialize activeQuests if it doesn't exist
    if (!mockQuestDB.activeQuests) {
      mockQuestDB.activeQuests = [];
    }
    
    // If there are no active quests, add the sample ones for testing
    if (mockQuestDB.activeQuests.length === 0) {
      console.log('No active quests found, adding sample ones');
      
      // Add sample active quests
      mockQuestDB.activeQuests = [
        {
          _id: 'active-sample-1',
          title: 'Complete a Workout',
          description: 'Complete a 30-minute workout to improve your fitness.',
          type: 'daily',
          difficulty: 'medium',
          category: 'fitness',
          requirements: 'Complete a 30-minute workout of your choice.',
          timeLimit: 24,
          requiresProof: false,
          status: 'active',
          progress: 0,
          acceptedAt: new Date().toISOString(),
          rewards: {
            experience: 100,
            currency: 50,
            statPoints: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'active-sample-2',
          title: 'Study Session',
          description: 'Complete a focused study session to improve your knowledge.',
          type: 'daily',
          difficulty: 'easy',
          category: 'education',
          requirements: 'Study for at least 1 hour without distractions.',
          timeLimit: 24,
          requiresProof: false,
          status: 'active',
          progress: 50,
          acceptedAt: new Date().toISOString(),
          rewards: {
            experience: 80,
            currency: 30,
            statPoints: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    console.log('Returning active quests:', mockQuestDB.activeQuests);
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
    
    // Update quest status
    mockQuestDB.activeQuests[questIndex].status = 'completed';
    mockQuestDB.activeQuests[questIndex].completedAt = new Date().toISOString();
    mockQuestDB.activeQuests[questIndex].completionNotes = completionNotes;
    
    // Move to completed quests
    const completedQuest = mockQuestDB.activeQuests.splice(questIndex, 1)[0];
    mockQuestDB.completedQuests.push(completedQuest);
    
    console.log('Quest completed:', completedQuest);
    console.log('Active quests count:', mockQuestDB.activeQuests.length);
    console.log('Active quests:', mockQuestDB.activeQuests);
    console.log('Completed quests count:', mockQuestDB.completedQuests.length);
    console.log('Completed quests:', mockQuestDB.completedQuests);
    
    return {
      success: true,
      message: 'Quest completed',
      quest: completedQuest
    };
  },
  
  // Create a custom quest
  createCustomQuest: async (questData) => {
    await delay();
    
    console.log('Creating custom quest:', questData);
    
    // Generate a unique ID if not provided
    if (!questData._id) {
      questData._id = `custom-${uuidv4()}`;
    }
    
    // Add timestamps
    questData.createdAt = new Date().toISOString();
    questData.updatedAt = new Date().toISOString();
    
    // Set default status
    questData.status = 'available';
    
    // Ensure type is set
    questData.type = questData.type || 'custom';
    
    // Load existing custom quests from localStorage
    const existingQuests = loadFromStorage('customQuests', []);
    
    // Add to custom quests
    const updatedQuests = [...existingQuests, questData];
    mockQuestDB.customQuests = updatedQuests;
    
    // Save to localStorage
    saveToStorage('customQuests', updatedQuests);
    
    // Also save to questState for redundancy
    const questState = loadFromStorage('questState', {});
    if (questState) {
      questState.customQuests = updatedQuests;
      questState.lastUpdated = new Date().toISOString();
      saveToStorage('questState', questState);
    }
    
    console.log('Custom quest created and saved:', questData);
    console.log('Updated custom quests:', updatedQuests);
    
    return questData;
  },
  
  // Get custom quests
  getCustomQuests: async () => {
    await delay();
    
    console.log('Getting custom quests');
    
    // First try to get from questState (for consistency with Redux)
    const questState = loadFromStorage('questState', null);
    if (questState && questState.customQuests && questState.customQuests.length > 0) {
      console.log('Found custom quests in questState:', questState.customQuests);
      mockQuestDB.customQuests = questState.customQuests;
      return questState.customQuests;
    }
    
    // Then try to get from customQuests directly
    const storedCustomQuests = loadFromStorage('customQuests', null);
    if (storedCustomQuests && storedCustomQuests.length > 0) {
      console.log('Found custom quests in localStorage:', storedCustomQuests);
      mockQuestDB.customQuests = storedCustomQuests;
      
      // Also update questState for consistency
      if (questState) {
        questState.customQuests = storedCustomQuests;
        questState.lastUpdated = new Date().toISOString();
        saveToStorage('questState', questState);
      }
      
      return storedCustomQuests;
    }
    
    // If no custom quests exist, create some sample ones
    if (!mockQuestDB.customQuests || mockQuestDB.customQuests.length === 0) {
      const sampleQuests = [
        {
          _id: 'custom-1',
          title: 'Learn a New Programming Language',
          description: 'Learn the basics of a new programming language of your choice.',
          type: 'custom',
          difficulty: 'medium',
          category: 'education',
          requirements: {
            level: 1,
            rank: 'F'
          },
          timeEstimate: '2 weeks',
          requiresProof: true,
          proofType: 'code',
          status: 'available',
          rewards: {
            experience: 200,
            currency: 100,
            statPoints: 1
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'custom-2',
          title: 'Improve Physical Fitness',
          description: 'Work on improving your physical fitness through regular exercise.',
          type: 'custom',
          difficulty: 'hard',
          category: 'fitness',
          requirements: {
            level: 2,
            rank: 'E'
          },
          timeEstimate: '2 weeks',
          requiresProof: true,
          proofType: 'image',
          status: 'available',
          rewards: {
            experience: 250,
            currency: 120,
            statPoints: 2
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      mockQuestDB.customQuests = sampleQuests;
      
      // Save to localStorage
      saveToStorage('customQuests', sampleQuests);
      
      // Also update questState for consistency
      if (questState) {
        questState.customQuests = sampleQuests;
        questState.lastUpdated = new Date().toISOString();
        saveToStorage('questState', questState);
      }
    }
    
    console.log('Returning custom quests:', mockQuestDB.customQuests);
    return mockQuestDB.customQuests;
  },
  
  // Get public custom quests
  getPublicCustomQuests: async () => {
    await delay();
    
    console.log('Getting public custom quests');
    
    // Initialize public custom quests if it doesn't exist
    if (!mockQuestDB.publicCustomQuests) {
      mockQuestDB.publicCustomQuests = [
        {
          _id: 'public-custom-1',
          title: 'Community Fitness Challenge',
          description: 'Join the community fitness challenge to improve your health and earn rewards.',
          type: 'custom',
          difficulty: 'medium',
          category: 'fitness',
          requirements: 'Complete 30 minutes of exercise for 5 consecutive days.',
          timeLimit: 120, // 5 days
          requiresProof: true,
          proofType: 'image',
          status: 'available',
          isPublic: true,
          createdBy: {
            _id: 'user-2',
            username: 'FitnessGuru'
          },
          rewards: {
            experience: 250,
            currency: 100,
            statPoints: 1
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'public-custom-2',
          title: 'Coding Challenge',
          description: 'Complete a coding challenge to improve your programming skills.',
          type: 'custom',
          difficulty: 'hard',
          category: 'learning',
          requirements: 'Build a small project using a programming language of your choice.',
          timeLimit: 168, // 1 week
          requiresProof: true,
          proofType: 'image',
          status: 'available',
          isPublic: true,
          createdBy: {
            _id: 'user-3',
            username: 'CodeMaster'
          },
          rewards: {
            experience: 350,
            currency: 150,
            statPoints: 2
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    console.log('Public custom quests:', mockQuestDB.publicCustomQuests);
    return mockQuestDB.publicCustomQuests;
  },
  
  // Get daily quests
  getDailyQuests: async () => {
    await delay();
    
    console.log('Getting daily quests');
    
    // Filter daily quests from the main quests array
    const dailyQuests = mockQuestDB.quests.filter(quest => quest.type === 'daily');
    
    // If no daily quests found, create sample ones
    if (!dailyQuests || dailyQuests.length === 0) {
      const sampleDailyQuests = [
        {
          _id: 'daily-sample-1',
          title: 'Daily Exercise',
          description: 'Complete a 30-minute workout to stay in shape.',
          type: 'daily',
          difficulty: 'medium',
          category: 'fitness',
          requirements: 'Complete at least 30 minutes of exercise.',
          timeLimit: 24,
          requiresProof: true,
          proofType: 'image',
          status: 'available',
          rewards: {
            experience: 100,
            currency: 50,
            statPoints: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'daily-sample-2',
          title: 'Study Session',
          description: 'Study for at least 1 hour to improve your knowledge.',
          type: 'daily',
          difficulty: 'easy',
          category: 'education',
          requirements: 'Complete at least 1 hour of studying.',
          timeLimit: 24,
          requiresProof: false,
          status: 'available',
          rewards: {
            experience: 80,
            currency: 30,
            statPoints: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Add to the quests array
      mockQuestDB.quests.push(...sampleDailyQuests);
      
      console.log('Created sample daily quests:', sampleDailyQuests);
      
      // Return with refresh time information
      return {
        quests: sampleDailyQuests,
        refreshTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString() // Next midnight
      };
    }
    
    console.log('Daily quests:', dailyQuests);
    
    // Return with refresh time information
    return {
      quests: dailyQuests,
      refreshTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString() // Next midnight
    };
  },
  
  // Get emergency quests
  getEmergencyQuests: async () => {
    await delay();
    
    console.log('Getting emergency quests');
    
    // Filter emergency quests from the main quests array
    const emergencyQuests = mockQuestDB.quests.filter(quest => quest.type === 'emergency');
    
    // If no emergency quests found, create sample ones
    if (!emergencyQuests || emergencyQuests.length === 0) {
      const sampleEmergencyQuests = [
        {
          _id: 'emergency-sample-1',
          title: 'System Crash Recovery',
          description: 'The main system has crashed! Recover it immediately to prevent data loss.',
          type: 'emergency',
          difficulty: 'hard',
          category: 'work',
          requirements: 'Restart the system and recover any lost data.',
          timeLimit: 2,
          requiresProof: true,
          proofType: 'screenshot',
          status: 'available',
          rewards: {
            experience: 300,
            currency: 200,
            statPoints: 1
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'emergency-sample-2',
          title: 'Urgent Deadline',
          description: 'A critical deadline has been moved up! Complete your work immediately.',
          type: 'emergency',
          difficulty: 'very-hard',
          category: 'work',
          requirements: 'Complete the urgent task before the new deadline.',
          timeLimit: 4,
          requiresProof: true,
          proofType: 'screenshot',
          status: 'available',
          rewards: {
            experience: 400,
            currency: 300,
            statPoints: 2
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Add to the quests array
      mockQuestDB.quests.push(...sampleEmergencyQuests);
      
      console.log('Created sample emergency quests:', sampleEmergencyQuests);
      return sampleEmergencyQuests;
    }
    
    console.log('Emergency quests:', emergencyQuests);
    return emergencyQuests;
  },
  
  // Get punishment quests
  getPunishmentQuests: async () => {
    await delay();
    
    console.log('Getting punishment quests');
    
    // Filter punishment quests from the main quests array
    const punishmentQuests = mockQuestDB.quests.filter(quest => quest.type === 'punishment');
    
    // If no punishment quests found, create a sample one
    if (!punishmentQuests || punishmentQuests.length === 0) {
      const samplePunishmentQuest = {
        _id: 'punishment-sample-1',
        title: 'Intensive Training',
        description: 'You failed to complete your tasks. Complete intensive training as punishment.',
        type: 'punishment',
        difficulty: 'hard',
        category: 'fitness',
        requirements: 'Complete 150 push-ups, 150 sit-ups, and 150 squats.',
        timeLimit: 24,
        requiresProof: true,
        proofType: 'video',
        status: 'available',
        rewards: {
          experience: 50,
          currency: 0,
          statPoints: 0
        },
        penalty: {
          experience: -100,
          currency: -50,
          statPoints: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to the quests array
      mockQuestDB.quests.push(samplePunishmentQuest);
      
      console.log('Created sample punishment quest:', samplePunishmentQuest);
      return [samplePunishmentQuest];
    }
    
    console.log('Punishment quests:', punishmentQuests);
    return punishmentQuests;
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
