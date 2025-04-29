const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Item = sequelize.define('Item', {
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
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  },
  category: {
    type: DataTypes.ENUM('weapon', 'armor', 'accessory', 'consumable', 'material', 'quest'),
    defaultValue: 'consumable'
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: 'default-item.png'
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
  level_required: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  rank_required: {
    type: DataTypes.ENUM('E', 'D', 'C', 'B', 'A', 'S'),
    defaultValue: 'E'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_recommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  quantity_available: {
    type: DataTypes.INTEGER,
    defaultValue: -1 // -1 means unlimited
  }
}, {
  tableName: 'items'
});

module.exports = Item;
