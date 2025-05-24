'use client';

import React from 'react';

interface NutrientGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

const DailyGoalCard = () => {
  const goals: NutrientGoal[] = [
    { name: 'Protein', current: 147, target: 160, unit: 'g', color: 'bg-blue-500' },
    { name: 'Carbs', current: 108, target: 250, unit: 'g', color: 'bg-emerald-500' },
    { name: 'Fats', current: 39, target: 70, unit: 'g', color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
      <h2 className="text-xl font-bold mb-4">Daily Goal</h2>
      <div className="space-y-4">
        {goals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100;
          return (
            <div key={goal.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{goal.name}</span>
                <span className="text-sm opacity-90">
                  {goal.current} / {goal.target} {goal.unit}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${goal.color}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyGoalCard;
