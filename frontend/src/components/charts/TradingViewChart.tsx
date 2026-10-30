'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  UTCTimestamp
} from 'lightweight-charts';
import {
  CandleWithIndicators,
  TechnicalIndicatorsSeries,
  MetadataLabel,
  StockDetails
} from '../../lib/market-data/types';
import {
  Activity,
  Layers,
  Clock,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  Maximize2
} from 'lucide-react';

export interface TradingViewChartProps {
  symbol: string;
  stockDetails?: StockDetails;
  candles: CandleWithIndicators[];
  indicators?: TechnicalIndicatorsSeries;
  metadata?: MetadataLabel;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  height?: number;
}

export default function TradingViewChart({
  symbol,
  stockDetails,
  candles,
  indicators,
  metadata,
  timeframe,
  onTimeframeChange,
  isLoading = false,
  error = null,
  onRetry,
  className = '',
  height = 560
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick', UTCTimestamp> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram', UTCTimestamp> | null>(null);

  // Indicator series refs
  const sma20SeriesRef = useRef<ISeriesApi<'Line', UTCTimestamp> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line', UTCTimestamp> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<'Line', UTCTimestamp> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<'Line', UTCTimestamp> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line', UTCTimestamp> | null>(null);
  const supertrendSeriesRef = useRef<ISeriesApi<'Line', UTCTimestamp> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line', UTCTimestamp> | null>(null);

  // Indicator toggle state
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showSupertrend, setShowSupertrend] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  // Crosshair / Hover state
  const [legendInfo, setLegendInfo] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    change?: number;
    changePct?: number;
    time?: string;
  } | null>(null);

  const timeframes = ['1m', '5m', '15m', '1h', '1D'];

  // Initialize and clean up chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#070b14' },
        textColor: '#94a3b8',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 11
      },
      grid: {
        vertLines: { color: 'rgba(27, 37, 59, 0.45)' },
        horzLines: { color: 'rgba(27, 37, 59, 0.45)' }
      },
      crosshair: {
        mode: 1, // Magnet mode
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: '#1e293b'
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b'
        }
      },
      timeScale: {
        borderColor: '#1b253b',
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: '#1b253b',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25
        }
      }
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e'
    });
    candlestickSeriesRef.current = candleSeries;

    // 2. Volume Histogram Overlay
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume_scale'
    });
    chart.priceScale('volume_scale').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0.0
      }
    });
    volumeSeriesRef.current = volumeSeries;

    // 3. Technical Indicator Overlays
    const sma20 = chart.addSeries(LineSeries, {
      color: '#fbbf24', // Amber
      lineWidth: 1,
      title: 'SMA 20'
    });
    sma20SeriesRef.current = sma20;

    const ema20 = chart.addSeries(LineSeries, {
      color: '#3b82f6', // Blue
      lineWidth: 1.5,
      title: 'EMA 20'
    });
    ema20SeriesRef.current = ema20;

    const vwap = chart.addSeries(LineSeries, {
      color: '#a855f7', // Purple
      lineWidth: 1.5,
      title: 'VWAP'
    });
    vwapSeriesRef.current = vwap;

    const bbUpper = chart.addSeries(LineSeries, {
      color: '#06b6d4', // Cyan
      lineWidth: 1,
      lineStyle: 2,
      title: 'BB Upper'
    });
    bbUpperSeriesRef.current = bbUpper;

    const bbLower = chart.addSeries(LineSeries, {
      color: '#06b6d4', // Cyan
      lineWidth: 1,
      lineStyle: 2,
      title: 'BB Lower'
    });
    bbLowerSeriesRef.current = bbLower;

    const supertrend = chart.addSeries(LineSeries, {
      color: '#10b981', // Green
      lineWidth: 2,
      title: 'Supertrend'
    });
    supertrendSeriesRef.current = supertrend;

    // 4. RSI Sub-Pane
    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#ec4899', // Pink
      lineWidth: 1.5,
      title: 'RSI 14',
      priceScaleId: 'rsi_scale'
    }, 1);
    rsiSeriesRef.current = rsiSeries;

    // Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width, height: h } = entries[0].contentRect;
      chartRef.current.applyOptions({
        width: Math.max(300, width),
        height: Math.max(250, h || height)
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    // Crosshair move subscription for dynamic legend
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setLegendInfo(null);
        return;
      }

      const candleData = param.seriesData.get(candleSeries) as any;
      const volData = param.seriesData.get(volumeSeries) as any;

      if (candleData) {
        const chg = candleData.close - candleData.open;
        const chgPct = (chg / candleData.open) * 100;
        const timeStr = typeof param.time === 'number'
          ? new Date(param.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : String(param.time);

        setLegendInfo({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volData?.value,
          change: chg,
          changePct: chgPct,
          time: timeStr
        });
      }
    });

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  // Update Data onto Chart Series
  useEffect(() => {
    if (!candlestickSeriesRef.current || !candles || candles.length === 0) return;

    // Format Candlestick Data (UTC Seconds timestamp)
    const formattedCandles = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));
    candlestickSeriesRef.current.setData(formattedCandles);

    // Format Volume Data
    if (volumeSeriesRef.current) {
      const formattedVolume = candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'
      }));
      volumeSeriesRef.current.setData(formattedVolume);
    }

    // Update Indicator Series
    if (indicators) {
      if (sma20SeriesRef.current) {
        const smaData = showSMA
          ? indicators.sma20.filter(p => p.value !== undefined).map(p => ({ time: p.time as UTCTimestamp, value: p.value! }))
          : [];
        sma20SeriesRef.current.setData(smaData);
      }

      if (ema20SeriesRef.current) {
        const emaData = showEMA
          ? indicators.ema20.filter(p => p.value !== undefined).map(p => ({ time: p.time as UTCTimestamp, value: p.value! }))
          : [];
        ema20SeriesRef.current.setData(emaData);
      }

      if (vwapSeriesRef.current) {
        const vwapData = showVWAP
          ? indicators.vwap.filter(p => p.value !== undefined).map(p => ({ time: p.time as UTCTimestamp, value: p.value! }))
          : [];
        vwapSeriesRef.current.setData(vwapData);
      }

      if (bbUpperSeriesRef.current && bbLowerSeriesRef.current) {
        const bbUpperData = showBB
          ? indicators.bollingerBands.filter(p => p.upper !== undefined).map(p => ({ time: p.time as UTCTimestamp, value: p.upper! }))
          : [];
        const bbLowerData = showBB
          ? indicators.bollingerBands.filter(p => p.lower !== undefined).map(p => ({ time: p.time as UTCTimestamp, value: p.lower! }))
          : [];
        bbUpperSeriesRef.current.setData(bbUpperData);
        bbLowerSeriesRef.current.setData(bbLowerData);
      }

      if (supertrendSeriesRef.current) {
        const stData = showSupertrend
          ? indicators.supertrend.filter(p => p.supertrend !== undefined).map(p => ({
              time: p.time as UTCTimestamp,
              value: p.supertrend!,
              color: p.direction === 1 ? '#10b981' : '#f43f5e'
            }))
          : [];
        supertrendSeriesRef.current.setData(stData as any);
      }

      if (rsiSeriesRef.current) {
        const rsiData = showRSI
          ? indicators.rsi14.filter(p => p.value !== undefined).map(p => ({ time: p.time as UTCTimestamp, value: p.value! }))
          : [];
        rsiSeriesRef.current.setData(rsiData);
      }
    }

    // Scroll to end of data
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, indicators, showSMA, showEMA, showBB, showVWAP, showSupertrend, showRSI]);

  const currencySymbol = stockDetails?.currency === 'USD' ? '$' : '₹';
  const latestCandle = candles && candles.length > 0 ? candles[candles.length - 1] : null;

  return (
    <div className={`flex flex-col bg-[#070b14] border border-[#1b253b] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1b253b] px-4 py-3 bg-[#0c121f] gap-3">
        {/* Symbol & Price Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white font-mono tracking-tight">{symbol}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {stockDetails?.exchange || 'NSE'}
            </span>
          </div>

          {latestCandle && (
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-base font-bold text-white">
                {currencySymbol}{latestCandle.close.toFixed(2)}
              </span>
              <span className={`text-xs font-semibold flex items-center ${latestCandle.close >= latestCandle.open ? 'text-emerald-400' : 'text-rose-400'}`}>
                {latestCandle.close >= latestCandle.open ? '+' : ''}
                {(latestCandle.close - latestCandle.open).toFixed(2)} (
                {(((latestCandle.close - latestCandle.open) / latestCandle.open) * 100).toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center bg-[#070b14] border border-[#1b253b] rounded-xl p-1 gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#121c2e]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Technical Indicator Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
              showSMA
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'text-slate-500 border-transparent hover:border-[#1b253b]'
            }`}
          >
            SMA(20)
          </button>

          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
              showEMA
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                : 'text-slate-500 border-transparent hover:border-[#1b253b]'
            }`}
          >
            EMA(20)
          </button>

          <button
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
              showVWAP
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/40'
                : 'text-slate-500 border-transparent hover:border-[#1b253b]'
            }`}
          >
            VWAP
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
              showBB
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40'
                : 'text-slate-500 border-transparent hover:border-[#1b253b]'
            }`}
          >
            Bollinger
          </button>

          <button
            onClick={() => setShowSupertrend(!showSupertrend)}
            className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
              showSupertrend
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                : 'text-slate-500 border-transparent hover:border-[#1b253b]'
            }`}
          >
            Supertrend
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
              showRSI
                ? 'bg-pink-500/15 text-pink-400 border-pink-500/40'
                : 'text-slate-500 border-transparent hover:border-[#1b253b]'
            }`}
          >
            RSI(14)
          </button>
        </div>
      </div>

      {/* 2. Dynamic Crosshair Legend Bar */}
      <div className="bg-[#090e18] px-4 py-1.5 border-b border-[#141d30] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span>O: <strong className="text-white">{currencySymbol}{(legendInfo?.open ?? latestCandle?.open ?? 0).toFixed(2)}</strong></span>
          <span>H: <strong className="text-emerald-400">{currencySymbol}{(legendInfo?.high ?? latestCandle?.high ?? 0).toFixed(2)}</strong></span>
          <span>L: <strong className="text-rose-400">{currencySymbol}{(legendInfo?.low ?? latestCandle?.low ?? 0).toFixed(2)}</strong></span>
          <span>C: <strong className="text-white">{currencySymbol}{(legendInfo?.close ?? latestCandle?.close ?? 0).toFixed(2)}</strong></span>
          <span>Vol: <strong className="text-slate-200">{(legendInfo?.volume ?? latestCandle?.volume ?? 0).toLocaleString()}</strong></span>
          {legendInfo?.time && <span>Time: <span className="text-blue-400">{legendInfo.time}</span></span>}
        </div>

        {/* Quick Values for Active Overlays */}
        <div className="flex items-center gap-3 text-[10px]">
          {showEMA && latestCandle?.ema20 && (
            <span className="text-blue-400 font-semibold">EMA(20): {latestCandle.ema20.toFixed(2)}</span>
          )}
          {showVWAP && latestCandle?.vwap && (
            <span className="text-purple-400 font-semibold">VWAP: {latestCandle.vwap.toFixed(2)}</span>
          )}
          {latestCandle?.rsi14 && (
            <span className="text-pink-400 font-semibold">RSI(14): {latestCandle.rsi14.toFixed(1)}</span>
          )}
          {latestCandle?.atr14 && (
            <span className="text-amber-400 font-semibold">ATR(14): {latestCandle.atr14.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* 3. Main Chart Canvas Area */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b14]/80 backdrop-blur-sm">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300">Streaming technical market data...</p>
            <span className="text-xs text-slate-500 mt-1">Calculating 8 institutional indicators</span>
          </div>
        )}

        {/* Error Overlay */}
        {error && !isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b14]/90 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Chart Data Unavailable</h4>
            <p className="text-sm text-slate-400 max-w-md mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Feed
              </button>
            )}
          </div>
        )}

        {/* Empty State Overlay */}
        {!isLoading && !error && (!candles || candles.length === 0) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b14] p-6 text-center">
            <Info className="w-10 h-10 text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-slate-300 mb-1">No Candle Data Found</h4>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              No historical OHLCV candles found for {symbol} on {timeframe} timeframe.
            </p>
          </div>
        )}

        {/* TradingView Lightweight Charts DOM Node */}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* 4. Footer & Transparency Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#1b253b] px-4 py-2 bg-[#0c121f] text-[11px] text-slate-400 gap-3">
        {/* Attribution Requirement for TradingView Lightweight Charts */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Charts powered by</span>
          <a
            href="https://www.tradingview.com/lightweight-charts/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-blue-500/40 hover:decoration-blue-400 transition-colors"
          >
            TradingView Lightweight Charts™
          </a>
        </div>

        {/* Data Source & Freshness Metadata */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Source: <strong className="text-slate-300">{metadata?.source || 'TradeSphere Synthetic GBM Engine'}</strong></span>
          </span>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {metadata?.dataType || 'SIMULATED'}
          </span>

          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Freshness: <strong className="text-slate-300">{metadata?.dataFreshness || 'Real-time (<50ms)'}</strong></span>
          </span>

          {metadata?.timestamp && (
            <span className="text-slate-500">
              {new Date(metadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
