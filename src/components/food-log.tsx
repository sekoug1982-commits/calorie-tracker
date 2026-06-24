'use client';

import { FoodEntry, MealType } from '@/types';
import FoodEntryCard from './food-entry-card';

interface Props {
  entries: FoodEntry[];
  mealFilter: string;
  onMealFilterChange: (filter: string) => void;
  onDelete: (id: number) => void;
}

const mealTypes: (MealType | 'All')[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function FoodLog({ entries, mealFilter, onMealFilterChange, onDelete }: Props) {
  const filtered = mealFilter === 'All'
    ? entries
    : entries.filter(e => e.meal_type === mealFilter);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Food Log</h2>
        <select
          value={mealFilter}
          onChange={(e) => onMealFilterChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {mealTypes.map(type => (
            <option key={type} value={type}>{type === 'All' ? 'All Meals' : type}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            No entries yet. Add your first meal above!
          </p>
        ) : (
          filtered.map(entry => (
            <FoodEntryCard key={entry.id} entry={entry} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
