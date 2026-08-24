import React, { useState, useEffect } from "react";
import { Search, Plane, MapPin, X, ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_DATA = [
  { type: "airport", code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", region: "North" },
  { type: "airport", code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", region: "West" },
  { type: "airport", code: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", region: "South" },
  { type: "airport", code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", region: "South" },
  { type: "airport", code: "MAA", name: "Chennai International Airport", city: "Chennai", region: "South" },
  { type: "airport", code: "CCU", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata", region: "East" },
  { type: "airport", code: "GOI", name: "Dabolim / Manohar International Airport", city: "Goa", region: "West" },
  { type: "airport", code: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", region: "West" },
  { type: "airport", code: "COK", name: "Cochin International Airport", city: "Kochi", region: "South" },
  { type: "airport", code: "PNQ", name: "Pune International Airport", city: "Pune", region: "West" },
  { type: "route", origin: "DEL", dest: "BOM", label: "Delhi → Mumbai", category: "Domestic Trunk Corridor" },
  { type: "route", origin: "DEL", dest: "BLR", label: "Delhi → Bengaluru", category: "Domestic Trunk Corridor" },
  { type: "route", origin: "BOM", dest: "BLR", label: "Mumbai → Bengaluru", category: "Domestic Trunk Corridor" },
  { type: "route", origin: "DEL", dest: "GOI", label: "Delhi → Goa", category: "Domestic Leisure Corridor" },
  { type: "route", origin: "DEL", dest: "HYD", label: "Delhi → Hyderabad", category: "Domestic Metro Corridor" },
  { type: "airline", code: "6E", name: "IndiGo", category: "Scheduled Domestic Airline" },
  { type: "airline", code: "AI", name: "Air India", category: "Scheduled Domestic Airline" },
  { type: "airline", code: "QP", name: "Akasa Air", category: "Scheduled Domestic Airline" },
  { type: "airline", code: "SG", name: "SpiceJet", category: "Scheduled Domestic Airline" },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SEARCH_DATA.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    if (item.type === "airport") {
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q)
      );
    }
    if (item.type === "route") {
      return (
        item.origin.toLowerCase().includes(q) ||
        item.dest.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        `${item.origin} ${item.dest}`.toLowerCase().includes(q)
      );
    }
    if (item.type === "airline") {
      return item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    }
    return false;
  }).slice(0, 8);

  const handleSelect = (item: any) => {
    onClose();
    if (item.type === "route") {
      router.push(`/route-explorer?origin=${item.origin}&dest=${item.dest}`);
    } else if (item.type === "airport") {
      router.push(`/route-explorer?origin=${item.code}&dest=BOM`);
    } else if (item.type === "airline") {
      router.push(`/live-fares?airline=${item.code}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-sky-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search airports (DEL, Mumbai), routes (DEL-BOM), airlines (IndiGo)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500 font-sans"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-3 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Search results list */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No matching airports, routes, or airlines found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-sky-400 group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-colors">
                    {item.type === "airport" && <MapPin className="w-4 h-4" />}
                    {item.type === "route" && <Plane className="w-4 h-4" />}
                    {item.type === "airline" && <Building2 className="w-4 h-4" />}
                  </div>
                  <div>
                    {item.type === "airport" && (
                      <div>
                        <span className="font-semibold text-white text-sm">{item.city}</span>{" "}
                        <span className="text-xs text-slate-400">({item.code})</span> —{" "}
                        <span className="text-xs text-slate-500">{item.name}</span>
                      </div>
                    )}
                    {item.type === "route" && (
                      <div>
                        <span className="font-semibold text-white text-sm">{item.label}</span>{" "}
                        <span className="text-xs text-sky-400 font-mono">({item.origin} → {item.dest})</span>
                        <div className="text-xs text-slate-400">{item.category}</div>
                      </div>
                    )}
                    {item.type === "airline" && (
                      <div>
                        <span className="font-semibold text-white text-sm">{item.name}</span>{" "}
                        <span className="text-xs text-slate-400">({item.code})</span> —{" "}
                        <span className="text-xs text-slate-500">{item.category}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Try: <span className="text-sky-400 cursor-pointer" onClick={() => setQuery("DEL BOM")}>DEL BOM</span>, <span className="text-sky-400 cursor-pointer" onClick={() => setQuery("Goa")}>Goa</span>, <span className="text-sky-400 cursor-pointer" onClick={() => setQuery("IndiGo")}>IndiGo</span></span>
          </div>
          <span>MoSPI Airfare Intelligence Platform</span>
        </div>
      </div>
    </div>
  );
};
