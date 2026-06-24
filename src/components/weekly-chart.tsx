'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
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

  const hasData = chartData.some(d => d.total_calories > 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Weekly Trend</h2>
        {hasData && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-4 h-0.5 border-t border-dashed border-slate-300" />
            <span>{calorieGoal.toLocaleString()} kcal goal</span>
          </div>
        )}
      </div>
      {!hasData ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-300">
              <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 mb-1">No data yet</p>
          <p className="text-xs text-slate-300">Start logging meals to see your weekly trend</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} kcal`, 'Calories']}
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullLabel;
                }
                return '';
              }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                padding: '8px 12px',
              }}
            />
            <ReferenceLine
              y={calorieGoal}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Bar dataKey="total_calories" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.total_calories > calorieGoal
                      ? '#ef4444'
                      : entry.isToday
                      ? '#10b981'
                      : '#a7f3d0'
                  }
                  opacity={entry.total_calories === 0 ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
