"""
Unit and integration tests for advanced quantitative research modules:
1. Document Intelligence & Evidence Citations
2. Portfolio Attribution & Factor Risk Decomposition (with Euler additivity)
3. Strategy Reproducibility Packages & Cryptographic Checksum
4. Paper Experiments with Versioning & Drift Monitoring
5. REST API Integration
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from agents.document_intelligence import DocumentIntelligenceAgent
from wealth.portfolio_attribution import PortfolioAttributionEngine
from reporting.reproducibility import StrategyReproducibilityGenerator
from agents.strategy_lab import StrategyLabAgent
from agents.experiments import experiments_store
from reporting.pdf_generator import PDFReportGenerator

client = TestClient(app)

def test_document_intelligence_agent():
    agent = DocumentIntelligenceAgent()
    result = agent.analyze_symbol_documents(symbol="RELIANCE", query="revenue margins and risk")

    assert result.symbol == "RELIANCE"
    assert len(result.documents_analyzed) >= 2
    assert len(result.snippets) >= 2
    assert len(result.consensus_insights) >= 1
    assert result.evidence_score > 50.0

    # Check evidence snippets format
    for snip in result.snippets:
        assert snip.snippet_id.startswith("snip_")
        assert len(snip.exact_text) > 10

def test_portfolio_attribution_brinson_fachler():
    holdings = [
        {"symbol": "RELIANCE", "value": 400000.0, "return": 0.15},
        {"symbol": "TCS", "value": 300000.0, "return": 0.18},
        {"symbol": "HDFCBANK", "value": 300000.0, "return": 0.14}
    ]
    res = PortfolioAttributionEngine.compute_brinson_attribution(holdings, benchmark_name="NIFTY50")

    assert res["benchmark"] == "NIFTY50"
    assert "portfolio_return_pct" in res
    assert "benchmark_return_pct" in res
    assert "active_return_bps" in res

    # Verify Brinson decomposition adds up
    summary = res["attribution_summary"]
    total_reconciled = summary["total_reconciled_bps"]
    sum_effects = summary["allocation_effect_bps"] + summary["selection_effect_bps"] + summary["interaction_effect_bps"]
    assert abs(total_reconciled - sum_effects) < 0.2
    assert len(res["sectors"]) > 0

def test_risk_decomposition_euler_additivity():
    holdings = [
        {"symbol": "RELIANCE", "value": 500000.0},
        {"symbol": "TCS", "value": 300000.0},
        {"symbol": "AAPL", "value": 200000.0}
    ]
    res = PortfolioAttributionEngine.compute_risk_decomposition(holdings, confidence_level=0.95)

    assert res["portfolio_value"] == 1000000.0
    assert res["confidence_level"] == 0.95
    assert res["annualized_portfolio_volatility_pct"] > 0
    assert res["diversification_ratio"] >= 1.0

    # Euler additivity verification: sum of component VaR contributions must equal ~100%
    verif = res["verification"]
    assert verif["euler_additivity_verified"] is True
    assert abs(verif["sum_risk_contribution_pct"] - 100.0) < 0.5

    # Risk decomposition has systematic and specific components summing to 100%
    decomp = res["risk_decomposition"]
    assert abs((decomp["systematic_market_risk_pct"] + decomp["specific_idiosyncratic_risk_pct"]) - 100.0) < 0.1

def test_strategy_reproducibility_package_and_pdf():
    strat_lab = StrategyLabAgent()
    backtest = strat_lab.run_backtest(
        strategy_name="EMA_CROSSOVER",
        symbol="RELIANCE",
        initial_capital=1000000.0,
        bars=150,
        seed=42
    )

    package = StrategyReproducibilityGenerator.build_package(backtest)
    assert len(package["provenance_hash"]) == 64  # valid SHA-256 hex string
    assert package["reproducibility_version"] == "1.0-REGULATORY"
    assert package["random_seed"] == 42
    assert len(package["replication_code"]) > 50

    # Generate PDF from reproducibility package
    pdf_bytes = PDFReportGenerator.generate_strategy_pdf(package)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

def test_paper_experiments_store_lifecycle():
    # 1. Create Experiment
    exp = experiments_store.create_experiment(
        name="Test Momentum Sandbox",
        strategy_name="DONCHIAN_MOMENTUM",
        symbol="TATAMOTORS",
        initial_capital=500000.0,
        parameters={"window": 20}
    )
    assert exp.id.startswith("exp-tatamotors-")
    assert exp.active_version == "v1.0.0"
    assert len(exp.versions) == 1
    assert exp.status == "ACTIVE"

    # 2. Add New Version
    upgraded = experiments_store.add_version(
        experiment_id=exp.id,
        version="v1.1.0",
        parameters={"window": 25},
        changelog="Expanded breakout channel window to 25 bars"
    )
    assert upgraded.active_version == "v1.1.0"
    assert len(upgraded.versions) == 2

    # 3. Update Status
    paused = experiments_store.update_status(exp.id, "PAUSED")
    assert paused.status == "PAUSED"

    # 4. Drift Monitoring Update
    monitored = experiments_store.update_drift_monitoring(
        experiment_id=exp.id,
        realized_return_pct=5.2,
        realized_sharpe=1.75,
        realized_dd_pct=3.0,
        trades_count=12,
        win_rate_pct=58.3
    )
    assert monitored.realized_return_pct == 5.2
    assert monitored.total_trades == 12
    assert monitored.drift.drift_status in ["HEALTHY", "MODERATE_DRIFT", "SEVERE_DECAY"]

def test_api_endpoints_advanced_analytics():
    # 1. /api/v1/quant/documents/analyze
    doc_resp = client.post("/api/v1/quant/documents/analyze", json={"symbol": "RELIANCE"})
    assert doc_resp.status_code == 200
    doc_data = doc_resp.json()
    assert doc_data["symbol"] == "RELIANCE"
    assert len(doc_data["snippets"]) > 0

    # 2. /api/v1/quant/portfolio/attribution
    attr_resp = client.post("/api/v1/quant/portfolio/attribution", json={
        "holdings": [{"symbol": "RELIANCE", "value": 500000}, {"symbol": "TCS", "value": 500000}],
        "benchmark": "NIFTY50"
    })
    assert attr_resp.status_code == 200
    attr_data = attr_resp.json()
    assert "attribution_summary" in attr_data

    # 3. /api/v1/quant/portfolio/risk-decomposition
    risk_resp = client.post("/api/v1/quant/portfolio/risk-decomposition", json={
        "holdings": [{"symbol": "RELIANCE", "value": 500000}, {"symbol": "TCS", "value": 500000}],
        "confidence_level": 0.95
    })
    assert risk_resp.status_code == 200
    risk_data = risk_resp.json()
    assert risk_data["verification"]["euler_additivity_verified"] is True

    # 4. /api/v1/quant/reports/reproducibility-package (JSON)
    rep_resp = client.post("/api/v1/quant/reports/reproducibility-package", json={
        "strategy_name": "EMA_CROSSOVER",
        "symbol": "RELIANCE",
        "bars": 100,
        "format": "json"
    })
    assert rep_resp.status_code == 200
    assert "provenance_hash" in rep_resp.json()

    # 5. /api/v1/quant/reports/reproducibility-package (PDF)
    pdf_resp = client.post("/api/v1/quant/reports/reproducibility-package", json={
        "strategy_name": "EMA_CROSSOVER",
        "symbol": "RELIANCE",
        "bars": 100,
        "format": "pdf"
    })
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000

    # 6. /api/v1/quant/experiments
    exp_list_resp = client.get("/api/v1/quant/experiments")
    assert exp_list_resp.status_code == 200
    assert len(exp_list_resp.json()) >= 1
