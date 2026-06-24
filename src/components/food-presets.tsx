'use client';

import { useState } from 'react';
import { FoodPreset } from '@/types';
import { foodPresets } from '@/db/seed';

interface Props {
  onSelect: (preset: FoodPreset) => void;
}

export default function FoodPresets({ onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visiblePresets = expanded ? foodPresets : foodPresets.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">Quick Add</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {expanded ? 'Show less' : `Show all ${foodPresets.length}`}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {visiblePresets.map(preset => (
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            className="group px-3 py-2 text-sm bg-slate-50 text-slate-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-100 hover:border-emerald-200"
          >
            <span className="font-medium">{preset.name}</span>
            <span className="ml-1.5 text-slate-400 text-xs group-hover:text-emerald-500 transition-colors">{preset.calories}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
