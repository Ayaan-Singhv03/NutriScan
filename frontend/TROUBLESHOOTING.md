# Troubleshooting Guide - NutriScan Frontend

## 🚨 Common Issues and Solutions

### Issue: User Login Successful but No Redirect

If users can log in successfully but are not being redirected to the appropriate page, follow these steps:

#### 1. Check Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Copy the example file
cp env.example .env.local
```

Update `.env.local` with your actual values:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Firebase Configuration (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### 2. Verify Backend is Running

Make sure your backend server is running:

```bash
cd backend
npm start
```

The backend should be accessible at `http://localhost:5000`

#### 3. Test API Connectivity

Visit the debug page: `http://localhost:3000/test-auth`

This page will help you:
- Check environment variables
- Test backend connection
- Test API endpoints
- View authentication state

#### 4. Check Browser Console

Open browser developer tools (F12) and check the console for:
- Environment variable values
- API request/response logs
- Authentication state changes
- Error messages

#### 5. Common Error Messages and Solutions

**"Firebase: Error (auth/invalid-api-key)"**
- Solution: Update `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local`

**"Failed to fetch" or Network errors**
- Solution: Ensure backend is running on port 5000
- Check if `NEXT_PUBLIC_API_URL` is correct

**"Profile not found" but user exists**
- Solution: User needs to complete onboarding
- Check if profile was created in database

**Infinite loading or no redirect**
- Solution: Check console logs for authentication flow
- Verify `isReady` state becomes true

#### 6. Debug Authentication Flow

The authentication flow should follow this sequence:

1. **Firebase Authentication**: User signs in with Google
2. **Backend Authentication**: Firebase token sent to backend
3. **Profile Check**: Check if user has completed profile
4. **Redirect**: Based on profile status

Expected console logs:
```
🔥 Setting up Firebase auth listener
🔥 Auth state changed: User logged in
👤 Firebase user details: { uid: "...", email: "..." }
🎫 Getting Firebase token...
✅ Firebase token obtained
🌐 Backend API URL: http://localhost:5000
🔑 Authenticating with backend...
🔑 Backend auth response: { status: 200, ok: true }
✅ Backend authentication successful: { id: "...", email: "..." }
👤 User state changed: { user: true, firebaseUser: true }
🔍 User authenticated, checking profile...
🔍 Checking profile for user: ...
🎫 Got Firebase token for profile check
📋 Profile check response: { status: 404, ok: false }
❌ Profile not found: {"error":"Profile not found"}
🏁 Profile check completed
📊 Auth state update: { user: true, firebaseUser: true, loading: false, profileLoading: false, hasProfile: false, isReady: true }
```

#### 7. Manual Testing Steps

1. **Clear browser data**: Clear cookies, localStorage, and sessionStorage
2. **Restart development server**: Stop and restart `npm run dev`
3. **Check network tab**: Verify API calls are being made
4. **Test with different user**: Try with a fresh Google account

#### 8. Backend Database Check

Verify your backend database:

```bash
# Check if tables exist
curl http://localhost:5000/health

# Check if user was created after login
# Look for user in your database
```

#### 9. Firebase Configuration Check

In Firebase Console:
1. **Authentication > Sign-in method**: Ensure Google is enabled
2. **Authentication > Settings > Authorized domains**: Add `localhost`
3. **Project Settings > General**: Verify web app configuration

#### 10. Force Profile Check

If you suspect the profile check is failing, you can manually trigger it:

```javascript
// In browser console after login
window.location.href = '/test-auth';
```

Then use the "Test Profile Endpoint" button to see the exact response.

## 🔧 Quick Fixes

### Reset Authentication State

```bash
# Clear Next.js cache
rm -rf .next

# Restart development server
npm run dev
```

### Test Without Firebase

If Firebase is the issue, you can temporarily test with dummy data:

1. Comment out Firebase initialization in `src/lib/firebase.ts`
2. Manually set user state in AuthContext for testing

### Backend CORS Issues

If you see CORS errors, ensure your backend has proper CORS configuration:

```javascript
// In backend/server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check console logs**: Copy all console output
2. **Check network tab**: Look for failed API requests
3. **Test with debug page**: Visit `/test-auth` and share results
4. **Verify environment**: Ensure all environment variables are set

The most common issue is missing or incorrect environment variables. Double-check your `.env.local` file matches your Firebase project configuration. 