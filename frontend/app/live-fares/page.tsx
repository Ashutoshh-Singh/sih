"use client";

import React, { useState, useEffect } from "react";
import {
  PlaneTakeoff,
  Search,
  Filter,
  Download,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { LiveFareTable } from "../../components/tables/LiveFareTable";
import { ObservationDrawer } from "../../components/drawers/ObservationDrawer";
import { Badge } from "../../components/ui/Badge";
import { apiService } from "../../services/api";
import { FareObservationItem, ObservationDetail } from "../../types";

export default function LiveFaresPage() {
  const [observations, setObservations] = useState<FareObservationItem[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(18900);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(756);

  const [selectedObsId, setSelectedObsId] = useState<number | null>(null);
  const [obsDetail, setObsDetail] = useState<ObservationDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    airline: "",
    status: "",
    anomalyOnly: false,
    source: "",
  });

  const fetchFares = () => {
    apiService
      .getFares({
        page: currentPage,
        limit: 25,
        origin: filters.origin || undefined,
        destination: filters.destination || undefined,
        airline: filters.airline || undefined,
        status: filters.status || undefined,
        anomaly_only: filters.anomalyOnly || undefined,
        source: filters.source || undefined,
      })
      .then((data) => {
        setObservations(data.items);
        setTotalRecords(data.total_records);
        setTotalPages(data.total_pages);
      })
      .catch((err) => {
        console.warn("Live fares fetch warning:", err);
      });
  };

  useEffect(() => {
    fetchFares();
  }, [currentPage, filters]);

  const handleSelectObservation = (id: number) => {
    setSelectedObsId(id);
    apiService
      .getFareDetail(id)
      .then((detail) => {
        setObsDetail(detail);
        setIsDrawerOpen(true);
      })
      .catch((err) => console.error(err));
  };

  const handleFilterChange = (key: string, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Ingested Telemetry Stream
            </span>
            <Badge variant="verified">INGESTION PIPELINE</Badge>
            <Badge variant="demo">DEMO DATA</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Live Fare Observations & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized multi-source airfare records undergoing schema normalization, anomaly auditing, and Laspeyres weighting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFares()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <LiveFareTable
        observations={observations}
        totalRecords={totalRecords}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
        onSelectObservation={handleSelectObservation}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Audit Provenance Drawer */}
      <ObservationDrawer
        detail={obsDetail}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
