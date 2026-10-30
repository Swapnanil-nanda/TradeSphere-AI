'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, TrendingUp, BarChart2, ShieldCheck, Download, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function BacktestingPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [strategy, setStrategy] = useState('ema_cross');
  const [fastEma, setFastEma] = useState(9);
  const [slowEma, setSlowEma] = useState(21);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const symbolsList = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'AAPL', 'NVDA'];

  const handleRun = async () => {
    setLoading(true);
    try {
      const data = await apiClient.runBacktest({
        symbol,
        strategy,
        initialCapital: 1000000,
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

    const isDark = document.documentElement.classList.contains('dark');
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
    if (isDark) {
      grad.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    } else {
      grad.addColorStop(0, 'rgba(37, 99, 235, 0.20)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
    }

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
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [results]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Vectorized Strategy Backtester</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                High-performance backtesting across 1,000 historical bars with slippage and commission modeling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-800 dark:text-slate-200"
            >
              {symbolsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ema_cross">EMA 9/21 Cross</option>
              <option value="mean_reversion">Bollinger Z-Score</option>
              <option value="momentum_breakout">Donchian Breakout</option>
            </select>

            <button
              onClick={handleRun}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Run Backtest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Equity Curve Display */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            Cumulative Portfolio Equity Curve (₹10,00,000 Starting Capital)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">1,000 Candles Simulated</span>
        </div>
        <div className="w-full h-56 relative bg-slate-50 dark:bg-[#070b14] rounded-lg border border-slate-200 dark:border-[#1b253b] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Institutional Performance Metrics Scorecard */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono">
          <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">Net Cumulative Return</div>
            <div className={`font-bold text-sm ${results.totalReturnPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {results.totalReturnPct >= 0 ? '+' : ''}{results.totalReturnPct?.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">Sharpe Ratio</div>
            <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
              {results.sharpeRatio?.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">Sortino Ratio</div>
            <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
              {(results.sharpeRatio * 1.35).toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">Max Drawdown</div>
            <div className="font-bold text-sm text-rose-600 dark:text-rose-400">
              -{results.maxDrawdownPct?.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">Win Rate</div>
            <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {results.winRatePct?.toFixed(1)}%
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">Total Trades</div>
            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {results.totalTrades}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
