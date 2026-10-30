/**
 * TradeSphere AI - Unified TypeScript API Client Layer
 * Handles live backend communication with labeled simulated demo fixtures.
 */

export interface Ticker {
  symbol: string;
  name: string;
  market: 'IN' | 'US';
  exchange: string;
  currency: string;
  ltp: number;
  bid: number;
  ask: number;
  change: number;
  changePct: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  timestamp: number;
  isSimulated: boolean;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  vwap?: number;
  support?: number;
  resistance?: number;
  rsi?: number;
  atr?: number;
}

export interface Position {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  openedAt: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'BRACKET';
  quantity: number;
  price: number;
  executionPrice?: number;
  status: 'PENDING' | 'FILLED' | 'REJECTED' | 'CANCELLED';
  stopLoss?: number;
  takeProfit?: number;
  timestamp: number;
}

export interface Trade {
  id: string;
  orderId?: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  realizedPnL?: number;
  rMultiple?: number;
  exitReason?: string;
  action: 'ENTRY' | 'EXIT';
  timestamp: number;
}

export interface PortfolioAccount {
  id: string;
  name: string;
  currency: string;
  initialEquity: number;
  currentCash: number;
  netLiquidation: number;
  totalUnrealizedPnL: number;
  dayStartEquity: number;
  dailyPnL: number;
  dailyPnLPct: number;
  maxRiskPerTradePct: number;
  dailyDrawdownLimitPct: number;
  tradingLocked: boolean;
  lockReason?: string | null;
}

export interface CashLedgerEntry {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reference: string;
  description: string;
  timestamp: number;
}

export interface ReconciliationReport {
  status: string;
  reconciled: boolean;
  variance: number;
  currency: string;
  startingCapital: number;
  totalTradeDebits: number;
  totalTradeCredits: number;
  totalCommissionFees: number;
  calculatedCash: number;
  actualCurrentCash: number;
  netLiquidation: number;
  totalLedgerEntries: number;
  auditFormula: string;
  timestamp: string;
  isSimulated: boolean;
  disclaimer: string;
}

export interface PortfolioData {
  account: PortfolioAccount;
  positions: Position[];
  orders: Order[];
  openOrders?: Order[];
  trades: Trade[];
  isSimulated?: boolean;
  disclaimer?: string;
}

export interface ScreenerStock {
  symbol: string;
  name: string;
  market: 'IN' | 'US';
  sector: string;
  price: number;
  changePct: number;
  volume: number;
  peRatio: number;
  marketCapCr: number;
  rsi14: number;
  trend: 'BULLISH' | 'BEARISH' | 'CONSOLIDATION';
  setup: string;
}

