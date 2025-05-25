'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, firebaseUser, loading, isNewUser, isReady, logout } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const router = useRouter();

  const testEnvironmentVariables = () => {
    const envVars = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    
    console.log('Environment Variables:', envVars);
    setTestResults((prev: Record<string, any>) => ({ ...prev, envVars }));
  };

  const testBackendConnection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Testing backend connection to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      
      console.log('Backend health check:', data);
      setTestResults((prev: Record<string, any>) => ({ ...prev, backendHealth: data }));
    } catch (error: any) {
      console.error('Backend connection failed:', error);
      setTestResults((prev: Record<string, any>) => ({ ...prev, backendError: error.message }));
    }
  };

  const testProfileEndpoint = async () => {
    if (!firebaseUser) {
      setTestResults((prev: Record<string, any>) => ({ ...prev, profileTest: 'No Firebase user' }));
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${apiUrl}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        data: response.ok ? await response.json() : await response.text()
      };

      console.log('Profile endpoint test:', result);
      setTestResults((prev: Record<string, any>) => ({ ...prev, profileTest: result }));
    } catch (error: any) {
      console.error('Profile test failed:', error);
      setTestResults((prev: Record<string, any>) => ({ ...prev, profileTestError: error.message }));
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Logging out user...');
    await logout();
    setTestResults({});
    console.log('✅ Logout completed');
  };

  const clearBrowserData = () => {
    console.log('🧹 Clearing browser data...');
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies (basic approach)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('✅ Browser data cleared');
    setTestResults((prev: Record<string, any>) => ({ ...prev, browserDataCleared: 'Success' }));
  };

  const forceRefresh = () => {
    console.log('🔄 Force refreshing page...');
    window.location.reload();
  };

  const goToLogin = () => {
    console.log('🔐 Navigating to login page...');
    router.push('/login');
  };

  const goToHome = () => {
    console.log('🏠 Navigating to home page...');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Panel</CardTitle>
            <CardDescription>Test and debug the authentication flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testEnvironmentVariables} variant="outline">
                Test Environment Variables
              </Button>
              <Button onClick={testBackendConnection} variant="outline">
                Test Backend Connection
              </Button>
              <Button onClick={testProfileEndpoint} variant="outline" disabled={!firebaseUser}>
                Test Profile Endpoint
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Navigation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={goToLogin} variant="default">
                  Go to Login Page
                </Button>
                <Button onClick={goToHome} variant="outline">
                  Go to Home Page
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Authentication Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleLogout} variant="destructive" disabled={!firebaseUser}>
                  Logout User
                </Button>
                <Button onClick={clearBrowserData} variant="outline">
                  Clear Browser Data
                </Button>
                <Button onClick={forceRefresh} variant="outline">
                  Force Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Is New User:</strong> {isNewUser ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Is Ready:</strong> {isReady ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Firebase User:</strong> {firebaseUser ? 'Logged In' : 'Not Logged In'}
              </div>
              <div>
                <strong>Backend User:</strong> {user ? 'Authenticated' : 'Not Authenticated'}
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {firebaseUser && (
          <Card>
            <CardHeader>
              <CardTitle>Firebase User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>UID:</strong> {firebaseUser.uid}</div>
                <div><strong>Email:</strong> {firebaseUser.email}</div>
                <div><strong>Display Name:</strong> {firebaseUser.displayName}</div>
                <div><strong>Email Verified:</strong> {firebaseUser.emailVerified ? 'Yes' : 'No'}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Backend User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Created:</strong> {user.createdAt}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 