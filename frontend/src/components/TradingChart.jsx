import React, { useRef, useEffect, useState } from 'react';
import { Eye, TrendingUp, TrendingDown, Layers, BarChart2 } from 'lucide-react';

export default function TradingChart({ symbol, ticker, candles, timeframe, setTimeframe, mode }) {
  const canvasRef = useRef(null);
  const [crosshair, setCrosshair] = useState(null); // { x, y, candle }
  const [showEMA, setShowEMA] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showSR, setShowSR] = useState(true);

  const currencySymbol = ticker?.currency === 'USD' ? '$' : '₹';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    const isDark = document.documentElement.classList.contains('dark');

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Layout margins
    const margin = { top: 20, right: 65, bottom: 25, left: 10 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = (height - margin.top - margin.bottom) * 0.78; // top 78% price
    const volHeight = (height - margin.top - margin.bottom) * 0.20; // bottom 20% volume
    const volTop = margin.top + chartHeight + 10;

    ctx.clearRect(0, 0, width, height);

    // Calculate Price Min / Max
    const visibleCandles = candles.slice(-70);
    const minPrice = Math.min(...visibleCandles.map(c => c.low)) * 0.998;
    const maxPrice = Math.max(...visibleCandles.map(c => c.high)) * 1.002;
    const priceRange = maxPrice - minPrice || 1;

    // Calculate Volume Max
    const maxVol = Math.max(...visibleCandles.map(c => c.volume)) * 1.2 || 1;

    // Coordinate converters
    const getX = (index) => margin.left + (index + 0.5) * (chartWidth / visibleCandles.length);
    const getY = (price) => margin.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    const getVolY = (vol) => volTop + volHeight - (vol / maxVol) * volHeight;

    // Draw Grid Lines
    ctx.strokeStyle = isDark ? '#151d2f' : '#f1f5f9';
    ctx.lineWidth = 1;

    // Horizontal price grid lines
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange / gridSteps) * i;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();

      // Price scale label
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${currencySymbol}${p.toFixed(2)}`, margin.left + chartWidth + 8, y + 3);
    }

    // Support and Resistance Lines
    if (showSR && visibleCandles.length > 0) {
      const last = visibleCandles[visibleCandles.length - 1];
      if (last.support) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = isDark ? '#10b98160' : '#16a34a50';
        ctx.beginPath();
        ctx.moveTo(margin.left, getY(last.support));
        ctx.lineTo(margin.left + chartWidth, getY(last.support));
        ctx.stroke();
        ctx.fillStyle = isDark ? '#10b981' : '#16a34a';
        ctx.fillText(`SUP ${last.support.toFixed(1)}`, margin.left + chartWidth + 8, getY(last.support) + 3);
      }
      if (last.resistance) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = isDark ? '#f43f5e60' : '#dc262650';
        ctx.beginPath();
        ctx.moveTo(margin.left, getY(last.resistance));
        ctx.lineTo(margin.left + chartWidth, getY(last.resistance));
        ctx.stroke();
        ctx.fillStyle = isDark ? '#f43f5e' : '#dc2626';
        ctx.fillText(`RES ${last.resistance.toFixed(1)}`, margin.left + chartWidth + 8, getY(last.resistance) + 3);
      }
      ctx.setLineDash([]);
    }

    // Draw Volume Bars
    const barWidth = Math.max(3, (chartWidth / visibleCandles.length) * 0.65);
    visibleCandles.forEach((c, i) => {
      const x = getX(i);
      const isUp = c.close >= c.open;
      const y = getVolY(c.volume);
      ctx.fillStyle = isUp 
        ? (isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(22, 163, 74, 0.20)') 
        : (isDark ? 'rgba(244, 63, 94, 0.25)' : 'rgba(220, 38, 38, 0.20)');
      ctx.fillRect(x - barWidth / 2, y, barWidth, volTop + volHeight - y);
    });

    // Draw Candlesticks
    visibleCandles.forEach((c, i) => {
      const x = getX(i);
      const isUp = c.close >= c.open;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const color = isUp 
        ? (isDark ? '#10b981' : '#16a34a') 
        : (isDark ? '#f43f5e' : '#dc2626');

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyHeight);
    });

    // Draw 20-EMA line (Blue in light, Cyan in dark)
    if (showEMA) {
      ctx.strokeStyle = isDark ? '#06b6d4' : '#2563eb';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        if (c.ema20) {
          const x = getX(i);
          const y = getY(c.ema20);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw VWAP line (Amber)
    if (showVWAP) {
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        if (c.vwap) {
          const x = getX(i);
          const y = getY(c.vwap);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw Current Price Pulsing Line
    if (ticker?.ltp) {
      const curY = getY(ticker.ltp);
      const isPositive = (ticker.change || 0) >= 0;
      const priceColor = isPositive 
        ? (isDark ? '#10b981' : '#16a34a') 
        : (isDark ? '#f43f5e' : '#dc2626');

      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = priceColor;
      ctx.beginPath();
      ctx.moveTo(margin.left, curY);
      ctx.lineTo(margin.left + chartWidth, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge on price axis
      ctx.fillStyle = priceColor;
      ctx.fillRect(margin.left + chartWidth + 2, curY - 9, 60, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${currencySymbol}${ticker.ltp.toFixed(2)}`, margin.left + chartWidth + 6, curY + 3);
    }

    // Draw Crosshair if active
    if (crosshair && crosshair.candle) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.lineWidth = 0.8;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crosshair.x, margin.top);
      ctx.lineTo(crosshair.x, height - margin.bottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(margin.left, crosshair.y);
      ctx.lineTo(margin.left + chartWidth, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, ticker, crosshair, showEMA, showVWAP, showSR, currencySymbol]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const visible = candles.slice(-70);
    const chartWidth = canvas.parentElement.clientWidth - 75;
    const idx = Math.floor((x / chartWidth) * visible.length);

    if (idx >= 0 && idx < visible.length) {
      setCrosshair({ x, y, candle: visible[idx] });
    }
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
  };

  const activeCandle = crosshair?.candle || (candles && candles[candles.length - 1]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#080c15] relative select-none transition-colors">
      {/* Top Chart Toolbar */}
      <div className="h-10 border-b border-slate-200 dark:border-[#1b253b] px-3 flex items-center justify-between bg-slate-50 dark:bg-[#0b101c]">
        {/* Symbol & Indicators */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">{symbol}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {ticker?.exchange || (ticker?.market === 'US' ? 'NASDAQ' : 'NSE')}
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Timeframe Selector */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-[#070b14] p-0.5 rounded border border-slate-200 dark:border-[#1b253b] text-[10px]">
            {['1m', '5m', '15m', '1D'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  timeframe === tf 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Indicators Toggles */}
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                showEMA 
                  ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>EMA 20</span>
            </button>

            <button
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                showVWAP 
                  ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>VWAP</span>
            </button>

            <button
              onClick={() => setShowSR(!showSR)}
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                showSR 
                  ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span>S/R Zones</span>
            </button>
          </div>
        </div>

        {/* OHLCV Crosshair Display Bar */}
        {activeCandle && (
          <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span>O: <b className="text-slate-900 dark:text-white">{currencySymbol}{activeCandle.open?.toFixed(2)}</b></span>
            <span>H: <b className="text-emerald-600 dark:text-emerald-400">{currencySymbol}{activeCandle.high?.toFixed(2)}</b></span>
            <span>L: <b className="text-rose-600 dark:text-rose-400">{currencySymbol}{activeCandle.low?.toFixed(2)}</b></span>
            <span>C: <b className="text-slate-900 dark:text-white">{currencySymbol}{activeCandle.close?.toFixed(2)}</b></span>
            <span>Vol: <b className="text-blue-600 dark:text-blue-400">{(activeCandle.volume / 1000).toFixed(1)}k</b></span>
          </div>
        )}
      </div>

      {/* Basic Mode Trend Banner */}
      {mode === 'basic' && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-500/20 px-3 py-1 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="font-bold">Guided Mode:</span>
            <span>20-EMA trend guide active. Trade with the trend; enter with mandatory Stop-Loss.</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">1% Max Risk Enforced</span>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 w-full h-full relative">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 cursor-crosshair"
        />
      </div>
    </div>
  );
}
