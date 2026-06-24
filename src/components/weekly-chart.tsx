'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyTotal } from '@/types';
import { formatDateShort, formatDateLabel } from '@/lib/utils';

interface Props {
  data: DailyTotal[];
  calorieGoal: number;
  selectedDate: string;
}

export default function WeeklyChart({ data, calorieGoal, selectedDate }: Props) {
  const chartData = data.map(d => ({
    ...d,
    label: formatDateShort(d.date),
    fullLabel: formatDateLabel(d.date),
    isToday: d.date === selectedDate,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h2>
      {chartData.every(d => d.total_calories === 0) ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          No data for the past 7 days yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number) => [`${value} kcal`, 'Calories']}
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullLabel;
                }
                return '';
              }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
            />
            <Bar dataKey="total_calories" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.total_calories > calorieGoal ? '#ef4444' : entry.isToday ? '#f97316' : '#fdba74'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
