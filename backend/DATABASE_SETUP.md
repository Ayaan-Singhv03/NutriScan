# NutriScan Database Schema

This document describes the complete MySQL/PostgreSQL database schema for the NutriScan nutrition tracking application using Sequelize ORM.

## Database Overview

The database consists of 5 main tables designed to support:
- Google OAuth user authentication
- User profile and body information
- Daily nutritional goals calculation
- Food item database (from barcode scanning)
- Daily food consumption tracking

## Tables Structure

### 1. Users Table (`users`)
Stores user authentication information from Google OAuth.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| google_id | VARCHAR(255) | NOT NULL, UNIQUE | Google OAuth ID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| name | VARCHAR(255) | NOT NULL | User display name |
| picture_url | TEXT | NULL | Google profile picture URL |
| is_active | BOOLEAN | DEFAULT true | Account status |
| last_login | DATETIME | NULL | Last login timestamp |
| created_at | DATETIME | NOT NULL | Record creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

### 2. Profiles Table (`profiles`)
Stores user body information and fitness goals.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique profile identifier |
| user_id | INTEGER | NOT NULL, UNIQUE, FK(users.id) | Reference to user |
| age | INTEGER | NULL, 1-150 | User age |
| gender | ENUM | NULL, ('male', 'female', 'other') | User gender |
| height_cm | DECIMAL(5,2) | NULL, 50.0-300.0 | Height in centimeters |
| weight_kg | DECIMAL(5,2) | NULL, 20.0-500.0 | Weight in kilograms |
| bmi | DECIMAL(4,2) | NULL, 10.0-100.0 | Body Mass Index (auto-calculated) |
| activity_level | ENUM | NULL, DEFAULT 'sedentary' | Activity level |
| goal_type | ENUM | NULL, DEFAULT 'maintain' | Weight goal |
| target_weight_kg | DECIMAL(5,2) | NULL, 20.0-500.0 | Target weight |
| created_at | DATETIME | NOT NULL | Record creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

**Activity Levels:**
- `sedentary`: Little to no exercise
- `lightly_active`: Light exercise 1-3 days/week
- `moderately_active`: Moderate exercise 3-5 days/week
- `very_active`: Hard exercise 6-7 days/week
- `extremely_active`: Very hard exercise, physical job

**Goal Types:**
- `loss`: Weight loss
- `gain`: Weight gain
- `maintain`: Maintain current weight

### 3. Daily Goals Table (`daily_goals`)
Stores calculated daily nutritional targets for each user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique goal identifier |
| user_id | INTEGER | NOT NULL, UNIQUE, FK(users.id) | Reference to user |
| calories | DECIMAL(7,2) | NOT NULL, DEFAULT 2000.00 | Daily calorie target |
| carbs_g | DECIMAL(6,2) | NOT NULL, DEFAULT 250.00 | Daily carbs target (grams) |
| proteins_g | DECIMAL(6,2) | NOT NULL, DEFAULT 150.00 | Daily protein target (grams) |
| fats_g | DECIMAL(6,2) | NOT NULL, DEFAULT 65.00 | Daily fat target (grams) |
| sugar_g | DECIMAL(6,2) | NOT NULL, DEFAULT 50.00 | Daily sugar limit (grams) |
| fiber_g | DECIMAL(6,2) | NULL, DEFAULT 25.00 | Daily fiber target (grams) |
| sodium_mg | DECIMAL(8,2) | NULL, DEFAULT 2300.00 | Daily sodium limit (mg) |
| is_active | BOOLEAN | DEFAULT true | Goal status |
| created_at | DATETIME | NOT NULL | Record creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

### 4. Food Items Table (`food_items`)
Stores food information retrieved from barcode scanning.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique food identifier |
| barcode | VARCHAR(50) | NOT NULL, UNIQUE | Product barcode |
| name | VARCHAR(500) | NOT NULL | Product name |
| brand | VARCHAR(255) | NULL | Brand name |
| serving_size_g | DECIMAL(8,2) | NULL | Serving size in grams |
| calories_per_100g | DECIMAL(7,2) | NULL | Calories per 100g |
| carbs_per_100g | DECIMAL(6,2) | NULL | Carbohydrates per 100g |
| proteins_per_100g | DECIMAL(6,2) | NULL | Proteins per 100g |
| fats_per_100g | DECIMAL(6,2) | NULL | Fats per 100g |
| sugar_per_100g | DECIMAL(6,2) | NULL | Sugar per 100g |
| fiber_per_100g | DECIMAL(6,2) | NULL | Fiber per 100g |
| sodium_per_100g | DECIMAL(8,2) | NULL | Sodium per 100g (mg) |
| saturated_fats_per_100g | DECIMAL(6,2) | NULL | Saturated fats per 100g |
| image_url | TEXT | NULL | Product image URL |
| ingredients | TEXT | NULL | Ingredients list |
| allergens | TEXT | NULL | Allergen information |
| nutrition_grade | ENUM | NULL, ('a', 'b', 'c', 'd', 'e') | Nutri-Score grade |
| last_updated | DATETIME | DEFAULT NOW() | Last data update |
| created_at | DATETIME | NOT NULL | Record creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

