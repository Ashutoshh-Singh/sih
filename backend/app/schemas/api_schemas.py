from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date


# Airport Schemas
class AirportResponse(BaseModel):
    id: int
    iata_code: str
    name: str
    city: str
    state: str
    region: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


# Airline Schemas
class AirlineResponse(BaseModel):
    id: int
    code: str
    name: str
    market_share: float

    class Config:
        from_attributes = True


class AirlineComparisonItem(BaseModel):
    airline_code: str
    airline_name: str
    avg_fare: float
    lowest_fare: float
    highest_fare: float
    observations_count: int
    confidence: float
    diff_from_median_pct: float


# Route Schemas
class RouteResponse(BaseModel):
    id: int
    origin: AirportResponse
    destination: AirportResponse
    route_weight: float
    active: bool
    current_avg_fare: Optional[float] = None
    route_index: Optional[float] = None
    mom_change: Optional[float] = None

    class Config:
        from_attributes = True


class BookingWindowStat(BaseModel):
    window: str
    avg_fare: float
    median_fare: float
    lowest_fare: float
    highest_fare: float
    sample_count: int


class RouteAnalysisResponse(BaseModel):
    origin: AirportResponse
    destination: AirportResponse
    average_fare: float
    median_fare: float
    lowest_fare: float
    highest_fare: float
    route_index: float
    index_scope: Optional[str] = "overall_route"
    base_fare: float
    price_relative: float
    monthly_change: float
    volatility: float
    data_confidence: float
    sample_count: int
    booking_windows: List[BookingWindowStat]
    airline_breakdown: List[AirlineComparisonItem]


# Fare Observation Schemas
class ObservationResponse(BaseModel):
    id: int
    source_name: str
    source_type: str
    airline_code: str
    airline_name: str
    origin_iata: str
    origin_city: str
    destination_iata: str
    destination_city: str
    flight_number: str
    observation_timestamp: datetime
    travel_date: date
    booking_lead_days: int
    booking_window: str
    cabin: str
    fare_family: str
    base_fare: float
    taxes: float
    total_fare: float
    stops: int
    baggage: str
    refundable: bool
    currency: str
    quality_score: float
    is_anomaly: bool
    validation_status: str


# Index Schemas
class NationalIndexCurrent(BaseModel):
    index: float
    base_index: float = 100.0
    daily_change: float
    monthly_change: float
    yearly_change: float
    quality_score: float
    routes_monitored: int
    observations: int
    last_updated: datetime
    avg_domestic_fare: float


class IndexHistoryPoint(BaseModel):
    date: str
    index_value: float
    daily_change: float
    monthly_change: float
    quality_score: float


class RouteContributor(BaseModel):
    route: str
    origin_iata: str
    destination_iata: str
    origin_city: str
    destination_city: str
    current_fare: float
    base_fare: float
    price_relative: float
    weight: float
    route_index: float
    contribution: float
    mom_change: float


class IndexExplanationResponse(BaseModel):
    national_index: float
    monthly_change: float
    top_positive_contributors: List[RouteContributor]
    top_negative_contributors: List[RouteContributor]
    deterministic_summary: str
    methodology_note: str


# Quality & Anomaly Schemas
class DataQualitySummary(BaseModel):
    overall_score: float
    completeness: float
    freshness: float
    schema_validity: float
    source_agreement: float
    anomaly_rate: float
    observations_evaluated: int
    last_evaluated: datetime


class AnomalyResponse(BaseModel):
    id: int
    fare_observation_id: int
    origin_iata: str
    destination_iata: str
    airline_name: str
    flight_number: str
    travel_date: date
    booking_window: str
    observed_fare: float
    expected_fare_range: str
    anomaly_score: float
    detection_method: str
    reason: str
    review_status: str
    timestamp: datetime


class AnomalyStatusUpdate(BaseModel):
    review_status: str  # ACCEPTED, REJECTED


# Source Schemas
class SourceHealth(BaseModel):
    id: int
    name: str
    source_type: str
    status: str
    reliability_score: float
    last_success: Optional[datetime]
    records_today: int
    success_rate: float


# CPI Simulation Schemas
class CPISimulateRequest(BaseModel):
    airfare_index_movement: float = 2.84  # % movement in airfare price index
    transport_weight_pct: float = 1.45    # weight of airfare/transport sub-basket in CPI (e.g. 1.45%)
    scenario: str = "custom"              # current, moderate, high, decline, custom


class CPISimulateResponse(BaseModel):
    scenario: str
    airfare_movement_pct: float
    airfare_cpi_weight: float
    cpi_impact_basis_points: float
    cpi_impact_percentage: float = 0.0412
    simulated_transport_index_delta: float
    top_impacting_routes: List[Dict[str, Any]]
    policy_interpretation: str
    disclaimer: str


# --- DATA LINEAGE & TRACEABILITY SCHEMAS ---
class ObservationLineageItem(BaseModel):
    id: int
    code: str
    airline: str
    flight_number: str
    total_fare: float
    base_fare: float
    taxes: float
    booking_window: str
    source_name: str
    source_type: str
    quality_score: float
    validation_status: str
    collected_at: str
    payload_hash: str


