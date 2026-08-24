"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { IndexHistoryItem } from "../../types";

interface IndexTrendChartProps {
  data: IndexHistoryItem[];
  currentRange: string;
  onRangeChange: (range: string) => void;
  isLoading?: boolean;
}

const RANGES = ["7D", "1M", "3M", "6M", "1Y"];

export const IndexTrendChart: React.FC<IndexTrendChartProps> = ({
  data,
  currentRange,
  onRangeChange,
  isLoading = false,
}) => {
  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800/80">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            National Airfare Price Index Trend
            <span className="text-xs font-mono font-normal text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
              Base: 100.00
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Weighted Laspeyres aggregations across all monitored Indian domestic corridors
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 self-start sm:self-auto">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentRange === r
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="w-full h-80">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 animate-pulse">
            Compiling statistical time-series...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.25)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => {
                  if (!val) return "";
                  const parts = val.split("-");
                  return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : val;
                }}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => Number(val).toFixed(1)}
              />
              <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 4" label={{ value: "Base 100", fill: "#94a3b8", fontSize: 10, position: "insideBottomRight" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as IndexHistoryItem;
                    return (
                      <div className="p-3 rounded-xl glass-panel-glow border border-slate-700 text-xs shadow-2xl space-y-1.5">
                        <div className="font-mono text-slate-400 font-semibold">{label}</div>
                        <div className="text-base font-bold text-sky-400 font-mono">
                          API: {d.index_value?.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <span>DoD: <span className={d.daily_change >= 0 ? "text-rose-400" : "text-emerald-400"}>{d.daily_change >= 0 ? "+" : ""}{d.daily_change?.toFixed(2)}%</span></span>
                          <span>•</span>
                          <span>MoM: <span className={d.monthly_change >= 0 ? "text-rose-400" : "text-emerald-400"}>{d.monthly_change >= 0 ? "+" : ""}{d.monthly_change?.toFixed(2)}%</span></span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Data Quality Confidence: <span className="text-teal-400 font-bold">{d.quality_score?.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="index_value"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#indexGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
