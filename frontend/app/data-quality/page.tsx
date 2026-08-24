"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  RefreshCw,
  Info,
  Filter,
  Eye,
  Calculator
} from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Badge } from "../../components/ui/Badge";
import { AnomalyImpactComparison } from "../../components/anomaly/AnomalyImpactComparison";
import { ExplainNumberModal } from "../../components/explain/ExplainNumberModal";
import { apiService } from "../../services/api";
import { QualitySummary, AnomalyItem } from "../../types";

export default function DataQualityPage() {
  const [quality, setQuality] = useState<QualitySummary>({
    overall_score: 98.4,
    completeness: 99.2,
    freshness: 98.8,
    schema_validity: 99.9,
    source_agreement: 97.4,
    anomaly_rate: 1.1,
    observations_evaluated: 18900,
    last_evaluated: new Date().toISOString(),
    methodology: "Weighted Composite Index",
  });

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);

  const fetchQualityData = () => {
    apiService.getQualitySummary().then(setQuality).catch(console.warn);
    apiService.getAnomalies().then(setAnomalies).catch(console.warn);
  };

  useEffect(() => {
    fetchQualityData();
  }, []);

  const handleAction = async (id: number, status: "ACCEPTED" | "REJECTED") => {
    setActionLoadingId(id);
    try {
      await apiService.updateAnomalyStatus(id, status);
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, review_status: status } : a))
      );
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
              AI-Assisted Quality Assurance
            </span>
            <Badge variant="valid">ML ISOLATION FOREST</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Data Quality & Anomaly Triage Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-dimensional data verification, automated schema compliance, and unsupervised ML outlier detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExplainOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Explain Quality Formula
          </button>
          <button
            onClick={fetchQualityData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Re-run Quality Audit"
          >
            <RefreshCw className="w-4 h-4 text-teal-400" />
          </button>
        </div>
      </div>

      {/* Crucial AI Philosophy Banner */}
      <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-teal-300 block mb-0.5">
            Statistical Governance Principle:
          </span>
          &ldquo;AI assists the statistical pipeline; it does not replace the statistical methodology. Machine learning flags potential data defects and volatility anomalies, while national price aggregation remains deterministic, transparent, and auditable.&rdquo;
        </div>
      </div>

      {/* Top 6 Quality Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => setIsExplainOpen(true)}
          className="cursor-pointer group transition-transform active:scale-95"
          title="Click to explain Quality Formula"
        >
          <KpiCard
            title="Overall Quality Score"
            value={`${quality.overall_score.toFixed(1)}%`}
            change="High Confidence"
            changeType="positive"
            highlight={true}
            badge="CONFIDENCE"
          />
        </div>
        <KpiCard
          title="Completeness"
          value={`${quality.completeness.toFixed(1)}%`}
          subtitle="Zero Missing Mandatory Fields"
          changeType="positive"
        />
        <KpiCard
          title="Freshness"
          value={`${quality.freshness.toFixed(1)}%`}
          subtitle="Observed <15 mins ago"
          changeType="positive"
        />
        <KpiCard
          title="Schema Validity"
          value={`${quality.schema_validity.toFixed(1)}%`}
          subtitle="Pydantic V2 Pass Rate"
          changeType="positive"
        />
        <KpiCard
          title="Cross-Source Concord"
          value={`${quality.source_agreement.toFixed(1)}%`}
          subtitle="Multi-portal Price Variance"
          changeType="positive"
        />
        <KpiCard
          title="Anomaly Rate"
          value={`${quality.anomaly_rate.toFixed(1)}%`}
          subtitle="Quarantined from Index"
          changeType={quality.anomaly_rate > 3 ? "negative" : "neutral"}
          badge="ML FLAGGED"
        />
      </div>

      {/* Priority 4: Anomaly Impact Comparison (Before vs After QC) */}
      <AnomalyImpactComparison />

      {/* Anomaly Triage Workbench */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Human-in-the-Loop Anomaly Review Workbench
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {anomalies.filter((a) => a.review_status === "PENDING").length} Pending Reviews
          </span>
        </div>

        <div className="space-y-3">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className={`p-5 rounded-2xl border transition-all ${
                anom.review_status === "ACCEPTED"
                  ? "bg-slate-900/40 border-slate-800 opacity-60"
                  : anom.review_status === "REJECTED"
                  ? "bg-rose-950/20 border-rose-500/40"
                  : "bg-slate-900/80 border-amber-500/40 shadow-panel"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-mono">
                      {anom.origin_iata} → {anom.destination_iata}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {anom.airline_name} ({anom.flight_number})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      Window: {anom.booking_window}
                    </span>
                    <Badge variant="anomaly">
                      {anom.detection_method.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    <span className="text-amber-400 font-bold">Reason: </span>
                    {anom.reason}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>
                      Observed Fare:{" "}
                      <span className="text-red-400 font-bold">
                        ₹{anom.observed_fare.toLocaleString("en-IN")}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      Expected Range:{" "}
                      <span className="text-slate-200 font-bold">
                        {anom.expected_fare_range}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      ML Anomaly Score:{" "}
                      <span className="text-amber-400 font-bold">
                        {anom.anomaly_score}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Review Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {anom.review_status === "PENDING" ? (
                    <>
                      <button
                        disabled={actionLoadingId === anom.id}
                        onClick={() => handleAction(anom.id, "REJECTED")}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Quarantine Outlier
                      </button>
                      <button
                        disabled={actionLoadingId === anom.id}
                        onClick={() => handleAction(anom.id, "ACCEPTED")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Fare
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                        anom.review_status === "REJECTED"
                          ? "bg-rose-950 text-rose-300 border-rose-700"
                          : "bg-emerald-950 text-emerald-300 border-emerald-700"
                      }`}
                    >
                      Status: {anom.review_status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ExplainNumberModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        metricType="data_quality"
      />
    </div>
  );
}
