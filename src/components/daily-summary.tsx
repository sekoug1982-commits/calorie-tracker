'use client';

import { FoodEntry, MealType } from '@/types';

interface Props {
  entries: FoodEntry[];
  calorieGoal: number;
}

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const mealConfig: Record<MealType, { dot: string; bg: string; text: string }> = {
  Breakfast: { dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
  Lunch: { dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Dinner: { dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
  Snack: { dot: 'bg-purple-400', bg: 'bg-purple-50', text: 'text-purple-700' },
};

function getProgressColor(pct: number): string {
  if (pct > 100) return '#ef4444';
  if (pct > 85) return '#f97316';
  if (pct > 65) return '#f59e0b';
  return '#10b981';
}

export default function DailySummary({ entries, calorieGoal }: Props) {
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
  const totalCarbs = entries.reduce((sum, e) => sum + (e.carbs || 0), 0);
  const totalFat = entries.reduce((sum, e) => sum + (e.fat || 0), 0);

  const actualPct = (totalCalories / calorieGoal) * 100;
  const displayPct = Math.min(actualPct, 100);
  const isOver = totalCalories > calorieGoal;
  const remaining = calorieGoal - totalCalories;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - displayPct / 100);
  const progressColor = getProgressColor(actualPct);

  const mealBreakdown = mealTypes.map(type => ({
    type,
    calories: entries.filter(e => e.meal_type === type).reduce((sum, e) => sum + e.calories, 0),
    config: mealConfig[type],
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Donut Chart */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke={progressColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out animate-progress"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{totalCalories.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400">/ {calorieGoal.toLocaleString()} kcal</span>
            </div>
          </div>
          <p className="text-sm mt-2 text-center font-medium" style={{ color: progressColor }}>
            {isOver
              ? `${Math.abs(remaining).toLocaleString()} over goal`
              : `${remaining.toLocaleString()} remaining`}
          </p>
        </div>

        {/* Right side */}
        <div className="flex-1 w-full space-y-4">
          {/* Macros */}
          <div className="grid grid-cols-3 gap-2">
            <MacroBar label="Protein" value={totalProtein} color="#3b82f6" bgColor="bg-blue-50" textColor="text-blue-600" />
            <MacroBar label="Carbs" value={totalCarbs} color="#f59e0b" bgColor="bg-amber-50" textColor="text-amber-600" />
            <MacroBar label="Fat" value={totalFat} color="#f43f5e" bgColor="bg-rose-50" textColor="text-rose-600" />
          </div>

          {/* Meal breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mealBreakdown.map(({ type, calories, config }) => (
              <div key={type} className={`text-center p-2.5 rounded-xl ${config.bg} transition-all`}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  <span className={`text-[11px] font-medium ${config.text}`}>{type}</span>
                </div>
                <span className={`text-sm font-bold ${config.text}`}>{calories}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, value, color, bgColor, textColor }: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  textColor: string;
}) {
  const target = label === 'Fat' ? 65 : label === 'Protein' ? 50 : 250;
  const pct = Math.min((value / target) * 100, 100);

  return (
    <div className={`${bgColor} rounded-xl p-2.5 text-center`}>
      <div className={`text-[11px] font-medium ${value > 0 ? textColor : 'text-slate-400'} mb-0.5`}>{label}</div>
      <div className={`text-sm font-bold ${value > 0 ? textColor : 'text-slate-300'}`}>{value}g</div>
      <div className="mt-1.5 h-1 bg-white/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: value > 0 ? color : '#cbd5e1' }}
        />
      </div>
    </div>
  );
}
