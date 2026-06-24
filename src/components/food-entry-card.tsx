'use client';

import { FoodEntry, MealType } from '@/types';
import { formatTime } from '@/lib/utils';

interface Props {
  entry: FoodEntry;
  onDelete: (id: number) => void;
  showMealBadge?: boolean;
}

const mealBadgeColors: Record<MealType, string> = {
  Breakfast: 'bg-amber-50 text-amber-600',
  Lunch: 'bg-emerald-50 text-emerald-600',
  Dinner: 'bg-blue-50 text-blue-600',
  Snack: 'bg-purple-50 text-purple-600',
};

export default function FoodEntryCard({ entry, onDelete, showMealBadge = true }: Props) {
  const hasMacros = (entry.protein || 0) > 0 || (entry.carbs || 0) > 0 || (entry.fat || 0) > 0;

  return (
    <div className="group flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-slate-900 truncate">{entry.food_name}</span>
          <span className="text-sm font-semibold text-emerald-600">{entry.calories} kcal</span>
          {showMealBadge && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mealBadgeColors[entry.meal_type]}`}>
              {entry.meal_type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          <span>{entry.serving_size}</span>
          <span className="text-slate-200">&middot;</span>
          <span>{formatTime(entry.created_at)}</span>
          {hasMacros && (
            <>
              <span className="text-slate-200">&middot;</span>
              <span className="text-blue-400">P:{entry.protein || 0}g</span>
              <span className="text-amber-400">C:{entry.carbs || 0}g</span>
              <span className="text-rose-400">F:{entry.fat || 0}g</span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="ml-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
        aria-label={`Delete ${entry.food_name}`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
