const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');
const Title = require('./title.model');

const UserTitle = sequelize.define('UserTitle', {
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
  title_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Title,
      key: 'id'
    }
  },
  is_equipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  unlock_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_titles'
});

// Set up associations
User.belongsToMany(Title, { through: UserTitle, foreignKey: 'user_id', otherKey: 'title_id' });
Title.belongsToMany(User, { through: UserTitle, foreignKey: 'title_id', otherKey: 'user_id' });

module.exports = UserTitle;
