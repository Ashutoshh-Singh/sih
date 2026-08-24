"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plane,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { FareObservationItem } from "../../types";
import { Badge } from "../ui/Badge";

interface LiveFareTableProps {
  observations: FareObservationItem[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectObservation: (id: number) => void;
  filters: {
    origin: string;
    airline: string;
    status: string;
    anomalyOnly: boolean;
  };
  onFilterChange: (key: string, val: any) => void;
}

export const LiveFareTable: React.FC<LiveFareTableProps> = ({
  observations,
  totalRecords,
  currentPage,
  totalPages,
  onPageChange,
  onSelectObservation,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-panel">
      {/* Table Filter Controls */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Origin filter */}
          <select
            value={filters.origin}
            onChange={(e) => onFilterChange("origin", e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Origins</option>
            <option value="DEL">Delhi (DEL)</option>
            <option value="BOM">Mumbai (BOM)</option>
            <option value="BLR">Bengaluru (BLR)</option>
            <option value="HYD">Hyderabad (HYD)</option>
            <option value="MAA">Chennai (MAA)</option>
            <option value="CCU">Kolkata (CCU)</option>
            <option value="GOI">Goa (GOI)</option>
          </select>

          {/* Airline filter */}
          <select
            value={filters.airline}
            onChange={(e) => onFilterChange("airline", e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Airlines</option>
            <option value="6E">IndiGo (6E)</option>
            <option value="AI">Air India (AI)</option>
            <option value="QP">Akasa Air (QP)</option>
            <option value="SG">SpiceJet (SG)</option>
          </select>

          {/* Validation Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Validation Statuses</option>
            <option value="VALID">Valid / Normalized</option>
            <option value="ANOMALY">Statistical Anomalies</option>
            <option value="WARNING">Data Warnings</option>
          </select>

          {/* Anomaly quick toggle */}
          <button
            onClick={() => onFilterChange("anomalyOnly", !filters.anomalyOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              filters.anomalyOnly
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                : "bg-slate-900 text-slate-400 border-slate-700/80 hover:text-slate-200"
            }`}
          >
            ⚠ Anomalies Only
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {observations.length} of {totalRecords.toLocaleString()} records
        </div>
      </div>

      {/* Table Data View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-slate-800">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Airline & Flight</th>
              <th className="px-4 py-3">Travel Date</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3 text-right">Base</th>
              <th className="px-4 py-3 text-right">Taxes</th>
              <th className="px-4 py-3 text-right">Total Fare</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 text-center">Quality</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/30 text-slate-300">
            {observations.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                  No airfare observations match the selected criteria.
                </td>
              </tr>
            ) : (
              observations.map((obs) => {
                const isAnomaly = obs.is_anomaly || obs.validation_status === "ANOMALY";
                return (
                  <tr
                    key={obs.id}
                    onClick={() => onSelectObservation(obs.id)}
                    className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isAnomaly ? "bg-rose-950/15" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {obs.observation_timestamp.split("T")[1]?.slice(0, 8) || "08:30:12"}
                    </td>
                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                      {obs.origin_iata} → {obs.destination_iata}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">{obs.airline_name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1 py-0.5 rounded">
                          {obs.flight_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {obs.travel_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400">
                        {obs.booking_window}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-slate-400 whitespace-nowrap">
                      ₹{obs.base_fare?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-slate-400 whitespace-nowrap">
                      ₹{obs.taxes?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white text-sm whitespace-nowrap">
                      <span className={isAnomaly ? "text-rose-400 font-black" : ""}>
                        ₹{obs.total_fare?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] truncate max-w-[130px]" title={obs.source_name}>
                      {obs.source_name}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="font-mono text-teal-400 font-bold text-xs">
                        {obs.quality_score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <Badge variant={isAnomaly ? "anomaly" : "valid"}>
                        {isAnomaly ? "ANOMALY" : "VALID"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button className="p-1 rounded-md text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Page <span className="font-bold text-white">{currentPage}</span> of{" "}
          <span className="font-bold text-white">{totalPages}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
