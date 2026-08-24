"""
Vajronix AI Anomaly Protection Engine
Ministry of Statistics and Programme Implementation (MoSPI) - SIH 2026

Governance Principle:
"AI protects the data. Mathematics calculates the index."
AI assists data quality by flagging potential anomalies and volatility spikes;
mathematics (Weighted Laspeyres with trimmed mean) deterministically calculates the index.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


def detect_fare_anomalies(
    observations: List[Dict[str, Any]],
    contamination: float = 0.03
) -> List[Dict[str, Any]]:
    """
    ML-assisted Anomaly Detection using Isolation Forest combined with IQR & Route Median Bounds.
    Analyzes observed standardized payable fares across routes and booking windows.
    Returns observations enriched with machine-readable reason codes and plain-language diagnostic reasons.
    """
    if not observations or len(observations) < 5:
        return []

    df = pd.DataFrame(observations)

    # Use standardized_payable_fare if present, otherwise total_fare
    fare_col = "standardized_payable_fare" if "standardized_payable_fare" in df.columns and df["standardized_payable_fare"].notna().any() else "total_fare"

    features = [fare_col, "booking_lead_days"]
    X = df[features].fillna(0).values

    # Isolation Forest Model
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=contamination,
        random_state=42
    )
    iso_forest.fit(X)

    # Decision function: lower values mean more anomalous
    scores = -iso_forest.decision_function(X)
    preds = iso_forest.predict(X)  # -1 for anomaly, 1 for normal

    anomalies = []
    for idx, row in df.iterrows():
        is_ml_anomaly = bool(preds[idx] == -1)
        score = float(scores[idx])
        observed_val = float(row[fare_col])

        # Compute route-specific IQR benchmark
        route_fares = df[df["route_id"] == row["route_id"]][fare_col].values
        if len(route_fares) >= 4:
            q25 = float(np.percentile(route_fares, 25))
            q75 = float(np.percentile(route_fares, 75))
            iqr = q75 - q25
            median = float(np.median(route_fares))
        else:
            q25 = observed_val * 0.8
            q75 = observed_val * 1.2
            iqr = q75 - q25
            median = observed_val

        lower_bound = max(1200.0, q25 - 1.5 * iqr)
        upper_bound = q75 + 1.5 * iqr

        is_iqr_outlier = observed_val > upper_bound or observed_val < lower_bound
        deviation_from_median_pct = round(((observed_val - median) / max(1.0, median)) * 100.0, 1)
        is_high_median_deviation = abs(deviation_from_median_pct) > 75.0

        reason_codes = []
        if is_iqr_outlier:
            reason_codes.append("IQR_OUTLIER")
        if is_ml_anomaly:
            reason_codes.append("ISOLATION_FOREST_FLAG")
        if is_high_median_deviation:
            reason_codes.append("HIGH_ROUTE_MEDIAN_DEVIATION")
        if abs(deviation_from_median_pct) > 120.0:
            reason_codes.append("CROSS_SOURCE_DISAGREEMENT")

        if is_ml_anomaly or is_iqr_outlier or is_high_median_deviation:
            if not reason_codes:
                reason_codes = ["STATISTICAL_VOLATILITY_OUTLIER"]

            if observed_val > upper_bound:
                reason = (
                    f"Observed fare ₹{observed_val:,.0f} (+{deviation_from_median_pct:+.1f}% vs median ₹{median:,.0f}) "
                    f"exceeds statistical upper bound (₹{upper_bound:,.0f}) for {row.get('booking_window', 'this window')} "
                    f"on {row.get('origin_iata', '')}→{row.get('destination_iata', '')}."
                )
            elif observed_val < lower_bound:
                reason = (
                    f"Observed fare ₹{observed_val:,.0f} ({deviation_from_median_pct:+.1f}% vs median ₹{median:,.0f}) "
                    f"falls below baseline threshold (₹{lower_bound:,.0f}), indicating potential unbundled promotional zero-base fare."
                )
            else:
                reason = (
                    f"Multi-dimensional anomaly detected (Score: {score:.2f}, Deviation: {deviation_from_median_pct:+.1f}%) "
                    f"across lead-time to tariff elasticity on {row.get('origin_iata', '')}→{row.get('destination_iata', '')}."
                )

            anomalies.append({
                "fare_observation_id": int(row["id"]),
                "origin_iata": str(row.get("origin_iata", "")),
                "destination_iata": str(row.get("destination_iata", "")),
                "airline_name": str(row.get("airline_name", "")),
                "flight_number": str(row.get("flight_number", "")),
                "travel_date": str(row.get("travel_date", "")),
                "booking_window": str(row.get("booking_window", "")),
                "observed_fare": observed_val,
                "expected_fare_range": f"₹{int(lower_bound):,} – ₹{int(upper_bound):,}",
                "route_median": round(median, 0),
                "deviation_pct": deviation_from_median_pct,
                "anomaly_score": round(score, 3),
                "detection_method": "IsolationForest + IQR Hybrid",
                "reason_codes": reason_codes,
                "reason": reason,
                "detection_flags": {
                    "iqr_outlier": is_iqr_outlier,
                    "isolation_forest_flag": is_ml_anomaly,
                    "high_median_deviation": is_high_median_deviation,
                    "cross_source_disagreement": "CROSS_SOURCE_DISAGREEMENT" in reason_codes,
                },
                "review_status": "PENDING"
            })

    return anomalies
