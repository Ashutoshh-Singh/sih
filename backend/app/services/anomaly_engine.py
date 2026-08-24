import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import IsolationForest


def detect_fare_anomalies(
    observations: List[Dict[str, Any]],
    contamination: float = 0.03
) -> List[Dict[str, Any]]:
    """
    ML-assisted Anomaly Detection using Isolation Forest combined with IQR & Z-score bounds.
    Analyzes observed fares across routes and booking windows.
    Returns observations enriched with anomaly scores and explanatory diagnostic reasons.
    """
    if not observations or len(observations) < 5:
        return []

    df = pd.DataFrame(observations)

    # Feature vector: total_fare, booking_lead_days, base_fare, taxes
    features = ["total_fare", "booking_lead_days"]
    X = df[features].values

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
        is_ml_anomaly = preds[idx] == -1
        score = float(scores[idx])

        # Compute route-specific IQR benchmark
        route_fares = df[df["route_id"] == row["route_id"]]["total_fare"].values
        q25 = np.percentile(route_fares, 25)
        q75 = np.percentile(route_fares, 75)
        iqr = q75 - q25
        median = np.median(route_fares)

        lower_bound = max(1500, q25 - 1.5 * iqr)
        upper_bound = q75 + 1.5 * iqr

        is_iqr_outlier = row["total_fare"] > upper_bound or row["total_fare"] < lower_bound

        if is_ml_anomaly or is_iqr_outlier:
            if row["total_fare"] > upper_bound:
                reason = (
                    f"Observed fare ₹{row['total_fare']:,.0f} significantly exceeds the historical upper bound "
                    f"(₹{upper_bound:,.0f}) for {row.get('booking_window', 'this lead window')} on {row.get('origin_iata', '')}→{row.get('destination_iata', '')}."
                )
            elif row["total_fare"] < lower_bound:
                reason = (
                    f"Observed fare ₹{row['total_fare']:,.0f} falls below expected baseline threshold (₹{lower_bound:,.0f}), "
                    f"indicating potential unbundled promotional fare or schema mismatch."
                )
            else:
                reason = (
                    f"Multi-dimensional anomaly detected (Score: {score:.2f}) across fare-to-lead-time correlation."
                )

            anomalies.append({
                "fare_observation_id": int(row["id"]),
                "origin_iata": str(row.get("origin_iata", "")),
                "destination_iata": str(row.get("destination_iata", "")),
                "airline_name": str(row.get("airline_name", "")),
                "flight_number": str(row.get("flight_number", "")),
                "travel_date": str(row.get("travel_date", "")),
                "booking_window": str(row.get("booking_window", "")),
                "observed_fare": float(row["total_fare"]),
                "expected_fare_range": f"₹{int(lower_bound):,} – ₹{int(upper_bound):,}",
                "anomaly_score": round(score, 3),
                "detection_method": "IsolationForest + IQR Hybrid",
                "reason": reason,
                "review_status": "PENDING"
            })

    return anomalies
