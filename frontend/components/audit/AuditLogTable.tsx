"use client";

import React, { useState, useEffect } from "react";
import {
  FileCode,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  User,
  Clock
} from "lucide-react";
import { apiService } from "../../services/api";
import { AuditLogEntry } from "../../types";

export const AuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    apiService
      .getAuditLogs(activeFilter)
      .then((res) => setLogs(res))
      .catch((err) => console.error("Error loading audit logs:", err))
      .finally(() => setIsLoading(false));
  }, [activeFilter]);

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Governance & Traceability
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              IMMUTABLE LEDGER
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Statistical Audit Log & Pipeline Event History
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Complete cryptographic audit trail of all manual reviews, automated ETL refreshes, basket simulations, and statistical updates.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          {["ALL", "ANOMALY_REVIEW", "PIPELINE_REFRESH", "BASKET_SIMULATION", "INDEX_RECALCULATION"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeFilter === f
                    ? "bg-sky-600 text-white font-bold"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-xl border border-slate-800/80 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action Type</th>
              <th className="p-3">User Role</th>
              <th className="p-3">Affected Entity</th>
              <th className="p-3">Event Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 font-mono">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/40">
                <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 text-[10px] font-bold">
                    {log.action_type}
                  </span>
                </td>
                <td className="p-3 text-slate-300 font-sans">{log.user_role}</td>
                <td className="p-3 font-bold text-white">{log.affected_entity}</td>
                <td className="p-3 text-slate-300 font-sans text-xs">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
