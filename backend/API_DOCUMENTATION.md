# NutriScan API Documentation

## Overview
Complete REST API for NutriScan nutrition tracking application with Firebase Authentication, auto-calculated BMI, personalized nutrition goals, and OpenFoodFacts integration.

## Base URL
```
http://localhost:5000
```

## Authentication
All API endpoints (except `/api/auth/login`) require Firebase authentication token in the Authorization header:
```
Authorization: Bearer <firebase_token>
```

---

## Authentication Endpoints

### POST /api/auth/login
Login with Firebase token and create/update user in database.

**Request Body:**
```json
{
  "token": "firebase_id_token"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "firebase_uid": "firebase_uid",
    "email": "user@example.com",
    "name": "User Name",
    "pictureUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/auth/me
Get current authenticated user information.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "pictureUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Profile Endpoints

### POST  
Create user profile with auto-calculated BMI.

**Request Body:**
```json
{
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "activityLevel": "moderately_active",
  "goalType": "maintain"
}
```

**Response (201):**
```json
{
  "message": "Profile created successfully",
  "profile": {
    "id": 1,
    "userId": "uuid",
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "bmi": 22.9,
    "activityLevel": "moderate",
    "goalType": "maintain",
    "bmiCategory": "normal"
  }
}
```

### GET /api/profile
Get user's profile with BMI category.

### PUT /api/profile
Update user's profile (BMI recalculated automatically).

### DELETE /api/profile
Delete user's profile.

---

## Daily Goals Endpoints

### POST /api/goals
Create daily nutritional goals (auto-calculated or manual).

**Request Body (Auto-calculated):**
```json
{
  "autoCalculate": true
}
```

**Request Body (Manual):**
```json
{
  "goalType": "lose_weight",
  "targetCalories": 2000,
  "targetProtein": 150,
  "targetCarbs": 200,
  "targetFat": 67,
  "isAutoCalculated": false
}
```

**Response (201):**
```json
{
  "message": "Daily goal created successfully",
  "dailyGoal": {
    "id": 1,
    "userId": "uuid",
    "calories": 2200,
    "carbs": 275,
    "proteins": 138,
    "fats": 61,
    "sugars": 55
  },
  "autoCalculated": true
}
```

### GET /api/goals/calculate
Preview calculated goals based on profile without saving.

**Response (200):**
```json
{
  "message": "Calculated goals based on your profile",
  "calculatedGoals": {
    "calories": 2200,
    "proteins": 138,
    "carbs": 275,
    "fats": 61,
    "sugars": 55
  },
  "profileData": {
    "bmi": 22.9,
    "activityLevel": "moderate",
    "goalType": "maintain"
  }
}
```

### GET /api/goals
Get user's daily goals.

### PUT /api/goals
Update user's daily goals (with optional auto-recalculation).

### DELETE /api/goals
Delete user's daily goals.

---

## Food Items Endpoints

### GET /api/food/barcode/:barcode
Get food item by barcode with OpenFoodFacts fallback.

**Query Parameters:**
- `autoFetch`: boolean (default: true) - Automatically fetch from OpenFoodFacts if not in database

**Response (200) - Found in database:**
```json
{
  "foodItem": {
    "id": 1,
    "barcode": "123456789",
    "name": "Apple",
    "servingSize": 100,
    "caloriesPer100g": 52,
    "carbsPer100g": 14,
    "proteinsPer100g": 0.3,
    "fatsPer100g": 0.2,
    "sugarsPer100g": 10
  },
  "source": "database"
}
```

**Response (201) - Fetched from OpenFoodFacts:**
```json
{
  "message": "Food item fetched from OpenFoodFacts and saved to database",
  "foodItem": {
    "id": 2,
    "barcode": "987654321",
    "name": "Banana",
    "servingSize": 100,
    "caloriesPer100g": 89,
    "carbsPer100g": 23,
    "proteinsPer100g": 1.1,
    "fatsPer100g": 0.3,
    "sugarsPer100g": 12
  },
  "source": "openfoodfacts",
  "additionalData": {
    "brand": "Dole",
    "imageUrl": "https://...",
    "ingredients": "Banana",
    "categories": "Fresh fruits"
  }
}
```

### POST /api/food
Create food item manually or with OpenFoodFacts enhancement.

**Request Body (Manual):**
```json
{
  "barcode": "123456789",
  "name": "Apple",
  "servingSize": 100,
  "caloriesPer100g": 52,
  "carbsPer100g": 14,
  "proteinsPer100g": 0.3,
  "fatsPer100g": 0.2,
  "sugarsPer100g": 10,
  "fetchFromOpenFoodFacts": false
}
```

**Request Body (OpenFoodFacts Enhanced):**
```json
{
  "barcode": "123456789",
  "fetchFromOpenFoodFacts": true
}
```

### GET /api/food
Get all food items with search and pagination.

**Query Parameters:**
- `search`: Search by food name
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### GET /api/food/search-external
Search OpenFoodFacts directly without saving to database.

**Query Parameters:**
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "message": "External search results from OpenFoodFacts",
  "results": {
    "count": 150,
    "page": 1,
    "pageSize": 20,
    "products": [
      {
        "barcode": "123456789",
        "name": "Apple Juice",
        "brand": "Brand Name",
        "imageUrl": "https://..."
      }
    ]
  },
  "source": "openfoodfacts"
}
```

