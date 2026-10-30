import React, { useState, useRef, useEffect } from 'react';
import { Play, TrendingUp, AlertTriangle, Award, Activity } from 'lucide-react';

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
      const res = await fetch('http://localhost:8000/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          strategy,
          initialCapital: 1000000,
          params: { fastEma: parseInt(fastEma, 10), slowEma: parseInt(slowEma, 10) }
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
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
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

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

    // Draw Equity Line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    curve.forEach((val, i) => {
      const x = (i / (curve.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [results]);

  return (
    <div className="h-full flex flex-col bg-[#0b101c] text-xs select-none">
      {/* Strategy Selector Header */}
      <div className="p-3 border-b border-[#1b253b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Strategy Backtester</span>

          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value)}
            className="bg-[#070b14] border border-[#1b253b] rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="ema_cross">EMA 9/21 Crossover</option>
            <option value="rsi_mean_reversion">RSI(14) Mean Reversion</option>
            <option value="vwap_breakout">VWAP Volume Breakout</option>
          </select>
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/20"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{loading ? 'Simulating...' : 'Run Backtest'}</span>
        </button>
      </div>

      {/* Main Backtest View */}
      <div className="flex-1 flex flex-col md:flex-row p-3 gap-3 overflow-hidden">
        {/* Performance Scorecard */}
        <div className="w-full md:w-72 grid grid-cols-2 gap-2 text-[11px] font-['JetBrains_Mono']">
          <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b]">
            <div className="text-[10px] text-slate-400 font-sans uppercase">Net Return</div>
            <div className={`text-base font-bold ${results?.netReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {results?.netReturnPct >= 0 ? '+' : ''}{results?.netReturnPct}%
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b]">
            <div className="text-[10px] text-slate-400 font-sans uppercase">Win Rate</div>
            <div className="text-base font-bold text-white">{results?.winRatePct}%</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b]">
            <div className="text-[10px] text-slate-400 font-sans uppercase">Sharpe Ratio</div>
            <div className="text-base font-bold text-cyan-400">{results?.sharpeRatio}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b]">
            <div className="text-[10px] text-slate-400 font-sans uppercase">Sortino Ratio</div>
            <div className="text-base font-bold text-emerald-400">{results?.sortinoRatio}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b]">
            <div className="text-[10px] text-slate-400 font-sans uppercase">Max Drawdown</div>
            <div className="text-base font-bold text-rose-400">-{results?.maxDrawdownPct}%</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b]">
            <div className="text-[10px] text-slate-400 font-sans uppercase">Total Trades</div>
            <div className="text-base font-bold text-slate-200">{results?.totalTrades}</div>
          </div>
        </div>

        {/* Equity Curve Visualizer Canvas */}
        <div className="flex-1 flex flex-col bg-[#070b14] border border-[#1b253b] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
            <span>Portfolio Equity Curve (Simulated)</span>
            <span className="text-blue-400 font-['JetBrains_Mono']">
              Final: ₹{results?.finalEquity?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex-1 relative w-full h-full min-h-[140px]">
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
