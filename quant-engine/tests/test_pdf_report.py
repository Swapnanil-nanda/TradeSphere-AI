import pytest
from reporting.pdf_generator import PDFReportGenerator

def test_pdf_report_generation():
    mock_run = {
        "id": "run_test_pdf_123",
        "user_query": "Multi-agent evaluation of RELIANCE",
        "invoked_agents": ["MarketDataAgent", "TechnicalAnalysisAgent", "ForecastingAgent"],
        "timestamp": "2026-10-31T03:00:00Z",
        "synthesis_summary": "Comprehensive quantitative analysis completed with favorable technical regime.",
        "evidence_verification": {
            "is_verified": True,
            "unsupported_claims_found": [],
            "audit_notes": ["One-sided VaR verified.", "Path drawdown verified."]
        },
        "technical_analysis": {
            "symbol": "RELIANCE",
            "regime": "BULLISH_TREND",
            "current_price": 2985.40,
            "ema_20": 2972.10,
            "sma_50": 2940.00,
            "rsi_14": 56.40,
            "macd_hist": 4.20,
            "bb_upper": 3040.00,
            "bb_lower": 2920.00
        },
        "forecasting": {
            "symbol": "RELIANCE",
            "horizons": [
                {
                    "horizon_days": 1,
                    "expected_return_pct": 0.05,
                    "median_return_pct": 0.04,
                    "confidence_interval_80": [-0.8, 0.9],
                    "confidence_interval_95": [-1.5, 1.6]
                },
                {
                    "horizon_days": 5,
                    "expected_return_pct": 0.28,
                    "median_return_pct": 0.25,
                    "confidence_interval_80": [-1.8, 2.3],
                    "confidence_interval_95": [-3.2, 3.8]
                },
                {
                    "horizon_days": 20,
                    "expected_return_pct": 1.12,
                    "median_return_pct": 1.05,
                    "confidence_interval_80": [-3.5, 5.8],
                    "confidence_interval_95": [-6.2, 8.4]
                }
            ]
        }
    }

    pdf_bytes = PDFReportGenerator.generate_research_pdf(mock_run)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")
