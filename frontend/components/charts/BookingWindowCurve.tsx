"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BookingWindowStat } from "../../types";

interface BookingWindowCurveProps {
  data: BookingWindowStat[];
}

export const BookingWindowCurve: React.FC<BookingWindowCurveProps> = ({ data }) => {
  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Fare Behaviour by Booking Lead Time
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparisons are normalized across consistent booking windows to improve time-series comparability
          </p>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.25)" vertical={false} />
            <XAxis dataKey="window" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} />
            <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as BookingWindowStat;
                  return (
                    <div className="p-3 rounded-xl glass-panel-glow border border-slate-700 text-xs shadow-2xl space-y-1">
                      <div className="font-bold text-sky-400 text-sm">{d.window} (Lead Time)</div>
                      <div className="text-slate-200 font-mono">Average Fare: <span className="font-bold text-white">₹{d.avg_fare?.toLocaleString()}</span></div>
                      <div className="text-slate-400 font-mono">Range: ₹{d.lowest_fare?.toLocaleString()} – ₹{d.highest_fare?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 pt-1">Sample Count: {d.sample_count} observations</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="avg_fare" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => {
                // Warmer color as lead time tightens to D-1
                const colors = ["#0284c7", "#0ea5e9", "#38bdf8", "#06b6d4", "#f59e0b", "#f97316", "#f43f5e"];
                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 border-t border-slate-800/80 pt-3">
        {data.map((d, i) => (
          <div key={i}>
            <span className="font-mono block text-slate-300 font-semibold">₹{d.avg_fare?.toLocaleString()}</span>
            <span className="text-slate-500 text-[9px]">{d.window}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
