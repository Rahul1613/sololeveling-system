const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shadow = require('../models/Shadow');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// @route   GET /api/shadows
// @desc    Get user's shadow army
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const shadows = await Shadow.find({ owner: req.user._id })
      .populate('equipment.weapon')
      .populate('equipment.armor')
      .populate('equipment.accessory');
    
    res.json({
      shadows
    });
  } catch (error) {
    console.error('Get shadows error:', error);
    res.status(500).json({ 
      message: 'Server error getting shadow army', 
      error: error.message 
    });
  }
});

// @route   GET /api/shadows/:id
// @desc    Get a specific shadow
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    })
      .populate('equipment.weapon')
      .populate('equipment.armor')
      .populate('equipment.accessory');
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    res.json({
      shadow
    });
  } catch (error) {
    console.error('Get shadow error:', error);
    res.status(500).json({ 
      message: 'Server error getting shadow', 
      error: error.message 
    });
  }
});

// @route   POST /api/shadows
// @desc    Create a new shadow
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    // Check if shadow type is valid
    const validTypes = ['soldier', 'knight', 'mage', 'archer', 'assassin', 'tank', 'healer', 'boss'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid shadow type' });
    }
    
    // Create new shadow
    const shadow = new Shadow({
      name,
      type,
      owner: req.user._id
    });
    
    await shadow.save();
    
    // Notify client about new shadow
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('shadow_acquired', {
      shadowId: shadow._id,
      name: shadow.name,
      type: shadow.type,
      rank: shadow.rank
    });
    
    res.status(201).json({
      message: 'Shadow created successfully',
      shadow
    });
  } catch (error) {
    console.error('Create shadow error:', error);
    res.status(500).json({ 
      message: 'Server error creating shadow', 
      error: error.message 
    });
  }
});

// @route   PUT /api/shadows/:id
// @desc    Update a shadow
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, isActive } = req.body;
    
    // Find shadow
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Update shadow
    if (name) shadow.name = name;
    if (isActive !== undefined) shadow.isActive = isActive;
    
    await shadow.save();
    
    res.json({
      message: 'Shadow updated successfully',
      shadow
    });
  } catch (error) {
    console.error('Update shadow error:', error);
    res.status(500).json({ 
      message: 'Server error updating shadow', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/shadows/:id
// @desc    Delete a shadow
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find shadow
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Check if shadow is deployed
    if (shadow.isDeployed) {
      return res.status(400).json({ message: 'Cannot delete a deployed shadow' });
    }
    
    await shadow.remove();
    
    res.json({
      message: 'Shadow deleted successfully'
    });
  } catch (error) {
    console.error('Delete shadow error:', error);
    res.status(500).json({ 
      message: 'Server error deleting shadow', 
      error: error.message 
    });
  }
});

// @route   POST /api/shadows/:id/level
// @desc    Level up a shadow
// @access  Private
router.post('/:id/level', auth, async (req, res) => {
  try {
    const { experience } = req.body;
    
    if (!experience || experience <= 0) {
      return res.status(400).json({ message: 'Invalid experience amount' });
    }
    
    // Find shadow
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Add experience and handle level up
    const levelUpResult = shadow.addExperience(experience);
    await shadow.save();
    
    // Notify client about shadow level up
    if (levelUpResult.leveledUp) {
      const io = req.app.get('io');
      io.to(req.user._id.toString()).emit('shadow_level_up', {
        shadowId: shadow._id,
        name: shadow.name,
        oldLevel: levelUpResult.oldLevel,
        newLevel: levelUpResult.newLevel,
        newRank: levelUpResult.newRank
      });
    }
    
    res.json({
      message: 'Shadow gained experience',
      shadow,
      levelUp: levelUpResult
    });
  } catch (error) {
    console.error('Shadow level up error:', error);
    res.status(500).json({ 
      message: 'Server error leveling up shadow', 
      error: error.message 
    });
  }
});

