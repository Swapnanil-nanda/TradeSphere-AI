import http from 'http';
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import { MarketSimulator, INSTRUMENTS } from './market_data/simulator.js';
import { RiskAndOMSEngine } from './oms/risk_engine.js';
import { generateOptionsChain } from './quant/options_greeks.js';
import { runBacktest } from './quant/backtester.js';
import { getCoachGuidance } from './coach/ai_coach.js';
import { authService } from './auth/auth_service.js';

const PORT = process.env.PORT || 8000;

// Initialize Core Engines
const simulator = new MarketSimulator();
const oms = new RiskAndOMSEngine(simulator);
simulator.start(120); // 120ms tick frequency for ultra-responsive streaming

// Create HTTP Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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

  // Health Check
  if (req.method === 'GET' && pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime(), simulator: '24/7 GBM active' }));
    return;
  }

  // 0. POST /api/auth/register & /api/auth/login
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    getJsonBody((err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }
      try {
        const result = authService.register(body);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...result, message: 'Account registered successfully.' }));
      } catch (authErr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: authErr.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    getJsonBody((err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }
      try {
        const result = authService.login(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...result, message: 'Authentication successful.' }));
      } catch (authErr) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: authErr.message }));
      }
    });
    return;
  }

  // 0. GET /api/health
  if (req.method === 'GET' && pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      service: 'TradeSphere AI Market Simulator & OMS Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      executionMode: 'PAPER_TRADING_ONLY',
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    }));
    return;
  }

  // 1. GET /api/instruments & /api/tickers
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

  // 2. GET /api/candles?symbol=RELIANCE&timeframe=5m
  if (req.method === 'GET' && pathname === '/api/candles') {
    const symbol = query.symbol || 'RELIANCE';
    const tf = query.timeframe || query.tf || '5m';
    const candles = simulator.getCandles(symbol, tf);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(candles));
    return;
  }

  // 3. GET /api/portfolio & POST /api/portfolio/reset
  if (req.method === 'GET' && pathname === '/api/portfolio') {
    const portfolio = oms.getPortfolio();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(portfolio));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/portfolio/reset') {
    const portfolio = oms.resetAccount();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Account reset to initial equity', portfolio }));
    return;
  }

  // 4. POST /api/risk/size (1% Risk Auto-Sizer)
  if (req.method === 'POST' && pathname === '/api/risk/size') {
    getJsonBody((err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }
      const { symbol, entryPrice, stopLossPrice, riskPct } = body;
      const ticker = simulator.getTicker(symbol);
      const entry = entryPrice ? parseFloat(entryPrice) : (ticker ? ticker.ltp : 100);
      const sl = parseFloat(stopLossPrice);
      const qty = oms.calculatePositionSize(symbol, entry, sl, riskPct || 1.0);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ symbol, entryPrice: entry, stopLossPrice: sl, recommendedQuantity: qty }));
    });
    return;
  }

  // 5. POST /api/orders (Pre-Trade Risk Gatekeeper & Order Execution)
  if (req.method === 'POST' && pathname === '/api/orders') {
    getJsonBody((err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }
      try {
        const result = oms.submitOrder(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (riskError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: riskError.message }));
      }
    });
    return;
  }

  // 5b. DELETE /api/orders/:id (Cancel open order)
  if (req.method === 'DELETE' && pathname.startsWith('/api/orders/')) {
    const orderId = pathname.replace('/api/orders/', '');
    try {
      const result = oms.cancelOrder(orderId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 5c. POST /api/accounts/configure (Configure virtual capital, slippage & fees)
  if (req.method === 'POST' && pathname === '/api/accounts/configure') {
    getJsonBody((err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }
      const portfolio = oms.configureAccount(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Paper trading account configured', portfolio }));
    });
    return;
  }

  // 5d. GET /api/accounts/reconcile (Exact double-entry cash ledger reconciliation)
  if (req.method === 'GET' && pathname === '/api/accounts/reconcile') {
    const report = oms.reconcileAccount();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(report));
    return;
  }

  // 5e. GET /api/ledger (Audit history of double-entry cash ledger)
  if (req.method === 'GET' && pathname === '/api/ledger') {
    const ledger = oms.getCashLedger();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ledger));
    return;
  }

  // 6. POST /api/positions/close
  if (req.method === 'POST' && pathname === '/api/positions/close') {
    getJsonBody((err, body) => {
      if (err || !body.symbol) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Symbol is required' }));
        return;
      }
      const result = oms.closePosition(body.symbol, 'Manual User Close');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result || { message: 'Position not found' }));
    });
    return;
  }

  // 7. GET /api/options-chain?symbol=NIFTY50
  if (req.method === 'GET' && pathname === '/api/options-chain') {
    const symbol = query.symbol || 'NIFTY50';
    const ticker = simulator.getTicker(symbol);
    const spot = ticker ? ticker.ltp : 24350.0;
    const chain = generateOptionsChain(symbol, spot, parseInt(query.days || 7, 10));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(chain));
    return;
  }

  // 8. POST /api/backtest
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

  // 9. GET /api/coach?symbol=RELIANCE
  if (req.method === 'GET' && pathname === '/api/coach') {
    const symbol = query.symbol || 'RELIANCE';
    const ticker = simulator.getTicker(symbol);
    const candles = simulator.getCandles(symbol, '5m');
    const portfolio = oms.getPortfolio();
    const guidance = getCoachGuidance({
      symbol,
      ticker,
      candles,
      trades: portfolio.trades
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(guidance));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

// Attach WebSocket Server
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
  console.log(`🚀 ApexTradeOS Backend Server listening on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Tick Feed streaming on ws://localhost:${PORT}/ws/ticks`);
  console.log(`=====================================================`);
});
