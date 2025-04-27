const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const skillsController = require('../controllers/skillsController');

// Get all skills the user has unlocked
router.get('/user', auth, skillsController.getUserSkills);

// Get all skills available for unlocking
router.get('/available', auth, skillsController.getAvailableSkills);

// Get skill tree
router.get('/tree', auth, skillsController.getSkillTree);

// Get skill details
router.get('/:skillId', auth, skillsController.getSkillDetails);

// Unlock a new skill
router.post('/unlock/:skillId', auth, skillsController.unlockSkill);

// Equip a skill
router.post('/equip/:skillId', auth, skillsController.equipSkill);

// Unequip a skill
router.post('/unequip/:skillId', auth, skillsController.unequipSkill);

// Use a skill
router.post('/use/:skillId', auth, skillsController.useSkill);

// Level up a skill
router.post('/levelup/:skillId', auth, skillsController.levelUpSkill);

module.exports = router;
