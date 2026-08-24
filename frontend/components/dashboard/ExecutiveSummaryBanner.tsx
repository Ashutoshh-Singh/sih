"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  GitFork,
  Calculator,
  Printer,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { apiService } from "../../services/api";
import { IndexExplanation } from "../../types";

interface ExecutiveSummaryBannerProps {
  nationalIndex?: number;
  monthlyMovement?: number;
  qualityScore?: number;
  onOpenExplain?: () => void;
  onOpenLineage?: () => void;
  onOpenExport?: () => void;
}

export const ExecutiveSummaryBanner: React.FC<ExecutiveSummaryBannerProps> = ({
  nationalIndex = 118.42,
  monthlyMovement = 2.84,
  qualityScore = 98.8,
  onOpenExplain,
  onOpenLineage,
  onOpenExport,
}) => {
  const [contributors, setContributors] = useState<IndexExplanation | null>(null);

  useEffect(() => {
    apiService.getIndexContributors()
      .then(setContributors)
      .catch(console.warn);
  }, []);

  const top3 = contributors?.top_positive_contributors?.slice(0, 3) || [];
  const top3Text = top3.length > 0
    ? top3.map((c) => `${c.origin_city}–${c.destination_city} (+${c.contribution.toFixed(2)} pts)`).join(", ")
    : "Key metropolitan trunk corridors";

  const totalPositiveSum = contributors?.top_positive_contributors?.reduce((acc, c) => acc + c.contribution, 0) || 1.0;
  const top3Sum = top3.reduce((acc, c) => acc + c.contribution, 0);
  const sharePct = totalPositiveSum > 0 ? Math.round((top3Sum / totalPositiveSum) * 100) : 58;

  const negativeRoutes = contributors?.top_negative_contributors || [];
  const softeningText = negativeRoutes.length > 0
    ? `${negativeRoutes[0].origin_city}–${negativeRoutes[0].destination_city} recorded the primary softening (${negativeRoutes[0].contribution.toFixed(2)} pts).`
    : "No monitored corridors recorded a decline vs base during this period.";

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 border border-sky-500/30 shadow-panel space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              MoSPI Statistical Executive Brief
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Deterministic macroeconomic summary • Base Period 100.00
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenExplain && (
            <button
              onClick={onOpenExplain}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono font-bold transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              Explain Breakdown
            </button>
          )}
          {onOpenLineage && (
            <button
              onClick={onOpenLineage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold transition-colors"
            >
              <GitFork className="w-3.5 h-3.5" />
              Inspect Lineage
            </button>
          )}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Export Brief
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-200 leading-relaxed font-normal">
        The National Airfare Price Index currently stands at{" "}
        <span className="font-bold text-white font-mono">{nationalIndex.toFixed(2)}</span>, reflecting a{" "}
        <span className="font-bold text-sky-400 font-mono">
          +{(nationalIndex - 100.0).toFixed(2)} index point change vs Base (100.00)
        </span>{" "}
        and{" "}
        <span className="font-bold text-sky-300 font-mono">
          {monthlyMovement >= 0 ? "+" : ""}{monthlyMovement.toFixed(2)}% MoM
        </span>.{" "}
        <span className="text-slate-300">
          {top3Text} were the largest positive upward contributors relative to base, accounting for {sharePct}% of total positive contribution. {softeningText}
        </span>{" "}
        Pipeline data quality confidence remains high at{" "}
        <span className="font-bold text-emerald-400 font-mono">{qualityScore.toFixed(1)}%</span>{" "}
        with benchmark outlier observations automatically quarantined from compilation.
      </p>
    </div>
  );
};
