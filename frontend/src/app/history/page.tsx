'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem('nutritionLogs') || '[]');
    setLogs(savedLogs);
  }, []);

  const filteredLogs = logs.filter(log =>
    log.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">History</h1>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Content */}
      <main className="px-6 pb-6">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products scanned yet</h3>
            <p className="text-gray-600">Start scanning to build your nutrition history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => (
              <ProductCard 
                key={`${log.barcode || log.name || 'unknown'}-${index}`}
                id={log.barcode || log.name || `log-${index}`}
                name={log.name || 'Unknown Product'}
                image={log.image}
                calories={log.calories || 0}
                tags={log.tags}
                onClick={() => console.log('View product details')}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 