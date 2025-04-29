// Sample titles data for database initialization
module.exports = [
  {
    name: "Novice Hunter",
    description: "A title earned by completing your first hunt",
    rarity: "common",
    price: 500,
    image: "novice-hunter.jpg",
    requirements: JSON.stringify([
      { type: "hunts", value: 1, description: "Complete 1 hunt" }
    ]),
    bonuses: JSON.stringify([
      { type: "exp", value: 5, description: "+5% EXP gain" }
    ])
  },
  {
    name: "Monster Slayer",
    description: "A title earned by slaying 50 monsters",
    rarity: "uncommon",
    price: 1200,
    image: "monster-slayer.jpg",
    requirements: JSON.stringify([
      { type: "kills", value: 50, description: "Defeat 50 monsters" }
    ]),
    bonuses: JSON.stringify([
      { type: "damage", value: 3, description: "+3% damage against monsters" }
    ])
  },
  {
    name: "Dungeon Explorer",
    description: "A title earned by exploring 5 different dungeons",
    rarity: "uncommon",
    price: 1500,
    image: "dungeon-explorer.jpg",
    requirements: JSON.stringify([
      { type: "dungeons", value: 5, description: "Explore 5 different dungeons" }
    ]),
    bonuses: JSON.stringify([
      { type: "defense", value: 5, description: "+5% defense in dungeons" }
    ])
  },
  {
    name: "Shadow Monarch's Disciple",
    description: "A title earned by mastering shadow abilities",
    rarity: "rare",
    price: 3000,
    image: "shadow-monarch-disciple.jpg",
    requirements: JSON.stringify([
      { type: "shadow_skills", value: 3, description: "Learn 3 shadow-type skills" }
    ]),
    bonuses: JSON.stringify([
      { type: "shadow_damage", value: 10, description: "+10% shadow damage" },
      { type: "mana_cost", value: -5, description: "-5% mana cost for shadow skills" }
    ])
  },
  {
    name: "Guild Master",
    description: "A title earned by leading a guild to prominence",
    rarity: "epic",
    price: 5000,
    image: "guild-master.jpg",
    requirements: JSON.stringify([
      { type: "guild_rank", value: "A", description: "Lead a guild to A-rank" }
    ]),
    bonuses: JSON.stringify([
      { type: "leadership", value: 15, description: "+15% to all stats of guild members when in party" },
      { type: "reputation", value: 10, description: "+10% reputation gain" }
    ])
  },
  {
    name: "Demon Slayer",
    description: "A title earned by defeating powerful demon-type monsters",
    rarity: "rare",
    price: 2800,
    image: "demon-slayer.jpg",
    requirements: JSON.stringify([
      { type: "demon_kills", value: 25, description: "Defeat 25 demon-type monsters" }
    ]),
    bonuses: JSON.stringify([
      { type: "damage", value: 15, description: "+15% damage against demon-type monsters" },
      { type: "resistance", value: 10, description: "+10% resistance to demon attacks" }
    ])
  },
  {
    name: "National Level Hunter",
    description: "A title recognized by the Hunter Association for exceptional skill",
    rarity: "legendary",
    price: 10000,
    image: "national-level-hunter.jpg",
    requirements: JSON.stringify([
      { type: "rank", value: "S", description: "Achieve S-rank hunter status" },
      { type: "boss_kills", value: 10, description: "Defeat 10 S-rank boss monsters" }
    ]),
    bonuses: JSON.stringify([
      { type: "all_stats", value: 5, description: "+5% to all stats" },
      { type: "authority", value: 20, description: "+20% authority in hunter-related matters" },
      { type: "quest_rewards", value: 15, description: "+15% to all quest rewards" }
    ])
  },
  {
    name: "Solo Leveler",
    description: "A title earned by those who prefer to hunt alone",
    rarity: "epic",
    price: 4500,
    image: "solo-leveler.jpg",
    requirements: JSON.stringify([
      { type: "solo_hunts", value: 50, description: "Complete 50 hunts solo" }
    ]),
    bonuses: JSON.stringify([
      { type: "exp", value: 10, description: "+10% EXP gain when hunting solo" },
      { type: "drop_rate", value: 15, description: "+15% item drop rate when hunting solo" }
    ])
  },
  {
    name: "Shadow Monarch",
    description: "The ultimate title, reserved for those who have mastered the power of shadows",
    rarity: "legendary",
    price: 50000,
    image: "shadow-monarch.jpg",
    requirements: JSON.stringify([
      { type: "rank", value: "S", description: "Achieve S-rank hunter status" },
      { type: "shadow_army", value: 50, description: "Have 50 shadow soldiers in your army" },
      { type: "boss_kills", value: 20, description: "Defeat 20 S-rank boss monsters" }
    ]),
    bonuses: JSON.stringify([
      { type: "shadow_damage", value: 30, description: "+30% shadow damage" },
      { type: "shadow_army_stats", value: 20, description: "+20% to all shadow soldier stats" },
      { type: "mana_cost", value: -20, description: "-20% mana cost for all skills" },
      { type: "all_stats", value: 10, description: "+10% to all stats" }
    ])
  },
  {
    name: "Arise",
    description: "A title earned by those who have mastered the art of shadow extraction",
    rarity: "epic",
    price: 8000,
    image: "arise.jpg",
    requirements: JSON.stringify([
      { type: "shadow_extractions", value: 20, description: "Successfully extract 20 shadows" }
    ]),
    bonuses: JSON.stringify([
      { type: "extraction_chance", value: 20, description: "+20% shadow extraction success rate" },
      { type: "shadow_army_size", value: 5, description: "+5 maximum shadow army size" }
    ])
  }
];
