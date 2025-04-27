/**
 * Mock Shadow Service for Solo Leveling
 * This provides mock data for shadow-related functionality
 */

import { v4 as uuidv4 } from 'uuid';

// Helper function to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock shadow database
const mockShadowDB = {
  // User's extracted shadows
  shadows: [
    {
      _id: 'shadow-1',
      name: 'Igris',
      type: 'Knight',
      rank: 'S',
      level: 50,
      stats: {
        strength: 85,
        agility: 75,
        intelligence: 60,
        endurance: 90
      },
      skills: [
        { name: 'Sword Mastery', level: 4 },
        { name: 'Shadow Step', level: 3 },
        { name: 'Loyalty', level: 5 }
      ],
      description: 'A loyal knight shadow with exceptional combat abilities.',
      extractedFrom: 'Knight of the Demon Castle',
      extractedAt: '2023-01-15T12:00:00Z',
      isActive: true,
      image: '/assets/shadows/igris.png'
    },
    {
      _id: 'shadow-2',
      name: 'Tank',
      type: 'Beast',
      rank: 'A',
      level: 35,
      stats: {
        strength: 95,
        agility: 40,
        intelligence: 30,
        endurance: 100
      },
      skills: [
        { name: 'Charge', level: 4 },
        { name: 'Thick Hide', level: 5 },
        { name: 'Intimidate', level: 3 }
      ],
      description: 'A massive beast shadow with incredible strength and durability.',
      extractedFrom: 'High Orc Warrior',
      extractedAt: '2023-02-20T15:30:00Z',
      isActive: true,
      image: '/assets/shadows/tank.png'
    },
    {
      _id: 'shadow-3',
      name: 'Beru',
      type: 'Insect',
      rank: 'S',
      level: 45,
      stats: {
        strength: 80,
        agility: 90,
        intelligence: 70,
        endurance: 75
      },
      skills: [
        { name: 'Acid Spray', level: 4 },
        { name: 'Regeneration', level: 3 },
        { name: 'Swarm Control', level: 5 }
      ],
      description: 'An ant shadow with exceptional abilities and intelligence.',
      extractedFrom: 'Ant King',
      extractedAt: '2023-03-10T09:45:00Z',
      isActive: true,
      image: '/assets/shadows/beru.png'
    }
  ],
  
  // Available targets for shadow extraction
  extractionTargets: [
    {
      _id: 'target-1',
      name: 'Fallen Warrior',
      type: 'Human',
      rank: 'B',
      difficulty: 'medium',
      description: 'A skilled warrior who fell in battle. Could make a decent shadow soldier.',
      requiredLevel: 10,
      successRate: 75,
      potentialStats: {
        strength: 60,
        agility: 65,
        intelligence: 50,
        endurance: 55
      },
      location: 'Ancient Battlefield',
      available: true
    },
    {
      _id: 'target-2',
      name: 'Frost Drake',
      type: 'Dragon',
      rank: 'A',
      difficulty: 'hard',
      description: 'A powerful ice dragon. Would make an exceptional shadow with ice abilities.',
      requiredLevel: 25,
      successRate: 50,
      potentialStats: {
        strength: 75,
        agility: 70,
        intelligence: 80,
        endurance: 85
      },
      location: 'Frozen Peaks',
      available: true
    },
    {
      _id: 'target-3',
      name: 'Shadow Assassin',
      type: 'Human',
      rank: 'A',
      difficulty: 'hard',
      description: 'A stealthy assassin with exceptional speed and precision.',
      requiredLevel: 20,
      successRate: 60,
      potentialStats: {
        strength: 65,
        agility: 95,
        intelligence: 75,
        endurance: 60
      },
      location: 'Abandoned Temple',
      available: true
    },
    {
      _id: 'target-4',
      name: 'Ancient Golem',
      type: 'Construct',
      rank: 'S',
      difficulty: 'very-hard',
      description: 'A massive stone golem with incredible defensive capabilities.',
      requiredLevel: 35,
      successRate: 40,
      potentialStats: {
        strength: 90,
        agility: 30,
        intelligence: 50,
        endurance: 100
      },
      location: 'Forgotten Ruins',
      available: true
    }
  ],
  
  // Shadow army formations
  formations: [
    {
      _id: 'formation-1',
      name: 'Default Formation',
      description: 'Standard balanced formation',
      shadows: ['shadow-1', 'shadow-2', 'shadow-3'],
      bonuses: {
        attack: 10,
        defense: 10,
        speed: 5
      },
      isActive: true,
      createdAt: '2023-01-20T10:00:00Z'
    },
    {
      _id: 'formation-2',
      name: 'Offensive Formation',
      description: 'Formation focused on maximizing attack power',
      shadows: ['shadow-1', 'shadow-3'],
      bonuses: {
        attack: 25,
        defense: -5,
        speed: 10
      },
      isActive: false,
      createdAt: '2023-02-25T14:30:00Z'
    },
    {
      _id: 'formation-3',
      name: 'Defensive Formation',
      description: 'Formation focused on maximizing defense',
      shadows: ['shadow-1', 'shadow-2'],
      bonuses: {
        attack: -5,
        defense: 30,
        speed: -10
      },
      isActive: false,
      createdAt: '2023-03-15T16:45:00Z'
    }
  ]
};

