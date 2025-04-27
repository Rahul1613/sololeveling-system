const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET /api/inventory
// @desc    Get user inventory
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let inventory = await Inventory.findOne({ user: req.user._id })
      .populate('items.item')
      .populate('equipped.weapon')
      .populate('equipped.head')
      .populate('equipped.chest')
      .populate('equipped.legs')
      .populate('equipped.feet')
      .populate('equipped.hands')
      .populate('equipped.offhand')
      .populate('equipped.accessory1')
      .populate('equipped.accessory2');
    
    if (!inventory) {
      // Create inventory if it doesn't exist
      inventory = new Inventory({
        user: req.user._id
      });
      
      await inventory.save();
    }
    
    res.json({
      inventory
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ 
      message: 'Server error getting inventory', 
      error: error.message 
    });
  }
});

// @route   POST /api/inventory/equip/:itemId
// @desc    Equip an item
// @access  Private
router.post('/equip/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Get user inventory
    let inventory = await Inventory.findOne({ user: req.user._id });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    // Check if item exists in inventory
    const itemIndex = inventory.items.findIndex(i => 
      i.item.toString() === itemId && !i.isEquipped
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in inventory or already equipped' });
    }
    
    // Get item details
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (!item.isEquippable) {
      return res.status(400).json({ message: 'This item cannot be equipped' });
    }
    
    // Check if user meets item requirements
    const user = await User.findById(req.user._id);
    
    if (user.level < item.requirements.level) {
      return res.status(400).json({ 
        message: `You need to be level ${item.requirements.level} to equip this item` 
      });
    }
    
    // Check stat requirements
    for (const [stat, value] of Object.entries(item.requirements.stats)) {
      if (value > 0 && user.stats[stat] < value) {
        return res.status(400).json({ 
          message: `You need ${value} ${stat} to equip this item` 
        });
      }
    }
    
    // Equip the item
    const equipResult = inventory.equipItem(itemId);
    
    if (!equipResult.success) {
      return res.status(400).json({ message: equipResult.message });
    }
    
    await inventory.save();
    
    // Apply item effects to user
    if (item.effects && item.effects.length > 0) {
      item.effects.forEach(effect => {
        if (effect.duration === 0) { // Permanent effect
          if (effect.stat === 'hp') {
            if (effect.isPercentage) {
              user.hp.max += user.hp.max * (effect.value / 100);
            } else {
              user.hp.max += effect.value;
            }
            user.hp.current = user.hp.max;
          } else if (effect.stat === 'mp') {
            if (effect.isPercentage) {
              user.mp.max += user.mp.max * (effect.value / 100);
            } else {
              user.mp.max += effect.value;
            }
            user.mp.current = user.mp.max;
          } else if (user.stats[effect.stat]) {
            if (effect.isPercentage) {
              user.stats[effect.stat] += user.stats[effect.stat] * (effect.value / 100);
            } else {
              user.stats[effect.stat] += effect.value;
            }
          }
        }
      });
      
      await user.save();
    }
    
    // Notify client about equipped item
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('item_equipped', {
      itemId: item._id,
      name: item.name,
      slot: item.equipSlot,
      effects: item.effects
    });
    
    res.json({
      message: `${item.name} equipped successfully`,
      inventory
    });
  } catch (error) {
    console.error('Equip item error:', error);
    res.status(500).json({ 
      message: 'Server error equipping item', 
      error: error.message 
    });
  }
});

// @route   POST /api/inventory/unequip/:itemId
// @desc    Unequip an item
// @access  Private
router.post('/unequip/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Get user inventory
    let inventory = await Inventory.findOne({ user: req.user._id });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    // Check if item exists in inventory and is equipped
    const itemIndex = inventory.items.findIndex(i => 
      i.item.toString() === itemId && i.isEquipped
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Equipped item not found in inventory' });
    }
    
    // Get item details
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Unequip the item
    const unequipResult = inventory.unequipItem(itemId);
    
    if (!unequipResult.success) {
      return res.status(400).json({ message: unequipResult.message });
    }
    
    await inventory.save();
    
    // Remove permanent item effects from user
    const user = await User.findById(req.user._id);
    
    if (item.effects && item.effects.length > 0) {
      item.effects.forEach(effect => {
        if (effect.duration === 0) { // Permanent effect
          if (effect.stat === 'hp') {
            if (effect.isPercentage) {
              user.hp.max = user.hp.max / (1 + (effect.value / 100));
            } else {
              user.hp.max -= effect.value;
            }
            user.hp.current = Math.min(user.hp.current, user.hp.max);
          } else if (effect.stat === 'mp') {
            if (effect.isPercentage) {
              user.mp.max = user.mp.max / (1 + (effect.value / 100));
            } else {
              user.mp.max -= effect.value;
            }
            user.mp.current = Math.min(user.mp.current, user.mp.max);
          } else if (user.stats[effect.stat]) {
            if (effect.isPercentage) {
              user.stats[effect.stat] = user.stats[effect.stat] / (1 + (effect.value / 100));
            } else {
              user.stats[effect.stat] -= effect.value;
            }
          }
        }
      });
      
      await user.save();
    }
    
    // Notify client about unequipped item
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('item_unequipped', {
      itemId: item._id,
      name: item.name,
      slot: item.equipSlot
    });
    
    res.json({
      message: `${item.name} unequipped successfully`,
      inventory
    });
  } catch (error) {
    console.error('Unequip item error:', error);
    res.status(500).json({ 
      message: 'Server error unequipping item', 
      error: error.message 
    });
  }
});

