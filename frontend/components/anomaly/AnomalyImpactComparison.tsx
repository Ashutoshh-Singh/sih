"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { KpiCard } from "../ui/KpiCard";
import { Badge } from "../ui/Badge";
import { apiService } from "../../services/api";

export const AnomalyImpactComparison: React.FC = () => {
  const [includeAnomaly, setIncludeAnomaly] = useState<boolean>(false);
  const [impactData, setImpactData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    apiService.getSummary().then(setSummary).catch(console.warn);
    apiService.simulateAnomalyImpact(1).then(setImpactData).catch(console.warn);
  }, []);

  const baseNatIndex = summary?.index || 118.42;
  const delta = impactData?.national_impact_delta || 0.003;
  const nationalIndex = includeAnomaly ? baseNatIndex + delta : baseNatIndex;
  const repFare = includeAnomaly ? (impactData?.route_fare_with || 6425) : (impactData?.route_fare_without || 6420);
  const routeIndex = includeAnomaly ? 122.8 : 122.5;
  const contributionPts = includeAnomaly ? 1.48 : 1.46;

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-6 relative overflow-hidden">
      {/* Background ambient glow based on state */}
      <div
        className={`absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          includeAnomaly ? "bg-red-500/10" : "bg-emerald-500/10"
        }`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Quality Control Impact Demonstration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              SIMULATION BENCHMARK
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Impact of Anomalous Observations on National Airfare Index
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Simulate how a single unverified outlier observation would affect national statistical compilation if included.
          </p>
        </div>

        {/* Interactive Toggle Control */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold text-slate-300">
            {includeAnomaly ? "Anomaly Included (Raw)" : "Quarantined by QC (Official)"}
          </span>
          <button
            onClick={() => setIncludeAnomaly(!includeAnomaly)}
            className={`transition-colors flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
              includeAnomaly
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            }`}
          >
            {includeAnomaly ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {includeAnomaly ? "RAW STATE" : "QC CLEAN"}
          </button>
        </div>
      </div>

      {/* Case Study Card */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block">Flagged Corridor</span>
          <span className="text-sm font-bold text-white">DEL → GOI (Delhi to Goa)</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Expected Corridor Range</span>
          <span className="text-sm font-bold text-slate-300">₹5,000 – ₹8,000</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Suspicious Observed Tariff</span>
          <span className="text-sm font-bold text-red-400">₹19,850 (D-15 Booking)</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Isolation Forest Score</span>
          <span className="text-sm font-bold text-amber-400">-0.782 (Severe Outlier)</span>
        </div>
      </div>

      {/* Side-by-Side Impact Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="National Airfare Price Index"
          value={nationalIndex.toFixed(3)}
          subtitle={includeAnomaly ? `Distorted (+${delta.toFixed(3)} pts artifact)` : "Clean Baseline Index"}
          changeType={includeAnomaly ? "negative" : "neutral"}
          highlight={includeAnomaly}
          badge={includeAnomaly ? "DISTORTED" : "QC CLEAN"}
        />
        <KpiCard
          title="DEL → GOI Representative Fare"
          value={`₹${repFare.toLocaleString("en-IN")}`}
          subtitle={includeAnomaly ? "Shifted by unverified fare" : "Robust trimmed mean"}
          changeType={includeAnomaly ? "negative" : "neutral"}
        />
        <KpiCard
          title="Corridor Index Contribution"
          value={`+${contributionPts.toFixed(2)} pts`}
          subtitle={includeAnomaly ? "Includes quarantined tariff" : "Valid statistical weight"}
          changeType="positive"
        />
      </div>

      {/* Policy Takeaway Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">
            Methodology Robustness & Quality Control:
          </span>
          <p className="text-slate-300 leading-relaxed font-normal">
            Automated machine learning outlier screening (Isolation Forest + IQR distribution filtering) flags severe deviations like ₹19,850. The limited national impact (+{delta.toFixed(3)} index points) demonstrates the statistical resilience of the trimmed-mean representative-fare methodology against isolated outliers.
          </p>
        </div>
      </div>
    </div>
  );
};
