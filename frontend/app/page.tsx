"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  PlaneTakeoff,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Cpu,
  RefreshCw,
  Compass,
  FileCheck2,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { IndiaAviationGlobe } from "../components/three/IndiaAviationGlobe";
import { KpiCard } from "../components/ui/KpiCard";
import { Badge } from "../components/ui/Badge";
import { apiService } from "../services/api";
import { NationalSummary } from "../types";

export default function LandingPage() {
  const [summary, setSummary] = useState<NationalSummary | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<string>("DEL");
  const [selectedRoute, setSelectedRoute] = useState<string>("DEL-BOM");

  useEffect(() => {
    apiService
      .getSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.warn("Failed to fetch landing summary:", err));
  }, []);

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-4">
      {/* Top Banner Branding / Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900/80 to-slate-950/60 border border-sky-500/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Ministry of Statistics and Programme Implementation (MoSPI)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Smart India Hackathon 2026 Prototype • Problem Statement SIH-2026-AIRFARE-01
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="verified">MoSPI Statistical Spec</Badge>
          <Badge variant="demo">DEMO DATA</Badge>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Copy & CTAs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>MoSPI Airfare Intelligence Layer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              India&apos;s Real-Time <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Airfare Price Index
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Transforming multi-source airfare observations into validated, explainable, and near-real-time statistical indicators for CPI augmentation.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/overview"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-glow hover:translate-y-[-1px]"
            >
              <span>Open Intelligence Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/route-explorer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <span>Explore National Network</span>
            </Link>
          </div>

          {/* Pipeline Architectural Callout */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Continuous Statistical Pipeline
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono overflow-x-auto py-1 gap-2">
              <span className="px-2 py-1 rounded bg-slate-800 text-sky-400">Acquisition</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-teal-400">ETL & Validation</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-sky-300">Laspeyres Index</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300">CPI Augmentation</span>
            </div>
          </div>
        </div>

        {/* Right 3D Interactive Subcontinent Globe */}
        <div className="lg:col-span-7">
          <IndiaAviationGlobe
            selectedAirport={selectedAirport}
            selectedRoute={selectedRoute}
            onSelectAirport={(code) => {
              setSelectedAirport(code);
              setSelectedRoute(`${code}-BOM`);
            }}
            onSelectRoute={(origin, dest) => {
              setSelectedAirport(origin);
              setSelectedRoute(`${origin}-${dest}`);
            }}
          />
        </div>
      </div>

      {/* Live System Telemetry Ticker KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          title="National Airfare Index"
          value={summary ? summary.index.toFixed(2) : "—"}
          change={summary ? `▲ +${summary.monthly_change}% MoM` : undefined}
          changeType="positive"
          tooltip="Weighted Laspeyres aggregation across national corridors (Base = 100.0)"
          highlight={true}
        />
        <KpiCard
          title="Avg Domestic Fare"
          value={summary ? `₹${summary.avg_domestic_fare.toLocaleString()}` : "—"}
          subtitle="All economy cabins"
        />
        <KpiCard
          title="Active Corridors"
          value={summary ? summary.routes_monitored : "—"}
          subtitle="Top trunk + regional"
          badge="100% COVERAGE"
        />
        <KpiCard
          title="Fare Observations"
          value={summary ? summary.observations.toLocaleString() : "—"}
          subtitle="D-1 to D-60 windows"
          change="Validated intake"
          changeType="negative"
        />
        <KpiCard
          title="Data Quality Score"
          value={summary ? `${summary.quality_score}%` : "—"}
          change="Composite 5-factor"
          changeType="negative"
          badge="AI ASSISTED"
        />
      </div>
    </div>
  );
}
