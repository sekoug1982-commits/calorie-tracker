'use client';

import { FoodPreset } from '@/types';
import { foodPresets } from '@/db/seed';

interface Props {
  onSelect: (preset: FoodPreset) => void;
}

export default function FoodPresets({ onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Add</h2>
      <div className="flex flex-wrap gap-2">
        {foodPresets.map(preset => (
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-full hover:bg-orange-100 transition-colors border border-orange-100"
          >
            {preset.name}
            <span className="ml-1 text-orange-400 text-xs">{preset.calories}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
