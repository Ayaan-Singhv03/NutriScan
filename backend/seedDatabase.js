const { User, Profile, DailyGoal, FoodItem, ConsumptionLog } = require('./models/relations');
const sequelize = require('./config/database');

// Dummy data arrays
const dummyUsers = [
  {
    firebase_uid: 'test-user-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    pictureUrl: 'https://example.com/avatar.jpg'
  },
  {
    firebase_uid: 'john-doe-uid-456',
    email: 'john.doe@email.com',
    name: 'John Doe',
    pictureUrl: 'https://example.com/john.jpg'
  },
  {
    firebase_uid: 'jane-smith-uid-789',
    email: 'jane.smith@email.com',
    name: 'Jane Smith',
    pictureUrl: 'https://example.com/jane.jpg'
  },
  {
    firebase_uid: 'mike-wilson-uid-101',
    email: 'mike.wilson@email.com',
    name: 'Mike Wilson',
    pictureUrl: 'https://example.com/mike.jpg'
  },
  {
    firebase_uid: 'sarah-jones-uid-112',
    email: 'sarah.jones@email.com',
    name: 'Sarah Jones',
    pictureUrl: 'https://example.com/sarah.jpg'
  }
];

const dummyProfiles = [
  {
    age: 28,
    gender: 'male',
    height: 175, // cm
    weight: 70, // kg
    activityLevel: 'moderately_active'
  },
  {
    age: 32,
    gender: 'male',
    height: 180,
    weight: 85,
    activityLevel: 'very_active'
  },
  {
    age: 26,
    gender: 'female',
    height: 165,
    weight: 60,
    activityLevel: 'lightly_active'
  },
  {
    age: 35,
    gender: 'male',
    height: 178,
    weight: 90,
    activityLevel: 'extra_active'
  },
  {
    age: 29,
    gender: 'female',
    height: 162,
    weight: 55,
    activityLevel: 'moderately_active'
  }
];

const dummyDailyGoals = [
  {
    goalType: 'maintain',
    targetCalories: 2200,
    targetProtein: 110,
    targetCarbs: 275,
    targetFat: 73,
    isAutoCalculated: true
  },
  {
    goalType: 'lose_weight',
    targetCalories: 2000,
    targetProtein: 120,
    targetCarbs: 200,
    targetFat: 67,
    isAutoCalculated: true
  },
  {
    goalType: 'gain_weight',
    targetCalories: 2500,
    targetProtein: 125,
    targetCarbs: 313,
    targetFat: 83,
    isAutoCalculated: true
  },
  {
    goalType: 'lose_weight',
    targetCalories: 1800,
    targetProtein: 108,
    targetCarbs: 180,
    targetFat: 60,
    isAutoCalculated: false
  },
  {
    goalType: 'maintain',
    targetCalories: 1900,
    targetProtein: 95,
    targetCarbs: 238,
    targetFat: 63,
    isAutoCalculated: true
  }
];

const dummyFoodItems = [
  {
    barcode: '7622210951205',
    name: 'Oreo Original Cookies',
    brand: 'Oreo',
    category: 'Snacks',
    caloriesPer100g: 480,
    proteinPer100g: 4.7,
    carbsPer100g: 71.3,
    fatPer100g: 20.0,
    fiberPer100g: 4.1,
    sugarPer100g: 36.0,
    sodiumPer100g: 0.5,
    servingSize: 3,
    servingUnit: 'cookies',
    servingSizeGrams: 34,
    imageUrl: 'https://example.com/oreo.jpg',
    source: 'openfoodfacts',
    lastUpdated: new Date()
  },
  {
    barcode: '3017620422003',
    name: 'Nutella Hazelnut Spread',
    brand: 'Nutella',
    category: 'Spreads',
    caloriesPer100g: 539,
    proteinPer100g: 6.3,
    carbsPer100g: 57.5,
    fatPer100g: 30.9,
    fiberPer100g: 0.0,
    sugarPer100g: 56.3,
    sodiumPer100g: 0.107,
    servingSize: 1,
    servingUnit: 'tablespoon',
    servingSizeGrams: 15,
    imageUrl: 'https://example.com/nutella.jpg',
    source: 'openfoodfacts',
    lastUpdated: new Date()
  },
  {
    barcode: '4902102072427',
    name: 'Instant Ramen Noodles',
    brand: 'Nissin',
    category: 'Instant Foods',
    caloriesPer100g: 458,
    proteinPer100g: 9.2,
    carbsPer100g: 58.6,
    fatPer100g: 21.1,
    fiberPer100g: 3.2,
    sugarPer100g: 2.8,
    sodiumPer100g: 2.1,
    servingSize: 1,
    servingUnit: 'package',
    servingSizeGrams: 85,
    imageUrl: 'https://example.com/ramen.jpg',
    source: 'manual',
    lastUpdated: new Date()
  },
  {
    barcode: '8901030895059',
    name: 'Basmati Rice',
    brand: 'India Gate',
    category: 'Grains',
    caloriesPer100g: 349,
    proteinPer100g: 8.9,
    carbsPer100g: 77.0,
    fatPer100g: 0.6,
    fiberPer100g: 1.4,
    sugarPer100g: 0.3,
    sodiumPer100g: 0.004,
    servingSize: 0.25,
    servingUnit: 'cup',
    servingSizeGrams: 50,
    imageUrl: 'https://example.com/rice.jpg',
    source: 'manual',
    lastUpdated: new Date()
  },
  {
    barcode: '0123456789012',
    name: 'Greek Yogurt Plain',
    brand: 'Chobani',
    category: 'Dairy',
    caloriesPer100g: 59,
    proteinPer100g: 10.0,
    carbsPer100g: 4.0,
    fatPer100g: 0.4,
    fiberPer100g: 0.0,
    sugarPer100g: 4.0,
    sodiumPer100g: 0.036,
    servingSize: 1,
    servingUnit: 'container',
    servingSizeGrams: 170,
    imageUrl: 'https://example.com/yogurt.jpg',
    source: 'manual',
    lastUpdated: new Date()
  },
  {
    barcode: '0987654321098',
    name: 'Chicken Breast',
    brand: 'Fresh',
    category: 'Meat',
    caloriesPer100g: 165,
    proteinPer100g: 31.0,
    carbsPer100g: 0.0,
    fatPer100g: 3.6,
    fiberPer100g: 0.0,
    sugarPer100g: 0.0,
    sodiumPer100g: 0.074,
    servingSize: 1,
    servingUnit: 'piece',
    servingSizeGrams: 120,
    imageUrl: 'https://example.com/chicken.jpg',
    source: 'manual',
    lastUpdated: new Date()
  },
  {
    barcode: '1234567890123',
    name: 'Whole Wheat Bread',
    brand: 'Wonder',
    category: 'Bakery',
    caloriesPer100g: 247,
    proteinPer100g: 13.0,
    carbsPer100g: 41.0,
    fatPer100g: 4.2,
    fiberPer100g: 7.0,
    sugarPer100g: 6.0,
    sodiumPer100g: 0.4,
    servingSize: 1,
    servingUnit: 'slice',
    servingSizeGrams: 28,
    imageUrl: 'https://example.com/bread.jpg',
    source: 'manual',
    lastUpdated: new Date()
  },
  {
    barcode: '2345678901234',
    name: 'Banana',
    brand: 'Fresh',
    category: 'Fruits',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23.0,
    fatPer100g: 0.3,
    fiberPer100g: 2.6,
    sugarPer100g: 12.0,
    sodiumPer100g: 0.001,
    servingSize: 1,
    servingUnit: 'medium',
    servingSizeGrams: 118,
    imageUrl: 'https://example.com/banana.jpg',
    source: 'manual',
    lastUpdated: new Date()
  }
];

