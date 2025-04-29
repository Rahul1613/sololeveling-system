// Sample marketplace skills data
export const sampleMarketplaceSkills = [
  {
    _id: 'skill1',
    name: 'Shadow Strike',
    description: 'A powerful strike that deals shadow damage to enemies',
    type: 'active',
    rarity: 'rare',
    price: 2500,
    rankRequired: 'E',
    cooldown: 30,
    image: '/assets/images/skills/shadow-strike.jpg',
    effects: [
      { type: 'damage', value: 150, description: 'Deals 150 shadow damage' },
      { type: 'debuff', value: 20, description: 'Reduces target defense by 20% for 5 seconds' }
    ]
  },
  {
    _id: 'skill2',
    name: 'Mana Shield',
    description: 'Creates a protective shield that absorbs damage based on your mana',
    type: 'passive',
    rarity: 'uncommon',
    price: 1200,
    rankRequired: 'E',
    image: '/assets/images/skills/mana-shield.jpg',
    effects: [
      { type: 'shield', value: 100, description: 'Absorbs 100 damage' },
      { type: 'duration', value: 15, description: 'Lasts for 15 seconds' }
    ]
  },
  {
    _id: 'skill3',
    name: 'Berserk',
    description: 'Enter a berserk state, increasing attack speed and damage',
    type: 'active',
    rarity: 'uncommon',
    price: 1500,
    rankRequired: 'D',
    cooldown: 60,
    image: '/assets/images/skills/berserk.jpg',
    effects: [
      { type: 'buff', value: 25, description: 'Increases attack speed by 25%' },
      { type: 'buff', value: 20, description: 'Increases damage by 20%' },
      { type: 'duration', value: 10, description: 'Lasts for 10 seconds' }
    ]
  },
  {
    _id: 'skill4',
    name: 'Healing Aura',
    description: 'Creates an aura that heals allies within range',
    type: 'passive',
    rarity: 'rare',
    price: 2000,
    rankRequired: 'D',
    image: '/assets/images/skills/healing-aura.jpg',
    effects: [
      { type: 'heal', value: 50, description: 'Heals 50 HP every 5 seconds' },
      { type: 'range', value: 10, description: 'Affects allies within 10 meters' }
    ]
  },
  {
    _id: 'skill5',
    name: 'Teleport',
    description: 'Instantly teleport to a target location',
    type: 'active',
    rarity: 'epic',
    price: 3500,
    rankRequired: 'C',
    cooldown: 45,
    image: '/assets/images/skills/teleport.jpg',
    effects: [
      { type: 'mobility', value: 30, description: 'Teleport up to 30 meters' },
      { type: 'buff', value: 15, description: 'Increases movement speed by 15% for 3 seconds after teleport' }
    ]
  },
  {
    _id: 'skill6',
    name: 'Stealth',
    description: 'Become invisible to enemies for a short duration',
    type: 'active',
    rarity: 'epic',
    price: 4000,
    rankRequired: 'C',
    cooldown: 90,
    image: '/assets/images/skills/stealth.jpg',
    effects: [
      { type: 'invisibility', value: 100, description: 'Become completely invisible' },
      { type: 'duration', value: 8, description: 'Lasts for 8 seconds or until you attack' }
    ]
  },
  {
    _id: 'skill7',
    name: 'Mana Regeneration',
    description: 'Passively increases mana regeneration rate',
    type: 'passive',
    rarity: 'uncommon',
    price: 1800,
    rankRequired: 'E',
    image: '/assets/images/skills/mana-regen.jpg',
    effects: [
      { type: 'regen', value: 15, description: 'Increases mana regeneration by 15%' }
    ]
  },
  {
    _id: 'skill8',
    name: 'Arise from Shadow',
    description: 'Summon a shadow soldier to fight alongside you',
    type: 'active',
    rarity: 'legendary',
    price: 8000,
    rankRequired: 'B',
    cooldown: 180,
    image: '/assets/images/skills/arise-shadow.jpg',
    effects: [
      { type: 'summon', value: 1, description: 'Summon 1 shadow soldier' },
      { type: 'duration', value: 30, description: 'Shadow soldier lasts for 30 seconds' },
      { type: 'stats', value: 200, description: 'Shadow soldier has 200 HP and deals 50 damage per hit' }
    ]
  }
];

// Helper function to get skills based on rank
export const getSkillsByRank = (rank) => {
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  const userRankIndex = rankOrder.indexOf(rank);
  
  if (userRankIndex === -1) return [];
  
  return sampleMarketplaceSkills.filter(skill => {
    const skillRankIndex = rankOrder.indexOf(skill.rankRequired);
    return skillRankIndex <= userRankIndex;
  });
};

// Helper function to get skills by type
export const getSkillsByType = (type) => {
  return sampleMarketplaceSkills.filter(skill => skill.type === type);
};

// Helper function to get skills by rarity
export const getSkillsByRarity = (rarity) => {
  return sampleMarketplaceSkills.filter(skill => skill.rarity === rarity);
};
