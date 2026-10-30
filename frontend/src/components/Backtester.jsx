import React, { useState, useRef, useEffect } from 'react';
import { Play, TrendingUp, AlertTriangle, Award, Activity } from 'lucide-react';
import { apiClient } from '../lib/api-client';

export default function Backtester({ symbol }) {
  const [strategy, setStrategy] = useState('ema_cross');
  const [fastEma, setFastEma] = useState(9);
  const [slowEma, setSlowEma] = useState(21);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const canvasRef = useRef(null);

  const handleRun = async () => {
    setLoading(true);
    try {
      const data = await apiClient.runBacktest({
        symbol,
        strategy,
        initialCapital: 1000000,
        params: { fastEma: parseInt(fastEma, 10), slowEma: parseInt(slowEma, 10) }
      });
      setResults(data);
    } catch (e) {
      console.error('[Backtest] Execution failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRun();
  }, [symbol]);

  // Draw Equity Curve Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !results?.equityCurve) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    const isDark = document.documentElement.classList.contains('dark');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const curve = results.equityCurve;
    const minVal = Math.min(...curve) * 0.99;
    const maxVal = Math.max(...curve) * 1.01;
    const range = maxVal - minVal || 1;

    // Draw Gradient Background under Equity Curve
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
    <div className="h-full flex flex-col bg-white dark:bg-[#0b101c] text-xs select-none p-3 space-y-3 transition-colors overflow-y-auto custom-scrollbar">
      {/* Parameter Controls */}
      <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-lg border border-slate-200 dark:border-[#1b253b] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">Vectorized Backtester</span>
          <span className="text-[10px] text-slate-500 font-mono">1,000 Candles</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Fast EMA</label>
            <input
              type="number"
              value={fastEma}
              onChange={e => setFastEma(e.target.value)}
              className="w-full bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded px-2 py-1 text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Slow EMA</label>
            <input
              type="number"
              value={slowEma}
              onChange={e => setSlowEma(e.target.value)}
              className="w-full bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded px-2 py-1 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{loading ? 'Simulating Trades...' : 'Run Simulation'}</span>
        </button>
      </div>

      {/* Equity Curve Canvas */}
      <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-lg border border-slate-200 dark:border-[#1b253b] space-y-2">
        <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Simulated Equity Curve</div>
        <div className="w-full h-32 relative">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Performance Metrics Cards */}
      {results && (
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg">
            <div className="text-[10px] text-slate-500 font-sans">Net Cumulative Return</div>
            <div className={`font-bold text-sm ${results.totalReturnPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {results.totalReturnPct >= 0 ? '+' : ''}{results.totalReturnPct?.toFixed(2)}%
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg">
            <div className="text-[10px] text-slate-500 font-sans">Win Rate</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {results.winRatePct?.toFixed(1)}% ({results.totalTrades} Trades)
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg">
            <div className="text-[10px] text-slate-500 font-sans">Sharpe Ratio</div>
            <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
              {results.sharpeRatio?.toFixed(2)}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg">
            <div className="text-[10px] text-slate-500 font-sans">Max Drawdown</div>
            <div className="font-bold text-sm text-rose-600 dark:text-rose-400">
              -{results.maxDrawdownPct?.toFixed(2)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