// @route   POST /api/inventory/use/:itemId
// @desc    Use a consumable item
// @access  Private
router.post('/use/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Get user inventory
    let inventory = await Inventory.findOne({ user: req.user._id });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    // Check if item exists in inventory
    const itemIndex = inventory.items.findIndex(i => 
      i.item.toString() === itemId && !i.isEquipped
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }
    
    // Get item details
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (!item.isConsumable) {
      return res.status(400).json({ message: 'This item cannot be consumed' });
    }
    
    // Use the item
    const useResult = inventory.useItem(itemId);
    
    if (!useResult.success) {
      return res.status(400).json({ message: useResult.message });
    }
    
    await inventory.save();
    
    // Apply item effects to user
    const user = await User.findById(req.user._id);
    
    if (item.effects && item.effects.length > 0) {
      item.effects.forEach(effect => {
        if (effect.stat === 'hp') {
          if (effect.isPercentage) {
            user.hp.current += user.hp.max * (effect.value / 100);
          } else {
            user.hp.current += effect.value;
          }
          user.hp.current = Math.min(user.hp.current, user.hp.max);
        } else if (effect.stat === 'mp') {
          if (effect.isPercentage) {
            user.mp.current += user.mp.max * (effect.value / 100);
          } else {
            user.mp.current += effect.value;
          }
          user.mp.current = Math.min(user.mp.current, user.mp.max);
        } else if (effect.stat === 'experience') {
          user.addExperience(effect.value);
        } else if (user.stats[effect.stat]) {
          // For temporary stat boosts, we would need a buff system
          // This is simplified for now
          if (effect.isPercentage) {
            user.stats[effect.stat] += user.stats[effect.stat] * (effect.value / 100);
          } else {
            user.stats[effect.stat] += effect.value;
          }
        }
      });
      
      await user.save();
    }
    
    // Notify client about used item
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('item_used', {
      itemId: item._id,
      name: item.name,
      effects: item.effects
    });
    
    res.json({
      message: `${item.name} used successfully`,
      effects: useResult.effects,
      inventory
    });
  } catch (error) {
    console.error('Use item error:', error);
    res.status(500).json({ 
      message: 'Server error using item', 
      error: error.message 
    });
  }
});

// @route   POST /api/inventory/discard/:itemId
// @desc    Discard an item from inventory
// @access  Private
router.post('/discard/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { quantity } = req.body;
    
    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    // Get user inventory
    let inventory = await Inventory.findOne({ user: req.user._id });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    // Check if item exists in inventory
    const itemIndex = inventory.items.findIndex(i => 
      i.item.toString() === itemId && !i.isEquipped
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }
    
    // Get item details
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Remove item from inventory
    const removeResult = inventory.removeItem(itemId, quantity);
    
    if (!removeResult.success) {
      return res.status(400).json({ message: removeResult.message });
    }
    
    await inventory.save();
    
    res.json({
      message: `${quantity} ${item.name}(s) discarded successfully`,
      inventory
    });
  } catch (error) {
    console.error('Discard item error:', error);
    res.status(500).json({ 
      message: 'Server error discarding item', 
      error: error.message 
    });
  }
});

// @route   GET /api/inventory/items
// @desc    Get all available items
// @access  Private
router.get('/items', auth, async (req, res) => {
  try {
    const { type, rarity, minLevel, maxLevel } = req.query;
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (rarity) query.rarity = rarity;
    
    if (minLevel || maxLevel) {
      query.level = {};
      if (minLevel) query.level.$gte = parseInt(minLevel);
      if (maxLevel) query.level.$lte = parseInt(maxLevel);
    }
    
    // Find items
    const items = await Item.find(query);
    
    res.json({
      items
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ 
      message: 'Server error getting items', 
      error: error.message 
    });
  }
});

module.exports = router;
