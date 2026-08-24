import pytest
import datetime
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database.connection import SessionLocal
from backend.app.database.models import FareObservation, Route, Anomaly
from backend.app.services.fare_normalization_service import (
    calculate_standardized_payable_fare,
    get_observation_fare_breakdown,
    generate_normalization_evidence_pipeline,
)
from backend.app.services.source_agreement_service import compute_source_agreement
from backend.app.services.lineage_service import get_full_data_lineage, get_route_lineage_detail
from backend.app.services.index_engine import calculate_representative_fare, compute_db_national_index
from backend.app.services.data_service import apply_valid_observations_filter

client = TestClient(app)


def test_standardized_payable_fare_formula():
    """
    Standardized Payable Fare = Base + Taxes + Convenience + Surcharges - Discounts
    """
    obs = {
        "base_fare": 4500.0,
        "taxes": 650.0,
        "convenience_fee": 399.0,
        "fuel_surcharge": 450.0,
        "mandatory_surcharge": 150.0,
        "discount": 200.0,
        "coupon_discount": 50.0,
    }
    expected = 4500.0 + 650.0 + 399.0 + 450.0 + 150.0 - 200.0 - 50.0  # = 5899.0
    calc = calculate_standardized_payable_fare(obs)
    assert calc == expected


def test_standardized_fare_legacy_fallback():
    """
    Legacy records with zero convenience/surcharge fields fall back to total_fare.
    """
    obs = {
        "base_fare": 4000.0,
        "taxes": 720.0,
        "total_fare": 4720.0,
        "convenience_fee": 0.0,
        "fuel_surcharge": 0.0,
        "mandatory_surcharge": 0.0,
        "discount": 0.0,
    }
    calc = calculate_standardized_payable_fare(obs)
    assert calc == 4720.0


def test_fare_breakdown_structure():
    """
    Verify full structured breakdown returned by fare_normalization_service.
    """
    obs = {
        "base_fare": 5000.0,
        "taxes": 900.0,
        "convenience_fee": 399.0,
        "fuel_surcharge": 550.0,
        "mandatory_surcharge": 150.0,
        "discount": 100.0,
        "coupon_discount": 0.0,
        "total_fare": 6450.0,
        "standardized_payable_fare": 6899.0,
    }
    bd = get_observation_fare_breakdown(obs)
    assert bd["base_fare"] == 5000.0
    assert bd["taxes"] == 900.0
    assert bd["convenience_fee"] == 399.0
    assert bd["mandatory_fees_total"] == (399.0 + 550.0 + 150.0)
    assert bd["total_discounts"] == 100.0
    assert bd["standardized_payable_fare"] == 6899.0
    assert len(bd["included_mandatory_components"]) > 0
    assert len(bd["excluded_optional_components"]) > 0


def test_normalization_evidence_pipeline():
    """
    Verify 12-stage normalization evidence generation.
    """
    obs = {
        "id": 101,
        "flight_number": "6E-204",
        "booking_window": "D-30",
        "cabin": "Economy",
        "fare_family": "Standard",
        "total_fare": 5480.0,
        "standardized_payable_fare": 5798.0,
        "is_anomaly": False,
        "validation_status": "VALID",
    }
    steps = generate_normalization_evidence_pipeline(obs)
    assert len(steps) == 12
    assert steps[0]["step_number"] == 1
    assert steps[11]["step_number"] == 12
    assert steps[11]["status"] == "ACCEPTED"


def test_api_fare_detail_includes_breakdown():
    """
    API test: GET /api/fares/{id} returns rich fare_breakdown.
    """
    response = client.get("/api/fares/1")
    assert response.status_code == 200
    data = response.json()
    assert "fare_breakdown" in data
    assert "standardized_payable_fare" in data["fare_breakdown"]
    assert "convenience_fee" in data["fare_breakdown"]
    assert data["fare_breakdown"]["standardized_payable_fare"] > 0


def test_api_normalization_evidence_endpoint():
    """
    API test: GET /api/fares/{id}/normalization-evidence returns 12 steps.
    """
    response = client.get("/api/fares/1/normalization-evidence")
    assert response.status_code == 200
    data = response.json()
    assert "pipeline_steps" in data
    assert len(data["pipeline_steps"]) == 12


def test_api_anomalies_reason_codes():
    """
    API test: GET /api/anomalies returns machine-readable reason_codes and detection_flags.
    """
    response = client.get("/api/anomalies")
    assert response.status_code == 200
    anomalies = response.json()
    assert len(anomalies) > 0
    first_anom = anomalies[0]
    assert "reason_codes" in first_anom
    assert isinstance(first_anom["reason_codes"], list)
    assert len(first_anom["reason_codes"]) > 0
    assert "detection_flags" in first_anom
    assert "route_median" in first_anom
    assert "deviation_pct" in first_anom


def test_cross_source_agreement_engine():
    """
    Verify cross-source agreement calculations: dispersion %, agreement score, and tariffs.
    """
    db = SessionLocal()
    try:
        result = compute_source_agreement(db, "DEL", "BOM", "D-30", "Economy")
        assert result["agreement_score"] >= 80.0
        assert result["agreement_score"] <= 100.0
        assert "dispersion_pct" in result
        assert "median_absolute_deviation" in result
        assert len(result["tariffs"]) > 0
        for t in result["tariffs"]:
            assert "standardized_payable_fare" in t
            assert "base_fare" in t
            assert "taxes" in t
    finally:
        db.close()


def test_api_source_agreement_endpoint():
    """
    API test: GET /api/sources/agreement
    """
    response = client.get("/api/sources/agreement?origin=DEL&destination=BOM&booking_window=D-30")
    assert response.status_code == 200
    data = response.json()
    assert data["route_code"] == "DEL-BOM"
    assert data["agreement_score"] > 0
    assert len(data["tariffs"]) > 0


def test_api_national_explain_endpoint():
    """
    API test: GET /api/index/national/explain returns methodology and routes lineage.
    """
    response = client.get("/api/index/national/explain")
    assert response.status_code == 200
    data = response.json()
    assert "national_index" in data
    assert "methodology" in data
    assert "routes" in data
    assert len(data["routes"]) == 18


def test_api_route_lineage_endpoint():
    """
    API test: GET /api/index/routes/DEL/BOM/lineage returns corridor deep trace.
    """
    response = client.get("/api/index/routes/DEL/BOM/lineage")
    assert response.status_code == 200
    data = response.json()
    assert data["route_code"] == "DEL-BOM"
    assert "representative_fare" in data
    assert "sample_observations" in data
    assert len(data["sample_observations"]) > 0
    assert "fare_breakdown" in data["sample_observations"][0]
