import React, { useRef, useEffect, useState } from 'react';
import { Eye, TrendingUp, TrendingDown, Layers, BarChart2, Crosshair, PenTool, Minus, Trash2 } from 'lucide-react';

export default function TradingChart({ symbol, ticker, candles, timeframe, setTimeframe, mode }) {
  const canvasRef = useRef(null);
  const [crosshair, setCrosshair] = useState(null); // { x, y, candle }
  const [showEMA, setShowEMA] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showSR, setShowSR] = useState(true);
  const [chartType, setChartType] = useState('candles'); // 'candles' | 'line'
  const [activeDrawingTool, setActiveDrawingTool] = useState(null); // 'line' | 'horizontal' | null
  const [drawnLines, setDrawnLines] = useState([]);

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

    // Draw Grid Lines (Institutional Dark #151F29)
    ctx.strokeStyle = '#151F29';
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
      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${currencySymbol}${p.toFixed(2)}`, margin.left + chartWidth + 6, y + 3);
    }

    // Support and Resistance Lines
    if (showSR && visibleCandles.length > 0) {
      const last = visibleCandles[visibleCandles.length - 1];
      if (last.support) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(53, 198, 154, 0.4)';
        ctx.beginPath();
        ctx.moveTo(margin.left, getY(last.support));
        ctx.lineTo(margin.left + chartWidth, getY(last.support));
        ctx.stroke();

        ctx.fillStyle = '#35C69A';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillText(`SUP ${last.support.toFixed(1)}`, margin.left + 5, getY(last.support) - 3);
      }
      if (last.resistance) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(239, 100, 104, 0.4)';
        ctx.beginPath();
        ctx.moveTo(margin.left, getY(last.resistance));
        ctx.lineTo(margin.left + chartWidth, getY(last.resistance));
        ctx.stroke();

        ctx.fillStyle = '#EF6468';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillText(`RES ${last.resistance.toFixed(1)}`, margin.left + 5, getY(last.resistance) - 3);
      }
      ctx.setLineDash([]);
    }

    // Draw Volume Bars
    const barWidth = Math.max(2, (chartWidth / visibleCandles.length) * 0.7);
    visibleCandles.forEach((c, idx) => {
      const x = getX(idx) - barWidth / 2;
      const y = getVolY(c.volume);
      const isUp = c.close >= c.open;

      ctx.fillStyle = isUp ? 'rgba(53, 198, 154, 0.3)' : 'rgba(239, 100, 104, 0.3)';
      ctx.fillRect(x, y, barWidth, volTop + volHeight - y);
    });

    // Draw Candlesticks or Line
    if (chartType === 'candles') {
      visibleCandles.forEach((c, idx) => {
        const x = getX(idx);
        const isUp = c.close >= c.open;
        const color = isUp ? '#35C69A' : '#EF6468';

        // Draw Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, getY(c.high));
        ctx.lineTo(x, getY(c.low));
        ctx.stroke();

        // Draw Body
        const top = getY(Math.max(c.open, c.close));
        const bottom = getY(Math.min(c.open, c.close));
        const bodyHeight = Math.max(1.5, bottom - top);

        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2, top, barWidth, bodyHeight);
      });
    } else {
      // Line Chart
      ctx.strokeStyle = '#2979FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = getX(idx);
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw 20-EMA Curve (#2979FF)
    if (showEMA && visibleCandles.length > 20) {
      ctx.strokeStyle = '#2979FF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      visibleCandles.forEach((c, idx) => {
        if (c.ema) {
          const x = getX(idx);
          const y = getY(c.ema);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw VWAP Curve (#D8AB5E)
    if (showVWAP && visibleCandles.length > 0) {
      ctx.strokeStyle = '#D8AB5E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      visibleCandles.forEach((c, idx) => {
        if (c.vwap) {
          const x = getX(idx);
          const y = getY(c.vwap);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw User Annotations / Drawn Lines
    drawnLines.forEach(line => {
      ctx.strokeStyle = '#2979FF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });

    // Draw Crosshair
    if (crosshair) {
      ctx.strokeStyle = '#8B99A8';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

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

      // Crosshair Price Tag
      const currentPriceAtCrosshair = minPrice + ((margin.top + chartHeight - crosshair.y) / chartHeight) * priceRange;
      ctx.fillStyle = '#151F29';
      ctx.fillRect(margin.left + chartWidth + 2, crosshair.y - 8, 60, 16);
      ctx.strokeStyle = '#25313D';
      ctx.strokeRect(margin.left + chartWidth + 2, crosshair.y - 8, 60, 16);
      ctx.fillStyle = '#E7EDF3';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${currencySymbol}${currentPriceAtCrosshair.toFixed(2)}`, margin.left + chartWidth + 5, crosshair.y + 4);
    }
  }, [candles, showEMA, showVWAP, showSR, chartType, crosshair, drawnLines]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const visibleCandles = candles.slice(-70);
    const margin = { top: 20, right: 65, bottom: 25, left: 10 };
    const chartWidth = rect.width - margin.left - margin.right;
    const idx = Math.floor(((x - margin.left) / chartWidth) * visibleCandles.length);

    if (idx >= 0 && idx < visibleCandles.length) {
      setCrosshair({ x, y, candle: visibleCandles[idx] });
    } else {
      setCrosshair(null);
    }
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
  };

  const c = crosshair?.candle || (candles && candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="flex flex-col h-full bg-[#090D12] select-none text-xs">
      {/* Top Chart Controls & Timeframe Selector */}
      <div className="h-10 px-3 border-b border-[#25313D] bg-[#0D131A] flex items-center justify-between shrink-0 font-sans">
        {/* Left Side: Symbol, OHLCV Stats, Timeframes */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-xs text-[#E7EDF3]">{symbol}</span>
            <span className="text-[10px] text-[#8B99A8] px-1 py-0.2 rounded bg-[#111922] border border-[#25313D]">
              NSE
            </span>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-0.5 bg-[#111922] p-0.5 rounded border border-[#25313D] font-mono text-[10px]">
            {['1m', '5m', '15m', '1h', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-[#2979FF] text-white shadow-2xs'
                    : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-0.5 bg-[#111922] p-0.5 rounded border border-[#25313D] font-mono text-[10px]">
            <button
              onClick={() => setChartType('candles')}
              className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                chartType === 'candles' ? 'bg-[#2979FF] text-white' : 'text-[#8B99A8] hover:text-[#E7EDF3]'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                chartType === 'line' ? 'bg-[#2979FF] text-white' : 'text-[#8B99A8] hover:text-[#E7EDF3]'
              }`}
            >
              Line
            </button>
          </div>

          {/* Live Crosshair OHLC Inspection */}
          {c && (
            <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono text-[#8B99A8]">
              <span>O: <b className="text-[#E7EDF3] num-tabular">{c.open?.toFixed(2)}</b></span>
              <span>H: <b className="text-[#35C69A] num-tabular">{c.high?.toFixed(2)}</b></span>
              <span>L: <b className="text-[#EF6468] num-tabular">{c.low?.toFixed(2)}</b></span>
              <span>C: <b className="text-[#E7EDF3] num-tabular">{c.close?.toFixed(2)}</b></span>
              <span>V: <b className="text-[#8B99A8] num-tabular">{c.volume?.toLocaleString()}</b></span>
            </div>
          )}
        </div>

        {/* Right Side: Overlay Indicators & Drawing Tools */}
        <div className="flex items-center gap-1.5">
          {/* Indicator Quick Toggles */}
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
              showEMA
                ? 'bg-[#2979FF]/15 text-[#2979FF] border-[#2979FF]/40'
                : 'bg-[#111922] text-[#8B99A8] border-[#25313D]'
            }`}
          >
            EMA(20)
          </button>

          <button
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
              showVWAP
                ? 'bg-[#D8AB5E]/15 text-[#D8AB5E] border-[#D8AB5E]/40'
                : 'bg-[#111922] text-[#8B99A8] border-[#25313D]'
            }`}
          >
            VWAP
          </button>

          <button
            onClick={() => setShowSR(!showSR)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
              showSR
                ? 'bg-[#35C69A]/15 text-[#35C69A] border-[#35C69A]/40'
                : 'bg-[#111922] text-[#8B99A8] border-[#25313D]'
            }`}
          >
            S/R
          </button>

          {/* Clear Drawings */}
          {drawnLines.length > 0 && (
            <button
              onClick={() => setDrawnLines([])}
              className="p-1 rounded text-[#8B99A8] hover:text-[#EF6468] bg-[#111922] border border-[#25313D]"
              title="Clear Annotations"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Chart Stage */}
      <div className="flex-1 relative overflow-hidden bg-[#090D12]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 cursor-crosshair"
        />

        {/* Legend */}
        <div className="absolute top-2 left-3 flex items-center gap-3 text-[10px] font-mono pointer-events-none select-none">
          {showEMA && (
            <div className="flex items-center gap-1 text-[#2979FF]">
              <span className="w-2 h-0.5 bg-[#2979FF]" />
              <span>EMA 20</span>
            </div>
          )}
          {showVWAP && (
            <div className="flex items-center gap-1 text-[#D8AB5E]">
              <span className="w-2 h-0.5 bg-[#D8AB5E]" />
              <span>VWAP</span>
            </div>
          )}
          {showSR && (
            <div className="flex items-center gap-1 text-[#35C69A]">
              <span className="w-2 h-0.5 bg-[#35C69A] border-dashed" />
              <span>S/R Zones</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
