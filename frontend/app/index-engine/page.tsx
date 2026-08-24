"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  Layers,
  ArrowRight,
  Info,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
  GitFork
} from "lucide-react";
import { BasketWeightTable } from "../../components/tables/BasketWeightTable";
import { ExplainWaterfall } from "../../components/charts/ExplainWaterfall";
import { BasketWeightSimulator } from "../../components/simulator/BasketWeightSimulator";
import { DataLineageModal } from "../../components/lineage/DataLineageModal";
import { ExplainNumberModal } from "../../components/explain/ExplainNumberModal";
import { Badge } from "../../components/ui/Badge";
import { apiService } from "../../services/api";
import { IndexExplanation, NationalSummary } from "../../types";

const METHODOLOGY_STAGES = [
  {
    id: 1,
    name: "Fare Observations",
    desc: "Continuous ingestion from statutory regulatory feeds, GDS-compatible interfaces, and OTA aggregator adapters across D-1 to D-60 windows.",
  },
  {
    id: 2,
    name: "Normalization & Scrubbing",
    desc: "Standardization of taxes, fuel surcharges, baggage fees, unbundled ancillaries, and isolation of promotion outliers.",
  },
  {
    id: 3,
    name: "Representative Route Fare",
    desc: "Computation of robust central tendency (trimmed mean 10th-90th percentile) per corridor across standardized booking lead days.",
  },
  {
    id: 4,
    name: "Price Relative (Rt)",
    desc: "Formula: Rt = Current Representative Fare / Benchmark Base Period Fare (P t / P 0).",
  },
  {
    id: 5,
    name: "Route Index (It)",
    desc: "Individual corridor index normalized against 100.0 baseline: Route Index = Price Relative × 100.",
  },
  {
    id: 6,
    name: "Route Weights (Wi)",
    desc: "Fixed annual passenger traffic weights derived from DGCA statutory domestic seat-capacity statistics (Sum = 100.0%).",
  },
  {
    id: 7,
    name: "National Index (API)",
    desc: "Weighted Laspeyres aggregation: National API = Sum(Wi × It) / Sum(Wi).",
  },
];

export default function IndexEnginePage() {
  const [summary, setSummary] = useState<NationalSummary>({
    index: 118.42,
    base_index: 100.0,
    daily_change: 0.42,
    monthly_change: 2.84,
    yearly_change: 8.31,
    quality_score: 98.8,
    routes_monitored: 18,
    observations: 18900,
    avg_domestic_fare: 5482,
    last_updated: new Date().toISOString(),
  });

  const [basketRoutes, setBasketRoutes] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<IndexExplanation | null>(null);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isLineageOpen, setIsLineageOpen] = useState<boolean>(false);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);

  useEffect(() => {
    apiService.getSummary().then(setSummary).catch(console.warn);
    apiService.getBasketRoutes().then(setBasketRoutes).catch(console.warn);
    apiService.getIndexContributors().then(setExplanation).catch(console.warn);
  }, []);

  const diffVsBase = summary.index - 100.0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Heading & Top Index Highlight */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900/90 to-navy-950/70 border border-sky-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              MoSPI Statistical Index Engine
            </span>
            <Badge variant="verified">WEIGHTED LASPEYRES FORMULA</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            National Airfare Price Index Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Transparent, auditable, and deterministic methodology transforming raw observations into macro-level price relatives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLineageOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold transition-colors shadow-glow"
          >
            <GitFork className="w-4 h-4" />
            Inspect Lineage Tree
          </button>
          <div
            onClick={() => setIsExplainOpen(true)}
            className="p-4 rounded-xl glass-panel border border-sky-500/40 text-right cursor-pointer hover:border-sky-400 transition-colors"
            title="Click to explain National API vs Base Benchmark"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold block">
              National Index (API)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
              {summary.index.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 justify-end text-[11px] font-mono mt-1">
              <span className="text-sky-300 font-bold">
                +{diffVsBase.toFixed(2)} pts vs Base
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">
                {summary.monthly_change >= 0 ? "+" : ""}{summary.monthly_change.toFixed(2)}% MoM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Stage Methodology Flow Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            7-Stage Statistical Compilation Pipeline
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Click any stage to inspect mathematical specification
          </span>
        </div>

        {/* Horizontal Flow Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {METHODOLOGY_STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStage(st.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeStage === st.id
                  ? "bg-sky-950/60 border-sky-500 text-white font-bold shadow-glow"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <div className="text-[10px] font-mono font-bold text-sky-400 mb-1">
                0{st.id} STAGE
              </div>
              <div className="text-xs font-semibold leading-tight">{st.name}</div>
            </button>
          ))}
        </div>

        {/* Active Stage Explanatory Box */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white block mb-0.5">
              Stage 0{activeStage}: {METHODOLOGY_STAGES.find((s) => s.id === activeStage)?.name}
            </span>
            {METHODOLOGY_STAGES.find((s) => s.id === activeStage)?.desc}
          </div>
        </div>
      </div>

      {/* Index Mathematical Formula Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold block">
            1. Route Price Relative
          </span>
          <div className="font-mono text-sm text-white font-bold bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            R_i = P_(i, t) / P_(i, 0)
          </div>
          <p className="text-[11px] text-slate-400">
            Ratio of current representative fare to benchmark baseline fare.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold block">
            2. Corridor Index
          </span>
          <div className="font-mono text-sm text-white font-bold bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            I_i = R_i × 100.0
          </div>
          <p className="text-[11px] text-slate-400">
            Route price relative indexed against base period index value (100.0).
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold block">
            3. National Weighted Aggregation
          </span>
          <div className="font-mono text-sm text-white font-bold bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            API = Σ(w_i × I_i) / Σ(w_i)
          </div>
          <p className="text-[11px] text-slate-400">
            Weighted Laspeyres aggregation across all monitored domestic trunk corridors.
          </p>
        </div>
      </div>

      {/* Explain National Index vs Base Feature */}
      {explanation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Explain National Index vs Base (100.00)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Deterministic Attribution Engine
            </span>
          </div>

          <ExplainWaterfall
            nationalIndex={explanation.national_index}
            monthlyChange={explanation.monthly_change}
            positiveContributors={explanation.top_positive_contributors}
            negativeContributors={explanation.top_negative_contributors}
            summaryText={explanation.deterministic_summary}
          />
        </div>
      )}

      {/* Priority 6: Route Basket & Weight Simulator */}
      <BasketWeightSimulator />

      {/* Representative Basket Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            National Representative Route Basket
          </h3>
          <span className="text-xs text-slate-400">18 Key Domestic Trunk Corridors</span>
        </div>

        <BasketWeightTable routes={basketRoutes} />
      </div>

      {/* Modals */}
      <DataLineageModal
        isOpen={isLineageOpen}
        onClose={() => setIsLineageOpen(false)}
      />
      <ExplainNumberModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        metricType="national_index"
      />
    </div>
  );
}
