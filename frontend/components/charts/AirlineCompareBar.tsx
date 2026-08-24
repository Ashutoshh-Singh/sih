"use client";

import React from "react";
import { AirlineComparisonItem } from "../../types";

interface AirlineCompareBarProps {
  data: AirlineComparisonItem[];
}

export const AirlineCompareBar: React.FC<AirlineCompareBarProps> = ({ data }) => {
  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800/80">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          Normalized Airline Tariff Comparison
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Standardized across comparable booking windows and travel dates. Variances represent statistical dispersion from route median.
        </p>
      </div>

      <div className="space-y-4">
        {data.map((item, idx) => {
          const isHigher = item.diff_from_median_pct > 0;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700">
                    {item.airline_code}
                  </span>
                  <span className="font-semibold text-sm text-slate-200">
                    {item.airline_name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-mono text-white">
                    ₹{item.avg_fare?.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      isHigher
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {isHigher ? "+" : ""}
                    {item.diff_from_median_pct}%
                  </span>
                </div>
              </div>

              {/* Progress Distribution Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(30, (item.avg_fare / 8000) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Lowest Fare: <span className="font-mono text-slate-300 font-medium">₹{item.lowest_fare?.toLocaleString()}</span></span>
                <span>Highest: <span className="font-mono text-slate-300 font-medium">₹{item.highest_fare?.toLocaleString()}</span></span>
                <span>Observations: <span className="font-mono text-slate-300 font-medium">{item.observations_count}</span></span>
                <span>Confidence: <span className="text-teal-400 font-medium">{item.confidence}%</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
