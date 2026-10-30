import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoints():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "UP"
    assert res.json()["execution_mode"] == "RESEARCH_ONLY_NO_ORDER_AUTHORITY"

    res_api = client.get("/api/health")
    assert res_api.status_code == 200
    assert res_api.json()["status"] == "UP"

def test_create_and_get_research_run():
    # 1. POST /api/v1/quant/research-runs
    post_res = client.post("/api/v1/quant/research-runs", json={
        "query": "Analyze technical indicators, forecast, and sentiment for RELIANCE",
        "symbol": "RELIANCE",
        "requested_agents": ["MarketDataAgent", "TechnicalAnalysisAgent", "ForecastingAgent"]
    })
    assert post_res.status_code == 200
    run_data = post_res.json()
    assert "id" in run_data
    run_id = run_data["id"]

    # 2. GET /api/v1/quant/research-runs/{id}
    get_res = client.get(f"/api/v1/quant/research-runs/{run_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == run_id
    assert get_res.json()["evidence_verification"]["is_verified"] is True

def test_forecast_endpoint():
    res = client.post("/api/v1/quant/forecasts", json={
        "symbol": "RELIANCE",
        "history_bars": 200
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["horizons"]) == 3
    assert data["symbol"] == "RELIANCE"

def test_analogue_endpoint():
    res = client.post("/api/v1/quant/analogues", json={
        "symbol": "RELIANCE",
        "target_window_bars": 15,
        "history_bars": 300,
        "top_k": 3
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["top_matches"]) == 3
    assert data["analogue_certainty"] is False

def test_backtest_endpoint():
    res = client.post("/api/v1/quant/backtests", json={
        "strategy_name": "EMA_CROSSOVER",
        "symbol": "RELIANCE",
        "initial_capital": 1000000.0,
        "risk_per_trade_pct": 1.0,
        "bars": 150
    })
    assert res.status_code == 200
    data = res.json()
    assert data["strategy_name"] == "EMA_CROSSOVER"
    assert "sharpe_ratio" in data
    assert "max_drawdown_pct" in data

def test_optimization_and_frontier_endpoints():
    # 1. POST /api/v1/wealth/optimizations
    post_res = client.post("/api/v1/wealth/optimizations", json={
        "symbols": ["RELIANCE", "TCS", "INFY"],
        "frontier_points_count": 10
    })
    assert post_res.status_code == 200
    opt_data = post_res.json()
    opt_id = opt_data["id"]
    assert "max_sharpe_portfolio" in opt_data

    # 2. GET /api/v1/wealth/optimizations/{id}/frontier
    frontier_res = client.get(f"/api/v1/wealth/optimizations/{opt_id}/frontier")
    assert frontier_res.status_code == 200
    f_data = frontier_res.json()
    assert len(f_data["frontier_points"]) > 0

def test_sip_plans_endpoint():
    res = client.post("/api/v1/wealth/sip-plans", json={
        "monthly_investment": 15000.0,
        "annual_step_up_pct": 10.0,
        "expected_return_cagr": 13.0,
        "investment_horizon_years": 10
    })
    assert res.status_code == 200
    data = res.json()
    assert data["estimated_future_value"] > data["total_invested"]

def test_scenarios_endpoint():
    res = client.post("/api/v1/wealth/scenarios", json={
        "goal_name": "Home Purchase",
        "target_amount": 10000000.0,
        "horizon_years": 7,
        "inflation_rate_pct": 6.0,
        "expected_return_cagr": 12.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["suggested_monthly_sip"] > 0
    assert "fixed_income_debt" in data["recommended_asset_allocation"]

def test_mutual_funds_endpoint():
    res = client.get("/api/v1/wealth/mutual-funds?category=Flexi+Cap")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert "Parag Parikh" in data[0]["scheme_name"]

def test_reports_export_json_and_pdf():
    # Create run first
    post_res = client.post("/api/v1/quant/research-runs", json={
        "query": "Export testing run",
        "symbol": "RELIANCE",
        "requested_agents": ["MarketDataAgent", "TechnicalAnalysisAgent"]
    })
    run_id = post_res.json()["id"]

    # Export as JSON
    json_res = client.get(f"/api/v1/quant/reports/{run_id}?format=json")
    assert json_res.status_code == 200
    assert json_res.json()["id"] == run_id

    # Export as PDF
    pdf_res = client.get(f"/api/v1/quant/reports/{run_id}?format=pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-")
