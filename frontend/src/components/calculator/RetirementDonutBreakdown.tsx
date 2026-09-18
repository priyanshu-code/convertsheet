"use client";

import React, { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface RetirementDonutProps {
  totalNestEgg: number;
  totalContributions: number;
  totalInterestEarned: number;
  employerMatchAmount?: number;
  retirementAge: number;
  className?: string;
}

export const RetirementDonutBreakdown = memo(function RetirementDonutBreakdown({
  totalNestEgg,
  totalContributions,
  totalInterestEarned,
  employerMatchAmount = 0,
  retirementAge,
  className = "",
}: RetirementDonutProps) {
  const data = [
    { name: "Personal Principal", value: Math.max(0, totalContributions), color: "#3b82f6" },
    { name: "Compound Growth", value: Math.max(0, totalInterestEarned), color: "#10b981" },
  ];

  if (employerMatchAmount > 0) {
    data.push({
      name: "Employer Match",
      value: Math.max(0, employerMatchAmount),
      color: "#14b8a6",
    });
  }

  const interestPercentage =
    totalNestEgg > 0
      ? Math.round((Math.max(0, totalInterestEarned) / totalNestEgg) * 100)
      : 0;

  return (
    <div
      role="region"
      aria-label="Nest Egg Distribution"
      className={`p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Nest Egg Distribution (Age {retirementAge})
        </h3>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
          {interestPercentage}% from Compounding
        </span>
      </div>

      <div className="relative h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(val: any) => [`$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Amount"]}
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "0.75rem",
                fontSize: "12px",
                color: "#fafafa",
              }}
            />
            <Pie
              data={data}
              innerRadius={78}
              outerRadius={104}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text - guaranteed to fit inside 156px inner diameter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Total at {retirementAge}
          </span>
          <span className="text-base sm:text-lg font-extrabold font-mono text-zinc-900 dark:text-zinc-50 leading-tight mt-0.5">
            ${Math.round(Math.max(0, totalNestEgg)).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                {item.name}
              </span>
            </div>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              ${item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
