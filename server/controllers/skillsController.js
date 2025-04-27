const mongoose = require('mongoose');
const User = require('../models/User');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Get all skills the user has unlocked
exports.getUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'skills',
        model: 'UserSkill',
        populate: {
          path: 'skill',
          model: 'Skill'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format user skills with combined data
    const userSkills = user.skills.map(userSkill => {
      const skill = userSkill.skill;
      return {
        _id: userSkill._id,
        skillId: skill._id,
        name: skill.name,
        description: skill.description,
        type: skill.type,
        icon: skill.icon,
        level: userSkill.level,
        maxLevel: skill.maxLevel,
        experience: userSkill.experience,
        experienceToNextLevel: userSkill.experienceToNextLevel,
        isEquipped: user.equippedSkills.some(
          equippedSkill => equippedSkill.skillId.toString() === skill._id.toString()
        ),
        slotIndex: user.equippedSkills.find(
          equippedSkill => equippedSkill.skillId.toString() === skill._id.toString()
        )?.slotIndex ?? -1,
        cooldownEnds: userSkill.cooldownEnds,
        cooldown: skill.cooldown,
        mpCost: skill.mpCost,
        effects: skill.effects,
        requirements: skill.requirements,
        unlockCondition: skill.unlockCondition,
        isHidden: skill.isHidden
      };
    });
    
    // Format equipped skills
    const equippedSkills = Array.isArray(user.equippedSkills) ? user.equippedSkills.map(equipped => {
      const userSkill = user.skills.find(
        s => s._id.toString() === equipped.userSkillId.toString()
      );
      
      if (!userSkill) return null;
      
      const skill = userSkill.skill;
      
      return {
        _id: userSkill._id,
        skillId: skill._id,
        name: skill.name,
        description: skill.description,
        type: skill.type,
        icon: skill.icon,
        level: userSkill.level,
        maxLevel: skill.maxLevel,
        experience: userSkill.experience,
        experienceToNextLevel: userSkill.experienceToNextLevel,
        isEquipped: true,
        slotIndex: equipped.slotIndex,
        cooldownEnds: userSkill.cooldownEnds,
        cooldown: skill.cooldown,
        mpCost: skill.mpCost,
        effects: skill.effects
      };
    }).filter(Boolean) : [];
    
    return res.json({
      userSkills,
      equippedSkills,
      skillPoints: user.skillPoints,
      maxEquippedSkills: user.maxEquippedSkills
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all skills available for unlocking
exports.getAvailableSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'skills',
        model: 'UserSkill',
        select: 'skill level'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all skills
    const allSkills = await Skill.find({ isHidden: false });
    
    // Filter out skills the user already has
    const userSkillIds = user.skills.map(s => s.skill.toString());
    const availableSkills = allSkills
      .filter(skill => !userSkillIds.includes(skill._id.toString()))
      .map(skill => {
        // Check if user meets requirements
        const meetsRequirements = checkSkillRequirements(user, skill, userSkillIds);
        
        return {
          _id: skill._id,
          name: skill.name,
          description: skill.description,
          type: skill.type,
          icon: skill.icon,
          maxLevel: skill.maxLevel,
          cooldown: skill.cooldown,
          mpCost: skill.mpCost,
          effects: skill.effects,
          requirements: skill.requirements,
          unlockCondition: skill.unlockCondition,
          skillPointCost: skill.skillPointCost || 1,
          canUnlock: meetsRequirements.canUnlock,
          requirementDetails: meetsRequirements.details
        };
      });
    
    return res.json(availableSkills);
  } catch (error) {
    console.error('Error fetching available skills:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Unlock a new skill
exports.unlockSkill = async (req, res) => {
  try {
    const skillId = req.params.skillId;
    
    // Validate skill ID
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has this skill
    const userSkillIds = user.skills.map(s => s.skill.toString());
    if (userSkillIds.includes(skillId)) {
      return res.status(400).json({ message: 'You already have this skill' });
    }
    
    // Get the skill
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    // Check if skill is hidden
    if (skill.isHidden) {
      return res.status(403).json({ message: 'This skill is not available for unlocking yet' });
    }
    
    // Check if user meets requirements
    const meetsRequirements = checkSkillRequirements(user, skill, userSkillIds);
    if (!meetsRequirements.canUnlock) {
      return res.status(403).json({ 
        message: 'You do not meet the requirements to unlock this skill',
        details: meetsRequirements.details
      });
    }
    
    // Check if user has enough skill points
    const skillPointCost = skill.skillPointCost || 1;
    if (user.skillPoints < skillPointCost) {
      return res.status(403).json({ message: `Not enough skill points. Required: ${skillPointCost}, Available: ${user.skillPoints}` });
    }
    
    // Create user skill
    const userSkill = new UserSkill({
      user: user._id,
      skill: skill._id,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100
    });
    
    await userSkill.save();
    
    // Update user
    user.skills.push(userSkill._id);
    user.skillPoints -= skillPointCost;
    
    // Record transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'SKILL_UNLOCK',
      details: {
        skillId: skill._id,
        skillName: skill.name,
        skillPointCost
      },
      skillPointsChange: -skillPointCost
    });
    
    await transaction.save();
    
    // Create notification
    const notification = new Notification({
      user: user._id,
      title: 'New Skill Unlocked',
      message: `You have unlocked the ${skill.name} skill!`,
      type: 'SKILL_UNLOCK',
      data: {
        skillId: skill._id,
        skillName: skill.name,
        skillIcon: skill.icon
      }
    });
    
    await notification.save();
    await user.save();
    
    // Return the unlocked skill
    return res.json({
      _id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      icon: skill.icon,
      level: userSkill.level,
      maxLevel: skill.maxLevel,
      experience: userSkill.experience,
      experienceToNextLevel: userSkill.experienceToNextLevel,
      cooldown: skill.cooldown,
      mpCost: skill.mpCost,
      effects: skill.effects,
      skillPoints: user.skillPoints
    });
  } catch (error) {
    console.error('Error unlocking skill:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if a user meets skill requirements
function checkSkillRequirements(user, skill, userSkillIds) {
  const details = [];
  let canUnlock = true;
  
  // Check level requirement
  if (skill.requirements.level > user.level) {
    details.push({
      type: 'level',
      required: skill.requirements.level,
      current: user.level,
      met: false
    });
    canUnlock = false;
  } else {
    details.push({
      type: 'level',
      required: skill.requirements.level,
      current: user.level,
      met: true
    });
  }
  
  // Check stat requirements
  for (const [stat, value] of Object.entries(skill.requirements.stats)) {
    if (value > 0) {
      const userStat = user.stats[stat] || 0;
      const met = userStat >= value;
      details.push({
        type: 'stat',
        stat,
        required: value,
        current: userStat,
        met
      });
      
      if (!met) canUnlock = false;
    }
  }
  
  // Check quest requirements
  if (skill.requirements.quests && skill.requirements.quests.length > 0) {
    const completedQuests = user.completedQuests.map(q => q.toString());
    
    for (const questId of skill.requirements.quests) {
      const met = completedQuests.includes(questId.toString());
      details.push({
        type: 'quest',
        questId,
        met
      });
      
      if (!met) canUnlock = false;
    }
  }
  
  // Check achievement requirements
  if (skill.requirements.achievements && skill.requirements.achievements.length > 0) {
    const userAchievements = user.achievements.map(a => a.achievement.toString());
    
    for (const achievementId of skill.requirements.achievements) {
      const met = userAchievements.includes(achievementId.toString());
      details.push({
        type: 'achievement',
        achievementId,
        met
      });
      
      if (!met) canUnlock = false;
    }
  }
  
  return { canUnlock, details };
}

// Equip a skill
exports.equipSkill = async (req, res) => {
  try {
    const { slotIndex } = req.body;
    const userSkillId = req.params.skillId;
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userSkillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }
    
    if (slotIndex === undefined || slotIndex < 0) {
      return res.status(400).json({ message: 'Invalid slot index' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has this skill
    const userSkill = await UserSkill.findOne({
      _id: userSkillId,
      user: user._id
    }).populate('skill');
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found in your collection' });
    }
    
    // Check if slot is valid based on skill type
    const skill = userSkill.skill;
    let maxSlots;
    
    if (skill.type === 'active') {
      maxSlots = user.maxActiveSkillSlots || 4;
      if (slotIndex >= maxSlots) {
        return res.status(400).json({ message: `Invalid slot for active skill. Max slots: ${maxSlots}` });
      }
    } else if (skill.type === 'passive') {
      maxSlots = user.maxPassiveSkillSlots || 2;
      if (slotIndex >= maxSlots) {
        return res.status(400).json({ message: `Invalid slot for passive skill. Max slots: ${maxSlots}` });
      }
    } else if (skill.type === 'ultimate') {
      maxSlots = 1;
      if (slotIndex >= maxSlots) {
        return res.status(400).json({ message: 'Invalid slot for ultimate skill' });
      }
    }
    
    // Check if slot is already occupied
    const existingSkillInSlot = user.equippedSkills.find(
      s => s.slotIndex === slotIndex && s.type === skill.type
    );
    
    if (existingSkillInSlot) {
      // Remove the existing skill from the slot
      user.equippedSkills = user.equippedSkills.filter(
        s => !(s.slotIndex === slotIndex && s.type === skill.type)
      );
    }
    
    // Check if skill is already equipped in another slot
    const existingEquippedSkill = user.equippedSkills.find(
      s => s.userSkillId.toString() === userSkillId
    );
    
    if (existingEquippedSkill) {
      // Remove from current slot
      user.equippedSkills = user.equippedSkills.filter(
        s => s.userSkillId.toString() !== userSkillId
      );
    }
    
    // Add skill to slot
    user.equippedSkills.push({
      userSkillId,
      skillId: skill._id,
      slotIndex,
      type: skill.type
    });
    
    await user.save();
    
    return res.json({
      _id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      icon: skill.icon,
      level: userSkill.level,
      maxLevel: skill.maxLevel,
      experience: userSkill.experience,
      experienceToNextLevel: userSkill.experienceToNextLevel,
      isEquipped: true,
      slotIndex,
      cooldownEnds: userSkill.cooldownEnds,
      cooldown: skill.cooldown,
      mpCost: skill.mpCost,
      effects: skill.effects
    });
  } catch (error) {
    console.error('Error equipping skill:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Unequip a skill
exports.unequipSkill = async (req, res) => {
  try {
    const userSkillId = req.params.skillId;
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userSkillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has this skill
    const userSkill = await UserSkill.findOne({
      _id: userSkillId,
      user: user._id
    }).populate('skill');
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found in your collection' });
    }
    
    // Check if skill is equipped
    const equippedSkillIndex = user.equippedSkills.findIndex(
      s => s.userSkillId.toString() === userSkillId
    );
    
    if (equippedSkillIndex === -1) {
      return res.status(400).json({ message: 'Skill is not equipped' });
    }
    
    // Remove skill from equipped skills
    user.equippedSkills.splice(equippedSkillIndex, 1);
    await user.save();
    
    const skill = userSkill.skill;
    
    return res.json({
      _id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      icon: skill.icon,
      level: userSkill.level,
      maxLevel: skill.maxLevel,
      experience: userSkill.experience,
      experienceToNextLevel: userSkill.experienceToNextLevel,
      isEquipped: false,
      slotIndex: -1,
      cooldownEnds: userSkill.cooldownEnds,
      cooldown: skill.cooldown,
      mpCost: skill.mpCost,
      effects: skill.effects
    });
  } catch (error) {
    console.error('Error unequipping skill:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Use a skill
exports.useSkill = async (req, res) => {
  try {
    const userSkillId = req.params.skillId;
    const { targetId } = req.body;
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userSkillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has this skill
    const userSkill = await UserSkill.findOne({
      _id: userSkillId,
      user: user._id
    }).populate('skill');
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found in your collection' });
    }
    
    const skill = userSkill.skill;
    
    // Check if skill is equipped
    const isEquipped = user.equippedSkills.some(
      s => s.userSkillId.toString() === userSkillId
    );
    
    if (!isEquipped) {
      return res.status(400).json({ message: 'You must equip this skill before using it' });
    }
    
    // Check if skill is on cooldown
    if (userSkill.isOnCooldown()) {
      return res.status(400).json({ 
        message: `Skill is on cooldown for ${userSkill.cooldownRemaining()} seconds`,
        cooldownRemaining: userSkill.cooldownRemaining()
      });
    }
    
    // Check if user has enough MP
    if (user.stats.mp < skill.mpCost) {
      return res.status(400).json({ message: `Not enough MP. Required: ${skill.mpCost}, Available: ${user.stats.mp}` });
    }
    
    // Use the skill
    const useResult = await userSkill.useSkill(skill);
    
    if (!useResult.success) {
      return res.status(400).json({ message: useResult.message });
    }
    
    // Deduct MP
    user.stats.mp -= skill.mpCost;
    await user.save();
    
    // Add experience to the skill
    const expGain = Math.floor(10 + (skill.mpCost / 10));
    const levelUpResult = await userSkill.addExperience(expGain, skill);
    
    // Prepare response
    const response = {
      _id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      message: useResult.message,
      cooldownEnds: userSkill.cooldownEnds,
      cooldownRemaining: userSkill.cooldownRemaining(),
      mpCost: skill.mpCost,
      currentMp: user.stats.mp,
      experienceGained: expGain
    };
    
    // Add level up info if applicable
    if (levelUpResult.leveledUp) {
      response.levelUp = {
        oldLevel: levelUpResult.oldLevel,
        newLevel: levelUpResult.newLevel
      };
      
      // Create notification for level up
      const notification = new Notification({
        user: user._id,
        title: 'Skill Level Up',
        message: `Your ${skill.name} skill has reached level ${levelUpResult.newLevel}!`,
        type: 'SKILL_LEVEL_UP',
        data: {
          skillId: skill._id,
          skillName: skill.name,
          skillIcon: skill.icon,
          oldLevel: levelUpResult.oldLevel,
          newLevel: levelUpResult.newLevel
        }
      });
      
      await notification.save();
    }
    
    return res.json(response);
  } catch (error) {
    console.error('Error using skill:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Level up a skill manually (using skill points)
exports.levelUpSkill = async (req, res) => {
  try {
    const userSkillId = req.params.skillId;
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userSkillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has this skill
    const userSkill = await UserSkill.findOne({
      _id: userSkillId,
      user: user._id
    }).populate('skill');
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found in your collection' });
    }
    
    const skill = userSkill.skill;
    
    // Check if skill is at max level
    if (userSkill.level >= skill.maxLevel) {
      return res.status(400).json({ message: 'Skill is already at maximum level' });
    }
    
    // Calculate skill point cost (increases with level)
    const skillPointCost = Math.ceil(skill.skillPointCost * (1 + (userSkill.level * 0.5)));
    
    // Check if user has enough skill points
    if (user.skillPoints < skillPointCost) {
      return res.status(403).json({ 
        message: `Not enough skill points. Required: ${skillPointCost}, Available: ${user.skillPoints}` 
      });
    }
    
    // Level up the skill
    const oldLevel = userSkill.level;
    userSkill.level += 1;
    userSkill.experience = 0;
    userSkill.experienceToNextLevel = Math.floor(100 * Math.pow(1.5, userSkill.level - 1));
    
    // Deduct skill points
    user.skillPoints -= skillPointCost;
    
    // Record transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'SKILL_LEVEL_UP',
      details: {
        skillId: skill._id,
        skillName: skill.name,
        oldLevel,
        newLevel: userSkill.level,
        skillPointCost
      },
      skillPointsChange: -skillPointCost
    });
    
    await transaction.save();
    
    // Create notification
    const notification = new Notification({
      user: user._id,
      title: 'Skill Level Up',
      message: `Your ${skill.name} skill has reached level ${userSkill.level}!`,
      type: 'SKILL_LEVEL_UP',
      data: {
        skillId: skill._id,
        skillName: skill.name,
        skillIcon: skill.icon,
        oldLevel,
        newLevel: userSkill.level
      }
    });
    
    await notification.save();
    await userSkill.save();
    await user.save();
    
    return res.json({
      _id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      icon: skill.icon,
      level: userSkill.level,
      maxLevel: skill.maxLevel,
      experience: userSkill.experience,
      experienceToNextLevel: userSkill.experienceToNextLevel,
      isEquipped: user.equippedSkills.some(
        s => s.userSkillId.toString() === userSkillId
      ),
      slotIndex: user.equippedSkills.find(
        s => s.userSkillId.toString() === userSkillId
      )?.slotIndex ?? -1,
      cooldownEnds: userSkill.cooldownEnds,
      cooldown: skill.cooldown,
      mpCost: skill.mpCost,
      effects: skill.effects,
      skillPoints: user.skillPoints
    });
  } catch (error) {
    console.error('Error leveling up skill:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get skill details
exports.getSkillDetails = async (req, res) => {
  try {
    const skillId = req.params.skillId;
    
    // Validate skill ID
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }
    
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    // Check if user has this skill
    const userSkill = await UserSkill.findOne({
      skill: skillId,
      user: req.user.id
    });
    
    // Return skill details
    return res.json({
      _id: skill._id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      icon: skill.icon,
      maxLevel: skill.maxLevel,
      cooldown: skill.cooldown,
      mpCost: skill.mpCost,
      effects: skill.effects,
      requirements: skill.requirements,
      lore: skill.lore,
      unlockCondition: skill.unlockCondition,
      isUnlocked: !!userSkill,
      userSkill: userSkill ? {
        _id: userSkill._id,
        level: userSkill.level,
        experience: userSkill.experience,
        experienceToNextLevel: userSkill.experienceToNextLevel,
        isEquipped: false, // This will be updated in the frontend
        cooldownEnds: userSkill.cooldownEnds
      } : null
    });
  } catch (error) {
    console.error('Error fetching skill details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get skill tree
exports.getSkillTree = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'skills',
        model: 'UserSkill',
        select: 'skill level'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all skills
    const allSkills = await Skill.find();
    
    // Get user's unlocked skills
    const userSkillIds = user.skills.map(s => s.skill.toString());
    
    // Organize skills into categories and trees
    const skillTree = {
      active: [],
      passive: [],
      ultimate: []
    };
    
    // Helper function to check if a skill is unlockable
    const isSkillUnlockable = (skill) => {
      if (userSkillIds.includes(skill._id.toString())) {
        return true;
      }
      
      if (skill.isHidden) {
        return false;
      }
      
      const { canUnlock } = checkSkillRequirements(user, skill, userSkillIds);
      return canUnlock;
    };
    
    // Build skill tree
    allSkills.forEach(skill => {
      const category = skill.type;
      
      if (!skillTree[category]) {
        skillTree[category] = [];
      }
      
      const isUnlocked = userSkillIds.includes(skill._id.toString());
      const userSkill = isUnlocked ? 
        user.skills.find(s => s.skill.toString() === skill._id.toString()) : 
        null;
      
      skillTree[category].push({
        _id: skill._id,
        name: skill.name,
        description: skill.description,
        icon: skill.icon,
        type: skill.type,
        isUnlocked,
        isUnlockable: isSkillUnlockable(skill),
        isHidden: skill.isHidden && !isUnlocked,
        level: userSkill ? userSkill.level : 0,
        maxLevel: skill.maxLevel,
        requirements: skill.requirements,
        dependencies: skill.dependencies || [],
        skillPointCost: skill.skillPointCost || 1
      });
    });
    
    return res.json({
      skillTree,
      skillPoints: user.skillPoints
    });
  } catch (error) {
    console.error('Error fetching skill tree:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
