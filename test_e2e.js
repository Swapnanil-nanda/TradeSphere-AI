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
  if (health.status !== 200 || health.data.status !== 'healthy') {
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

  // 4. Pre-Trade Risk Gatekeeper - Violating Order (>1% equity risk)
  console.log('4. Testing Pre-Trade Risk Gatekeeper: Order Exceeding 1% Risk...');
  const violatingOrder = await request('POST', '/api/orders', {
    symbol: 'RELIANCE',
    side: 'BUY',
    quantity: 500, // 500 * (2850 - 2800) = 25,000 risk > 10,000 (1% of 1,000,000)
    orderType: 'MARKET',
    stopLoss: 2800.0,
    takeProfit: 3000.0
  });
  if (violatingOrder.status === 400 && violatingOrder.data.error.includes('1.0%')) {
    console.log(`   ✓ BLOCKED as expected by Risk Gatekeeper: "${violatingOrder.data.error}"`);
  } else {
    throw new Error(`Risk Gatekeeper failed to block excessive risk order: ${JSON.stringify(violatingOrder)}`);
  }

  // 5. Pre-Trade Risk Gatekeeper - Missing Stop-Loss Invariant
  console.log('5. Testing Pre-Trade Risk Gatekeeper: Mandatory Stop-Loss Enforcement...');
  const noSlOrder = await request('POST', '/api/orders', {
    symbol: 'RELIANCE',
    side: 'BUY',
    quantity: 10,
    orderType: 'MARKET'
  });
  if (noSlOrder.status === 400 && noSlOrder.data.error.toLowerCase().includes('stop-loss')) {
    console.log(`   ✓ BLOCKED as expected by Risk Gatekeeper: "${noSlOrder.data.error}"`);
  } else {
    throw new Error(`Risk Gatekeeper failed to block missing stop loss: ${JSON.stringify(noSlOrder)}`);
  }

  // 6. Pre-Trade Risk Gatekeeper - Compliant Order Execution
  console.log('6. Testing Compliant Order Execution with 1% auto-sizing...');
  const currentTicker = tickers.data.find(t => t.symbol === 'RELIANCE');
  const ltp = currentTicker.ltp;
  const compliantOrder = await request('POST', '/api/orders', {
    symbol: 'RELIANCE',
    side: 'BUY',
    quantity: 20, // 20 * (ltp - (ltp - 30)) = 600 risk <= 10,000
    orderType: 'MARKET',
    stopLoss: Math.round((ltp - 30) * 10) / 10,
    takeProfit: Math.round((ltp + 60) * 10) / 10
  });
  if (compliantOrder.status !== 200 || compliantOrder.data.status !== 'FILLED') {
    throw new Error(`Compliant order failed: ${JSON.stringify(compliantOrder)}`);
  }
  console.log(`   ✓ Executed successfully: ID ${compliantOrder.data.orderId}, Fill Price: ₹${compliantOrder.data.executionPrice}`);

  // 7. Portfolio Blotter Verification
  console.log('7. Checking GET /api/portfolio...');
  const portfolio = await request('GET', '/api/portfolio');
  if (portfolio.status !== 200 || portfolio.data.positions.length === 0) {
    throw new Error(`Portfolio check failed: ${JSON.stringify(portfolio)}`);
  }
  const pos = portfolio.data.positions[0];
  console.log(`   ✓ Verified open position: ${pos.symbol} ${pos.side} ${pos.quantity} shares @ ₹${pos.avgPrice.toFixed(2)}, MTM PnL: ₹${pos.unrealizedPnL.toFixed(2)}`);

  // 8. Close Position
  console.log('8. Testing POST /api/positions/close...');
  const closeRes = await request('POST', '/api/positions/close', { symbol: 'RELIANCE' });
  if (closeRes.status !== 200 || !closeRes.data.symbol) {
    throw new Error(`Close position failed: ${JSON.stringify(closeRes)}`);
  }
  console.log(`   ✓ Closed position. Realized PnL: ₹${closeRes.data.pnl.toFixed(2)}, R-Multiple: ${closeRes.data.rMultiple}R, Reason: ${closeRes.data.exitReason}`);

  // 9. Options Greeks Engine
  console.log('9. Checking GET /api/options-chain?symbol=NIFTY50...');
  const options = await request('GET', '/api/options-chain?symbol=NIFTY50&days=7');
  if (options.status !== 200 || !Array.isArray(options.data.chain) || options.data.chain.length === 0) {
    throw new Error(`Options check failed: ${JSON.stringify(options)}`);
  }
  const atm = options.data.chain.find(c => Math.abs(c.strike - options.data.spotPrice) <= 50) || options.data.chain[0];
  console.log(`   ✓ Options chain computed (${options.data.chain.length} strikes). ATM Strike ${atm.strike}:`);
  console.log(`     Call LTP: ₹${atm.call.ltp}, Delta: ${atm.call.delta}, Gamma: ${atm.call.gamma}, IV: ${atm.call.iv}%`);
  console.log(`     Put LTP: ₹${atm.put.ltp}, Delta: ${atm.put.delta}, Theta: ${atm.put.theta}, IV: ${atm.put.iv}%`);

  // 10. Vectorized Backtester
  console.log('10. Testing POST /api/backtest...');
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

  // 11. AI Risk Coach
  console.log('11. Checking GET /api/coach?symbol=RELIANCE...');
  const coach = await request('GET', '/api/coach?symbol=RELIANCE');
  if (coach.status !== 200 || !coach.data.bias) {
    throw new Error(`AI Coach check failed: ${JSON.stringify(coach)}`);
  }
  console.log(`   ✓ AI Coach analysis: Regime "${coach.data.bias}" (Trend: ${coach.data.trendStrength})`);
  console.log(`   ✓ Behavioral Audit: "${coach.data.audit.behavioralVerdict}"`);

  // 12. WebSocket Real-Time Ticks
  console.log('12. Testing WebSocket /ws/ticks real-time feed...');
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
  console.log('  ALL 12 E2E VERIFICATION CHECKS PASSED PERFECTLY (100% SUITE)  ');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('TEST RUNNER FAILED:', err);
  process.exit(1);
});