class RouteLineageItem(BaseModel):
    route_id: int
    route_code: str
    origin_city: str
    destination_city: str
    route_weight: float
    route_index: float
    price_relative: float
    representative_fare: float
    base_fare: float
    contribution_points: float
    valid_observations_count: int
    sample_observations: List[ObservationLineageItem]


class IndexLineageResponse(BaseModel):
    national_index: float
    base_index: float = 100.0
    calculation_timestamp: str
    dataset_version: str
    methodology_version: str = "Prototype Weighted Laspeyres v1.0"
    total_routes_monitored: int
    total_valid_observations: int
    routes: List[RouteLineageItem]


# --- UNIVERSAL EXPLAIN THIS NUMBER SCHEMAS ---
class ExplainMetricResponse(BaseModel):
    metric_name: str
    value_display: str
    baseline_reference: str
    calculation_formula: str
    deterministic_narrative: str
    components_breakdown: List[Dict[str, Any]]
    data_confidence_tier: str
    methodology_note: str


# --- WHAT CHANGED SINCE LAST REFRESH SCHEMAS ---
class DashboardChangesResponse(BaseModel):
    last_refresh_timestamp: str
    previous_refresh_timestamp: str
    previous_index: float
    current_index: float
    index_delta: float
    new_observations_count: int
    biggest_increase_route: Dict[str, Any]
    biggest_decrease_route: Dict[str, Any]
    new_anomalies_count: int
    source_status_alerts: List[Dict[str, Any]]
    coverage_percentage: float


# --- BASKET WEIGHT SIMULATOR SCHEMAS ---
class RouteWeightModifier(BaseModel):
    route_id: int
    weight_pct: float


class BasketSimulationRequest(BaseModel):
    modifiers: List[RouteWeightModifier]


class BasketSimulationResponse(BaseModel):
    official_national_index: float
    simulated_national_index: float
    index_difference: float
    total_weight_sum: float
    weights_valid: bool
    simulated_contributors: List[Dict[str, Any]]
    disclaimer: str


# --- SCENARIO LABORATORY SCHEMAS ---
class ScenarioSimulationRequest(BaseModel):
    scenario_preset: str = "custom"  # normal, festival_demand, fuel_shock, holiday_surge, fare_correction, custom
    route_code: Optional[str] = "DEL-BOM"
    fare_shift_pct: float = 20.0
    weight_multiplier: float = 1.0


class ScenarioSimulationResponse(BaseModel):
    scenario_name: str
    route_code: str
    fare_shift_pct: float
    baseline_national_index: float
    simulated_national_index: float
    national_impact_delta: float
    baseline_route_contribution: float
    simulated_route_contribution: float
    narrative_impact: str
    top_affected_corridors: List[Dict[str, Any]]
    disclaimer: str


# --- CROSS-SOURCE AGREEMENT SCHEMAS ---
class SourceTariffItem(BaseModel):
    source_name: str
    source_type: str
    total_fare: float
    base_fare: float
    taxes: float
    diff_from_median_pct: float
    is_suspicious_outlier: bool
    status: str


class SourceAgreementResponse(BaseModel):
    route_code: str
    booking_window: str
    cabin: str
    median_fare: float
    agreement_score: float
    max_deviation_pct: float
    suspicious_sources_flagged: int
    tariffs: List[SourceTariffItem]
    interpretation: str


# --- STATISTICAL AUDIT LOG SCHEMAS ---
class AuditLogEntryResponse(BaseModel):
    id: int
    timestamp: str
    action_type: str  # ANOMALY_REVIEW, BASKET_SIMULATION, INDEX_RECALCULATION, SOURCE_HEALTH_EVENT, PIPELINE_REFRESH
    user_role: str
    affected_entity: str
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    details: str


# --- SYSTEM SNAPSHOT SCHEMAS ---
class SystemSnapshotResponse(BaseModel):
    snapshot_id: str
    snapshot_timestamp: str
    dataset_version: str
    methodology_version: str
    is_offline_mode: bool
    active_corridors: int
    total_observations: int
    valid_observations: int
    excluded_observations: int
    data_confidence_tier: str
    system_status: str


# --- ANOMALY IMPACT SCHEMAS ---
class AnomalyImpactRequest(BaseModel):
    observation_id: int


class AnomalyImpactResponse(BaseModel):
    observation_id: int
    route_code: str
    flagged_fare: float
    detection_reason: str
    with_anomaly_national_index: float
    without_anomaly_national_index: float
    national_impact_delta: float
    route_fare_with: float
    route_fare_without: float
    methodology_note: str


# --- USER & RBAC GOVERNANCE SCHEMAS ---
class UserRoleEnum(str, Enum):
    STATISTICAL_OFFICER = "STATISTICAL_OFFICER"
    ECONOMIC_ADVISOR = "ECONOMIC_ADVISOR"
    DATA_ENGINEER = "DATA_ENGINEER"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    designation: str
    department: str
    is_active: bool
    avatar_initials: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    permissions: List[str] = []

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "STATISTICAL_OFFICER"
    designation: str
    department: str = "Price Statistics Division (PSD)"
    password: str = "MoSPI@2026"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SwitchDemoUserRequest(BaseModel):
    role: str  # STATISTICAL_OFFICER, ECONOMIC_ADVISOR, DATA_ENGINEER, SYSTEM_ADMIN


class UserActivityResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_role: str
    action: str
    module: str
    details: Optional[str] = None
    ip_address: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True


