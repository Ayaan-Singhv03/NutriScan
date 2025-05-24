const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const { User, Profile, DailyGoal, FoodItem, ConsumptionLog } = require('./models/relations');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dailyGoalRoutes = require('./routes/dailyGoalRoutes');
const foodItemRoutes = require('./routes/foodItemRoutes');
const consumptionLogRoutes = require('./routes/consumptionLogRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet()); 
app.use(morgan('dev'));

// Test database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    console.log('🏗️ Syncing database models...');
    
    // Explicitly sync each model to ensure they're all created
    console.log('Creating User table...');
    return User.sync({ force: true });
  })
  .then(() => {
    console.log('✅ User table created');
    console.log('Creating Profile table...');
    return Profile.sync({ force: true });
  })
  .then(() => {
    console.log('✅ Profile table created');
    console.log('Creating DailyGoal table...');
    return DailyGoal.sync({ force: true });
  })
  .then(() => {
    console.log('✅ DailyGoal table created');
    console.log('Creating FoodItem table...');
    return FoodItem.sync({ force: true });
  })
  .then(() => {
    console.log('✅ FoodItem table created');
    console.log('Creating ConsumptionLog table...');
    return ConsumptionLog.sync({ force: true });
  })
  .then(() => {
    console.log('✅ All models synchronized successfully!');
    console.log('🎉 Database ready! Users will be created via authentication.');
  })
  .catch(err => {
    console.error('❌ Database sync error:', err);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to NutriScan API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      goals: '/api/goals',
      food: '/api/food',
      logs: '/api/logs'
    }
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    // Count records in each table
    const counts = {
      users: await User.count(),
      profiles: await Profile.count(),
      dailyGoals: await DailyGoal.count(),
      foodItems: await FoodItem.count(),
      consumptionLogs: await ConsumptionLog.count()
    };
    
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      models: ['User', 'Profile', 'DailyGoal', 'FoodItem', 'ConsumptionLog'],
      recordCounts: counts
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', dailyGoalRoutes);
app.use('/api/food', foodItemRoutes);
app.use('/api/logs', consumptionLogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 