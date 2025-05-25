'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isNewUser: boolean; // True if user was just created in database
  hasProfile: boolean; // True if user has completed profile
  profileLoading: boolean; // True when checking profile status
  isReady: boolean; // True when auth is complete
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkProfile: () => Promise<void>; // Function to check profile status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Ready when auth is done
  const isReady = !loading;

  const checkProfile = async () => {
    if (!user || !firebaseUser) {
      setHasProfile(false);
      return;
    }

    setProfileLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${apiUrl}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('✅ User has profile');
        setHasProfile(true);
        setIsNewUser(false);
      } else {
        console.log('❌ User does not have profile');
        setHasProfile(false);
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setHasProfile(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth && signOut) {
        await signOut(auth);
      }
      setUser(null);
      setFirebaseUser(null);
      setIsNewUser(false);
      setHasProfile(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener');
    
    // Only set up auth listener if Firebase is initialized
    if (!auth) {
      console.log('❌ Firebase not initialized, skipping auth setup');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        console.log('👤 Firebase user details:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        });
        
        try {
          // Get ID token and authenticate with backend
          console.log('🎫 Getting Firebase token...');
          const token = await firebaseUser.getIdToken();
          console.log('✅ Firebase token obtained');
          
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          console.log('🌐 Backend API URL:', apiUrl);
          
          console.log('🔑 Authenticating with backend...');
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          console.log('🔑 Backend auth response:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend authentication successful:', {
              user: data.user,
              isNewUser: data.isNewUser
            });
            
            setUser(data.user);
            setIsNewUser(data.isNewUser);
            setHasProfile(!data.isNewUser); // If not new user, they have profile
          } else {
            const errorData = await response.text();
            console.error('❌ Backend authentication failed:', errorData);
            setUser(null);
            setIsNewUser(false);
            setHasProfile(false);
          }
        } catch (error) {
          console.error('❌ Error during authentication:', error);
          setUser(null);
          setIsNewUser(false);
          setHasProfile(false);
        }
      } else {
        console.log('👤 No Firebase user');
        setUser(null);
        setIsNewUser(false);
        setHasProfile(false);
      }
      
      setLoading(false);
      console.log('🏁 Auth state change processing completed');
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('📊 Auth state update:', {
      user: !!user,
      firebaseUser: !!firebaseUser,
      loading,
      isNewUser,
      hasProfile,
      profileLoading,
      isReady
    });
  }, [user, firebaseUser, loading, isNewUser, hasProfile, profileLoading, isReady]);

  const value = {
    user,
    firebaseUser,
    loading,
    isNewUser,
    hasProfile,
    profileLoading,
    isReady,
    logout,
    setUser,
    checkProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 