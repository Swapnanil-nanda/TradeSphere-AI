'use client';

import React from 'react';
import { Candle, Ticker } from '../../lib/api-client';
import { CandleWithIndicators, TechnicalIndicatorsSeries, MetadataLabel, StockDetails } from '../../lib/market-data/types';
import { computeAllIndicators } from '../../lib/indicators/technical-indicators';
import TradingViewChart, { generateFallback120Candles } from '../charts/TradingViewChart';

interface PriceChartProps {
  symbol: string;
  ticker?: Ticker;
  candles: Candle[];
  timeframe?: string;
  setTimeframe?: (tf: string) => void;
  showIndicators?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  height?: number;
}

export default function PriceChart({
  symbol,
  ticker,
  candles,
  timeframe = '5m',
  setTimeframe,
  showIndicators = true,
  isLoading = false,
  error = null,
  onRetry,
  height = 540
}: PriceChartProps) {
  // Ensure guaranteed 120-bar candle set on frame 0
  const effectiveCandles: Candle[] = (Array.isArray(candles) && candles.length > 0)
    ? candles
    : (generateFallback120Candles(symbol, timeframe) as any as Candle[]);

  // Map candles to OHLCV for technical indicators
  const ohlcvCandles = effectiveCandles.map((c) => ({
    time: c.time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume
  }));

  // Compute all 8 indicators
  const indicators: TechnicalIndicatorsSeries = computeAllIndicators(ohlcvCandles);

  const candleWithIndicators: CandleWithIndicators[] = effectiveCandles.map((c) => ({
    ...c,
    support: c.support,
    resistance: c.resistance
  }));

  const stockDetails: StockDetails = {
    symbol,
    name: ticker?.name || `${symbol} Equity`,
    exchange: (ticker?.exchange as any) || (symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'NVDA' ? 'NASDAQ' : 'NSE'),
    market: ticker?.market || (symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'NVDA' ? 'US' : 'IN'),
    currency: (ticker?.currency as 'INR' | 'USD') || (symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'NVDA' ? 'USD' : 'INR'),
    sector: 'Technology & Industrials',
    lotSize: 1,
    tickSize: 0.05,
    basePrice: ticker?.ltp || 1000,
    ltp: ticker?.ltp || 1000,
    open: effectiveCandles.length > 0 ? effectiveCandles[0].open : 1000,
    high: ticker?.dayHigh || 1020,
    low: ticker?.dayLow || 980,
    close: ticker?.ltp || 1000,
    prevClose: (ticker?.ltp || 1000) - (ticker?.change || 0),
    change: ticker?.change || 0,
    changePct: ticker?.changePct || 0,
    volume: ticker?.volume || 1000000,
    avgVolume: 1500000,
    marketCapCr: 500000,
    peRatio: 24.5,
    pbRatio: 3.8,
    dividendYield: 1.4,
    high52w: (ticker?.ltp || 1000) * 1.25,
    low52w: (ticker?.ltp || 1000) * 0.8,
    beta: 1.05,
    upperCircuit: (ticker?.ltp || 1000) * 1.10,
    lowerCircuit: (ticker?.ltp || 1000) * 0.90,
    metadata: {
      source: 'TradeSphere Synthetic GBM Engine',
      dataType: 'SIMULATED',
      timestamp: Date.now(),
      dataFreshness: 'Real-time Synthetic Tick (<50ms)',
      isSimulated: true
    }
  };

  const metadata: MetadataLabel = {
    source: 'TradeSphere Synthetic GBM Engine',
    dataType: 'SIMULATED',
    timestamp: Date.now(),
    dataFreshness: 'Real-time Synthetic Tick (<50ms)',
    isSimulated: true
  };

  return (
    <TradingViewChart
      symbol={symbol}
      stockDetails={stockDetails}
      candles={candleWithIndicators}
      indicators={indicators}
      metadata={metadata}
      timeframe={timeframe}
      onTimeframeChange={setTimeframe || (() => {})}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      height={height}
    />
  );
}
