const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET /api/marketplace
// @desc    Get marketplace items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, rarity, minLevel, maxLevel, minPrice, maxPrice } = req.query;
    
    // Build query
    const query = { isAvailableInShop: true };
    if (type) query.type = type;
    if (rarity) query.rarity = rarity;
    
    if (minLevel || maxLevel) {
      query.level = {};
      if (minLevel) query.level.$gte = parseInt(minLevel);
      if (maxLevel) query.level.$lte = parseInt(maxLevel);
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // Find items
    const items = await Item.find(query);
    
    res.json({
      items
    });
  } catch (error) {
    console.error('Get marketplace items error:', error);
    res.status(500).json({ 
      message: 'Server error getting marketplace items', 
      error: error.message 
    });
  }
});

// @route   POST /api/marketplace/buy/:itemId
// @desc    Buy an item from the marketplace
// @access  Private
router.post('/buy/:itemId', auth, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    // Find item
    const item = await Item.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (!item.isAvailableInShop) {
      return res.status(400).json({ message: 'This item is not available for purchase' });
    }
    
    // Check if limited item has enough stock
    if (item.isLimited && item.limitedQuantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${item.limitedQuantity} of this item available` 
      });
    }
    
    // Calculate total price
    const totalPrice = item.price * quantity;
    
    // Check if user has enough currency
    const user = await User.findById(req.user._id);
    
    if (user.currency < totalPrice) {
      return res.status(400).json({ 
        message: 'Not enough currency to purchase this item',
        required: totalPrice,
        available: user.currency
      });
    }
    
    // Get user inventory
    let inventory = await Inventory.findOne({ user: user._id });
    
    if (!inventory) {
      // Create inventory if it doesn't exist
      inventory = new Inventory({
        user: user._id
      });
    }
    
    // Check if inventory has space
    if (inventory.items.length >= inventory.capacity) {
      return res.status(400).json({ message: 'Inventory is full' });
    }
    
    // Add item to inventory
    const addItemResult = inventory.addItem(item._id, quantity);
    
    if (!addItemResult.success) {
      return res.status(400).json({ message: addItemResult.message });
    }
    
    // Deduct currency from user
    user.currency -= totalPrice;
    
    // Update limited item quantity if applicable
    if (item.isLimited) {
      item.limitedQuantity -= quantity;
      await item.save();
    }
    
    // Create transaction record
    await Transaction.createPurchase(
      user._id,
      [{
        item: item._id,
        quantity,
        price: item.price
      }],
      `Purchased ${quantity} ${item.name}`
    );
    
    await user.save();
    await inventory.save();
    
    // Notify client about purchase
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('item_purchased', {
      itemId: item._id,
      name: item.name,
      quantity,
      totalPrice
    });
    
    res.json({
      message: `Successfully purchased ${quantity} ${item.name} for ${totalPrice} currency`,
      item,
      quantity,
      totalPrice,
      remainingCurrency: user.currency
    });
  } catch (error) {
    console.error('Buy item error:', error);
    res.status(500).json({ 
      message: 'Server error buying item', 
      error: error.message 
    });
  }
});

// @route   POST /api/marketplace/sell/:itemId
// @desc    Sell an item to the marketplace
// @access  Private
router.post('/sell/:itemId', auth, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    // Find item
    const item = await Item.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Get user inventory
    const inventory = await Inventory.findOne({ user: req.user._id });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    // Check if user has the item
    const inventoryItem = inventory.items.find(i => 
      i.item.toString() === item._id.toString() && !i.isEquipped
    );
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }
    
    if (inventoryItem.quantity < quantity) {
      return res.status(400).json({ 
        message: `You only have ${inventoryItem.quantity} of this item` 
      });
    }
    
    // Calculate sell price
    const sellPrice = item.calculateSellPrice();
    const totalSellPrice = sellPrice * quantity;
    
    // Remove item from inventory
    const removeResult = inventory.removeItem(item._id, quantity);
    
    if (!removeResult.success) {
      return res.status(400).json({ message: removeResult.message });
    }
    
    // Add currency to user
    const user = await User.findById(req.user._id);
    user.currency += totalSellPrice;
    
    // Create transaction record
    await Transaction.createPurchase(
      user._id,
      [{
        item: item._id,
        quantity: -quantity,
        price: sellPrice
      }],
      `Sold ${quantity} ${item.name}`
    );
    
    await user.save();
    await inventory.save();
    
    // Notify client about sale
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('item_sold', {
      itemId: item._id,
      name: item.name,
      quantity,
      totalSellPrice
    });
    
    res.json({
      message: `Successfully sold ${quantity} ${item.name} for ${totalSellPrice} currency`,
      item,
      quantity,
      totalSellPrice,
      newCurrency: user.currency
    });
  } catch (error) {
    console.error('Sell item error:', error);
    res.status(500).json({ 
      message: 'Server error selling item', 
      error: error.message 
    });
  }
});

// @route   GET /api/marketplace/featured
// @desc    Get featured marketplace items
// @access  Private
router.get('/featured', auth, async (req, res) => {
  try {
    // Get random selection of items with higher rarity
    const featuredItems = await Item.aggregate([
      { $match: { isAvailableInShop: true, rarity: { $in: ['rare', 'epic', 'legendary', 'mythic'] } } },
      { $sample: { size: 5 } }
    ]);
    
    res.json({
      items: featuredItems
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({ 
      message: 'Server error getting featured items', 
      error: error.message 
    });
  }
});

// @route   GET /api/marketplace/recommended
// @desc    Get recommended items based on user level and stats
// @access  Private
router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Find items appropriate for user's level
    const recommendedItems = await Item.find({
      isAvailableInShop: true,
      'requirements.level': { $lte: user.level, $gte: user.level - 5 }
    }).limit(10);
    
    res.json({
      items: recommendedItems
    });
  } catch (error) {
    console.error('Get recommended items error:', error);
    res.status(500).json({ 
      message: 'Server error getting recommended items', 
      error: error.message 
    });
  }
});

module.exports = router;
