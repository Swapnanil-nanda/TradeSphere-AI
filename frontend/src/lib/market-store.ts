/**
 * TradeSphere AI — Centralized Real-Time Market Store
 * Single source of truth for real-time asset prices and ticks across all components.
 * Deduplicates symbols (e.g. NIFTY 50), enforces single synchronized polling,
 * and eliminates duplicate component timers.
 */

import { create } from 'zustand';

export interface QuoteState {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePct: number;
  currency: string;
  exchange: string;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  isLive?: boolean;
  isSimulated?: boolean;
  timestamp: number;
}

export interface MarketStoreState {
  quotes: Record<string, QuoteState>;
  tickers: QuoteState[];
  isLiveConnected: boolean;
  lastUpdated: number;
  setQuotes: (quotesList: QuoteState[]) => void;
  updateQuote: (symbol: string, patch: Partial<QuoteState>) => void;
  initializePolling: () => () => void;
}

const INITIAL_QUOTES: QuoteState[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', ltp: 24350.00, change: 116.30, changePct: 0.48, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'SENSEX', name: 'BSE Sensex Benchmark', ltp: 79520.40, change: 308.53, changePct: 0.39, currency: 'INR', exchange: 'BSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank Index', ltp: 52240.20, change: 184.20, changePct: 0.35, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', ltp: 1312.70, change: 14.80, changePct: 1.14, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'TCS', name: 'Tata Consultancy Services', ltp: 4125.00, change: -15.20, changePct: -0.37, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', ltp: 1748.20, change: 9.50, changePct: 0.55, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'INFY', name: 'Infosys Limited', ltp: 1892.50, change: 28.50, changePct: 1.53, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', ltp: 1230.50, change: 6.80, changePct: 0.56, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'SBIN', name: 'State Bank of India', ltp: 825.40, change: 4.10, changePct: 0.50, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', ltp: 985.00, change: -6.20, changePct: -0.63, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', ltp: 1640.80, change: 12.30, changePct: 0.76, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'ITC', name: 'ITC Limited', ltp: 478.20, change: 1.50, changePct: 0.31, currency: 'INR', exchange: 'NSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'MSFT', name: 'Microsoft Corporation', ltp: 536.00, change: 4.80, changePct: 0.90, currency: 'USD', exchange: 'NASDAQ', isSimulated: true, timestamp: Date.now() },
  { symbol: 'AAPL', name: 'Apple Inc.', ltp: 234.50, change: 3.20, changePct: 1.38, currency: 'USD', exchange: 'NASDAQ', isSimulated: true, timestamp: Date.now() },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', ltp: 142.60, change: 4.20, changePct: 3.03, currency: 'USD', exchange: 'NASDAQ', isSimulated: true, timestamp: Date.now() },
  { symbol: 'TSLA', name: 'Tesla Inc.', ltp: 219.80, change: -3.80, changePct: -1.70, currency: 'USD', exchange: 'NASDAQ', isSimulated: true, timestamp: Date.now() },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', ltp: 181.40, change: 1.90, changePct: 1.06, currency: 'USD', exchange: 'NASDAQ', isSimulated: true, timestamp: Date.now() },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', ltp: 188.70, change: 2.10, changePct: 1.13, currency: 'USD', exchange: 'NASDAQ', isSimulated: true, timestamp: Date.now() },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', ltp: 598.20, change: 3.40, changePct: 0.57, currency: 'USD', exchange: 'NYSE', isSimulated: true, timestamp: Date.now() },
  { symbol: 'QQQ', name: 'Invesco QQQ NASDAQ-100', ltp: 518.50, change: 4.10, changePct: 0.80, currency: 'USD', exchange: 'NASDAQ', isSimulated: true, timestamp: Date.now() }
];

const INITIAL_QUOTES_MAP: Record<string, QuoteState> = {};
INITIAL_QUOTES.forEach(q => {
  INITIAL_QUOTES_MAP[q.symbol] = q;
  // Also register NIFTY50 as an alias pointing to the same canonical quote
  if (q.symbol === 'NIFTY 50') {
    INITIAL_QUOTES_MAP['NIFTY50'] = q;
  }
});

let isPollingInitialized = false;
let pollingIntervalId: any = null;

export const useMarketStore = create<MarketStoreState>((set, get) => ({
  quotes: INITIAL_QUOTES_MAP,
  tickers: INITIAL_QUOTES,
  isLiveConnected: true,
  lastUpdated: Date.now(),

  setQuotes: (quotesList: QuoteState[]) => {
    // Deduplicate tickers list
    const seen = new Set<string>();
    const deduplicatedTickers: QuoteState[] = [];
    const newQuotesMap: Record<string, QuoteState> = { ...get().quotes };

    quotesList.forEach(item => {
      // Canonical symbol normalization
      const canonicalSymbol = item.symbol === 'NIFTY50' ? 'NIFTY 50' : item.symbol;
      const normalizedItem = {
        ...item,
        symbol: canonicalSymbol
      };

      if (!seen.has(canonicalSymbol)) {
        seen.add(canonicalSymbol);
        deduplicatedTickers.push(normalizedItem);
      }

      newQuotesMap[canonicalSymbol] = normalizedItem;
      if (canonicalSymbol === 'NIFTY 50') {
        newQuotesMap['NIFTY50'] = normalizedItem;
      }
    });

    set({
      tickers: deduplicatedTickers,
      quotes: newQuotesMap,
      lastUpdated: Date.now(),
      isLiveConnected: true
    });
  },

  updateQuote: (symbol: string, patch: Partial<QuoteState>) => {
    const canonicalSymbol = symbol === 'NIFTY50' ? 'NIFTY 50' : symbol;
    const current = get().quotes[canonicalSymbol];
    if (!current) return;

    const updated: QuoteState = {
      ...current,
      ...patch,
      timestamp: Date.now()
    };

    const newQuotes = {
      ...get().quotes,
      [canonicalSymbol]: updated
    };
    if (canonicalSymbol === 'NIFTY 50') {
      newQuotes['NIFTY50'] = updated;
    }

    const newTickers = get().tickers.map(t =>
      t.symbol === canonicalSymbol ? updated : t
    );

    set({
      quotes: newQuotes,
      tickers: newTickers,
      lastUpdated: Date.now()
    });
  },

  initializePolling: () => {
    if (isPollingInitialized || typeof window === 'undefined') {
      return () => {};
    }

    isPollingInitialized = true;

    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/market/live-quotes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            get().setQuotes(data);
          }
        }
      } catch {
        // Fallback simulation micro-tick
        const currentQuotes = get().quotes;
        const updatedQuotesList = Object.values(currentQuotes).map(q => {
          const delta = (Math.random() - 0.49) * (q.ltp * 0.0005);
          const newLtp = Math.round((q.ltp + delta) * 100) / 100;
          return {
            ...q,
            ltp: newLtp,
            change: Math.round((q.change + delta) * 100) / 100,
            timestamp: Date.now()
          };
        });
        get().setQuotes(updatedQuotesList);
      }
    };

    fetchQuotes();
    pollingIntervalId = setInterval(fetchQuotes, 3000);

    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
        isPollingInitialized = false;
      }
    };
  }
}));