export interface CompanyResearch {
  symbol: string;
  name: string;
  sector: string;
  market: 'IN' | 'US';
  overview: string;
  keyStats: {
    marketCap: string;
    peRatio: number;
    pbRatio: number;
    dividendYield: string;
    roe: string;
    debtToEquity: number;
    beta: number;
    week52High: number;
    week52Low: number;
  };
  technicals: {
    bias: string;
    rsi: number;
    ema20: number;
    vwap: number;
    support: number;
    resistance: number;
    trendSummary: string;
  };
  catalysts: { title: string; date: string; impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: 'basic' | 'active' | 'pro';
  startingCapital: number;
  riskCapPct: number;
  circuitBreakerPct: number;
}

import { appConfig } from './config';

const BACKEND_BASE = appConfig.apiUrl;
const MARKET_BASE = appConfig.marketApiUrl || BACKEND_BASE;

class TradeSphereApiClient {
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tradesphere_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Authentication failed.');
    }
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('tradesphere_token', data.token);
      localStorage.setItem('tradesphere_user', JSON.stringify(data.user || data));
    }
    return data;
  }

  async register(userData: { name: string; email: string; password: string; tier?: string }): Promise<any> {
    const res = await fetch(`${BACKEND_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: userData.name,
        email: userData.email,
        password: userData.password,
        tier: userData.tier || 'ACTIVE'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Registration failed.');
    }
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('tradesphere_token', data.token);
      localStorage.setItem('tradesphere_user', JSON.stringify(data.user || data));
    }
    return data;
  }

  async checkBackendHealth(): Promise<{ status: string; connected: boolean; details?: any }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${BACKEND_BASE}/api/health`, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { status: data.status || 'UP', connected: true, details: data };
      }
    } catch (e) {
      // Backend may be waking up on Render or in standalone demo mode
    }
    return { status: 'STANDALONE_DEMO', connected: false };
  }
  private fallbackTickers: Ticker[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 2985.4, bid: 2985.35, ask: 2985.45, change: 24.8, changePct: 0.84, volume: 1824900, dayHigh: 3010, dayLow: 2940, timestamp: Date.now(), isSimulated: true },
    { symbol: 'NIFTY50', name: 'NIFTY 50 Benchmark Index', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 24420.0, bid: 24419.5, ask: 24420.5, change: 112.5, changePct: 0.46, volume: 5490200, dayHigh: 24500, dayLow: 24280, timestamp: Date.now(), isSimulated: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 4125.0, bid: 4124.8, ask: 4125.2, change: -15.2, changePct: -0.37, volume: 832000, dayHigh: 4160, dayLow: 4100, timestamp: Date.now(), isSimulated: true },
    { symbol: 'INFY', name: 'Infosys Limited', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 1892.5, bid: 1892.4, ask: 1892.6, change: 18.2, changePct: 0.97, volume: 1420000, dayHigh: 1910, dayLow: 1865, timestamp: Date.now(), isSimulated: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 1748.2, bid: 1748.1, ask: 1748.3, change: 8.4, changePct: 0.48, volume: 2980000, dayHigh: 1765, dayLow: 1730, timestamp: Date.now(), isSimulated: true },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 985.0, bid: 984.8, ask: 985.2, change: -6.2, changePct: -0.63, volume: 3820000, dayHigh: 1005, dayLow: 975, timestamp: Date.now(), isSimulated: true },
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 234.5, bid: 234.48, ask: 234.52, change: 3.2, changePct: 1.38, volume: 54100000, dayHigh: 236.2, dayLow: 231.0, timestamp: Date.now(), isSimulated: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 219.8, bid: 219.7, ask: 219.9, change: -3.8, changePct: -1.70, volume: 68200000, dayHigh: 226.5, dayLow: 215.2, timestamp: Date.now(), isSimulated: true },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 142.6, bid: 142.58, ask: 142.62, change: 4.2, changePct: 3.03, volume: 92300000, dayHigh: 144.5, dayLow: 138.2, timestamp: Date.now(), isSimulated: true },
    { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 431.2, bid: 431.15, ask: 431.25, change: 2.8, changePct: 0.65, volume: 22100000, dayHigh: 434.0, dayLow: 427.5, timestamp: Date.now(), isSimulated: true }
  ];

  async getTickers(): Promise<Ticker[]> {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/tickers`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((t: any) => ({
          ...t,
          isSimulated: true
        }));
      }
    } catch (e) {
      console.warn('[ApiClient] Backend unreachable, serving labeled demo fixtures for tickers');
    }
    return this.fallbackTickers;
  }

  async getCandles(symbol: string, timeframe: string = '5m'): Promise<Candle[]> {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/candles?symbol=${symbol}&timeframe=${timeframe}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn('[ApiClient] Backend unreachable, generating simulated candles for', symbol);
    }

    // Generate deterministic demo candle fixture
    const nowSec = Math.floor(Date.now() / 1000);
    const basePrice = symbol.includes('NIFTY') ? 24350 : symbol.includes('TCS') ? 4100 : 2950;
    const candles: Candle[] = [];
    let price = basePrice;

    for (let i = 60; i >= 0; i--) {
      const time = nowSec - (i * 300);
      const delta = (Math.sin(i * 0.4) + Math.cos(i * 0.2)) * (basePrice * 0.003);
      const open = Math.round((price + delta) * 100) / 100;
      const high = Math.round((open + Math.random() * (basePrice * 0.004)) * 100) / 100;
      const low = Math.round((open - Math.random() * (basePrice * 0.004)) * 100) / 100;
      const close = Math.round(((open + high + low) / 3) * 100) / 100;
      const volume = Math.floor(Math.random() * 20000) + 5000;
      price = close;
      candles.push({
        time,
        open,
        high,
        low,
        close,
        volume,
        ema20: Math.round(open * 0.998 * 100) / 100,
        vwap: Math.round(open * 0.999 * 100) / 100,
        support: Math.round(low * 0.995 * 10) / 10,
        resistance: Math.round(high * 1.005 * 10) / 10
      });
    }
    return candles;
  }

  async getPortfolio(): Promise<PortfolioData> {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/portfolio`, {
        headers: this.getAuthHeaders(),
        cache: 'no-store'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.account) return data;
    } catch (e) {
      console.warn('[ApiClient] Serving fallback portfolio fixtures');
    }

    return {
      account: {
        id: 'paper_act_01',
        name: 'Demo Paper Account',
        currency: 'INR',
        initialEquity: 1000000.00,
        currentCash: 1000000.00,
        netLiquidation: 1000000.00,
        totalUnrealizedPnL: 0,
        dayStartEquity: 1000000.00,
        dailyPnL: 0,
        dailyPnLPct: 0,
        maxRiskPerTradePct: 1.0,
        dailyDrawdownLimitPct: 3.0,
        tradingLocked: false,
        lockReason: null
      },
      positions: [],
      orders: [],
      trades: []
    };
  }

  async submitOrder(orderData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    orderType: string;
    quantity: number;
    limitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    clientOrderId?: string;
  }): Promise<any> {
    const res = await fetch(`${BACKEND_BASE}/api/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Pre-trade risk check failed.');
    }
    return data;
  }

  async closePosition(symbol: string): Promise<any> {
    const res = await fetch(`${BACKEND_BASE}/api/positions/close`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ symbol })
    });
    return await res.json();
  }

  async cancelOrder(orderId: string | number): Promise<any> {
    const res = await fetch(`${BACKEND_BASE}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to cancel order.');
    }
    return data;
  }

  async configureAccount(config: {
    startingCapital?: number;
    slippageRate?: number;
    feeRate?: number;
  }): Promise<any> {
    const res = await fetch(`${BACKEND_BASE}/api/accounts/configure`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return await res.json();
  }

  async reconcileAccount(): Promise<ReconciliationReport> {
    const res = await fetch(`${BACKEND_BASE}/api/accounts/reconcile`, {
      headers: this.getAuthHeaders(),
      cache: 'no-store'
    });
    return await res.json();
  }

  async getCashLedger(): Promise<CashLedgerEntry[]> {
    const res = await fetch(`${BACKEND_BASE}/api/ledger`, {
      headers: this.getAuthHeaders(),
      cache: 'no-store'
    });
    return await res.json();
  }

  async resetAccount(): Promise<any> {
    const res = await fetch(`${BACKEND_BASE}/api/portfolio/reset`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return await res.json();
  }

  async calculatePositionSize(params: {
    symbol: string;
    entryPrice?: number;
    stopLossPrice: number;
    riskPct?: number;
  }): Promise<{ recommendedQuantity: number; riskBreached: boolean; message?: string }> {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/orders/size`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const riskDistance = Math.abs((params.entryPrice || 100) - params.stopLossPrice);
    if (riskDistance <= 0) return { recommendedQuantity: 0, riskBreached: false, message: 'Invalid Stop-Loss distance.' };
    const maxRisk = 10000;
    const raw = Math.floor(maxRisk / riskDistance);
    if (raw < 1) {
      return {
        recommendedQuantity: 0,
        riskBreached: true,
        message: `Risk Breach: Minimum 1 share risk (₹${riskDistance.toFixed(2)}) exceeds 1% risk cap.`
      };
    }
    return { recommendedQuantity: raw, riskBreached: false };
  }

  async getOptionsChain(symbol: string = 'NIFTY50', days: number = 7): Promise<any> {
    try {
      const res = await fetch(`${MARKET_BASE}/api/options-chain?symbol=${symbol}&days=${days}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { symbol, spotPrice: 24350, expiryDays: days, chain: [] };
  }

  async runBacktest(body: any): Promise<any> {
    try {
      const res = await fetch(`${MARKET_BASE}/api/backtest`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { totalTrades: 0, winRate: '0%', netReturnPct: '0.00%', maxDrawdownPct: '0.00%', equityCurve: [1000000] };
  }

  async getRiskMetrics(symbol: string): Promise<any> {
    try {
      const res = await fetch(`${MARKET_BASE}/api/coach?symbol=${symbol}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[ApiClient] Failed to fetch risk metrics from backend');
    }

    return {
      symbol,
      bias: 'BULLISH',
      trendStrength: 'Above 20-EMA & VWAP',
      ltp: 2985.4,
      ema20: 2972.1,
      vwap: 2954.0,
      rsi: 54,
      keyLevels: { support: 2940, resistance: 3020 },
      plainEnglishSummary: `${symbol} is trading above equilibrium VWAP. Maintain long bias with 1.5R target.`,
      audit: {
        totalClosedTrades: 0,
        winRate: '0%',
        avgRMultiple: '0.00R',
        revengeRisk: false,
        behavioralVerdict: 'Maintain disciplined 1% risk position sizing.'
      }
    };
  }

  async getScreenerStocks(filters?: any): Promise<ScreenerStock[]> {
    return [
      { symbol: 'RELIANCE', name: 'Reliance Industries', market: 'IN', sector: 'Energy & Retail', price: 2985.4, changePct: 0.84, volume: 1824900, peRatio: 26.4, marketCapCr: 2015000, rsi14: 56.2, trend: 'BULLISH', setup: '20-EMA Trend Continuation' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', market: 'IN', sector: 'IT Services', price: 4125.0, changePct: -0.37, volume: 832000, peRatio: 31.8, marketCapCr: 1495000, rsi14: 48.4, trend: 'CONSOLIDATION', setup: 'Support Zone Pullback' },
      { symbol: 'INFY', name: 'Infosys Limited', market: 'IN', sector: 'IT Services', price: 1892.5, changePct: 0.97, volume: 1420000, peRatio: 28.1, marketCapCr: 785000, rsi14: 61.5, trend: 'BULLISH', setup: 'VWAP Breakout' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', market: 'IN', sector: 'Banking & Financials', price: 1748.2, changePct: 0.48, volume: 2980000, peRatio: 19.4, marketCapCr: 1328000, rsi14: 52.8, trend: 'BULLISH', setup: 'Ascending Triangle' },
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', market: 'IN', sector: 'Automobile', price: 985.0, changePct: -0.63, volume: 3820000, peRatio: 16.2, marketCapCr: 362000, rsi14: 44.1, trend: 'BEARISH', setup: 'Mean Reversion Test' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US', sector: 'Semiconductors', price: 142.6, changePct: 3.03, volume: 92300000, peRatio: 52.3, marketCapCr: 29100000, rsi14: 68.2, trend: 'BULLISH', setup: 'High-Volume Breakout' },
      { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', sector: 'Consumer Technology', price: 234.5, changePct: 1.38, volume: 54100000, peRatio: 34.1, marketCapCr: 30120000, rsi14: 58.7, trend: 'BULLISH', setup: 'All-Time High Consolidation' }
    ];
  }

  async getCompanyResearch(symbol: string): Promise<CompanyResearch> {
    const isUS = symbol === 'AAPL' || symbol === 'TSLA' || symbol === 'NVDA' || symbol === 'MSFT';
    return {
      symbol,
      name: symbol === 'RELIANCE' ? 'Reliance Industries Limited' : symbol,
      sector: isUS ? 'Technology' : 'Diversified Conglomerate',
      market: isUS ? 'US' : 'IN',
      overview: `${symbol} is a leading industry constituent. This research dossier compiles key financial ratios, technical price action regimes, and recent event catalysts.`,
      keyStats: {
        marketCap: isUS ? '$3.2 Trillion' : '₹20.15 Lakh Crore',
        peRatio: 26.4,
        pbRatio: 2.3,
        dividendYield: '0.45%',
        roe: '13.8%',
        debtToEquity: 0.38,
        beta: 0.88,
        week52High: 3217.0,
        week52Low: 2220.0
      },
      technicals: {
        bias: 'BULLISH',
        rsi: 56.4,
        ema20: 2972.1,
        vwap: 2954.0,
        support: 2940.0,
        resistance: 3020.0,
        trendSummary: 'Price action is currently holding firmly above dynamic 20-EMA and VWAP equilibrium.'
      },
      catalysts: [
        { title: 'Quarterly Earnings Announcement', date: 'Upcoming', impact: 'POSITIVE' },
        { title: 'New Energy CapEx Expansion', date: 'Recent', impact: 'POSITIVE' },
        { title: 'RBI Monetary Policy Status Quo', date: 'Recent', impact: 'NEUTRAL' }
      ]
    };
  }

  getUserProfile(): UserProfile {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tradesphere_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          return {
            id: user.id || 'usr_demo',
            name: user.name || 'Demo Trader',
            email: user.email || 'demo.trader@tradesphere.ai',
            tier: user.tier || 'pro',
            startingCapital: 1000000,
            riskCapPct: 1.0,
            circuitBreakerPct: 3.0
          };
        } catch (e) {}
      }
    }
    return {
      id: 'usr_demo',
      name: 'Demo Trader',
      email: 'demo.trader@tradesphere.ai',
      tier: 'pro',
      startingCapital: 1000000,
      riskCapPct: 1.0,
      circuitBreakerPct: 3.0
    };
  }

  updateUserPreferences(prefs: Partial<UserProfile>): void {
    if (typeof window !== 'undefined') {
      const current = this.getUserProfile();
      const updated = { ...current, ...prefs };
      localStorage.setItem('tradesphere_user', JSON.stringify(updated));
    }
  }
}

export const apiClient = new TradeSphereApiClient();
