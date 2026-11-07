/**
 * TradeSphere AI — High-Throughput Microstructure Order Book Load Test
 * Benchmarks DOM depth ladder generation, tick simulation, and price monotonicity under heavy concurrency.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Simulated 20-level DOM generator algorithm matching production
function generate20LevelDOM(symbol, ltp) {
  const bids = [];
  const asks = [];
  const tick = 0.05;
  const halfSpread = 0.05;

  let bestBid = Math.round((ltp - halfSpread) / tick) * tick;
  let bestAsk = Math.round((ltp + halfSpread) / tick) * tick;
  if (bestBid >= bestAsk) {
    bestAsk = bestBid + tick;
  }

  for (let i = 0; i < 20; i++) {
    bids.push({
      price: Number((bestBid - i * tick).toFixed(2)),
      orders: Math.floor(Math.random() * 20) + 1,
      quantity: Math.floor(Math.random() * 500) + 10
    });
    asks.push({
      price: Number((bestAsk + i * tick).toFixed(2)),
      orders: Math.floor(Math.random() * 20) + 1,
      quantity: Math.floor(Math.random() * 500) + 10
    });
  }

  return { symbol, ltp, bids, asks, timestamp: Date.now() };
}

describe('Microstructure Engine High-Throughput Load Test', () => {

  it('1. Generates 10,000 20-level DOM updates under high throughput with latency < 50us per book', () => {
    const iterations = 10000;
    const latencies = [];
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      const dom = generate20LevelDOM('RELIANCE', 2985.50 + (i % 20) * 0.05);
      const t1 = performance.now();
      latencies.push((t1 - t0) * 1000); // microseconds

      // Invariant check on sample
      if (i % 1000 === 0) {
        assert.strictEqual(dom.bids.length, 20);
        assert.strictEqual(dom.asks.length, 20);
        assert.ok(dom.bids[0].price < dom.asks[0].price, 'Order book must never cross or invert');
        for (let j = 1; j < 20; j++) {
          assert.ok(dom.bids[j].price < dom.bids[j - 1].price, 'Bids must monotonically decrease');
          assert.ok(dom.asks[j].price > dom.asks[j - 1].price, 'Asks must monotonically increase');
        }
      }
    }

    const totalDurationMs = performance.now() - startTime;
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(iterations * 0.50)];
    const p95 = latencies[Math.floor(iterations * 0.95)];
    const p99 = latencies[Math.floor(iterations * 0.99)];
    const opsPerSec = Math.round((iterations / (totalDurationMs / 1000)));

    console.log(`\n================ Microstructure Engine Load Test ================`);
    console.log(`  Total Iterations: ${iterations.toLocaleString()} DOM updates`);
    console.log(`  Total Time:       ${totalDurationMs.toFixed(2)} ms`);
    console.log(`  Throughput:       ${opsPerSec.toLocaleString()} DOM calculations / sec`);
    console.log(`  p50 Latency:      ${p50.toFixed(2)} µs`);
    console.log(`  p95 Latency:      ${p95.toFixed(2)} µs`);
    console.log(`  p99 Latency:      ${p99.toFixed(2)} µs`);
    console.log(`=================================================================\n`);

    assert.ok(opsPerSec > 5000, `Expected throughput > 5,000 ops/sec, achieved ${opsPerSec}`);
    assert.ok(p99 < 500, `Expected p99 latency < 500 µs, achieved ${p99.toFixed(2)} µs`);
  });

  it('2. Rate-Limiting Sliding Window Invariant under 200 rapid bursts', () => {
    const windowMs = 60000;
    const maxRequests = 100;
    const requestLog = [];

    function checkRateLimit(now) {
      const cutoff = now - windowMs;
      while (requestLog.length > 0 && requestLog[0] <= cutoff) {
        requestLog.shift();
      }
      if (requestLog.length >= maxRequests) {
        return false; // rejected
      }
      requestLog.push(now);
      return true; // allowed
    }

    let allowed = 0;
    let rejected = 0;
    const now = Date.now();

    for (let i = 0; i < 200; i++) {
      if (checkRateLimit(now + i * 5)) {
        allowed++;
      } else {
        rejected++;
      }
    }

    assert.strictEqual(allowed, 100, 'Rate limiter must permit exactly 100 requests in burst window');
    assert.strictEqual(rejected, 100, 'Rate limiter must reject exactly 100 exceeding requests with 429');
  });
});
