'use client';

import React from 'react';
import BottomNavigation from './BottomNavigation';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      <BottomNavigation />
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
