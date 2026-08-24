"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  HelpCircle,
  Calculator,
  FileText,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { apiService } from "../../services/api";
import { ExplainMetricData } from "../../types";
import { Badge } from "../ui/Badge";

interface ExplainNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: "national_index" | "route_index" | "data_quality" | "cpi_simulation" | string;
  routeCode?: string;
  customTitle?: string;
}

export const ExplainNumberModal: React.FC<ExplainNumberModalProps> = ({
  isOpen,
  onClose,
  metricType,
  routeCode,
  customTitle,
}) => {
  const [data, setData] = useState<ExplainMetricData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      apiService
        .getExplainMetric(metricType, routeCode)
        .then((res) => setData(res))
        .catch((err) => console.error("Error fetching explanation:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, metricType, routeCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border border-sky-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {customTitle || data?.metric_name || "Explain This Statistical Number"}
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Deterministic mathematical attribution & methodology
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Decomposing statistical formula...</p>
            </div>
          ) : data ? (
            <>
              {/* Value & Reference Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 to-slate-900/60 border border-sky-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold block">
                    Calculated Statistical Value
                  </span>
                  <div className="text-3xl font-black text-white font-mono mt-1">
                    {data.value_display}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Baseline Reference: {data.baseline_reference}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Confidence Tier</span>
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-mono font-bold">
                    {data.data_confidence_tier}
                  </span>
                </div>
              </div>

              {/* Natural Language Narrative */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Deterministic Attribution Analysis
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {data.deterministic_narrative}
                </p>
              </div>

              {/* Mathematical Formula Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-xs space-y-1">
                <span className="text-[10px] uppercase text-slate-500 block">Compilation Formula:</span>
                <div className="text-sky-300 font-bold text-sm">
                  {data.calculation_formula}
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  {data.methodology_note}
                </p>
              </div>

              {/* Components Breakdown Table */}
              {data.components_breakdown && data.components_breakdown.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Primary Mathematical Components
                  </span>
                  <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
                        <tr>
                          <th className="p-2.5">Driver / Factor</th>
                          <th className="p-2.5 text-right">Parameter / Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                        {data.components_breakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="p-2.5 text-slate-200 font-medium">
                              {item.name || item.component || item.factor || JSON.stringify(item)}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-sky-400">
                              {item.contribution_pts || item.value || item.score || ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              Unable to load statistical breakdown.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Prototype Methodology v1.0 • MoSPI-Configurable</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
