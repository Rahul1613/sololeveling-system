// Sample skills data for database initialization
module.exports = [
  {
    name: "Shadow Strike",
    description: "A powerful strike that deals shadow damage to enemies",
    type: "active",
    rarity: "rare",
    price: 2500,
    rank_required: "E",
    cooldown: 30,
    image: "shadow-strike.jpg",
    effects: JSON.stringify([
      { type: "damage", value: 150, description: "Deals 150 shadow damage" },
      { type: "debuff", value: 20, description: "Reduces target defense by 20% for 5 seconds" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      damage: { base: 150, per_level: 50 },
      debuff: { base: 20, per_level: 5 },
      cooldown: { base: 30, per_level: -2 }
    })
  },
  {
    name: "Mana Shield",
    description: "Creates a protective shield that absorbs damage based on your mana",
    type: "passive",
    rarity: "uncommon",
    price: 1200,
    rank_required: "E",
    cooldown: 0,
    image: "mana-shield.jpg",
    effects: JSON.stringify([
      { type: "shield", value: 100, description: "Absorbs 100 damage" },
      { type: "duration", value: 15, description: "Lasts for 15 seconds" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      shield: { base: 100, per_level: 50 },
      duration: { base: 15, per_level: 3 }
    })
  },
  {
    name: "Berserk",
    description: "Enter a berserk state, increasing attack speed and damage",
    type: "active",
    rarity: "uncommon",
    price: 1500,
    rank_required: "D",
    cooldown: 60,
    image: "berserk.jpg",
    effects: JSON.stringify([
      { type: "buff", value: 25, description: "Increases attack speed by 25%" },
      { type: "buff", value: 20, description: "Increases damage by 20%" },
      { type: "duration", value: 10, description: "Lasts for 10 seconds" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      attack_speed: { base: 25, per_level: 5 },
      damage: { base: 20, per_level: 5 },
      duration: { base: 10, per_level: 2 },
      cooldown: { base: 60, per_level: -5 }
    })
  },
  {
    name: "Healing Aura",
    description: "Creates an aura that heals allies within range",
    type: "passive",
    rarity: "rare",
    price: 2000,
    rank_required: "D",
    cooldown: 0,
    image: "healing-aura.jpg",
    effects: JSON.stringify([
      { type: "heal", value: 50, description: "Heals 50 HP every 5 seconds" },
      { type: "range", value: 10, description: "Affects allies within 10 meters" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      heal: { base: 50, per_level: 20 },
      range: { base: 10, per_level: 2 }
    })
  },
  {
    name: "Teleport",
    description: "Instantly teleport to a target location",
    type: "active",
    rarity: "epic",
    price: 3500,
    rank_required: "C",
    cooldown: 45,
    image: "teleport.jpg",
    effects: JSON.stringify([
      { type: "mobility", value: 30, description: "Teleport up to 30 meters" },
      { type: "buff", value: 15, description: "Increases movement speed by 15% for 3 seconds after teleport" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      range: { base: 30, per_level: 5 },
      speed_buff: { base: 15, per_level: 5 },
      buff_duration: { base: 3, per_level: 1 },
      cooldown: { base: 45, per_level: -5 }
    })
  },
  {
    name: "Stealth",
    description: "Become invisible to enemies for a short duration",
    type: "active",
    rarity: "epic",
    price: 4000,
    rank_required: "C",
    cooldown: 90,
    image: "stealth.jpg",
    effects: JSON.stringify([
      { type: "invisibility", value: 100, description: "Become completely invisible" },
      { type: "duration", value: 8, description: "Lasts for 8 seconds or until you attack" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      duration: { base: 8, per_level: 2 },
      cooldown: { base: 90, per_level: -10 }
    })
  },
  {
    name: "Mana Regeneration",
    description: "Passively increases mana regeneration rate",
    type: "passive",
    rarity: "uncommon",
    price: 1800,
    rank_required: "E",
    cooldown: 0,
    image: "mana-regen.jpg",
    effects: JSON.stringify([
      { type: "regen", value: 15, description: "Increases mana regeneration by 15%" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      regen: { base: 15, per_level: 5 }
    })
  },
  {
    name: "Arise from Shadow",
    description: "Summon a shadow soldier to fight alongside you",
    type: "active",
    rarity: "legendary",
    price: 8000,
    rank_required: "B",
    cooldown: 180,
    image: "arise-shadow.jpg",
    effects: JSON.stringify([
      { type: "summon", value: 1, description: "Summon 1 shadow soldier" },
      { type: "duration", value: 30, description: "Shadow soldier lasts for 30 seconds" },
      { type: "stats", value: 200, description: "Shadow soldier has 200 HP and deals 50 damage per hit" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      summon_count: { base: 1, per_level: 1 },
      duration: { base: 30, per_level: 10 },
      soldier_hp: { base: 200, per_level: 100 },
      soldier_damage: { base: 50, per_level: 25 },
      cooldown: { base: 180, per_level: -20 }
    })
  },
  {
    name: "Shadow Exchange",
    description: "Swap positions with your shadow or a shadow soldier",
    type: "active",
    rarity: "epic",
    price: 5000,
    rank_required: "B",
    cooldown: 60,
    image: "shadow-exchange.jpg",
    effects: JSON.stringify([
      { type: "utility", value: 0, description: "Swap positions with your shadow or a shadow soldier" },
      { type: "range", value: 50, description: "Can swap with targets up to 50 meters away" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      range: { base: 50, per_level: 10 },
      cooldown: { base: 60, per_level: -5 }
    })
  },
  {
    name: "Dominator's Touch",
    description: "Your attacks have a chance to dominate weak monsters, adding them to your shadow army",
    type: "passive",
    rarity: "legendary",
    price: 10000,
    rank_required: "A",
    cooldown: 0,
    image: "dominators-touch.jpg",
    effects: JSON.stringify([
      { type: "domination", value: 5, description: "5% chance to dominate monsters below 10% health" },
      { type: "limit", value: 1, description: "Can dominate up to 1 monster per day" }
    ]),
    max_level: 5,
    level_scaling: JSON.stringify({
      chance: { base: 5, per_level: 3 },
      health_threshold: { base: 10, per_level: 5 },
      daily_limit: { base: 1, per_level: 1 }
    })
  }
];
