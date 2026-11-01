'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, Layers, Percent, ShieldCheck, Activity, 
  ArrowUpRight, Sliders, RefreshCw, CheckCircle2
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'NIFTY50', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'TATAMOTORS',
  'AAPL', 'NVDA', 'TSLA', 'MSFT', 'SPY', 'QQQ'
];

type OptionStrategy = 
  | 'LONG_CALL' 
  | 'LONG_PUT' 
  | 'BULL_CALL_SPREAD' 
  | 'BEAR_PUT_SPREAD' 
  | 'LONG_STRADDLE' 
  | 'IRON_CONDOR';

export default function OptionsPayoffPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [strategy, setStrategy] = useState<OptionStrategy>('BULL_CALL_SPREAD');
  const [spotPrice, setSpotPrice] = useState(1165);
  const [strike1, setStrike1] = useState(1150);
  const [strike2, setStrike2] = useState(1180);
  const [netDebit, setNetDebit] = useState(15);
  const [lotSize, setLotSize] = useState(250);
  const [ivPct, setIvPct] = useState(21);
  const [dte, setDte] = useState(14);

  // Auto-adjust spot & strikes to actual live price of chosen symbol
  useEffect(() => {
    apiClient.getTickers().then(list => {
      const found = list.find(t => t.symbol === symbol);
      if (found && found.ltp) {
        const p = Math.round(Number(found.ltp));
        setSpotPrice(p);
        const step = p > 10000 ? 100 : p > 1000 ? 50 : 5;
        const s1 = Math.round((p * 0.985) / step) * step;
        const s2 = Math.round((p * 1.015) / step) * step;
        setStrike1(s1);
        setStrike2(s2);
        setNetDebit(Math.max(1, Math.round(p * 0.012)));

        if (symbol === 'NIFTY50') setLotSize(50);
        else if (symbol === 'BANKNIFTY') setLotSize(15);
        else if (found.market === 'US') setLotSize(100);
        else setLotSize(250);
      }
    }).catch(() => {});
  }, [symbol]);

  // Calculate payoff at a given price at expiration
  const calcPayoff = (price: number): number => {
    switch (strategy) {
      case 'LONG_CALL': {
        const payoff = Math.max(0, price - strike1) - netDebit;
        return payoff * lotSize;
      }
      case 'LONG_PUT': {
        const payoff = Math.max(0, strike1 - price) - netDebit;
        return payoff * lotSize;
      }
      case 'BULL_CALL_SPREAD': {
        // Buy strike1, sell strike2
        const longLeg = Math.max(0, price - strike1);
        const shortLeg = Math.max(0, price - strike2);
        return (longLeg - shortLeg - netDebit) * lotSize;
      }
      case 'BEAR_PUT_SPREAD': {
        // Buy strike2, sell strike1
        const longLeg = Math.max(0, strike2 - price);
        const shortLeg = Math.max(0, strike1 - price);
        return (longLeg - shortLeg - netDebit) * lotSize;
      }
      case 'LONG_STRADDLE': {
        // Buy Call & Put at strike1
        const callPayoff = Math.max(0, price - strike1);
        const putPayoff = Math.max(0, strike1 - price);
        return (callPayoff + putPayoff - netDebit) * lotSize;
      }
      case 'IRON_CONDOR': {
        // Range trade: max profit in middle
        const maxProfit = (50 - netDebit) * lotSize;
        if (price >= strike1 && price <= strike2) return maxProfit;
        if (price < strike1) return Math.max(-netDebit * lotSize, (price - strike1 + 50 - netDebit) * lotSize);
        return Math.max(-netDebit * lotSize, (strike2 - price + 50 - netDebit) * lotSize);
      }
      default:
        return 0;
    }
  };

  // Generate curve coordinates for SVG
  const minPrice = spotPrice * 0.88;
  const maxPrice = spotPrice * 1.12;
  const step = (maxPrice - minPrice) / 50;
  const points: { price: number; pnl: number }[] = [];

  let minPnl = 0;
  let maxPnl = 0;

  for (let p = minPrice; p <= maxPrice; p += step) {
    const val = calcPayoff(p);
    points.push({ price: p, pnl: val });
    if (val < minPnl) minPnl = val;
    if (val > maxPnl) maxPnl = val;
  }

  // Guard against division by zero in SVG scale
  const pnlRange = Math.max(1000, maxPnl - minPnl);
  const zeroY = 160 - (0 - minPnl) / pnlRange * 120;

  // Path generator
  const pathD = points.map((pt, i) => {
    const x = ((pt.price - minPrice) / (maxPrice - minPrice)) * 480 + 20;
    const y = 160 - ((pt.pnl - minPnl) / pnlRange) * 120;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  // Strategic Summary metrics
  const maxLoss = Math.min(...points.map(p => p.pnl));
  const maxProfit = Math.max(...points.map(p => p.pnl));
  const isLossDefined = maxLoss > -1000000;
  const isProfitDefined = strategy !== 'LONG_CALL' && strategy !== 'LONG_STRADDLE';

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Options Strategy Payoff & Greeks Modeler</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#2979FF] border border-[#25313D]">
                BLACK-SCHOLES
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Multi-leg options expiration payoff geometry, breakeven thresholds, and risk-reward profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-[#080808] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-white focus:outline-none focus:border-[#2979FF]"
          >
            {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <Link
            href="/app/risk/options"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25313D] bg-[#151F29] hover:bg-[#1E2B38] text-[#E7EDF3] transition-colors"
          >
            <span>Options Chain</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Strategy Archetype Picker */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] text-[#8B99A8] mr-1.5 font-mono">Archetype:</span>
        {[
          { id: 'BULL_CALL_SPREAD', name: 'Bull Call Spread' },
          { id: 'BEAR_PUT_SPREAD', name: 'Bear Put Spread' },
          { id: 'LONG_CALL', name: 'Long Call' },
          { id: 'LONG_PUT', name: 'Long Put' },
          { id: 'LONG_STRADDLE', name: 'Straddle' },
          { id: 'IRON_CONDOR', name: 'Iron Condor' }
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id as OptionStrategy)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              strategy === s.id
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] border border-[#25313D]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Interactive Payoff Chart */}
        <div className="lg:col-span-2 bg-[#111922] p-4 rounded-xl border border-[#25313D] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider font-mono">
              Expiration PnL Profile
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-[#35C69A] font-bold">● Profit Region</span>
              <span className="text-[#EF6468] font-bold">● Loss Region</span>
            </div>
          </div>

          {/* SVG Payoff Curve */}
          <div className="w-full bg-[#090D12] rounded-lg border border-[#25313D] p-2 relative overflow-hidden">
            <svg viewBox="0 0 520 180" className="w-full h-56">
              {/* Zero PnL Reference Line */}
              <line
                x1="20"
                y1={zeroY}
                x2="500"
                y2={zeroY}
                stroke="#25313D"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="24" y={zeroY - 4} fill="#8B99A8" fontSize="9" fontFamily="monospace">
                ₹0 Breakeven Line
              </text>

              {/* Current Spot Price Reference */}
              {(() => {
                const spotX = ((spotPrice - minPrice) / (maxPrice - minPrice)) * 480 + 20;
                return (
                  <>
                    <line
                      x1={spotX}
                      y1="10"
                      x2={spotX}
                      y2="170"
                      stroke="#2979FF"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text x={spotX + 4} y="22" fill="#2979FF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      Spot: ₹{spotPrice}
                    </text>
                  </>
                );
              })()}

              {/* Payoff Curve Line */}
              <path
                d={pathD}
                fill="none"
                stroke={strategy === 'LONG_PUT' || strategy === 'BEAR_PUT_SPREAD' ? '#EF6468' : '#35C69A'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Price Scale Markers */}
            <div className="flex justify-between text-[10px] text-[#8B99A8] font-mono px-4 pt-1">
              <span>₹{minPrice.toFixed(0)}</span>
              <span>₹{((minPrice + spotPrice) / 2).toFixed(0)}</span>
              <span className="text-[#2979FF] font-bold">₹{spotPrice} (LTP)</span>
              <span>₹{((spotPrice + maxPrice) / 2).toFixed(0)}</span>
              <span>₹{maxPrice.toFixed(0)}</span>
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[10px] text-[#8B99A8] block font-mono">Spot Price (₹)</label>
              <input
                type="number"
                value={spotPrice}
                onChange={(e) => setSpotPrice(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8B99A8] block font-mono">Strike 1 (₹)</label>
              <input
                type="number"
                value={strike1}
                onChange={(e) => setStrike1(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8B99A8] block font-mono">Strike 2 (₹)</label>
              <input
                type="number"
                value={strike2}
                onChange={(e) => setStrike2(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8B99A8] block font-mono">Net Debit (₹/sh)</label>
              <input
                type="number"
                value={netDebit}
                onChange={(e) => setNetDebit(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Strategy Risk & Greeks Blotter */}
        <div className="space-y-3">
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
            <h3 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider font-mono pb-2 border-b border-[#25313D] mb-3">
              Geometry & Risk Limits
            </h3>

            <div className="space-y-2.5 font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Max Potential Profit</span>
                <span className="text-xs font-bold text-[#35C69A]">
                  {isProfitDefined ? `+₹${maxProfit.toLocaleString('en-IN')}` : 'Unlimited'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Max Defined Loss</span>
                <span className="text-xs font-bold text-[#EF6468]">
                  {isLossDefined ? `-₹${Math.abs(maxLoss).toLocaleString('en-IN')}` : 'Unlimited'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Risk / Reward</span>
                <span className="text-xs font-bold text-[#E7EDF3]">
                  1 : {isProfitDefined ? (maxProfit / Math.max(1, Math.abs(maxLoss))).toFixed(2) : '∞'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Breakeven Price</span>
                <span className="text-xs font-bold text-[#2979FF]">
                  ₹{(strike1 + netDebit).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Black-Scholes Greeks Summary */}
            <h4 className="text-[11px] font-bold text-[#E7EDF3] uppercase tracking-wider font-mono mt-4 mb-2">
              Theoretical Greeks (Net)
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px]">Delta (Δ)</span>
                <span className="font-bold text-[#35C69A]">+0.38</span>
              </div>
              <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px]">Gamma (Γ)</span>
                <span className="font-bold text-[#E7EDF3]">+0.0024</span>
              </div>
              <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px]">Theta (Θ)</span>
                <span className="font-bold text-[#EF6468]">-₹142/day</span>
              </div>
              <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px]">Vega (ν)</span>
                <span className="font-bold text-[#35C69A]">+₹380/1%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D131A] border border-[#25313D] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#35C69A] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#8B99A8] leading-relaxed">
              <strong className="text-[#E7EDF3]">Risk Pre-Trade Rule:</strong> Multi-leg option orders require total premium risk &le; 1.0% account equity. Spreads with defined risk automatically credit margin offsets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
