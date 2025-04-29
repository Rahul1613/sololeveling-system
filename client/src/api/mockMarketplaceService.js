import { v4 as uuidv4 } from 'uuid';

// Mock marketplace items
const mockItems = [
  {
    _id: 'item_1',
    name: 'Steel Sword',
    description: 'A basic steel sword with decent damage.',
    type: 'weapon',
    subType: 'sword',
    rarity: 'common',
    level: 5,
    price: 100,
    stats: {
      damage: 10,
      durability: 100
    },
    effects: [],
    image: '/images/items/steel-sword.png',
    limitedQuantity: 10,
    isLimited: true
  },
  {
    _id: 'item_2',
    name: 'Leather Armor',
    description: 'Basic leather armor that provides minimal protection.',
    type: 'armor',
    subType: 'light',
    rarity: 'common',
    level: 3,
    price: 80,
    stats: {
      defense: 5,
      durability: 80
    },
    effects: [],
    image: '/images/items/leather-armor.png',
    limitedQuantity: null,
    isLimited: false
  },
  {
    _id: 'item_3',
    name: 'Health Potion',
    description: 'Restores 50 health points when consumed.',
    type: 'potion',
    subType: 'healing',
    rarity: 'common',
    level: 1,
    price: 30,
    stats: {
      healing: 50
    },
    effects: ['Restores 50 HP'],
    image: '/images/items/health-potion.png',
    limitedQuantity: 50,
    isLimited: true
  },
  {
    _id: 'item_4',
    name: 'Mana Potion',
    description: 'Restores 50 mana points when consumed.',
    type: 'potion',
    subType: 'mana',
    rarity: 'common',
    level: 1,
    price: 30,
    stats: {
      mana: 50
    },
    effects: ['Restores 50 MP'],
    image: '/images/items/mana-potion.png',
    limitedQuantity: 50,
    isLimited: true
  },
  {
    _id: 'item_5',
    name: 'Iron Ore',
    description: 'Raw iron ore used for crafting weapons and armor.',
    type: 'material',
    subType: 'ore',
    rarity: 'common',
    level: 1,
    price: 10,
    stats: {},
    effects: [],
    image: '/images/items/iron-ore.png',
    limitedQuantity: 100,
    isLimited: true
  },
  {
    _id: 'item_6',
    name: 'Enchanted Blade',
    description: 'A magical sword that deals extra elemental damage.',
    type: 'weapon',
    subType: 'sword',
    rarity: 'rare',
    level: 20,
    price: 500,
    stats: {
      damage: 30,
      durability: 150,
      magicDamage: 15
    },
    effects: ['Deals 15 extra fire damage'],
    image: '/images/items/enchanted-blade.png',
    limitedQuantity: 5,
    isLimited: true
  },
  {
    _id: 'item_7',
    name: 'Shadow Knight Armor',
    description: 'Armor infused with shadow energy, providing excellent protection.',
    type: 'armor',
    subType: 'heavy',
    rarity: 'epic',
    level: 30,
    price: 1200,
    stats: {
      defense: 40,
      durability: 200,
      shadowResistance: 20
    },
    effects: ['Reduces shadow damage by 20%'],
    image: '/images/items/shadow-knight-armor.png',
    limitedQuantity: 3,
    isLimited: true
  },
  {
    _id: 'item_8',
    name: 'Dungeon Key',
    description: 'A key that unlocks a special dungeon with rare rewards.',
    type: 'key',
    subType: 'dungeon',
    rarity: 'rare',
    level: 15,
    price: 300,
    stats: {},
    effects: ['Unlocks Shadow Dungeon'],
    image: '/images/items/dungeon-key.png',
    limitedQuantity: 2,
    isLimited: true
  },
  {
    _id: 'item_9',
    name: 'Strength Elixir',
    description: 'Permanently increases strength by 2 points.',
    type: 'consumable',
    subType: 'elixir',
    rarity: 'epic',
    level: 25,
    price: 800,
    stats: {
      strength: 2
    },
    effects: ['Permanently increases strength by 2'],
    image: '/images/items/strength-elixir.png',
    limitedQuantity: 1,
    isLimited: true
  },
  {
    _id: 'item_10',
    name: 'Shadow Extraction Tool',
    description: 'A special tool that increases shadow extraction success rate.',
    type: 'tool',
    subType: 'extraction',
    rarity: 'legendary',
    level: 40,
    price: 2000,
    stats: {
      extractionRate: 15
    },
    effects: ['Increases shadow extraction success rate by 15%'],
    image: '/images/items/shadow-extraction-tool.png',
    limitedQuantity: 1,
    isLimited: true
  },
  {
    _id: 'item_11',
    name: 'Teleportation Scroll',
    description: 'Allows instant teleportation to previously visited locations.',
    type: 'consumable',
    subType: 'scroll',
    rarity: 'uncommon',
    level: 10,
    price: 150,
    stats: {},
    effects: ['Teleport to a previously visited location'],
    image: '/images/items/teleportation-scroll.png',
    limitedQuantity: 10,
    isLimited: true
  },
  {
    _id: 'item_12',
    name: 'Shadow Essence',
    description: 'Pure shadow energy that can be used to enhance shadow soldiers.',
    type: 'material',
    subType: 'essence',
    rarity: 'epic',
    level: 35,
    price: 1000,
    stats: {},
    effects: ['Can be used to enhance shadow soldiers'],
    image: '/images/items/shadow-essence.png',
    limitedQuantity: 5,
    isLimited: true
  }
];

