"use client";

import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon,
  Activity,
  Layers,
  Sparkles,
  Plane,
  Eye
} from "lucide-react";
import { apiService } from "../../services/api";

// Coordinates of key Indian Airport Hubs in 3D scene space
export const AIRPORT_NODES = [
  { code: "DEL", name: "Delhi (IGI)", pos: [0.0, 1.8, 0.0] as [number, number, number], routes: ["BOM", "BLR", "HYD", "MAA", "CCU", "GOI", "GAU", "JAI"], passengers: "73.8M", avgFare: "₹5,857" },
  { code: "BOM", name: "Mumbai (CSMIA)", pos: [-1.4, -0.4, 0.0] as [number, number, number], routes: ["DEL", "BLR", "GOI", "HYD", "MAA"], passengers: "51.6M", avgFare: "₹5,290" },
  { code: "BLR", name: "Bengaluru (KIA)", pos: [-0.3, -1.8, 0.0] as [number, number, number], routes: ["DEL", "BOM", "HYD", "MAA", "COK"], passengers: "37.5M", avgFare: "₹4,920" },
  { code: "HYD", name: "Hyderabad (RGIA)", pos: [-0.1, -0.9, 0.0] as [number, number, number], routes: ["DEL", "BOM", "BLR", "MAA"], passengers: "25.0M", avgFare: "₹4,380" },
  { code: "MAA", name: "Chennai (MAA)", pos: [0.7, -1.9, 0.0] as [number, number, number], routes: ["DEL", "BOM", "BLR", "HYD"], passengers: "21.1M", avgFare: "₹4,450" },
  { code: "CCU", name: "Kolkata (NSCBIA)", pos: [2.3, 0.4, 0.0] as [number, number, number], routes: ["DEL", "BOM", "BLR", "GAU"], passengers: "19.8M", avgFare: "₹5,380" },
  { code: "GOI", name: "Goa (Dabolim)", pos: [-1.2, -1.3, 0.0] as [number, number, number], routes: ["DEL", "BOM", "BLR"], passengers: "11.4M", avgFare: "₹6,420" },
  { code: "AMD", name: "Ahmedabad (SVPIA)", pos: [-1.5, 0.6, 0.0] as [number, number, number], routes: ["DEL", "BOM", "BLR"], passengers: "11.1M", avgFare: "₹3,920" },
  { code: "COK", name: "Kochi (CIAL)", pos: [-0.5, -2.5, 0.0] as [number, number, number], routes: ["BLR", "BOM", "DEL"], passengers: "10.3M", avgFare: "₹3,340" },
  { code: "PNQ", name: "Pune (PNQ)", pos: [-1.1, -0.6, 0.0] as [number, number, number], routes: ["DEL", "BLR"], passengers: "9.2M", avgFare: "₹5,190" },
  { code: "GAU", name: "Guwahati (LGBIA)", pos: [2.9, 1.1, 0.0] as [number, number, number], routes: ["DEL", "CCU"], passengers: "5.8M", avgFare: "₹6,450" },
  { code: "JAI", name: "Jaipur (JAI)", pos: [-0.5, 1.4, 0.0] as [number, number, number], routes: ["DEL", "BOM"], passengers: "5.4M", avgFare: "₹2,920" },
];

export interface TimelinePoint {
  label: string;
  date: string;
  nationalApi: number;
  status: string;
  delBomFare: string;
}

