'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Activity, ShieldCheck, Info, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function EfficientFrontierPage() {
  const [riskFreeRate, setRiskFreeRate] = useState(6.5);
  const [data, setData] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    apiClient.getPortfolioOptimization(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'], riskFreeRate / 100)
      .then(setData);
  }, [riskFreeRate]);

  // Draw Efficient Frontier Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 360;

    const isDark = document.documentElement.classList.contains('dark');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const margin = { top: 30, right: 40, bottom: 40, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const minX = 0.05; // 5% vol
    const maxX = 0.25; // 25% vol
    const minY = 0.04; // 4% return
    const maxY = 0.24; // 24% return

    const getX = (vol: number) => margin.left + ((vol - minX) / (maxX - minX)) * plotWidth;
    const getY = (ret: number) => margin.top + plotHeight - ((ret - minY) / (maxY - minY)) * plotHeight;

    // Grid lines
    ctx.strokeStyle = isDark ? '#151d2f' : '#f1f5f9';
    ctx.lineWidth = 1;

    // X-axis grid
    for (let v = 0.05; v <= 0.25; v += 0.05) {
      const x = getX(v);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${(v * 100).toFixed(0)}%`, x, height - margin.bottom + 16);
    }

    // Y-axis grid
    for (let r = 0.05; r <= 0.25; r += 0.05) {
      const y = getY(r);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${(r * 100).toFixed(0)}%`, margin.left - 8, y + 3);
    }

    // Axis Labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Expected Volatility / Standard Deviation (σ)', margin.left + plotWidth / 2, height - 8);

    ctx.save();
    ctx.translate(14, margin.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Expected Annual Return (μ)', 0, 0);
    ctx.restore();

    // Capital Allocation Line (CAL) from Rf to Max Sharpe
    const rf = riskFreeRate / 100;
    const msVol = data.maxSharpe?.volatility || 0.142;
    const msRet = data.maxSharpe?.expectedReturn || 0.168;

    ctx.strokeStyle = '#3b82f680';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(getX(0.05), getY(rf + (msRet - rf) * ((0.05 - 0) / msVol)));
    ctx.lineTo(getX(0.24), getY(rf + (msRet - rf) * ((0.24 - 0) / msVol)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Efficient Frontier Curve
    const curvePoints = data.frontierPoints || [];
    if (curvePoints.length > 1) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      curvePoints.forEach((pt: any, idx: number) => {
        const x = getX(pt.volatility);
        const y = getY(pt.expectedReturn);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw Minimum Variance Dot (Emerald)
    const mvVol = data.minVariance?.volatility || 0.098;
    const mvRet = data.minVariance?.expectedReturn || 0.124;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(getX(mvVol), getY(mvRet), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Min Variance', getX(mvVol) + 8, getY(mvRet) + 3);

    // Draw Maximum Sharpe Dot (Blue)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(getX(msVol), getY(msRet), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Max Sharpe (Optimal)', getX(msVol) + 9, getY(msRet) - 4);

    // Draw Constituent Asset Scatter
    const constituents = [
      { name: 'RELIANCE', vol: 0.194, ret: 0.182 },
      { name: 'TCS', vol: 0.158, ret: 0.154 },
      { name: 'HDFCBANK', vol: 0.172, ret: 0.161 },
      { name: 'INFY', vol: 0.210, ret: 0.192 },
      { name: 'ICICIBANK', vol: 0.188, ret: 0.175 }
    ];

    constituents.forEach(c => {
      ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(getX(c.vol), getY(c.ret), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(c.name, getX(c.vol) + 6, getY(c.ret) + 3);
    });
  }, [data, riskFreeRate]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Efficient Frontier &amp; Capital Allocation Line</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Markowitz risk-return frontier visualizer identifying globally dominant investment allocations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] px-3 py-1.5 rounded-lg">
            <span className="text-[10px] text-slate-500 font-semibold">Risk-Free Rate:</span>
            <input
              type="number"
              step="0.1"
              value={riskFreeRate}
              onChange={e => setRiskFreeRate(parseFloat(e.target.value) || 6.5)}
              className="w-12 bg-transparent font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none text-right"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>
      </div>

      {/* Frontier Chart Canvas Container */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            Risk-Return Hyperbola &amp; Constituent Asset Positioning
          </span>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Max Sharpe Tangency</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Minimum Variance</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Individual Assets</span>
            </span>
          </div>
        </div>

        <div className="w-full h-80 relative bg-slate-50 dark:bg-[#070b14] rounded-lg border border-slate-200 dark:border-[#1b253b] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Key Theory Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-1.5">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Maximum Sharpe Ratio Tangency</div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            The Maximum Sharpe portfolio maximizes excess return per unit of total risk ($(\mu - R_f) / \sigma$). Any portfolio on the Capital Allocation Line strictly dominates single-stock holdings through variance-covariance diversification.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-1.5">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Minimum Variance Baseline</div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            The left-most vertex on the hyperbola represents the portfolio with the lowest possible variance achievable from the selected universe, regardless of market direction. Ideal for capital preservation mandates.
          </p>
        </div>
      </div>
    </div>
  );
}