// Cache for mock items to prevent regenerating them on every call
let cachedMockItems = null;

// Utility to always ensure mockItems are available
function getDemoMockItems() {
  // Use cached items if available
  if (cachedMockItems) {
    return cachedMockItems;
  }
  
  // Defensive: always return a non-empty array
  if (!Array.isArray(mockItems) || mockItems.length === 0) {
    cachedMockItems = [
      {
        _id: 'item_demo_1',
        name: 'Demo Sword',
        description: 'A sword for demonstration purposes.',
        type: 'weapon',
        rarity: 'common',
        level: 1,
        price: 10,
        stats: { damage: 1 },
        effects: [],
        image: '/images/items/default-item.png',
        limitedQuantity: 10,
        isLimited: false
      }
    ];
    return cachedMockItems;
  }
  
  // Cache the items to prevent regenerating them on every call
  cachedMockItems = [...mockItems];
  return cachedMockItems;
}

// Featured items (subset of all items)
const featuredItems = [
  getDemoMockItems().find(item => item._id === 'item_6'), // Enchanted Blade
  getDemoMockItems().find(item => item._id === 'item_7'), // Shadow Knight Armor
  getDemoMockItems().find(item => item._id === 'item_10'), // Shadow Extraction Tool
  getDemoMockItems().find(item => item._id === 'item_12') // Shadow Essence
].filter(Boolean); // Remove undefined values

