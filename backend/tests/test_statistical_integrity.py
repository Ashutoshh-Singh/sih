import pytest
import datetime
import numpy as np
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.connection import SessionLocal
from backend.app.database.models import Route, RouteIndex, NationalIndex, FareObservation, DataQualityMetric
from backend.app.services.index_engine import (
    calculate_representative_fare,
    compute_route_index,
    aggregate_national_index,
    compute_db_national_index
)
from backend.app.services.data_service import apply_valid_observations_filter, get_route_details

client = TestClient(app)


# Test 1: Route weights total exactly 100.00%
def test_route_weights_sum_to_100():
    db = SessionLocal()
    try:
        routes = db.query(Route).filter(Route.active == True).all()
        assert len(routes) == 18, f"Expected 18 monitored routes, found {len(routes)}"
        total_weight = round(sum(r.route_weight for r in routes), 2)
        assert abs(total_weight - 100.0) < 0.001, f"Route weights must sum to 100.00%, got {total_weight}%"
    finally:
        db.close()


# Test 2: National API equals weighted route aggregation (Single Source of Truth)
def test_national_index_equals_weighted_route_aggregation():
    db = SessionLocal()
    try:
        computed = compute_db_national_index(db)
        expected_api = computed["national_index"]

        response = client.get("/api/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        assert abs(data["index"] - expected_api) < 0.01
    finally:
        db.close()


# Test 3: Representative fare equals trimmed mean of valid observations (using standardized payable fares)
def test_representative_fare_equals_valid_observations_trimmed_mean():
    db = SessionLocal()
    try:
        del_bom = db.query(Route).filter(Route.id == 1).first()
        valid_obs = apply_valid_observations_filter(
            db.query(FareObservation).filter(FareObservation.route_id == del_bom.id)
        ).all()
        valid_fares = [
            getattr(o, "standardized_payable_fare", None) or o.total_fare
            for o in valid_obs
        ]
        expected_rep_fare = round(calculate_representative_fare(valid_fares, method="trimmed_mean"), 0)

        response = client.get("/api/routes/DEL/BOM")
        assert response.status_code == 200
        data = response.json()
        assert abs(data["average_fare"] - expected_rep_fare) < 1.0
    finally:
        db.close()


# Test 4: Fare arithmetic integrity (Standardized Payable Fare = Base + Taxes + Mandatory Fees - Discounts)
def test_fare_arithmetic_integrity():
    db = SessionLocal()
    try:
        observations = db.query(FareObservation).limit(500).all()
        assert len(observations) > 0
        for obs in observations:
            expected_std = round(
                obs.base_fare
                + obs.taxes
                + obs.convenience_fee
                + obs.fuel_surcharge
                + obs.mandatory_surcharge
                - obs.discount,
                2
            )
            assert abs(expected_std - obs.standardized_payable_fare) <= 0.05, (
                f"Arithmetic error on Obs #{obs.id}: Expected Standardized ({expected_std}) != Recorded ({obs.standardized_payable_fare})"
            )
    finally:
        db.close()


# Test 5: Rejected & Confirmed Anomalies do not leak into normal route analytics (Priority 1)
def test_confirmed_anomalies_excluded_from_normal_analytics():
    db = SessionLocal()
    try:
        # Create or update an observation to CONFIRMED_ANOMALY
        obs = db.query(FareObservation).filter(FareObservation.route_id == 1).first()
        obs.validation_status = "CONFIRMED_ANOMALY"
        obs.is_anomaly = True
        db.commit()

        # Query route analytics - confirmed anomaly must be quarantined
        details = get_route_details(db, "DEL", "BOM")
        assert details is not None

        # Verify through apply_valid_observations_filter
        valid_count = apply_valid_observations_filter(
            db.query(FareObservation).filter(FareObservation.route_id == 1)
        ).count()
        total_count = db.query(FareObservation).filter(FareObservation.route_id == 1).count()
        assert valid_count < total_count

        # Restore
        obs.validation_status = "VALID"
        obs.is_anomaly = False
        db.commit()
    finally:
        db.close()


# Test 6: Anomaly impact calculated through index engine
def test_anomaly_impact_calculation():
    response = client.post("/api/simulation/anomaly-impact", json={"observation_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert "national_impact_delta" in data
    assert "with_anomaly_national_index" in data
    assert "without_anomaly_national_index" in data
    calc_delta = round(data["with_anomaly_national_index"] - data["without_anomaly_national_index"], 4)
    assert abs(calc_delta - data["national_impact_delta"]) <= 0.002


# Test 7: Basket unchanged -> simulated index equals official index (difference = 0.00)
def test_basket_unchanged_produces_zero_difference():
    response = client.post("/api/simulation/basket", json={"modifiers": []})
    assert response.status_code == 200
    data = response.json()
    assert abs(data["index_difference"]) <= 0.01, f"Unchanged basket produced non-zero diff: {data['index_difference']}"
    assert abs(data["simulated_national_index"] - data["official_national_index"]) <= 0.01


# Test 8: Scenario baseline equals current National API
def test_scenario_baseline_equals_current_national_api():
    db = SessionLocal()
    try:
        computed = compute_db_national_index(db)
        expected_api = computed["national_index"]

        response = client.post("/api/simulation/scenario", json={"scenario_preset": "custom", "fare_shift_pct": 5.0})
        assert response.status_code == 200
        data = response.json()
        assert abs(data["baseline_national_index"] - expected_api) < 0.01
    finally:
        db.close()


# Test 9: Quality score matches component formula
def test_quality_score_matches_formula():
    db = SessionLocal()
    try:
        latest_dq = db.query(DataQualityMetric).order_by(DataQualityMetric.timestamp.desc()).first()
        expected = round(
            0.30 * latest_dq.completeness +
            0.25 * latest_dq.freshness +
            0.20 * latest_dq.schema_validity +
            0.15 * latest_dq.source_agreement +
            0.10 * 98.0,
            1
        )
        assert abs(latest_dq.overall_score - expected) <= 0.2
    finally:
        db.close()


# Test 10: Anomaly rate matches database records
def test_anomaly_rate_matches_database():
    db = SessionLocal()
    try:
        total_obs = db.query(FareObservation).count()
        anom_obs = db.query(FareObservation).filter(FareObservation.validation_status == "ANOMALY").count()
        expected_rate = round((anom_obs / total_obs) * 100.0, 2)
        response = client.get("/api/quality")
        assert response.status_code == 200
        data = response.json()
        assert abs(data["anomaly_rate"] - expected_rate) < 0.1
    finally:
        db.close()


# Test 11: Destination filter works accurately
def test_destination_filter_works():
    response = client.get("/api/fares?origin=DEL&destination=BOM&limit=25")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    for item in data["items"]:
        assert item["origin_iata"] == "DEL"
        assert item["destination_iata"] == "BOM"


# Test 12: Booking window filter works (D-30 vs D-1 variation)
def test_booking_window_filter_varies_fare():
    r_d30 = client.get("/api/routes/DEL/BOM?booking_window=D-30")
    r_d1 = client.get("/api/routes/DEL/BOM?booking_window=D-1")
    assert r_d30.status_code == 200 and r_d1.status_code == 200
    data_d30 = r_d30.json()
    data_d1 = r_d1.json()
    assert data_d1["average_fare"] >= data_d30["average_fare"] * 0.95


# Test 13: Travel Date Filter handles existing and absent dates
def test_travel_date_filter_precision():
    # Existing travel dates exist within D-1 to D-60 from today
    db = SessionLocal()
    try:
        sample_obs = db.query(FareObservation).filter(FareObservation.route_id == 1).first()
        valid_date_str = sample_obs.travel_date.isoformat()

        # Query with existing date
        r_valid = client.get(f"/api/routes/DEL/BOM?travel_date={valid_date_str}")
        assert r_valid.status_code == 200
        data_valid = r_valid.json()
        assert data_valid["sample_count"] > 0

        # Query with impossible/absent future date
        r_absent = client.get("/api/routes/DEL/BOM?travel_date=2099-01-01")
        assert r_absent.status_code == 200
        data_absent = r_absent.json()
        assert data_absent["sample_count"] == 0
        assert data_absent["average_fare"] == 0.0
    finally:
        db.close()


# Test 14: Filtered Route Scope labeling
def test_route_scope_labeling():
    response = client.get("/api/routes/DEL/BOM")
    assert response.status_code == 200
    data = response.json()
    assert data.get("index_scope") == "overall_route"


# Test 15: Valid Counts Reconciliation (Total = Valid + Excluded)
def test_valid_counts_reconciliation():
    response = client.get("/api/system/snapshot")
    assert response.status_code == 200
    data = response.json()
    assert data["total_observations"] == data["valid_observations"] + data["excluded_observations"]


# Test 16: Explain Index Contributions Sum vs Base
def test_explain_index_contributions_sum_vs_base():
    response = client.get("/api/index/contributors")
    assert response.status_code == 200
    data = response.json()
    nat_idx = data["national_index"]
    diff_vs_base = round(nat_idx - 100.0, 2)
    # Sum of all contributions
    total_contrib = round(sum(c["contribution"] for c in data["all_contributors"]), 2)
    assert abs(total_contrib - diff_vs_base) < 0.5


# Test 17: Route Explorer default query returns active data
def test_route_explorer_default_has_data():
    response = client.get("/api/routes/DEL/BOM?booking_window=D-30&cabin=Economy&fare_category=Standard")
    assert response.status_code == 200
    data = response.json()
    assert data["sample_count"] > 0
    assert data["average_fare"] > 1000.0
    assert data["median_fare"] > 1000.0


# Test 18: CPI baseline matches live summary
def test_cpi_simulation_baseline_matches_summary():
    summary_resp = client.get("/api/dashboard/summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    mom = summary["monthly_change"]

    cpi_resp = client.post("/api/cpi/simulate", json={"airfare_index_movement": mom, "transport_weight_pct": 1.45, "scenario": "current"})
    assert cpi_resp.status_code == 200
    cpi_data = cpi_resp.json()
    assert abs(cpi_data["airfare_movement_pct"] - mom) < 0.01