### PUT /api/food/:barcode
Update food item.

### DELETE /api/food/:barcode
Delete food item.

---

## Consumption Logs Endpoints

### POST /api/logs
Create consumption log with auto-calculated nutrition values.

**Request Body (Auto-calculated):**
```json
{
  "barcode": "123456789",
  "date": "2024-01-01",
  "amountConsumed": 150,
  "autoCalculate": true
}
```

**Request Body (Manual values):**
```json
{
  "barcode": "123456789",
  "date": "2024-01-01",
  "amountConsumed": 150,
  "autoCalculate": false,
  "caloriesConsumed": 78,
  "carbsConsumed": 21,
  "proteinsConsumed": 0.45,
  "fatsConsumed": 0.3,
  "sugarsConsumed": 15
}
```

**Response (201):**
```json
{
  "message": "Food consumption logged successfully",
  "consumptionLog": {
    "id": 1,
    "userId": "uuid",
    "barcode": "123456789",
    "date": "2024-01-01",
    "amountConsumed": 150,
    "caloriesConsumed": 78,
    "carbsConsumed": 21,
    "proteinsConsumed": 0.45,
    "fatsConsumed": 0.3,
    "sugarsConsumed": 15,
    "FoodItem": {
      "barcode": "123456789",
      "name": "Apple",
      "servingSize": 100
    }
  },
  "calculationMethod": "auto-calculated"
}
```

### GET /api/logs
Get user's consumption logs with filtering.

**Query Parameters:**
- `date`: Filter by specific date (YYYY-MM-DD)
- `startDate`: Filter from date
- `endDate`: Filter to date
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### GET /api/logs/daily-summary/:date
Get daily nutrition summary with goal comparison.

**Response (200):**
```json
{
  "date": "2024-01-01",
  "summary": {
    "totalCalories": 1850.5,
    "totalCarbs": 230.2,
    "totalProteins": 145.8,
    "totalFats": 62.1,
    "totalSugars": 48.3,
    "totalItems": 8
  },
  "goalComparison": {
    "calories": {
      "consumed": 1850.5,
      "goal": 2200,
      "remaining": 349.5,
      "percentage": 84
    },
    "carbs": {
      "consumed": 230.2,
      "goal": 275,
      "remaining": 44.8,
      "percentage": 84
    }
  },
  "logs": [
    {
      "id": 1,
      "foodName": "Apple",
      "amountConsumed": 150,
      "caloriesConsumed": 78,
      "carbsConsumed": 21,
      "proteinsConsumed": 0.45,
      "fatsConsumed": 0.3,
      "sugarsConsumed": 15,
      "createdAt": "2024-01-01T10:30:00.000Z"
    }
  ]
}
```

### GET /api/logs/:id
Get consumption log by ID.

### PUT /api/logs/:id
Update consumption log with auto-recalculation option.

### DELETE /api/logs/:id
Delete consumption log.

---

## Gemini AI Endpoints

### GET /api/gemini/health
Check if Gemini AI service is operational.

**Access:** Public (no authentication required)

