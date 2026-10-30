package com.tradesphere.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory sliding window rate-limiting filter.
 * Protects authentication endpoints (/api/auth/*) and trading endpoints (/api/orders/*)
 * against brute-force attacks and denial-of-service spam.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int AUTH_LIMIT_PER_MINUTE = 20;
    private static final int ORDER_LIMIT_PER_MINUTE = 80;

    private final Map<String, RequestCounter> authCounters = new ConcurrentHashMap<>();
    private final Map<String, RequestCounter> orderCounters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientIp = extractClientIp(request);

        if (path.startsWith("/api/auth/")) {
            if (isRateLimited(authCounters, clientIp, AUTH_LIMIT_PER_MINUTE)) {
                writeRateLimitError(response, "Too many authentication attempts. Please wait 60 seconds.");
                return;
            }
        } else if (path.startsWith("/api/orders") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (isRateLimited(orderCounters, clientIp, ORDER_LIMIT_PER_MINUTE)) {
                writeRateLimitError(response, "Trading rate limit exceeded. Please wait a moment before submitting further orders.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(Map<String, RequestCounter> counters, String key, int limit) {
        long now = System.currentTimeMillis();
        RequestCounter counter = counters.compute(key, (k, current) -> {
            if (current == null || (now - current.windowStart) > 60000) {
                return new RequestCounter(now, 1);
            }
            current.count++;
            return current;
        });
        return counter.count > limit;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void writeRateLimitError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");
        String json = String.format("{\"timestamp\":\"%s\",\"status\":429,\"error\":\"TOO_MANY_REQUESTS\",\"message\":\"%s\"}",
                java.time.Instant.now().toString(), message);
        response.getWriter().write(json);
    }

    private static class RequestCounter {
        final long windowStart;
        int count;

        RequestCounter(long windowStart, int count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
