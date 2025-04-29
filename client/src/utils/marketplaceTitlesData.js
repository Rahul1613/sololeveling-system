// Sample marketplace titles data
export const sampleMarketplaceTitles = [
  {
    _id: 'title1',
    name: 'Novice Hunter',
    description: 'A title earned by completing your first hunt',
    rarity: 'common',
    price: 500,
    requirements: [
      { type: 'hunts', value: 1, description: 'Complete 1 hunt' }
    ],
    bonuses: [
      { type: 'exp', value: 5, description: '+5% EXP gain' }
    ],
    image: '/assets/images/titles/novice-hunter.jpg'
  },
  {
    _id: 'title2',
    name: 'Monster Slayer',
    description: 'A title earned by slaying 50 monsters',
    rarity: 'uncommon',
    price: 1200,
    requirements: [
      { type: 'kills', value: 50, description: 'Defeat 50 monsters' }
    ],
    bonuses: [
      { type: 'damage', value: 3, description: '+3% damage against monsters' }
    ],
    image: '/assets/images/titles/monster-slayer.jpg'
  },
  {
    _id: 'title3',
    name: 'Dungeon Explorer',
    description: 'A title earned by exploring 5 different dungeons',
    rarity: 'uncommon',
    price: 1500,
    requirements: [
      { type: 'dungeons', value: 5, description: 'Explore 5 different dungeons' }
    ],
    bonuses: [
      { type: 'defense', value: 5, description: '+5% defense in dungeons' }
    ],
    image: '/assets/images/titles/dungeon-explorer.jpg'
  },
  {
    _id: 'title4',
    name: 'Shadow Monarch\'s Disciple',
    description: 'A title earned by mastering shadow abilities',
    rarity: 'rare',
    price: 3000,
    requirements: [
      { type: 'shadow_skills', value: 3, description: 'Learn 3 shadow-type skills' }
    ],
    bonuses: [
      { type: 'shadow_damage', value: 10, description: '+10% shadow damage' },
      { type: 'mana_cost', value: -5, description: '-5% mana cost for shadow skills' }
    ],
    image: '/assets/images/titles/shadow-monarch-disciple.jpg'
  },
  {
    _id: 'title5',
    name: 'Guild Master',
    description: 'A title earned by leading a guild to prominence',
    rarity: 'epic',
    price: 5000,
    requirements: [
      { type: 'guild_rank', value: 'A', description: 'Lead a guild to A-rank' }
    ],
    bonuses: [
      { type: 'leadership', value: 15, description: '+15% to all stats of guild members when in party' },
      { type: 'reputation', value: 10, description: '+10% reputation gain' }
    ],
    image: '/assets/images/titles/guild-master.jpg'
  },
  {
    _id: 'title6',
    name: 'Demon Slayer',
    description: 'A title earned by defeating powerful demon-type monsters',
    rarity: 'rare',
    price: 2800,
    requirements: [
      { type: 'demon_kills', value: 25, description: 'Defeat 25 demon-type monsters' }
    ],
    bonuses: [
      { type: 'damage', value: 15, description: '+15% damage against demon-type monsters' },
      { type: 'resistance', value: 10, description: '+10% resistance to demon attacks' }
    ],
    image: '/assets/images/titles/demon-slayer.jpg'
  },
  {
    _id: 'title7',
    name: 'National Level Hunter',
    description: 'A title recognized by the Hunter Association for exceptional skill',
    rarity: 'legendary',
    price: 10000,
    requirements: [
      { type: 'rank', value: 'S', description: 'Achieve S-rank hunter status' },
      { type: 'boss_kills', value: 10, description: 'Defeat 10 S-rank boss monsters' }
    ],
    bonuses: [
      { type: 'all_stats', value: 5, description: '+5% to all stats' },
      { type: 'authority', value: 20, description: '+20% authority in hunter-related matters' },
      { type: 'quest_rewards', value: 15, description: '+15% to all quest rewards' }
    ],
    image: '/assets/images/titles/national-level-hunter.jpg'
  },
  {
    _id: 'title8',
    name: 'Solo Leveler',
    description: 'A title earned by those who prefer to hunt alone',
    rarity: 'epic',
    price: 4500,
    requirements: [
      { type: 'solo_hunts', value: 50, description: 'Complete 50 hunts solo' }
    ],
    bonuses: [
      { type: 'exp', value: 10, description: '+10% EXP gain when hunting solo' },
      { type: 'drop_rate', value: 15, description: '+15% item drop rate when hunting solo' }
    ],
    image: '/assets/images/titles/solo-leveler.jpg'
  }
];

// Helper function to get titles based on performance metrics
export const getTitlesByPerformance = (performance) => {
  const { hunts = 0, kills = 0, dungeons = 0, rank = 'E', bossKills = 0, soloHunts = 0 } = performance;
  
  return sampleMarketplaceTitles.filter(title => {
    let meetsRequirements = true;
    
    title.requirements.forEach(req => {
      switch(req.type) {
        case 'hunts':
          if (hunts < req.value) meetsRequirements = false;
          break;
        case 'kills':
          if (kills < req.value) meetsRequirements = false;
          break;
        case 'dungeons':
          if (dungeons < req.value) meetsRequirements = false;
          break;
        case 'rank':
          const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
          const userRankIndex = rankOrder.indexOf(rank);
          const requiredRankIndex = rankOrder.indexOf(req.value);
          if (userRankIndex < requiredRankIndex) meetsRequirements = false;
          break;
        case 'boss_kills':
          if (bossKills < req.value) meetsRequirements = false;
          break;
        case 'solo_hunts':
          if (soloHunts < req.value) meetsRequirements = false;
          break;
        default:
          break;
      }
    });
    
    return meetsRequirements;
  });
};

// Helper function to get titles by rarity
export const getTitlesByRarity = (rarity) => {
  return sampleMarketplaceTitles.filter(title => title.rarity === rarity);
};
