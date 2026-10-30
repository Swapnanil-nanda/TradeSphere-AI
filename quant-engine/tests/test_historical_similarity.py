import pytest
from agents.historical_similarity import HistoricalSimilarityAgent

def test_historical_analogue_matching():
    agent = HistoricalSimilarityAgent()
    res = agent.find_analogues(symbol="RELIANCE", target_window_bars=20, history_bars=300, top_k=3)

    assert res.symbol == "RELIANCE"
    assert res.total_candidates_scanned > 0
    assert len(res.top_matches) == 3
    # Matches must be sorted by similarity score descending
    assert res.top_matches[0].similarity_score >= res.top_matches[1].similarity_score >= res.top_matches[2].similarity_score
    # Invariant: analogue certainty must be False
    assert res.analogue_certainty is False
    assert "5d" in res.forward_distribution
    assert "mean" in res.forward_distribution["5d"]
