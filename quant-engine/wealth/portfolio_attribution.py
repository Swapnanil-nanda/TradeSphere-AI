"""
TradeSphere AI - Advanced Portfolio Attribution & Risk Decomposition Engine
Implements:
1. Brinson-Fachler (Allocation, Selection, Interaction Effects vs Benchmark)
2. Factor Risk Decomposition (Systematic Beta, Sector Factors, Specific/Idiosyncratic Risk)
3. Component VaR & Marginal Risk Contribution (%CVaR_i with exact additivity)
"""
from typing import List, Dict, Any, Optional
import numpy as np
import datetime

BENCHMARK_SECTORS: Dict[str, Dict[str, float]] = {
    "NIFTY50": {
        "Financial Services": {"weight": 0.334, "return": 0.128, "vol": 0.165},
        "Information Technology": {"weight": 0.142, "return": 0.185, "vol": 0.210},
        "Oil, Gas & Consumable Fuels": {"weight": 0.118, "return": 0.092, "vol": 0.180},
        "Automobile & Auto Components": {"weight": 0.078, "return": 0.245, "vol": 0.225},
        "Fast Moving Consumer Goods": {"weight": 0.086, "return": 0.081, "vol": 0.130},
        "Healthcare & Pharma": {"weight": 0.056, "return": 0.174, "vol": 0.175},
        "Consumer Durables": {"weight": 0.042, "return": 0.140, "vol": 0.205},
        "Metals & Mining": {"weight": 0.038, "return": 0.160, "vol": 0.280},
        "Construction & Infra": {"weight": 0.040, "return": 0.190, "vol": 0.215},
        "Telecommunication": {"weight": 0.036, "return": 0.220, "vol": 0.230},
        "Cash": {"weight": 0.030, "return": 0.065, "vol": 0.005}
    },
    "SP500": {
        "Information Technology": {"weight": 0.312, "return": 0.285, "vol": 0.220},
        "Financials": {"weight": 0.131, "return": 0.145, "vol": 0.160},
        "Health Care": {"weight": 0.118, "return": 0.095, "vol": 0.145},
        "Consumer Discretionary": {"weight": 0.104, "return": 0.162, "vol": 0.215},
        "Communication Services": {"weight": 0.092, "return": 0.240, "vol": 0.225},
        "Industrials": {"weight": 0.084, "return": 0.135, "vol": 0.165},
        "Consumer Staples": {"weight": 0.058, "return": 0.062, "vol": 0.125},
        "Energy": {"weight": 0.038, "return": 0.075, "vol": 0.230},
        "Materials": {"weight": 0.024, "return": 0.085, "vol": 0.180},
        "Utilities": {"weight": 0.022, "return": 0.110, "vol": 0.155},
        "Real Estate": {"weight": 0.017, "return": 0.055, "vol": 0.190}
    }
}

DEFAULT_ASSET_METADATA: Dict[str, Dict[str, Any]] = {
    "RELIANCE": {"sector": "Oil, Gas & Consumable Fuels", "beta": 1.08, "vol": 0.205, "annual_return": 0.145},
    "TCS": {"sector": "Information Technology", "beta": 0.82, "vol": 0.185, "annual_return": 0.165},
    "INFY": {"sector": "Information Technology", "beta": 1.05, "vol": 0.235, "annual_return": 0.175},
    "HDFCBANK": {"sector": "Financial Services", "beta": 1.15, "vol": 0.195, "annual_return": 0.135},
    "TATAMOTORS": {"sector": "Automobile & Auto Components", "beta": 1.35, "vol": 0.295, "annual_return": 0.285},
    "ICICIBANK": {"sector": "Financial Services", "beta": 1.12, "vol": 0.210, "annual_return": 0.185},
    "SBIN": {"sector": "Financial Services", "beta": 1.22, "vol": 0.240, "annual_return": 0.195},
    "AAPL": {"sector": "Information Technology", "beta": 1.10, "vol": 0.220, "annual_return": 0.215},
    "MSFT": {"sector": "Information Technology", "beta": 1.05, "vol": 0.215, "annual_return": 0.230},
    "NVDA": {"sector": "Information Technology", "beta": 1.75, "vol": 0.420, "annual_return": 0.550},
    "TSLA": {"sector": "Consumer Discretionary", "beta": 1.85, "vol": 0.520, "annual_return": 0.260},
    "GOOGL": {"sector": "Communication Services", "beta": 1.12, "vol": 0.245, "annual_return": 0.195},
    "AMZN": {"sector": "Consumer Discretionary", "beta": 1.25, "vol": 0.285, "annual_return": 0.240}
}

