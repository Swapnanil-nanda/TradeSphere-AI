"""
TradeSphere AI - Quantitative Investment Research Engine Configuration
"""
import os
from pydantic import BaseModel

class QuantEngineConfig(BaseModel):
    service_name: str = "TradeSphere Quantitative Engine"
    version: str = "1.0.0"
    methodology_version: str = "2026.Q4-Institutional"
    host: str = os.getenv("QUANT_HOST", "0.0.0.0")
    port: int = int(os.getenv("QUANT_PORT", "8100"))
    spring_boot_url: str = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
    market_feed_url: str = os.getenv("MARKET_FEED_URL", "http://localhost:8000")
    default_risk_free_rate_in: float = 0.0675  # RBI 91-day T-Bill equivalent ~6.75%
    default_risk_free_rate_us: float = 0.0435  # US 3-Month Treasury equivalent ~4.35%
    enable_pdf_export: bool = True
    storage_dir: str = os.getenv("QUANT_STORAGE_DIR", "data/research_runs")

config = QuantEngineConfig()
