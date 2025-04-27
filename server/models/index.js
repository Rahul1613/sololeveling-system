// Import and register all models to ensure they're available throughout the application
const User = require('./User');
const Quest = require('./Quest');
const Shadow = require('./Shadow');
const Inventory = require('./Inventory');
const Item = require('./Item');
const Notification = require('./Notification');
const Achievement = require('./Achievement');
const Skill = require('./Skill');
const UserSkill = require('./UserSkill');
const Title = require('./Title');
const DungeonKey = require('./DungeonKey');
const Class = require('./Class');
const Guild = require('./Guild');
const Chat = require('./Chat');
const Admin = require('./Admin');
const Transaction = require('./Transaction');
const VerificationSubmission = require('./VerificationSubmission');

// Export all models
module.exports = {
  User,
  Quest,
  Shadow,
  Inventory,
  Item,
  Notification,
  Achievement,
  Skill,
  UserSkill,
  Title,
  DungeonKey,
  Class,
  Guild,
  Chat,
  Admin,
  Transaction,
  VerificationSubmission
};
