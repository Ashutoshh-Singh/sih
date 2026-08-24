"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MoreVertical,
  UserCheck,
  Trash2,
  Sparkles,
  Edit2,
  Calendar,
  Building,
  Key
} from "lucide-react";
import { User, UserRole } from "../../types";
import { apiService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface UserManagementTableProps {
  users: User[];
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onRefresh,
  onOpenAddModal,
}) => {
  const { user: currentAuthUser, switchPersona } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      search === "" ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleToggleStatus = async (user: User) => {
    setIsUpdating(user.id);
    try {
      await apiService.updateUser(user.id, { is_active: !user.is_active });
      onRefresh();
    } catch (err) {
      console.error("Error toggling user status:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.username === "admin.system") {
      alert("Primary statutory system administrator cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to remove ${user.full_name} from the MoSPI directory?`)) {
      return;
    }
    setIsUpdating(user.id);
    try {
      await apiService.deleteUser(user.id);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || "Failed to remove officer.");
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "STATISTICAL_OFFICER":
        return { label: "Statistical Officer", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" };
      case "ECONOMIC_ADVISOR":
        return { label: "Economic Advisor", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "DATA_ENGINEER":
        return { label: "Data Engineer", color: "bg-teal-500/20 text-teal-300 border-teal-500/40" };
      case "SYSTEM_ADMIN":
        return { label: "System Admin", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      default:
        return { label: "Officer", color: "bg-slate-500/20 text-slate-300 border-slate-500/40" };
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-slate-800/80 p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Statutory Officer Directory
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              OFFICIAL ROSTER
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            MoSPI Personnel & Clearance Management
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Directory of statistical officers, economic advisors, and pipeline engineers with active credentials on the National Airfare Index system.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 text-xs font-mono font-bold hover:opacity-95 transition-opacity shadow-glow flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Onboard New Officer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, division..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Roles" },
            { id: "STATISTICAL_OFFICER", label: "Statistical Officers" },
            { id: "ECONOMIC_ADVISOR", label: "Economic Advisors" },
            { id: "DATA_ENGINEER", label: "Data Engineers" },
            { id: "SYSTEM_ADMIN", label: "Administrators" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                roleFilter === tab.id
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/70 text-slate-400 font-mono text-[11px]">
              <th className="p-3.5 pl-4 font-semibold">Officer Profile</th>
              <th className="p-3.5 font-semibold">Assigned Role</th>
              <th className="p-3.5 font-semibold">Division / Wing</th>
              <th className="p-3.5 font-semibold">Status</th>
              <th className="p-3.5 font-semibold">Last Active</th>
              <th className="p-3.5 pr-4 text-right font-semibold">Actions & Switcher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredUsers.map((u) => {
              const roleMeta = getRoleBadge(u.role);
              const isCurrentActive = currentAuthUser?.id === u.id;

              return (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-900/40 transition-colors ${
                    isCurrentActive ? "bg-sky-950/20" : ""
                  }`}
                >
                  {/* Officer Profile */}
                  <td className="p-3.5 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                        {u.avatar_initials || "GO"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{u.full_name}</span>
                          {isCurrentActive && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${roleMeta.color}`}>
                      {roleMeta.label}
                    </span>
                  </td>

                  {/* Department / Designation */}
                  <td className="p-3.5">
                    <div className="text-slate-200 font-medium">{u.designation}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.department}</div>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-mono font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Suspended
                      </span>
                    )}
                  </td>

                  {/* Last Active */}
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    {u.last_login
                      ? new Date(u.last_login).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today"
                      : "Never"}
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Switch Persona Button */}
                      <button
                        onClick={() => switchPersona(u.role)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all ${
                          isCurrentActive
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 cursor-default"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                        }`}
                        title="Assume this persona for testing/judging"
                      >
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>{isCurrentActive ? "Active Persona" : "Switch To"}</span>
                      </button>

                      {/* Status toggle */}
                      {u.username !== "admin.system" && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isUpdating === u.id}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                          title={u.is_active ? "Suspend Officer Access" : "Re-activate Officer Access"}
                        >
                          {u.is_active ? <XCircle className="w-3.5 h-3.5 text-amber-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      )}

                      {/* Delete */}
                      {u.username !== "admin.system" && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={isUpdating === u.id}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 transition-colors"
                          title="Remove Officer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
