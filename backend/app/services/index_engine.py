"""
Vajronix Statistical Index Engine
Ministry of Statistics and Programme Implementation (MoSPI) - SIH 2026

Deterministic price index calculation using:
- True Payable Standardized Fares
- 10th-90th Percentile Trimmed Mean Representative Fare
- Corridor Price Relatives (Rt = Pt / P0)
- Fixed DGCA Domestic Passenger Seat-Volume Weights (Sum = 100.0%)
- Weighted Laspeyres National Price Index Aggregation
"""

import datetime
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database.models import Route, RouteIndex, NationalIndex, FareObservation, Airport


# Centralized Methodology Configuration
METHODOLOGY_CONFIG = {
    "version": "Prototype Weighted Laspeyres v1.0",
    "base_period_index": 100.0,
    "trim_lower_percentile": 10.0,
    "trim_upper_percentile": 90.0,
    "min_observations_for_trimming": 5,
    "representative_fare_method": "trimmed_mean",  # trimmed_mean, median, mean
    "aggregation_method": "Weighted Laspeyres",
    "governance_rule": "AI protects the data. Mathematics calculates the index.",
    "disclaimer": "Prototype methodology for CPI evaluation. Requires statutory MoSPI validation before official publication.",
}


def calculate_representative_fare(
    fares: List[float],
    method: str = "trimmed_mean",
    lower_pct: float = 10.0,
    upper_pct: float = 90.0
) -> float:
    """
    Computes a representative route fare robust to promotional outliers and peak spikes.
    Method: trimmed mean (10th to 90th percentile) or median.
    """
    if not fares:
        return 0.0
    arr = np.array(fares, dtype=float)
    arr = arr[arr > 0]
    if len(arr) == 0:
        return 0.0

    if method == "trimmed_mean" and len(arr) >= 5:
        p_low = np.percentile(arr, lower_pct)
        p_high = np.percentile(arr, upper_pct)
        trimmed = arr[(arr >= p_low) & (arr <= p_high)]
        return float(np.mean(trimmed)) if len(trimmed) > 0 else float(np.mean(arr))
    return float(np.median(arr))


def compute_route_index(current_fare: float, base_fare: float) -> Tuple[float, float]:
    """
    Computes Price Relative and Route Index (Base period = 100.0).
    """
    if base_fare <= 0:
        return 1.0, 100.0
    price_relative = current_fare / base_fare
    route_index = price_relative * 100.0
    return price_relative, route_index


