# Frontend Setup Guide - NutriScan

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
1. Copy the environment example file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Firebase configuration:
   - Get Firebase config from Firebase Console > Project Settings > Web App
   - Make sure your backend API is running on `http://localhost:5000`

### 3. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔐 Authentication Flow

### Login Process
1. **Root Route (`/`)**: Automatically redirects based on authentication status
2. **Login Page (`/login`)**: Google OAuth authentication
3. **Onboarding (`/onboarding`)**: Profile setup for new users
4. **Dashboard (`/dashboard`)**: Main app for authenticated users with profiles

### User Journey
```
New User:     / → /login → /onboarding → /dashboard
Existing User: / → /login → /dashboard
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Emerald (500-600) and Teal (500-600)
- **Background**: Gradient from emerald-50 to teal-50
- **Cards**: White with backdrop blur and transparency

### Animations
- **Loading Spinners**: Smooth rotation
- **Buttons**: Hover effects and scale transforms
- **Background**: Animated gradient orbs
- **Icons**: Hover scale effects

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly buttons

## 🧩 Components Structure

### Authentication
- `AuthContext`: Global authentication state
- `useAuth`: Hook for accessing auth state

### Pages
- `LoginPage`: Google OAuth with professional UI
- `OnboardingPage`: Multi-step profile creation form
- `DashboardPage`: User overview with profile and goals

### UI Components
- Uses Radix UI primitives
- Custom icons with Lucide React
- Tailwind CSS for styling

## 🔧 Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firebase Setup
1. Create a Firebase project
2. Enable Google Authentication
3. Add your domain to authorized domains
4. Get web app configuration
5. Update environment variables

## 🔄 API Integration

### Authentication Endpoints
- `POST /api/auth/login`: Authenticate with Firebase token
- `GET /api/auth/me`: Get current user info

### Profile Endpoints
- `GET /api/profile`: Get user profile
- `POST /api/profile`: Create user profile
- `PUT /api/profile`: Update user profile

### Goals Endpoints
- `GET /api/daily-goals`: Get calculated daily nutrition goals

## 🎯 Features

### Current Features
- ✅ Google OAuth Authentication
- ✅ Multi-step onboarding
- ✅ Profile management
- ✅ Dashboard with user info
- ✅ Responsive design
- ✅ Professional animations

### Planned Features
- 🔄 Food scanning
- 🔄 Nutrition tracking
- 🔄 Progress analytics
- 🔄 Goal management

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Authentication Error**
   - Check if domains are authorized in Firebase Console
   - Verify environment variables are correct

2. **API Connection Error**
   - Ensure backend is running on port 5000
   - Check CORS configuration in backend

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors with `npm run lint`

## 📱 Mobile Support

The application is optimized for mobile devices with:
- Touch-friendly interfaces
- Responsive layouts
- Mobile-first design approach
- PWA capabilities (configured in `next.config.mjs`)

## 🔒 Security

- Environment variables for sensitive configuration
- Secure token handling with Firebase
- No sensitive data in client-side code
- HTTPS enforcement in production 