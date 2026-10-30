"""
TradeSphere AI - Base Quantitative Research Agent
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import datetime
from core.models import ResearchMetadata, ReproducibilityMetadata
from config import config

class BaseQuantAgent(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    def build_metadata(
        self,
        data_source: str,
        data_timestamp: str,
        limitations: List[str],
        parameters: Dict[str, Any],
        random_seed: Optional[int] = None,
        algorithm_sig: Optional[str] = None
    ) -> ResearchMetadata:
        return ResearchMetadata(
            methodology_version=config.methodology_version,
            data_source=data_source,
            data_timestamp=data_timestamp,
            limitations=limitations,
            reproducibility=ReproducibilityMetadata(
                random_seed=random_seed,
                execution_timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                algorithm_signature=algorithm_sig or f"{self.name} v{config.version}",
                parameters=parameters
            ),
            is_simulated=True,
            disclaimer="QUANTITATIVE RESEARCH ONLY – NOT FINANCIAL ADVICE. NO PREDICTIONS ARE GUARANTEED."
        )

    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        pass
