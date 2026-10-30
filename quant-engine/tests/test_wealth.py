import pytest
from wealth.sip_calculator import SIPCalculator
from wealth.scenarios import ScenarioModeler
from wealth.mutual_funds import MutualFundService

def test_sip_calculator_regular_and_step_up():
    # Regular SIP
    res_regular = SIPCalculator.calculate_sip(
        monthly_investment=10000.0,
        annual_step_up_pct=0.0,
        expected_return_cagr=12.0,
        investment_horizon_years=10
    )
    assert res_regular.total_invested == 10000.0 * 120  # 1,200,000
    assert res_regular.estimated_future_value > res_regular.total_invested
    assert round(res_regular.wealth_gain, 2) == round(res_regular.estimated_future_value - res_regular.total_invested, 2)
    assert len(res_regular.yearly_schedule) == 10

    # Step-up SIP (10% step up)
    res_step_up = SIPCalculator.calculate_sip(
        monthly_investment=10000.0,
        annual_step_up_pct=10.0,
        expected_return_cagr=12.0,
        investment_horizon_years=10
    )
    assert res_step_up.total_invested > res_regular.total_invested
    assert res_step_up.estimated_future_value > res_regular.estimated_future_value

def test_goal_scenario_modeler():
    res = ScenarioModeler.evaluate_goal_scenario(
        goal_name="Child Higher Education",
        target_amount=5000000.0,
        horizon_years=10,
        inflation_rate_pct=6.0,
        expected_return_cagr=12.0,
        seed=42
    )

    expected_adj = 5000000.0 * (1.06 ** 10)
    assert round(res.inflation_adjusted_target, 2) == round(expected_adj, 2)
    assert res.suggested_monthly_sip > 0
    assert 0.0 <= res.shortfall_probability <= 1.0
    assert "equity_large_flexi" in res.recommended_asset_allocation

def test_mutual_funds_database():
    funds = MutualFundService.list_funds()
    assert len(funds) >= 5

    # Filter by category
    large_caps = MutualFundService.list_funds(category="Large Cap")
    assert len(large_caps) >= 2

    # Query search
    parag = MutualFundService.list_funds(query="Parag Parikh")
    assert len(parag) == 1
    assert parag[0].scheme_name.startswith("Parag Parikh")
    assert parag[0].expense_ratio > 0
    assert parag[0].sharpe_ratio > 0
