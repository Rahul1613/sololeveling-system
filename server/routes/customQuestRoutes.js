const express = require('express');
const router = express.Router();
const {
  createCustomQuest,
  getUserCustomQuests,
  getPublicCustomQuests,
  updateCustomQuest,
  deleteCustomQuest
} = require('../controllers/customQuestController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Create a custom quest
router.post('/', createCustomQuest);

// Get all custom quests created by the user
router.get('/my-quests', getUserCustomQuests);

// Get all public custom quests
router.get('/public', getPublicCustomQuests);

// Update a custom quest
router.put('/:questId', updateCustomQuest);

// Delete a custom quest
router.delete('/:questId', deleteCustomQuest);

// Add a health check route for custom quests
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Custom quests routes are working properly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
