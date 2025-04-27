const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dungeonKeysController = require('../controllers/dungeonKeysController');

// Get all dungeon keys
router.get('/all', auth, dungeonKeysController.getAllDungeonKeys);

// Get user's dungeon keys
router.get('/user', auth, dungeonKeysController.getUserDungeonKeys);

// Get a specific dungeon key by ID
router.get('/:id', auth, dungeonKeysController.getDungeonKeyById);

// Generate a random dungeon key for a user
router.post('/generate', auth, dungeonKeysController.generateRandomKey);

// Use a dungeon key
router.post('/use/:id', auth, dungeonKeysController.useDungeonKey);

// Complete a dungeon and get rewards
router.post('/complete/:id', auth, dungeonKeysController.completeDungeon);

// Admin routes for dungeon key management
router.post('/give', auth, dungeonKeysController.giveDungeonKey);
router.post('/', auth, dungeonKeysController.createDungeonKey);
router.put('/:id', auth, dungeonKeysController.updateDungeonKey);
router.delete('/:id', auth, dungeonKeysController.deleteDungeonKey);

module.exports = router;
