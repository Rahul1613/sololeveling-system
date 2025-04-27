const Class = require('../models/Class');
const User = require('../models/User');
const Skill = require('../models/Skill');
const mongoose = require('mongoose');

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isHidden: false });
    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get classes available for a specific user
exports.getAvailableClasses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate('completedQuests')
      .populate('achievements')
      .populate('titles.title');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get all classes
    const allClasses = await Class.find({ isHidden: false });
    
    // Check which classes the user meets requirements for
    const availableClasses = allClasses.map(classItem => {
      const requirements = classItem.checkRequirements(user);
      return {
        ...classItem.toObject(),
        meetsRequirements: requirements.meetsRequirements,
        requirementReason: requirements.meetsRequirements ? null : requirements.reason
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        currentClass: user.class,
        currentClassLevel: user.classLevel,
        availableClasses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get a single class by ID
exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: classItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get user's current class details
exports.getUserClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user has no class
    if (user.class === 'None') {
      return res.status(200).json({
        success: true,
        data: {
          class: 'None',
          classLevel: 0,
          skills: [],
          passives: [],
          specialAbilities: [],
          canAdvance: false
        }
      });
    }
    
    // Get user's class
    const classItem = await Class.findOne({ name: user.class });
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Get available skills, passives, and special abilities based on class level
    const availableSkills = classItem.getAvailableSkills(user.classLevel);
    const availablePassives = classItem.getAvailablePassives(user.classLevel);
    const availableSpecialAbilities = classItem.getAvailableSpecialAbilities(user.classLevel);
    
    // Check if user can advance to next class
    const advancementStatus = classItem.canAdvance(user.classLevel);
    
    res.status(200).json({
      success: true,
      data: {
        class: classItem,
        classLevel: user.classLevel,
        skills: availableSkills,
        passives: availablePassives,
        specialAbilities: availableSpecialAbilities,
        canAdvance: advancementStatus.canAdvance,
        advancementOptions: advancementStatus.canAdvance ? advancementStatus.availableAdvancements : [],
        advancementReason: advancementStatus.canAdvance ? null : advancementStatus.reason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Change/Select a class
exports.selectClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { classId } = req.body;
    
    // Validate input
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID is required'
      });
    }
    
    const user = await User.findById(userId)
      .populate('completedQuests')
      .populate('achievements')
      .populate('titles.title');
    
    const classItem = await Class.findById(classId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user meets requirements
    const requirements = classItem.checkRequirements(user);
    
    if (!requirements.meetsRequirements) {
      return res.status(400).json({
        success: false,
        message: `Cannot select this class: ${requirements.reason}`
      });
    }
    
    // Save user's previous class for history
    const previousClass = user.class;
    const previousClassLevel = user.classLevel;
    
    // Update user's class
    user.class = classItem.name;
    user.classLevel = 1; // Reset class level when changing classes
    
    // Apply base stats from the class
    for (const [stat, value] of Object.entries(classItem.baseStats)) {
      if (value > 0) {
        user.stats[stat] += value;
      }
    }
    
    // Add class-specific skills to user
    const startingSkills = classItem.getAvailableSkills(1);
    
    for (const skillInfo of startingSkills) {
      const skill = await Skill.findById(skillInfo.skill);
      
      if (skill) {
        // Check if user already has this skill
        const hasSkill = user.skills.some(s => s.toString() === skill._id.toString());
        
        if (!hasSkill) {
          user.skills.push(skill._id);
        }
      }
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully selected class: ${classItem.name}`,
      data: {
        previousClass,
        previousClassLevel,
        newClass: classItem.name,
        newClassLevel: 1,
        newSkills: startingSkills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Advance to next class tier
exports.advanceClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { classId } = req.body;
    
    // Validate input
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'Target class ID is required'
      });
    }
    
    const user = await User.findById(userId);
    const targetClass = await Class.findById(classId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!targetClass) {
      return res.status(404).json({
        success: false,
        message: 'Target class not found'
      });
    }
    
    // Get current class
    const currentClass = await Class.findOne({ name: user.class });
    
    if (!currentClass) {
      return res.status(400).json({
        success: false,
        message: 'You do not have a current class'
      });
    }
    
    // Check if advancement is available
    const advancementStatus = currentClass.canAdvance(user.classLevel);
    
    if (!advancementStatus.canAdvance) {
      return res.status(400).json({
        success: false,
        message: `Cannot advance: ${advancementStatus.reason}`
      });
    }
    
    // Check if target class is in advancement options
    const isValidAdvancement = advancementStatus.availableAdvancements.some(
      option => option.class.toString() === classId
    );
    
    if (!isValidAdvancement) {
      return res.status(400).json({
        success: false,
        message: 'Target class is not a valid advancement option'
      });
    }
    
    // Check if user meets requirements for target class
    const requirements = targetClass.checkRequirements(user);
    
    if (!requirements.meetsRequirements) {
      return res.status(400).json({
        success: false,
        message: `Cannot advance to this class: ${requirements.reason}`
      });
    }
    
    // Save user's previous class for history
    const previousClass = user.class;
    const previousClassLevel = user.classLevel;
    
    // Update user's class
    user.class = targetClass.name;
    user.classLevel = 1; // Reset class level when advancing
    
    // Apply base stats from the new class
    for (const [stat, value] of Object.entries(targetClass.baseStats)) {
      if (value > 0) {
        user.stats[stat] += value;
      }
    }
    
    // Add class-specific skills to user
    const startingSkills = targetClass.getAvailableSkills(1);
    
    for (const skillInfo of startingSkills) {
      const skill = await Skill.findById(skillInfo.skill);
      
      if (skill) {
        // Check if user already has this skill
        const hasSkill = user.skills.some(s => s.toString() === skill._id.toString());
        
        if (!hasSkill) {
          user.skills.push(skill._id);
        }
      }
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully advanced to ${targetClass.name}`,
      data: {
        previousClass,
        previousClassLevel,
        newClass: targetClass.name,
        newClassLevel: 1,
        newSkills: startingSkills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Gain class experience and level up
exports.gainClassExperience = async (req, res) => {
  try {
    const userId = req.user.id;
    const { experience } = req.body;
    
    // Validate input
    if (!experience || isNaN(experience) || experience <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid experience amount is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has a class
    if (user.class === 'None') {
      return res.status(400).json({
        success: false,
        message: 'You do not have a class'
      });
    }
    
    // Get user's class
    const classItem = await Class.findOne({ name: user.class });
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user is at max class level
    if (user.classLevel >= classItem.maxLevel) {
      return res.status(400).json({
        success: false,
        message: 'You are already at the maximum class level'
      });
    }
    
    // Calculate experience needed for next level (simple formula, can be adjusted)
    const expNeeded = 100 * Math.pow(1.2, user.classLevel - 1);
    
    // Add experience
    user.classExperience = (user.classExperience || 0) + experience;
    
    // Check for level up
    let leveledUp = false;
    let newSkills = [];
    let newPassives = [];
    let newSpecialAbilities = [];
    
    while (user.classExperience >= expNeeded && user.classLevel < classItem.maxLevel) {
      user.classExperience -= expNeeded;
      user.classLevel += 1;
      leveledUp = true;
      
      // Apply stat growth
      for (const [stat, growth] of Object.entries(classItem.statGrowth)) {
        if (growth > 0) {
          user.stats[stat] += growth;
        }
      }
      
      // Check for new skills at this level
      const skillsAtThisLevel = classItem.skills.filter(
        skill => skill.levelRequirement === user.classLevel
      );
      
      for (const skillInfo of skillsAtThisLevel) {
        const skill = await Skill.findById(skillInfo.skill);
        
        if (skill) {
          // Check if user already has this skill
          const hasSkill = user.skills.some(s => s.toString() === skill._id.toString());
          
          if (!hasSkill) {
            user.skills.push(skill._id);
            newSkills.push(skill);
          }
        }
      }
      
      // Check for new passives at this level
      const passivesAtThisLevel = classItem.passives.filter(
        passive => passive.effect.levelRequirement === user.classLevel
      );
      
      if (passivesAtThisLevel.length > 0) {
        newPassives = [...newPassives, ...passivesAtThisLevel];
      }
      
      // Check for new special abilities at this level
      const abilitiesAtThisLevel = classItem.specialAbilities.filter(
        ability => ability.levelRequirement === user.classLevel
      );
      
      if (abilitiesAtThisLevel.length > 0) {
        newSpecialAbilities = [...newSpecialAbilities, ...abilitiesAtThisLevel];
      }
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: leveledUp ? `Class level increased to ${user.classLevel}` : 'Experience gained',
      data: {
        classExperience: user.classExperience,
        classLevel: user.classLevel,
        leveledUp,
        newSkills,
        newPassives,
        newSpecialAbilities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create a new class (admin only)
exports.createClass = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const classItem = await Class.create(req.body);
    
    res.status(201).json({
      success: true,
      data: classItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update a class (admin only)
exports.updateClass = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const classItem = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: classItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete a class (admin only)
exports.deleteClass = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const classItem = await Class.findByIdAndDelete(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Reset class for users who had this class
    await User.updateMany(
      { class: classItem.name },
      { $set: { class: 'None', classLevel: 0, classExperience: 0 } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
