# NutriScan AI Recommendations System 🤖

## Overview

The NutriScan AI Recommendations System provides personalized health insights and healthier food alternatives using Google's Gemini AI. After scanning a product barcode, users can get comprehensive health recommendations with actionable insights.

## Features

### 🎯 Health Score Analysis

- Calculates a health score (1-100) based on nutritional content
- Considers calories, sugar, protein, fiber, sodium, and processing level
- Color-coded badges for easy interpretation

### 📊 Health Insights

- **What's Good**: Highlights positive nutritional aspects
- **Health Concerns**: Identifies potential health issues
- **Our Advice**: Provides specific recommendations for healthy consumption

### 🌱 Healthier Alternatives

- Suggests 3 realistic alternative products
- Shows detailed nutrition comparison
- Explains why alternatives are healthier
- Lists where to find these products

## How to Use

### For Users

1. **Scan a Product**: Use the barcode scanner to scan any food product
2. **View Product Details**: See nutrition facts and product information
3. **Get Recommendations**: Click "Get Health Recommendations" button
4. **Review Insights**: Analyze health score and insights
5. **Explore Alternatives**: Discover healthier product options

## Configuration

### Environment Variables

Make sure your backend has the following environment variable set:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Future Enhancements

- User preference learning
- Dietary restriction filtering
- Price comparison integration
- Store availability checking
- Nutrition goal alignment

---

_Made with ❤️ by the NutriScan team_