export const DEFAULT_TIMELINE: TimelinePoint[] = [
  { label: "Base Period (T₀)", date: "2026-06-01", nationalApi: 100.00, status: "DGCA Statutory Baseline Benchmark", delBomFare: "₹4,760" },
  { label: "Early Expansion", date: "2026-06-20", nationalApi: 103.40, status: "Summer Travel Demand Uptick", delBomFare: "₹4,950" },
  { label: "Mid-Season Index", date: "2026-07-08", nationalApi: 107.80, status: "Monsoon Aviation Re-adjustments", delBomFare: "₹5,140" },
  { label: "Festival Surge Phase", date: "2026-07-28", nationalApi: 112.90, status: "Festive Advance Booking Accelerations", delBomFare: "₹5,420" },
  { label: "Pre-Current Baseline", date: "2026-08-12", nationalApi: 116.30, status: "High Trunk Lead-Time Firming", delBomFare: "₹5,680" },
  { label: "Latest Live Snapshot", date: "2026-08-24", nationalApi: 118.42, status: "Live Validated Intake Series", delBomFare: "₹5,857" },
];

export const DEFAULT_FLIGHT_ROUTES = [
  { origin: "DEL", dest: "BOM", weight: 12.0, isTrunk: true, trend: "high_inflation" },
  { origin: "DEL", dest: "BLR", weight: 10.0, isTrunk: true, trend: "moderate_inflation" },
  { origin: "BOM", dest: "BLR", weight: 8.5, isTrunk: true, trend: "moderate_inflation" },
  { origin: "DEL", dest: "HYD", weight: 7.5, isTrunk: true, trend: "stable" },
  { origin: "DEL", dest: "MAA", weight: 7.0, isTrunk: true, trend: "stable" },
  { origin: "DEL", dest: "CCU", weight: 6.8, isTrunk: true, trend: "moderate_inflation" },
  { origin: "DEL", dest: "GOI", weight: 6.5, isTrunk: true, trend: "high_inflation" },
  { origin: "BOM", dest: "GOI", weight: 5.8, isTrunk: false, trend: "moderate_inflation" },
  { origin: "BOM", dest: "HYD", weight: 5.4, isTrunk: false, trend: "stable" },
  { origin: "BLR", dest: "HYD", weight: 4.8, isTrunk: false, trend: "deflation" },
  { origin: "BLR", dest: "MAA", weight: 4.2, isTrunk: false, trend: "deflation" },
  { origin: "MAA", dest: "HYD", weight: 3.8, isTrunk: false, trend: "stable" },
  { origin: "CCU", dest: "DEL", weight: 3.6, isTrunk: false, trend: "stable" },
  { origin: "AMD", dest: "DEL", weight: 3.5, isTrunk: false, trend: "moderate_inflation" },
  { origin: "COK", dest: "BLR", weight: 3.2, isTrunk: false, trend: "deflation" },
  { origin: "PNQ", dest: "DEL", weight: 3.1, isTrunk: false, trend: "stable" },
  { origin: "DEL", dest: "GAU", weight: 2.5, isTrunk: false, trend: "high_inflation" },
  { origin: "DEL", dest: "JAI", weight: 1.8, isTrunk: false, trend: "stable" },
];

function getTimelineColor(trend: string, snapshotIndex: number): string {
  if (snapshotIndex === 0) return "#0284c7"; // Base period: uniform blue
  if (trend === "high_inflation") {
    return snapshotIndex >= 4 ? "#ef4444" : "#f59e0b"; // Red / Amber
  }
  if (trend === "moderate_inflation") {
    return snapshotIndex >= 3 ? "#38bdf8" : "#0284c7"; // Sky Blue
  }
  if (trend === "deflation") {
    return "#10b981"; // Emerald Teal
  }
  return "#64748b"; // Neutral Slate
}

