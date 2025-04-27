const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['weapon', 'armor', 'potion', 'material', 'key', 'consumable'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
    default: 'common'
  },
  image: {
    type: String,
    default: 'default-item.png'
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  price: {
    type: Number,
    default: 0
  },
  effects: [{
    stat: {
      type: String,
      enum: ['strength', 'agility', 'intelligence', 'vitality', 'endurance', 'luck', 'hp', 'mp', 'experience'],
    },
    value: Number,
    duration: Number, // in seconds, 0 for permanent
    isPercentage: {
      type: Boolean,
      default: false
    }
  }],
  requirements: {
    level: {
      type: Number,
      default: 1
    },
    stats: {
      strength: { type: Number, default: 0 },
      agility: { type: Number, default: 0 },
      intelligence: { type: Number, default: 0 },
      vitality: { type: Number, default: 0 },
      endurance: { type: Number, default: 0 },
      luck: { type: Number, default: 0 }
    }
  },
  isStackable: {
    type: Boolean,
    default: false
  },
  maxStack: {
    type: Number,
    default: 1
  },
  isEquippable: {
    type: Boolean,
    default: false
  },
  equipSlot: {
    type: String,
    enum: ['head', 'chest', 'legs', 'feet', 'hands', 'weapon', 'offhand', 'accessory', 'none'],
    default: 'none'
  },
  isConsumable: {
    type: Boolean,
    default: false
  },
  cooldown: {
    type: Number, // in seconds
    default: 0
  },
  isAvailableInShop: {
    type: Boolean,
    default: true
  },
  isLimited: {
    type: Boolean,
    default: false
  },
  limitedQuantity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate item power based on effects and rarity
itemSchema.methods.calculatePower = function() {
  let power = 0;
  
  // Base power from rarity
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
    mythic: 10
  };
  
  power += this.level * rarityMultiplier[this.rarity];
  
  // Add power from effects
  this.effects.forEach(effect => {
    let effectValue = effect.value;
    if (effect.isPercentage) {
      effectValue = effectValue / 100 * 10; // Normalize percentage effects
    }
    power += effectValue;
  });
  
  return Math.round(power);
};

// Calculate sell price based on item price and rarity
itemSchema.methods.calculateSellPrice = function() {
  const rarityMultiplier = {
    common: 0.5,
    uncommon: 0.6,
    rare: 0.7,
    epic: 0.8,
    legendary: 0.9,
    mythic: 1
  };
  
  return Math.round(this.price * rarityMultiplier[this.rarity]);
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
