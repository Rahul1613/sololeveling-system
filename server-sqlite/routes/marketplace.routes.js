const express = require('express');
const router = express.Router();
const Item = require('../models/item.model');
const UserItem = require('../models/userItem.model');
const User = require('../models/user.model');
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all marketplace items
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    res.status(500).json({ message: 'Failed to fetch marketplace items' });
  }
});

// Get featured items
router.get('/featured', authenticateToken, async (req, res) => {
  try {
    const featuredItems = await Item.findAll({
      where: { is_featured: true }
    });
    res.json(featuredItems);
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({ message: 'Failed to fetch featured items' });
  }
});

// Get recommended items
router.get('/recommended', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Get items recommended for the user's rank
    const recommendedItems = await Item.findAll({
      where: {
        is_recommended: true,
        rank_required: user.rank
      }
    });
    
    res.json(recommendedItems);
  } catch (error) {
    console.error('Error fetching recommended items:', error);
    res.status(500).json({ message: 'Failed to fetch recommended items' });
  }
});

// Buy an item
router.post('/buy', authenticateToken, async (req, res) => {
  const { itemId, quantity = 1 } = req.body;
  const userId = req.user.id;
  
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    // Find the item
    const item = await Item.findByPk(itemId);
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if item is available
    if (item.quantity_available !== -1 && item.quantity_available < quantity) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Not enough items available' });
    }
    
    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has enough gold
    const totalCost = item.price * quantity;
    if (user.gold < totalCost) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Not enough gold' });
    }
    
    // Check if user meets level and rank requirements
    if (user.level < item.level_required) {
      await transaction.rollback();
      return res.status(400).json({ message: `Level ${item.level_required} required to purchase this item` });
    }
    
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const userRankIndex = rankOrder.indexOf(user.rank);
    const requiredRankIndex = rankOrder.indexOf(item.rank_required);
    
    if (userRankIndex < requiredRankIndex) {
      await transaction.rollback();
      return res.status(400).json({ message: `Rank ${item.rank_required} required to purchase this item` });
    }
    
    // Check if user already has this item
    let userItem = await UserItem.findOne({
      where: {
        user_id: userId,
        item_id: itemId
      }
    });
    
    // If user already has this item and it's not a consumable, just increase quantity
    if (userItem) {
      userItem.quantity += quantity;
      await userItem.save({ transaction });
    } else {
      // Otherwise create a new user item entry
      userItem = await UserItem.create({
        user_id: userId,
        item_id: itemId,
        quantity,
        is_equipped: false
      }, { transaction });
    }
    
    // Update item quantity if it's not unlimited
    if (item.quantity_available !== -1) {
      item.quantity_available -= quantity;
      await item.save({ transaction });
    }
    
    // Deduct gold from user
    user.gold -= totalCost;
    await user.save({ transaction });
    
    // Commit the transaction
    await transaction.commit();
    
    res.json({
      message: `Successfully purchased ${quantity} ${item.name}`,
      item: userItem,
      gold: user.gold
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error buying item:', error);
    res.status(500).json({ message: 'Failed to buy item' });
  }
});

// Get user's inventory
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const userItems = await UserItem.findAll({
      where: { user_id: req.user.id },
      include: [Item]
    });
    
    res.json(userItems);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});

// Equip an item
router.post('/equip', authenticateToken, async (req, res) => {
  const { userItemId, slot } = req.body;
  const userId = req.user.id;
  
  try {
    // Find the user item
    const userItem = await UserItem.findOne({
      where: {
        id: userItemId,
        user_id: userId
      },
      include: [Item]
    });
    
    if (!userItem) {
      return res.status(404).json({ message: 'Item not found in your inventory' });
    }
    
    // Check if item is equippable (not a consumable or material)
    if (['consumable', 'material'].includes(userItem.Item.category)) {
      return res.status(400).json({ message: 'This item cannot be equipped' });
    }
    
    // Unequip any item in the same slot
    await UserItem.update(
      { is_equipped: false },
      {
        where: {
          user_id: userId,
          slot,
          is_equipped: true
        }
      }
    );
    
    // Equip the new item
    userItem.is_equipped = true;
    userItem.slot = slot;
    await userItem.save();
    
    res.json({
      message: `Successfully equipped ${userItem.Item.name}`,
      item: userItem
    });
  } catch (error) {
    console.error('Error equipping item:', error);
    res.status(500).json({ message: 'Failed to equip item' });
  }
});

// Use a consumable item
router.post('/use', authenticateToken, async (req, res) => {
  const { userItemId } = req.body;
  const userId = req.user.id;
  
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    // Find the user item
    const userItem = await UserItem.findOne({
      where: {
        id: userItemId,
        user_id: userId
      },
      include: [Item]
    });
    
    if (!userItem) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Item not found in your inventory' });
    }
    
    // Check if item is a consumable
    if (userItem.Item.category !== 'consumable') {
      await transaction.rollback();
      return res.status(400).json({ message: 'This item cannot be used' });
    }
    
    // Check if user has at least one of this item
    if (userItem.quantity < 1) {
      await transaction.rollback();
      return res.status(400).json({ message: 'You do not have any of this item' });
    }
    
    // Find the user
    const user = await User.findByPk(userId);
    
    // Apply item effects
    const effects = userItem.Item.effects;
    let effectsApplied = [];
    
    for (const effect of effects) {
      switch (effect.type) {
        case 'heal':
          user.health = Math.min(user.health + effect.value, 100);
          effectsApplied.push(`Restored ${effect.value} HP`);
          break;
        case 'mana':
          user.mana = Math.min(user.mana + effect.value, 100);
          effectsApplied.push(`Restored ${effect.value} MP`);
          break;
        case 'permanent_strength':
          user.strength += effect.value;
          effectsApplied.push(`Increased Strength by ${effect.value}`);
          break;
        case 'permanent_intelligence':
          user.intelligence += effect.value;
          effectsApplied.push(`Increased Intelligence by ${effect.value}`);
          break;
        case 'permanent_agility':
          user.agility += effect.value;
          effectsApplied.push(`Increased Agility by ${effect.value}`);
          break;
        // Add more effect types as needed
      }
    }
    
    // Save user changes
    await user.save({ transaction });
    
    // Reduce item quantity
    userItem.quantity -= 1;
    if (userItem.quantity <= 0) {
      await userItem.destroy({ transaction });
    } else {
      await userItem.save({ transaction });
    }
    
    // Commit the transaction
    await transaction.commit();
    
    res.json({
      message: `Used ${userItem.Item.name}`,
      effects: effectsApplied,
      user: {
        health: user.health,
        mana: user.mana,
        strength: user.strength,
        intelligence: user.intelligence,
        agility: user.agility
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error using item:', error);
    res.status(500).json({ message: 'Failed to use item' });
  }
});

module.exports = router;
