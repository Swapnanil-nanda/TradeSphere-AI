"""
TradeSphere AI - Research Run and Artifact Repository
Manages in-memory and persistent storage of structured research outputs.
"""
from typing import Dict, Optional, List, Any
import json
import os
from .models import ResearchRun, OptimizationResult

class ResearchStore:
    def __init__(self, storage_dir: str = "data/research_runs"):
        self.storage_dir = storage_dir
        self._runs: Dict[str, ResearchRun] = {}
        self._optimizations: Dict[str, OptimizationResult] = {}
        self._reports: Dict[str, Dict[str, Any]] = {}
        
        try:
            os.makedirs(self.storage_dir, exist_ok=True)
        except Exception:
            pass

    def save_run(self, run: ResearchRun) -> None:
        self._runs[run.id] = run
        try:
            path = os.path.join(self.storage_dir, f"run_{run.id}.json")
            with open(path, "w", encoding="utf-8") as f:
                f.write(run.model_dump_json(indent=2))
        except Exception:
            pass

    def get_run(self, run_id: str) -> Optional[ResearchRun]:
        if run_id in self._runs:
            return self._runs[run_id]
        
        # Check disk
        try:
            path = os.path.join(self.storage_dir, f"run_{run_id}.json")
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    run = ResearchRun.model_validate(data)
                    self._runs[run_id] = run
                    return run
        except Exception:
            pass
        return None

    def list_runs(self, limit: int = 50) -> List[ResearchRun]:
        return list(self._runs.values())[-limit:]

    def save_optimization(self, opt: OptimizationResult) -> None:
        self._optimizations[opt.id] = opt

    def get_optimization(self, opt_id: str) -> Optional[OptimizationResult]:
        return self._optimizations.get(opt_id)

    def save_report(self, report_id: str, data: Dict[str, Any]) -> None:
        self._reports[report_id] = data

    def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        return self._reports.get(report_id)

# Singleton global instance
research_store = ResearchStore()
