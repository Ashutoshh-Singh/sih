"use client";

import React from "react";
import { RouteContributor } from "../../types";

interface BasketWeightTableProps {
  routes: any[];
}

export const BasketWeightTable: React.FC<BasketWeightTableProps> = ({ routes }) => {
  return (
    <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-panel">
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">
            Representative Air Corridor Basket (Weighted Laspeyres Specification)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Base Representative Fares indexed against benchmark statistical period (100.0)
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
          Σ Weights = 100.0%
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-slate-800">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Route Corridor</th>
              <th className="px-4 py-3 text-right">Current Fare</th>
              <th className="px-4 py-3 text-right">Base Fare</th>
              <th className="px-4 py-3 text-right">Price Relative</th>
              <th className="px-4 py-3 text-right">Basket Weight</th>
              <th className="px-4 py-3 text-right">Route Index</th>
              <th className="px-4 py-3 text-right">Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/30 text-slate-300">
            {routes.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-white">
                  {r.origin_city || r.route_code.split("-")[0]} → {r.destination_city || r.route_code.split("-")[1]}{" "}
                  <span className="font-mono text-xs text-sky-400">({r.route_code || r.route})</span>
                </td>
                <td className="px-4 py-3 font-mono text-right text-white font-bold">
                  ₹{r.current_fare?.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-right text-slate-400">
                  ₹{r.base_fare?.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-right text-sky-300 font-semibold">
                  {r.price_relative?.toFixed(4)}
                </td>
                <td className="px-4 py-3 font-mono text-right text-slate-200">
                  {r.weight_pct || r.weight}%
                </td>
                <td className="px-4 py-3 font-mono text-right font-bold text-white">
                  {r.route_index?.toFixed(2)}
                </td>
                <td className="px-4 py-3 font-mono text-right font-bold">
                  <span className={r.contribution >= 0 ? "text-rose-400" : "text-emerald-400"}>
                    {r.contribution >= 0 ? "+" : ""}{r.contribution?.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
