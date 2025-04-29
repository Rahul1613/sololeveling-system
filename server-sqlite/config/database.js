const { Sequelize } = require('sequelize');
const path = require('path');

// Create a new Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../db/solo_leveling.sqlite'),
  logging: false, // Set to console.log to see SQL queries
  define: {
    timestamps: true, // Adds createdAt and updatedAt timestamps to every model
    underscored: true, // Use snake_case for fields in the database
  }
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Export the sequelize instance and connection test
module.exports = {
  sequelize,
  testConnection
};
