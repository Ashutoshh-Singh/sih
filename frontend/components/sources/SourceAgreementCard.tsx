"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Database,
  Info,
  Server
} from "lucide-react";
import { apiService } from "../../services/api";
import { SourceAgreementData } from "../../types";

export const SourceAgreementCard: React.FC<{ routeCode?: string }> = ({
  routeCode = "DEL-BOM",
}) => {
  const [data, setData] = useState<SourceAgreementData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const parts = routeCode.split("-");
    const orig = parts[0] || "DEL";
    const dest = parts[1] || "BOM";

    apiService
      .getSourceAgreement(orig, dest, "D-30")
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading source agreement:", err))
      .finally(() => setIsLoading(false));
  }, [routeCode]);

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Multi-Source Data Validation
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              CROSS-CHANNEL CONCORD
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Cross-Source Fare Agreement & Concordance ({routeCode}, D-30 Economy)
          </h2>
          <p className="text-xs text-slate-400">
            Verifying tariff consistency across airline direct feeds, GDS-compatible adapters, and online travel aggregator adapters.
          </p>
        </div>

        {data && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Agreement Score</span>
              <span className="text-lg font-bold text-emerald-400">{data.agreement_score}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">Cross-Source Median Tariff</span>
            <span className="text-base font-bold text-white font-mono mt-0.5">
              ₹{data.median_fare.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">Maximum Channel Variance</span>
            <span className="text-base font-bold text-sky-400 font-mono mt-0.5">
              ±{data.max_deviation_pct.toFixed(2)}% (Within Bounds)
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">Suspicious Outlier Feeds</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              {data.suspicious_sources_flagged} Flagged
            </span>
          </div>
        </div>
      )}

      {/* Source Comparison Table */}
      {data && (
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Ingestion Channel Breakdown
          </span>
          <div className="rounded-xl border border-slate-800/80 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-3">Source Channel</th>
                  <th className="p-3">Source Type</th>
                  <th className="p-3 text-right">Base + Taxes</th>
                  <th className="p-3 text-right">Total Tariff</th>
                  <th className="p-3 text-right">Variance vs Median</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 font-mono">
                {data.tariffs.map((t, idx) => {
                  const fareVal = t.standardized_payable_fare ?? t.total_fare ?? (t.base_fare + t.taxes);
                  const diffVal = t.diff_from_median_pct ?? 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-white font-sans flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-sky-400" />
                        {t.source_name}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">{t.source_type}</td>
                      <td className="p-3 text-right text-slate-400">₹{(t.base_fare ?? 0).toLocaleString("en-IN")} + ₹{(t.taxes ?? 0).toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right font-bold text-white">₹{fareVal.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right text-sky-300">
                        {diffVal >= 0 ? "+" : ""}{diffVal.toFixed(2)}%
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Narrative Box */}
      {data && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
          <span className="text-sky-400 font-bold">Verification Finding: </span>
          {data.interpretation}
        </div>
      )}
    </div>
  );
};
