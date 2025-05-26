const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🗄️ Initializing database connection...');
console.log('🗄️ DATABASE_URL present:', !!process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log, // Enable logging to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

module.exports = sequelize; 