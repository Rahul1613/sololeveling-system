/**
 * Sample marketplace data for testing
 */

export const sampleMarketplaceItems = [
  {
    _id: 'item-001',
    name: 'Steel Sword',
    description: 'A well-crafted steel sword. Perfect for beginners.',
    price: 250,
    category: 'weapons',
    rarity: 'common',
    seller: 'Blacksmith',
    sellerId: 'npc-001',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-002',
    name: 'Leather Armor',
    description: 'Basic leather armor that provides moderate protection.',
    price: 300,
    category: 'armor',
    rarity: 'common',
    seller: 'Armorer',
    sellerId: 'npc-002',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-003',
    name: 'Health Potion',
    description: 'Restores 50 health points when consumed.',
    price: 75,
    category: 'potions',
    rarity: 'common',
    seller: 'Alchemist',
    sellerId: 'npc-003',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-004',
    name: 'Mana Potion',
    description: 'Restores 50 mana points when consumed.',
    price: 75,
    category: 'potions',
    rarity: 'common',
    seller: 'Alchemist',
    sellerId: 'npc-003',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-005',
    name: "Hunter's Dagger",
    description: 'A lightweight dagger perfect for quick strikes and hunting.',
    price: 450,
    category: 'weapons',
    rarity: 'uncommon',
    seller: "Hunter's Guild",
    sellerId: 'npc-004',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-006',
    name: 'Enchanted Blade',
    description: 'A magically enhanced blade that deals additional elemental damage.',
    price: 1200,
    category: 'weapons',
    rarity: 'epic',
    seller: 'Arcane Weaponsmith',
    sellerId: 'npc-005',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-007',
    name: 'Shadow Knight Armor',
    description: 'Armor infused with shadow magic, providing excellent protection and stealth bonuses.',
    price: 2000,
    category: 'armor',
    rarity: 'epic',
    seller: 'Shadow Knight',
    sellerId: 'npc-006',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-008',
    name: 'Strength Elixir',
    description: 'Temporarily increases strength by 20 points for 30 minutes.',
    price: 350,
    category: 'potions',
    rarity: 'uncommon',
    seller: 'Master Alchemist',
    sellerId: 'npc-007',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-009',
    name: 'Magic Crystal',
    description: 'A crystal infused with magical energy that can enhance equipment.',
    price: 750,
    category: 'materials',
    rarity: 'rare',
    seller: 'Arcane Merchant',
    sellerId: 'npc-008',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-010',
    name: 'Dungeon Key',
    description: 'A special key that unlocks access to a high-level dungeon.',
    price: 1500,
    category: 'special',
    rarity: 'epic',
    seller: 'Dungeon Master',
    sellerId: 'npc-009',
    listed: new Date().toISOString()
  },
  {
    _id: 'item-011',
    name: 'Iron Ore',
    description: 'Raw iron ore used for crafting basic weapons and armor.',
    price: 50,
    category: 'materials',
    rarity: 'common',
    seller: 'Miner',
    sellerId: 'npc-010',
    listed: new Date().toISOString()
  }
];

export const getFeaturedItems = () => {
  // Return a selection of higher rarity items as featured
  return sampleMarketplaceItems.filter(item => 
    item.rarity === 'epic' || item.rarity === 'rare'
  ).slice(0, 4);
};

export const getRecommendedItems = (userLevel = 1) => {
  // In a real app, this would be based on user preferences and level
  // For now, just return some items appropriate for the user's level
  return sampleMarketplaceItems.filter(item => {
    if (userLevel < 5) {
      return item.rarity === 'common' || item.rarity === 'uncommon';
    } else if (userLevel < 10) {
      return item.rarity === 'uncommon' || item.rarity === 'rare';
    } else {
      return item.rarity === 'rare' || item.rarity === 'epic';
    }
  }).slice(0, 6);
};
