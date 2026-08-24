from typing import Dict, Any


def compute_composite_quality_score(
    completeness: float = 99.2,
    freshness: float = 98.8,
    schema_validity: float = 99.9,
    source_agreement: float = 97.4,
    observation_consistency: float = 96.8
) -> Dict[str, Any]:
    """
    MoSPI AI-Assisted Data Quality Scoring Engine.
    Computes an auditable confidence score based on multi-dimensional quality metrics:
    Quality Score = 0.30*Completeness + 0.25*Freshness + 0.20*SchemaValidity + 0.15*SourceAgreement + 0.10*Consistency
    """
    weights = {
        "completeness": 0.30,
        "freshness": 0.25,
        "schema_validity": 0.20,
        "source_agreement": 0.15,
        "observation_consistency": 0.10
    }

    composite_score = (
        weights["completeness"] * completeness +
        weights["freshness"] * freshness +
        weights["schema_validity"] * schema_validity +
        weights["source_agreement"] * source_agreement +
        weights["observation_consistency"] * observation_consistency
    )

    return {
        "overall_score": round(composite_score, 2),
        "completeness": round(completeness, 2),
        "freshness": round(freshness, 2),
        "schema_validity": round(schema_validity, 2),
        "source_agreement": round(source_agreement, 2),
        "observation_consistency": round(observation_consistency, 2),
        "weights": weights,
        "methodology": "Weighted Multi-Factor MoSPI Statistical Data Quality Index"
    }