// Function to generate random consumption logs
function generateConsumptionLogs(userIds, foodBarcodes) {
  const logs = [];
  const today = new Date();
  
  userIds.forEach(userId => {
    // Generate 3-7 consumption logs per user for the last 3 days
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() - dayOffset);
      
      const logsPerDay = Math.floor(Math.random() * 5) + 3; // 3-7 logs per day
      
      for (let i = 0; i < logsPerDay; i++) {
        const randomBarcode = foodBarcodes[Math.floor(Math.random() * foodBarcodes.length)];
        const randomAmount = Math.floor(Math.random() * 200) + 50; // 50-250g
        
        // Set random time during the day
        const logTime = new Date(logDate);
        logTime.setHours(Math.floor(Math.random() * 24));
        logTime.setMinutes(Math.floor(Math.random() * 60));
        
        logs.push({
          userId: userId,
          barcode: randomBarcode,
          amountConsumed: randomAmount,
          consumedAt: logTime,
          isManualEntry: Math.random() > 0.7 // 30% manual entries
        });
      }
    }
  });
  
  return logs;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (optional - uncomment if you want to start fresh)
    // await ConsumptionLog.destroy({ where: {} });
    // await DailyGoal.destroy({ where: {} });
    // await Profile.destroy({ where: {} });
    // await FoodItem.destroy({ where: {} });
    // await User.destroy({ where: {} });
    
    console.log('📝 Creating users...');
    const users = await User.bulkCreate(dummyUsers, { 
      ignoreDuplicates: true,
      returning: true 
    });
    console.log(`✅ Created ${users.length} users`);
    
    console.log('👤 Creating profiles...');
    const profiles = [];
    for (let i = 0; i < users.length && i < dummyProfiles.length; i++) {
      profiles.push({
        ...dummyProfiles[i],
        userId: users[i].id
      });
    }
    await Profile.bulkCreate(profiles, { ignoreDuplicates: true });
    console.log(`✅ Created ${profiles.length} profiles`);
    
    console.log('🎯 Creating daily goals...');
    const dailyGoals = [];
    for (let i = 0; i < users.length && i < dummyDailyGoals.length; i++) {
      dailyGoals.push({
        ...dummyDailyGoals[i],
        userId: users[i].id
      });
    }
    await DailyGoal.bulkCreate(dailyGoals, { ignoreDuplicates: true });
    console.log(`✅ Created ${dailyGoals.length} daily goals`);
    
    console.log('🍎 Creating food items...');
    const foodItems = await FoodItem.bulkCreate(dummyFoodItems, { 
      ignoreDuplicates: true,
      returning: true 
    });
    console.log(`✅ Created ${foodItems.length} food items`);
    
    console.log('📊 Creating consumption logs...');
    const userIds = users.map(u => u.id);
    const foodBarcodes = foodItems.map(f => f.barcode);
    const consumptionLogs = generateConsumptionLogs(userIds, foodBarcodes);
    
    await ConsumptionLog.bulkCreate(consumptionLogs, { ignoreDuplicates: true });
    console.log(`✅ Created ${consumptionLogs.length} consumption logs`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   👤 Profiles: ${profiles.length}`);
    console.log(`   🎯 Daily Goals: ${dailyGoals.length}`);
    console.log(`   🍎 Food Items: ${foodItems.length}`);
    console.log(`   📊 Consumption Logs: ${consumptionLogs.length}`);
    
    console.log('\n🧪 Test User Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Token: test-token-123');
    console.log('   UID: test-user-uid-123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase }; 