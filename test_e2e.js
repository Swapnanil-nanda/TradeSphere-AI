/**
 * ApexTradeOS / TradeSphere AI - Comprehensive E2E Verification Suite
 */

const http = require('http');
const { WebSocket } = require('./backend/node_modules/ws');

const API_BASE = 'http://localhost:8000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING APEXTRADEOS TEST SUITE ---');

  // 1. Health Check
  console.log('1. Checking GET /api/health...');
  const health = await request('GET', '/api/health');
  if (health.status !== 200 || (health.data.status !== 'healthy' && health.data.status !== 'UP')) {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }
  console.log('   ✓ Health OK:', health.data);

  // 2. Tickers & Dual-Market
  console.log('2. Checking GET /api/tickers...');
  const tickers = await request('GET', '/api/tickers');
  if (tickers.status !== 200 || !Array.isArray(tickers.data) || tickers.data.length < 10) {
    throw new Error(`Tickers check failed: ${JSON.stringify(tickers)}`);
  }
  console.log(`   ✓ Received ${tickers.data.length} dual-market symbols.`);
  const inCount = tickers.data.filter(t => t.market === 'IN').length;
  const usCount = tickers.data.filter(t => t.market === 'US').length;
  console.log(`   ✓ Market breakdown: ${inCount} NSE (IN) and ${usCount} NASDAQ (US).`);

  // 3. Candles with EMA & VWAP indicators
  console.log('3. Checking GET /api/candles?symbol=RELIANCE&timeframe=5m...');
  const candles = await request('GET', '/api/candles?symbol=RELIANCE&timeframe=5m');
  if (candles.status !== 200 || !Array.isArray(candles.data) || candles.data.length === 0) {
    throw new Error(`Candles check failed: ${JSON.stringify(candles)}`);
  }
  const sampleCandle = candles.data[candles.data.length - 1];
  console.log(`   ✓ Received ${candles.data.length} candles. Latest close: ₹${sampleCandle.close}, EMA20: ₹${sampleCandle.ema20}, VWAP: ₹${sampleCandle.vwap}`);

  // 4. Level 2 DOM Ladder (20-depth book)
  console.log('4. Checking GET /api/dom?symbol=RELIANCE...');
  const dom = await request('GET', '/api/dom?symbol=RELIANCE');
  if (dom.status !== 200 || !Array.isArray(dom.data.bids) || !Array.isArray(dom.data.asks)) {
    throw new Error(`DOM check failed: ${JSON.stringify(dom)}`);
  }
  console.log(`   ✓ Level 2 DOM Ladder verified: ${dom.data.bids.length} bids, ${dom.data.asks.length} asks. Spread: ₹${(dom.data.asks[0]?.price - dom.data.bids[0]?.price).toFixed(2)}`);

  // 5. Architectural Invariant: Deprecated Node Order Endpoints return HTTP 410
  console.log('5. Verifying Architectural Invariant: Deprecated Node OMS returns HTTP 410...');
  const deprecatedOrder = await request('POST', '/api/orders', { symbol: 'RELIANCE', side: 'BUY' });
  if (deprecatedOrder.status === 410 && deprecatedOrder.data.code === 'MIGRATED_TO_SPRING_BOOT') {
    console.log(`   ✓ Node order endpoint correctly rejected with HTTP 410 MIGRATED_TO_SPRING_BOOT`);
  } else {
    throw new Error(`Architectural invariant violated: Node order endpoint did not return 410: ${JSON.stringify(deprecatedOrder)}`);
  }

  // 6. Architectural Invariant: Deprecated Node Portfolio returns HTTP 410
  console.log('6. Verifying Architectural Invariant: Deprecated Node Portfolio returns HTTP 410...');
  const deprecatedPort = await request('GET', '/api/portfolio');
  if (deprecatedPort.status === 410 && deprecatedPort.data.code === 'MIGRATED_TO_SPRING_BOOT') {
    console.log(`   ✓ Node portfolio endpoint correctly rejected with HTTP 410 MIGRATED_TO_SPRING_BOOT`);
  } else {
    throw new Error(`Architectural invariant violated: Node portfolio endpoint did not return 410: ${JSON.stringify(deprecatedPort)}`);
  }

  // 7. Options Greeks Engine
  console.log('7. Checking GET /api/options-chain?symbol=NIFTY50...');
  const options = await request('GET', '/api/options-chain?symbol=NIFTY50&days=7');
  if (options.status !== 200 || !Array.isArray(options.data.chain) || options.data.chain.length === 0) {
    throw new Error(`Options check failed: ${JSON.stringify(options)}`);
  }
  const atm = options.data.chain.find(c => Math.abs(c.strike - options.data.spotPrice) <= 50) || options.data.chain[0];
  console.log(`   ✓ Options chain computed (${options.data.chain.length} strikes). ATM Strike ${atm.strike}:`);
  console.log(`     Call LTP: ₹${atm.call.ltp}, Delta: ${atm.call.delta}, Gamma: ${atm.call.gamma}, IV: ${atm.call.iv}%`);
  console.log(`     Put LTP: ₹${atm.put.ltp}, Delta: ${atm.put.delta}, Theta: ${atm.put.theta}, IV: ${atm.put.iv}%`);

  // 8. Vectorized Backtester
  console.log('8. Testing POST /api/backtest...');
  const backtest = await request('POST', '/api/backtest', {
    symbol: 'RELIANCE',
    strategy: 'ema_cross',
    initialCapital: 1000000,
    params: { fastEma: 9, slowEma: 21 }
  });
  if (backtest.status !== 200 || !backtest.data.equityCurve) {
    throw new Error(`Backtest failed: ${JSON.stringify(backtest)}`);
  }
  const m = backtest.data;
  console.log(`   ✓ Backtest executed over ${m.totalTrades} trades: Win Rate ${m.winRatePct}%, Sharpe: ${m.sharpeRatio}, Max Drawdown: ${m.maxDrawdownPct}%, Net Return: ${m.netReturnPct}%`);

  // 9. AI Risk Coach
  console.log('9. Checking GET /api/coach?symbol=RELIANCE...');
  const coach = await request('GET', '/api/coach?symbol=RELIANCE');
  if (coach.status !== 200 || !coach.data.bias) {
    throw new Error(`AI Coach check failed: ${JSON.stringify(coach)}`);
  }
  console.log(`   ✓ AI Coach analysis: Regime "${coach.data.bias}" (Trend: ${coach.data.trendStrength})`);

  // 10. WebSocket Real-Time Ticks
  console.log('10. Testing WebSocket /ws/ticks real-time feed...');
  await new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:8000/ws/ticks');
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket tick timeout'));
    }, 5000);

    ws.on('open', () => {
      console.log('   ✓ WebSocket connected to ws://localhost:8000/ws/ticks');
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'TICK') {
        console.log(`   ✓ Live Tick Received: ${msg.data.symbol} @ ₹${msg.data.ltp} (Bid: ₹${msg.data.bid}, Ask: ₹${msg.data.ask}, Vol: ${msg.data.volume})`);
        clearTimeout(timer);
        ws.close();
        resolve();
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  console.log('================================================================');
  console.log(' ALL 10 E2E MARKET FEED & INVARIANT CHECKS PASSED (100% SUITE)  ');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('TEST RUNNER FAILED:', err);
  process.exit(1);
});
