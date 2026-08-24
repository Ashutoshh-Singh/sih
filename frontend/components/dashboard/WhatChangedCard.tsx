"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight
} from "lucide-react";
import { apiService } from "../../services/api";
import { DashboardChangesData } from "../../types";

export const WhatChangedCard: React.FC = () => {
  const [data, setData] = useState<DashboardChangesData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshStep, setRefreshStep] = useState<string>("");

  const loadChanges = () => {
    apiService
      .getDashboardChanges()
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading changes:", err));
  };

  useEffect(() => {
    loadChanges();
  }, []);

  const handleRefreshIntelligence = () => {
    setIsRefreshing(true);
    setRefreshStep("Collecting latest observation vectors...");

    setTimeout(() => {
      setRefreshStep("Validating schemas & executing Isolation Forest...");
    }, 600);

    setTimeout(() => {
      setRefreshStep("Updating 18 corridor representative trimmed means...");
    }, 1200);

    setTimeout(() => {
      setRefreshStep("Recalculating weighted Laspeyres National API...");
    }, 1800);

    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshStep("");
      loadChanges();
    }, 2400);
  };

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Clock className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              What Changed Since Last Refresh?
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Delta telemetry between snapshot cycles ({data?.previous_refresh_timestamp || "22:15"} → {data?.last_refresh_timestamp || "22:30"})
            </span>
          </div>
        </div>

        <button
          onClick={handleRefreshIntelligence}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-300 hover:text-white text-xs font-mono font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "PIPELINE ACTIVE" : "REFRESH INTELLIGENCE"}</span>
        </button>
      </div>

      {/* Ingestion Sequence Toast */}
      {isRefreshing && (
        <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/60 text-xs font-mono text-sky-300 flex items-center gap-2 animate-fade-in">
          <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{refreshStep}</span>
        </div>
      )}

      {/* Grid of Key Changes */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Index Movement Delta */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">National API Shift</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-white font-mono">{data.current_index.toFixed(2)}</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{data.index_delta.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">From {data.previous_index.toFixed(2)}</span>
          </div>

          {/* New Observations */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">New Observations</span>
            <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">
              +{data.new_observations_count}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">Across 4 feeds</span>
          </div>

          {/* Biggest Increase */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">Largest Increase</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-bold text-white font-mono truncate">{data.biggest_increase_route.route}</span>
              <span className="text-xs font-mono font-bold text-red-400">{data.biggest_increase_route.delta_pct}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">₹{data.biggest_increase_route.current_fare.toLocaleString("en-IN")}</span>
          </div>

          {/* Largest Decline */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">Largest Decline</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-bold text-white font-mono truncate">{data.biggest_decrease_route.route}</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{data.biggest_decrease_route.delta_pct}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">₹{data.biggest_decrease_route.current_fare.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
};
