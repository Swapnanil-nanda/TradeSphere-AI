'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function EfficientFrontierPage() {
  const [riskFreeRate, setRiskFreeRate] = useState(6.75);
  const [data, setData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    apiClient.getPortfolioOptimization(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'], riskFreeRate / 100)
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
    const maxX = 0.30; // 30% vol
    const minY = 0.05; // 5% return
    const maxY = 0.35; // 35% return

    const getX = (vol: number) => margin.left + ((vol - minX) / (maxX - minX)) * plotWidth;
    const getY = (ret: number) => margin.top + plotHeight - ((ret - minY) / (maxY - minY)) * plotHeight;

    // Grid lines
    ctx.strokeStyle = '#25313D';
    ctx.lineWidth = 1;

    // X-axis grid
    for (let v = 0.05; v <= 0.30; v += 0.05) {
      const x = getX(v);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();

      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${(v * 100).toFixed(0)}%`, x, height - margin.bottom + 16);
    }

    // Y-axis grid
    for (let r = 0.05; r <= 0.35; r += 0.05) {
      const y = getY(r);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${(r * 100).toFixed(0)}%`, margin.left - 8, y + 3);
    }

    // Axis Labels
    ctx.fillStyle = '#8B99A8';
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
    const msVol = data.maxSharpe?.volatility || 0.152;
    const msRet = data.maxSharpe?.expectedReturn || 0.285;

    ctx.strokeStyle = '#2979FF80';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(getX(0.05), getY(rf + (msRet - rf) * ((0.05 - 0) / msVol)));
    ctx.lineTo(getX(0.28), getY(rf + (msRet - rf) * ((0.28 - 0) / msVol)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Efficient Frontier Curve
    const curvePoints = data.frontierPoints || [];
    if (curvePoints.length > 1) {
      ctx.strokeStyle = '#2979FF';
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
    const mvVol = data.minVariance?.volatility || 0.105;
    const mvRet = data.minVariance?.expectedReturn || 0.148;
    ctx.fillStyle = '#35C69A';
    ctx.beginPath();
    ctx.arc(getX(mvVol), getY(mvRet), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E7EDF3';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Min Variance', getX(mvVol) + 8, getY(mvRet) + 3);

    // Draw Maximum Sharpe Dot (Blue)
    ctx.fillStyle = '#2979FF';
    ctx.beginPath();
    ctx.arc(getX(msVol), getY(msRet), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E7EDF3';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Max Sharpe (Tangency)', getX(msVol) + 9, getY(msRet) - 4);

    // Draw Constituent Asset Scatter
    const constituents = [
      { name: 'RELIANCE', vol: 0.194, ret: 0.182 },
      { name: 'TCS', vol: 0.158, ret: 0.154 },
      { name: 'HDFCBANK', vol: 0.172, ret: 0.161 },
      { name: 'INFY', vol: 0.210, ret: 0.192 }
    ];

    constituents.forEach(c => {
      ctx.fillStyle = '#8B99A8';
      ctx.beginPath();
      ctx.arc(getX(c.vol), getY(c.ret), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px monospace';
      ctx.fillText(c.name, getX(c.vol) + 6, getY(c.ret) + 3);
    });
  }, [data, riskFreeRate]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Efficient Frontier &amp; Capital Allocation Line</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#2979FF] border border-[#25313D]">
                MARKOWITZ HYPERBOLA
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Markowitz risk-return frontier visualizer identifying globally dominant investment allocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0D131A] border border-[#25313D] px-3 py-1.5 rounded-lg">
            <span className="text-[10px] text-[#8B99A8] font-semibold font-mono">Rf Rate:</span>
            <input
              type="number"
              step="0.05"
              value={riskFreeRate}
              onChange={e => setRiskFreeRate(parseFloat(e.target.value) || 6.75)}
              className="w-12 bg-transparent font-mono font-bold text-[#E7EDF3] focus:outline-none text-right"
            />
            <span className="font-mono text-[#8B99A8]">%</span>
          </div>

          <Link
            href="/app/wealth/optimizer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25313D] bg-[#151F29] hover:bg-[#1E2B38] text-[#E7EDF3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>MPT Optimizer</span>
          </Link>
        </div>
      </div>

      {/* Frontier Chart Canvas Container */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#E7EDF3] uppercase tracking-wider text-[11px] font-mono">
            Risk-Return Hyperbola &amp; Constituent Asset Positioning
          </span>
          <div className="flex items-center gap-3 text-[10px] font-mono text-[#8B99A8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2979FF]" />
              <span className="text-[#E7EDF3]">Max Sharpe Tangency</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35C69A]" />
              <span className="text-[#E7EDF3]">Minimum Variance</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B99A8]" />
              <span>Individual Assets</span>
            </span>
          </div>
        </div>

        <div className="w-full h-80 relative bg-[#090D12] rounded-lg border border-[#25313D] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Key Theory Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111922] border border-[#25313D] shadow-2xs space-y-1.5">
          <div className="font-bold text-[#E7EDF3] text-xs">Maximum Sharpe Ratio Tangency</div>
          <p className="text-[#8B99A8] text-[11px] leading-relaxed">
            The Maximum Sharpe portfolio maximizes excess return per unit of total risk (($\mu - R_f) / \sigma$). Any portfolio on the Capital Allocation Line strictly dominates single-stock holdings through variance-covariance diversification.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111922] border border-[#25313D] shadow-2xs space-y-1.5">
          <div className="font-bold text-[#E7EDF3] text-xs">Minimum Variance Baseline</div>
          <p className="text-[#8B99A8] text-[11px] leading-relaxed">
            The left-most vertex on the hyperbola represents the portfolio with the lowest possible variance achievable from the selected universe, regardless of market direction. Ideal for capital preservation mandates.
          </p>
        </div>
      </div>
    </div>
  );
}
