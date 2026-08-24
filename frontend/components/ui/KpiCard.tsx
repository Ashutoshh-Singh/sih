import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  period?: string;
  icon?: LucideIcon;
  tooltip?: string;
  badge?: string;
  highlight?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  subtitle,
  period,
  icon: Icon,
  tooltip,
  badge,
  highlight = false,
}) => {
  return (
    <div
      className={`relative rounded-xl p-5 transition-all duration-300 border ${
        highlight
          ? "bg-gradient-to-br from-slate-900/90 via-navy-800/90 to-slate-900/90 border-sky-500/40 shadow-glow"
          : "glass-panel hover:border-slate-600/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>{title}</span>
          {tooltip && (
            <div className="group relative cursor-help">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition-colors" />
              <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 text-[11px] leading-tight text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 pointer-events-none">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 text-sky-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </div>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {badge}
          </span>
        )}
      </div>

      {(change || subtitle || period) && (
        <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
          {change && (
            <div
              className={`flex items-center gap-1 font-semibold ${
                changeType === "positive"
                  ? "text-rose-400"
                  : changeType === "negative"
                  ? "text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              {changeType === "positive" && <TrendingUp className="w-3.5 h-3.5" />}
              {changeType === "negative" && <TrendingDown className="w-3.5 h-3.5" />}
              <span>{change}</span>
            </div>
          )}
          {period && <span className="text-slate-500 text-[10px]">{period}</span>}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
