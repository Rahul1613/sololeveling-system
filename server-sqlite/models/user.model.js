const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rank: {
    type: DataTypes.ENUM('E', 'D', 'C', 'B', 'A', 'S'),
    defaultValue: 'E'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gold: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  health: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  mana: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  strength: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  intelligence: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  agility: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  hunts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  kills: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dungeons: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bossKills: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  soloHunts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  skillPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.png'
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  tableName: 'users'
});

// Instance method to check password
User.prototype.isPasswordValid = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
