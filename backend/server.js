const express = require('express');const cors = require('cors');const helmet = require('helmet');const morgan = require('morgan');const dotenv = require('dotenv');const sequelize = require('./config/database');const { User, Profile, DailyGoal, FoodItem, ConsumptionLog } = require('./models/relations');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet()); 
app.use(morgan('dev'));

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Sync all models
    return sequelize.sync();
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NutriScan API' });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      models: ['User', 'Profile', 'DailyGoal', 'FoodItem', 'ConsumptionLog']
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 