import http from 'http';
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import { MarketSimulator, INSTRUMENTS } from './market_data/simulator.js';
import { generateOptionsChain } from './quant/options_greeks.js';
import { generateVolatilitySurface } from './quant/volatility_surface.js';
import { runBacktest } from './quant/backtester.js';
import { getCoachGuidance } from './coach/ai_coach.js';
import { logger } from './logger.js';

const PORT = process.env.PORT || 8000;
let requestCounter = 0;

// Initialize Market Simulation Engine Only
// (Authoritative Accounts, Orders, Auth, and Ledgers are owned exclusively by Spring Boot on port 8080)
const simulator = new MarketSimulator();
simulator.start(120); // 120ms tick frequency for ultra-responsive streaming

// Create HTTP Server
const server = http.createServer((req, res) => {
  // CORS Configuration
  const allowedOrigin = process.env.FRONTEND_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname, query } = parse(req.url, true);

  // Helper to parse JSON body
  function getJsonBody(cb) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        cb(null, parsed);
      } catch (err) {
        cb(err, null);
      }
    });
  }

  requestCounter++;
  const traceId = req.headers['x-trace-id'] || null;

  // 1. Health Check (Market Feed Engine only)
  if (req.method === 'GET' && (pathname === '/api/health' || pathname === '/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      service: 'TradeSphere AI Market Simulation & Feed Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      role: 'MARKET_SIMULATION_ONLY',
      simulator: '24/7 GBM active',
      disclaimer: 'SIMULATED MARKET DATA – NOT REAL FINANCIAL ADVICE'
    }));
    return;
  }

  // 1b. Metrics & Diagnostics
  if (req.method === 'GET' && (pathname === '/metrics' || pathname === '/api/metrics')) {
    const mem = process.memoryUsage();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'tradesphere-microstructure',
      uptime_seconds: Math.floor(process.uptime()),
      total_requests: requestCounter,
      active_ws_clients: wss ? wss.clients.size : 0,
      active_instruments: INSTRUMENTS.length,
      memory: {
        rss_bytes: mem.rss,
        heap_used_bytes: mem.heapUsed,
        heap_total_bytes: mem.heapTotal
      },
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 2. Disabled/Migrated Endpoints (Guarding against duplicate state manipulation)
  const isMigratedPath =
    pathname.startsWith('/api/auth') ||
    pathname === '/api/portfolio' ||
    pathname === '/api/portfolio/reset' ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/accounts') ||
    pathname === '/api/ledger' ||
    pathname.startsWith('/api/positions');

  if (isMigratedPath) {
    res.writeHead(410, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'MIGRATED_TO_SPRING_BOOT',
      message: 'This endpoint is authoritative in the Spring Boot backend (port 8080). Node.js exclusively serves market simulation and WebSocket feeds.',
      canonicalBackend: 'Spring Boot (port 8080)',
      documentation: '/docs/ARCHITECTURE.md'
    }));
    return;
  }

  // 3. GET /api/instruments & /api/tickers (Synthetic Market Quotes)
  if (req.method === 'GET' && (pathname === '/api/instruments' || pathname === '/api/tickers')) {
    const tickers = simulator.getAllTickers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (pathname === '/api/tickers') {
      res.end(JSON.stringify(tickers));
    } else {
      res.end(JSON.stringify({ instruments: INSTRUMENTS, tickers }));
    }
    return;
  }

  // 4. GET /api/candles?symbol=RELIANCE&timeframe=5m (Candle Aggregations)
  if (req.method === 'GET' && pathname === '/api/candles') {
    const symbol = query.symbol || 'RELIANCE';
    const tf = query.timeframe || query.tf || '5m';
    const candles = simulator.getCandles(symbol, tf);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(candles));
    return;
  }

  // 5. GET /api/dom?symbol=RELIANCE (Simulated 20-Level Order Book DOM)
  if (req.method === 'GET' && pathname === '/api/dom') {
    const symbol = query.symbol || 'RELIANCE';
    const ticker = simulator.getTicker(symbol);
    if (!ticker) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Symbol '${symbol}' not found` }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      symbol,
      ltp: ticker.ltp,
      bids: ticker.bids || [],
      asks: ticker.asks || [],
      timestamp: ticker.timestamp,
      isSimulated: true
    }));
    return;
  }

  // 6. GET /api/options-chain?symbol=NIFTY50 (Black-Scholes Greeks)
  if (req.method === 'GET' && pathname === '/api/options-chain') {
    const symbol = query.symbol || 'NIFTY50';
    const ticker = simulator.getTicker(symbol);
    const spot = ticker ? ticker.ltp : 24350.0;
    const chain = generateOptionsChain(symbol, spot, parseInt(query.days || 7, 10));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(chain));
    return;
  }

  // 6b. GET /api/volatility-surface?symbol=NIFTY50 (Options Volatility Surface & SVI Skew Analytics)
  if (req.method === 'GET' && pathname === '/api/volatility-surface') {
    const symbol = query.symbol || 'NIFTY50';
    const ticker = simulator.getTicker(symbol);
    const defaultSpot = symbol.includes('NIFTY') ? 24350.0 : (symbol === 'RELIANCE' ? 2950.0 : 180.0);
    const spot = ticker ? ticker.ltp : defaultSpot;
    const surface = generateVolatilitySurface(symbol, spot);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(surface));
    return;
  }

  // 7. POST /api/backtest (Vectorized Strategy Backtester)
  if (req.method === 'POST' && pathname === '/api/backtest') {
    getJsonBody((err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }
      const symbol = body.symbol || 'RELIANCE';
      const candles = simulator.getCandles(symbol, '5m');
      try {
        const report = runBacktest({
          candles,
          strategy: body.strategy || 'ema_cross',
          initialCapital: body.initialCapital || 1000000,
          params: body.params || {}
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report));
      } catch (backtestErr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: backtestErr.message }));
      }
    });
    return;
  }

  // 8. GET /api/coach?symbol=RELIANCE (Market Structure Guidance)
  if (req.method === 'GET' && pathname === '/api/coach') {
    const symbol = query.symbol || 'RELIANCE';
    const ticker = simulator.getTicker(symbol);
    const candles = simulator.getCandles(symbol, '5m');
    const guidance = getCoachGuidance({
      symbol,
      ticker,
      candles,
      trades: []
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(guidance));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

// Attach WebSocket Server for Market Feed Only
const wss = new WebSocketServer({ server, path: '/ws/ticks' });

wss.on('connection', (ws) => {
  simulator.subscribe(ws);

  // Send immediate snapshot of all tickers on connect
  ws.send(JSON.stringify({
    type: 'snapshot',
    tickers: simulator.getAllTickers()
  }));

  ws.on('close', () => {
    simulator.unsubscribe(ws);
  });
});

server.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`📡 TradeSphere Market Feed Server listening on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Tick Feed streaming on ws://localhost:${PORT}/ws/ticks`);
  console.log(`🔒 Account, OMS & Auth delegated to Spring Boot (port 8080)`);
  console.log(`=====================================================`);
});
