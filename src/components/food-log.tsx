'use client';

import { FoodEntry, MealType } from '@/types';
import FoodEntryCard from './food-entry-card';

interface Props {
  entries: FoodEntry[];
  mealFilter: string;
  onMealFilterChange: (filter: string) => void;
  onDelete: (id: number) => void;
}

const mealOrder: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const mealConfig: Record<MealType, { dot: string; label: string; color: string }> = {
  Breakfast: { dot: 'bg-amber-400', label: 'Breakfast', color: 'text-amber-600' },
  Lunch: { dot: 'bg-emerald-400', label: 'Lunch', color: 'text-emerald-600' },
  Dinner: { dot: 'bg-blue-400', label: 'Dinner', color: 'text-blue-600' },
  Snack: { dot: 'bg-purple-400', label: 'Snack', color: 'text-purple-600' },
};

const filters: string[] = ['All', ...mealOrder];

export default function FoodLog({ entries, mealFilter, onMealFilterChange, onDelete }: Props) {
  const filtered = mealFilter === 'All'
    ? entries
    : entries.filter(e => e.meal_type === mealFilter);

  const grouped = mealFilter === 'All'
    ? mealOrder
        .map(type => ({
          type,
          config: mealConfig[type],
          entries: entries.filter(e => e.meal_type === type),
          totalCalories: entries.filter(e => e.meal_type === type).reduce((sum, e) => sum + e.calories, 0),
        }))
        .filter(g => g.entries.length > 0)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Food Log</h2>
        <span className="text-xs text-slate-400">{filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      {/* Filter pills */}
      <div className="relative mb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => onMealFilterChange(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                mealFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {filter === 'All' ? 'All Meals' : filter}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-300">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 mb-1">No meals logged yet</p>
          <p className="text-xs text-slate-300">Add your first meal using the form above</p>
        </div>
      ) : grouped ? (
        <div className="space-y-6">
          {grouped.map((group, gi) => (
            <div key={group.type} className={`animate-slide-in stagger-${gi + 1}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-2 h-2 rounded-full ${group.config.dot}`} />
                <h3 className={`text-sm font-semibold ${group.config.color}`}>{group.config.label}</h3>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">{group.totalCalories} kcal</span>
              </div>
              <div className="pl-4 divide-y divide-slate-50">
                {group.entries.map(entry => (
                  <FoodEntryCard key={entry.id} entry={entry} onDelete={onDelete} showMealBadge={false} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <FoodEntryCard key={entry.id} entry={entry} onDelete={onDelete} showMealBadge />
          ))}
        </div>
      )}
    </div>
  );
}
