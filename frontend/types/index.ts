export interface Airport {
  id: number;
  iata_code: string;
  name: string;
  city: string;
  state: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface Airline {
  id: number;
  code: string;
  name: string;
  market_share: number;
}

export interface AirlineComparisonItem {
  airline_code: string;
  airline_name: string;
  avg_fare: number;
  lowest_fare: number;
  highest_fare: number;
  observations_count: number;
  confidence: number;
  diff_from_median_pct: number;
}

export interface BookingWindowStat {
  window: string;
  avg_fare: number;
  median_fare: number;
  lowest_fare: number;
  highest_fare: number;
  sample_count: number;
}

export interface RouteAnalysis {
  origin: Airport;
  destination: Airport;
  average_fare: number;
  median_fare: number;
  lowest_fare: number;
  highest_fare: number;
  route_index: number;
  base_fare: number;
  price_relative: number;
  monthly_change: number;
  volatility: number;
  data_confidence: number;
  sample_count: number;
  booking_windows: BookingWindowStat[];
  airline_breakdown: AirlineComparisonItem[];
}

export interface NationalSummary {
  index: number;
  base_index: number;
  daily_change: number;
  monthly_change: number;
  yearly_change: number;
  quality_score: number;
  routes_monitored: number;
  observations: number;
  avg_domestic_fare: number;
  last_updated: string;
}

export interface IndexHistoryItem {
  date: string;
  index_value: number;
  daily_change: number;
  monthly_change: number;
  quality_score: number;
  baseline: number;
}

export interface RouteContributor {
  route: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  current_fare: number;
  base_fare: number;
  price_relative: number;
  weight: number;
  route_index: number;
  contribution: number;
  mom_change: number;
}

export interface IndexExplanation {
  national_index: number;
  monthly_change: number;
  top_positive_contributors: RouteContributor[];
  top_negative_contributors: RouteContributor[];
  all_contributors: RouteContributor[];
  deterministic_summary: string;
  methodology_note: string;
}

export interface FareObservationItem {
  id: number;
  source_name: string;
  source_type: string;
  airline_code: string;
  airline_name: string;
  origin_iata: string;
  origin_city: string;
  destination_iata: string;
  destination_city: string;
  flight_number: string;
  observation_timestamp: string;
  travel_date: string;
  booking_lead_days: number;
  booking_window: string;
  cabin: string;
  fare_family: string;
  base_fare: number;
  taxes: number;
  total_fare: number;
  stops: number;
  baggage: string;
  refundable: boolean;
  currency: string;
  quality_score: number;
  is_anomaly: boolean;
  validation_status: string;
}

export interface ObservationDetail {
  id: number;
  observation: {
    id: number;
    source: string;
    source_type: string;
    timestamp: string;
    ingestion_channel: string;
  };
  flight: {
    airline: string;
    airline_code: string;
    flight_number: string;
    origin: string;
    destination: string;
    origin_city: string;
    destination_city: string;
    travel_date: string;
    booking_lead_days: number;
    booking_window: string;
    stops: number;
  };
  fare: {
    base_fare: number;
    taxes: number;
    total_fare: number;
    currency: string;
    cabin: string;
    fare_family: string;
    baggage: string;
    refundable: boolean;
  };
  validation: {
    schema_status: string;
    duplicate_check: string;
    anomaly_status: string;
    quality_score: number;
    validation_status: string;
  };
  provenance: {
    source_adapter: string;
    raw_payload_hash: string;
    collected_at: string;
    transformation_pipeline: string;
  };
}

export interface QualitySummary {
  overall_score: number;
  completeness: number;
  freshness: number;
  schema_validity: number;
  source_agreement: number;
  anomaly_rate: number;
  observations_evaluated: number;
  last_evaluated: string;
  methodology: string;
}

export interface AnomalyItem {
  id: number;
  fare_observation_id: number;
  origin_iata: string;
  destination_iata: string;
  airline_name: string;
  flight_number: string;
  travel_date: string;
  booking_window: string;
  observed_fare: number;
  expected_fare_range: string;
  anomaly_score: number;
  detection_method: string;
  reason: string;
  review_status: string;
  timestamp: string;
}

export interface SourceItem {
  id: number;
  name: string;
  source_type: string;
  status: string;
  reliability_score: number;
  last_success: string | null;
  records_today: number;
  success_rate: number;
}

export interface SourcesHealth {
  active_sources: number;
  total_records_today: number;
  successful_jobs: number;
  failed_jobs: number;
  avg_response_time_ms: number;
  last_collection: string;
  recent_jobs: {
    id: number;
    source_name: string;
    status: string;
    records: number;
    started_at: string;
    completed_at: string | null;
  }[];
}

export interface CPISimulationResult {
  scenario: string;
  airfare_movement_pct: number;
  airfare_cpi_weight: number;
  cpi_impact_basis_points: number;
  cpi_impact_percentage: number;
  simulated_transport_index_delta: number;
  top_impacting_routes: {
    route: string;
    weight: number;
    movement: number;
    cpi_contrib_bps: number;
  }[];
  policy_interpretation: string;
  disclaimer: string;
}

export interface ObservationLineageItem {
  id: number;
  code: string;
  airline: string;
  flight_number: string;
  total_fare: number;
  base_fare: number;
  taxes: number;
  booking_window: string;
  source_name: string;
  source_type: string;
  quality_score: number;
  validation_status: string;
  collected_at: string;
  payload_hash: string;
}

export interface RouteLineageItem {
  route_id: number;
  route_code: string;
  origin_city: string;
  destination_city: string;
  route_weight: number;
  route_index: number;
  price_relative: number;
  representative_fare: number;
  base_fare: number;
  contribution_points: number;
  valid_observations_count: number;
  sample_observations: ObservationLineageItem[];
}

export interface IndexLineageData {
  national_index: number;
  base_index: number;
  calculation_timestamp: string;
  dataset_version: string;
  methodology_version: string;
  total_routes_monitored: number;
  total_valid_observations: number;
  routes: RouteLineageItem[];
}

export interface ExplainMetricData {
  metric_name: string;
  value_display: string;
  baseline_reference: string;
  calculation_formula: string;
  deterministic_narrative: string;
  components_breakdown: any[];
  data_confidence_tier: string;
  methodology_note: string;
}

export interface DashboardChangesData {
  last_refresh_timestamp: string;
  previous_refresh_timestamp: string;
  previous_index: number;
  current_index: number;
  index_delta: number;
  new_observations_count: number;
  biggest_increase_route: {
    route: string;
    delta_pct: string;
    current_fare: number;
  };
  biggest_decrease_route: {
    route: string;
    delta_pct: string;
    current_fare: number;
  };
  new_anomalies_count: number;
  source_status_alerts: {
    source: string;
    event: string;
    type: string;
  }[];
  coverage_percentage: number;
}

export interface BasketSimulationResult {
  official_national_index: number;
  simulated_national_index: number;
  index_difference: number;
  total_weight_sum: number;
  weights_valid: boolean;
  simulated_contributors: {
    route_id: number;
    route_code: string;
    origin_city: string;
    destination_city: string;
    simulated_weight: number;
    route_index: number;
    simulated_contribution: number;
  }[];
  disclaimer: string;
}

export interface ScenarioSimulationResult {
  scenario_name: string;
  route_code: string;
  fare_shift_pct: number;
  baseline_national_index: number;
  simulated_national_index: number;
  national_impact_delta: number;
  baseline_route_contribution: number;
  simulated_route_contribution: number;
  narrative_impact: string;
  top_affected_corridors: {
    route: string;
    shift_pct: string;
    contrib_delta: string;
  }[];
  disclaimer: string;
}

export interface SourceAgreementData {
  route_code: string;
  booking_window: string;
  cabin: string;
  median_fare: number;
  agreement_score: number;
  max_deviation_pct: number;
  suspicious_sources_flagged: number;
  tariffs: {
    source_name: string;
    source_type: string;
    total_fare: number;
    base_fare: number;
    taxes: number;
    diff_from_median_pct: number;
    is_suspicious_outlier: boolean;
    status: string;
  }[];
  interpretation: string;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  action_type: string;
  user_role: string;
  affected_entity: string;
  previous_state: string | null;
  new_state: string | null;
  details: string;
}

export interface SystemSnapshotData {
  snapshot_id: string;
  snapshot_timestamp: string;
  dataset_version: string;
  methodology_version: string;
  is_offline_mode: boolean;
  active_corridors: number;
  valid_observations: number;
  data_confidence_tier: string;
  system_status: string;
}

export type UserRole =
  | "STATISTICAL_OFFICER"
  | "ECONOMIC_ADVISOR"
  | "DATA_ENGINEER"
  | "SYSTEM_ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  designation: string;
  department: string;
  is_active: boolean;
  avatar_initials?: string;
  last_login?: string;
  created_at?: string;
  permissions: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserStats {
  total_officers: number;
  active_officers: number;
  roles_breakdown: Record<string, number>;
  recent_audit_events: number;
}

export interface UserActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  details?: string;
  ip_address: string;
  status: string;
  timestamp: string;
}


