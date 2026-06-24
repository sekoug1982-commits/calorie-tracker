'use client';

import { useState, useEffect, useCallback } from 'react';
import { FoodEntry, FoodPreset, MealType, DailyTotal } from '@/types';
import { todayISO } from '@/lib/utils';
import DailySummary from '@/components/daily-summary';
import FoodPresets from '@/components/food-presets';
import FoodForm from '@/components/food-form';
import WeeklyChart from '@/components/weekly-chart';
import FoodLog from '@/components/food-log';

const CALORIE_GOAL = 2000;

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyTotal[]>([]);
  const [mealFilter, setMealFilter] = useState('All');
  const [prefill, setPrefill] = useState<FoodPreset | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/entries?date=${selectedDate}`);
    const data = await res.json();
    setEntries(data);
  }, [selectedDate]);

  const fetchWeeklyData = useCallback(async () => {
    const res = await fetch(`/api/entries?date=${selectedDate}&range=week`);
    const data: FoodEntry[] = await res.json();

    const dailyMap = new Map<string, number>();
    const end = new Date(selectedDate + 'T00:00:00');
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, 0);
    }

    data.forEach(entry => {
      const current = dailyMap.get(entry.date) || 0;
      dailyMap.set(entry.date, current + entry.calories);
    });

    const totals: DailyTotal[] = Array.from(dailyMap.entries()).map(([date, total_calories]) => ({
      date,
      total_calories,
    }));

    setWeeklyData(totals);
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEntries(), fetchWeeklyData()]).finally(() => setLoading(false));
  }, [fetchEntries, fetchWeeklyData]);

  async function handleAddEntry(entry: {
    food_name: string;
    calories: number;
    meal_type: MealType;
    serving_size: string;
    date: string;
  }) {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (res.ok) {
      await Promise.all([fetchEntries(), fetchWeeklyData()]);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await Promise.all([fetchEntries(), fetchWeeklyData()]);
    }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Calorie Tracker</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            <DailySummary entries={entries} calorieGoal={CALORIE_GOAL} />
            <FoodPresets onSelect={setPrefill} />
            <FoodForm
              selectedDate={selectedDate}
              prefill={prefill}
              onSubmit={handleAddEntry}
              onClearPrefill={() => setPrefill(null)}
            />
            <WeeklyChart data={weeklyData} calorieGoal={CALORIE_GOAL} selectedDate={selectedDate} />
            <FoodLog
              entries={entries}
              mealFilter={mealFilter}
              onMealFilterChange={setMealFilter}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </main>
  );
}
