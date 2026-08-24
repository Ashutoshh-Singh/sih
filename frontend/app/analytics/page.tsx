"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Globe2,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Compass,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import { Badge } from "../../components/ui/Badge";
import { apiService } from "../../services/api";

const REGIONAL_INDEX = [
  { region: "North (DEL/JAI/LKO)", index: 114.2, change: "+3.2%", avgFare: 5620, count: 4 },
  { region: "West (BOM/GOI/AMD/PNQ)", index: 113.8, change: "+3.0%", avgFare: 5410, count: 5 },
  { region: "South (BLR/HYD/MAA/COK)", index: 109.4, change: "+1.9%", avgFare: 4380, count: 6 },
  { region: "East (CCU/IXB)", index: 111.1, change: "+2.4%", avgFare: 5120, count: 2 },
  { region: "Northeast (GAU)", index: 107.8, change: "+1.2%", avgFare: 6450, count: 1 },
];

const VOLATILITY_LEADERBOARD = [
  { route: "DEL → GOI", volatility: "±24.8%", reason: "Leisure seasonality & weekend surge", risk: "HIGH" },
  { route: "DEL → BOM", volatility: "±18.2%", reason: "High corporate demand variability", risk: "MEDIUM" },
  { route: "BOM → GOI", volatility: "±16.9%", reason: "Peak leisure departures", risk: "MEDIUM" },
  { route: "DEL → BLR", volatility: "±14.5%", reason: "Tech business corridor travel", risk: "LOW" },
  { route: "BLR → HYD", volatility: "±8.4%", reason: "High frequency steady corridor", risk: "STABLE" },
];

const DAY_OF_WEEK_PATTERN = [
  { day: "Mon", avgFare: 5480, demand: "Business Peak" },
  { day: "Tue", avgFare: 4920, demand: "Mid-week Stable" },
  { day: "Wed", avgFare: 4850, demand: "Mid-week Stable" },
  { day: "Thu", avgFare: 5120, demand: "Pre-weekend Rise" },
  { day: "Fri", avgFare: 6150, demand: "Peak Departure" },
  { day: "Sat", avgFare: 5820, demand: "Weekend Leisure" },
  { day: "Sun", avgFare: 6380, demand: "Peak Return" },
];

export default function AnalyticsPage() {
  const [airlinesCompare, setAirlinesCompare] = useState<any[]>([]);

  useEffect(() => {
    apiService.getAirlinesCompare().then(setAirlinesCompare).catch(console.warn);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
            Multi-Dimensional Analytics
          </span>
          <Badge variant="verified">REGIONAL & VOLATILITY MATRIX</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Advanced Statistical Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Regional sub-indices, corridor price volatility rankings, and seasonal day-of-week demand movements.
        </p>
      </div>

      {/* Section 1: Regional Sub-Indices & Day-of-Week Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Regional Price Sub-indices */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-sky-400" />
                Regional Airfare Sub-Indices
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated price movement partitioned by Indian geographic zones
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Base: 100.0</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REGIONAL_INDEX} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.2)" horizontal={false} />
                <XAxis type="number" domain={[100, 120]} stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis dataKey="region" type="category" stroke="#64748b" tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 500 }} width={140} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl glass-panel-glow border border-slate-700 text-xs shadow-xl space-y-1">
                          <div className="font-bold text-white text-sm">{d.region}</div>
                          <div className="text-sky-400 font-mono font-bold">Sub-Index: {d.index} ({d.change} MoM)</div>
                          <div className="text-slate-400">Avg Regional Fare: ₹{d.avgFare?.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">{d.count} Monitored Corridors</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="index" radius={[0, 6, 6, 0]}>
                  {REGIONAL_INDEX.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#38bdf8" : index === 1 ? "#06b6d4" : "#0284c7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day-of-Week Movement */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-slate-800/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              Day-of-Week Seasonality Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tariff variation across departure days of the week
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAY_OF_WEEK_PATTERN} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.2)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl glass-panel-glow border border-slate-700 text-xs shadow-xl space-y-1">
                          <div className="font-bold text-white text-sm">{d.day} ({d.demand})</div>
                          <div className="text-sky-400 font-mono font-bold">Avg Fare: ₹{d.avgFare?.toLocaleString()}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgFare" radius={[6, 6, 0, 0]}>
                  {DAY_OF_WEEK_PATTERN.map((entry, index) => {
                    const isPeak = entry.day === "Fri" || entry.day === "Sun";
                    return <Cell key={`cell-${index}`} fill={isPeak ? "#f43f5e" : "#0284c7"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 2: Corridor Volatility Leaderboard & Cross-Airline Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Volatility Rankings */}
        <div className="lg:col-span-6 rounded-2xl glass-panel p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Corridor Price Volatility Rankings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard deviation of fares relative to mean over 30-day window
              </p>
            </div>
            <Badge variant="warning">VOLATILITY SPREAD</Badge>
          </div>

          <div className="space-y-3">
            {VOLATILITY_LEADERBOARD.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{item.route}</span>
                  <span className="font-mono font-bold text-amber-400">{item.volatility}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{item.reason}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.risk} SPREAD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Airline Observation Matrix */}
        <div className="lg:col-span-6 rounded-2xl glass-panel p-6 border border-slate-800/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Cross-Airline Domestic Share & Tariffs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Market share and standardized average tariffs across airlines
            </p>
          </div>

          <div className="space-y-3">
            {airlinesCompare.map((al, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-sky-400">
                      {al.code}
                    </span>
                    <span className="font-semibold text-white text-xs">{al.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Domestic Market Share: <span className="text-slate-200 font-mono">{al.market_share}%</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-white">
                    ₹{al.avg_fare?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Range: ₹{al.min_fare?.toLocaleString()} - ₹{al.max_fare?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
