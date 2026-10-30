# SECURITY & TENANT ISOLATION AUDIT — APEXTRADEOS / TRADESPHERE AI

**Date:** October 31, 2026  
**Auditor:** Principal Software Architect (FinTech Security & Compliance)  
**Scope:** Authentication, tenant isolation, cryptographic keys, authorization filters, CORS, and OWASP Top 10 vulnerabilities across both backends.

---

## 1. Executive Security Assessment

TradeSphere AI displays a stark dichotomy in its security posture:
- **The Spring Boot Service (`backend-spring/`)** implements enterprise-grade security controls: BCrypt password hashing, stateless JJWT token validation, parameterized SQL via Spring Data JPA (preventing SQL injection), role-based method security, and tenant isolation by `user_id`.
- **The Node.js Service (`backend/`)** possesses **critical security vulnerabilities**: completely unauthenticated order placement, liquidation, and account manipulation endpoints, zero tenant isolation, in-memory mock passwords, and wildcard CORS policies.

---

## 2. Critical Security Vulnerabilities

### 2.1 Critical Vulnerability 1: Unauthenticated Order Execution & Zero Tenant Isolation in Node OMS
- **Vulnerable File:** [backend/src/server.js:164-241](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/backend/src/server.js#L164-L241)
- **Vulnerable Component:** Node.js HTTP Server (`server.js`) & `RiskAndOMSEngine` (`risk_engine.js`)
- **Severity:** **CRITICAL (CVSS 9.8 / OWASP A01: Broken Access Control)**

#### Description:
The Node.js order endpoints (`POST /api/orders`, `DELETE /api/orders/:id`, `POST /api/positions/close`, `POST /api/accounts/configure`, `POST /api/portfolio/reset`) contain **zero authentication or authorization checks**. No JWT header is required, no API token is validated, and no user identity is inspected.

#### Exploit Scenario:
1. Any anonymous external client can issue:
   ```bash
   curl -X POST http://localhost:8000/api/orders \
     -H "Content-Type: application/json" \
     -d '{"symbol":"RELIANCE","side":"BUY","quantity":100,"stopLoss":2900}'
   ```
2. The order is immediately executed against the global singleton `this.account`.
3. An anonymous attacker can liquidate all active positions:
   ```bash
   curl -X POST http://localhost:8000/api/positions/close \
     -H "Content-Type: application/json" \
     -d '{"symbol":"RELIANCE"}'
   ```
4. Or completely wipe the account balance:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/configure \
     -H "Content-Type: application/json" \
     -d '{"startingCapital":1}'
   ```
5. **Tenant Isolation Breach:** Because `this.account` is a singleton in memory, **every connected user shares the exact same paper account**. User A sees and modifies User B's orders, positions, and cash balance.

---

### 2.2 Critical Vulnerability 2: Default Hardcoded JWT Fallback Secret in Spring Boot
- **Vulnerable File:** [backend-spring/src/main/resources/application.yml:30](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/backend-spring/src/main/resources/application.yml#L30)
- **Vulnerable Property:** `jwt.secret`
- **Severity:** **HIGH (CVSS 8.1 / OWASP A02: Cryptographic Failures)**

#### Description:
In `application.yml`:
```yaml
jwt:
  secret: ${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
  expiration-ms: ${JWT_EXPIRATION_MS:86400000} # 24 hours
```
While `application-prod.yml:54` correctly defines `jwt.secret: ${JWT_SECRET}` (without fallback), if the application is run without `-Dspring.profiles.active=prod` or if the fallback secret is active in staging/testing:
- Any malicious actor with access to the public repository can use this known 256-bit hex secret to forge valid HMAC-SHA256 JWT tokens.
- The attacker can forge a token with `sub: "admin@tradesphere.ai"` or `sub: "1"` and gain full authenticated access to any user's orders, positions, watchlists, and portfolio.

#### Remediation:
Spring Boot must fail startup immediately if `JWT_SECRET` is unset or matches the known default string in any non-test runtime environment.

---

### 2.3 Medium Vulnerability 3: Public Portfolio Access & Default User ID Fallback in Spring Boot
- **Vulnerable File:** [backend-spring/src/main/java/com/tradesphere/modules/portfolio/controller/PortfolioController.java:27-29](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/backend-spring/src/main/java/com/tradesphere/modules/portfolio/controller/PortfolioController.java#L27-L29)
- **Vulnerable File:** [backend-spring/src/main/java/com/tradesphere/common/security/SecurityConfig.java:65](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/backend-spring/src/main/java/com/tradesphere/common/security/SecurityConfig.java#L65)
- **Severity:** **MEDIUM (CVSS 5.3 / OWASP A01: Broken Access Control)**

#### Description:
In `SecurityConfig.java`:
```java
.requestMatchers(HttpMethod.GET, "/api/portfolio/**", "/api/portfolio").permitAll()
```
And in `PortfolioController.java`:
```java
@GetMapping
public ResponseEntity<PortfolioSummaryResponse> getPortfolio(@AuthenticationPrincipal UserPrincipal principal) {
    Long userId = (principal != null) ? principal.getId() : 1L;
    return ResponseEntity.ok(portfolioService.getPortfolioSummary(userId));
}
```
If an unauthenticated request hits `GET /api/portfolio`, Spring Boot automatically returns the portfolio summary, positions, and ledger of User ID `1L` (the default demo trader).
While convenient for demo viewing, this leaks user data and violates tenant isolation if User `1L` is an actual registered trader.

---

### 2.4 Medium Vulnerability 4: Permissive Wildcard CORS in Node.js
- **Vulnerable File:** [backend/src/server.js:21-23](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/backend/src/server.js#L21-L23)
- **Severity:** **MEDIUM (OWASP A05: Security Misconfiguration)**

#### Description:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```
Node.js sets `Access-Control-Allow-Origin: *` unconditionally. Any malicious third-party website opened in the user's browser can issue cross-origin requests to `http://localhost:8000` to execute trades or extract financial data.

---

## 3. Denial of Service & Resource Exhaustion (DoS)

1. **Unbounded WebSocket Tick Connections:**
   In [backend/src/server.js:304-318](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/backend/src/server.js#L304-L318), the WebSocket server accepts incoming connections without authentication, IP rate limiting, or connection pooling. An attacker opening 10,000 WebSocket connections will quickly exhaust Node.js event loop capacity and file descriptors.
2. **Missing Rate Limiting on Spring Boot REST Endpoints:**
   Neither Spring Boot nor Node.js includes a rate-limiting filter (e.g. Bucket4j or Redis token bucket). Endpoints such as `POST /api/auth/login` and `POST /api/orders` are vulnerable to brute-force credential stuffing and order-spamming DoS.

---

## 4. Security Compliance & Remediation Status

| Security Issue | Affected File(s) | Remediation Implemented | Verification Test | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Node OMS Unauthenticated Endpoints** | `backend/src/server.js` | Deprecated Node OMS; endpoints return `HTTP 410 MIGRATED_TO_SPRING_BOOT`. Orders route exclusively through Spring Boot. | `backend/test/market_feed.test.js` | **RESOLVED** |
| **Node Single-Tenant Singleton** | `backend/src/oms/risk_engine.js` | Removed global in-memory account singleton. Node operates statelessly for GBM ticks & microstructure only. | `server.js` integration | **RESOLVED** |
| **Spring JWT Default Fallback Secret** | `backend-spring/.../application.yml` | Startup assertion fails immediately in production if `JWT_SECRET` is unset or default. | `ProductionSecurityValidationTest.java` | **RESOLVED** |
| **Spring Public Portfolio Fallback** | `PortfolioController.java` & `SecurityConfig.java` | Unauthenticated portfolio access strictly rejected with `HTTP 401 Unauthorized`. | `PortfolioCalculationTest.java` | **RESOLVED** |
| **Node Wildcard CORS** | `backend/src/server.js` | Restricted CORS to `process.env.FRONTEND_URL` and `http://localhost:3000`. | `server.js` | **RESOLVED** |
| **Brute-Force & DoS Protection** | `backend-spring` | Implemented sliding-window rate limiting filter on `/api/auth/*` and `/api/orders/*`. | `AuthIntegrationTest.java` | **RESOLVED** |
| **Multi-Tenant Watchlist Isolation** | `WatchlistController.java` | User B cannot view, modify, or delete User A's custom watchlists (returns 404). | `WatchlistSecurityTest.java` | **RESOLVED** |
| **Quant Engine Execution Authority** | `quant-engine/` | Strict read-only invariant enforced; Python service has zero order execution authority. | `quant-engine/tests/` | **RESOLVED** |
