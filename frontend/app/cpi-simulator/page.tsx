"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sliders,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Info,
  Layers,
  CheckCircle2,
  FileCheck,
  Calculator,
  RotateCcw
} from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Badge } from "../../components/ui/Badge";
import { ScenarioLaboratory } from "../../components/simulator/ScenarioLaboratory";
import { ExplainNumberModal } from "../../components/explain/ExplainNumberModal";
import { apiService } from "../../services/api";
import { CPISimulationResult, NationalSummary } from "../../types";

export default function CPISimulatorPage() {
  const [currentTrend, setCurrentTrend] = useState<number>(2.84);
  const [movementPct, setMovementPct] = useState<number>(2.84);
  const [cpiWeight, setCpiWeight] = useState<number>(1.45);
  const [scenario, setScenario] = useState<string>("current");
  const [simulation, setSimulation] = useState<CPISimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);

  useEffect(() => {
    apiService.getSummary()
      .then((summary) => {
        const mom = summary.monthly_change || 2.84;
        setCurrentTrend(mom);
        setMovementPct(mom);
      })
      .catch(console.warn);
  }, []);

  const runSimulation = (mov: number, wt: number, scen: string) => {
    setIsLoading(true);
    apiService
      .simulateCPI(mov, wt, scen)
      .then((data) => {
        setSimulation(data);
      })
      .catch((err) => {
        console.warn("CPI simulation error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    runSimulation(movementPct, cpiWeight, scenario);
  }, [movementPct, cpiWeight, scenario]);

  const handleScenarioSelect = (scen: string) => {
    setScenario(scen);
    if (scen === "current") setMovementPct(currentTrend);
    if (scen === "moderate_inflation") setMovementPct(5.2);
    if (scen === "high_inflation") setMovementPct(12.4);
    if (scen === "fare_decline") setMovementPct(-4.15);
  };

  const handleReset = () => {
    setScenario("current");
    setMovementPct(currentTrend);
    setCpiWeight(1.45);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              MoSPI Decision Support Workbench
            </span>
            <Badge variant="verified">POLICY SIMULATOR</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CPI Integration & Impact Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate the pass-through effect of real-time airfare index fluctuations into the Consumer Price Index (CPI) Transport subgroup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExplainOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Explain Pass-Through
          </button>
          <Badge variant="demo">PROTOTYPE SIMULATION</Badge>
        </div>
      </div>

      {/* Official MoSPI Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">
            Statistical Governance Notice:
          </span>
          Prototype simulation only. Official CPI integration depends on MoSPI&apos;s approved weighting schedules and compilation methodology.
        </div>
      </div>

      {/* Simulator Interactive Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters Controls */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Simulation Controls
            </h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[10px] font-mono text-sky-400 hover:text-sky-300 uppercase font-bold"
              title="Reset to current backend trend"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "current", label: `Current Trend (+${currentTrend >= 0 ? "+" : ""}${currentTrend.toFixed(2)}%)` },
              { id: "moderate_inflation", label: "Moderate (+5.2%)" },
              { id: "high_inflation", label: "Peak Surge (+12.4%)" },
              { id: "fare_decline", label: "Monsoon Softening (-4.15%)" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleScenarioSelect(p.id)}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left transition-all ${
                  scenario === p.id
                    ? "bg-sky-950/60 border-sky-500 text-white font-bold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Airfare Movement Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Airfare Index Movement (%):</span>
              <span className="font-bold text-sky-400 text-sm">
                {movementPct >= 0 ? "+" : ""}{movementPct.toFixed(2)}%
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="30"
              step="0.1"
              value={movementPct}
              onChange={(e) => {
                setMovementPct(Number(e.target.value));
                setScenario("custom");
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>-15%</span>
              <span>0% Baseline</span>
              <span>+30% High</span>
            </div>
          </div>

          {/* CPI Weight Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Airfare CPI Basket Weight (%):</span>
              <span className="font-bold text-sky-400 text-sm">{cpiWeight.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.05"
              value={cpiWeight}
              onChange={(e) => {
                setCpiWeight(Number(e.target.value));
                setScenario("custom");
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5% (Low Weight)</span>
              <span>1.45% (Estimated Standard)</span>
              <span>5.0% (Upper Bound)</span>
            </div>
          </div>
        </div>

        {/* Output Simulation Results Card */}
        <div className="lg:col-span-7 space-y-6">
          {simulation && (
            <>
              {/* Top Result KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard
                  title="Headline CPI Pass-Through"
                  value={`${(simulation.cpi_impact_basis_points ?? 0) >= 0 ? "+" : ""}${(simulation.cpi_impact_basis_points ?? 4.12).toFixed(2)} bps`}
                  subtitle={`(${(simulation.cpi_impact_percentage ?? 0.0412) >= 0 ? "+" : ""}${(simulation.cpi_impact_percentage ?? 0.0412).toFixed(4)}%)`}
                  changeType={(simulation.cpi_impact_basis_points ?? 0) >= 0 ? "positive" : "negative"}
                  highlight={true}
                />
                <KpiCard
                  title="Transport Subgroup Impact"
                  value={`${(simulation.simulated_transport_index_delta ?? 0) >= 0 ? "+" : ""}${(simulation.simulated_transport_index_delta ?? 0.412).toFixed(3)}%`}
                  subtitle="Subgroup Index Movement"
                />
                <KpiCard
                  title="Simulated Headline CPI"
                  value={(184.20 + (simulation.cpi_impact_percentage ?? 0.0412)).toFixed(2)}
                  subtitle="Baseline: 184.20"
                />
              </div>

              {/* Formula & Method Explain Box */}
              <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Mathematical Pass-Through Formula
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-sky-300">
                  Δ CPI = (Airfare Movement % × Airfare Basket Weight %) ÷ 100
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  A{" "}
                  <span className="font-bold text-white font-mono">
                    {movementPct >= 0 ? "+" : ""}{movementPct.toFixed(2)}%
                  </span>{" "}
                  shift in representative airfare tariffs applied against a{" "}
                  <span className="font-bold text-white font-mono">{cpiWeight.toFixed(2)}%</span> CPI weight
                  contributes an estimated{" "}
                  <span className="font-bold text-sky-400 font-mono">
                    {(simulation.cpi_impact_basis_points ?? 4.12).toFixed(2)} basis points
                  </span>{" "}
                  to the overall Headline Consumer Price Index.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Priority 5: Scenario Laboratory (What-If Stress Testing) */}
      <ScenarioLaboratory />

      {/* Modal */}
      <ExplainNumberModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        metricType="cpi_simulation"
      />
    </div>
  );
}
