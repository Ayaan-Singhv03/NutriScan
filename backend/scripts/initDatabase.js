const { initializeDatabase } = require('../models');

const init = async () => {
  try {
    console.log('🚀 Starting database initialization...');
    
    await initializeDatabase();
    
    console.log('✅ Database initialization completed successfully!');
    console.log('📋 Tables created:');
    console.log('   - users (Google Auth users)');
    console.log('   - profiles (User body information)');
    console.log('   - daily_goals (Nutritional targets)');
    console.log('   - food_items (Barcode food database)');
    console.log('   - consumption_logs (Daily food tracking)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

init(); 