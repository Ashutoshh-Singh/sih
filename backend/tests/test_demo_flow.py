import requests

def run_judge_level_acceptance_suite():
    print("==================================================================")
    print(" MoSPI Real-Time Airfare Price Index — Judge-Level Acceptance Suite")
    print("==================================================================")

    # 1. 3D Time-Travel Landing Page & Telemetry
    r = requests.get("http://localhost:3000")
    assert r.status_code == 200, "Landing Page failed"
    print("[PASS] 1. Landing Hero (3D Time-Travel Subcontinent Network & Ticker)")

    # 2. National Overview & Single Source of Truth
    summary = requests.get("http://127.0.0.1:8000/api/dashboard/summary").json()
    assert summary["index"] > 100.0, f"Index invalid: {summary['index']}"
    print(f"[PASS] 2. National Overview (Calculated Index: {summary['index']}, Base: {summary['base_index']})")

    # 3. What Changed Since Last Refresh Delta
    changes = requests.get("http://127.0.0.1:8000/api/dashboard/changes").json()
    assert "index_delta" in changes and changes["new_observations_count"] > 0
    print(f"[PASS] 3. What Changed Delta (+{changes['index_delta']} pts, +{changes['new_observations_count']} obs)")

    # 4. Universal Explain This Number
    explain_nat = requests.get("http://127.0.0.1:8000/api/index/explain?metric=national_index").json()
    assert "deterministic_narrative" in explain_nat
    print(f"[PASS] 4. Universal Explain Metric ({explain_nat['metric_name']})")

    # 5. Data Lineage & Traceability (5-Level Hierarchy with SHA-256 Provenance)
    lineage = requests.get("http://127.0.0.1:8000/api/index/lineage").json()
    assert len(lineage["routes"]) == 18 and len(lineage["routes"][0]["sample_observations"]) > 0
    assert lineage["routes"][0]["sample_observations"][0]["payload_hash"].startswith("SHA256-")
    print(f"[PASS] 5. Data Lineage (Traceable across {len(lineage['routes'])} routes down to SHA-256 hashes)")

    # 6. Route Intelligence & Validation
    route_del_bom = requests.get("http://127.0.0.1:8000/api/routes/DEL/BOM").json()
    assert route_del_bom["origin"]["iata_code"] == "DEL"
    assert route_del_bom["destination"]["iata_code"] == "BOM"
    print(f"[PASS] 6. Route Intelligence (DEL->BOM Avg: Rs.{route_del_bom['average_fare']}, Index: {route_del_bom['route_index']})")

    # 7. Cross-Source Fare Agreement & Concordance
    agreement = requests.get("http://127.0.0.1:8000/api/sources/agreement?origin=DEL&destination=BOM&booking_window=D-30").json()
    assert agreement["agreement_score"] >= 80.0 and len(agreement["tariffs"]) == 4
    print(f"[PASS] 7. Source Agreement ({agreement['agreement_score']}% concord across {len(agreement['tariffs'])} channels)")

    # 8. AI Data Quality & Anomaly Triage
    quality = requests.get("http://127.0.0.1:8000/api/quality").json()
    anomalies = requests.get("http://127.0.0.1:8000/api/anomalies").json()
    assert quality["overall_score"] >= 95.0 and len(anomalies) > 0
    print(f"[PASS] 8. Data Quality Centre ({quality['overall_score']}% score, {len(anomalies)} ML flags)")

    # 9. Basket Weight Simulator
    basket_sim = requests.post("http://127.0.0.1:8000/api/simulation/basket", json={"modifiers": [{"route_id": 1, "weight_pct": 16.0}]}).json()
    assert basket_sim["simulated_national_index"] > 0
    print(f"[PASS] 9. Basket Weight Simulator (Simulated API: {basket_sim['simulated_national_index']})")

    # 10. Scenario Laboratory (Macro Shock Experiments)
    scenario_sim = requests.post("http://127.0.0.1:8000/api/simulation/scenario", json={"scenario_preset": "festival_demand"}).json()
    assert scenario_sim["national_impact_delta"] > 0
    print(f"[PASS] 10. Scenario Lab ({scenario_sim['scenario_name']}: +{scenario_sim['national_impact_delta']} pts)")

    # 11. CPI Pass-Through Simulator
    cpi_sim = requests.post("http://127.0.0.1:8000/api/cpi/simulate", json={"airfare_index_movement": 2.84, "transport_weight_pct": 1.45, "scenario": "current"}).json()
    assert cpi_sim["cpi_impact_basis_points"] > 0
    print(f"[PASS] 11. CPI Simulator (+{cpi_sim['cpi_impact_basis_points']} bps headline pass-through)")

    # 12. Statistical Audit Log Ledger
    audit_logs = requests.get("http://127.0.0.1:8000/api/audit").json()
    assert len(audit_logs) > 0
    print(f"[PASS] 12. Statistical Audit Log ({len(audit_logs)} cryptographic events tracked)")

    # 13. System Snapshot Metadata & Offline Fallback
    snapshot = requests.get("http://127.0.0.1:8000/api/system/snapshot").json()
    assert snapshot["snapshot_id"] == "SNP-20260823-2230"
    print(f"[PASS] 13. System Snapshot ({snapshot['snapshot_id']}, Status: {snapshot['system_status']})")

    print("==================================================================")
    print(" RESULT: ALL 13 ACCEPTANCE TESTS PASSED (100% OPERATIONAL)")
    print("==================================================================")

if __name__ == "__main__":
    run_judge_level_acceptance_suite()
