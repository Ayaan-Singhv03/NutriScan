# Firebase Setup Guide for NutriScan

## 🔥 Firebase Console Setup (NO Google Cloud Console needed)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `nutriscan` (or your preferred name)
4. Continue through setup (analytics optional)

### Step 2: Enable Google Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Sign-in method** tab
3. Click **Google** provider
4. Toggle **Enable**
5. Enter your email in "Project support email"
6. Click **Save**

### Step 3: Get Backend Credentials (Service Account)
1. Go to **Project Settings** (gear icon)
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Extract these values for your `.env`:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=value-from-json
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=value-from-json
   ```

### Step 4: Get Frontend Credentials (Web App)
1. Still in **Project Settings**
2. Click **General** tab
3. Scroll to "Your apps" section
4. Click **Web app** icon `</>`
5. Register app with nickname: `nutriscan-frontend`
6. Copy the config object for your frontend:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### Step 5: Configure Authorized Domains
1. Go to **Authentication** > **Settings** tab
2. Scroll to "Authorized domains"
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

## ✅ That's it! No Google Cloud Console needed.

## 🧪 Test Your Setup

### Backend Test:
```bash
# Create .env file with your values
npm start

# Test the auth endpoint
curl http://localhost:5000/api/auth/me
# Should return 401 (expected - no token provided)
```

### Frontend Integration:
```javascript
// In your React/Next.js app
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase-config';

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    
    // Send this token to your backend
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken })
    });
  } catch (error) {
    console.error('Sign-in error:', error);
  }
};
```

## 🚨 Common Issues & Solutions

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution:** Add your domain to Authorized domains in Firebase Console

### Issue: "Invalid private key"
**Solution:** Make sure private key in .env has proper newlines (`\n`)

### Issue: "Project not found"
**Solution:** Double-check FIREBASE_PROJECT_ID matches your Firebase project

## 🔒 Security Notes
- Keep your service account JSON file secure
- Never commit `.env` file to version control
- Use different Firebase projects for development and production 