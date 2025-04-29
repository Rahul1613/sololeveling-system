const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Skill = sequelize.define('Skill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('active', 'passive'),
    allowNull: false
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rank_required: {
    type: DataTypes.ENUM('E', 'D', 'C', 'B', 'A', 'S'),
    defaultValue: 'E'
  },
  cooldown: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // in seconds, 0 means no cooldown
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: 'default-skill.png'
  },
  effects: {
    type: DataTypes.TEXT, // JSON string of effects
    get() {
      const value = this.getDataValue('effects');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('effects', JSON.stringify(value));
    }
  },
  max_level: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  level_scaling: {
    type: DataTypes.TEXT, // JSON string of level scaling stats
    get() {
      const value = this.getDataValue('level_scaling');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('level_scaling', JSON.stringify(value));
    }
  }
}, {
  tableName: 'skills'
});

module.exports = Skill;
