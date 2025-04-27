const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const classController = require('../controllers/classController');

// Get all classes
router.get('/all', auth, classController.getAllClasses);

// Get classes available for a specific user
router.get('/available', auth, classController.getAvailableClasses);

// Get user's current class details
router.get('/user', auth, classController.getUserClass);

// Get a specific class by ID
router.get('/:id', auth, classController.getClassById);

// Select/Change a class
router.post('/select', auth, classController.selectClass);

// Advance to next class tier
router.post('/advance', auth, classController.advanceClass);

// Gain class experience
router.post('/experience', auth, classController.gainClassExperience);

// Admin routes for class management
router.post('/', auth, classController.createClass);
router.put('/:id', auth, classController.updateClass);
router.delete('/:id', auth, classController.deleteClass);

module.exports = router;
