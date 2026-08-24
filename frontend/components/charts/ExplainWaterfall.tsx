"use client";

import React from "react";
import { Sparkles, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { RouteContributor } from "../../types";

interface ExplainWaterfallProps {
  nationalIndex: number;
  monthlyChange: number;
  positiveContributors: RouteContributor[];
  negativeContributors: RouteContributor[];
  summaryText: string;
}

export const ExplainWaterfall: React.FC<ExplainWaterfallProps> = ({
  nationalIndex,
  monthlyChange,
  positiveContributors,
  negativeContributors,
  summaryText,
}) => {
  const diffVsBase = nationalIndex - 100.0;

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800/80 space-y-6">
      {/* Header & Overall movement summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-100">
              Deterministic Index Decomposition vs Base (100.00)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact mathematical attribution of index movement across monitored aviation corridors relative to benchmark baseline
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 self-start sm:self-auto">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-mono">
              National API
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {nationalIndex.toFixed(2)}
            </span>
          </div>
          <div className="border-l border-slate-700/60 pl-3">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-mono">
              vs Base 100
            </span>
            <span className="text-sm font-bold font-mono text-sky-300">
              +{diffVsBase.toFixed(2)} pts
            </span>
          </div>
          <div className="border-l border-slate-700/60 pl-3">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-mono">
              MoM Shift
            </span>
            <span
              className={`text-sm font-bold font-mono flex items-center ${
                monthlyChange >= 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {monthlyChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {monthlyChange >= 0 ? "+" : ""}
              {monthlyChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Natural Language Explanation Box */}
      <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 text-slate-200 text-xs leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-300 block mb-1">
            Statistical Movement Analysis (Auditable Rule-Based):
          </span>
          {summaryText}
        </div>
      </div>

      {/* Top Positive & Negative Contributor Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Contributors */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Top Upward Pressure Corridors vs Base (+ pts)
          </div>
          <div className="space-y-2.5">
            {positiveContributors.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">
                    {c.origin_city} → {c.destination_city}{" "}
                    <span className="font-mono text-slate-400">({c.route})</span>
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    +{c.contribution?.toFixed(2)} pts
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, (c.contribution / 2.0) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>Basket Weight: <span className="text-slate-300 font-mono">{c.weight}%</span></span>
                  <span>Route Index: <span className="text-slate-300 font-mono">{c.route_index?.toFixed(1)}</span></span>
                  <span>Fare: <span className="text-slate-300 font-mono">₹{c.current_fare?.toLocaleString()}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Contributors / Softening Corridors */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Softening Corridors vs Base (- pts)
          </div>
          <div className="space-y-2.5">
            {negativeContributors.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                All monitored corridors registered positive price relatives vs base benchmark for this statistical cycle.
              </div>
            ) : (
              negativeContributors.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">
                      {c.origin_city} → {c.destination_city}{" "}
                      <span className="font-mono text-slate-400">({c.route})</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {c.contribution?.toFixed(2)} pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(c.contribution / 2.0) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>Basket Weight: <span className="text-slate-300 font-mono">{c.weight}%</span></span>
                    <span>Route Index: <span className="text-slate-300 font-mono">{c.route_index?.toFixed(1)}</span></span>
                    <span>Fare: <span className="text-slate-300 font-mono">₹{c.current_fare?.toLocaleString()}</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Route vs National Attribution Clarification */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono">
        <span className="font-bold text-slate-300">Methodological Note: </span>
        Route contribution attribution shown here is relative to the base period benchmark (100.00). Month-over-month movement is calculated separately at the national aggregated index level.
      </div>
    </div>
  );
};
