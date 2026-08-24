"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Sparkles,
  GitFork,
  Calendar,
  BarChart3,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Printer
} from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Badge } from "../../components/ui/Badge";
import { IndexTrendChart } from "../../components/charts/IndexTrendChart";
import { IndiaAviationGlobe } from "../../components/three/IndiaAviationGlobe";
import { ExecutiveSummaryBanner } from "../../components/dashboard/ExecutiveSummaryBanner";
import { WhatChangedCard } from "../../components/dashboard/WhatChangedCard";
import { AnomalyImpactComparison } from "../../components/anomaly/AnomalyImpactComparison";
import { ExplainNumberModal } from "../../components/explain/ExplainNumberModal";
import { DataLineageModal } from "../../components/lineage/DataLineageModal";
import { ExportBriefModal } from "../../components/export/ExportBriefModal";
import { apiService } from "../../services/api";
import { NationalSummary, IndexHistoryItem } from "../../types";

export default function OverviewPage() {
  const [summary, setSummary] = useState<NationalSummary | null>(null);
  const [historyRange, setHistoryRange] = useState<string>("1M");
  const [historyData, setHistoryData] = useState<IndexHistoryItem[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [explainMetric, setExplainMetric] = useState<string>("national_index");
  const [isLineageOpen, setIsLineageOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiService.getSummary(),
      apiService.getIndexHistory(historyRange),
      apiService.getAllRoutes(),
    ])
      .then(([summaryRes, historyRes, routesRes]) => {
        setSummary(summaryRes);
        setHistoryData(historyRes);
        setRoutes(routesRes);
      })
      .catch((err) => {
        console.warn("Falling back to local data on overview:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [historyRange]);

  const openExplain = (metric: string) => {
    setExplainMetric(metric);
    setIsExplainOpen(true);
  };

  const topInflationary = [...routes]
    .sort((a, b) => (b.route_index || 100) - (a.route_index || 100))
    .slice(0, 5)
    .map((r) => ({
      route: `${r.origin_iata} → ${r.destination_iata}`,
      change: `+${((r.route_index || 100) - 100).toFixed(1)}%`,
      fare: `₹${(r.current_avg_fare || 5482).toLocaleString()}`,
      weight: `${(r.route_weight || 5.0).toFixed(1)}%`,
      origin: r.origin_iata,
      dest: r.destination_iata,
    }));

  const topSoftening = [...routes]
    .filter((r) => (r.route_index || 100) < 100)
    .sort((a, b) => (a.route_index || 100) - (b.route_index || 100))
    .map((r) => ({
      route: `${r.origin_iata} → ${r.destination_iata}`,
      change: `${((r.route_index || 100) - 100).toFixed(1)}%`,
      fare: `₹${(r.current_avg_fare || 3500).toLocaleString()}`,
      weight: `${(r.route_weight || 3.0).toFixed(1)}%`,
      origin: r.origin_iata,
      dest: r.destination_iata,
    }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              National Statistical Command
            </span>
            <Badge variant="verified">PROTOTYPE INDEX</Badge>
            <Badge variant="demo">DEMO DATA</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            National Airfare Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Macro-level statistical indicators, national trend series, and route inflation drivers for MoSPI CPI augmentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLineageOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600/25 hover:bg-sky-600/40 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <GitFork className="w-3.5 h-3.5" />
            Inspect Lineage
          </button>
          <Link
            href="/index-engine"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Index Engine
          </Link>
        </div>
      </div>

      {/* Priority 8: Executive Statistical Summary Banner */}
      <ExecutiveSummaryBanner
        nationalIndex={summary ? summary.index : 118.42}
        monthlyMovement={summary ? summary.monthly_change : 2.84}
        qualityScore={summary ? summary.quality_score : 98.8}
        onOpenExplain={() => openExplain("national_index")}
        onOpenLineage={() => setIsLineageOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Top Statistical KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => openExplain("national_index")}
          className="cursor-pointer group transition-transform active:scale-95"
          title="Click to explain National API calculation"
        >
          <KpiCard
            title="National Airfare Index"
            value={summary ? summary.index.toFixed(2) : "—"}
            change={summary ? `${summary.monthly_change >= 0 ? "+" : ""}${summary.monthly_change.toFixed(2)}%` : undefined}
            changeType={summary && summary.monthly_change >= 0 ? "positive" : "negative"}
            period="MoM Movement"
            highlight={true}
            badge="API (BASE 100)"
          />
        </div>

        <div
          onClick={() => openExplain("avg_domestic_fare")}
          className="cursor-pointer group transition-transform active:scale-95"
          title="Click to inspect domestic tariff dispersion"
        >
          <KpiCard
            title="Average Domestic Fare"
            value={summary ? `₹${summary.avg_domestic_fare.toLocaleString("en-IN")}` : "—"}
            change="+1.8%"
            changeType="neutral"
            period="Across 18 Routes"
          />
        </div>

        <div
          onClick={() => openExplain("data_quality")}
          className="cursor-pointer group transition-transform active:scale-95"
          title="Click to explain Data Quality Score formula"
        >
          <KpiCard
            title="Data Quality Score"
            value={summary ? `${summary.quality_score.toFixed(1)}%` : "—"}
            change="High Confidence"
            changeType="positive"
            period="5-Factor AI Metric"
            badge="CONFIDENCE"
          />
        </div>

        <Link href="/route-explorer">
          <KpiCard
            title="Monitored Routes"
            value={summary ? `${summary.routes_monitored} Corridors` : "—"}
            change="100% Active"
            changeType="positive"
            period="DGCA Trunk Basket"
          />
        </Link>

        <Link href="/live-fares">
          <KpiCard
            title="Observations"
            value={summary ? summary.observations.toLocaleString("en-IN") : "—"}
            change="+324 Today"
            changeType="neutral"
            period="Multi-Source Intake"
          />
        </Link>

        <div
          onClick={() => setIsExportOpen(true)}
          className="cursor-pointer group transition-transform active:scale-95"
          title="Export official printable brief"
        >
          <KpiCard
            title="Official Reports"
            value="PDF / CSV"
            change="Print Ready"
            changeType="positive"
            period="Audited Series"
            badge="EXPORT"
          />
        </div>
      </div>

      {/* Priority 1 & 2: "What Changed Since Last Refresh" Delta & National Trend */}
      <WhatChangedCard />

      {/* National Trend Chart & Range Selector */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Historical Series
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                100.00 BASE
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              National Airfare Price Index Trend
            </h2>
          </div>

          {/* Time Range Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
            {["1M", "3M", "6M", "1Y"].map((r) => (
              <button
                key={r}
                onClick={() => setHistoryRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  historyRange === r
                    ? "bg-sky-600 text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Trend Line */}
        <IndexTrendChart
          data={historyData}
          currentRange={historyRange}
          onRangeChange={(r) => setHistoryRange(r)}
          isLoading={isLoading}
        />
      </div>

      {/* Route Drivers Grid: Top Inflationary Corridors vs Softening Routes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Primary Corridor Inflation Drivers
            </h2>
            <p className="text-xs text-slate-400">
              Corridors driving the largest upward and downward movement in the national composite.
            </p>
          </div>
          <Link
            href="/route-explorer"
            className="text-xs text-sky-400 hover:text-sky-300 font-mono font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All Corridors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Inflationary Routes */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-red-400" />
                Top Upward Drivers (vs Base)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Weighted Shift</span>
            </div>

            <div className="space-y-2">
              {topInflationary.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/route-explorer?origin=${item.origin}&dest=${item.dest}`}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{item.route}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.weight} Wt)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 font-mono">{item.fare}</span>
                    <span className="font-mono font-bold text-red-400">{item.change}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Softening / Deflationary Routes */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                Softening Corridors
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Monsoon Deflation</span>
            </div>

            <div className="space-y-2">
              {topSoftening.length > 0 ? (
                topSoftening.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/route-explorer?origin=${item.origin}&dest=${item.dest}`}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 flex items-center justify-between text-xs transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{item.route}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.weight} Wt)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 font-mono">{item.fare}</span>
                      <span className="font-mono font-bold text-emerald-400">{item.change}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-400 font-mono">
                  No monitored corridors recorded a decline vs base during the selected period.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Priority 4: Anomaly Impact Comparison (Before vs After QC) */}
      <AnomalyImpactComparison />

      {/* Priority 3: 3D Time-Travel Aviation Network */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              3D Time-Travel India Aviation Network
            </h2>
            <p className="text-xs text-slate-400">
              Interactive geodetic representation of 18 DGCA-monitored trunk corridors with historical rate-of-change telemetry.
            </p>
          </div>
          <span className="text-xs font-mono text-sky-400">WebGL Acceleration Active</span>
        </div>

        <IndiaAviationGlobe />
      </div>

      {/* Modals */}
      <ExplainNumberModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        metricType={explainMetric}
      />
      <DataLineageModal
        isOpen={isLineageOpen}
        onClose={() => setIsLineageOpen(false)}
      />
      <ExportBriefModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
