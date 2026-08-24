"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Layers
} from "lucide-react";
import { apiService } from "../../services/api";
import { ScenarioSimulationResult } from "../../types";
import { KpiCard } from "../ui/KpiCard";

export const ScenarioLaboratory: React.FC = () => {
  const [preset, setPreset] = useState<string>("festival_demand");
  const [routeCode, setRouteCode] = useState<string>("DEL-BOM");
  const [fareShift, setFareShift] = useState<number>(18.5);
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runSimulation = (p: string, r: string, shift: number) => {
    setIsLoading(true);
    apiService
      .simulateScenario({
        scenario_preset: p,
        route_code: r,
        fare_shift_pct: shift,
      })
      .then((res) => setResult(res))
      .catch((err) => console.error("Scenario simulation error:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    runSimulation(preset, routeCode, fareShift);
  }, [preset, routeCode, fareShift]);

  const handlePresetSelect = (p: string) => {
    setPreset(p);
    if (p === "festival_demand") setFareShift(18.5);
    else if (p === "fuel_shock") setFareShift(12.0);
    else if (p === "holiday_surge") setFareShift(24.0);
    else if (p === "fare_correction") setFareShift(-8.5);
    else if (p === "normal") setFareShift(0.0);
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" />
              Policy Sandbox Environment
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              STOCHASTIC EXPERIMENTS
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Airfare Scenario Laboratory & Macro Shock Modeling
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Simulate macro-aviation events (e.g. ATF fuel excise shifts, festive peak surges, capacity shortages) and observe immediate pass-through into the national index.
          </p>
        </div>

        <button
          onClick={() => handlePresetSelect("festival_demand")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Preset
        </button>
      </div>

      {/* Preset Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: "normal", label: "Normal Market (0%)" },
          { id: "festival_demand", label: "Diwali Surge (+18.5%)" },
          { id: "fuel_shock", label: "ATF Fuel Shock (+12%)" },
          { id: "holiday_surge", label: "Winter Holiday (+24%)" },
          { id: "fare_correction", label: "Low Season (-8.5%)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handlePresetSelect(tab.id)}
            className={`p-3 rounded-xl border text-xs font-mono transition-all text-left ${
              preset === tab.id
                ? "bg-sky-950/60 border-sky-500/80 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom Slider Controls */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">Selected Shock Tariff Shift:</span>
          <span className="font-bold text-sky-400 text-sm">
            {fareShift >= 0 ? "+" : ""}{fareShift.toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          min="-25.0"
          max="50.0"
          step="0.5"
          value={fareShift}
          onChange={(e) => {
            setFareShift(Number(e.target.value));
            setPreset("custom");
          }}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>-25% Deflation</span>
          <span>0% Baseline</span>
          <span>+50% Severe Shock</span>
        </div>
      </div>

      {/* Output KPIs */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Baseline National API"
            value={result.baseline_national_index.toFixed(2)}
            subtitle="Current official snapshot"
          />
          <KpiCard
            title="Simulated National API"
            value={result.simulated_national_index.toFixed(2)}
            subtitle={`Shift under ${result.scenario_name}`}
            changeType={result.national_impact_delta >= 0 ? "positive" : "negative"}
            highlight={true}
            badge="SCENARIO OUTCOME"
          />
          <KpiCard
            title="Macro Impact Delta"
            value={`${result.national_impact_delta >= 0 ? "+" : ""}${result.national_impact_delta.toFixed(2)} pts`}
            subtitle={`On ${result.route_code} Corridor`}
            changeType={result.national_impact_delta >= 0 ? "positive" : "negative"}
          />
        </div>
      )}

      {/* Narrative & Affected Corridors */}
      {result && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
            <span className="text-sky-400 font-bold">Policy Impact Analysis: </span>
            {result.narrative_impact}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {result.top_affected_corridors.map((c, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <span className="font-bold text-white">{c.route}</span>
                <div className="text-right">
                  <span className="text-sky-300 block">{c.shift_pct}</span>
                  <span className="text-[10px] text-slate-400">{c.contrib_delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-500">
        Scenario simulations are analytical experiments for policy evaluation and do not represent official forecasts.
      </div>
    </div>
  );
};