**Response (200):**
```json
{
  "success": true,
  "message": "Gemini AI service is operational",
  "testResponse": "Hello! How can I help you today?",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Response (503) - Service Unavailable:**
```json
{
  "success": false,
  "message": "Gemini AI service is not available",
  "error": "Gemini AI not initialized. Check your API key.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST /api/gemini/prompt
Send a prompt to Gemini AI and receive a response.

**Access:** Private (requires authentication)

**Request Body:**
```json
{
  "prompt": "Give me 3 healthy breakfast recommendations for someone trying to lose weight"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "prompt": "Give me 3 healthy breakfast recommendations for someone trying to lose weight",
    "response": "Here are 3 healthy breakfast recommendations for weight loss:\n\n1. **Greek Yogurt with Berries and Nuts**: High in protein to keep you full, with antioxidants from berries and healthy fats from nuts.\n\n2. **Oatmeal with Cinnamon and Apple**: Fiber-rich oats help with satiety, while cinnamon may help regulate blood sugar.\n\n3. **Scrambled Eggs with Spinach**: Protein-packed eggs combined with nutrient-dense spinach provide lasting energy without excess calories."
  },
  "message": "Response generated successfully"
}
```

**Response (400) - Bad Request:**
```json
{
  "success": false,
  "message": "Prompt is required"
}
```

**Response (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to get response from Gemini",
  "error": "Gemini AI not initialized. Check your API key."
}
```

---

## Enhanced Features

### BMI Calculation
- Automatic BMI calculation using formula: `weight(kg) / (height(m))²`
- BMI categories: underweight, normal, overweight, obese
- Auto-recalculation when height or weight updated

### Personalized Goal Calculation
- Uses Mifflin-St Jeor equation for BMR calculation
- Activity level multipliers for TDEE
- Goal type adjustments (500 cal deficit/surplus for loss/gain)
- Macronutrient distribution based on goals

### OpenFoodFacts Integration
- Automatic food data fetching by barcode
- Product search functionality
- Nutrition data normalization (kJ to kcal conversion)
- Brand, image, ingredients, and category information

### Smart Consumption Logging
- Auto-calculation of nutrition values from amount consumed
- Manual override options
- Goal progress tracking
- Daily summaries with goal comparison

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token. Access denied."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Example Usage

### 1. Complete User Setup Flow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"token": "firebase_id_token"}'

# 2. Create Profile (BMI auto-calculated)
curl -X POST http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "activityLevel": "moderate",
    "goalType": "maintain"
  }'

# 3. Preview Calculated Goals
curl -X GET http://localhost:5000/api/goals/calculate \
  -H "Authorization: Bearer firebase_token"

# 4. Create Goals (auto-calculated)
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{"autoCalculate": true}'
```

### 2. Food Management Flow

```bash
# 1. Get food by barcode (auto-fetch from OpenFoodFacts)
curl -X GET http://localhost:5000/api/food/barcode/123456789 \
  -H "Authorization: Bearer firebase_token"

# 2. Search external food database
curl -X GET "http://localhost:5000/api/food/search-external?q=apple%20juice" \
  -H "Authorization: Bearer firebase_token"

# 3. Create food item with OpenFoodFacts enhancement
curl -X POST http://localhost:5000/api/food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{
    "barcode": "123456789",
    "fetchFromOpenFoodFacts": true
  }'
```

### 3. Consumption Logging Flow

```bash
# 1. Log food consumption (auto-calculated nutrition)
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{
    "barcode": "123456789",
    "date": "2024-01-01",
    "amountConsumed": 150,
    "autoCalculate": true
  }'

# 2. Get daily summary with goal comparison
curl -X GET http://localhost:5000/api/logs/daily-summary/2024-01-01 \
  -H "Authorization: Bearer firebase_token"

# 3. Update consumption log
curl -X PUT http://localhost:5000/api/logs/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{
    "amountConsumed": 200,
    "autoCalculate": true
  }'
```

### 4. Gemini AI Flow

```bash
# 1. Check Gemini health (no auth required)
curl -X GET http://localhost:5000/api/gemini/health

# 2. Get nutrition recommendations
curl -X POST http://localhost:5000/api/gemini/prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{
    "prompt": "Give me 3 healthy breakfast recommendations for someone trying to lose weight"
  }'

# 3. Get meal planning advice
curl -X POST http://localhost:5000/api/gemini/prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{
    "prompt": "Create a weekly meal plan for a vegetarian trying to gain muscle mass"
  }'

# 4. Get food substitution suggestions
curl -X POST http://localhost:5000/api/gemini/prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase_token" \
  -d '{
    "prompt": "What are healthy alternatives to replace white rice in my diet?"
  }'
``` 