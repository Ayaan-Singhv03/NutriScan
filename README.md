# NutriScan

NutriScan is a modern Progressive Web App (PWA) designed to help users instantly access nutritional information by scanning food barcodes. Powered by advanced AI, NutriScan delivers personalized recommendations and actionable insights to promote healthy eating habits. The app offers a seamless cross-platform experience with robust PWA features, ensuring accessibility on mobile, tablet, and desktop devices.

---

## 🚀 Project Purpose

NutriScan aims to empower users to make informed dietary choices with instant, AI-driven nutrition analysis. By combining barcode scanning, real-time AI feedback, and smart health suggestions, NutriScan helps users take charge of their nutrition, whether shopping, meal planning, or tracking their daily intake.

---

## ✨ Features

- **Barcode Scanner**: Quickly scan food packaging to retrieve detailed nutritional facts.
- **Nutrition Info Lookup**: Access comprehensive nutrition labels, ingredients, and allergen information.
- **AI Recommendations**: Get tailored suggestions based on scanned foods, dietary preferences, and health goals using Gemini AI.
- **PWA Support**: Installable experience with offline access, home screen shortcut, and push notifications.
- **Smart Feedback**: Receive real-time feedback, warnings on unhealthy items, and alternative food suggestions.
- **Cross-Platform**: Optimized for mobile and desktop, works flawlessly online and offline.

---

## 🛠️ Tech Stack

| Layer      | Technology                                 |
|------------|--------------------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind CSS, next-pwa |
| Backend    | Node.js, Express, Gemini AI API            |
| Deployment | Vercel (Frontend), Render (Backend)        |
| PWA        | next-pwa (Service Worker), Web App Manifest, Custom Icons |

---

---

## 🧑‍💻 Local Development Setup

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Vercel CLI** (optional, for frontend deployment)
- **Render account** (for backend deployment)
- Gemini AI API key (see [Gemini AI Integration](#-gemini-ai-integration))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nutriscan.git
cd nutriscan
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local   # Fill in required env vars
npm install
npm run dev                  # Starts Next.js locally
```

#### **Frontend Environment Variables**

| Variable              | Description                          |
|-----------------------|--------------------------------------|
| NEXT_PUBLIC_API_URL   | URL of the backend (Express) API     |
| NEXT_PUBLIC_APP_NAME  | App display name                     |

### 3. Backend Setup

```bash
cd ../backend
cp .env.example .env        # Fill in required env vars
npm install
npm run dev                 # Starts Express server with nodemon
```

#### **Backend Environment Variables**

| Variable          | Description                        |
|-------------------|------------------------------------|
| PORT              | Port on which Express runs         |
| GEMINI_API_KEY    | API key for Gemini AI              |

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push the `frontend/` directory to a GitHub repository.
2. Import the project in [Vercel](https://vercel.com/new).
3. Set environment variables (`NEXT_PUBLIC_API_URL`, etc.) in Vercel dashboard.
4. Deploy!

### Backend (Render)

1. Push the `backend/` directory to a GitHub repository.
2. Create a new Web Service on [Render](https://dashboard.render.com/).
3. Set environment variables (`PORT`, `GEMINI_API_KEY`) in Render dashboard.
4. Deploy!

---

## 🤖 Gemini AI Integration

Gemini AI powers NutriScan's personalized nutrition recommendations. After barcode scanning, the backend calls the Gemini API with relevant food data and user context for real-time feedback.

**Example API Call (Node.js/Express):**

```typescript
import axios from 'axios';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getAIRecommendation(nutritionData: object, userPreferences: object) {
  const prompt = `Given the following nutrition data and user preferences, provide a recommendation: ...`;

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    }
  );
  return response.data;
}
```

---

## 🏗 PWA Setup Summary

- **Manifest**: `frontend/public/manifest.json` contains app metadata, theme color, icons, and start URL.
- **Service Worker**: Integrated with `next-pwa` for offline support, caching, and background sync.
- **Icons**: Located in `frontend/public/icons/`, covering multiple device and browser requirements.

---

## 💡 AI Prompt Example

> `"Given the following nutrition label and user preferences, provide a concise health recommendation and suggest healthier alternatives if necessary. Nutrition: [nutrition_data]. Preferences: [user_preferences]."`

---

## 🚦 Optional Future Enhancements

- **OCR Support**: Scan nutrition labels using Optical Character Recognition.
- **Weekly Reports**: Summarize user intake and progress.
- **Health Tracking**: Integrate with wearable devices and health apps.
- **Voice Assistant**: Voice-driven scanning and feedback.
- **Recipe Suggestions**: Suggest recipes based on scanned foods.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [next-pwa](https://github.com/shadowwalker/next-pwa)
- [Gemini AI](https://ai.google.dev/gemini-api/docs)
- [Render](https://render.com/)
- [Vercel](https://vercel.com/)

---

## 👤 Authors

- **Amrinder Singh**
- **Priyam Ghosh** ([GitHub](https://github.com/PriGoisitc))
- **Ayaan Singh**
- **Jagrit Dharewa** ([GitHub](https://github.com/Jagrit3500))

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
