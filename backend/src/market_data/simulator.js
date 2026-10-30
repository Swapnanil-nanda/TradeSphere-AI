// Geometric Brownian Motion & 20-Depth Market Microstructure Simulator

export const INSTRUMENTS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 2984.50, vol: 0.015, tickSize: 0.05, lotSize: 1 },
  { symbol: 'NIFTY50', name: 'NIFTY 50 Index', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 24350.00, vol: 0.008, tickSize: 0.05, lotSize: 25 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 4120.00, vol: 0.012, tickSize: 0.05, lotSize: 1 },
  { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 1890.20, vol: 0.014, tickSize: 0.05, lotSize: 1 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 1682.00, vol: 0.011, tickSize: 0.05, lotSize: 1 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 985.40, vol: 0.020, tickSize: 0.05, lotSize: 1 },
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 224.50, vol: 0.013, tickSize: 0.01, lotSize: 1 },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 258.80, vol: 0.028, tickSize: 0.01, lotSize: 1 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 141.20, vol: 0.025, tickSize: 0.01, lotSize: 1 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 432.10, vol: 0.012, tickSize: 0.01, lotSize: 1 }
];

export class MarketSimulator {
  constructor() {
    this.tickers = new Map();
    this.candleHistory = new Map(); // symbol -> Array of candles
    this.subscribers = new Set();
    this.timer = null;

    // Initialize state
    for (const inst of INSTRUMENTS) {
      const ltp = inst.basePrice;
      const spread = inst.tickSize * 2;
      const bid = Math.round((ltp - spread / 2) * 100) / 100;
      const ask = Math.round((ltp + spread / 2) * 100) / 100;

      this.tickers.set(inst.symbol, {
        symbol: inst.symbol,
        name: inst.name,
        exchange: inst.exchange,
        market: inst.market,
        currency: inst.currency,
        ltp,
        prevClose: ltp * (1 - (Math.random() * 0.008 - 0.004)),
        dayHigh: ltp * 1.015,
        dayLow: ltp * 0.985,
        bid,
        ask,
        volume: Math.floor(Math.random() * 1500000) + 500000,
        bids: [],
        asks: [],
        timestamp: Date.now()
      });

      // Generate initial 120 historical 5m candles
      this.candleHistory.set(inst.symbol, this._generateInitialCandles(inst));
      this._updateOrderBook(inst.symbol);
    }
  }

