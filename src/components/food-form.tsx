'use client';

import { useState } from 'react';
import { MealType } from '@/types';

interface Props {
  selectedDate: string;
  prefill: { name: string; calories: number; serving_size: string } | null;
  onSubmit: (entry: {
    food_name: string;
    calories: number;
    meal_type: MealType;
    serving_size: string;
    date: string;
  }) => void;
  onClearPrefill: () => void;
}

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function FoodForm({ selectedDate, prefill, onSubmit, onClearPrefill }: Props) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [servingSize, setServingSize] = useState('');

  const displayName = prefill ? prefill.name : foodName;
  const displayCalories = prefill ? String(prefill.calories) : calories;
  const displayServing = prefill ? prefill.serving_size : servingSize;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = prefill ? prefill.name : foodName;
    const cal = prefill ? prefill.calories : Number(calories);
    const serving = prefill ? prefill.serving_size : servingSize;

    if (!name || !cal || !serving) return;

    onSubmit({
      food_name: name,
      calories: cal,
      meal_type: mealType,
      serving_size: serving,
      date: selectedDate,
    });

    setFoodName('');
    setCalories('');
    setServingSize('');
    onClearPrefill();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Log a Meal</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Food Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => { setFoodName(e.target.value); onClearPrefill(); }}
            placeholder="e.g., Chicken Breast"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Calories</label>
          <input
            type="number"
            value={displayCalories}
            onChange={(e) => { setCalories(e.target.value); onClearPrefill(); }}
            placeholder="e.g., 165"
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Meal Type</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            {mealTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Serving Size</label>
          <input
            type="text"
            value={displayServing}
            onChange={(e) => { setServingSize(e.target.value); onClearPrefill(); }}
            placeholder="e.g., 100g"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
      >
        Add Entry
      </button>
    </form>
  );
}
