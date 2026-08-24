from typing import Dict, Any, List


def simulate_cpi_impact(
    airfare_movement_pct: float = 2.84,
    transport_cpi_weight: float = 1.45,
    scenario: str = "current"
) -> Dict[str, Any]:
    """
    MoSPI CPI Integration Simulator.
    Simulates the weighted contribution of airfare price movements to the Transport & Communication Subgroup and Headline CPI.
    """
    # Preset adjustments if scenario is specified
    if scenario == "moderate_inflation":
        airfare_movement_pct = 5.20
    elif scenario == "high_inflation":
        airfare_movement_pct = 12.40
    elif scenario == "fare_decline":
        airfare_movement_pct = -4.15

    # CPI impact in basis points (1 bp = 0.01% of CPI)
    # Contribution to Headline CPI = (Airfare Movement % * Airfare Weight in CPI %) / 100
    cpi_impact_percentage = (airfare_movement_pct * transport_cpi_weight) / 100.0
    cpi_impact_basis_points = cpi_impact_percentage * 100.0  # e.g., 2.84% * 1.45% = 0.04118% = 4.12 bps

    # Simulated Transport Subgroup Delta (assuming airfare is 18% of the overall Transport & Communication subgroup)
    transport_subgroup_delta = airfare_movement_pct * 0.18

    # Top contributing routes to this simulated impact
    top_routes = [
        {"route": "DEL → BOM", "weight": 12.4, "movement": airfare_movement_pct * 1.15, "cpi_contrib_bps": round(cpi_impact_basis_points * 0.28, 2)},
        {"route": "DEL → BLR", "weight": 10.1, "movement": airfare_movement_pct * 0.98, "cpi_contrib_bps": round(cpi_impact_basis_points * 0.21, 2)},
        {"route": "BOM → BLR", "weight": 8.6, "movement": airfare_movement_pct * 0.85, "cpi_contrib_bps": round(cpi_impact_basis_points * 0.16, 2)},
        {"route": "DEL → HYD", "weight": 7.8, "movement": airfare_movement_pct * 1.02, "cpi_contrib_bps": round(cpi_impact_basis_points * 0.14, 2)},
        {"route": "DEL → GOI", "weight": 6.5, "movement": airfare_movement_pct * 1.30, "cpi_contrib_bps": round(cpi_impact_basis_points * 0.12, 2)},
    ]

    policy_interpretation = (
        f"Under a {airfare_movement_pct:+.2f}% airfare index movement with an assumed basket weight of {transport_cpi_weight:.2f}%, "
        f"the estimated contribution to national headline CPI is {cpi_impact_basis_points:+.2f} basis points "
        f"({cpi_impact_percentage:+.4f}%). The Transport & Communication subgroup index would experience a {transport_subgroup_delta:+.2f}% shift."
    )

    return {
        "scenario": scenario,
        "airfare_movement_pct": round(airfare_movement_pct, 2),
        "airfare_cpi_weight": round(transport_cpi_weight, 2),
        "cpi_impact_basis_points": round(cpi_impact_basis_points, 2),
        "cpi_impact_percentage": round(cpi_impact_percentage, 4),
        "simulated_transport_index_delta": round(transport_subgroup_delta, 2),
        "top_impacting_routes": top_routes,
        "policy_interpretation": policy_interpretation,
        "disclaimer": "Prototype simulation only. Official CPI compilation adheres to MoSPI's statistical weighting guidelines and base revision methodologies."
    }
