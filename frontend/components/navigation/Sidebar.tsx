"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  PlaneTakeoff,
  Calculator,
  BarChart3,
  ShieldCheck,
  Cpu,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  Building,
  Users,
} from "lucide-react";

interface SidebarProps {
  isPresentationMode?: boolean;
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

export const Sidebar: React.FC<SidebarProps> = ({ isPresentationMode = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex relative flex-col border-r border-slate-800/80 bg-[#070b12]/95 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-glow shrink-0">
            <Building className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-black tracking-widest text-slate-200 uppercase">
                MoSPI Airfare Index
              </span>
              <span className="text-[10px] text-sky-400 font-mono tracking-wider font-semibold">
                SIH 2026 PROTOTYPE
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === "/overview" && pathname === "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? "bg-gradient-to-r from-sky-600/20 to-cyan-500/10 text-sky-300 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isActive
                          ? "bg-sky-500/30 text-sky-200"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg border border-slate-700 hidden group-hover:block z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      {!collapsed && (
        <div className="p-3 m-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Engine Online
            </span>
            <span className="text-[10px] font-mono text-slate-500">v2.6.4</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Deterministic Laspeyres & ML Quality Ingestion Active
          </p>
        </div>
      )}
    </aside>
  );
};
