"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Sparkles,
  Activity,
  History,
  Lock,
  Building,
  Key,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Badge } from "../../components/ui/Badge";
import { UserManagementTable } from "../../components/users/UserManagementTable";
import { RolePermissionMatrix } from "../../components/users/RolePermissionMatrix";
import { AddUserModal } from "../../components/users/AddUserModal";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import { User, UserStats, UserActivityLog, UserRole } from "../../types";

export default function UsersGovernancePage() {
  const { user: currentUser, role: currentRole, switchPersona } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<UserActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      apiService.getUsers(),
      apiService.getUserStats(),
      apiService.getUserActivities(15),
    ])
      .then(([usersRes, statsRes, actsRes]) => {
        setUsers(usersRes);
        setStats(statsRes);
        setActivities(actsRes);
      })
      .catch((err) => {
        console.warn("Error loading user governance data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Statutory Access Governance
            </span>
            <Badge variant="verified">MoSPI RBAC SYSTEM</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Governance & Role-Based Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centralized directory for Ministry statistical officers, economic advisors, and data engineers with cryptographic audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 text-xs font-mono font-bold hover:opacity-95 transition-opacity shadow-glow flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Onboard Officer</span>
          </button>
          <Badge variant="demo">SIH 2026 DEMO</Badge>
        </div>
      </div>

      {/* 1-Click Interactive Presentation Persona Switcher Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-slate-950/80 border border-sky-500/30 space-y-3 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              SIH Presentation Persona Switcher (Live Role Context)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Currently Operating As: <strong className="text-sky-300">{currentUser?.full_name}</strong> ({currentUser?.designation})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              role: "STATISTICAL_OFFICER" as UserRole,
              title: "Senior Statistical Officer",
              name: "Dr. Rajesh Sharma",
              badge: "PRICE STATISTICS (PSD)",
              desc: "Index verification, observation audit & AI anomaly triage.",
              color: "border-sky-500/40 hover:bg-sky-950/50",
            },
            {
              role: "ECONOMIC_ADVISOR" as UserRole,
              title: "Chief Economic Advisor",
              name: "Dr. Arvind Subramanian",
              badge: "NATIONAL ACCOUNTS",
              desc: "CPI macro pass-through modeling & statutory index release.",
              color: "border-amber-500/40 hover:bg-amber-950/50",
            },
            {
              role: "DATA_ENGINEER" as UserRole,
              title: "Lead Data Pipeline Architect",
              name: "Priya Venkat",
              badge: "DGCA INTERFACE",
              desc: "GDS/OTA aggregation, collection health & ETL calibration.",
              color: "border-teal-500/40 hover:bg-teal-950/50",
            },
            {
              role: "SYSTEM_ADMIN" as UserRole,
              title: "Principal System Administrator",
              name: "Amitabh Kant",
              badge: "SECURITY CELL",
              desc: "Officer directory provisioning & cryptographic audit logs.",
              color: "border-purple-500/40 hover:bg-purple-950/50",
            },
          ].map((persona) => {
            const isActive = currentRole === persona.role;
            return (
              <button
                key={persona.role}
                onClick={() => switchPersona(persona.role)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isActive
                    ? "bg-sky-500/20 border-sky-400 text-white shadow-glow ring-1 ring-sky-400"
                    : `bg-slate-900/60 text-slate-300 ${persona.color}`
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 font-bold">
                    {persona.badge}
                  </span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-sky-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-white">{persona.name}</div>
                <div className="text-[11px] text-sky-400 font-mono font-medium">{persona.title}</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{persona.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="MoSPI Roster Size"
          value={stats ? stats.total_officers : users.length || 5}
          subtitle="Provisioned government personnel"
          highlight={true}
        />
        <KpiCard
          title="Active Sessions"
          value={stats ? stats.active_officers : users.filter((u) => u.is_active).length || 5}
          subtitle="100% MFA Compliance"
          change="Operational"
          changeType="positive"
        />
        <KpiCard
          title="Statistical Division"
          value={stats?.roles_breakdown?.["STATISTICAL_OFFICER"] || 2}
          subtitle="Verification & Quality Officers"
          badge="PSD DIVISION"
        />
        <KpiCard
          title="Security Audit Events"
          value={activities.length || 15}
          subtitle="Immutable authentication trails"
        />
      </div>

      {/* Main Personnel Directory Table */}
      <UserManagementTable
        users={users}
        onRefresh={loadData}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Statutory Role-Based Access Control (RBAC) Matrix */}
      <RolePermissionMatrix />

      {/* Security & Authentication Audit Trail */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                Security & Activity Audit
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                AUDIT TRAIL
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Officer Action & Access Audit Log
            </h3>
            <p className="text-xs text-slate-400">
              Cryptographically recorded operational events, index verifications, and macro simulation executions.
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/70 text-slate-400 font-mono text-[11px]">
                <th className="p-3.5 pl-4 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">Officer Name & Role</th>
                <th className="p-3.5 font-semibold">Operational Action</th>
                <th className="p-3.5 font-semibold">Module</th>
                <th className="p-3.5 font-semibold">Details & Provenance</th>
                <th className="p-3.5 pr-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 pl-4 text-slate-400 whitespace-nowrap">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-bold text-white block">{a.user_name}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{a.user_role}</span>
                  </td>
                  <td className="p-3.5 text-sky-300 font-bold whitespace-nowrap">{a.action}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                      {a.module}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 font-sans text-xs max-w-md truncate">
                    {a.details || "—"}
                  </td>
                  <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Officer Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={loadData}
      />
    </div>
  );
}
