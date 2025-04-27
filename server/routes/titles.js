const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const titlesController = require('../controllers/titlesController');

// Get all titles
router.get('/all', auth, titlesController.getAllTitles);

// Get all titles for a specific user (owned and available)
router.get('/user', auth, titlesController.getUserTitles);

// Get a specific title by ID
router.get('/:id', auth, titlesController.getTitleById);

// Get all titles available for unlocking
router.get('/available', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('titles');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all titles
    const allTitles = await Title.find();
    
    // Filter out titles the user already has
    const userTitleIds = user.titles.map(title => title._id.toString());
    const availableTitles = allTitles
      .filter(title => !userTitleIds.includes(title._id.toString()))
      .map(title => {
        // Check if user meets requirements
        const requirementsMet = title.checkRequirements(user);
        
        // Format requirements with met status
        const formattedRequirements = title.requirements.map(req => {
          let met = false;
          let additionalInfo = {};
          
          switch (req.type) {
            case 'level':
              met = user.level >= req.value;
              break;
            case 'stat':
              met = user[req.stat] >= req.value;
              break;
            case 'quest':
              met = user.completedQuests.some(q => q.toString() === req.questId.toString());
              // Add quest name for display
              additionalInfo.questName = req.questName || 'Unknown Quest';
              break;
            case 'achievement':
              met = user.achievements.some(a => a.toString() === req.achievementId.toString());
              // Add achievement name for display
              additionalInfo.achievementName = req.achievementName || 'Unknown Achievement';
              break;
            case 'item':
              // Check if user has the item in inventory
              met = user.inventory && user.inventory.items.some(
                i => i.itemId.toString() === req.itemId.toString()
              );
              // Add item name for display
              additionalInfo.itemName = req.itemName || 'Unknown Item';
              break;
            case 'skill':
              // Check if user has the skill at required level
              const userSkill = user.skills.find(
                s => s.skillId && s.skillId.toString() === req.skillId.toString()
              );
              met = userSkill && userSkill.level >= req.level;
              // Add skill name for display
              additionalInfo.skillName = req.skillName || 'Unknown Skill';
              break;
            case 'shadow':
              // Check if user has the shadow
              met = user.shadows && user.shadows.some(
                s => s.toString() === req.shadowId.toString()
              );
              // Add shadow name for display
              additionalInfo.shadowName = req.shadowName || 'Unknown Shadow';
              break;
            case 'guild':
              // Check if user is in a guild with required rank
              met = user.guild && user.guildRole >= req.guildRank;
              break;
            default:
              met = false;
          }
          
          return {
            ...req,
            ...additionalInfo,
            met
          };
        });
        
        return {
          _id: title._id,
          name: title.name,
          description: title.description,
          rarity: title.rarity,
          effects: title.effects,
          requirements: formattedRequirements,
          specialEffect: title.specialEffect,
          lore: title.lore,
          allRequirementsMet: requirementsMet.success
        };
      });
    
    return res.json(availableTitles);
  } catch (error) {
    console.error('Error fetching available titles:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Equip a title
router.post('/equip/:id', auth, titlesController.equipTitle);

// Check if user meets requirements for a title
router.get('/check-requirements/:id', auth, titlesController.checkTitleRequirements);

// Unlock a title (admin only or system)
router.post('/unlock', auth, titlesController.unlockTitle);

// Admin routes for title management
router.post('/', auth, titlesController.createTitle);
router.put('/:id', auth, titlesController.updateTitle);
router.delete('/:id', auth, titlesController.deleteTitle);

module.exports = router;
