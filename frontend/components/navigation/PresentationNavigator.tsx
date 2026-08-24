"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  CheckCircle2,
  Tv
} from "lucide-react";

const PRESENTATION_STAGES = [
  { step: 1, title: "National Overview", path: "/overview", hint: "Show current National API & macro trend" },
  { step: 2, title: "3D Time-Travel Network", path: "/", hint: "Scrub historical timeline & network telemetry" },
  { step: 3, title: "Route Intelligence", path: "/route-explorer", hint: "Demonstrate DEL → BOM corridor fare analytics" },
  { step: 4, title: "Data Lineage & Provenance", path: "/live-fares", hint: "Trace 5-level lineage down to SHA-256 hash" },
  { step: 5, title: "Explain Index & Basket", path: "/index-engine", hint: "Deterministic attribution & basket simulator" },
  { step: 6, title: "Data Quality & ML Anomaly", path: "/data-quality", hint: "Isolation Forest & anomaly quarantine impact" },
  { step: 7, title: "CPI & Scenario Lab", path: "/cpi-simulator", hint: "Macroeconomic transport CPI pass-through" },
];

export const PresentationNavigator: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    const idx = PRESENTATION_STAGES.findIndex((s) => s.path === pathname);
    if (idx !== -1) {
      setCurrentStep(idx + 1);
    }
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToStep(Math.min(PRESENTATION_STAGES.length, currentStep + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToStep(Math.max(1, currentStep - 1));
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const goToStep = (stepNumber: number) => {
    const target = PRESENTATION_STAGES.find((s) => s.step === stepNumber);
    if (target) {
      setCurrentStep(stepNumber);
      router.push(target.path);
    }
  };

  const activeStage = PRESENTATION_STAGES[currentStep - 1];

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-in">
      <div className="pointer-events-auto max-w-2xl w-full p-4 rounded-2xl bg-slate-950/95 border border-sky-500/60 shadow-[0_0_30px_rgba(56,189,248,0.25)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-100">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Tv className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400">
                SIH Presentation Mode (Stage {currentStep} of {PRESENTATION_STAGES.length})
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Use [← / →]
              </span>
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activeStage.title}</span>
              <span className="text-xs text-slate-400 font-normal hidden sm:inline font-mono">
                — {activeStage.hint}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => goToStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToStep(Math.min(PRESENTATION_STAGES.length, currentStep + 1))}
            disabled={currentStep === PRESENTATION_STAGES.length}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono transition-colors disabled:opacity-30"
          >
            <span>NEXT STAGE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
            title="Exit Presentation Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
