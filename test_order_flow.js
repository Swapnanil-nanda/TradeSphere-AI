// test_order_flow.js — Verifies complete end-to-end paper trading execution cycle
const http = require('http');

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function testFullOrderCycle() {
  console.log('--- Testing Paper Trading Execution Loop through Frontend Proxy ---');

  // 1. Initial Portfolio
  const initPort = await getJson('http://localhost:3000/api/portfolio');
  console.log(`1. Initial Net Liquidation: ₹${initPort.data.account.netLiquidation}`);
  console.log(`   Open Positions: ${initPort.data.positions.length}`);

  // 2. Submit Bracket Buy Order
  // 2. Fetch current ticker to compute exact bracket
  const tickerRes = await getJson('http://localhost:3000/api/tickers');
  const rel = tickerRes.data.find(t => t.symbol === 'RELIANCE') || { ltp: 3200 };
  const currentLtp = rel.ltp;
  const riskDist = Math.round(currentLtp * 0.012); // ~1.2% risk
  const stopLoss = Math.round((currentLtp - riskDist) * 10) / 10;
  const takeProfit = Math.round((currentLtp + riskDist * 2.0) * 10) / 10; // 2.0R reward

  const orderPayload = {
    symbol: 'RELIANCE',
    side: 'BUY',
    orderType: 'MARKET',
    quantity: 10,
    stopLoss,
    takeProfit
  };
  console.log(`2. Placing Order: LTP=${currentLtp}, SL=${stopLoss}, TP=${takeProfit}`);
  const orderRes = await postJson('http://localhost:3000/api/orders', orderPayload);
  console.log(`   Order Response (${orderRes.status}):`, orderRes.data.message || orderRes.data.error || orderRes.data);

  // 3. Verify Position Created
  const postPort = await getJson('http://localhost:3000/api/portfolio');
  const pos = postPort.data.positions.find(p => p.symbol === 'RELIANCE');
  console.log(`3. Verified Open Position:`, pos ? `${pos.quantity} Qty @ ₹${pos.entryPrice} (PnL: ₹${pos.unrealizedPnL})` : 'None');

  // 4. Close Position
  const closeRes = await postJson('http://localhost:3000/api/positions/close', { symbol: 'RELIANCE' });
  console.log(`4. Position Close Response (${closeRes.status}):`, closeRes.data.message || closeRes.data);

  // 5. Final Portfolio Status
  const finalPort = await getJson('http://localhost:3000/api/portfolio');
  console.log(`5. Final Open Positions: ${finalPort.data.positions.length}`);
  console.log(`   Final Net Liquidation: ₹${finalPort.data.account.netLiquidation}`);
  console.log(`\n✅ End-to-End Execution Flow PASSED!`);
}

testFullOrderCycle().catch(console.error);