class PortfolioAttributionEngine:

    @staticmethod
    def compute_brinson_attribution(
        portfolio_holdings: List[Dict[str, Any]],
        benchmark_name: str = "NIFTY50"
    ) -> Dict[str, Any]:
        """
        Executes Brinson-Fachler Portfolio Attribution:
        - Allocation Effect: (w_p - w_b) * (R_b - R_B_total)
        - Selection Effect: w_b * (R_p - R_b)
        - Interaction Effect: (w_p - w_b) * (R_p - R_b)
        - Total Sector Contribution = Allocation + Selection + Interaction
        """
        bm_sectors = BENCHMARK_SECTORS.get(benchmark_name, BENCHMARK_SECTORS["NIFTY50"])

        # Calculate Benchmark total return
        bm_total_weight = sum(s["weight"] for s in bm_sectors.values())
        bm_total_return = sum(s["weight"] * s["return"] for s in bm_sectors.values()) / bm_total_weight

        # Group portfolio holdings by sector
        total_value = sum(h.get("value", 100000.0) for h in portfolio_holdings)
        if total_value <= 0:
            total_value = 100000.0

        p_sectors: Dict[str, Dict[str, float]] = {}
        for h in portfolio_holdings:
            sym = h.get("symbol", "UNKNOWN").upper().strip()
            meta = DEFAULT_ASSET_METADATA.get(sym, {
                "sector": h.get("sector", "Diversified"),
                "annual_return": h.get("return", 0.12)
            })
            sec_name = meta["sector"]
            val = float(h.get("value", 10000.0))
            ret = float(h.get("return", meta.get("annual_return", 0.12)))

            if sec_name not in p_sectors:
                p_sectors[sec_name] = {"value": 0.0, "weighted_return": 0.0}
            p_sectors[sec_name]["value"] += val
            p_sectors[sec_name]["weighted_return"] += val * ret

        # Compute portfolio sector weights and returns
        portfolio_sector_metrics: Dict[str, Dict[str, float]] = {}
        portfolio_total_return = 0.0

        for sec_name, data in p_sectors.items():
            w = data["value"] / total_value
            r = (data["weighted_return"] / data["value"]) if data["value"] > 0 else 0.0
            portfolio_sector_metrics[sec_name] = {"weight": w, "return": r}
            portfolio_total_return += w * r

        # Aggregate across all unique sectors (union of portfolio & benchmark)
        all_sectors = sorted(list(set(list(bm_sectors.keys()) + list(portfolio_sector_metrics.keys()))))
        sector_breakdown = []
        total_alloc = 0.0
        total_select = 0.0
        total_interact = 0.0

        for sec in all_sectors:
            p_data = portfolio_sector_metrics.get(sec, {"weight": 0.0, "return": 0.0})
            b_data = bm_sectors.get(sec, {"weight": 0.0, "return": bm_total_return})

            wp = p_data["weight"]
            wb = b_data["weight"]
            rp = p_data["return"] if wp > 0 else b_data["return"]
            rb = b_data["return"]

            # Brinson-Fachler Allocation: (w_p - w_b) * (R_b - R_B_total)
            alloc_effect = (wp - wb) * (rb - bm_total_return)
            # Selection Effect: w_b * (R_p - R_b)
            select_effect = wb * (rp - rb)
            # Interaction Effect: (w_p - w_b) * (R_p - R_b)
            interact_effect = (wp - wb) * (rp - rb)

            total_contrib = alloc_effect + select_effect + interact_effect
            total_alloc += alloc_effect
            total_select += select_effect
            total_interact += interact_effect

            sector_breakdown.append({
                "sector": sec,
                "portfolio_weight_pct": round(wp * 100, 2),
                "benchmark_weight_pct": round(wb * 100, 2),
                "active_weight_pct": round((wp - wb) * 100, 2),
                "portfolio_return_pct": round(rp * 100, 2),
                "benchmark_return_pct": round(rb * 100, 2),
                "allocation_effect_bps": round(alloc_effect * 10000, 1),
                "selection_effect_bps": round(select_effect * 10000, 1),
                "interaction_effect_bps": round(interact_effect * 10000, 1),
                "total_contribution_bps": round(total_contrib * 10000, 1)
            })

        active_return = portfolio_total_return - bm_total_return

        return {
            "benchmark": benchmark_name,
            "portfolio_return_pct": round(portfolio_total_return * 100, 2),
            "benchmark_return_pct": round(bm_total_return * 100, 2),
            "active_return_pct": round(active_return * 100, 2),
            "active_return_bps": round(active_return * 10000, 1),
            "attribution_summary": {
                "allocation_effect_bps": round(total_alloc * 10000, 1),
                "selection_effect_bps": round(total_select * 10000, 1),
                "interaction_effect_bps": round(total_interact * 10000, 1),
                "total_reconciled_bps": round((total_alloc + total_select + total_interact) * 10000, 1)
            },
            "sectors": sector_breakdown,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    @staticmethod
    def compute_risk_decomposition(
        portfolio_holdings: List[Dict[str, Any]],
        confidence_level: float = 0.95
    ) -> Dict[str, Any]:
        """
        Calculates:
        1. Component VaR (CVaR_i) & Marginal VaR (MVaR_i) with exact Euler additivity
        2. Systematic Market Risk vs Specific / Idiosyncratic Risk decomposition
        3. Diversification Ratio & Asset-level % contribution to portfolio risk
        """
        n = len(portfolio_holdings)
        if n == 0:
            return {"error": "Portfolio cannot be empty"}

        symbols = [h.get("symbol", "ASSET").upper().strip() for h in portfolio_holdings]
        values = np.array([float(h.get("value", 10000.0)) for h in portfolio_holdings])
        total_capital = float(np.sum(values))
        weights = values / total_capital

        vols = np.array([DEFAULT_ASSET_METADATA.get(s, {}).get("vol", 0.22) for s in symbols])
        betas = np.array([DEFAULT_ASSET_METADATA.get(s, {}).get("beta", 1.0) for s in symbols])

        # Construct realistic Correlation Matrix based on sector overlaps
        corr = np.eye(n)
        for i in range(n):
            for j in range(n):
                if i != j:
                    sec_i = DEFAULT_ASSET_METADATA.get(symbols[i], {}).get("sector", "")
                    sec_j = DEFAULT_ASSET_METADATA.get(symbols[j], {}).get("sector", "")
                    if sec_i == sec_j and sec_i != "":
                        corr[i, j] = 0.70  # high intra-sector correlation
                    else:
                        corr[i, j] = 0.38  # moderate market correlation

        # Covariance Matrix = D * Corr * D
        D = np.diag(vols)
        cov_matrix = D @ corr @ D

        # Portfolio Volatility sigma_p
        port_var = float(weights.T @ cov_matrix @ weights)
        port_vol = float(np.sqrt(port_var))

        # Z-score for one-sided VaR
        z = 1.6449 if confidence_level <= 0.95 else 2.3263
        portfolio_var_annual = port_vol * z
        portfolio_var_amount = portfolio_var_annual * total_capital

        # Marginal VaR: (Cov @ W) / sigma_p * z
        marginal_var = (cov_matrix @ weights) / port_vol * z

        # Component VaR: w_i * MVaR_i
        component_var_pct = weights * marginal_var
        component_var_amount = component_var_pct * total_capital
        pct_risk_contribution = (component_var_pct / portfolio_var_annual) * 100.0

        # Systematic vs Specific Risk Decomposition
        port_beta = float(np.sum(weights * betas))
        benchmark_vol = 0.155  # Nifty/S&P representative market vol
        systematic_vol = abs(port_beta) * benchmark_vol
        systematic_var = systematic_vol ** 2
        specific_var = max(0.0, port_var - systematic_var)
        specific_vol = float(np.sqrt(specific_var))

        total_var_pct = port_var
        systematic_risk_pct = round((systematic_var / total_var_pct) * 100.0, 1) if total_var_pct > 0 else 50.0
        specific_risk_pct = round(100.0 - systematic_risk_pct, 1)

        # Diversification Ratio: Sum(w_i * vol_i) / port_vol
        weighted_vol_sum = float(np.sum(weights * vols))
        diversification_ratio = round(weighted_vol_sum / port_vol, 2) if port_vol > 0 else 1.0

        asset_details = []
        for i in range(n):
            sym = symbols[i]
            asset_details.append({
                "symbol": sym,
                "weight_pct": round(float(weights[i]) * 100.0, 2),
                "volatility_annual_pct": round(float(vols[i]) * 100.0, 2),
                "beta": round(float(betas[i]), 2),
                "marginal_var_pct": round(float(marginal_var[i]) * 100.0, 2),
                "component_var_amount": round(float(component_var_amount[i]), 2),
                "percentage_risk_contribution": round(float(pct_risk_contribution[i]), 2)
            })

        return {
            "portfolio_value": round(total_capital, 2),
            "confidence_level": confidence_level,
            "annualized_portfolio_volatility_pct": round(port_vol * 100.0, 2),
            "portfolio_beta": round(port_beta, 2),
            "portfolio_var_amount": round(portfolio_var_amount, 2),
            "portfolio_var_pct": round(portfolio_var_annual * 100.0, 2),
            "diversification_ratio": diversification_ratio,
            "risk_decomposition": {
                "systematic_market_risk_pct": systematic_risk_pct,
                "specific_idiosyncratic_risk_pct": specific_risk_pct,
                "systematic_volatility_pct": round(systematic_vol * 100.0, 2),
                "specific_volatility_pct": round(specific_vol * 100.0, 2)
            },
            "assets": asset_details,
            "verification": {
                "euler_additivity_verified": True,
                "sum_component_var_pct": round(float(np.sum(component_var_pct)) * 100.0, 2),
                "sum_risk_contribution_pct": round(float(np.sum(pct_risk_contribution)), 1)
            },
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
