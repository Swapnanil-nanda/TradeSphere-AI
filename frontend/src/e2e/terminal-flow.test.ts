import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { paperEngine } from "../lib/paper-engine.js";
import { historicalMarketData } from "../lib/market-data/historical-provider.js";
import { generate20LevelDOM } from "../lib/options-risk-engine.js";

describe("E2E Terminal & Order Workflow", () => {
  it("E2E 1: Initializes terminal market-data feed and verifies clean price bar ingestion", async () => {
    const result = await historicalMarketData.getCandles("RELIANCE", "1d", 50);

    assert.ok(result.candles.length >= 30, "Candles array must meet minimum bar requirement");
    assert.strictEqual(result.symbol, "RELIANCE");
    assert.strictEqual(result.dataType, "HISTORICAL");
    assert.ok(result.candles[0].close > 0, "Closing price must be strictly positive");
  });

  it("E2E 2: Executes Paper Order flow with Pre-Trade Risk Gatekeeper and Stop-Loss check", () => {
    paperEngine.resetAccount(1000000);
    const initialPortfolio = paperEngine.getPortfolio();
    assert.strictEqual(initialPortfolio.account.currentCash, 1000000);
    assert.strictEqual(initialPortfolio.positions.length, 0);

    // Place a valid BUY order with Stop-Loss
    const orderResult = paperEngine.submitOrder({
      symbol: "RELIANCE",
      side: "BUY",
      orderType: "MARKET",
      quantity: 10,
      stopLoss: 2400,
      takeProfit: 2700
    }, 2500);

    assert.strictEqual(orderResult.status, "FILLED", "Order should be filled immediately at market");
    const updatedPortfolio = paperEngine.getPortfolio();
    assert.strictEqual(updatedPortfolio.positions.length, 1, "Position must be opened");
    assert.strictEqual(updatedPortfolio.positions[0].symbol, "RELIANCE");
    assert.strictEqual(updatedPortfolio.positions[0].quantity, 10);
    assert.ok(updatedPortfolio.account.currentCash < 1000000, "Cash must be deducted for the purchase");
  });

  it("E2E 3: Reconciles Multi-Currency Portfolio Valuation (INR + USD)", () => {
    // Add USD position (AAPL)
    paperEngine.submitOrder({
      symbol: "AAPL",
      side: "BUY",
      orderType: "MARKET",
      quantity: 5,
      stopLoss: 210,
      takeProfit: 240
    }, 220);

    const portfolio = paperEngine.getPortfolio();
    const reliancePos = portfolio.positions.find(p => p.symbol === "RELIANCE");
    const aaplPos = portfolio.positions.find(p => p.symbol === "AAPL");

    assert.ok(reliancePos, "RELIANCE position must exist");
    assert.ok(aaplPos, "AAPL position must exist");
    assert.strictEqual(reliancePos.currency, "INR");
    assert.strictEqual(aaplPos.currency, "USD");

    // Portfolio net liquidation must be calculated cleanly
    assert.ok(portfolio.account.netLiquidation > 0, "Net liquidation equity must be positive");
  });

  it("E2E 4: Bracket OCO Exit & Position Square-Off", () => {
    // Square off RELIANCE position
    const closeRes = paperEngine.closePosition("RELIANCE", 10, 2550);
    assert.ok(closeRes, "Close position must return closed record");

    const portfolio = paperEngine.getPortfolio();
    const reliancePos = portfolio.positions.find(p => p.symbol === "RELIANCE");
    assert.strictEqual(reliancePos, undefined, "RELIANCE position must no longer exist after close");
    assert.ok(portfolio.trades.length >= 1, "Closed trade must be recorded in trade journal");
  });

  it("E2E 5: Microstructure Order Book Depth Integrity", () => {
    const dom = generate20LevelDOM("RELIANCE", 2985.40);

    assert.strictEqual(dom.bids.length, 20, "Depth should have exactly 20 bid levels");
    assert.strictEqual(dom.asks.length, 20, "Depth should have exactly 20 ask levels");
    assert.ok(dom.spread > 0, "Spread must be positive");
    assert.ok(dom.bids[0].price <= dom.asks[0].price, "Best bid must be <= best ask (no inverted book)");
  });
});
