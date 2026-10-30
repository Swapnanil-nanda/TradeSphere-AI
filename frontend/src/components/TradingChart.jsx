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
    ctx.strokeStyle = '#151d2f';
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
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono"';
      ctx.textAlign = 'left';
      ctx.fillText(`${currencySymbol}${p.toFixed(2)}`, margin.left + chartWidth + 8, y + 3);
    }

    // Support and Resistance Lines
    if (showSR && visibleCandles.length > 0) {
      const last = visibleCandles[visibleCandles.length - 1];
      if (last.support) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#10b98160';
        ctx.beginPath();
        ctx.moveTo(margin.left, getY(last.support));
        ctx.lineTo(margin.left + chartWidth, getY(last.support));
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText(`SUP ${last.support.toFixed(1)}`, margin.left + chartWidth + 8, getY(last.support) + 3);
      }
      if (last.resistance) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#f43f5e60';
        ctx.beginPath();
        ctx.moveTo(margin.left, getY(last.resistance));
        ctx.lineTo(margin.left + chartWidth, getY(last.resistance));
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
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
      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
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

      // Wick
      ctx.strokeStyle = isUp ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = isUp ? '#10b981' : '#f43f5e';
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyHeight);
    });

    // Draw 20-EMA line (Cyan)
    if (showEMA) {
      ctx.strokeStyle = '#06b6d4';
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
      ctx.strokeStyle = '#f59e0b';
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
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = ticker.change >= 0 ? '#10b981' : '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(margin.left, curY);
      ctx.lineTo(margin.left + chartWidth, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge on price axis
      ctx.fillStyle = ticker.change >= 0 ? '#10b981' : '#f43f5e';
      ctx.fillRect(margin.left + chartWidth + 2, curY - 9, 60, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono"';
      ctx.fillText(`${currencySymbol}${ticker.ltp.toFixed(2)}`, margin.left + chartWidth + 6, curY + 3);
    }

    // Draw Crosshair if active
    if (crosshair && crosshair.candle) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#94a3b8';
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
  }, [candles, ticker, crosshair, showEMA, showVWAP, showSR]);

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
    <div className="flex-1 flex flex-col h-full bg-[#080c15] relative select-none">
      {/* Top Chart Toolbar */}
      <div className="h-10 border-b border-[#1b253b] px-4 flex items-center justify-between bg-[#0b101c]">
        {/* Symbol & Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm font-['JetBrains_Mono']">{symbol}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
              {ticker?.exchange || 'NSE'}
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-800" />

          {/* Timeframe Selector */}
          <div className="flex items-center gap-0.5 bg-[#070b14] p-0.5 rounded border border-[#1b253b] text-[10px]">
            {['1m', '5m', '15m', '1D'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  timeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-3.5 w-[1px] bg-slate-800" />

          {/* Indicators Toggles */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-0.5 rounded border font-semibold flex items-center gap-1 transition-all ${
                showEMA ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>EMA 20</span>
            </button>

            <button
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-0.5 rounded border font-semibold flex items-center gap-1 transition-all ${
                showVWAP ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>VWAP</span>
            </button>

            <button
              onClick={() => setShowSR(!showSR)}
              className={`px-2 py-0.5 rounded border font-semibold flex items-center gap-1 transition-all ${
                showSR ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              <span>S/R Zones</span>
            </button>
          </div>
        </div>

        {/* OHLCV Crosshair Display Bar */}
        {activeCandle && (
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-['JetBrains_Mono'] text-slate-300">
            <span>O: <b className="text-white">{currencySymbol}{activeCandle.open?.toFixed(2)}</b></span>
            <span>H: <b className="text-emerald-400">{currencySymbol}{activeCandle.high?.toFixed(2)}</b></span>
            <span>L: <b className="text-rose-400">{currencySymbol}{activeCandle.low?.toFixed(2)}</b></span>
            <span>C: <b className="text-white">{currencySymbol}{activeCandle.close?.toFixed(2)}</b></span>
            <span>Vol: <b className="text-blue-400">{(activeCandle.volume / 1000).toFixed(1)}k</b></span>
          </div>
        )}
      </div>

      {/* Basic Mode Trend Banner */}
      {mode === 'basic' && (
        <div className="bg-blue-950/40 border-b border-blue-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="font-semibold">Beginner Guided Mode:</span>
            <span>Green EMA line marks trend direction. Enter long when price is above EMA with Stop-Loss below support.</span>
          </div>
          <span className="text-[11px] font-bold text-amber-300">1% Max Risk Enforced</span>
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
