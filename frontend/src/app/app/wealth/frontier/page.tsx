'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Activity, ShieldCheck, RefreshCw, ArrowLeft, Sliders, TrendingUp } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { KNOWN_ASSET_PROFILES } from '../../../../lib/mpt-solver';

const ALL_TICKERS = Object.keys(KNOWN_ASSET_PROFILES);

function EfficientFrontierContent() {
  const searchParams = useSearchParams();
  const [selectedTickers, setSelectedTickers] = useState<string[]>([
    'RELIANCE', 'TCS', 'HDFCBANK', 'NVDA', 'AAPL', 'SPY'
  ]);
  const [riskFreeRate, setRiskFreeRate] = useState(6.75);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleToggleTicker = (sym: string) => {
    if (selectedTickers.includes(sym)) {
      if (selectedTickers.length > 2) {
        setSelectedTickers(selectedTickers.filter(t => t !== sym));
      }
    } else {
      if (selectedTickers.length < 10) {
        setSelectedTickers([...selectedTickers, sym]);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    apiClient.getPortfolioOptimization(selectedTickers, riskFreeRate / 100)
      .then(res => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedTickers, riskFreeRate]);

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
    const maxX = 0.45; // 45% vol
    const minY = 0.04; // 4% return
    const maxY = 0.36; // 36% return

    const getX = (vol: number) => margin.left + ((vol - minX) / (maxX - minX)) * plotWidth;
    const getY = (ret: number) => margin.top + plotHeight - ((ret - minY) / (maxY - minY)) * plotHeight;

    // Grid lines
    ctx.strokeStyle = '#25313D';
    ctx.lineWidth = 1;

    // X-axis grid
    for (let v = 0.05; v <= 0.45; v += 0.05) {
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
    const msVol = data.maxSharpe?.volatility || 0.16;
    const msRet = data.maxSharpe?.expectedReturn || 0.22;

    ctx.strokeStyle = 'rgba(41, 121, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(getX(0.05), getY(rf + ((msRet - rf) / (msVol || 1)) * (0.05)));
    ctx.lineTo(getX(0.40), getY(rf + ((msRet - rf) / (msVol || 1)) * (0.40)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Efficient Frontier Curve
    const frontier: Array<{ volatility: number; expectedReturn: number }> = data.frontierPoints || [];
    if (frontier.length > 2) {
      // Area Fill
      ctx.beginPath();
      ctx.moveTo(getX(frontier[0].volatility), margin.top + plotHeight);
      frontier.forEach(pt => {
        ctx.lineTo(getX(pt.volatility), getY(pt.expectedReturn));
      });
      ctx.lineTo(getX(frontier[frontier.length - 1].volatility), margin.top + plotHeight);
      ctx.fillStyle = 'rgba(53, 198, 154, 0.08)';
      ctx.fill();

      // Frontier Curve Line
      ctx.beginPath();
      frontier.forEach((pt, i) => {
        const x = getX(pt.volatility);
        const y = getY(pt.expectedReturn);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#35C69A';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Plot Individual Assets
    selectedTickers.forEach(sym => {
      const prof = KNOWN_ASSET_PROFILES[sym];
      if (!prof) return;
      const x = getX(prof.volatility);
      const y = getY(prof.expectedReturn);

      ctx.fillStyle = '#8B99A8';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E7EDF3';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(sym, x + 6, y + 3);
    });

    // Plot Global Min Variance (GMV) Point
    if (data.minVariance) {
      const gmvX = getX(data.minVariance.volatility);
      const gmvY = getY(data.minVariance.expectedReturn);

      ctx.fillStyle = '#2979FF';
      ctx.beginPath();
      ctx.arc(gmvX, gmvY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#2979FF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Min Volatility', gmvX - 8, gmvY + 3);
    }

    // Plot Max Sharpe Tangency Point
    if (data.maxSharpe) {
      const msX = getX(msVol);
      const msY = getY(msRet);

      ctx.fillStyle = '#35C69A';
      ctx.beginPath();
      ctx.arc(msX, msY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#35C69A';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Max Sharpe (${data.maxSharpe.sharpeRatio})`, msX + 10, msY + 3);
    }
  }, [data, riskFreeRate, selectedTickers]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href="/app/wealth/optimizer"
            className="p-1.5 rounded-lg bg-[#151F29] border border-[#25313D] text-[#8B99A8] hover:text-[#E7EDF3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Markowitz Efficient Frontier &amp; CAL Curve</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                PARETO CURVATURE
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Graphic visualization of the Pareto-optimal risk-return hyperbola with Capital Allocation Line tangency.
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
        </div>
      </div>

      {/* Asset Selection Bar */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs font-mono text-[#E7EDF3]">
            Toggle Basket Assets ({selectedTickers.length} Selected)
          </span>
          <span className="text-[10px] text-[#8B99A8]">Select 2 to 10 assets to redraw the parabolic curve</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TICKERS.map(sym => {
            const isSelected = selectedTickers.includes(sym);
            return (
              <button
                key={sym}
                onClick={() => handleToggleTicker(sym)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#2979FF] text-white border-[#2979FF]'
                    : 'bg-[#0D131A] text-[#8B99A8] border-[#25313D] hover:text-[#E7EDF3]'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Plot Container */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider font-mono text-[#E7EDF3]">
            Mean-Variance Frontier Plot (Tangency &amp; GMV Highlighted)
          </span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35C69A]" />
              <span>Max Sharpe Tangency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2979FF]" />
              <span>Min Variance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8B99A8]" />
              <span>Individual Assets</span>
            </div>
          </div>
        </div>

        <div className="w-full h-80 relative bg-[#0D131A] rounded-lg border border-[#25313D] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>
    </div>
  );
}

export default function EfficientFrontierPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Efficient Frontier...</div>}>
      <EfficientFrontierContent />
    </Suspense>
  );
}
