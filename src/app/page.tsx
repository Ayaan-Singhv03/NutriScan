'use client';

import React from 'react';
import Link from 'next/link';
import { ScanBarcode, Bell } from 'lucide-react';
import DailyGoalCard from '@/components/DailyGoalCard';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const recentProducts = [
    { id: '1', name: 'Avocado Salad', calories: 330, tags: ['High Fiber'] },
    { id: '2', name: 'Yogurt', calories: 150, tags: ['High Sugar'] },
    { id: '3', name: 'Granola Bar', calories: 120, tags: ['High Fiber'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🥬</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">NutriScan</h1>
          </div>
          <Bell className="text-gray-600" size={24} />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        {/* Daily Goals */}
        <DailyGoalCard />

        {/* Scan Button */}
        <div className="flex justify-center">
          <Link 
            href="/scan"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <ScanBarcode size={32} />
          </Link>
        </div>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Scan Barcode</h2>
          <p className="text-gray-600">Scan any product to get nutritional information</p>
        </div>

        {/* Recent Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
            <Link href="/history" className="text-emerald-600 font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onClick={() => console.log('Navigate to product', product.id)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 