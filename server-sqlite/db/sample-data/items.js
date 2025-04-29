// Sample items data for database initialization
module.exports = [
  {
    name: "Hunter's Dagger",
    description: "A basic dagger for novice hunters. Slightly increases attack speed.",
    price: 500,
    rarity: "common",
    category: "weapon",
    image: "hunters-dagger.jpg",
    effects: JSON.stringify([
      { type: "attack_speed", value: 5, description: "+5% Attack Speed" }
    ]),
    level_required: 1,
    rank_required: "E",
    is_featured: false,
    is_recommended: true,
    quantity_available: 100
  },
  {
    name: "Magic Crystal",
    description: "A small crystal that enhances magical abilities. Increases mana regeneration.",
    price: 800,
    rarity: "uncommon",
    category: "accessory",
    image: "magic-crystal.jpg",
    effects: JSON.stringify([
      { type: "mana_regen", value: 10, description: "+10% Mana Regeneration" }
    ]),
    level_required: 5,
    rank_required: "E",
    is_featured: true,
    is_recommended: false,
    quantity_available: 50
  },
  {
    name: "Healing Potion",
    description: "A standard healing potion that restores 100 HP.",
    price: 300,
    rarity: "common",
    category: "consumable",
    image: "healing-potion.jpg",
    effects: JSON.stringify([
      { type: "heal", value: 100, description: "Restores 100 HP" }
    ]),
    level_required: 1,
    rank_required: "E",
    is_featured: false,
    is_recommended: true,
    quantity_available: -1
  },
  {
    name: "Mana Potion",
    description: "A standard mana potion that restores 50 MP.",
    price: 250,
    rarity: "common",
    category: "consumable",
    image: "mana-potion.jpg",
    effects: JSON.stringify([
      { type: "mana", value: 50, description: "Restores 50 MP" }
    ]),
    level_required: 1,
    rank_required: "E",
    is_featured: false,
    is_recommended: true,
    quantity_available: -1
  },
  {
    name: "Steel Armor",
    description: "Standard steel armor that provides decent protection.",
    price: 1200,
    rarity: "uncommon",
    category: "armor",
    image: "steel-armor.jpg",
    effects: JSON.stringify([
      { type: "defense", value: 15, description: "+15 Defense" }
    ]),
    level_required: 10,
    rank_required: "E",
    is_featured: false,
    is_recommended: false,
    quantity_available: 30
  },
  {
    name: "Shadow Blade",
    description: "A mysterious blade that harnesses shadow energy. Deals additional shadow damage.",
    price: 3500,
    rarity: "rare",
    category: "weapon",
    image: "shadow-blade.jpg",
    effects: JSON.stringify([
      { type: "attack", value: 25, description: "+25 Attack" },
      { type: "shadow_damage", value: 10, description: "+10% Shadow Damage" }
    ]),
    level_required: 20,
    rank_required: "D",
    is_featured: true,
    is_recommended: false,
    quantity_available: 15
  },
  {
    name: "Demon Core",
    description: "A core extracted from a high-level demon. Can be used to enhance weapons.",
    price: 2000,
    rarity: "rare",
    category: "material",
    image: "demon-core.jpg",
    effects: JSON.stringify([
      { type: "crafting", value: 1, description: "Used in high-level crafting" }
    ]),
    level_required: 25,
    rank_required: "D",
    is_featured: false,
    is_recommended: false,
    quantity_available: 10
  },
  {
    name: "Dragon Scale Armor",
    description: "Armor crafted from the scales of a dragon. Provides excellent protection and fire resistance.",
    price: 8000,
    rarity: "epic",
    category: "armor",
    image: "dragon-scale-armor.jpg",
    effects: JSON.stringify([
      { type: "defense", value: 40, description: "+40 Defense" },
      { type: "fire_resistance", value: 30, description: "+30% Fire Resistance" }
    ]),
    level_required: 40,
    rank_required: "C",
    is_featured: true,
    is_recommended: false,
    quantity_available: 5
  },
  {
    name: "Amulet of Shadows",
    description: "An amulet that enhances shadow abilities. Increases shadow damage and reduces cooldowns.",
    price: 5000,
    rarity: "epic",
    category: "accessory",
    image: "amulet-of-shadows.jpg",
    effects: JSON.stringify([
      { type: "shadow_damage", value: 20, description: "+20% Shadow Damage" },
      { type: "cooldown_reduction", value: 10, description: "-10% Cooldown on Shadow Skills" }
    ]),
    level_required: 35,
    rank_required: "C",
    is_featured: true,
    is_recommended: true,
    quantity_available: 8
  },
  {
    name: "Elixir of Strength",
    description: "A rare elixir that permanently increases strength by 5 points.",
    price: 10000,
    rarity: "epic",
    category: "consumable",
    image: "elixir-of-strength.jpg",
    effects: JSON.stringify([
      { type: "permanent_strength", value: 5, description: "Permanently increases Strength by 5" }
    ]),
    level_required: 30,
    rank_required: "C",
    is_featured: false,
    is_recommended: true,
    quantity_available: 3
  },
  {
    name: "Kamish's Wrath",
    description: "A legendary weapon crafted from the remains of the dragon Kamish. Deals massive damage to all types of enemies.",
    price: 50000,
    rarity: "legendary",
    category: "weapon",
    image: "kamish-wrath.jpg",
    effects: JSON.stringify([
      { type: "attack", value: 100, description: "+100 Attack" },
      { type: "all_damage", value: 15, description: "+15% Damage to All Types" },
      { type: "critical_chance", value: 10, description: "+10% Critical Hit Chance" }
    ]),
    level_required: 70,
    rank_required: "A",
    is_featured: true,
    is_recommended: false,
    quantity_available: 1
  },
  {
    name: "Chalice of Rebirth",
    description: "A legendary artifact that grants a second chance at life. Automatically revives the user once upon death.",
    price: 100000,
    rarity: "legendary",
    category: "accessory",
    image: "chalice-of-rebirth.jpg",
    effects: JSON.stringify([
      { type: "revival", value: 1, description: "Revives user once with 50% HP when defeated" },
      { type: "health_regen", value: 5, description: "+5% Health Regeneration" }
    ]),
    level_required: 80,
    rank_required: "S",
    is_featured: true,
    is_recommended: false,
    quantity_available: 1
  }
];
