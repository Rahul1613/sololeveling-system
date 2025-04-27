const mongoose = require('mongoose');
const Item = require('../models/Item');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solo-leveling', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define marketplace items with rank requirements
const marketplaceItems = [
  // E-Rank Items
  {
    name: "Basic Health Potion",
    description: "Restores a small amount of HP.",
    type: "potion",
    rarity: "common",
    image: "basic-health-potion.png",
    level: 1,
    price: 50,
    effects: [
      { stat: "hp", value: 20, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 1,
      stats: {}
    },
    isStackable: true,
    maxStack: 10,
    isConsumable: true,
    isAvailableInShop: true
  },
  {
    name: "Novice Sword",
    description: "A basic sword for beginners.",
    type: "weapon",
    rarity: "common",
    image: "novice-sword.png",
    level: 1,
    price: 100,
    effects: [
      { stat: "strength", value: 3, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 1,
      stats: { strength: 5 }
    },
    isEquippable: true,
    equipSlot: "weapon",
    isAvailableInShop: true
  },
  
  // D-Rank Items
  {
    name: "Enhanced Health Potion",
    description: "Restores a moderate amount of HP.",
    type: "potion",
    rarity: "uncommon",
    image: "enhanced-health-potion.png",
    level: 10,
    price: 150,
    effects: [
      { stat: "hp", value: 50, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 10,
      stats: {}
    },
    isStackable: true,
    maxStack: 10,
    isConsumable: true,
    isAvailableInShop: true
  },
  {
    name: "Hunter's Bow",
    description: "A reliable bow for D-rank hunters.",
    type: "weapon",
    rarity: "uncommon",
    image: "hunters-bow.png",
    level: 10,
    price: 300,
    effects: [
      { stat: "agility", value: 5, isPercentage: false, duration: 0 },
      { stat: "damage", value: 10, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 10,
      stats: { agility: 12 }
    },
    isEquippable: true,
    equipSlot: "weapon",
    isAvailableInShop: true
  },
  
  // C-Rank Items
  {
    name: "Superior Health Potion",
    description: "Restores a significant amount of HP.",
    type: "potion",
    rarity: "rare",
    image: "superior-health-potion.png",
    level: 20,
    price: 350,
    effects: [
      { stat: "hp", value: 100, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 20,
      stats: {}
    },
    isStackable: true,
    maxStack: 10,
    isConsumable: true,
    isAvailableInShop: true
  },
  {
    name: "Mana Potion",
    description: "Restores MP.",
    type: "potion",
    rarity: "rare",
    image: "mana-potion.png",
    level: 20,
    price: 300,
    effects: [
      { stat: "mp", value: 50, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 20,
      stats: {}
    },
    isStackable: true,
    maxStack: 10,
    isConsumable: true,
    isAvailableInShop: true
  },
  {
    name: "Knight's Armor",
    description: "Sturdy armor for C-rank hunters.",
    type: "armor",
    rarity: "rare",
    image: "knights-armor.png",
    level: 20,
    price: 800,
    effects: [
      { stat: "vitality", value: 10, isPercentage: false, duration: 0 },
      { stat: "defense", value: 15, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 20,
      stats: { vitality: 18 }
    },
    isEquippable: true,
    equipSlot: "chest",
    isAvailableInShop: true
  },
  
  // B-Rank Items
  {
    name: "Elixir of Strength",
    description: "Permanently increases strength by a small amount.",
    type: "consumable",
    rarity: "epic",
    image: "elixir-strength.png",
    level: 30,
    price: 1500,
    effects: [
      { stat: "strength", value: 2, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 30,
      stats: {}
    },
    isStackable: true,
    maxStack: 5,
    isConsumable: true,
    isAvailableInShop: true
  },
  {
    name: "Shadow Blade",
    description: "A mysterious blade that harnesses shadow energy.",
    type: "weapon",
    rarity: "epic",
    image: "shadow-blade.png",
    level: 30,
    price: 2000,
    effects: [
      { stat: "strength", value: 15, isPercentage: false, duration: 0 },
      { stat: "damage", value: 25, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 30,
      stats: { strength: 25 }
    },
    isEquippable: true,
    equipSlot: "weapon",
    isAvailableInShop: true
  },
  
  // A-Rank Items
  {
    name: "Greater Elixir of Vitality",
    description: "Permanently increases vitality by a moderate amount.",
    type: "consumable",
    rarity: "legendary",
    image: "greater-elixir-vitality.png",
    level: 40,
    price: 3000,
    effects: [
      { stat: "vitality", value: 3, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 40,
      stats: {}
    },
    isStackable: true,
    maxStack: 3,
    isConsumable: true,
    isAvailableInShop: true
  },
  {
    name: "Dragon Scale Armor",
    description: "Armor forged from dragon scales, offering exceptional protection.",
    type: "armor",
    rarity: "legendary",
    image: "dragon-scale-armor.png",
    level: 40,
    price: 5000,
    effects: [
      { stat: "vitality", value: 20, isPercentage: false, duration: 0 },
      { stat: "defense", value: 35, isPercentage: false, duration: 0 },
      { stat: "endurance", value: 15, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 40,
      stats: { vitality: 30, endurance: 25 }
    },
    isEquippable: true,
    equipSlot: "chest",
    isAvailableInShop: true
  },
  
  // S-Rank Items
  {
    name: "Monarch's Elixir",
    description: "A legendary elixir that enhances all stats permanently.",
    type: "consumable",
    rarity: "mythic",
    image: "monarchs-elixir.png",
    level: 50,
    price: 10000,
    effects: [
      { stat: "strength", value: 2, isPercentage: false, duration: 0 },
      { stat: "agility", value: 2, isPercentage: false, duration: 0 },
      { stat: "intelligence", value: 2, isPercentage: false, duration: 0 },
      { stat: "vitality", value: 2, isPercentage: false, duration: 0 },
      { stat: "endurance", value: 2, isPercentage: false, duration: 0 },
      { stat: "luck", value: 2, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 50,
      stats: {}
    },
    isStackable: true,
    maxStack: 2,
    isConsumable: true,
    isAvailableInShop: true
  },
  {
    name: "Kamish's Wrath",
    description: "A legendary weapon forged from the fang of the dragon Kamish.",
    type: "weapon",
    rarity: "mythic",
    image: "kamish-wrath.png",
    level: 50,
    price: 15000,
    effects: [
      { stat: "strength", value: 30, isPercentage: false, duration: 0 },
      { stat: "damage", value: 50, isPercentage: false, duration: 0 },
      { stat: "agility", value: 15, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 50,
      stats: { strength: 40, agility: 35 }
    },
    isEquippable: true,
    equipSlot: "weapon",
    isAvailableInShop: true
  },
  {
    name: "Shadow Monarch's Armor",
    description: "The legendary armor of the Shadow Monarch, offering unparalleled protection.",
    type: "armor",
    rarity: "mythic",
    image: "shadow-monarch-armor.png",
    level: 50,
    price: 20000,
    effects: [
      { stat: "vitality", value: 35, isPercentage: false, duration: 0 },
      { stat: "defense", value: 60, isPercentage: false, duration: 0 },
      { stat: "endurance", value: 25, isPercentage: false, duration: 0 },
      { stat: "intelligence", value: 20, isPercentage: false, duration: 0 }
    ],
    requirements: {
      level: 50,
      stats: { vitality: 40, intelligence: 35 }
    },
    isEquippable: true,
    equipSlot: "chest",
    isAvailableInShop: true
  }
];

// Function to seed marketplace items
const seedMarketplaceItems = async () => {
  try {
    // Clear existing marketplace items
    await Item.deleteMany({ isAvailableInShop: true });
    
    // Insert new items
    await Item.insertMany(marketplaceItems);
    
    console.log('Marketplace items seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding marketplace items:', error);
    mongoose.connection.close();
  }
};

// Run the seeding function
seedMarketplaceItems();