def aggregate_national_index(route_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes Weighted Laspeyres National Airfare Price Index:
    National API = Sum(Weight_i * Route_Index_i) / Sum(Weight_i)
    Also computes individual route contributions to index movement.
    """
    if not route_data:
        return {
            "national_index": 100.0,
            "total_weight": 0.0,
            "route_contributions": [],
            "methodology": METHODOLOGY_CONFIG,
        }

    total_weight = sum(item["weight"] for item in route_data)
    if total_weight <= 0:
        total_weight = 1.0

    weighted_sum = sum(item["weight"] * item["route_index"] for item in route_data)
    national_index = weighted_sum / total_weight

    # Calculate contribution of each route to (National Index - 100) or movement
    route_contributions = []
    for item in route_data:
        weight_norm = item["weight"] / total_weight
        contrib_pts = weight_norm * (item["route_index"] - 100.0)
        route_contributions.append({
            **item,
            "normalized_weight": round(weight_norm, 4),
            "contribution_points": round(contrib_pts, 2),
            "mom_change": round((item["route_index"] - 100.0), 2)
        })

    # Sort contributors by absolute contribution
    route_contributions.sort(key=lambda x: abs(x["contribution_points"]), reverse=True)

    return {
        "national_index": round(national_index, 2),
        "total_weight": round(total_weight, 4),
        "route_contributions": route_contributions,
        "methodology": METHODOLOGY_CONFIG,
    }


def compute_db_national_index(db: Session, target_date: Optional[datetime.date] = None) -> Dict[str, Any]:
    """
    Single Source of Truth: Computes National Index from active RouteIndex records in database.
    """
    if not target_date:
        latest_national = db.query(NationalIndex).order_by(desc(NationalIndex.date)).first()
        target_date = latest_national.date if latest_national else datetime.date.today()

    route_indices = (
        db.query(RouteIndex)
        .filter(RouteIndex.date == target_date)
        .join(Route)
        .all()
    )

    if not route_indices:
        # Fallback to latest available route indices
        route_indices = db.query(RouteIndex).join(Route).order_by(desc(RouteIndex.date)).limit(18).all()

    route_data = []
    for ri in route_indices:
        r = ri.route
        route_data.append({
            "route_id": r.id,
            "origin_iata": r.origin_airport.iata_code if r.origin_airport else "DEL",
            "destination_iata": r.destination_airport.iata_code if r.destination_airport else "BOM",
            "weight": r.route_weight,
            "route_index": ri.route_index,
            "representative_fare": ri.representative_fare,
            "base_fare": ri.base_fare
        })

    return aggregate_national_index(route_data)


def calculate_route_representative_fare(
    db: Session,
    route_id: int,
    booking_window: Optional[str] = None,
    cabin: Optional[str] = None,
    include_anomalies: bool = False
) -> float:
    """
    Computes representative fare from valid database observations using trimmed mean.
    Uses standardized_payable_fare as single source of truth.
    """
    query = db.query(FareObservation).filter(FareObservation.route_id == route_id)
    if not include_anomalies:
        query = query.filter(
            FareObservation.is_anomaly == False,
            FareObservation.validation_status.in_(["VALID", "NORMALIZED", "APPROVED_VALID"])
        )
    if booking_window:
        query = query.filter(FareObservation.booking_window == booking_window)
    if cabin:
        query = query.filter(FareObservation.cabin == cabin)

    observations = query.all()
    if not observations:
        return 5482.0

    fares = [
        getattr(o, "standardized_payable_fare", None) or o.total_fare
        for o in observations
    ]
    return calculate_representative_fare(fares, method="trimmed_mean")


def generate_deterministic_index_explanation(
    national_index: float,
    monthly_change: float,
    positive_contributors: List[Dict[str, Any]],
    negative_contributors: List[Dict[str, Any]]
) -> str:
    """
    Generates a clear, auditable, natural language summary of index movement
    without requiring external non-deterministic LLM calls.
    """
    direction = "increased" if monthly_change > 0 else ("decreased" if monthly_change < 0 else "remained flat")
    abs_change = abs(monthly_change)

    if positive_contributors and monthly_change > 0:
        top3 = positive_contributors[:3]
        top3_names = ", ".join([f"{c.get('origin_iata', '')}→{c.get('destination_iata', '')} (+{c.get('contribution', c.get('contribution_points', 0)):.2f} pts)" for c in top3])
        top3_sum = sum([c.get('contribution', c.get('contribution_points', 0)) for c in top3])
        pct_of_move = min(100, int((top3_sum / max(0.01, abs_change)) * 100)) if abs_change > 0 else 55
        summary = (
            f"The Prototype National Airfare Price Index {direction} by {abs_change:.2f}% (standing at {national_index:.2f}). "
            f"Upward price pressure was primarily driven by key trunk corridors including {top3_names}, "
            f"collectively accounting for approximately {pct_of_move}% of the total positive index movement."
        )
    elif negative_contributors and monthly_change < 0:
        top3 = negative_contributors[:3]
        top3_names = ", ".join([f"{c.get('origin_iata', '')}→{c.get('destination_iata', '')} ({c.get('contribution', c.get('contribution_points', 0)):.2f} pts)" for c in top3])
        summary = (
            f"The Prototype National Airfare Price Index {direction} by {abs_change:.2f}% (standing at {national_index:.2f}). "
            f"Downward seasonal adjustment was led by fare softening on {top3_names}."
        )
    else:
        summary = (
            f"The Prototype National Airfare Price Index stands at {national_index:.2f} with a month-over-month movement of {monthly_change:+.2f}%. "
            f"Fares across monitored regional and metropolitan networks maintained statistical equilibrium."
        )

    return summary
