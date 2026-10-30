/**
 * TradeSphere AI — Market Data Provider Interface & Types
 * All financial data structures enforce explicit simulation metadata labeling.
 */

export type MarketRegion = 'IN' | 'US';
export type ExchangeCode = 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';

export interface MetadataLabel {
  source: string;              // e.g. "TradeSphere Synthetic GBM Engine"
  dataType: 'SIMULATED' | 'REAL_TIME';
  timestamp: number;           // Epoch in milliseconds
  dataFreshness: string;       // e.g. "Real-time Synthetic Tick (<50ms)"
  isSimulated: boolean;        // Invariant: always true for synthetic data
}

export interface Instrument {
  symbol: string;
  name: string;
  exchange: ExchangeCode;
  market: MarketRegion;
  currency: 'INR' | 'USD';
  sector: string;
  industry?: string;
  lotSize: number;
  tickSize: number;
  basePrice: number;
}

export interface StockDetails extends Instrument {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number;
  change: number;
  changePct: number;
  volume: number;
  avgVolume: number;
  marketCapCr: number;         // Crores (INR) or Millions (USD)
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  high52w: number;
  low52w: number;
  beta: number;
  upperCircuit: number;
  lowerCircuit: number;
  metadata: MetadataLabel;
}

export interface OHLCV {
  time: number;                // Epoch in seconds (UTC)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorPoint {
  time: number;
  value?: number;
  [key: string]: number | undefined;
}

export interface MacdPoint {
  time: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

export interface BollingerBandsPoint {
  time: number;
  upper?: number;
  middle?: number;
  lower?: number;
  percentB?: number;
}

export interface SupertrendPoint {
  time: number;
  supertrend?: number;
  direction: 1 | -1;          // 1 = Bullish (Green), -1 = Bearish (Red)
  upperBand?: number;
  lowerBand?: number;
}

export interface TechnicalIndicatorsSeries {
  sma20: IndicatorPoint[];
  sma50: IndicatorPoint[];
  sma200: IndicatorPoint[];
  ema9: IndicatorPoint[];
  ema20: IndicatorPoint[];
  ema50: IndicatorPoint[];
  rsi14: IndicatorPoint[];
  macd: MacdPoint[];
  bollingerBands: BollingerBandsPoint[];
  atr14: IndicatorPoint[];
  vwap: IndicatorPoint[];
  supertrend: SupertrendPoint[];
}

export interface CandleWithIndicators extends OHLCV {
  sma20?: number;
  ema20?: number;
  rsi14?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  atr14?: number;
  vwap?: number;
  supertrend?: number;
  supertrendDirection?: 1 | -1;
  support?: number;
  resistance?: number;
}

export interface MarketIndexSummary {
  symbol: string;
  name: string;
  exchange: string;
  market: MarketRegion;
  value: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  metadata: MetadataLabel;
}

export interface MarketOverview {
  indices: MarketIndexSummary[];
  topGainers: StockDetails[];
  topLosers: StockDetails[];
  marketBreadth: {
    advances: number;
    declines: number;
    unchanged: number;
    advanceDeclineRatio: number;
  };
  sectorPerformance: {
    sector: string;
    changePct: number;
    market: MarketRegion;
  }[];
  metadata: MetadataLabel;
}

export interface WatchlistSummary {
  id: string;
  name: string;
  isDefault: boolean;
  itemCount: number;
  items: StockDetails[];
  metadata: MetadataLabel;
}

/**
 * Pluggable Market Data Provider Contract
 */
export interface MarketDataProvider {
  readonly providerId: string;
  readonly isSynthetic: boolean;

  searchInstruments(query: string): Promise<Instrument[]>;
  getStockDetails(symbol: string): Promise<StockDetails>;
  getCandles(symbol: string, timeframe: string, count?: number): Promise<{
    candles: CandleWithIndicators[];
    indicators: TechnicalIndicatorsSeries;
    metadata: MetadataLabel;
  }>;
  getMarketOverview(): Promise<MarketOverview>;
  getWatchlists(userId?: string): Promise<WatchlistSummary[]>;
  calculateIndicators(candles: OHLCV[]): TechnicalIndicatorsSeries;
}
