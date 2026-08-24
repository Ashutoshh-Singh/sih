import React from "react";

interface BadgeProps {
  variant?: "live" | "verified" | "historical" | "demo" | "anomaly" | "valid" | "warning";
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "demo", children, className = "" }) => {
  const getStyles = () => {
    switch (variant) {
      case "live":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "verified":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "historical":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "anomaly":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse";
      case "warning":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "valid":
        return "bg-teal-500/15 text-teal-400 border-teal-500/30";
      case "demo":
      default:
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
  };

  const defaultText = {
    live: "● LIVE",
    verified: "VERIFIED DATASET",
    historical: "HISTORICAL",
    anomaly: "FLAGGED ANOMALY",
    warning: "DATA WARNING",
    valid: "VALIDATED",
    demo: "DEMO DATA",
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${getStyles()} ${className}`}
    >
      {children || defaultText}
    </span>
  );
};
