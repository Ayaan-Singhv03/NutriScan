# NutriScan Backend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Database Architecture](#database-architecture)
4. [Authentication System](#authentication-system)
5. [API Routes](#api-routes)
6. [Database Models](#database-models)
7. [External Services](#external-services)
8. [Middleware](#middleware)
9. [Environment Variables](#environment-variables)
10. [Project Structure](#project-structure)
11. [Setup & Installation](#setup--installation)
12. [API Testing](#api-testing)

---

## Overview

NutriScan is a comprehensive nutrition tracking application backend built with Node.js, Express, and PostgreSQL. The system provides user authentication, food item management, nutrition tracking, and AI-powered recommendations.

### Key Features
- 🔐 Firebase-based authentication
- 📊 Comprehensive nutrition tracking
- 🤖 AI-powered food recommendations (Gemini AI)
- 📱 Barcode scanning support
- 🎯 Personalized daily goals
- 🔍 External food database integration (OpenFoodFacts)
- 📈 Daily nutrition summaries

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js v22.17.1
- **Framework**: Express.js v4.18.2
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Sequelize v6.37.7
- **Authentication**: Firebase Admin SDK v13.4.0

### Key Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",     // Gemini AI integration
  "@neondatabase/serverless": "^1.0.1",   // Neon database driver
  "axios": "^1.9.0",                      // HTTP client
  "cors": "^2.8.5",                       // Cross-origin resource sharing
  "dotenv": "^16.5.0",                    // Environment variables
  "express-validator": "^7.0.1",          // Input validation
  "firebase-admin": "^13.4.0",            // Firebase authentication
  "helmet": "^7.1.0",                     // Security middleware
  "morgan": "^1.10.0",                    // HTTP request logging
  "pg": "^8.16.0",                        // PostgreSQL driver
  "sequelize": "^6.37.7"                  // ORM
}
```

---

## Database Architecture

### Database Provider: Neon PostgreSQL
- **Type**: Serverless PostgreSQL
- **Connection**: SSL-secured with connection pooling
- **Features**: Auto-scaling, branching, point-in-time recovery

### Connection Configuration
```javascript
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

### Database Models Relationships

```
┌─────────────┐    1:1     ┌─────────────┐
│    User     │ ────────── │   Profile   │
│             │            │             │
└─────────────┘            └─────────────┘
       │ 1:1                      
       │                          
┌─────────────┐                   
│ DailyGoal   │                   
│             │                   
└─────────────┘                   
       │ 1:Many                   
       │                          
┌─────────────┐    Many:1  ┌─────────────┐
│ConsumptionLog│ ────────── │  FoodItem   │
│             │            │             │
└─────────────┘            └─────────────┘
```

---

## Authentication System

### Firebase Authentication Integration

#### How It Works
1. **Frontend**: User authenticates with Firebase (Google OAuth, Email/Password, etc.)
2. **Token Generation**: Firebase generates an ID token
3. **Backend Verification**: Server verifies the token using Firebase Admin SDK
4. **User Creation**: User record is created/updated in PostgreSQL database

#### Authentication Flow
```javascript
// 1. Client sends request with Bearer token
Authorization: Bearer <firebase-id-token>

// 2. Middleware verifies token
const decodedToken = await auth.verifyIdToken(token);

// 3. User data extracted and attached to request
req.user = {
  uid: decodedToken.uid,
  email: decodedToken.email,
  name: decodedToken.name,
  picture: decodedToken.picture
};
```

#### Middleware Types
1. **authMiddleware**: Full authentication required
2. **conditionalAuthMiddleware**: Authentication required except for specific public routes

---

## API Routes

### Base URL
```
http://localhost:5000
```

### Route Overview
| Route | Authentication | Description |
|-------|---------------|-------------|
| `/api/auth/*` | Mixed | User authentication |
| `/api/profile/*` | Required | User profile management |
| `/api/goals/*` | Required | Daily nutrition goals |
| `/api/food/*` | Conditional | Food item management |
| `/api/logs/*` | Required | Consumption tracking |
| `/api/recommendations/*` | Required | AI recommendations |
| `/api/barcode/*` | Public | Barcode scanning |
| `/api/public/*` | Public | Public endpoints |
| `/api/gemini/*` | Mixed | AI service endpoints |

### Detailed Route Documentation

#### 1. Authentication Routes (`/api/auth`)
```javascript
POST /api/auth/login
// Login with Firebase token
// Body: { idToken: "firebase-id-token" }
// Response: { user: {...}, token: "..." }

GET /api/auth/me
// Get current user info (Protected)
// Headers: Authorization: Bearer <token>
// Response: { user: {...} }
```

#### 2. Profile Routes (`/api/profile`)
```javascript
POST /api/profile
// Create user profile
// Body: { age, gender, height, weight, activityLevel }

GET /api/profile
// Get user's profile

PUT /api/profile
// Update user's profile
// Body: { age?, gender?, height?, weight?, activityLevel? }

DELETE /api/profile
// Delete user's profile
```

#### 3. Daily Goals Routes (`/api/goals`)
```javascript
POST /api/goals
// Create daily nutritional goals
// Body: { goalType, targetCalories, targetProtein, targetCarbs, targetFat }

GET /api/goals
// Get user's current daily goals

GET /api/goals/calculate
// Preview auto-calculated goals based on profile

PUT /api/goals
// Update daily goals

DELETE /api/goals
// Delete daily goals
```

#### 4. Food Items Routes (`/api/food`)
```javascript
GET /api/food
// Get all food items with pagination and search
// Query: ?page=1&limit=20&search=apple

GET /api/food/barcode/:barcode
// Get food item by barcode (Public for some routes)

POST /api/food
// Create new food item manually

PUT /api/food/:barcode
// Update food item

DELETE /api/food/:barcode
// Delete food item

GET /api/food/search-external
// Search external food database (OpenFoodFacts)
// Query: ?q=search-term
```

#### 5. Consumption Logs Routes (`/api/logs`)
```javascript
POST /api/logs/scan
// Scan barcode and log consumption in one step
// Body: { barcode, amountConsumed, consumedAt? }

POST /api/logs
// Create consumption log
// Body: { barcode, amountConsumed, consumedAt? }

GET /api/logs
// Get user's consumption logs
// Query: ?date=2024-01-01&limit=50

GET /api/logs/daily-summary/:date
// Get daily nutrition summary
// Params: date (YYYY-MM-DD)

GET /api/logs/:id
// Get specific consumption log

PUT /api/logs/:id
// Update consumption log

DELETE /api/logs/:id
// Delete consumption log
```

#### 6. Recommendations Routes (`/api/recommendations`)
```javascript
POST /api/recommendations/generate
// Generate AI recommendations for a product
// Body: { productData: {...}, userPreferences?: {...} }
// Response: { healthScore, healthInsights, alternatives }
```

#### 7. Barcode Routes (`/api/barcode`)
```javascript
GET /api/barcode/:barcode
// Public barcode lookup
// Response: Food item data or external API results
```

#### 8. Public Routes (`/api/public`)
```javascript
GET /api/public/barcode/:barcode
// Public barcode lookup (no auth required)
```

#### 9. Gemini AI Routes (`/api/gemini`)
```javascript
GET /api/gemini/health
// Check Gemini AI service health

POST /api/gemini/chat
// Direct chat with Gemini AI (Protected)
```

---

## Database Models

### 1. User Model
```javascript
{
  id: UUID (Primary Key),
  firebase_uid: String (Unique, Not Null),
  email: String (Unique, Not Null, Email),
  name: String (Nullable),
  pictureUrl: String (Nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Profile Model
```javascript
{
  id: Integer (Primary Key),
  userId: UUID (Foreign Key -> Users.id),
  age: Integer (1-120),
  gender: ENUM('male', 'female', 'other'),
  height: Float (30-300 cm),
  weight: Float (20-500 kg),
  bmi: Float (Calculated),
  activityLevel: ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. DailyGoal Model
```javascript
{
  id: Integer (Primary Key),
  userId: UUID (Foreign Key -> Users.id),
  goalType: ENUM('lose_weight', 'gain_weight', 'maintain'),
  targetCalories: Integer,
  targetProtein: Float,
  targetCarbs: Float,
  targetFat: Float,
  isAutoCalculated: Boolean (Default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. FoodItem Model
```javascript
{
  barcode: String (Primary Key),
  name: String (Not Null),
  brand: String (Nullable),
  category: String (Nullable),
  caloriesPer100g: Float,
  proteinsPer100g: Float,
  carbsPer100g: Float,
  fatsPer100g: Float,
  fiberPer100g: Float (Nullable),
  sugarsPer100g: Float,
  sodiumPer100g: Float (Nullable),
  servingSize: Float,
  servingUnit: String (Nullable),
  servingSizeGrams: Float (Nullable),
  imageUrl: String (Nullable),
  source: ENUM('openfoodfacts', 'manual'),
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. ConsumptionLog Model
```javascript
{
  id: Integer (Primary Key),
  userId: UUID (Foreign Key -> Users.id),
  barcode: String (Foreign Key -> FoodItems.barcode),
  amountConsumed: Float,
  date: DateOnly,
  consumedAt: Date,
  calculatedCalories: Float (Calculated),
  calculatedProtein: Float (Calculated),
  calculatedCarbs: Float (Calculated),
  calculatedFat: Float (Calculated),
  calculatedFiber: Float (Calculated),
  calculatedSugar: Float (Calculated),
  calculatedSodium: Float (Calculated),
  isManualEntry: Boolean (Default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

## External Services

### 1. OpenFoodFacts Integration
**Purpose**: External food database for barcode scanning

**Features**:
- Product lookup by barcode
- Nutritional data extraction
- Product search functionality
- Automatic data normalization

**API Endpoints**:
```javascript
// Get product by barcode
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json

// Search products
GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=1
```

**Data Processing**:
- Handles different nutrition data formats
- Converts units (kJ to kcal)
- Normalizes per 100g values
- Extracts product names with fallbacks

### 2. Gemini AI Integration
**Purpose**: AI-powered food recommendations and nutrition analysis

**Features**:
- Health score calculation
- Nutrition analysis
- Alternative product suggestions
- Personalized recommendations

**Configuration**:
```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

---

## Middleware

### 1. Authentication Middleware
**File**: `middlewares/authMiddleware.js`

**Purpose**: Verify Firebase ID tokens

**Process**:
1. Extract Bearer token from Authorization header
2. Verify token with Firebase Admin SDK
3. Attach user data to request object
4. Handle token expiration and invalid tokens

### 2. Conditional Authentication Middleware
**File**: `middlewares/conditionalAuthMiddleware.js`

**Purpose**: Skip authentication for specific public routes

**Public Routes**:
- `/api/food/barcode/`
- `/api/food/search-external`

### 3. Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logging

---

## Environment Variables

### Required Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Authentication
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Optional Variables
```bash
# OpenFoodFacts Configuration
OPENFOODFACTS_USER_AGENT=NutriScan/1.0.0
OPENFOODFACTS_TIMEOUT=10000
```

---

## Project Structure

```
backend/
├── config/
│   ├── database.js          # Sequelize database configuration
│   ├── firebase.js          # Firebase Admin SDK setup
│   ├── gemini.js           # Gemini AI configuration
│   └── neon.js             # Neon database specific config
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── profileController.js # Profile management
│   ├── dailyGoalController.js # Daily goals management
│   ├── foodItemController.js # Food items CRUD
│   ├── consumptionLogController.js # Consumption tracking
│   ├── geminiController.js  # AI interactions
│   └── recommendation.controller.js # AI recommendations
├── middlewares/
│   ├── authMiddleware.js    # Authentication middleware
│   └── conditionalAuthMiddleware.js # Conditional auth
├── models/
│   ├── User.js             # User model
│   ├── Profile.js          # Profile model
│   ├── DailyGoal.js        # Daily goals model
│   ├── FoodItem.js         # Food items model
│   ├── ConsumptionLog.js   # Consumption logs model
│   ├── relations.js        # Model relationships
│   └── index.js            # Model exports
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── profileRoutes.js    # Profile routes
│   ├── dailyGoalRoutes.js  # Daily goals routes
│   ├── foodItemRoutes.js   # Food items routes
│   ├── consumptionLogRoutes.js # Consumption routes
│   ├── recommendationRoutes.js # AI recommendation routes
│   ├── barcodeRoutes.js    # Barcode scanning routes
│   ├── publicRoutes.js     # Public routes
│   └── gemini.js           # AI service routes
├── services/
│   └── openFoodFactsService.js # External API service
├── utils/
│   └── nutritionCalculator.js # Nutrition calculations
├── scripts/
│   └── initDatabase.js     # Database initialization
├── package.json            # Dependencies and scripts
├── server.js              # Application entry point
└── .env                   # Environment variables
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL database (Neon recommended)
- Firebase project with Admin SDK
- Gemini AI API key

### Installation Steps

1. **Clone and Install**
```bash
git clone <repository>
cd backend
npm install
```

2. **Environment Setup**
```bash
cp env.example .env
# Edit .env with your actual values
```

3. **Database Setup**
```bash
# Database will auto-sync on first run
npm start
```

4. **Development Mode**
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Environment Configuration

#### Firebase Setup
1. Create Firebase project
2. Generate Admin SDK private key
3. Add configuration to `.env`

#### Neon Database Setup
1. Create Neon project
2. Get connection string
3. Add to `DATABASE_URL` in `.env`

#### Gemini AI Setup
1. Get API key from Google AI Studio
2. Add to `GEMINI_API_KEY` in `.env`

---

## API Testing

### Health Check Endpoints
```bash
# Server health
GET /health
Response: { status: 'healthy', database: 'connected', recordCounts: {...} }

# Gemini AI health
GET /api/gemini/health
Response: { status: 'operational', model: 'gemini-1.5-flash' }
```

### Authentication Testing
```bash
# Login
POST /api/auth/login
Content-Type: application/json
{
  "idToken": "firebase-id-token"
}

# Protected endpoint test
GET /api/auth/me
Authorization: Bearer <token>
```

### Sample API Calls
```bash
# Create profile
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json
{
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "activityLevel": "moderately_active"
}

# Log food consumption
POST /api/logs/scan
Authorization: Bearer <token>
Content-Type: application/json
{
  "barcode": "1234567890123",
  "amountConsumed": 150
}

# Get AI recommendations
POST /api/recommendations/generate
Authorization: Bearer <token>
Content-Type: application/json
{
  "productData": {
    "name": "Sample Product",
    "barcode": "1234567890123",
    "nutrition": {
      "calories": 250,
      "protein": 10,
      "carbs": 30,
      "fat": 8,
      "sugar": 15
    }
  }
}
```

---

## Error Handling

### Standard Error Responses
```javascript
// Validation Error
{
  "error": "Validation failed",
  "details": ["Field 'email' is required"]
}

// Authentication Error
{
  "error": "Invalid token. Access denied."
}

// Not Found Error
{
  "error": "Resource not found"
}

// Server Error
{
  "error": "Internal server error",
  "message": "Something went wrong!"
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Security Considerations

### Implemented Security Measures
1. **Firebase Authentication**: Industry-standard auth
2. **HTTPS/SSL**: Encrypted connections
3. **Helmet.js**: Security headers
4. **CORS**: Controlled cross-origin access
5. **Input Validation**: Express-validator
6. **SQL Injection Protection**: Sequelize ORM
7. **Connection Pooling**: Database connection limits

### Security Best Practices
- Environment variables for sensitive data
- Token expiration handling
- Rate limiting (recommended for production)
- Input sanitization
- Error message sanitization

---

## Performance Optimizations

### Database Optimizations
- Connection pooling (max: 5 connections)
- Indexes on foreign keys
- Efficient queries with Sequelize
- Auto-sync with existing data preservation

### API Optimizations
- Pagination for large datasets
- Conditional authentication
- External API caching (recommended)
- Request logging for monitoring

---

## Deployment Considerations

### Production Environment
```bash
NODE_ENV=production
PORT=5000
```

### Database
- Use production Neon database
- Enable SSL mode
- Configure connection pooling
- Set up database monitoring

### Security
- Use strong Firebase private keys
- Implement rate limiting
- Set up monitoring and alerting
- Configure CORS for production domains

---

## Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process-id> /F
```

2. **Database Connection Errors**
- Check DATABASE_URL format
- Verify SSL configuration
- Check Neon database status

3. **Firebase Authentication Errors**
- Verify private key format
- Check project ID
- Ensure client email is correct

4. **Gemini AI Errors**
- Verify API key
- Check quota limits
- Ensure proper model name

---

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Test endpoints
4. Update documentation
5. Submit pull request

### Code Standards
- Use ES6+ features
- Follow Express.js best practices
- Implement proper error handling
- Add JSDoc comments
- Write unit tests (recommended)

---

*This documentation is comprehensive and covers all aspects of the NutriScan backend system. For questions or contributions, please refer to the main README or contact the development team.* 