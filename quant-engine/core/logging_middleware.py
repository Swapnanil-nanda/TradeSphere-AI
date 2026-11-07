"""
TradeSphere AI - Structured Logging & Tracing Middleware for FastAPI
Emits structured JSON access logs with distributed trace IDs and latency metrics.
"""
import time
import uuid
import json
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("tradesphere.quant")

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        trace_id = request.headers.get("X-Trace-Id") or str(uuid.uuid4()).replace("-", "")[:16]
        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Trace-Id"] = trace_id

        if not request.url.path.startswith("/docs") and not request.url.path.startswith("/openapi"):
            log_entry = {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "service": "tradesphere-quant-engine",
                "trace_id": trace_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms
            }
            logger.info(json.dumps(log_entry))

        return response
