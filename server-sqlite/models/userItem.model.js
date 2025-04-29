const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');
const Item = require('./item.model');

const UserItem = sequelize.define('UserItem', {
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
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Item,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  is_equipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  slot: {
    type: DataTypes.STRING,
    allowNull: true
  },
  durability: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  purchase_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_items'
});

// Set up associations
User.belongsToMany(Item, { through: UserItem, foreignKey: 'user_id', otherKey: 'item_id' });
Item.belongsToMany(User, { through: UserItem, foreignKey: 'item_id', otherKey: 'user_id' });

module.exports = UserItem;
