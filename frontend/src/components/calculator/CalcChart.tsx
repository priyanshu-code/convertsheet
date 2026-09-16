"use client";

import React, { memo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export interface ChartDataPoint {
  label: string;
  [key: string]: number | string;
}

export interface SeriesConfig {
  key: string;
  name: string;
  color: string;
  gradientId: string;
}

export interface CalcChartProps {
  title?: string;
  data: ChartDataPoint[];
  series: SeriesConfig[];
  xAxisKey?: string;
  valuePrefix?: string;
  height?: number;
}

export const CalcChart = memo(function CalcChart({
  title = "Growth & Projections Trajectory",
  data,
  series,
  xAxisKey = "label",
  valuePrefix = "₹",
  height = 300,
}: CalcChartProps) {
  // Prevent SSR hydration mismatch for Recharts dynamic SVG dimensions
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center text-xs text-zinc-400"
      >
        Loading interactive chart...
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 sm:p-6 space-y-4 shadow-xs">
      {title && (
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
      )}

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#71717A" }}
              interval="preserveStartEnd"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#71717A" }}
              tickFormatter={(val) => {
                if (val >= 10000000) return `${valuePrefix}${(val / 10000000).toFixed(1)}Cr`;
                if (val >= 100000) return `${valuePrefix}${(val / 100000).toFixed(1)}L`;
                if (val >= 1000) return `${valuePrefix}${(val / 1000).toFixed(0)}k`;
                return `${valuePrefix}${val}`;
              }}
              width={65}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(9, 13, 20, 0.95)",
                borderColor: "#27272A",
                borderRadius: "12px",
                color: "#F4F4F5",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
              }}
              formatter={(val: any) => [
                `${valuePrefix}${Number(val).toLocaleString("en-IN")}`,
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingTop: "0px" }}
            />

            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${s.gradientId})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
