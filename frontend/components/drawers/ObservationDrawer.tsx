"use client";

import React from "react";
import {
  X,
  Plane,
  ShieldCheck,
  Calendar,
  CreditCard,
  Hash,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { ObservationDetail } from "../../types";
import { Badge } from "../ui/Badge";

interface ObservationDrawerProps {
  detail: ObservationDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ObservationDrawer: React.FC<ObservationDrawerProps> = ({
  detail,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !detail) return null;

  const isAnomaly = detail.validation.validation_status === "ANOMALY";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-700/80 shadow-2xl overflow-y-auto flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-sky-400">
                OBSERVATION #{detail.id}
              </span>
              <Badge variant={isAnomaly ? "anomaly" : "valid"} />
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {detail.flight.origin_city} → {detail.flight.destination_city}
            </h2>
            <p className="text-xs text-slate-400">
              {detail.flight.airline} • Flight {detail.flight.flight_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Fare Summary Highlight Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Total Observed Tariff
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                ₹{detail.fare.total_fare?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Base: ₹{detail.fare.base_fare?.toLocaleString()} + Taxes: ₹{detail.fare.taxes?.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Lead Window
              </span>
              <span className="text-lg font-bold font-mono text-sky-400">
                {detail.flight.booking_window}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {detail.flight.booking_lead_days} days prior departure
              </span>
            </div>
          </div>

          {/* Section 1: Flight & Itinerary Parameters */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
              <Plane className="w-3.5 h-3.5 text-sky-400" />
              Flight & Itinerary Parameters
            </h3>
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Airline:</span>
                <span className="font-semibold">{detail.flight.airline} ({detail.flight.airline_code})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Flight Number:</span>
                <span className="font-mono font-semibold">{detail.flight.flight_number}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Origin Airport:</span>
                <span>{detail.flight.origin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Destination Airport:</span>
                <span>{detail.flight.destination}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Travel Date:</span>
                <span className="font-mono">{detail.flight.travel_date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Stops / Routing:</span>
                <span>{detail.flight.stops === 0 ? "Non-Stop (Direct)" : `${detail.flight.stops} Stop`}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Fare Breakdown & Ancillaries */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-sky-400" />
              Fare Family & Unbundled Components
            </h3>
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Cabin Class:</span>
                <span className="font-semibold">{detail.fare.cabin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Fare Family:</span>
                <span>{detail.fare.fare_family}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Baggage Allowance:</span>
                <span>{detail.fare.baggage}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Refundable Policy:</span>
                <span className={detail.fare.refundable ? "text-emerald-400" : "text-slate-400"}>
                  {detail.fare.refundable ? "Yes (Refundable)" : "Non-Refundable"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Data Quality & Multi-stage Validation */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Automated Data Quality & Validation Audit
            </h3>
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Schema Check:</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {detail.validation.schema_status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Duplicate Check:</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {detail.validation.duplicate_check}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ML Anomaly Status:</span>
                <span className={`font-medium flex items-center gap-1 ${isAnomaly ? "text-rose-400" : "text-emerald-400"}`}>
                  {isAnomaly ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {detail.validation.anomaly_status}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700/60 pt-2">
                <span className="text-slate-400 font-semibold">Data Confidence Score:</span>
                <span className="text-teal-300 font-mono font-bold">{detail.validation.quality_score}%</span>
              </div>
            </div>
          </div>

          {/* Section 4: Data Provenance & Ingestion Audit Trail */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              Data Provenance & Audit Trail
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1.5">
              <div>
                <span className="text-slate-500">Source Feed:</span> {detail.observation.source} ({detail.provenance.source_adapter})
              </div>
              <div>
                <span className="text-slate-500">Collection Timestamp:</span> {detail.observation.timestamp}
              </div>
              <div>
                <span className="text-slate-500">Pipeline Version:</span> {detail.observation.ingestion_channel}
              </div>
              <div>
                <span className="text-slate-500">Payload Hash:</span> <span className="text-sky-400">{detail.provenance.raw_payload_hash}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Audit Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
