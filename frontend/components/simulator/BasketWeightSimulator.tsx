"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent
} from "lucide-react";
import { apiService } from "../../services/api";
import { BasketSimulationResult } from "../../types";
import { KpiCard } from "../ui/KpiCard";

export const BasketWeightSimulator: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [weights, setWeights] = useState<Record<number, number>>({});
  const [simResult, setSimResult] = useState<BasketSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInitialBasket = () => {
    setIsLoading(true);
    apiService.getBasketRoutes()
      .then((data) => {
        setRoutes(data);
        const initWeights: Record<number, number> = {};
        data.forEach((r: any) => {
          const rId = r.route_id ?? r.id;
          const rWeight = r.weight_pct ?? r.weight ?? 5.0;
          if (rId !== undefined) {
            initWeights[rId] = Number(rWeight);
          }
        });
        setWeights(initWeights);
      })
      .catch((err) => {
        console.warn("Error fetching basket routes:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchInitialBasket();
  }, []);

  const calculateSum = () => {
    return Object.values(weights).reduce((acc, v) => acc + (v || 0), 0);
  };

  const currentTotal = calculateSum();
  const isValid = Math.abs(currentTotal - 100.0) <= 0.2;

  useEffect(() => {
    if (Object.keys(weights).length === 0) return;
    const modifiers = Object.entries(weights).map(([id, wt]) => ({
      route_id: Number(id),
      weight_pct: Number(wt),
    }));

    apiService
      .simulateBasket(modifiers)
      .then((res) => setSimResult(res))
      .catch((err) => console.error("Basket simulation error:", err));
  }, [weights]);

  const handleWeightChange = (id: number, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(50, val)),
    }));
  };

  const handleNormalize = () => {
    const sum = calculateSum();
    if (sum === 0) return;
    const normalized: Record<number, number> = {};
    Object.entries(weights).forEach(([id, val]) => {
      normalized[Number(id)] = Number(((val / sum) * 100.0).toFixed(2));
    });
    setWeights(normalized);
  };

  const handleReset = () => {
    fetchInitialBasket();
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Methodological Weight Laboratory
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              SIMULATION BENCHMARK
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Statistical Route Basket & Weight Simulator
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Evaluate how re-weighting monitored domestic corridors (e.g. DGCA passenger seat-capacity updates) impacts national compilation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isValid && (
            <button
              onClick={handleNormalize}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold transition-colors"
            >
              Normalize Weights (100%)
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            title="Reset to official backend weights"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Basket
          </button>
        </div>
      </div>

      {/* Basket Weight Validation Warning */}
      {!isValid && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Current Basket Total: <strong className="text-white">{currentTotal.toFixed(1)}%</strong>. Weights must total 100.0% for Laspeyres standardization.
            </span>
          </div>
          <button
            onClick={handleNormalize}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[11px] font-bold"
          >
            Auto-Normalize
          </button>
        </div>
      )}

      {/* Comparison KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Official Baseline API"
          value={simResult ? simResult.official_national_index.toFixed(2) : "—"}
          subtitle="DGCA statutory base weights"
          badge="OFFICIAL"
        />
        <KpiCard
          title="Simulated National API"
          value={simResult ? simResult.simulated_national_index.toFixed(2) : "—"}
          subtitle="Recalculated with custom weight matrix"
          changeType={
            (simResult?.index_difference || 0) >= 0 ? "positive" : "negative"
          }
          highlight={true}
          badge="SIMULATED"
        />
        <KpiCard
          title="Net Weighting Impact"
          value={
            simResult
              ? `${simResult.index_difference >= 0 ? "+" : ""}${simResult.index_difference.toFixed(2)} pts`
              : "—"
          }
          subtitle="Methodological variance"
          changeType={
            (simResult?.index_difference || 0) >= 0 ? "positive" : "negative"
          }
        />
      </div>

      {/* Corridor Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
        {routes.map((r) => {
          const rId = Number(r.route_id ?? r.id);
          const baseWeight = Number(r.weight_pct ?? r.weight ?? 5.0);
          const currentVal = weights[rId] !== undefined ? Number(weights[rId]) : baseWeight;
          
          let origIata = r.origin_iata || r.origin_airport?.iata_code;
          let destIata = r.destination_iata || r.destination_airport?.iata_code;
          if (!origIata && r.route_code && r.route_code.includes("-")) {
            const parts = r.route_code.split("-");
            origIata = parts[0];
            destIata = parts[1];
          }
          origIata = origIata || "DEL";
          destIata = destIata || "BOM";

          const origCity = r.origin_city || r.origin_airport?.city || origIata;
          const destCity = r.destination_city || r.destination_airport?.city || destIata;
          const routeIndex = Number(r.route_index ?? 100.0);
          const delta = currentVal - baseWeight;

          return (
            <div
              key={rId}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{origIata} → {destIata}</span>
                  <span className="text-slate-400 text-[11px]">({origCity}–{destCity})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Index: {routeIndex.toFixed(1)}</span>
                  <span className="font-bold text-sky-400">{currentVal.toFixed(1)}%</span>
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="30.0"
                step="0.1"
                value={currentVal}
                onChange={(e) => handleWeightChange(rId, Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Official Base: {baseWeight.toFixed(1)}%</span>
                <span>
                  Delta: {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="font-bold text-sky-400">MoSPI Methodology Note: </span>
        Statistical route basket weighting is dynamically loaded from the DGCA reference capacity matrix and is fully configurable to simulate base-year revisions without breaking time-series continuity.
      </div>
    </div>
  );
};
