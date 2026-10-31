# WATCHLIST_API.md — TradeSphere AI Watchlists API Specification

**Service:** Java 21 Spring Boot (`backend-spring/`, Port 8080)  
**Base Paths:** `/api/v1/watchlists` & `/api/watchlists` (Backward-compatible alias)  
**Security:** Stateless JWT Bearer Token (`Authorization: Bearer <token>`)  
**Data Integrity:** Multi-Tenant Isolation (`findByIdAndUserId`) & Non-Negotiable `SIMULATED` Labels

---

## 1. Authentication & Security Headers

All Watchlist endpoints require an active user session authenticated via JWT Bearer token:
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```
If the token is missing or expired, the API authoritatively returns `401 Unauthorized`. If a user attempts to access or mutate another user's watchlist, the API returns `404 Not Found` (IDOR / BOLA Prevention).

---

## 2. Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/watchlists` | List all custom and default watchlists for user | Yes |
| `POST` | `/api/v1/watchlists` | Create a new custom watchlist | Yes |
| `GET` | `/api/v1/watchlists/{id}` | Get details of a single watchlist | Yes |
| `PATCH` | `/api/v1/watchlists/{id}` | Rename an existing custom watchlist | Yes |
| `POST` | `/api/v1/watchlists/{id}/duplicate` | Duplicate an existing watchlist | Yes |
| `DELETE` | `/api/v1/watchlists/{id}` | Delete a custom watchlist (default protected) | Yes |
| `POST` | `/api/v1/watchlists/{id}/items` | Add an instrument symbol to a watchlist | Yes |
| `DELETE` | `/api/v1/watchlists/{id}/items/{itemId}` | Remove an instrument by symbol or item ID | Yes |
| `PATCH` | `/api/v1/watchlists/{id}/items/reorder` | Reorder constituent instruments | Yes |
| `GET` | `/api/v1/watchlists/{id}/quotes` | Get current microstructure quotes for all items | Yes |
| `GET` | `/api/v1/watchlists/alerts` | List all active price/volume/indicator alerts | Yes |
| `POST` | `/api/v1/watchlists/alerts` | Create a new rule-based alert | Yes |
| `DELETE` | `/api/v1/watchlists/alerts/{id}` | Delete an alert rule | Yes |

---

## 3. Detailed Endpoint Contracts

### 3.1 Get All Watchlists
`GET /api/v1/watchlists`

#### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "userId": 101,
    "name": "Core Market Watch",
    "defaultList": true,
    "createdAt": "2026-10-31T12:00:00Z",
    "instruments": [
      {
        "id": 1,
        "symbol": "RELIANCE",
        "name": "Reliance Industries Ltd",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "basePrice": 2985.40,
        "tickSize": 0.05,
        "lotSize": 1
      },
      {
        "id": 2,
        "symbol": "TCS",
        "name": "Tata Consultancy Services",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "basePrice": 4125.00,
        "tickSize": 0.05,
        "lotSize": 1
      }
    ]
  }
]
```

---

### 3.2 Create Watchlist
`POST /api/v1/watchlists`

#### Request Body
```json
{
  "name": "High Beta Momentum"
}
```

#### Response (`201 Created`)
```json
{
  "id": 4,
  "userId": 101,
  "name": "High Beta Momentum",
  "defaultList": false,
  "createdAt": "2026-10-31T17:45:00Z",
  "instruments": []
}
```

---

### 3.3 Rename Watchlist
`PATCH /api/v1/watchlists/{id}`

#### Request Body
```json
{
  "name": "Swing Trading Candidates"
}
```

#### Response (`200 OK`)
```json
{
  "id": 4,
  "userId": 101,
  "name": "Swing Trading Candidates",
  "defaultList": false,
  "createdAt": "2026-10-31T17:45:00Z",
  "instruments": []
}
```

---

### 3.4 Duplicate Watchlist
`POST /api/v1/watchlists/{id}/duplicate?targetName=Swing+Trading+Copy`

#### Response (`201 Created`)
```json
{
  "id": 5,
  "userId": 101,
  "name": "Swing Trading Copy",
  "defaultList": false,
  "createdAt": "2026-10-31T17:46:00Z",
  "instruments": [ ... ]
}
```

---

### 3.5 Reorder Items
`PATCH /api/v1/watchlists/{id}/items/reorder`

#### Request Body
```json
{
  "symbols": ["TCS", "RELIANCE", "HDFCBANK", "AAPL"]
}
```

#### Response (`200 OK`)
Returns the updated `WatchlistDto` with instruments ordered strictly according to the request.

---

### 3.6 Get Quotes for Watchlist
`GET /api/v1/watchlists/{id}/quotes`

#### Response (`200 OK`)
```json
[
  {
    "symbol": "RELIANCE",
    "name": "Reliance Industries Ltd",
    "exchange": "NSE",
    "market": "IN",
    "currency": "INR",
    "lastPrice": 2985.40,
    "change": 12.50,
    "changePct": 0.65,
    "volume": 1450000,
    "bid": 2985.35,
    "ask": 2985.45,
    "dayHigh": 3030.18,
    "dayLow": 2940.62,
    "dataSource": "TradeSphere Synthetic GBM Engine",
    "dataStatus": "SIMULATED",
    "timestamp": "2026-10-31T17:48:00Z",
    "simulated": true
  }
]
```

---

### 3.7 Create Alert
`POST /api/v1/watchlists/alerts`

#### Request Body
```json
{
  "symbol": "RELIANCE",
  "alertType": "PRICE_ABOVE",
  "targetValue": 3050.00,
  "notes": "Breakout of key 20-day high"
}
```

#### Response (`201 Created`)
```json
{
  "id": 12,
  "userId": 101,
  "symbol": "RELIANCE",
  "alertType": "PRICE_ABOVE",
  "targetValue": 3050.0000,
  "notes": "Breakout of key 20-day high",
  "active": true,
  "triggeredAt": null,
  "createdAt": "2026-10-31T17:49:00Z"
}
```

---

## 4. Error Responses

| HTTP Status | Error Code | Description | Example Payload |
| :---: | :--- | :--- | :--- |
| `400` | `VALIDATION_FAILED` | Invalid name or missing parameters | `{"error": "Watchlist name is required"}` |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT token | `{"error": "Full authentication is required"}` |
| `404` | `RESOURCE_NOT_FOUND` | Watchlist not found or belongs to another user | `{"error": "Watchlist not found with id: 99"}` |
| `409` | `CONFLICT` | Watchlist name already exists for this user | `{"error": "Watchlist already exists with name: Tech"}` |
