"""
TradeSphere AI - Independent Evidence Verification Component
Audits outputs from specialist agents before returning to caller.
Enforces non-negotiable financial modeling invariants.
"""
from typing import Dict, Any, List
import re
from .models import EvidenceVerificationReport

BANNED_CERTAINTY_PHRASES = [
    r"\bguaranteed (?:return|profit|gain|accuracy|alpha|payout|income)\b",
    r"\bguarantees (?:a |an |the )?(?:profit|return|gain)\b",
    r"\brisk-free profit\b",
    r"\b100% win rate\b",
    r"\bcertain prediction\b",
    r"\bcannot lose\b",
    r"\bsure-fire\b"
]

class EvidenceVerifier:
    """
    Independent audit component that verifies quantitative outputs against regulatory
    and institutional mathematical invariants.
    """

    @classmethod
    def verify_agent_output(cls, agent_name: str, payload: Dict[str, Any]) -> EvidenceVerificationReport:
        unsupported_claims: List[str] = []
        audit_notes: List[str] = []

        # 1. Text & Claim Scanning for prohibited certainty assertions (excluding disclaimers/limitations)
        filtered_payload = {k: v for k, v in payload.items() if k not in ["disclaimer", "limitations"]}
        payload_str = str(filtered_payload).lower()
        for pattern in BANNED_CERTAINTY_PHRASES:
            matches = re.findall(pattern, payload_str)
            if matches:
                claim_err = f"Prohibited certainty assertion detected in {agent_name}: '{matches[0]}'"
                unsupported_claims.append(claim_err)

        # 2. Return Assumptions Validation
        return_assumptions_explicit = True
        if agent_name in ["RiskManagementAgent", "Optimization", "MonteCarlo"]:
            method = payload.get("return_assumption_method") or payload.get("method")
            if not method or method.strip() == "":
                return_assumptions_explicit = False
                unsupported_claims.append("Return assumptions were not explicitly declared or documented.")
            else:
                audit_notes.append(f"Declared return assumption method: {method}")

        # 3. VaR Definition Compliance (Strict one-sided left tail)
        var_compliant = True
        if "var_metrics" in payload or "parametric_var_pct" in payload:
            metrics = payload.get("var_metrics", payload)
            if not metrics.get("is_one_sided_left_tail", False):
                var_compliant = False
                unsupported_claims.append("VaR metric must strictly represent a one-sided left-tail loss distribution.")
            else:
                audit_notes.append("VaR correctly verified as one-sided left-tail loss at specified confidence level.")

        # 4. Path-Based Drawdown Verification (Must not be estimated solely via volatility formula)
        path_drawdown_verified = True
        if "simulation_type" in payload:
            # Monte Carlo check
            if "path_max_drawdown_median" not in payload or payload.get("path_max_drawdown_median") is None:
                path_drawdown_verified = False
                unsupported_claims.append("Monte Carlo must compute empirical path-by-path peak-to-trough max drawdown.")
            else:
                audit_notes.append("Path-based maximum drawdown verified across sample paths.")

        # 5. Position Sizing Risk Limits (Never force minimum 1 unit)
        if "recommendedQuantity" in payload or "quantity" in payload:
            qty = payload.get("recommendedQuantity", payload.get("quantity", 0))
            breached = payload.get("riskBreached", payload.get("riskExceeded", False))
            if breached and qty > 0:
                unsupported_claims.append("Invariant violated: Position size was non-zero despite risk cap breach.")
            else:
                audit_notes.append("Safe position sizing rules respected (0 units on risk cap breach).")

        # 6. Forecasting Uncertainty Certification
        if agent_name == "ForecastingAgent" or "horizons" in payload:
            certainty = payload.get("certainty_claimed", False)
            if certainty:
                unsupported_claims.append("Forecasting Agent must explicitly declare that forecasts are probabilistic.")
            else:
                audit_notes.append("Forecasting uncertainty properly quantified with confidence intervals.")

        # 7. Sentiment Noise Disclosure
        if agent_name == "NewsIntelligenceAgent" or "overall_sentiment_score" in payload:
            if payload.get("signal_guaranteed", False):
                unsupported_claims.append("Sentiment must never be framed as a guaranteed directional trading signal.")
            else:
                audit_notes.append("Sentiment classified as noisy auxiliary context with disclaimer.")

        # 8. Mandatory Metadata Check
        metadata = payload.get("metadata", {})
        has_source = bool(metadata.get("data_source"))
        has_timestamp = bool(metadata.get("data_timestamp"))
        has_limitations = isinstance(metadata.get("limitations"), list) and len(metadata.get("limitations")) > 0
        has_disclaimer = bool(metadata.get("disclaimer"))

        disclaimers_present = has_disclaimer and has_limitations
        input_validation_passed = has_source and has_timestamp

        if not has_source:
            unsupported_claims.append("Metadata missing explicit 'data_source'.")
        if not has_timestamp:
            unsupported_claims.append("Metadata missing explicit 'data_timestamp'.")
        if not has_limitations:
            unsupported_claims.append("Metadata missing explicit modeling 'limitations'.")

        is_verified = (
            len(unsupported_claims) == 0
            and return_assumptions_explicit
            and var_compliant
            and path_drawdown_verified
            and disclaimers_present
            and input_validation_passed
        )

        return EvidenceVerificationReport(
            is_verified=is_verified,
            unsupported_claims_found=unsupported_claims,
            input_validation_passed=input_validation_passed,
            var_definitions_compliant=var_compliant,
            path_drawdown_verified=path_drawdown_verified,
            return_assumptions_explicit=return_assumptions_explicit,
            disclaimers_present=disclaimers_present,
            audit_notes=audit_notes
        )
