const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Quest = require('../models/Quest');
const Item = require('../models/Item');
const Shadow = require('../models/Shadow');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solo-leveling-system')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create demo user
const createDemoUser = async () => {
  try {
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    
    if (existingUser) {
      console.log('Demo user already exists');
      return existingUser;
    }
    
    // Create new demo user
    const demoUser = new User({
      username: 'DemoHunter',
      email: 'demo@example.com',
      password: await bcrypt.hash('password123', 10),
      level: 15,
      experience: 250,
      experienceToNextLevel: 500,
      rank: 'D',
      stats: {
        strength: 25,
        agility: 20,
        intelligence: 30,
        vitality: 22,
        endurance: 18,
        luck: 15
      },
      hp: {
        current: 210,
        max: 210
      },
      mp: {
        current: 110,
        max: 110
      },
      currency: 1500,
      statPoints: 10,
      profilePicture: 'default-avatar.png'
    });
    
    await demoUser.save();
    console.log('Demo user created');
    
    // Create inventory for demo user
    const inventory = new Inventory({
      user: demoUser._id,
      capacity: 50
    });
    
    await inventory.save();
    console.log('Demo user inventory created');
    
    // Create some demo quests
    const quests = [
      {
        title: 'Morning Exercise',
        description: 'Complete a 30-minute workout session in the morning',
        type: 'daily',
        difficulty: 'easy',
        requirements: 'Record a 30-minute workout session',
        rewards: {
          experience: 50,
          currency: 20
        },
        timeLimit: 24,
        category: 'fitness'
      },
      {
        title: 'Study Session',
        description: 'Complete a 1-hour focused study session',
        type: 'daily',
        difficulty: 'medium',
        requirements: 'Record a 1-hour study session with no distractions',
        rewards: {
          experience: 100,
          currency: 30
        },
        timeLimit: 24,
        category: 'learning'
      },
      {
        title: 'Meditation Challenge',
        description: 'Complete a 15-minute meditation session',
        type: 'daily',
        difficulty: 'easy',
        requirements: 'Record a 15-minute meditation session',
        rewards: {
          experience: 40,
          currency: 15
        },
        timeLimit: 24,
        category: 'productivity'
      }
    ];
    
    // Save quests and assign to demo user
    for (const questData of quests) {
      const quest = new Quest(questData);
      await quest.save();
      
      // Add to user's active quests
      demoUser.activeQuests.push({
        quest: quest._id,
        progress: Math.floor(Math.random() * 100),
        startedAt: new Date(),
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
    
    await demoUser.save();
    console.log('Demo quests created and assigned');
    
    // Create a shadow for demo user
    const shadow = new Shadow({
      name: 'Igris',
      type: 'knight',  // lowercase to match enum values
      level: 10,
      rank: 'C',
      stats: {
        strength: 30,
        agility: 25,
        intelligence: 15,
        vitality: 28,
        endurance: 20
      },
      abilities: [
        {
          name: 'Sword Mastery',
          description: 'Increases damage with sword attacks',
          damage: 15,
          mpCost: 0,
          cooldown: 0,
          unlockLevel: 1
        },
        {
          name: 'Shield Defense',
          description: 'Reduces incoming damage',
          damage: 0,
          mpCost: 10,
          cooldown: 30,
          unlockLevel: 5
        }
      ],
      owner: demoUser._id,
      isDeployed: false,
      image: 'default-shadow.png'
    });
    
    await shadow.save();
    console.log('Demo shadow created');
    
    return demoUser;
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
};

// Run the seeding
createDemoUser()
  .then(() => {
    console.log('Demo user seeding completed');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error in demo user seeding:', err);
    mongoose.connection.close();
  });
