const express = require('express');
const { getGeminiResponse, healthCheck } = require('../controllers/geminiController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/gemini/health
 * @desc    Check if Gemini AI service is operational
 * @access  Public
 */
router.get('/health', healthCheck);

/**
 * @route   POST /api/gemini/prompt
 * @desc    Send prompt to Gemini AI and get response
 * @access  Private (requires authentication)
 */
router.post('/prompt', authMiddleware, getGeminiResponse);

module.exports = router; 