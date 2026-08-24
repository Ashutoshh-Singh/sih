"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Plane,
  ArrowRightLeft,
  Calendar,
  Layers,
  Sparkles,
  Calculator,
  GitFork,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Badge } from "../../components/ui/Badge";
import { BookingWindowCurve } from "../../components/charts/BookingWindowCurve";
import { AirlineCompareBar } from "../../components/charts/AirlineCompareBar";
import { SourceAgreementCard } from "../../components/sources/SourceAgreementCard";
import { ExplainNumberModal } from "../../components/explain/ExplainNumberModal";
import { DataLineageModal } from "../../components/lineage/DataLineageModal";
import { apiService } from "../../services/api";
import { RouteAnalysis } from "../../types";

const AIRPORT_LIST = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International Airport" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International Airport" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport" },
  { code: "MAA", city: "Chennai", name: "Chennai International Airport" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhash Chandra Bose International Airport" },
  { code: "GOI", city: "Goa", name: "Dabolim Airport" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International Airport" },
  { code: "COK", city: "Kochi", name: "Cochin International Airport" },
  { code: "PNQ", city: "Pune", name: "Pune International Airport" },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International Airport" },
  { code: "JAI", city: "Jaipur", name: "Jaipur International Airport" },
];

function RouteExplorerContent() {
  const searchParams = useSearchParams();
  const initialOrigin = searchParams?.get("origin") || "DEL";
  const initialDest = searchParams?.get("dest") || "BOM";

  const [origin, setOrigin] = useState<string>(initialOrigin);
  const [destination, setDestination] = useState<string>(initialDest);
  const [travelDate, setTravelDate] = useState<string>(""); // Default: All Available Dates
  const [bookingWindow, setBookingWindow] = useState<string>("D-30");
  const [cabin, setCabin] = useState<string>("Economy");
  const [fareCategory, setFareCategory] = useState<string>("Standard");

  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [isLineageOpen, setIsLineageOpen] = useState<boolean>(false);

  const fetchRoute = (
    orig: string,
    dest: string,
    bw: string = bookingWindow,
    cb: string = cabin,
    fc: string = fareCategory,
    td: string = travelDate
  ) => {
    setIsLoading(true);
    apiService
      .getRouteAnalysis(orig, dest, bw, cb, fc, td || undefined)
      .then((data) => {
        setAnalysis(data);
      })
      .catch((err) => {
        console.warn("Falling back for route:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchRoute(origin, destination, bookingWindow, cabin, fareCategory, travelDate);
  }, [origin, destination, bookingWindow, cabin, fareCategory, travelDate]);

  const handleSwapAirports = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  const routeCode = `${origin}-${destination}`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Route Micro-Intelligence
            </span>
            <Badge variant="verified">VALIDATED PROTOTYPE RELATIVE</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Route Explorer & Fare Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            In-depth representative fare analysis, lead time escalation curves, and cross-airline variance for specific air corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExplainOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Explain Route Index
          </button>
          <button
            onClick={() => setIsLineageOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <GitFork className="w-3.5 h-3.5" />
            Corridor Lineage
          </button>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {/* Origin Selector */}
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Origin Hub
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-sky-500"
            >
              {AIRPORT_LIST.map((ap) => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selector */}
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Destination Hub
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-sky-500"
            >
              {AIRPORT_LIST.map((ap) => (
                <option key={ap.code} value={ap.code} disabled={ap.code === origin}>
                  {ap.city} ({ap.code})
                </option>
              ))}
            </select>
          </div>

          {/* Travel Date */}
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Travel Date
            </label>
            <select
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="">All Available Dates</option>
              <option value="2026-08-25">25-Aug-2026 (D-1)</option>
              <option value="2026-08-27">27-Aug-2026 (D-3)</option>
              <option value="2026-08-31">31-Aug-2026 (D-7)</option>
              <option value="2026-09-08">08-Sep-2026 (D-15)</option>
              <option value="2026-09-23">23-Sep-2026 (D-30)</option>
              <option value="2026-10-08">08-Oct-2026 (D-45)</option>
              <option value="2026-10-23">23-Oct-2026 (D-60)</option>
            </select>
          </div>

          {/* Booking Window */}
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Lead Time Window
            </label>
            <select
              value={bookingWindow}
              onChange={(e) => setBookingWindow(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-sky-500"
            >
              {["D-1", "D-3", "D-7", "D-15", "D-30", "D-45", "D-60"].map((w) => (
                <option key={w} value={w}>
                  {w} ({w === "D-1" ? "1 Day" : `${w.replace("D-", "")} Days`})
                </option>
              ))}
            </select>
          </div>

          {/* Cabin */}
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Cabin Class
            </label>
            <select
              value={cabin}
              onChange={(e) => setCabin(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="Economy">Economy Class</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business Class</option>
            </select>
          </div>

          {/* Fare Category */}
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Tariff Family
            </label>
            <select
              value={fareCategory}
              onChange={(e) => setFareCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="Standard">Standard (Hand Baggage)</option>
              <option value="Flexi">Flexi (Refundable)</option>
              <option value="Corporate">Corporate Preferred</option>
            </select>
          </div>

          {/* Action Trigger */}
          <div className="flex items-end">
            <button
              onClick={() => fetchRoute(origin, destination)}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Analyse Route
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Banner when no observations match exact date */}
      {analysis && analysis.sample_count === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-amber-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No observations for this travel date</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No recorded observation vectors match the selected date filter ({travelDate}). Switch to All Available Dates or try another date.
          </p>
          <button
            onClick={() => {
              setTravelDate("");
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono transition-colors"
          >
            Use All Available Dates
          </button>
        </div>
      )}

      {/* Route Header Banner */}
      {analysis && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900/90 to-slate-950/70 border border-sky-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto justify-between">
              <div className="text-left">
                <span className="text-3xl lg:text-4xl font-black text-white font-mono">{analysis.origin.iata_code}</span>
                <span className="text-xs text-slate-300 block font-semibold">{analysis.origin.city}</span>
                <span className="text-[10px] text-slate-400 block">{analysis.origin.name}</span>
              </div>

              <div className="flex flex-col items-center px-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400 font-bold mb-1">
                  DOMESTIC CORRIDOR
                </span>
                <div className="flex items-center gap-2 text-sky-400">
                  <div className="w-12 sm:w-24 h-0.5 bg-gradient-to-r from-sky-500/20 to-sky-400" />
                  <Plane className="w-5 h-5 text-sky-300" />
                  <div className="w-12 sm:w-24 h-0.5 bg-gradient-to-l from-sky-500/20 to-sky-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1">Non-Stop • Direct</span>
              </div>

              <div className="text-right">
                <span className="text-3xl lg:text-4xl font-black text-white font-mono">{analysis.destination.iata_code}</span>
                <span className="text-xs text-slate-300 block font-semibold">{analysis.destination.city}</span>
                <span className="text-[10px] text-slate-400 block">{analysis.destination.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-end">
              <div
                onClick={() => setIsExplainOpen(true)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                title="Overall Route Index reflects the representative route basket and is not recalculated from the currently selected fare filter."
              >
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Overall Route Index</span>
                  <HelpCircle className="w-3 h-3 text-sky-400 inline" />
                </div>
                <span className="text-2xl font-bold font-mono text-sky-300">{analysis.route_index.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 font-mono block">Basket Scope</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Price Relative</span>
                <span className="text-2xl font-bold font-mono text-white">{analysis.price_relative.toFixed(4)}</span>
                <span className="text-[9px] text-slate-500 font-mono block">Base: ₹{analysis.base_fare.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Micro-KPI Cards */}
      {analysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard
            title="Filtered Avg Fare"
            value={analysis.sample_count > 0 ? `₹${analysis.average_fare.toLocaleString()}` : "—"}
            change={`${analysis.monthly_change >= 0 ? "+" : ""}${analysis.monthly_change}% vs Base`}
            changeType={analysis.monthly_change >= 0 ? "positive" : "negative"}
            highlight={true}
          />
          <KpiCard
            title="Filtered Median Fare"
            value={analysis.sample_count > 0 ? `₹${analysis.median_fare.toLocaleString()}` : "—"}
            subtitle="50th percentile"
          />
          <KpiCard
            title="Lowest Fare"
            value={analysis.sample_count > 0 ? `₹${analysis.lowest_fare.toLocaleString()}` : "—"}
            subtitle="Advance lead rate"
          />
          <KpiCard
            title="Highest Fare"
            value={analysis.sample_count > 0 ? `₹${analysis.highest_fare.toLocaleString()}` : "—"}
            subtitle="Last-minute peak"
          />
          <KpiCard title="Base Fare" value={`₹${analysis.base_fare.toLocaleString()}`} subtitle="Statistical base" />
          <KpiCard
            title="Volatility"
            value={analysis.sample_count > 0 ? `±${analysis.volatility}%` : "—"}
            subtitle="Intra-month spread"
          />
          <KpiCard
            title="Data Confidence"
            value={`${analysis.data_confidence}%`}
            subtitle={analysis.sample_count > 0 ? `${analysis.sample_count} vectors` : "No vectors"}
            badge="HIGH"
          />
        </div>
      )}

      {/* Deep Analytical Visuals: Booking Lead Time Curve & Airline Comparison */}
      {analysis && analysis.sample_count > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <BookingWindowCurve data={analysis.booking_windows} />
          </div>
          <div className="lg:col-span-6">
            <AirlineCompareBar data={analysis.airline_breakdown} />
          </div>
        </div>
      )}

      {/* Cross-Source Fare Agreement Card */}
      <SourceAgreementCard routeCode={routeCode} />

      {/* Modals */}
      <ExplainNumberModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        metricType="route_index"
        routeCode={routeCode}
      />
      <DataLineageModal
        isOpen={isLineageOpen}
        onClose={() => setIsLineageOpen(false)}
        initialRouteCode={routeCode}
      />
    </div>
  );
}

export default function RouteExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs font-mono text-slate-400">
          Loading route micro-intelligence...
        </div>
      }
    >
      <RouteExplorerContent />
    </Suspense>
  );
}