// Mock marketplace service
const mockMarketplaceService = {
  // Get marketplace items with filtering
  getMarketplaceItems: async (filters = {}) => {
    try {
      // Get the base items
      const baseItems = getDemoMockItems();
      
      // Create a new array for filtered items
      let filteredItems = [...baseItems];
      
      // Apply type filter
      if (filters.type && filters.type !== '') {
        filteredItems = filteredItems.filter(item => item.type === filters.type);
      }
      
      // Apply rarity filter
      if (filters.rarity && filters.rarity !== '') {
        filteredItems = filteredItems.filter(item => item.rarity === filters.rarity);
      }
      
      // Apply level range filter
      if (filters.minLevel !== undefined && filters.maxLevel !== undefined) {
        filteredItems = filteredItems.filter(item => 
          item.level >= filters.minLevel && item.level <= filters.maxLevel
        );
      }
      
      // Apply price range filter
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        filteredItems = filteredItems.filter(item => 
          item.price >= filters.minPrice && item.price <= filters.maxPrice
        );
      }
      
      // Simulate API delay - use a shorter delay to improve performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { items: filteredItems };
    } catch (error) {
      console.error('Error in mock getMarketplaceItems:', error);
      return { items: [] };
    }
  },
  
  // Buy an item from the marketplace
  buyItem: async (itemId, quantity = 1) => {
    try {
      // Get a fresh copy of the items to avoid reference issues
      const items = getDemoMockItems();
      const itemIndex = items.findIndex(item => item._id === itemId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }
      
      const item = {...items[itemIndex]}; // Create a copy to avoid modifying the original
      
      // Check if item is limited and has enough quantity
      if (item.isLimited && item.limitedQuantity !== null) {
        if (item.limitedQuantity < quantity) {
          throw new Error('Not enough items available');
        }
        
        // Update limited quantity
        item.limitedQuantity -= quantity;
        
        // Update the cached items
        if (cachedMockItems) {
          cachedMockItems[itemIndex].limitedQuantity = item.limitedQuantity;
        }
      }
      
      // Simulate API delay - use a shorter delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { 
        success: true, 
        message: `Successfully purchased ${quantity} ${item.name}`,
        item: item,
        transaction: {
          id: uuidv4(),
          type: 'purchase',
          itemId: item._id,
          quantity: quantity,
          totalPrice: item.price * quantity,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`Error in mock buyItem for ${itemId}:`, error);
      throw error; // Re-throw to allow proper error handling
    }
  },
  
  // Sell an item to the marketplace
  sellItem: async (itemId, quantity = 1) => {
    try {
      // Get a fresh copy of the items to avoid reference issues
      const items = getDemoMockItems();
      const itemIndex = items.findIndex(item => item._id === itemId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }
      
      const item = {...items[itemIndex]}; // Create a copy to avoid modifying the original
      
      // If item is limited, increase its quantity
      if (item.isLimited && item.limitedQuantity !== null) {
        item.limitedQuantity += quantity;
        
        // Update the cached items
        if (cachedMockItems) {
          cachedMockItems[itemIndex].limitedQuantity = item.limitedQuantity;
        }
      }
      
      // Simulate API delay - use a shorter delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { 
        success: true, 
        message: `Successfully sold ${quantity} ${item.name}`,
        item: item,
        transaction: {
          id: uuidv4(),
          type: 'sale',
          itemId: item._id,
          quantity: quantity,
          totalPrice: Math.floor(item.price * 0.7) * quantity, // 70% of original price
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`Error in mock sellItem for ${itemId}:`, error);
      throw error; // Re-throw to allow proper error handling
    }
  },
  
  // Get featured marketplace items
  getFeaturedItems: async () => {
    try {
      // Simulate API delay - use a shorter delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { items: featuredItems || [] };
    } catch (error) {
      console.error('Error in mock getFeaturedItems:', error);
      return { items: [] };
    }
  },
  
  // Get recommended items based on user level and stats
  getRecommendedItems: async () => {
    try {
      // For demo purposes, just return a random subset of items
      const baseItems = getDemoMockItems();
      
      // Only shuffle if we have items
      if (baseItems.length === 0) {
        return { items: [] };
      }
      
      // Use a more efficient way to get random items
      const recommended = [];
      const itemCount = Math.min(4, baseItems.length);
      const itemsCopy = [...baseItems];
      
      for (let i = 0; i < itemCount; i++) {
        const randomIndex = Math.floor(Math.random() * itemsCopy.length);
        recommended.push(itemsCopy[randomIndex]);
        itemsCopy.splice(randomIndex, 1);
      }
      
      // Simulate API delay - use a shorter delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { items: recommended };
    } catch (error) {
      console.error('Error in mock getRecommendedItems:', error);
      return { items: [] };
    }
  }
};

export default mockMarketplaceService;
