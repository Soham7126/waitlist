'use client';

import { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import type { Customer } from '@/app/page';

interface AnalyticsTabProps {
  customers: Customer[];
}

const SOURCE_TYPES = ['Walk-in', 'Easy Diner', 'Swiggy Dineout', 'Zomato'] as const;

const COLORS: Record<string, string> = {
  'Walk-in': '#3b82f6',
  'Easy Diner': '#10b981',
  'Swiggy Dineout': '#f97316',
  'Zomato': '#ef4444',
};

function buildDailyData(customers: Customer[], days: number) {
  const today = startOfDay(new Date());
  const buckets: Record<string, Record<string, number>> = {};

  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(today, i));
    const key = format(day, 'yyyy-MM-dd');
    buckets[key] = { 'Walk-in': 0, 'Easy Diner': 0, 'Swiggy Dineout': 0, 'Zomato': 0 };
  }

  for (const c of customers) {
    const dayKey = format(startOfDay(new Date(c.addedAt)), 'yyyy-MM-dd');
    if (buckets[dayKey] && SOURCE_TYPES.includes(c.type as typeof SOURCE_TYPES[number])) {
      buckets[dayKey][c.type] = (buckets[dayKey][c.type] ?? 0) + 1;
    }
  }

  return Object.entries(buckets).map(([date, counts]) => ({
    date: format(new Date(date), 'MMM d'),
    ...counts,
  }));
}

const SummaryCard = memo(function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">total customers</span>
    </div>
  );
});

export default function AnalyticsTab({ customers }: AnalyticsTabProps) {
  const activeCustomers = useMemo(
    () => customers.filter((c) => c.status !== 'cancelled'),
    [customers]
  );

  const data30 = useMemo(() => buildDailyData(activeCustomers, 30), [activeCustomers]);

  const totals = useMemo(() => {
    const t: Record<string, number> = { 'Walk-in': 0, 'Easy Diner': 0, 'Swiggy Dineout': 0, 'Zomato': 0 };
    for (const c of activeCustomers) {
      if (t[c.type] !== undefined) t[c.type]++;
    }
    return t;
  }, [activeCustomers]);

  const totalAll = Object.values(totals).reduce((s, v) => s + v, 0);

  return (
    <div className="mt-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SOURCE_TYPES.map((type) => (
          <SummaryCard key={type} label={type} value={totals[type]} color={COLORS[type]} />
        ))}
      </div>

      {/* Percentage breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium mb-3 text-foreground">Overall Breakdown ({totalAll} total)</p>
        <div className="flex gap-1 h-4 rounded-full overflow-hidden">
          {SOURCE_TYPES.map((type) => {
            const pct = totalAll === 0 ? 0 : (totals[type] / totalAll) * 100;
            return pct > 0 ? (
              <div
                key={type}
                style={{ width: `${pct}%`, backgroundColor: COLORS[type] }}
                title={`${type}: ${pct.toFixed(1)}%`}
              />
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {SOURCE_TYPES.map((type) => {
            const pct = totalAll === 0 ? 0 : (totals[type] / totalAll) * 100;
            return (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: COLORS[type] }}
                />
                {type}: {pct.toFixed(1)}%
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily bar chart — last 30 days */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium mb-4 text-foreground">Daily Customers — Last 30 Days</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data30} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              stroke="var(--muted-foreground)"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SOURCE_TYPES.map((type) => (
              <Bar key={type} dataKey={type} stackId="a" fill={COLORS[type]} radius={type === 'Zomato' ? [4, 4, 0, 0] : undefined} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Last-updated note */}
      <p className="text-xs text-muted-foreground text-right">
        Data excludes cancelled bookings &middot; refreshes with the page
      </p>
    </div>
  );
}
