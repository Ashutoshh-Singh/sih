"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  GitFork,
  ArrowRight,
  Layers,
  CheckCircle2,
  Database,
  Search,
  ShieldCheck,
  Hash,
  Clock,
  Sparkles,
  ChevronRight,
  Plane,
  Building,
  RotateCcw
} from "lucide-react";
import { apiService } from "../../services/api";
import { IndexLineageData, RouteLineageItem, ObservationLineageItem } from "../../types";
import { Badge } from "../ui/Badge";

interface DataLineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRouteCode?: string;
}

export const DataLineageModal: React.FC<DataLineageModalProps> = ({
  isOpen,
  onClose,
  initialRouteCode,
}) => {
  const [lineageData, setLineageData] = useState<IndexLineageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteLineageItem | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<ObservationLineageItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      apiService
        .getIndexLineage()
        .then((data) => {
          setLineageData(data);
          if (initialRouteCode && data.routes) {
            const found = data.routes.find((r) => r.route_code.toLowerCase().includes(initialRouteCode.toLowerCase()));
            if (found) setSelectedRoute(found);
            else if (data.routes.length > 0) setSelectedRoute(data.routes[0]);
          } else if (data.routes && data.routes.length > 0) {
            setSelectedRoute(data.routes[0]);
          }
        })
        .catch((err) => console.error("Error loading lineage:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, initialRouteCode]);

  if (!isOpen) return null;

  const filteredRoutes = (lineageData?.routes || []).filter(
    (r) =>
      r.route_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination_city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-950/95 border border-sky-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header with Breadcrumb */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <GitFork className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">
                End-to-End Statistical Data Lineage & Provenance
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                AUDITABLE HIERARCHY
              </span>
            </div>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <button
                onClick={() => {
                  setSelectedRoute(null);
                  setSelectedObservation(null);
                }}
                className="hover:text-sky-300 transition-colors flex items-center gap-1 font-bold text-slate-300"
              >
                <Database className="w-3.5 h-3.5 text-sky-400" />
                National Index ({lineageData?.national_index !== undefined ? lineageData.national_index.toFixed(2) : "—"})
              </button>
              {selectedRoute && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <button
                    onClick={() => setSelectedObservation(null)}
                    className="hover:text-sky-300 text-sky-400 font-bold"
                  >
                    Corridor: {selectedRoute.route_code} (Index: {selectedRoute.route_index.toFixed(2)})
                  </button>
                </>
              )}
              {selectedObservation && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-emerald-400 font-bold">
                    Observation #{selectedObservation.code}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Tracing statistical lineage tree...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Route Contributions Level 2 */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Level 2: Route Contributions
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {filteredRoutes.length} Corridors
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search corridor or city..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredRoutes.map((r) => {
                    const isSelected = selectedRoute?.route_id === r.route_id;
                    return (
                      <div
                        key={r.route_id}
                        onClick={() => {
                          setSelectedRoute(r);
                          setSelectedObservation(null);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-950/40 border-sky-500/80 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                            : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{r.route_code}</span>
                            <span className="text-[10px] text-slate-400">
                              {r.origin_city} → {r.destination_city}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-sky-400">
                            +{r.contribution_points.toFixed(2)} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Weight: {r.route_weight}%</span>
                          <span>Index: {r.route_index.toFixed(2)}</span>
                          <span className="text-emerald-400">₹{r.representative_fare.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Level 3 & Level 4 & Level 5 Deep Provenance */}
              <div className="lg:col-span-7 space-y-6">
                {selectedRoute ? (
                  <>
                    {/* Level 3: Route Index Mathematical Breakdown */}
                    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                          Level 3: Corridor Statistical Breakdown ({selectedRoute.route_code})
                        </span>
                        <Badge variant="verified">DGCA VALIDATED</Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block font-mono">Representative Fare</span>
                          <span className="text-sm font-bold text-white font-mono">
                            ₹{selectedRoute.representative_fare.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block font-mono">Base Period Fare</span>
                          <span className="text-sm font-bold text-slate-300 font-mono">
                            ₹{selectedRoute.base_fare.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block font-mono">Price Relative (Rt)</span>
                          <span className="text-sm font-bold text-sky-400 font-mono">
                            {selectedRoute.price_relative.toFixed(4)}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block font-mono">Route Index</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            {selectedRoute.route_index.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase">Mathematical Provenance Formula:</div>
                        <div className="text-sky-300">
                          Route Index = (₹{selectedRoute.representative_fare.toLocaleString("en-IN")} / ₹
                          {selectedRoute.base_fare.toLocaleString("en-IN")}) × 100 = {selectedRoute.route_index.toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          National Contribution = ({selectedRoute.route_weight}% / 100) × ({selectedRoute.route_index.toFixed(2)} - 100) = +
                          {selectedRoute.contribution_points.toFixed(2)} index points
                        </div>
                      </div>
                    </div>

                    {/* Level 4: Normalized Sample Observations */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Level 4: Multi-Source Observations ({selectedRoute.sample_observations.length} Samples shown)
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Click row for Level 5 Source Audit
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedRoute.sample_observations.map((obs) => {
                          const isObsSelected = selectedObservation?.id === obs.id;
                          return (
                            <div
                              key={obs.id}
                              onClick={() => setSelectedObservation(obs)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                isObsSelected
                                  ? "bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-bold text-sky-400">{obs.code}</span>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-2">
                                    <span>{obs.airline}</span>
                                    <span className="text-slate-500 font-mono text-[10px]">{obs.flight_number}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    Window: {obs.booking_window} • Source: {obs.source_name}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-bold text-white font-mono">
                                  ₹{obs.total_fare.toLocaleString("en-IN")}
                                </div>
                                <div className="text-[10px] text-emerald-400 font-mono">
                                  Quality: {obs.quality_score}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Level 5: Raw Observation Audit Sheet */}
                    {selectedObservation && (
                      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            Level 5: Raw Observation Audit Sheet ({selectedObservation.code})
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                            CRYPTOGRAPHIC PROVENANCE
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Carrier & Flight</span>
                            <span className="text-slate-200 font-bold">{selectedObservation.airline} {selectedObservation.flight_number}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Base Fare + Taxes</span>
                            <span className="text-slate-200 font-bold">₹{selectedObservation.base_fare} + ₹{selectedObservation.taxes}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Ingestion Source</span>
                            <span className="text-sky-300 font-bold">{selectedObservation.source_name}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Collection Time</span>
                            <span className="text-slate-300">{selectedObservation.collected_at} UTC</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Validation State</span>
                            <span className="text-emerald-400 font-bold">{selectedObservation.validation_status}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Audit Provenance Hash</span>
                            <span className="text-amber-400 text-[10px] truncate block">{selectedObservation.payload_hash}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-24 text-center text-slate-500 font-mono text-xs">
                    Select a route on the left to inspect statistical lineage.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>Snapshot: {lineageData?.dataset_version || "SNP-20260823-2230"}</span>
            <span>Methodology: {lineageData?.methodology_version || "Weighted Laspeyres v1.0"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Lineage View
          </button>
        </div>
      </div>
    </div>
  );
};
