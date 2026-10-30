import pytest
from agents.orchestrator import orchestrator
from core.validation import EvidenceVerifier

def test_selective_query_routing():
    # Only invoke agents relevant to user question
    agents_port = orchestrator.route_query_to_agents("How should I optimize my portfolio and efficient frontier?")
    assert "RiskManagementAgent" in agents_port
    assert "NewsIntelligenceAgent" not in agents_port

    agents_news = orchestrator.route_query_to_agents("What is the latest news and sentiment for RELIANCE?")
    assert "NewsIntelligenceAgent" in agents_news
    assert "RiskManagementAgent" not in agents_news

    agents_tech = orchestrator.route_query_to_agents("Check technical regime, RSI and MACD signals")
    assert "TechnicalAnalysisAgent" in agents_tech
    assert "NewsIntelligenceAgent" not in agents_tech

@pytest.mark.anyio
async def test_full_research_run_execution():
    run = await orchestrator.execute_research_run(
        query="Provide technical regime, forecast, and news context for RELIANCE",
        symbol="RELIANCE",
        requested_agents=["MarketDataAgent", "TechnicalAnalysisAgent", "ForecastingAgent", "NewsIntelligenceAgent"]
    )

    assert run.id.startswith("run_")
    assert run.market_data is not None
    assert run.technical_analysis is not None
    assert run.forecasting is not None
    assert run.news_intelligence is not None
    assert run.evidence_verification.is_verified is True
    assert len(run.synthesis_summary) > 50
    assert run.metadata.is_simulated is True

def test_evidence_verification_detects_prohibited_certainty():
    bad_payload = {
        "summary": "This algorithm guarantees a 100% win rate and risk-free profit.",
        "return_assumption_method": "Historical",
        "var_metrics": {"is_one_sided_left_tail": True},
        "path_max_drawdown_median": 12.5,
        "metadata": {
            "data_source": "Feed",
            "data_timestamp": "2026-10-31",
            "limitations": ["Model risk"],
            "disclaimer": "Simulated"
        }
    }

    report = EvidenceVerifier.verify_agent_output("FaultyAgent", bad_payload)
    assert report.is_verified is False
    assert len(report.unsupported_claims_found) >= 2
    assert any("Prohibited certainty assertion" in c for c in report.unsupported_claims_found)