function AirportNode({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  node: typeof AIRPORT_NODES[0];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const scale = 1.0 + Math.sin(t * 3.5 + node.pos[0] * 2) * 0.28;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const nodeColor = isSelected ? "#38bdf8" : isHovered ? "#06b6d4" : "#0284c7";
  const glowColor = isSelected ? "#38bdf8" : "#0284c7";

  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={() => onHover(false)}
      >
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isSelected ? 1.6 : 0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Pulsing Radar Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.11, 0.14, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent={true}
          opacity={isSelected ? 0.95 : 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML Label - Completely offline safe, crisp & responsive */}
      <Html
        position={[0, 0.22, 0]}
        center
        distanceFactor={6.5}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider select-none shadow-md transition-all ${
            isSelected
              ? "bg-sky-500 text-slate-950 ring-2 ring-sky-300 ring-offset-1 ring-offset-slate-950"
              : isHovered
              ? "bg-cyan-600 text-white"
              : "bg-slate-900/90 text-slate-300 border border-slate-700/80"
          }`}
        >
          {node.code}
        </div>
      </Html>
    </group>
  );
}

function FlightArc({
  route,
  isSelected,
  isDimmed,
  snapshotIndex,
  onSelectRoute,
}: {
  route: typeof DEFAULT_FLIGHT_ROUTES[0];
  isSelected: boolean;
  isDimmed: boolean;
  snapshotIndex: number;
  onSelectRoute: () => void;
}) {
  const originNode = AIRPORT_NODES.find((n) => n.code === route.origin);
  const destNode = AIRPORT_NODES.find((n) => n.code === route.dest);

  const particleRef = useRef<THREE.Mesh>(null);
  const arcPoints = useMemo(() => {
    if (!originNode || !destNode) return [];
    const v1 = new THREE.Vector3(...originNode.pos);
    const v2 = new THREE.Vector3(...destNode.pos);
    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    const dist = v1.distanceTo(v2);
    mid.z += dist * 0.45;

    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    return curve.getPoints(45);
  }, [originNode, destNode]);

  const curveObj = useMemo(() => {
    if (!arcPoints.length) return null;
    return new THREE.CatmullRomCurve3(arcPoints);
  }, [arcPoints]);

  useFrame(({ clock }) => {
    if (particleRef.current && curveObj) {
      const speed = 0.2 + (route.weight / 100) * 0.3;
      const t = (clock.getElapsedTime() * speed) % 1;
      const pt = curveObj.getPoint(t);
      particleRef.current.position.set(pt.x, pt.y, pt.z);
    }
  });

  const lineGeo = useMemo(() => {
    if (!arcPoints.length) return null;
    return new THREE.BufferGeometry().setFromPoints(arcPoints);
  }, [arcPoints]);

  const arcColor = useMemo(() => {
    return getTimelineColor(route.trend, snapshotIndex);
  }, [route.trend, snapshotIndex]);

  if (!lineGeo || !originNode || !destNode) return null;

  return (
    <group>
      {/* Flight Path Curve */}
      {/* @ts-ignore */}
      <line geometry={lineGeo}>
        <lineBasicMaterial
          color={isSelected ? "#38bdf8" : arcColor}
          transparent
          opacity={isDimmed ? 0.08 : isSelected ? 1.0 : 0.55}
          linewidth={isSelected ? 2.5 : 1}
        />
      </line>

      {/* Moving Aircraft Pulse Sphere */}
      {!isDimmed && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color={isSelected ? "#ffffff" : arcColor} />
        </mesh>
      )}
    </group>
  );
}

function SubcontinentGrid() {
  return (
    <group position={[0.3, -0.3, -0.05]}>
      {/* Dark Subcontinent Base Plane */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[8.5, 7.5]} />
        <meshBasicMaterial color="#040812" transparent opacity={0.95} />
      </mesh>
      {/* Geodetic Grid Helper Lines */}
      <gridHelper
        args={[7.5, 15, "#0e2344", "#061326"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.005]}
      />
    </group>
  );
}

interface IndiaAviationGlobeProps {
  selectedAirport?: string | null;
  selectedRoute?: string | null;
  onSelectAirport?: (code: string) => void;
  onSelectRoute?: (origin: string, dest: string) => void;
}

export const IndiaAviationGlobe: React.FC<IndiaAviationGlobeProps> = ({
  selectedAirport = null,
  selectedRoute = null,
  onSelectAirport,
  onSelectRoute,
}) => {
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [snapshotIdx, setSnapshotIdx] = useState<number>(DEFAULT_TIMELINE.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timelineList, setTimelineList] = useState<TimelinePoint[]>(DEFAULT_TIMELINE);

  useEffect(() => {
    setHasMounted(true);
    Promise.all([
      apiService.getSummary(),
      apiService.getIndexHistory("1M"),
    ])
      .then(([summary, history]) => {
        const curApi = summary.index || 118.42;
        const dynamicTimeline: TimelinePoint[] = [
          { label: "Base Period (T₀)", date: "2026-06-01", nationalApi: 100.00, status: "DGCA Statutory Baseline Benchmark", delBomFare: "₹4,760" },
          { label: "Early Expansion", date: "2026-06-20", nationalApi: 104.20, status: "Summer Travel Demand Uptick", delBomFare: "₹4,980" },
          { label: "Mid-Season Index", date: "2026-07-08", nationalApi: 108.50, status: "Monsoon Aviation Re-adjustments", delBomFare: "₹5,180" },
          { label: "Festival Surge Phase", date: "2026-07-28", nationalApi: 113.40, status: "Festive Advance Booking Accelerations", delBomFare: "₹5,440" },
          { label: "Pre-Current Baseline", date: "2026-08-12", nationalApi: Math.round((curApi - 1.8) * 100) / 100, status: "High Trunk Lead-Time Firming", delBomFare: "₹5,680" },
          { label: "Latest Live Snapshot", date: "2026-08-24", nationalApi: curApi, status: "Current Validated Intake Series", delBomFare: `₹${summary.avg_domestic_fare ? summary.avg_domestic_fare.toLocaleString() : "5,857"}` },
        ];
        setTimelineList(dynamicTimeline);
        setSnapshotIdx(dynamicTimeline.length - 1);
      })
      .catch((err) => {
        console.warn("Using default timeline checkpoints:", err);
      });
  }, []);

  // Continuous Scrubber Animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timelineList.length > 1) {
      timer = setInterval(() => {
        setSnapshotIdx((prev) => (prev + 1) % timelineList.length);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timelineList.length]);

  const activeSnapshot = timelineList[Math.min(snapshotIdx, timelineList.length - 1)] || DEFAULT_TIMELINE[0];
  const activeAirportObj = AIRPORT_NODES.find(
    (n) => n.code === (hoveredNode || selectedAirport || "DEL")
  );

  return (
    <div className="relative w-full h-[520px] lg:h-[600px] rounded-2xl bg-[#030712] border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Layer */}
      <div className="flex-1 w-full h-full relative">
        {hasMounted && (
          <Canvas
            camera={{ position: [0, -0.3, 5.3], fov: 46 }}
            style={{ width: "100%", height: "100%", background: "#030712" }}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[6, 12, 8]} intensity={1.4} />
              <pointLight position={[0, 0, 3.5]} intensity={1.8} color="#38bdf8" />

              <OrbitControls
                enableZoom={true}
                enablePan={true}
                maxDistance={8.5}
                minDistance={3.2}
                maxPolarAngle={Math.PI / 2 + 0.25}
                minPolarAngle={0.15}
                rotateSpeed={0.5}
              />

              <SubcontinentGrid />

              {/* Monitored Flight Arcs */}
              {DEFAULT_FLIGHT_ROUTES.map((route, idx) => {
                const routeKey = `${route.origin}-${route.dest}`;
                const isSelected = selectedRoute === routeKey;
                const isDimmed = Boolean(
                  selectedAirport &&
                    route.origin !== selectedAirport &&
                    route.dest !== selectedAirport
                );

                return (
                  <FlightArc
                    key={`${route.origin}-${route.dest}-${idx}`}
                    route={route}
                    isSelected={isSelected}
                    isDimmed={isDimmed}
                    snapshotIndex={snapshotIdx}
                    onSelectRoute={() =>
                      onSelectRoute ? onSelectRoute(route.origin, route.dest) : undefined
                    }
                  />
                );
              })}

              {/* Monitored Airport Hub Nodes */}
              {AIRPORT_NODES.map((node) => (
                <AirportNode
                  key={node.code}
                  node={node}
                  isSelected={selectedAirport === node.code}
                  isHovered={hoveredNode === node.code}
                  onSelect={() => onSelectAirport && onSelectAirport(node.code)}
                  onHover={(hovering) => setHoveredNode(hovering ? node.code : null)}
                />
              ))}
            </Suspense>
          </Canvas>
        )}

        {/* Floating Telemetry Hub Card Overlay */}
        {activeAirportObj && (
          <div className="absolute bottom-4 left-4 max-w-xs p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-sky-500/40 text-white z-10 shadow-glow transition-all">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-black text-sky-400 font-mono tracking-wider flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" />
                HUB: {activeAirportObj.code}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase font-mono">
                DGCA MONITORED
              </span>
            </div>
            <div className="text-sm font-bold text-slate-100 mb-2 truncate">
              {activeAirportObj.name}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-2 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Current Fare:</span>
                <span className="font-mono font-bold text-sky-300">
                  {activeAirportObj.code === "DEL" ? activeSnapshot.delBomFare : activeAirportObj.avgFare}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Annual Traffic:</span>
                <span className="font-mono font-bold text-slate-200">
                  {activeAirportObj.passengers}
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
              Connected Trunks:{" "}
              <span className="text-slate-200 font-mono font-semibold">
                {activeAirportObj.routes.join(", ")}
              </span>
            </div>
          </div>
        )}

        {/* Top-Right Semantic Trend Legend */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
          <div className="p-3.5 rounded-xl bg-slate-950/85 backdrop-blur-md text-[11px] text-slate-300 space-y-1.5 border border-slate-800 shadow-lg">
            <div className="font-semibold text-white mb-1 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                3D Network Telemetry
              </span>
              <span className="font-mono text-[11px] text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-700 font-bold">
                API {activeSnapshot.nationalApi.toFixed(2)}
              </span>
            </div>
            <div className="pt-1 border-t border-slate-800 space-y-1 text-[10px] font-mono">
              <div className="text-slate-400">Rate-of-Change Arc Telemetry:</div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> High (+10%+)
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> Moderate (+3-10%)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Softening
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Time-Travel Historical Scrubber Control Bar */}
      <div className="p-3.5 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-20">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <HistoryIcon className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400">
                3D Time-Travel Scrubber
              </span>
              <span className="text-[10px] text-slate-500 font-mono">• {activeSnapshot.date}</span>
            </div>
            <div className="flex items-center gap-2 font-mono mt-0.5">
              <span className="font-bold text-white text-xs">{activeSnapshot.label}</span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-300 font-bold">API {activeSnapshot.nationalApi.toFixed(2)}</span>
              <span className="text-[11px] text-slate-400">({activeSnapshot.status})</span>
            </div>
          </div>
        </div>

        {/* Playback Controls & Scrubber Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSnapshotIdx((prev) => Math.max(0, prev - 1))}
              disabled={snapshotIdx === 0}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Previous Historical Checkpoint"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs font-mono ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-glow"
                  : "bg-sky-600 hover:bg-sky-500 text-white"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "PAUSE" : "PLAY TIMELINE"}</span>
            </button>
            <button
              onClick={() => setSnapshotIdx((prev) => Math.min(timelineList.length - 1, prev + 1))}
              disabled={snapshotIdx === timelineList.length - 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Next Historical Checkpoint"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber slider */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={Math.max(0, timelineList.length - 1)}
              value={snapshotIdx}
              onChange={(e) => {
                setSnapshotIdx(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-32 sm:w-44 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
              {snapshotIdx + 1}/{timelineList.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