  start(intervalMs = 150) {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this._simulateTick();
    }, intervalMs);
    console.log(`[MarketSimulator] Running 24/7 GBM Tick & L2 DOM Engine (${intervalMs}ms cycle)`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  subscribe(ws) {
    this.subscribers.add(ws);
  }

  unsubscribe(ws) {
    this.subscribers.delete(ws);
  }

  getTicker(symbol) {
    return this.tickers.get(symbol);
  }

  getAllTickers() {
    return Array.from(this.tickers.values());
  }

  getCandles(symbol, timeframe = '5m') {
    const list = this.candleHistory.get(symbol) || [];
    return this._enrichCandlesWithIndicators(list);
  }

  _simulateTick() {
    // Pick 1 to 3 random instruments to update per tick
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
      const current = this.tickers.get(inst.symbol);
      if (!current) continue;

      // Geometric Brownian Motion step
      // dt = 1/252 trading days / 23400 seconds = ~0.00001
      const drift = 0.00002;
      const sigma = inst.vol * 0.05;
      const randNorm = (Math.random() + Math.random() + Math.random() - 1.5) * 1.5;
      const pctChange = drift + sigma * randNorm;

      let newLtp = current.ltp * (1 + pctChange);
      // Round to tickSize
      newLtp = Math.round(newLtp / inst.tickSize) * inst.tickSize;
      newLtp = Math.round(newLtp * 100) / 100;

      const spread = inst.tickSize * (Math.random() > 0.7 ? 2 : 1);
      const bid = Math.round((newLtp - spread / 2) * 100) / 100;
      const ask = Math.round((newLtp + spread / 2) * 100) / 100;

      const volDelta = Math.floor(Math.random() * 80) + 10;
      current.ltp = newLtp;
      current.bid = bid;
      current.ask = ask;
      current.volume += volDelta;
      current.dayHigh = Math.max(current.dayHigh, newLtp);
      current.dayLow = Math.min(current.dayLow, newLtp);
      current.timestamp = Date.now();

      this._updateOrderBook(inst.symbol);
      this._updateActiveCandle(inst.symbol, newLtp, volDelta);

      // Broadcast tick to all active WebSocket clients
      this._broadcastTick(current);
    }
  }

  _updateOrderBook(symbol) {
    const ticker = this.tickers.get(symbol);
    const inst = INSTRUMENTS.find(i => i.symbol === symbol);
    if (!ticker || !inst) return;

    const bids = [];
    const asks = [];
    let curBid = ticker.bid;
    let curAsk = ticker.ask;

    for (let level = 0; level < 20; level++) {
      curBid = Math.round((curBid - inst.tickSize) * 100) / 100;
      curAsk = Math.round((curAsk + inst.tickSize) * 100) / 100;
      const bidQty = Math.floor(Math.random() * 450) + 50 + (20 - level) * 15;
      const askQty = Math.floor(Math.random() * 450) + 50 + (20 - level) * 15;
      bids.push([curBid, bidQty]);
      asks.push([curAsk, askQty]);
    }

    ticker.bids = bids;
    ticker.asks = asks;
  }

  _generateInitialCandles(inst) {
    const candles = [];
    let price = inst.basePrice * (1 - 0.03);
    const now = Date.now();
    const stepMs = 5 * 60 * 1000;

    for (let i = 120; i >= 0; i--) {
      const time = Math.floor((now - i * stepMs) / 1000);
      const drift = (Math.random() - 0.49) * (inst.basePrice * 0.005);
      const open = Math.round(price * 100) / 100;
      const high = Math.round((open + Math.random() * (inst.basePrice * 0.006)) * 100) / 100;
      const low = Math.round((open - Math.random() * (inst.basePrice * 0.006)) * 100) / 100;
      const close = Math.round((low + Math.random() * (high - low)) * 100) / 100;
      const volume = Math.floor(Math.random() * 45000) + 12000;

      candles.push({ time, open, high, low, close, volume });
      price = close;
    }
    return candles;
  }

  _updateActiveCandle(symbol, ltp, volDelta) {
    const list = this.candleHistory.get(symbol);
    if (!list || list.length === 0) return;

    const last = list[list.length - 1];
    const nowSec = Math.floor(Date.now() / 1000);
    const candleDurationSec = 300; // 5m

    if (nowSec - last.time > candleDurationSec) {
      // New candle
      list.push({
        time: nowSec,
        open: ltp,
        high: ltp,
        low: ltp,
        close: ltp,
        volume: volDelta
      });
      if (list.length > 200) list.shift();
    } else {
      // Update ongoing candle
      last.high = Math.max(last.high, ltp);
      last.low = Math.min(last.low, ltp);
      last.close = ltp;
      last.volume += volDelta;
    }
  }

  _enrichCandlesWithIndicators(candles) {
    let ema = candles[0]?.close || 0;
    const k = 2 / (20 + 1); // 20-period EMA multiplier
    let cumulativeVolPrice = 0;
    let cumulativeVol = 0;

    return candles.map((c, i) => {
      // EMA20
      ema = i === 0 ? c.close : (c.close * k) + (ema * (1 - k));

      // VWAP
      const typicalPrice = (c.high + c.low + c.close) / 3;
      cumulativeVolPrice += typicalPrice * c.volume;
      cumulativeVol += c.volume;
      const vwap = cumulativeVol > 0 ? cumulativeVolPrice / cumulativeVol : c.close;

      // Dynamic Support & Resistance
      const support = Math.round((c.low * 0.995) * 10) / 10;
      const resistance = Math.round((c.high * 1.005) * 10) / 10;

      // Mock RSI and ATR for guidance
      const rsi = Math.round((50 + (c.close - ema) * 1.5) * 10) / 10;
      const atr = Math.round((c.high - c.low) * 100) / 100;

      return {
        ...c,
        ema20: Math.round(ema * 100) / 100,
        vwap: Math.round(vwap * 100) / 100,
        support,
        resistance,
        rsi: Math.max(10, Math.min(90, rsi)),
        atr
      };
    });
  }

  _broadcastTick(ticker) {
    if (this.subscribers.size === 0) return;
    const tickData = {
      symbol: ticker.symbol,
      name: ticker.name,
      exchange: ticker.exchange,
      market: ticker.market,
      currency: ticker.currency,
      ltp: ticker.ltp,
      bid: ticker.bid,
      ask: ticker.ask,
      change: Math.round((ticker.ltp - ticker.prevClose) * 100) / 100,
      changePct: Math.round(((ticker.ltp - ticker.prevClose) / ticker.prevClose) * 10000) / 100,
      volume: ticker.volume,
      dayHigh: ticker.dayHigh,
      dayLow: ticker.dayLow,
      bids: ticker.bids.slice(0, 20),
      asks: ticker.asks.slice(0, 20),
      timestamp: ticker.timestamp
    };

    const payload = JSON.stringify({
      type: 'TICK',
      data: tickData,
      ...tickData
    });

    for (const ws of this.subscribers) {
      if (ws.readyState === 1) { // OPEN
        ws.send(payload);
      }
    }
  }
}
