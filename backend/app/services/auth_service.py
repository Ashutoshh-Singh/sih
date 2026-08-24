import hashlib
import secrets
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..database.models import User, UserActivity

# Statutory MoSPI Role Permission Definitions
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "STATISTICAL_OFFICER": [
        "VIEW_INDEX_METRICS",
        "EXPLORE_ROUTES",
        "AUDIT_LIVE_FARES",
        "TRIAGE_ANOMALIES",
        "EXPORT_STATISTICAL_BRIEF",
        "VIEW_QUALITY_SCORES",
        "RUN_BASKET_SIMULATION",
    ],
    "ECONOMIC_ADVISOR": [
        "VIEW_INDEX_METRICS",
        "EXPLORE_ROUTES",
        "RUN_CPI_SIMULATION",
        "RUN_SCENARIO_EXPERIMENTS",
        "APPROVE_MONTHLY_INDEX_RELEASE",
        "EXPORT_EXECUTIVE_BRIEF",
        "SIGN_OFF_CPI_INTEGRATION",
        "VIEW_LINEAGE_TRACEABILITY",
    ],
    "DATA_ENGINEER": [
        "VIEW_INDEX_METRICS",
        "MONITOR_DATA_INGESTION",
        "TRIGGER_COLLECTION_JOBS",
        "CALIBRATE_SOURCE_ADAPTERS",
        "INSPECT_RAW_PAYLOADS",
        "RECALCULATE_QUALITY_METRICS",
        "VIEW_API_TELEMETRY",
    ],
    "SYSTEM_ADMIN": [
        "VIEW_INDEX_METRICS",
        "EXPLORE_ROUTES",
        "AUDIT_LIVE_FARES",
        "TRIAGE_ANOMALIES",
        "EXPORT_STATISTICAL_BRIEF",
        "RUN_CPI_SIMULATION",
        "RUN_SCENARIO_EXPERIMENTS",
        "APPROVE_MONTHLY_INDEX_RELEASE",
        "MONITOR_DATA_INGESTION",
        "TRIGGER_COLLECTION_JOBS",
        "MANAGE_USERS_AND_ROLES",
        "AUDIT_SECURITY_LOGS",
        "CONFIGURE_SYSTEM_PARAMETERS",
        "RESET_DATABASE_STATE",
    ],
}


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with consistent government salt."""
    salt = "mospi_sih_2026_airfare_index_salt"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password match."""
    return hash_password(plain_password) == hashed_password


def get_user_permissions(role: str) -> List[str]:
    """Retrieve statutory permissions for a specified role."""
    return ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["STATISTICAL_OFFICER"])


def log_user_activity(
    db: Session,
    user_id: int,
    action: str,
    module: str,
    details: Optional[str] = None,
    ip_address: str = "10.24.1.18",
    status: str = "SUCCESS",
) -> UserActivity:
    """Record an audit trail event for officer actions."""
    activity = UserActivity(
        user_id=user_id,
        action=action,
        module=module,
        details=details,
        ip_address=ip_address,
        status=status,
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def generate_auth_token(user: User) -> str:
    """Generate mock cryptographically signed token for local fast demo session."""
    raw = f"{user.id}:{user.username}:{user.role}:{datetime.datetime.utcnow().isoformat()}"
    signature = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]
    return f"mospi_sec_{user.id}_{signature}"
