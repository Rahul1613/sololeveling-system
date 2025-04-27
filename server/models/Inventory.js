const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    isEquipped: {
      type: Boolean,
      default: false
    },
    acquiredAt: {
      type: Date,
      default: Date.now
    }
  }],
  capacity: {
    type: Number,
    default: 20
  },
  equipped: {
    weapon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    chest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    legs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    feet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    hands: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    offhand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    accessory1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    accessory2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to add an item to inventory
inventorySchema.methods.addItem = function(itemId, quantity = 1) {
  // Check if inventory is full
  if (this.items.length >= this.capacity) {
    return {
      success: false,
      message: 'Inventory is full'
    };
  }
  
  // Check if item already exists in inventory
  const existingItemIndex = this.items.findIndex(i => 
    i.item.toString() === itemId.toString() && !i.isEquipped
  );
  
  if (existingItemIndex > -1) {
    // Item exists, increase quantity
    this.items[existingItemIndex].quantity += quantity;
    return {
      success: true,
      message: 'Item quantity updated',
      item: this.items[existingItemIndex]
    };
  } else {
    // Add new item
    this.items.push({
      item: itemId,
      quantity,
      isEquipped: false,
      acquiredAt: new Date()
    });
    return {
      success: true,
      message: 'Item added to inventory',
      item: this.items[this.items.length - 1]
    };
  }
};

// Method to remove an item from inventory
inventorySchema.methods.removeItem = function(itemId, quantity = 1) {
  const itemIndex = this.items.findIndex(i => 
    i.item.toString() === itemId.toString() && !i.isEquipped
  );
  
  if (itemIndex === -1) {
    return {
      success: false,
      message: 'Item not found in inventory'
    };
  }
  
  if (this.items[itemIndex].quantity > quantity) {
    // Reduce quantity
    this.items[itemIndex].quantity -= quantity;
    return {
      success: true,
      message: 'Item quantity reduced',
      item: this.items[itemIndex]
    };
  } else {
    // Remove item completely
    this.items.splice(itemIndex, 1);
    return {
      success: true,
      message: 'Item removed from inventory'
    };
  }
};

// Method to equip an item
inventorySchema.methods.equipItem = function(itemId) {
  const itemIndex = this.items.findIndex(i => 
    i.item.toString() === itemId.toString() && !i.isEquipped
  );
  
  if (itemIndex === -1) {
    return {
      success: false,
      message: 'Item not found in inventory'
    };
  }
  
  // Get the item details (this assumes the item document is populated)
  const item = this.items[itemIndex].item;
  
  if (!item.isEquippable) {
    return {
      success: false,
      message: 'This item cannot be equipped'
    };
  }
  
  // Unequip current item in that slot if any
  if (this.equipped[item.equipSlot]) {
    const currentEquippedItemId = this.equipped[item.equipSlot];
    const currentEquippedIndex = this.items.findIndex(i => 
      i.item.toString() === currentEquippedItemId.toString() && i.isEquipped
    );
    
    if (currentEquippedIndex > -1) {
      this.items[currentEquippedIndex].isEquipped = false;
    }
  }
  
  // Equip new item
  this.items[itemIndex].isEquipped = true;
  this.equipped[item.equipSlot] = item._id;
  
  return {
    success: true,
    message: `Item equipped in ${item.equipSlot} slot`,
    item: this.items[itemIndex]
  };
};

// Method to unequip an item
inventorySchema.methods.unequipItem = function(itemId) {
  const itemIndex = this.items.findIndex(i => 
    i.item.toString() === itemId.toString() && i.isEquipped
  );
  
  if (itemIndex === -1) {
    return {
      success: false,
      message: 'Equipped item not found'
    };
  }
  
  // Get the item details (this assumes the item document is populated)
  const item = this.items[itemIndex].item;
  
  // Unequip the item
  this.items[itemIndex].isEquipped = false;
  this.equipped[item.equipSlot] = null;
  
  return {
    success: true,
    message: `Item unequipped from ${item.equipSlot} slot`,
    item: this.items[itemIndex]
  };
};

// Method to use a consumable item
inventorySchema.methods.useItem = function(itemId) {
  const itemIndex = this.items.findIndex(i => 
    i.item.toString() === itemId.toString() && !i.isEquipped
  );
  
  if (itemIndex === -1) {
    return {
      success: false,
      message: 'Item not found in inventory'
    };
  }
  
  // Get the item details (this assumes the item document is populated)
  const item = this.items[itemIndex].item;
  
  if (!item.isConsumable) {
    return {
      success: false,
      message: 'This item cannot be consumed'
    };
  }
  
  // Reduce quantity
  if (this.items[itemIndex].quantity > 1) {
    this.items[itemIndex].quantity -= 1;
  } else {
    this.items.splice(itemIndex, 1);
  }
  
  return {
    success: true,
    message: 'Item used',
    effects: item.effects
  };
};

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
