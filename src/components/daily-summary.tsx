'use client';

import { FoodEntry, MealType } from '@/types';

interface Props {
  entries: FoodEntry[];
  calorieGoal: number;
}

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const mealColors: Record<MealType, string> = {
  Breakfast: 'bg-yellow-100 text-yellow-700',
  Lunch: 'bg-green-100 text-green-700',
  Dinner: 'bg-blue-100 text-blue-700',
  Snack: 'bg-purple-100 text-purple-700',
};

export default function DailySummary({ entries, calorieGoal }: Props) {
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const percentage = Math.min((totalCalories / calorieGoal) * 100, 100);
  const isOver = totalCalories > calorieGoal;

  const mealBreakdown = mealTypes.map(type => ({
    type,
    calories: entries.filter(e => e.meal_type === type).reduce((sum, e) => sum + e.calories, 0),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Daily Summary</h2>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-3xl font-bold ${isOver ? 'text-red-500' : 'text-gray-900'}`}>
          {totalCalories.toLocaleString()}
        </span>
        <span className="text-gray-400 text-sm">/ {calorieGoal.toLocaleString()} kcal</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 mb-1">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-orange-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {isOver
          ? `${(totalCalories - calorieGoal).toLocaleString()} kcal over goal`
          : `${(calorieGoal - totalCalories).toLocaleString()} kcal remaining`}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {mealBreakdown.map(({ type, calories }) => (
          <div key={type} className={`text-center p-2 rounded-lg ${mealColors[type]}`}>
            <div className="text-xs font-medium">{type}</div>
            <div className="text-sm font-bold">{calories}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
