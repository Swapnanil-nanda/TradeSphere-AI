import pytest
from agents.news_intelligence import NewsIntelligenceAgent

def test_vader_sentiment_scoring():
    agent = NewsIntelligenceAgent()
    
    pos_score = agent.calculate_vader_sentiment("Company reports surge in quarterly profit and strong growth")
    assert pos_score > 0.3
    
    neg_score = agent.calculate_vader_sentiment("Company faces steep decline and investigation into financial loss")
    assert neg_score < -0.3
    
    negated_score = agent.calculate_vader_sentiment("The company did not miss quarterly revenue targets")
    assert negated_score >= 0.0

def test_news_intelligence_invariants():
    agent = NewsIntelligenceAgent()
    res = agent.analyze_symbol_news(symbol="RELIANCE")

    assert res.symbol == "RELIANCE"
    assert res.headline_count > 0
    assert len(res.headlines) == res.headline_count
    # CRITICAL INVARIANT: signal_guaranteed must always be False
    assert res.signal_guaranteed is False
    assert res.metadata.is_simulated is True
    assert "NOT a standalone predictive trading signal" in res.metadata.limitations[2]
