const mongoose = require('mongoose');
const Skill = require('../models/Skill');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solo-leveling', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define rank-based skills
const rankSkills = [
  // E-Rank Skills
  {
    name: "Basic Strike",
    description: "A simple strike technique that deals minor damage.",
    type: "active",
    icon: "basic-strike.png",
    effects: [
      { stat: "damage", value: 5, isPercentage: false }
    ],
    requirements: {
      level: 1,
      rank: "E",
      stats: { strength: 5 }
    },
    cooldown: 3,
    mpCost: 5,
    maxLevel: 5,
    rankLocked: true
  },
  {
    name: "Endurance Run",
    description: "Improves stamina recovery rate for a short period.",
    type: "passive",
    icon: "endurance-run.png",
    effects: [
      { stat: "endurance", value: 3, isPercentage: false }
    ],
    requirements: {
      level: 3,
      rank: "E",
      stats: { endurance: 7 }
    },
    maxLevel: 3,
    rankLocked: true
  },
  
  // D-Rank Skills
  {
    name: "Power Strike",
    description: "A powerful strike that deals moderate damage.",
    type: "active",
    icon: "power-strike.png",
    effects: [
      { stat: "damage", value: 15, isPercentage: false }
    ],
    requirements: {
      level: 10,
      rank: "D",
      stats: { strength: 15 }
    },
    cooldown: 5,
    mpCost: 10,
    maxLevel: 5,
    rankLocked: true
  },
  {
    name: "Quick Recovery",
    description: "Passively increases HP regeneration rate.",
    type: "passive",
    icon: "quick-recovery.png",
    effects: [
      { stat: "hp", value: 2, isPercentage: true }
    ],
    requirements: {
      level: 12,
      rank: "D",
      stats: { vitality: 12 }
    },
    maxLevel: 4,
    rankLocked: true
  },
  
  // C-Rank Skills
  {
    name: "Blade Dance",
    description: "A series of quick slashes that deal damage to enemies.",
    type: "active",
    icon: "blade-dance.png",
    effects: [
      { stat: "damage", value: 25, isPercentage: false },
      { stat: "speed", value: 10, isPercentage: false }
    ],
    requirements: {
      level: 20,
      rank: "C",
      stats: { agility: 20, strength: 15 }
    },
    cooldown: 8,
    mpCost: 15,
    maxLevel: 6,
    rankLocked: true
  },
  {
    name: "Mana Flow",
    description: "Increases MP regeneration rate.",
    type: "passive",
    icon: "mana-flow.png",
    effects: [
      { stat: "mp", value: 3, isPercentage: true }
    ],
    requirements: {
      level: 22,
      rank: "C",
      stats: { intelligence: 20 }
    },
    maxLevel: 5,
    rankLocked: true
  },
  
  // B-Rank Skills
  {
    name: "Crushing Blow",
    description: "A devastating attack that deals heavy damage.",
    type: "active",
    icon: "crushing-blow.png",
    effects: [
      { stat: "damage", value: 40, isPercentage: false }
    ],
    requirements: {
      level: 30,
      rank: "B",
      stats: { strength: 30 }
    },
    cooldown: 12,
    mpCost: 25,
    maxLevel: 7,
    rankLocked: true
  },
  {
    name: "Shadow Step",
    description: "Allows quick movement through shadows, increasing agility.",
    type: "active",
    icon: "shadow-step.png",
    effects: [
      { stat: "agility", value: 15, isPercentage: false },
      { stat: "speed", value: 20, isPercentage: false }
    ],
    requirements: {
      level: 32,
      rank: "B",
      stats: { agility: 25 }
    },
    cooldown: 15,
    mpCost: 20,
    maxLevel: 6,
    rankLocked: true
  },
  
  // A-Rank Skills
  {
    name: "Dragon's Breath",
    description: "Unleash a powerful breath attack that deals massive damage.",
    type: "active",
    icon: "dragons-breath.png",
    effects: [
      { stat: "damage", value: 70, isPercentage: false }
    ],
    requirements: {
      level: 40,
      rank: "A",
      stats: { intelligence: 35, strength: 30 }
    },
    cooldown: 20,
    mpCost: 40,
    maxLevel: 8,
    rankLocked: true
  },
  {
    name: "Warrior's Spirit",
    description: "Increases all stats temporarily during combat.",
    type: "passive",
    icon: "warriors-spirit.png",
    effects: [
      { stat: "strength", value: 5, isPercentage: false },
      { stat: "agility", value: 5, isPercentage: false },
      { stat: "vitality", value: 5, isPercentage: false }
    ],
    requirements: {
      level: 42,
      rank: "A",
      stats: { 
        strength: 30, 
        agility: 30, 
        vitality: 30 
      }
    },
    maxLevel: 7,
    rankLocked: true
  },
  
  // S-Rank Skills
  {
    name: "Arise",
    description: "The signature skill of the Shadow Monarch. Extract shadows from fallen enemies to create shadow soldiers.",
    type: "ultimate",
    icon: "arise.png",
    effects: [
      { stat: "damage", value: 100, isPercentage: false }
    ],
    requirements: {
      level: 50,
      rank: "S",
      stats: { 
        strength: 40, 
        intelligence: 40 
      }
    },
    cooldown: 60,
    mpCost: 100,
    maxLevel: 10,
    rankLocked: true
  },
  {
    name: "Ruler's Authority",
    description: "Exert dominance over all shadows, increasing their power and your control.",
    type: "passive",
    icon: "rulers-authority.png",
    effects: [
      { stat: "strength", value: 15, isPercentage: false },
      { stat: "intelligence", value: 15, isPercentage: false },
      { stat: "damage", value: 20, isPercentage: false }
    ],
    requirements: {
      level: 52,
      rank: "S",
      stats: { 
        strength: 45, 
        intelligence: 45 
      }
    },
    maxLevel: 10,
    rankLocked: true
  },
  {
    name: "Shadow Exchange",
    description: "Swap positions with any of your shadow soldiers instantly.",
    type: "active",
    icon: "shadow-exchange.png",
    effects: [
      { stat: "agility", value: 20, isPercentage: false },
      { stat: "speed", value: 30, isPercentage: false }
    ],
    requirements: {
      level: 55,
      rank: "S",
      stats: { agility: 50 }
    },
    cooldown: 30,
    mpCost: 50,
    maxLevel: 8,
    rankLocked: true
  }
];

// Function to seed skills
const seedRankSkills = async () => {
  try {
    // Clear existing rank-locked skills
    await Skill.deleteMany({ rankLocked: true });
    
    // Insert new skills
    await Skill.insertMany(rankSkills);
    
    console.log('Rank-based skills seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding rank skills:', error);
    mongoose.connection.close();
  }
};

// Run the seeding function
seedRankSkills();
