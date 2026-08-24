import datetime
from typing import List, Dict, Any, Optional

# In-memory statistical audit ledger with rich pre-seeded prototype governance actions
AUDIT_LOG_LEDGER: List[Dict[str, Any]] = [
    {
        "id": 105,
        "timestamp": "2026-08-23 22:45:12",
        "action_type": "ANOMALY_REVIEW",
        "user_role": "Statistical Officer (MoSPI)",
        "affected_entity": "Observation #AF-00104 (DEL-GOI)",
        "previous_state": "PENDING",
        "new_state": "QUARANTINED_ANOMALY",
        "details": "Confirmed tariff spike ₹19,850 on D-15 exceeds 99th percentile threshold. Isolated from Laspeyres basket."
    },
    {
        "id": 104,
        "timestamp": "2026-08-23 22:30:00",
        "action_type": "PIPELINE_REFRESH",
        "user_role": "Automated Ingestion Daemon",
        "affected_entity": "National Index Batch",
        "previous_state": "118.16",
        "new_state": "118.42",
        "details": "Ingested 324 observation vectors from DGCA reference dataset & GDS adapters. Recalculated 18 route price relatives."
    },
    {
        "id": 103,
        "timestamp": "2026-08-23 21:15:40",
        "action_type": "BASKET_SIMULATION",
        "user_role": "Chief Macroeconomist",
        "affected_entity": "Trunk Basket Weights",
        "previous_state": "DGCA 2025 Base Weights",
        "new_state": "Simulated Weight Matrix",
        "details": "Evaluated +2.5% weight expansion on DEL-BOM and BOM-BLR corridors. Simulated API: 118.60."
    },
    {
        "id": 102,
        "timestamp": "2026-08-23 20:00:00",
        "action_type": "INDEX_RECALCULATION",
        "user_role": "Index Computation Engine",
        "affected_entity": "Route Index DEL-BLR",
        "previous_state": "120.50",
        "new_state": "121.20",
        "details": "Updated representative trimmed mean from ₹6,190 to ₹6,240 based on D-30 corporate demand shift."
    },
    {
        "id": 101,
        "timestamp": "2026-08-23 18:42:15",
        "action_type": "SOURCE_HEALTH_EVENT",
        "user_role": "Adapter Telemetry Monitor",
        "affected_entity": "OTA Aggregator Adapter",
        "previous_state": "OPERATIONAL",
        "new_state": "OPERATIONAL",
        "details": "Transient 120ms latency spike detected and resolved. Adapter concordance maintained at 97.4%."
    }
]


def record_audit_entry(
    action_type: str,
    user_role: str,
    affected_entity: str,
    previous_state: Optional[str],
    new_state: Optional[str],
    details: str
) -> Dict[str, Any]:
    entry = {
        "id": len(AUDIT_LOG_LEDGER) + 101,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "action_type": action_type,
        "user_role": user_role,
        "affected_entity": affected_entity,
        "previous_state": previous_state,
        "new_state": new_state,
        "details": details
    }
    AUDIT_LOG_LEDGER.insert(0, entry)
    return entry


def get_audit_logs(filter_type: Optional[str] = None) -> List[Dict[str, Any]]:
    if not filter_type or filter_type.upper() == "ALL":
        return AUDIT_LOG_LEDGER
    return [entry for entry in AUDIT_LOG_LEDGER if entry["action_type"] == filter_type.upper()]
