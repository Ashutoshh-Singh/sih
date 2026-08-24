"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  RefreshCw,
  Sparkles,
  Radio,
  GitFork,
  Printer,
  Menu,
  X,
  LayoutDashboard,
  Compass,
  PlaneTakeoff,
  Calculator,
  BarChart3,
  ShieldCheck,
  Cpu,
  Activity,
  Building,
  Users,
  UserCheck,
  ChevronDown,
  Lock,
  ArrowRight
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { DataLineageModal } from "../lineage/DataLineageModal";
import { ExportBriefModal } from "../export/ExportBriefModal";
import { PresentationNavigator } from "./PresentationNavigator";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";

interface HeaderProps {
  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Route Explorer", href: "/route-explorer", icon: Compass },
  { name: "Live Fares", href: "/live-fares", icon: PlaneTakeoff },
  { name: "Airfare Index", href: "/index-engine", icon: Calculator },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Data Quality", href: "/data-quality", icon: ShieldCheck },
  { name: "CPI Simulator", href: "/cpi-simulator", icon: Cpu },
  { name: "Data Monitor", href: "/data-monitor", icon: Activity },
  { name: "User Governance", href: "/users", icon: Users, badge: "RBAC" },
];

export const Header: React.FC<HeaderProps> = ({
  isPresentationMode,
  setIsPresentationMode,
}) => {
  const { user, role, switchPersona, isLoading: isAuthLoading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLineageOpen, setIsLineageOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(14);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 60 ? 5 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSecondsAgo(1);
      setIsRefreshing(false);
    }, 600);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case "STATISTICAL_OFFICER":
        return { label: "Statistical Officer", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" };
      case "ECONOMIC_ADVISOR":
        return { label: "Economic Advisor", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "DATA_ENGINEER":
        return { label: "Data Engineer", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" };
      case "SYSTEM_ADMIN":
        return { label: "System Admin", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
      default:
        return { label: "Officer", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    }
  };

  const activeRoleMeta = getRoleBadge(role);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-xl">
        {/* Left: Hamburger (Mobile) + Ministry Branding */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 md:hidden hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-radar relative">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100 tracking-wide flex items-center gap-2">
                MoSPI Airfare Intelligence
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  SIH 2026
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                National Airfare Price Index for CPI Augmentation
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Ingestion Online
            </span>
            <span className="text-slate-600">•</span>
            <span>18 Corridors</span>
            <span className="text-slate-600">•</span>
            <span>18,900+ Observations</span>
          </div>
        </div>

        {/* Right Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Lineage Drill-down Action */}
          <button
            onClick={() => setIsLineageOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-700/60 text-xs font-mono font-bold transition-colors"
            title="Inspect 5-level statistical data lineage"
          >
            <GitFork className="w-3.5 h-3.5 text-sky-400" />
            <span>Lineage</span>
          </button>

          {/* Export Statistical Brief */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono transition-colors"
            title="Export validated printable statistical brief"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Brief</span>
          </button>

          {/* Data Freshness Indicator & Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
            title="Refresh national telemetry"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-sky-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden md:inline text-[11px] font-mono">{secondsAgo}s ago</span>
          </button>

          {/* Presentation Mode Toggle */}
          <button
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isPresentationMode
                ? "bg-gradient-to-r from-sky-600 to-cyan-500 text-slate-950 border-sky-400 shadow-glow font-bold"
                : "bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500"
            }`}
            title="Toggle SIH Presentation Mode for clean judging flow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPresentationMode ? "Presentation ON" : "Presentation Mode"}
            </span>
          </button>

          {/* Officer Persona Profile Dropdown Trigger */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-xs"
              title="Active MoSPI Officer Identity & Persona Switcher"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 text-slate-950 font-bold flex items-center justify-center text-[11px] shadow-sm">
                {user?.avatar_initials || "RS"}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[11px] font-bold text-white truncate max-w-[110px]">
                  {user?.full_name.split(" ")[0]} {user?.full_name.split(" ")[1] || ""}
                </span>
                <span className="text-[9px] text-sky-300 font-mono">
                  {activeRoleMeta.label}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {/* Officer Persona Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#090e18] border border-slate-700/90 shadow-2xl p-3 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active Officer Header */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{user?.full_name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border ${activeRoleMeta.color}`}>
                      {activeRoleMeta.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.designation}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{user?.department}</div>
                </div>

                {/* 1-Click Persona Switcher for Presentation Demo */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider px-1">
                    <span>1-Click Persona Switcher</span>
                    <span className="text-slate-500 font-normal">SIH DEMO</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    {[
                      {
                        role: "STATISTICAL_OFFICER" as UserRole,
                        name: "Dr. Rajesh Sharma",
                        title: "Senior Statistical Officer",
                        color: "hover:border-sky-500/50 hover:bg-sky-950/40",
                      },
                      {
                        role: "ECONOMIC_ADVISOR" as UserRole,
                        name: "Dr. Arvind Subramanian",
                        title: "Chief Economic Advisor",
                        color: "hover:border-amber-500/50 hover:bg-amber-950/40",
                      },
                      {
                        role: "DATA_ENGINEER" as UserRole,
                        name: "Priya Venkat",
                        title: "Lead Data Pipeline Architect",
                        color: "hover:border-teal-500/50 hover:bg-teal-950/40",
                      },
                      {
                        role: "SYSTEM_ADMIN" as UserRole,
                        name: "Amitabh Kant",
                        title: "Principal System Administrator",
                        color: "hover:border-purple-500/50 hover:bg-purple-950/40",
                      },
                    ].map((p) => {
                      const isCurrent = role === p.role;
                      return (
                        <button
                          key={p.role}
                          onClick={() => {
                            switchPersona(p.role);
                            setIsUserMenuOpen(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                            isCurrent
                              ? "bg-sky-500/20 border-sky-500/60 text-white font-bold"
                              : `bg-slate-900/40 border-slate-800/80 text-slate-300 ${p.color}`
                          }`}
                        >
                          <div className="leading-tight">
                            <span className="block text-[11px] font-medium">{p.name}</span>
                            <span className="block text-[9px] text-slate-400 font-mono">{p.title}</span>
                          </div>
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Link to User Management Page */}
                <div className="pt-2 mt-2 border-t border-slate-800">
                  <Link
                    href="/users"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-300 font-mono text-[11px] font-bold transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Manage Officer Directory & RBAC
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/80 backdrop-blur-md animate-fade-in flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-sm text-white">MoSPI Navigation</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-2 overflow-y-auto bg-slate-950 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <DataLineageModal isOpen={isLineageOpen} onClose={() => setIsLineageOpen(false)} />
      <ExportBriefModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <PresentationNavigator isOpen={isPresentationMode} onClose={() => setIsPresentationMode(false)} />
    </>
  );
};
