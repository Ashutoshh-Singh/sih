"use client";

import React, { useState } from "react";
import { X, UserPlus, ShieldCheck, Building, Mail, User, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiService } from "../../services/api";
import { UserRole } from "../../types";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("Price Statistics Division (PSD)");
  const [role, setRole] = useState<UserRole>("STATISTICAL_OFFICER");
  const [password, setPassword] = useState("MoSPI@2026");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !designation) {
      setError("Please fill out all required official credentials.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiService.createUser({
        full_name: fullName,
        username,
        email,
        designation,
        department,
        role,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onUserAdded();
        onClose();
        // Reset form
        setFullName("");
        setUsername("");
        setEmail("");
        setDesignation("");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to onboard officer. Verify uniqueness of username and email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#090e18] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Onboard New Statistical Officer</h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Ministry of Statistics & Programme Implementation Roster
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Officer credentials successfully provisioned to MoSPI directory!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                Officer Full Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Chandra"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!username && e.target.value) {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.\.+/g, "."));
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Official Username */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                Official Username *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ramesh.chandra"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Official Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                Government Email *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ramesh.c@mospi.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                Official Designation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Statistical Officer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department / Division */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                Ministry Division / Wing
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
              >
                <option value="Price Statistics Division (PSD)">Price Statistics Division (PSD)</option>
                <option value="National Accounts Division (NAD)">National Accounts Division (NAD)</option>
                <option value="DGCA Aviation Interface Team">DGCA Aviation Interface Team</option>
                <option value="Statistical IT Infrastructure & Security Cell">Statistical IT & Security Cell</option>
                <option value="Macroeconomic Modeling Unit">Macroeconomic Modeling Unit</option>
              </select>
            </div>

            {/* RBAC Role */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                Assigned RBAC Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
              >
                <option value="STATISTICAL_OFFICER">Statistical Officer (Validation & Quality)</option>
                <option value="ECONOMIC_ADVISOR">Economic Advisor (CPI & Macro Release)</option>
                <option value="DATA_ENGINEER">Data Engineer (Ingestion & Pipelines)</option>
                <option value="SYSTEM_ADMIN">System Administrator (Full Clearances)</option>
              </select>
            </div>
          </div>

          {/* Initial Temporary Credential */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-mono text-slate-400 block">
              Default Initial Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300 font-mono text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-mono text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Provisioning..." : "Provision Officer Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