// @route   POST /api/shadows/:id/equip/:itemId
// @desc    Equip an item to a shadow
// @access  Private
router.post('/:id/equip/:itemId', auth, async (req, res) => {
  try {
    // Find shadow
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Find item
    const item = await Item.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if item is equippable
    if (!item.isEquippable) {
      return res.status(400).json({ message: 'This item cannot be equipped' });
    }
    
    // Check if shadow meets item requirements
    if (shadow.level < item.requirements.level) {
      return res.status(400).json({ 
        message: `Shadow needs to be level ${item.requirements.level} to equip this item` 
      });
    }
    
    // Determine equipment slot based on item type
    let slot;
    if (item.type === 'weapon') {
      slot = 'weapon';
    } else if (item.type === 'armor') {
      slot = 'armor';
    } else if (item.equipSlot === 'accessory') {
      slot = 'accessory';
    } else {
      return res.status(400).json({ message: 'Invalid item type for shadow equipment' });
    }
    
    // Equip item to shadow
    shadow.equipment[slot] = item._id;
    await shadow.save();
    
    res.json({
      message: `${item.name} equipped to ${shadow.name}`,
      shadow
    });
  } catch (error) {
    console.error('Equip shadow item error:', error);
    res.status(500).json({ 
      message: 'Server error equipping item to shadow', 
      error: error.message 
    });
  }
});

// @route   POST /api/shadows/:id/unequip/:slot
// @desc    Unequip an item from a shadow
// @access  Private
router.post('/:id/unequip/:slot', auth, async (req, res) => {
  try {
    // Find shadow
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Check if slot is valid
    const validSlots = ['weapon', 'armor', 'accessory'];
    if (!validSlots.includes(req.params.slot)) {
      return res.status(400).json({ message: 'Invalid equipment slot' });
    }
    
    // Check if slot has an item
    if (!shadow.equipment[req.params.slot]) {
      return res.status(400).json({ message: 'No item equipped in this slot' });
    }
    
    // Unequip item
    shadow.equipment[req.params.slot] = null;
    await shadow.save();
    
    res.json({
      message: `Item unequipped from ${shadow.name}`,
      shadow
    });
  } catch (error) {
    console.error('Unequip shadow item error:', error);
    res.status(500).json({ 
      message: 'Server error unequipping item from shadow', 
      error: error.message 
    });
  }
});

// @route   POST /api/shadows/:id/deploy
// @desc    Deploy a shadow on a mission
// @access  Private
router.post('/:id/deploy', auth, async (req, res) => {
  try {
    const { duration } = req.body; // Duration in hours
    
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Invalid duration' });
    }
    
    // Find shadow
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Check if shadow is already deployed
    if (shadow.isDeployed) {
      return res.status(400).json({ message: 'Shadow is already deployed' });
    }
    
    // Deploy shadow
    shadow.isDeployed = true;
    
    // Calculate return time
    const returnTime = new Date();
    returnTime.setHours(returnTime.getHours() + duration);
    shadow.deployedUntil = returnTime;
    
    await shadow.save();
    
    // Schedule shadow return (this would be handled by a job scheduler in production)
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('shadow_deployed', {
      shadowId: shadow._id,
      name: shadow.name,
      returnTime
    });
    
    res.json({
      message: `${shadow.name} deployed successfully`,
      shadow,
      returnTime
    });
  } catch (error) {
    console.error('Deploy shadow error:', error);
    res.status(500).json({ 
      message: 'Server error deploying shadow', 
      error: error.message 
    });
  }
});

// @route   POST /api/shadows/:id/return
// @desc    Return a deployed shadow
// @access  Private
router.post('/:id/return', auth, async (req, res) => {
  try {
    // Find shadow
    const shadow = await Shadow.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!shadow) {
      return res.status(404).json({ message: 'Shadow not found' });
    }
    
    // Check if shadow is deployed
    if (!shadow.isDeployed) {
      return res.status(400).json({ message: 'Shadow is not deployed' });
    }
    
    // Check if shadow can return (time check)
    const now = new Date();
    if (shadow.deployedUntil && now < shadow.deployedUntil) {
      return res.status(400).json({ 
        message: 'Shadow has not completed their mission yet',
        returnTime: shadow.deployedUntil
      });
    }
    
    // Return shadow
    shadow.isDeployed = false;
    shadow.deployedUntil = null;
    
    // Add experience for completing mission
    const missionExp = Math.floor(50 * Math.pow(1.2, shadow.level - 1));
    const levelUpResult = shadow.addExperience(missionExp);
    
    await shadow.save();
    
    // Notify client about shadow return
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('shadow_returned', {
      shadowId: shadow._id,
      name: shadow.name,
      experienceGained: missionExp,
      levelUp: levelUpResult.leveledUp,
      newLevel: levelUpResult.newLevel,
      newRank: levelUpResult.newRank
    });
    
    res.json({
      message: `${shadow.name} returned from mission`,
      shadow,
      experienceGained: missionExp,
      levelUp: levelUpResult
    });
  } catch (error) {
    console.error('Return shadow error:', error);
    res.status(500).json({ 
      message: 'Server error returning shadow', 
      error: error.message 
    });
  }
});

module.exports = router;
