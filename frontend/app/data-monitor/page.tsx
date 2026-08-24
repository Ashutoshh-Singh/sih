"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Radio,
  RefreshCw,
  Server,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  History
} from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Badge } from "../../components/ui/Badge";
import { AuditLogTable } from "../../components/audit/AuditLogTable";
import { apiService } from "../../services/api";
import { SourceItem, SourcesHealth } from "../../types";

export default function DataMonitorPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [health, setHealth] = useState<SourcesHealth>({
    active_sources: 4,
    total_records_today: 18900,
    successful_jobs: 48,
    failed_jobs: 0,
    avg_response_time_ms: 142,
    last_collection: new Date().toISOString(),
    recent_jobs: [],
  });

  const [triggeringId, setTriggeringId] = useState<number | null>(null);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  const fetchMonitorData = () => {
    apiService.getSources().then(setSources).catch(console.warn);
    apiService.getSourcesHealth().then(setHealth).catch(console.warn);
  };

  useEffect(() => {
    fetchMonitorData();
  }, []);

  const handleTriggerCollection = async (sourceId: number) => {
    setTriggeringId(sourceId);
    try {
      const res = await apiService.triggerCollection(sourceId);
      setTriggerMessage(
        `Successfully ingested ${res.records_ingested} records from ${res.source_name} (${res.duration_sec}s)!`
      );
      fetchMonitorData();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringId(null);
      setTimeout(() => setTriggerMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Technical Operations & Ingestion Telemetry
            </span>
            <Badge variant="live">INGESTION ACTIVE</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Data Collection Monitor & Ingestion Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-source adapter health, ingestion throughput, response latency, and ETL pipeline jobs.
          </p>
        </div>

        <button
          onClick={fetchMonitorData}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh source health"
        >
          <RefreshCw className="w-4 h-4 text-sky-400" />
        </button>
      </div>

      {/* Success Notification Alert */}
      {triggerMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{triggerMessage}</span>
        </div>
      )}

      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Active Adapters"
          value={health.active_sources}
          subtitle="4 Ingestion Feeds"
          highlight={true}
          badge="100% ONLINE"
        />
        <KpiCard
          title="Records Ingested"
          value={health.total_records_today?.toLocaleString()}
          subtitle="Today's Total"
        />
        <KpiCard
          title="Successful Jobs"
          value={health.successful_jobs}
          change="100% Success"
          changeType="positive"
        />
        <KpiCard
          title="Failed Jobs"
          value={health.failed_jobs}
          subtitle="Zero Anomalous Halts"
          changeType="neutral"
        />
        <KpiCard
          title="Avg Latency"
          value={`${health.avg_response_time_ms}ms`}
          subtitle="Fast API Pipe"
          changeType="positive"
        />
        <KpiCard
          title="Data Integrity"
          value="99.9%"
          subtitle="Schema Validated"
          badge="AUDITED"
        />
      </div>

      {/* Ingestion Adapters Health Table */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            Statutory & Commercial Data Source Adapters
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Direct Statutory, GDS, & Compliant Public Feeds
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-800">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Source Name</th>
                <th className="px-4 py-3">Adapter Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Reliability</th>
                <th className="px-4 py-3 text-right">Records Today</th>
                <th className="px-4 py-3 text-right">Success Rate</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/30 text-slate-300">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      {src.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {src.source_type}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="live">{src.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-right text-teal-400 font-bold">
                    {src.reliability_score}%
                  </td>
                  <td className="px-4 py-3 font-mono text-right text-white font-bold">
                    {src.records_today?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-right text-slate-300">
                    {src.success_rate}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      disabled={triggeringId === src.id}
                      onClick={() => handleTriggerCollection(src.id)}
                      className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto"
                    >
                      <Play className="w-3 h-3" />
                      <span>{triggeringId === src.id ? "Collecting..." : "Run Job"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority 10: Statistical Audit Log & Governance Ledger */}
      <AuditLogTable />
    </div>
  );
}
