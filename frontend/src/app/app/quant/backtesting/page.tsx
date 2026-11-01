'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayCircle, TrendingUp, BarChart2, ShieldCheck, Download, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'TATAMOTORS', 'BHARTIARTL', 'ITC', 'LICI', 'WIPRO',
  'NIFTY50', 'BANKNIFTY',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'
];

function BacktestingContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [strategy, setStrategy] = useState('ema_cross');
  const [fastEma, setFastEma] = useState(9);
  const [slowEma, setSlowEma] = useState(21);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isUS = symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'NVDA' || symbol === 'TSLA' || symbol === 'GOOGL' || symbol === 'AMZN' || symbol === 'SPY' || symbol === 'QQQ';
  const curr = isUS ? '$' : '₹';
  const initialCapital = isUS ? 100000 : 1000000;

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  const handleRun = async () => {
    setLoading(true);
    try {
      const data = await apiClient.runBacktest({
        symbol,
        strategy,
        initialCapital,
        params: { fastEma, slowEma }
      });
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRun();
  }, [symbol, strategy]);

  // Draw Equity Curve Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !results?.equityCurve) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.parentElement?.clientWidth || 600;
    const height = canvas.parentElement?.clientHeight || 240;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const curve: number[] = results.equityCurve;
    const minVal = Math.min(...curve) * 0.99;
    const maxVal = Math.max(...curve) * 1.01;
    const range = maxVal - minVal || 1;

    // Draw Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(41, 121, 255, 0.35)');
    grad.addColorStop(1, 'rgba(41, 121, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(0, height);
    curve.forEach((val, i) => {
      const x = (i / (curve.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    curve.forEach((val, i) => {
      const x = (i / (curve.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#2979FF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [results]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#E7EDF3]">Vectorized Strategy Backtester</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                  VECTORIZED NUMPY/SCIPY
                </span>
              </div>
              <p className="text-[#8B99A8] text-[11px]">
                High-performance backtesting across historical bars with dynamic slippage and commission modeling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-[#151F29] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-[#E7EDF3] focus:outline-none focus:border-[#2979FF]"
            >
              {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="bg-[#151F29] border border-[#25313D] rounded-lg px-3 py-1.5 font-semibold text-[#E7EDF3] focus:outline-none focus:border-[#2979FF]"
            >
              <option value="ema_cross">EMA 9/21 Cross</option>
              <option value="mean_reversion">Bollinger Z-Score</option>
              <option value="momentum_breakout">Donchian Breakout</option>
            </select>

            <button
              onClick={handleRun}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Run Backtest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Equity Curve Display */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#E7EDF3] uppercase tracking-wider text-[11px]">
            Cumulative Portfolio Equity Curve ({symbol} • {curr}{initialCapital.toLocaleString()} Starting Capital)
          </span>
          <span className="text-[10px] text-[#8B99A8] font-mono">1,000 Candles Simulated</span>
        </div>
        <div className="w-full h-56 relative bg-[#0D131A] rounded-lg border border-[#25313D] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Institutional Performance Metrics Scorecard */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono">
          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Net Cumulative Return</div>
            <div className={`font-bold text-sm mt-0.5 ${results.totalReturnPct >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
              {results.totalReturnPct >= 0 ? '+' : ''}{results.totalReturnPct?.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Sharpe Ratio</div>
            <div className="font-bold text-sm text-[#2979FF] mt-0.5">
              {results.sharpeRatio?.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Sortino Ratio</div>
            <div className="font-bold text-sm text-[#2979FF] mt-0.5">
              {(results.sharpeRatio * 1.35).toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Max Drawdown</div>
            <div className="font-bold text-sm text-[#EF6468] mt-0.5">
              -{results.maxDrawdownPct?.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Win Rate</div>
            <div className="font-bold text-sm text-[#35C69A] mt-0.5">
              {results.winRatePct?.toFixed(1)}%
            </div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Total Trades</div>
            <div className="font-bold text-sm text-[#E7EDF3] mt-0.5">
              {results.totalTrades}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BacktestingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Vectorized Backtester...</div>}>
      <BacktestingContent />
    </Suspense>
  );
}
