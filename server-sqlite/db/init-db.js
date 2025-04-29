const { sequelize } = require('../config/database');
const User = require('../models/user.model');
const Item = require('../models/item.model');
const Skill = require('../models/skill.model');
const Title = require('../models/title.model');
const UserSkill = require('../models/userSkill.model');
const UserTitle = require('../models/userTitle.model');
const UserItem = require('../models/userItem.model');

// Sample data for initial database population
const sampleUsers = require('./sample-data/users');
const sampleItems = require('./sample-data/items');
const sampleSkills = require('./sample-data/skills');
const sampleTitles = require('./sample-data/titles');

async function initializeDatabase() {
  try {
    // Sync all models with the database
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully');

    // Insert sample data
    await User.bulkCreate(sampleUsers);
    await Item.bulkCreate(sampleItems);
    await Skill.bulkCreate(sampleSkills);
    await Title.bulkCreate(sampleTitles);

    console.log('Sample data inserted successfully');
    
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
