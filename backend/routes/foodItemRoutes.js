const express = require('express');
const router = express.Router();
const foodItemController = require('../controllers/foodItemController');
const authMiddleware = require('../middlewares/authMiddleware');

// All food item routes require authentication
router.use(authMiddleware);

// POST /api/food - Create food item
router.post('/', foodItemController.createFoodItem);

// GET /api/food/search-external - Search OpenFoodFacts directly (must come before /:barcode)
router.get('/search-external', foodItemController.searchExternalFoodItems);

// GET /api/food/barcode/:barcode - Get food item by barcode (with OpenFoodFacts fallback)
router.get('/barcode/:barcode', foodItemController.getFoodItemByBarcode);

// GET /api/food - Get all food items with optional search and pagination
router.get('/', foodItemController.getAllFoodItems);

// PUT /api/food/:barcode - Update food item
router.put('/:barcode', foodItemController.updateFoodItem);

// DELETE /api/food/:barcode - Delete food item
router.delete('/:barcode', foodItemController.deleteFoodItem);

module.exports = router; 