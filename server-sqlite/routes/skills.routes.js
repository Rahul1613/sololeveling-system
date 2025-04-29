const express = require('express');
const router = express.Router();
const Skill = require('../models/skill.model');
const UserSkill = require('../models/userSkill.model');
const User = require('../models/user.model');
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all skills available to the user based on rank
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get skills available for the user's rank
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const userRankIndex = rankOrder.indexOf(user.rank);
    
    const availableSkills = await Skill.findAll({
      where: sequelize.literal(`CASE 
        WHEN rank_required = 'E' THEN 1
        WHEN rank_required = 'D' THEN 2
        WHEN rank_required = 'C' THEN 3
        WHEN rank_required = 'B' THEN 4
        WHEN rank_required = 'A' THEN 5
        WHEN rank_required = 'S' THEN 6
      END <= ${userRankIndex + 1}`)
    });
    
    res.json(availableSkills);
  } catch (error) {
    console.error('Error fetching available skills:', error);
    res.status(500).json({ message: 'Failed to fetch available skills' });
  }
});

// Get user's skills
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userSkills = await UserSkill.findAll({
      where: { user_id: req.user.id },
      include: [Skill]
    });
    
    res.json(userSkills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Failed to fetch user skills' });
  }
});

// Get equipped skills
router.get('/equipped', authenticateToken, async (req, res) => {
  try {
    const equippedSkills = await UserSkill.findAll({
      where: { 
        user_id: req.user.id,
        is_equipped: true
      },
      include: [Skill],
      order: [['slot_index', 'ASC']]
    });
    
    res.json(equippedSkills);
  } catch (error) {
    console.error('Error fetching equipped skills:', error);
    res.status(500).json({ message: 'Failed to fetch equipped skills' });
  }
});

// Buy a skill
router.post('/buy', authenticateToken, async (req, res) => {
  const { skillId } = req.body;
  const userId = req.user.id;
  
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    // Find the skill
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has enough gold
    if (user.gold < skill.price) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Not enough gold' });
    }
    
    // Check if user meets rank requirement
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const userRankIndex = rankOrder.indexOf(user.rank);
    const requiredRankIndex = rankOrder.indexOf(skill.rank_required);
    
    if (userRankIndex < requiredRankIndex) {
      await transaction.rollback();
      return res.status(400).json({ message: `Rank ${skill.rank_required} required to learn this skill` });
    }
    
    // Check if user already has this skill
    const existingSkill = await UserSkill.findOne({
      where: {
        user_id: userId,
        skill_id: skillId
      }
    });
    
    if (existingSkill) {
      await transaction.rollback();
      return res.status(400).json({ message: 'You already know this skill' });
    }
    
    // Create user skill entry
    const userSkill = await UserSkill.create({
      user_id: userId,
      skill_id: skillId,
      level: 1,
      is_equipped: false,
      slot_index: -1,
      experience: 0
    }, { transaction });
    
    // Deduct gold from user
    user.gold -= skill.price;
    await user.save({ transaction });
    
    // Commit the transaction
    await transaction.commit();
    
    res.json({
      message: `Successfully learned ${skill.name}`,
      skill: userSkill,
      gold: user.gold
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error buying skill:', error);
    res.status(500).json({ message: 'Failed to buy skill' });
  }
});

// Equip a skill
router.post('/equip', authenticateToken, async (req, res) => {
  const { userSkillId, slotIndex } = req.body;
  const userId = req.user.id;
  
  try {
    // Find the user skill
    const userSkill = await UserSkill.findOne({
      where: {
        id: userSkillId,
        user_id: userId
      },
      include: [Skill]
    });
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found in your skills' });
    }
    
    // Check if slot is valid (0-4 for a total of 5 slots)
    if (slotIndex < 0 || slotIndex > 4) {
      return res.status(400).json({ message: 'Invalid slot index' });
    }
    
    // Unequip any skill in the same slot
    await UserSkill.update(
      { 
        is_equipped: false,
        slot_index: -1
      },
      {
        where: {
          user_id: userId,
          slot_index: slotIndex
        }
      }
    );
    
    // Equip the new skill
    userSkill.is_equipped = true;
    userSkill.slot_index = slotIndex;
    await userSkill.save();
    
    res.json({
      message: `Successfully equipped ${userSkill.Skill.name} in slot ${slotIndex + 1}`,
      skill: userSkill
    });
  } catch (error) {
    console.error('Error equipping skill:', error);
    res.status(500).json({ message: 'Failed to equip skill' });
  }
});

