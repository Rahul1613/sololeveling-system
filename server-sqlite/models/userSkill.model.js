const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');
const Skill = require('./skill.model');

const UserSkill = sequelize.define('UserSkill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  skill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Skill,
      key: 'id'
    }
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  is_equipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  slot_index: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: -1 // -1 means not equipped in any slot
  },
  cooldown_ends: {
    type: DataTypes.DATE,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unlock_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_skills'
});

// Set up associations
User.belongsToMany(Skill, { through: UserSkill, foreignKey: 'user_id', otherKey: 'skill_id' });
Skill.belongsToMany(User, { through: UserSkill, foreignKey: 'skill_id', otherKey: 'user_id' });

module.exports = UserSkill;
