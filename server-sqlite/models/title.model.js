const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Title = sequelize.define('Title', {
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
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: 'default-title.png'
  },
  requirements: {
    type: DataTypes.TEXT, // JSON string of requirements
    get() {
      const value = this.getDataValue('requirements');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('requirements', JSON.stringify(value));
    }
  },
  bonuses: {
    type: DataTypes.TEXT, // JSON string of bonuses
    get() {
      const value = this.getDataValue('bonuses');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('bonuses', JSON.stringify(value));
    }
  }
}, {
  tableName: 'titles'
});

module.exports = Title;
