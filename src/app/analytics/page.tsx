'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('Daily');

  const calorieData = [
    { day: 'Mo', calories: 1750 },
    { day: 'Tu', calories: 1820 },
    { day: 'We', calories: 1780 },
    { day: 'Th', calories: 1850 },
    { day: 'F', calories: 1790 },
    { day: 'Sa', calories: 1920 },
    { day: 'S', calories: 1680 },
  ];

  const macroData = [
    { name: 'Protein', value: 25, color: '#3b82f6' },
    { name: 'Carbs', value: 45, color: '#f59e0b' },
    { name: 'Fats', value: 30, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
      </header>

      {/* Timeframe Selector */}
      <div className="px-6 py-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['Daily', 'Weekly', 'Monthly'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-6 pb-6 space-y-6">
        {/* Calorie Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calorie Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1,800</div>
              <div className="text-sm text-gray-600">Avg Daily</div>
            </div>
          </div>
        </div>

        {/* Macro Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Macro Distribution</h3>
          <div className="flex items-center justify-between">
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex-1 ml-6 space-y-2">
              {macroData.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: macro.color }}
                    ></div>
                    <span className="text-sm font-medium">{macro.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{macro.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestion Card */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Suggestion</h3>
          <p className="text-gray-700">
            Consider adding more fiber today. Your current intake is below the recommended daily value.
          </p>
        </div>
      </main>
    </div>
  );
} 