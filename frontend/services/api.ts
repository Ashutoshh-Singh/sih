import {
  NationalSummary,
  IndexHistoryItem,
  IndexExplanation,
  RouteAnalysis,
  Airport,
  Airline,
  FareObservationItem,
  ObservationDetail,
  QualitySummary,
  AnomalyItem,
  SourceItem,
  SourcesHealth,
  CPISimulationResult,
  IndexLineageData,
  ExplainMetricData,
  DashboardChangesData,
  BasketSimulationResult,
  ScenarioSimulationResult,
  SourceAgreementData,
  AuditLogEntry,
  SystemSnapshotData,
  User,
  UserRole,
  AuthResponse,
  UserStats,
  UserActivityLog,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Fetch error for ${endpoint}, checking fallback...`, err);
    throw err;
  }
}

export const apiService = {
  // Dashboard & National Index
  getSummary: async (): Promise<NationalSummary> => {
    return fetchJson<NationalSummary>("/dashboard/summary");
  },

  getIndexHistory: async (range: string = "1M"): Promise<IndexHistoryItem[]> => {
    return fetchJson<IndexHistoryItem[]>(`/index/history?range=${range}`);
  },

  getIndexContributors: async (): Promise<IndexExplanation> => {
    return fetchJson<IndexExplanation>("/index/contributors");
  },

  getBasketRoutes: async (): Promise<any[]> => {
    return fetchJson<any[]>("/index/routes");
  },

  // Routes & Analysis
  getAllRoutes: async (): Promise<any[]> => {
    return fetchJson<any[]>("/routes");
  },

  getRouteAnalysis: async (
    origin: string,
    destination: string,
    bookingWindow?: string,
    cabin?: string,
    fareCategory?: string,
    travelDate?: string
  ): Promise<RouteAnalysis> => {
    const query = new URLSearchParams();
    if (bookingWindow) query.append("booking_window", bookingWindow);
    if (cabin) query.append("cabin", cabin);
    if (fareCategory) query.append("fare_category", fareCategory);
    if (travelDate) query.append("travel_date", travelDate);
    const qStr = query.toString() ? `?${query.toString()}` : "";
    return fetchJson<RouteAnalysis>(`/routes/${origin}/${destination}${qStr}`);
  },

  getRouteHistory: async (origin: string, destination: string): Promise<{ date: string; fare: number; route_index: number }[]> => {
    return fetchJson(`/routes/${origin}/${destination}/history`);
  },

  getAirports: async (): Promise<Airport[]> => {
    return fetchJson<Airport[]>("/airports");
  },

  getAirlines: async (): Promise<Airline[]> => {
    return fetchJson<Airline[]>("/airlines");
  },

  getAirlinesCompare: async (): Promise<any[]> => {
    return fetchJson<any[]>("/airlines/compare");
  },

  // Fare Observations
  getFares: async (params?: {
    page?: number;
    limit?: number;
    origin?: string;
    destination?: string;
    airline?: string;
    status?: string;
    anomaly_only?: boolean;
    source?: string;
  }): Promise<{ page: number; limit: number; total_records: number; total_pages: number; items: FareObservationItem[] }> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.origin) query.append("origin", params.origin);
    if (params?.destination) query.append("destination", params.destination);
    if (params?.airline) query.append("airline", params.airline);
    if (params?.status) query.append("status", params.status);
    if (params?.anomaly_only) query.append("anomaly_only", "true");
    if (params?.source) query.append("source", params.source);

    return fetchJson(`/fares?${query.toString()}`);
  },

  getFareDetail: async (id: number): Promise<ObservationDetail> => {
    return fetchJson<ObservationDetail>(`/fares/${id}`);
  },

  // Data Quality & Anomalies
  getQualitySummary: async (): Promise<QualitySummary> => {
    return fetchJson<QualitySummary>("/quality");
  },

  getQualityHistory: async (): Promise<any[]> => {
    return fetchJson<any[]>("/quality/history");
  },

  getAnomalies: async (): Promise<AnomalyItem[]> => {
    return fetchJson<AnomalyItem[]>("/anomalies");
  },

  updateAnomalyStatus: async (id: number, status: "ACCEPTED" | "REJECTED"): Promise<any> => {
    return fetchJson(`/anomalies/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ review_status: status }),
    });
  },

  // Ingestion Sources
  getSources: async (): Promise<SourceItem[]> => {
    return fetchJson<SourceItem[]>("/sources");
  },

  getSourcesHealth: async (): Promise<SourcesHealth> => {
    return fetchJson<SourcesHealth>("/sources/health");
  },

  triggerCollection: async (sourceId: number): Promise<any> => {
    return fetchJson(`/sources/collect/${sourceId}`, {
      method: "POST",
    });
  },

  // CPI Simulation
  simulateCPI: async (airfareMovement: number, transportWeight: number, scenario: string = "custom"): Promise<CPISimulationResult> => {
    return fetchJson<CPISimulationResult>("/cpi/simulate", {
      method: "POST",
      body: JSON.stringify({
        airfare_index_movement: airfareMovement,
        transport_weight_pct: transportWeight,
        scenario,
      }),
    });
  },

  // Data Lineage & Traceability
  getIndexLineage: async (): Promise<IndexLineageData> => {
    return fetchJson<IndexLineageData>("/index/lineage");
  },

  // Universal Explain This Number
  getExplainMetric: async (metric: string, route?: string): Promise<ExplainMetricData> => {
    const q = new URLSearchParams({ metric });
    if (route) q.append("route", route);
    return fetchJson<ExplainMetricData>(`/index/explain?${q.toString()}`);
  },

  // What Changed Since Last Refresh
  getDashboardChanges: async (): Promise<DashboardChangesData> => {
    return fetchJson<DashboardChangesData>("/dashboard/changes");
  },

  // Basket Weight Simulator
  simulateBasket: async (modifiers: { route_id: number; weight_pct: number }[]): Promise<BasketSimulationResult> => {
    return fetchJson<BasketSimulationResult>("/simulation/basket", {
      method: "POST",
      body: JSON.stringify({ modifiers }),
    });
  },

  // Scenario Laboratory
  simulateScenario: async (params: {
    scenario_preset?: string;
    route_code?: string;
    fare_shift_pct?: number;
  }): Promise<ScenarioSimulationResult> => {
    return fetchJson<ScenarioSimulationResult>("/simulation/scenario", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  // Cross-Source Agreement
  getSourceAgreement: async (origin: string = "DEL", destination: string = "BOM", bookingWindow: string = "D-30"): Promise<SourceAgreementData> => {
    return fetchJson<SourceAgreementData>(`/sources/agreement?origin=${origin}&destination=${destination}&booking_window=${bookingWindow}`);
  },

  // Dynamic Anomaly Impact Simulation
  simulateAnomalyImpact: async (observationId: number = 1): Promise<any> => {
    return fetchJson<any>("/simulation/anomaly-impact", {
      method: "POST",
      body: JSON.stringify({ observation_id: observationId }),
    });
  },

  // Statistical Audit Log
  getAuditLogs: async (filter: string = "ALL"): Promise<AuditLogEntry[]> => {
    return fetchJson<AuditLogEntry[]>(`/audit?filter=${filter}`);
  },

  // System Snapshot Metadata
  getSystemSnapshot: async (): Promise<SystemSnapshotData> => {
    return fetchJson<SystemSnapshotData>("/system/snapshot");
  },

  // User & RBAC Governance
  login: async (username: string, password: string): Promise<AuthResponse> => {
    return fetchJson<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  getCurrentUser: async (role?: string): Promise<User> => {
    const q = role ? `?role=${role}` : "";
    return fetchJson<User>(`/auth/me${q}`);
  },

  switchDemoUser: async (role: string): Promise<AuthResponse> => {
    return fetchJson<AuthResponse>("/auth/switch-demo", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },

  getUsers: async (role?: string, search?: string): Promise<User[]> => {
    const params = new URLSearchParams();
    if (role && role !== "ALL") params.append("role", role);
    if (search) params.append("search", search);
    const qStr = params.toString() ? `?${params.toString()}` : "";
    return fetchJson<User[]>(`/users${qStr}`);
  },

  getUserStats: async (): Promise<UserStats> => {
    return fetchJson<UserStats>("/users/stats");
  },

  createUser: async (data: {
    username: string;
    email: string;
    full_name: string;
    role: string;
    designation: string;
    department?: string;
    password?: string;
  }): Promise<User> => {
    return fetchJson<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateUser: async (
    id: number,
    data: {
      full_name?: string;
      role?: string;
      designation?: string;
      department?: string;
      is_active?: boolean;
    }
  ): Promise<User> => {
    return fetchJson<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: number): Promise<{ status: string; message: string }> => {
    return fetchJson<{ status: string; message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  },

  getUserActivities: async (limit: number = 50): Promise<UserActivityLog[]> => {
    return fetchJson<UserActivityLog[]>(`/users/activities/all?limit=${limit}`);
  },
};


