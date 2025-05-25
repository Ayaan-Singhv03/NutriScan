'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const { user, isNewUser, isReady } = useAuth();
  
  // Pages where we don't want to show the bottom navigation
  const hideNavPages = ['/login', '/onboarding', '/test-auth'];
  const shouldHideNav = hideNavPages.some(page => pathname.startsWith(page));
  
  // Only show navigation when user is authenticated and not a new user, and not on special pages
  const showBottomNav = isReady && user && !isNewUser && !shouldHideNav;

  return (
    <div className={`min-h-screen bg-gray-50 ${showBottomNav ? 'pb-20' : ''}`}>
      {children}
      {showBottomNav && <BottomNavigation />}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

export default Layout;
