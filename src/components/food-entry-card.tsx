'use client';

import { FoodEntry } from '@/types';
import { formatTime } from '@/lib/utils';

interface Props {
  entry: FoodEntry;
  onDelete: (id: number) => void;
}

export default function FoodEntryCard({ entry, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{entry.food_name}</span>
          <span className="text-sm font-semibold text-orange-600">{entry.calories} kcal</span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
            {entry.meal_type}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{entry.serving_size}</span>
          <span>&middot;</span>
          <span>{formatTime(entry.created_at)}</span>
        </div>
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="ml-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        aria-label={`Delete ${entry.food_name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