// Mock shadow service
const mockShadowService = {
  // Get all shadows
  getShadows: async () => {
    await delay();
    return [...mockShadowDB.shadows];
  },
  
  // Get shadow by ID
  getShadowById: async (shadowId) => {
    await delay();
    
    const shadow = mockShadowDB.shadows.find(s => s._id === shadowId);
    
    if (!shadow) {
      throw new Error('Shadow not found');
    }
    
    return { ...shadow };
  },
  
  // Get extraction targets
  getExtractionTargets: async () => {
    await delay();
    return [...mockShadowDB.extractionTargets];
  },
  
  // Extract shadow
  extractShadow: async (targetId) => {
    await delay();
    
    const target = mockShadowDB.extractionTargets.find(t => t._id === targetId);
    
    if (!target) {
      throw new Error('Extraction target not found');
    }
    
    // Simulate extraction success/failure based on success rate
    const isSuccessful = Math.random() * 100 <= target.successRate;
    
    if (!isSuccessful) {
      return {
        success: false,
        message: 'Shadow extraction failed. The target resisted the extraction process.'
      };
    }
    
    // Create new shadow from target
    const newShadow = {
      _id: `shadow-${uuidv4()}`,
      name: target.name,
      type: target.type,
      rank: target.rank,
      level: 1,
      stats: {
        strength: target.potentialStats.strength * 0.7, // Start at 70% of potential
        agility: target.potentialStats.agility * 0.7,
        intelligence: target.potentialStats.intelligence * 0.7,
        endurance: target.potentialStats.endurance * 0.7
      },
      skills: [
        { name: 'Basic Attack', level: 1 }
      ],
      description: `Extracted from ${target.name}. ${target.description}`,
      extractedFrom: target.name,
      extractedAt: new Date().toISOString(),
      isActive: false,
      image: '/assets/shadows/default.png'
    };
    
    // Add to shadows
    mockShadowDB.shadows.push(newShadow);
    
    // Mark target as unavailable
    const targetIndex = mockShadowDB.extractionTargets.findIndex(t => t._id === targetId);
    mockShadowDB.extractionTargets[targetIndex].available = false;
    
    return {
      success: true,
      message: 'Shadow extraction successful!',
      shadow: newShadow
    };
  },
  
  // Level up shadow
  levelUpShadow: async (shadowId) => {
    await delay();
    
    const shadowIndex = mockShadowDB.shadows.findIndex(s => s._id === shadowId);
    
    if (shadowIndex === -1) {
      throw new Error('Shadow not found');
    }
    
    const shadow = { ...mockShadowDB.shadows[shadowIndex] };
    
    // Increase level and stats
    shadow.level += 1;
    shadow.stats.strength += Math.floor(Math.random() * 5) + 1;
    shadow.stats.agility += Math.floor(Math.random() * 5) + 1;
    shadow.stats.intelligence += Math.floor(Math.random() * 5) + 1;
    shadow.stats.endurance += Math.floor(Math.random() * 5) + 1;
    
    // Possibly learn new skill at certain levels
    if (shadow.level % 5 === 0 && shadow.skills.length < 5) {
      const possibleSkills = [
        'Shadow Step', 'Dark Strike', 'Void Shield', 'Soul Drain', 
        'Phantom Slash', 'Terror', 'Shadow Bind', 'Stealth'
      ];
      
      const existingSkillNames = shadow.skills.map(s => s.name);
      const availableSkills = possibleSkills.filter(s => !existingSkillNames.includes(s));
      
      if (availableSkills.length > 0) {
        const newSkill = {
          name: availableSkills[Math.floor(Math.random() * availableSkills.length)],
          level: 1
        };
        
        shadow.skills.push(newSkill);
      }
    }
    
    // Update shadow in DB
    mockShadowDB.shadows[shadowIndex] = shadow;
    
    return {
      success: true,
      shadow,
      message: `${shadow.name} has leveled up to level ${shadow.level}!`
    };
  },
  
  // Toggle shadow active status
  toggleShadowStatus: async (shadowId) => {
    await delay();
    
    const shadowIndex = mockShadowDB.shadows.findIndex(s => s._id === shadowId);
    
    if (shadowIndex === -1) {
      throw new Error('Shadow not found');
    }
    
    // Toggle active status
    mockShadowDB.shadows[shadowIndex].isActive = !mockShadowDB.shadows[shadowIndex].isActive;
    
    return {
      success: true,
      shadow: mockShadowDB.shadows[shadowIndex],
      message: `${mockShadowDB.shadows[shadowIndex].name} is now ${mockShadowDB.shadows[shadowIndex].isActive ? 'active' : 'inactive'}.`
    };
  },
  
  // Get all formations
  getFormations: async () => {
    await delay();
    return [...mockShadowDB.formations];
  },
  
  // Get formation by ID
  getFormationById: async (formationId) => {
    await delay();
    
    const formation = mockShadowDB.formations.find(f => f._id === formationId);
    
    if (!formation) {
      throw new Error('Formation not found');
    }
    
    // Get full shadow objects for the formation
    const shadows = formation.shadows.map(shadowId => {
      return mockShadowDB.shadows.find(s => s._id === shadowId);
    }).filter(Boolean);
    
    return {
      ...formation,
      shadowDetails: shadows
    };
  },
  
  // Create new formation
  createFormation: async (formationData) => {
    await delay();
    
    // Validate shadow IDs
    const validShadowIds = formationData.shadows.filter(shadowId => 
      mockShadowDB.shadows.some(s => s._id === shadowId)
    );
    
    if (validShadowIds.length === 0) {
      throw new Error('No valid shadows selected for formation');
    }
    
    const newFormation = {
      _id: `formation-${uuidv4()}`,
      name: formationData.name,
      description: formationData.description,
      shadows: validShadowIds,
      bonuses: formationData.bonuses || {
        attack: 0,
        defense: 0,
        speed: 0
      },
      isActive: false,
      createdAt: new Date().toISOString()
    };
    
    // Add to formations
    mockShadowDB.formations.push(newFormation);
    
    return {
      success: true,
      formation: newFormation,
      message: 'Formation created successfully'
    };
  },
  
  // Update formation
  updateFormation: async (formationId, formationData) => {
    await delay();
    
    const formationIndex = mockShadowDB.formations.findIndex(f => f._id === formationId);
    
    if (formationIndex === -1) {
      throw new Error('Formation not found');
    }
    
    // Validate shadow IDs
    const validShadowIds = formationData.shadows.filter(shadowId => 
      mockShadowDB.shadows.some(s => s._id === shadowId)
    );
    
    if (validShadowIds.length === 0) {
      throw new Error('No valid shadows selected for formation');
    }
    
    // Update formation
    mockShadowDB.formations[formationIndex] = {
      ...mockShadowDB.formations[formationIndex],
      name: formationData.name || mockShadowDB.formations[formationIndex].name,
      description: formationData.description || mockShadowDB.formations[formationIndex].description,
      shadows: validShadowIds,
      bonuses: formationData.bonuses || mockShadowDB.formations[formationIndex].bonuses
    };
    
    return {
      success: true,
      formation: mockShadowDB.formations[formationIndex],
      message: 'Formation updated successfully'
    };
  },
  
  // Activate formation
  activateFormation: async (formationId) => {
    await delay();
    
    const formationIndex = mockShadowDB.formations.findIndex(f => f._id === formationId);
    
    if (formationIndex === -1) {
      throw new Error('Formation not found');
    }
    
    // Deactivate all formations
    mockShadowDB.formations.forEach(f => {
      f.isActive = false;
    });
    
    // Activate selected formation
    mockShadowDB.formations[formationIndex].isActive = true;
    
    return {
      success: true,
      formation: mockShadowDB.formations[formationIndex],
      message: `Formation "${mockShadowDB.formations[formationIndex].name}" is now active`
    };
  },
  
  // Delete formation
  deleteFormation: async (formationId) => {
    await delay();
    
    const formationIndex = mockShadowDB.formations.findIndex(f => f._id === formationId);
    
    if (formationIndex === -1) {
      throw new Error('Formation not found');
    }
    
    // Cannot delete active formation
    if (mockShadowDB.formations[formationIndex].isActive) {
      throw new Error('Cannot delete active formation. Please activate another formation first.');
    }
    
    // Delete formation
    const deletedFormation = mockShadowDB.formations.splice(formationIndex, 1)[0];
    
    return {
      success: true,
      message: `Formation "${deletedFormation.name}" deleted successfully`
    };
  }
};

export default mockShadowService;
