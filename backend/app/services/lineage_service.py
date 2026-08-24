import datetime
import hashlib
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database.models import (
    NationalIndex,
    RouteIndex,
    Route,
    Airport,
    FareObservation,
    Source,
)
from .data_service import apply_valid_observations_filter
from .index_engine import compute_db_national_index


def generate_provenance_hash(o: FareObservation) -> str:
    """
    Deterministic canonical SHA-256 provenance hash generator.
    """
    canonical_str = f"OBS_ID:{o.id}|SRC:{o.source_id}|ROUTE:{o.route_id}|AIRLINE:{o.airline_id}|TRAVEL_DATE:{o.travel_date}|TOTAL_FARE:{o.total_fare:.2f}"
    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest().upper()


def get_full_data_lineage(db: Session) -> Dict[str, Any]:
    """
    Builds a complete, auditable data-lineage hierarchy:
    National Index -> Route Contributions -> Route Index -> Representative Fare -> Valid Observations -> Source & Provenance
    """
    computed = compute_db_national_index(db)
    nat_val = computed["national_index"]

    latest_national = db.query(NationalIndex).order_by(desc(NationalIndex.date)).first()
    curr_date = latest_national.date if latest_national else datetime.date.today()

    route_indices = (
        db.query(RouteIndex)
        .filter(RouteIndex.date == curr_date)
        .join(Route)
        .order_by(desc(RouteIndex.route_weight))
        .all()
    )

    total_obs = db.query(FareObservation).count()
    total_valid_obs = apply_valid_observations_filter(db.query(FareObservation)).count()
    total_excluded = total_obs - total_valid_obs

    routes_lineage: List[Dict[str, Any]] = []

    for ri in route_indices:
        r = ri.route
        obs_query = (
            db.query(FareObservation)
            .filter(FareObservation.route_id == r.id)
            .order_by(desc(FareObservation.observation_timestamp))
        )
        total_for_route = obs_query.count()
        valid_for_route = apply_valid_observations_filter(
            db.query(FareObservation).filter(FareObservation.route_id == r.id)
        ).count()
        excluded_for_route = total_for_route - valid_for_route

        sample_obs = obs_query.limit(8).all()

        obs_items = []
        for o in sample_obs:
            full_sha256 = generate_provenance_hash(o)
            obs_items.append({
                "id": o.id,
                "code": f"AF-{o.id:05d}",
                "airline": o.airline.name,
                "flight_number": o.flight_number,
                "total_fare": o.total_fare,
                "base_fare": o.base_fare,
                "taxes": o.taxes,
                "booking_window": o.booking_window,
                "source_name": o.source.name,
                "source_type": o.source.source_type,
                "quality_score": o.quality_score,
                "validation_status": o.validation_status,
                "collected_at": o.observation_timestamp.strftime("%H:%M:%S"),
                "payload_hash": f"SHA256-{full_sha256[:16]}..."
            })

        routes_lineage.append({
            "route_id": r.id,
            "route_code": f"{r.origin_airport.iata_code}-{r.destination_airport.iata_code}",
            "origin_city": r.origin_airport.city,
            "destination_city": r.destination_airport.city,
            "route_weight": r.route_weight,
            "route_index": ri.route_index,
            "price_relative": ri.price_relative,
            "representative_fare": ri.representative_fare,
            "base_fare": ri.base_fare,
            "contribution_points": ri.contribution,
            "total_observations_count": total_for_route,
            "valid_observations_count": valid_for_route,
            "excluded_anomalies_count": excluded_for_route,
            "sample_observations": obs_items
        })

    return {
        "national_index": nat_val,
        "base_index": 100.0,
        "calculation_timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "dataset_version": "SNP-20260823-2230",
        "methodology_version": "Prototype Weighted Laspeyres v1.0",
        "total_routes_monitored": len(routes_lineage),
        "total_observations": total_obs,
        "total_valid_observations": total_valid_obs,
        "total_excluded_anomalies": total_excluded,
        "routes": routes_lineage
    }
