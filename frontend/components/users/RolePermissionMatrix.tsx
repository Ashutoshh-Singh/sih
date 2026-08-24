"use client";

import React from "react";
import { Check, X, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";

interface PermissionRow {
  name: string;
  description: string;
  category: "STATISTICAL" | "POLICY" | "DATA_OPS" | "ADMIN";
  officer: boolean;
  advisor: boolean;
  engineer: boolean;
  admin: boolean;
}

const PERMISSIONS_DATA: PermissionRow[] = [
  {
    name: "Observation & Index Exploration",
    description: "Inspect multi-source lead-time curves, representative fares, and corridor relative indices.",
    category: "STATISTICAL",
    officer: true,
    advisor: true,
    engineer: true,
    admin: true,
  },
  {
    name: "Export Printable Statistical Brief",
    description: "Generate and print MoSPI official PDF/summary briefs with cryptographic snapshot hashes.",
    category: "STATISTICAL",
    officer: true,
    advisor: true,
    engineer: false,
    admin: true,
  },
  {
    name: "AI IsolationForest Anomaly Triage",
    description: "Review, accept, or quarantine flagged surge outliers (>3σ corridor deviation).",
    category: "STATISTICAL",
    officer: true,
    advisor: false,
    engineer: true,
    admin: true,
  },
  {
    name: "CPI Macro Shock Simulator",
    description: "Simulate passenger airfare pass-through into Headline CPI Transport subgroups.",
    category: "POLICY",
    officer: false,
    advisor: true,
    engineer: false,
    admin: true,
  },
  {
    name: "Statutory Monthly Index Sign-Off",
    description: "Authorize formal release of the weighted Laspeyres National Airfare Price Index.",
    category: "POLICY",
    officer: false,
    advisor: true,
    engineer: false,
    admin: true,
  },
  {
    name: "Ingestion Pipeline Calibration",
    description: "Trigger on-demand collection jobs and calibrate GDS/OTA aggregator rate limits.",
    category: "DATA_OPS",
    officer: false,
    advisor: false,
    engineer: true,
    admin: true,
  },
  {
    name: "Data Lineage & Provenance Audit",
    description: "Trace fare values across 5 distinct transformation and normalization layers.",
    category: "DATA_OPS",
    officer: true,
    advisor: true,
    engineer: true,
    admin: true,
  },
  {
    name: "Officer Account & RBAC Security",
    description: "Onboard new statistical officers, modify clearance levels, and review security audit logs.",
    category: "ADMIN",
    officer: false,
    advisor: false,
    engineer: false,
    admin: true,
  },
];

export const RolePermissionMatrix: React.FC = () => {
  const { role: activeRole } = useAuth();

  const isRoleActive = (r: UserRole) => activeRole === r;

  return (
    <div className="rounded-2xl glass-panel border border-slate-800/80 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Statutory Governance Matrix
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              MoSPI RBAC SPEC
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Role-Based Access Control (RBAC) Permission Matrix
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Granular statutory clearances governing index compilation, AI anomaly moderation, pipeline executions, and executive sign-offs.
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-mono text-[11px]">
              <th className="p-3.5 pl-4 font-semibold w-2/5">Capability / Operational Action</th>
              <th
                className={`p-3.5 text-center font-bold transition-all ${
                  isRoleActive("STATISTICAL_OFFICER")
                    ? "bg-sky-500/15 text-sky-300 border-x border-sky-500/40"
                    : "text-slate-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Statistical Officer</span>
                  {isRoleActive("STATISTICAL_OFFICER") && (
                    <span className="text-[9px] text-sky-400 font-bold uppercase mt-0.5">● Active Persona</span>
                  )}
                </div>
              </th>
              <th
                className={`p-3.5 text-center font-bold transition-all ${
                  isRoleActive("ECONOMIC_ADVISOR")
                    ? "bg-amber-500/15 text-amber-300 border-x border-amber-500/40"
                    : "text-slate-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Economic Advisor</span>
                  {isRoleActive("ECONOMIC_ADVISOR") && (
                    <span className="text-[9px] text-amber-400 font-bold uppercase mt-0.5">● Active Persona</span>
                  )}
                </div>
              </th>
              <th
                className={`p-3.5 text-center font-bold transition-all ${
                  isRoleActive("DATA_ENGINEER")
                    ? "bg-teal-500/15 text-teal-300 border-x border-teal-500/40"
                    : "text-slate-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Data Engineer</span>
                  {isRoleActive("DATA_ENGINEER") && (
                    <span className="text-[9px] text-teal-400 font-bold uppercase mt-0.5">● Active Persona</span>
                  )}
                </div>
              </th>
              <th
                className={`p-3.5 text-center font-bold transition-all ${
                  isRoleActive("SYSTEM_ADMIN")
                    ? "bg-purple-500/15 text-purple-300 border-x border-purple-500/40"
                    : "text-slate-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>System Admin</span>
                  {isRoleActive("SYSTEM_ADMIN") && (
                    <span className="text-[9px] text-purple-400 font-bold uppercase mt-0.5">● Active Persona</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {PERMISSIONS_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3.5 pl-4">
                  <div className="font-semibold text-slate-100">{row.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{row.description}</div>
                </td>
                <td
                  className={`p-3.5 text-center ${
                    isRoleActive("STATISTICAL_OFFICER") ? "bg-sky-500/5 border-x border-sky-500/30 font-bold" : ""
                  }`}
                >
                  {row.officer ? (
                    <span className="inline-flex p-1 rounded bg-emerald-500/20 text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </td>
                <td
                  className={`p-3.5 text-center ${
                    isRoleActive("ECONOMIC_ADVISOR") ? "bg-amber-500/5 border-x border-amber-500/30 font-bold" : ""
                  }`}
                >
                  {row.advisor ? (
                    <span className="inline-flex p-1 rounded bg-emerald-500/20 text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </td>
                <td
                  className={`p-3.5 text-center ${
                    isRoleActive("DATA_ENGINEER") ? "bg-teal-500/5 border-x border-teal-500/30 font-bold" : ""
                  }`}
                >
                  {row.engineer ? (
                    <span className="inline-flex p-1 rounded bg-emerald-500/20 text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </td>
                <td
                  className={`p-3.5 text-center ${
                    isRoleActive("SYSTEM_ADMIN") ? "bg-purple-500/5 border-x border-purple-500/30 font-bold" : ""
                  }`}
                >
                  {row.admin ? (
                    <span className="inline-flex p-1 rounded bg-emerald-500/20 text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