### 5. Consumption Logs Table (`consumption_logs`)
Tracks daily food consumption by users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique log identifier |
| user_id | INTEGER | NOT NULL, FK(users.id) | Reference to user |
| food_item_id | INTEGER | NOT NULL, FK(food_items.id) | Reference to food item |
| barcode | VARCHAR(50) | NOT NULL | Product barcode (for quick lookup) |
| consumption_date | DATE | NOT NULL, DEFAULT TODAY | Date of consumption |
| meal_type | ENUM | NOT NULL, DEFAULT 'snack' | Meal category |
| amount_consumed_g | DECIMAL(8,2) | NOT NULL | Amount consumed in grams |
| actual_calories | DECIMAL(7,2) | NULL | Calculated calories consumed |
| actual_carbs_g | DECIMAL(6,2) | NULL | Calculated carbs consumed |
| actual_proteins_g | DECIMAL(6,2) | NULL | Calculated proteins consumed |
| actual_fats_g | DECIMAL(6,2) | NULL | Calculated fats consumed |
| actual_sugar_g | DECIMAL(6,2) | NULL | Calculated sugar consumed |
| actual_fiber_g | DECIMAL(6,2) | NULL | Calculated fiber consumed |
| actual_sodium_mg | DECIMAL(8,2) | NULL | Calculated sodium consumed |
| notes | TEXT | NULL | User notes |
| created_at | DATETIME | NOT NULL | Record creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

**Meal Types:**
- `breakfast`: Morning meal
- `lunch`: Midday meal
- `dinner`: Evening meal
- `snack`: Snacks/other

## Relationships

1. **User → Profile**: One-to-One (CASCADE DELETE)
2. **User → DailyGoals**: One-to-One (CASCADE DELETE)
3. **User → ConsumptionLogs**: One-to-Many (CASCADE DELETE)
4. **FoodItem → ConsumptionLogs**: One-to-Many (CASCADE DELETE)

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Neon Database Configuration
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/nutriscan_db?sslmode=require

# Environment
NODE_ENV=development

# Server Configuration
PORT=5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

### 2. Install Dependencies

```bash
npm install sequelize pg pg-hstore
```

### 3. Initialize Database

```bash
# Create all tables
npm run db:init

# Reset database (drops and recreates all tables)
npm run db:reset
```

### 4. Usage Examples

#### Create a User with Profile
```javascript
const { User, Profile, DailyGoals } = require('./models');
const { calculateDailyGoals } = require('./utils/nutritionCalculator');

// Create user
const user = await User.create({
  google_id: 'google_123456789',
  email: 'user@example.com',
  name: 'John Doe',
  picture_url: 'https://example.com/photo.jpg'
});

// Create profile
const profile = await Profile.create({
  user_id: user.id,
  age: 30,
  gender: 'male',
  height_cm: 175.0,
  weight_kg: 80.0,
  activity_level: 'moderately_active',
  goal_type: 'loss'
});

// Calculate and create daily goals
const goals = calculateDailyGoals(profile);
await DailyGoals.create({
  user_id: user.id,
  ...goals
});
```

#### Log Food Consumption
```javascript
const { FoodItem, ConsumptionLog } = require('./models');

// Find or create food item
const [foodItem] = await FoodItem.findOrCreate({
  where: { barcode: '1234567890123' },
  defaults: {
    name: 'Apple',
    calories_per_100g: 52,
    carbs_per_100g: 14,
    // ... other nutritional data
  }
});

// Log consumption
await ConsumptionLog.create({
  user_id: user.id,
  food_item_id: foodItem.id,
  barcode: '1234567890123',
  consumption_date: new Date(),
  meal_type: 'breakfast',
  amount_consumed_g: 150.0
  // actual_* fields will be auto-calculated
});
```

## Indexes

The schema includes optimized indexes for:
- User lookups by Google ID and email
- Food item lookups by barcode
- Consumption logs by user and date
- Consumption logs by meal type

## Data Validation

All models include comprehensive validation:
- Email format validation
- Numeric range validation for health metrics
- Enum validation for categorical fields
- Required field validation

## Auto-Calculations

The schema includes automatic calculations for:
- BMI calculation when height/weight are updated
- Nutritional values calculation for consumption logs
- Daily goal calculations based on profile data 