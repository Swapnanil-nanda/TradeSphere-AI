'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface EquityHistoryPoint {
  timestamp: number;
  dateStr?: string;
  equity: number;
  benchmark?: number;
}

interface PerformanceChartProps {
  equityCurve?: number[] | EquityHistoryPoint[];
  initialEquity?: number;
  benchmarkName?: string;
}

export default function PerformanceChart({
  equityCurve = [1000000],
  initialEquity = 1000000,
  benchmarkName = 'NIFTY 50'
}: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    date: string;
    equity: number;
    benchmark?: number;
    pnl: number;
  } | null>(null);

  // Normalize points
  const points: EquityHistoryPoint[] = React.useMemo(() => {
    if (!equityCurve || equityCurve.length === 0) {
      return [{ timestamp: Date.now(), equity: initialEquity, benchmark: initialEquity }];
    }
    if (typeof equityCurve[0] === 'number') {
      const nums = equityCurve as number[];
      const now = Date.now();
      return nums.map((val, idx) => ({
        timestamp: now - (nums.length - 1 - idx) * 86400000,
        equity: val,
        benchmark: initialEquity + idx * 350
      }));
    }
    return equityCurve as EquityHistoryPoint[];
  }, [equityCurve, initialEquity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 600;
    const height = parent ? parent.clientHeight : 240;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const margin = { top: 20, right: 30, bottom: 30, left: 20 };
    const chartWidth = Math.max(10, width - margin.left - margin.right);
    const chartHeight = Math.max(10, height - margin.top - margin.bottom);

    const equities = points.map(p => p.equity);
    const benchmarks = points.map(p => p.benchmark || initialEquity);

    const minVal = Math.min(...equities, ...benchmarks, initialEquity) * 0.998;
    const maxVal = Math.max(...equities, ...benchmarks, initialEquity) * 1.002;
    const range = maxVal - minVal || 1;

    const getX = (idx: number) => {
      if (points.length <= 1) return margin.left + chartWidth / 2;
      return margin.left + (idx / (points.length - 1)) * chartWidth;
    };
    const getY = (val: number) => margin.top + chartHeight - ((val - minVal) / range) * chartHeight;

    // 1. Draw Baseline (Initial Capital: ₹10,00,000)
    const baseY = getY(initialEquity);
    ctx.strokeStyle = '#223049';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, baseY);
    ctx.lineTo(width - margin.right, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Baseline Label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`₹${(initialEquity / 100000).toFixed(0)}L BASE`, width - margin.right, baseY - 5);

    // 2. Draw NIFTY 50 Benchmark Line (Dotted Blue)
    if (points.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = getX(idx);
        const y = getY(p.benchmark || initialEquity);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Gradient Fill Under Equity Curve
    const gradient = ctx.createLinearGradient(0, margin.top, 0, height - margin.bottom);
    gradient.addColorStop(0, '#10b98130');
    gradient.addColorStop(1, '#10b98100');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(getX(0), height - margin.bottom);
    points.forEach((p, idx) => {
      ctx.lineTo(getX(idx), getY(p.equity));
    });
    ctx.lineTo(getX(points.length - 1), height - margin.bottom);
    ctx.closePath();
    ctx.fill();

    // 4. Draw Portfolio Equity Line (Solid Emerald Green)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.equity);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. Draw point dots if <= 20 points
    if (points.length <= 20) {
      points.forEach((p, idx) => {
        const x = getX(idx);
        const y = getY(p.equity);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0c121f';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // 6. Draw Crosshair if hovering
    if (hoverData) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hoverData.x, margin.top);
      ctx.lineTo(hoverData.x, height - margin.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hoverData.x, hoverData.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [points, initialEquity, hoverData]);

  // Handle Mouse Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const margin = { top: 20, right: 30, bottom: 30, left: 20 };
    const chartWidth = Math.max(10, rect.width - margin.left - margin.right);

    const clampedX = Math.max(margin.left, Math.min(rect.width - margin.right, mouseX));
    const ratio = (clampedX - margin.left) / chartWidth;
    const idx = Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1))));

    const p = points[idx];
    const minVal = Math.min(...points.map(pt => pt.equity), ...points.map(pt => pt.benchmark || initialEquity), initialEquity) * 0.998;
    const maxVal = Math.max(...points.map(pt => pt.equity), ...points.map(pt => pt.benchmark || initialEquity), initialEquity) * 1.002;
    const range = maxVal - minVal || 1;
    const chartHeight = Math.max(10, rect.height - margin.top - margin.bottom);
    const y = margin.top + chartHeight - ((p.equity - minVal) / range) * chartHeight;

    const getX = (i: number) => {
      if (points.length <= 1) return margin.left + chartWidth / 2;
      return margin.left + (i / (points.length - 1)) * chartWidth;
    };

    setHoverData({
      x: getX(idx),
      y,
      date: p.dateStr || new Date(p.timestamp).toLocaleDateString(),
      equity: p.equity,
      benchmark: p.benchmark,
      pnl: p.equity - initialEquity
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full min-h-[220px] relative select-none cursor-crosshair"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Hover Tooltip */}
      {hoverData && (
        <div
          className="absolute z-30 pointer-events-none bg-[#090D14]/95 border border-[#223049] rounded-xl px-3 py-2 text-xs shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full -mt-2 transition-all"
          style={{ left: hoverData.x, top: Math.max(40, hoverData.y) }}
        >
          <div className="text-[10px] text-slate-400 font-mono mb-1">{hoverData.date}</div>
          <div className="flex items-center gap-1.5 font-bold text-white font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>₹{hoverData.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {hoverData.benchmark !== undefined && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#3b82f6] font-mono mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span>{benchmarkName}: ₹{hoverData.benchmark.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className={`text-[10px] font-bold font-mono mt-1 ${hoverData.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Net Return: {hoverData.pnl >= 0 ? '+' : ''}₹{hoverData.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(hoverData.pnl / initialEquity * 100).toFixed(2)}%)
          </div>
        </div>
      )}
    </div>
  );
}