// Unequip a skill
router.post('/unequip', authenticateToken, async (req, res) => {
  const { userSkillId } = req.body;
  const userId = req.user.id;
  
  try {
    // Find the user skill
    const userSkill = await UserSkill.findOne({
      where: {
        id: userSkillId,
        user_id: userId,
        is_equipped: true
      },
      include: [Skill]
    });
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Equipped skill not found' });
    }
    
    // Unequip the skill
    userSkill.is_equipped = false;
    userSkill.slot_index = -1;
    await userSkill.save();
    
    res.json({
      message: `Successfully unequipped ${userSkill.Skill.name}`,
      skill: userSkill
    });
  } catch (error) {
    console.error('Error unequipping skill:', error);
    res.status(500).json({ message: 'Failed to unequip skill' });
  }
});

// Use a skill
router.post('/use', authenticateToken, async (req, res) => {
  const { userSkillId, targetId = null } = req.body;
  const userId = req.user.id;
  
  try {
    // Find the user skill
    const userSkill = await UserSkill.findOne({
      where: {
        id: userSkillId,
        user_id: userId,
        is_equipped: true
      },
      include: [Skill]
    });
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Equipped skill not found' });
    }
    
    // Check if skill is on cooldown
    if (userSkill.cooldown_ends && new Date() < new Date(userSkill.cooldown_ends)) {
      const remainingSeconds = Math.ceil((new Date(userSkill.cooldown_ends) - new Date()) / 1000);
      return res.status(400).json({ 
        message: `Skill is on cooldown for ${remainingSeconds} more seconds` 
      });
    }
    
    // Check if skill is active (passive skills cannot be used directly)
    if (userSkill.Skill.type !== 'active') {
      return res.status(400).json({ message: 'Passive skills cannot be used directly' });
    }
    
    // Find the user
    const user = await User.findByPk(userId);
    
    // Check if user has enough mana (assuming a base mana cost of 20)
    const manaCost = 20;
    if (user.mana < manaCost) {
      return res.status(400).json({ message: 'Not enough mana' });
    }
    
    // Apply skill effects (simplified for this example)
    // In a real application, this would be more complex and depend on the skill
    const effects = userSkill.Skill.effects;
    let effectsApplied = [];
    
    // Set cooldown
    const cooldownDuration = userSkill.Skill.cooldown * 1000; // Convert to milliseconds
    const cooldownEnds = new Date(Date.now() + cooldownDuration);
    userSkill.cooldown_ends = cooldownEnds;
    await userSkill.save();
    
    // Deduct mana
    user.mana -= manaCost;
    await user.save();
    
    // Gain skill experience
    userSkill.experience += 10;
    
    // Check if skill can level up
    if (userSkill.experience >= 100 * userSkill.level && userSkill.level < userSkill.Skill.max_level) {
      userSkill.level += 1;
      userSkill.experience = 0;
      effectsApplied.push(`${userSkill.Skill.name} leveled up to level ${userSkill.level}!`);
    }
    
    await userSkill.save();
    
    res.json({
      message: `Used ${userSkill.Skill.name}`,
      effects: effectsApplied,
      cooldownEnds: cooldownEnds,
      mana: user.mana,
      skillExperience: userSkill.experience,
      skillLevel: userSkill.level
    });
  } catch (error) {
    console.error('Error using skill:', error);
    res.status(500).json({ message: 'Failed to use skill' });
  }
});

// Level up a skill
router.post('/level-up', authenticateToken, async (req, res) => {
  const { userSkillId } = req.body;
  const userId = req.user.id;
  
  try {
    // Find the user skill
    const userSkill = await UserSkill.findOne({
      where: {
        id: userSkillId,
        user_id: userId
      },
      include: [Skill]
    });
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found in your skills' });
    }
    
    // Check if skill is at max level
    if (userSkill.level >= userSkill.Skill.max_level) {
      return res.status(400).json({ message: 'Skill is already at maximum level' });
    }
    
    // Find the user
    const user = await User.findByPk(userId);
    
    // Check if user has enough skill points
    if (user.skillPoints < userSkill.level) {
      return res.status(400).json({ message: 'Not enough skill points' });
    }
    
    // Deduct skill points
    user.skillPoints -= userSkill.level;
    await user.save();
    
    // Level up the skill
    userSkill.level += 1;
    userSkill.experience = 0;
    await userSkill.save();
    
    res.json({
      message: `Successfully leveled up ${userSkill.Skill.name} to level ${userSkill.level}`,
      skill: userSkill,
      skillPoints: user.skillPoints
    });
  } catch (error) {
    console.error('Error leveling up skill:', error);
    res.status(500).json({ message: 'Failed to level up skill' });
  }
});

module.exports = router;
