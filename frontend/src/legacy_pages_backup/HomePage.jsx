import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, Zap, TrendingUp, TrendingDown, 
  BarChart2, Layers, Bot, Activity, CheckCircle2, Lock, 
  Cpu, Award, BookOpen, AlertTriangle, Play 
} from 'lucide-react';

export default function HomePage() {
  const [tickers, setTickers] = useState([]);
  const [activeTier, setActiveTier] = useState('active'); // 'basic' | 'active' | 'pro'

  // Interactive Live Risk Calculator State
  const [calcEquity, setCalcEquity] = useState(1000000);
  const [calcRiskPct, setCalcRiskPct] = useState(1.0);
  const [calcEntry, setCalcEntry] = useState(2950);
  const [calcStopLoss, setCalcStopLoss] = useState(2920);

  // Fetch real-time ticker snapshots from backend
  useEffect(() => {
    fetch('http://localhost:8000/api/tickers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTickers(data);
      })
      .catch(() => {
        // Fallback default sample tickers if server is booting
        setTickers([
          { symbol: 'RELIANCE', name: 'Reliance Industries', ltp: 2950.4, changePct: 0.85, market: 'IN', currency: 'INR' },
          { symbol: 'NIFTY50', name: 'Nifty 50 Index', ltp: 24350.0, changePct: 0.42, market: 'IN', currency: 'INR' },
          { symbol: 'TCS', name: 'Tata Consultancy', ltp: 4120.5, changePct: -0.31, market: 'IN', currency: 'INR' },
          { symbol: 'AAPL', name: 'Apple Inc.', ltp: 232.1, changePct: 1.15, market: 'US', currency: 'USD' },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', ltp: 141.2, changePct: 2.45, market: 'US', currency: 'USD' },
          { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', ltp: 1740.0, changePct: 0.22, market: 'IN', currency: 'INR' }
        ]);
      });
  }, []);

  // Compute live interactive risk auto-sizer metrics
  const riskPerShare = Math.max(0.1, Math.abs(calcEntry - calcStopLoss));
  const maxRiskAmount = (calcEquity * (calcRiskPct / 100));
  const recommendedShares = Math.max(1, Math.floor(maxRiskAmount / riskPerShare));
  const totalPositionValue = recommendedShares * calcEntry;

  return (
    <div className="space-y-20 pb-20 select-none">
      {/* 1. Live Market Ticker Tape */}
      <div className="bg-[#0c121f] border-b border-[#1b253b] overflow-hidden py-2.5">
        <div className="flex items-center gap-2 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SIMULATED 24/7 FEED</span>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 text-xs font-mono">
            {tickers.map((t) => {
              const isUp = t.changePct >= 0;
              return (
                <Link
                  key={t.symbol}
                  to="/app"
                  className="flex items-center gap-2 shrink-0 hover:bg-slate-800/40 px-2 py-0.5 rounded transition-colors"
                >
                  <span className="font-bold text-slate-200">{t.symbol}</span>
                  <span className="text-slate-400 text-[11px]">
                    {t.currency === 'USD' ? '$' : '₹'}{t.ltp?.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-bold flex items-center ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '+' : ''}{t.changePct?.toFixed(2)}%
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Institutional Pre-Trade Risk Gatekeeper Built-In</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Master Market Structure. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Master Pre-Trade Risk.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              An India-first, zero-fee financial research, simulated execution, and paper-trading terminal. Experience 24/7 realistic market simulation, 20-level Level 2 DOM ladders, and real-time Black-Scholes Options Greeks — with synchronous 1% risk guardrails.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/app"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Launch Trading Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-[#0c121f] hover:bg-[#141d30] border border-[#1b253b] text-slate-200 font-semibold text-sm transition-all"
              >
                Create ₹10 Lakh Paper Account
              </Link>
              <Link
                to="/learning"
                className="px-4 py-3.5 text-slate-400 hover:text-white font-semibold text-sm flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Learning Academy</span>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#1b253b]">
              <div>
                <div className="text-2xl font-black text-white">₹0 / Free</div>
                <div className="text-xs text-slate-400 font-medium">Zero Subscription Fees</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">1.0% Cap</div>
                <div className="text-xs text-slate-400 font-medium">Single-Trade Risk Guardrail</div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-400">24/7 GBM</div>
                <div className="text-xs text-slate-400 font-medium">Continuous Market Sim</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive 1% Risk Auto-Sizer Demo */}
          <div className="lg:col-span-5">
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
              
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1b253b]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span className="font-bold text-sm text-white">Live Pre-Trade Risk Guardrail</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                  SYNCHRONOUS
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Paper Account Capital:</span>
                    <span className="font-mono text-white font-bold">₹{calcEquity.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="5000000"
                    step="50000"
                    value={calcEquity}
                    onChange={(e) => setCalcEquity(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Entry Price (₹):</label>
                    <input
                      type="number"
                      value={calcEntry}
                      onChange={(e) => setCalcEntry(Number(e.target.value))}
                      className="w-full bg-[#070b14] border border-[#1b253b] rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Stop-Loss Price (₹):</label>
                    <input
                      type="number"
                      value={calcStopLoss}
                      onChange={(e) => setCalcStopLoss(Number(e.target.value))}
                      className="w-full bg-[#070b14] border border-[#1b253b] rounded-lg px-3 py-2 text-rose-400 font-mono"
                    />
                  </div>
                </div>

                {/* Calculated Auto-Size Metric Card */}
                <div className="bg-[#070b14] border border-[#1b253b] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Single-Trade Risk Cap (1.0%):</span>
                    <span className="font-mono font-bold text-amber-400">₹{maxRiskAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Risk Distance Per Share:</span>
                    <span className="font-mono text-slate-200">₹{riskPerShare.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#1b253b] flex justify-between items-center">
                    <span className="font-bold text-white text-xs">Safe Position Size:</span>
                    <span className="font-mono font-black text-emerald-400 text-base">
                      {recommendedShares} Shares
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 text-right">
                    Total Position Value: ₹{totalPositionValue.toLocaleString()}
                  </div>
                </div>

                <Link
                  to="/app"
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center block transition-all shadow-md shadow-emerald-600/20"
                >
                  Test Auto-Sizer in Live Terminal &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Architectural Invariants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
            Engineered for Retail Survival
          </h2>
          <h3 className="text-3xl font-extrabold text-white">
            Built Around Non-Negotiable Risk Invariants
          </h3>
          <p className="text-slate-400 text-sm mt-3">
            90% of retail traders blow their accounts within 90 days due to lack of risk discipline. TradeSphere AI embeds institutional risk controls directly into the order lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invariant 1 */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Pre-Trade Risk Gatekeeper</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              No order can be executed without passing synchronous pre-trade validation. The engine strictly blocks any order with risk exceeding 1.0% of account equity and requires a hard stop-loss.
            </p>
            <div className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
              <span>Automatic Max Safe Quantity</span> &rarr;
            </div>
          </div>

          {/* Invariant 2 */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">3% Daily Drawdown Circuit Breaker</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-time MTM monitoring automatically halts all opening orders for the remainder of the session if daily drawdown hits 3.0% of day-start capital, completely eliminating revenge trading.
            </p>
            <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
              <span>Automated Capital Protection</span> &rarr;
            </div>
          </div>

          {/* Invariant 3 */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">24/7 Zero-Key Market Simulator</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Realistic Geometric Brownian Motion (GBM) tick engine running continuously. Generates 20-level Level 2 DOM order books and multi-timeframe candles so you can practice even on weekends.
            </p>
            <div className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
              <span>Zero Cost / No API Keys Needed</span> &rarr;
            </div>
          </div>
        </div>
      </section>

      {/* 4. Adaptive 3-Tier Progressive Complexity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-[#0c121f] to-[#070b14] border border-[#1b253b] rounded-3xl p-8 lg:p-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
              Adaptive Progressive Complexity
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              One Unified Terminal. Three Tailored Tiers.
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Beginners get guided risk guardrails without cognitive overload. Experienced quants get Level 2 DOM ladders, Black-Scholes Greeks, and vectorized backtesters.
            </p>

            {/* Tier Switcher Buttons */}
            <div className="inline-flex items-center gap-1 bg-[#070b14] p-1 rounded-xl border border-[#1b253b] mt-6 text-xs">
              <button
                onClick={() => setActiveTier('basic')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTier === 'basic' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tier 1: Basic (Guided)
              </button>
              <button
                onClick={() => setActiveTier('active')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTier === 'active' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tier 2: Active Trader
              </button>
              <button
                onClick={() => setActiveTier('pro')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTier === 'pro' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tier 3: Pro Quant
              </button>
            </div>
          </div>

          {/* Tier Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTier === 'basic' && (
              <>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-blue-400">Clean Charting</div>
                  <h4 className="text-white font-bold text-sm">Visual Trend Guides</h4>
                  <p className="text-slate-400 text-xs">
                    Simplified charts showing only essential 20-EMA trend directions and dynamic Support/Resistance zones.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Automated Guardrails</div>
                  <h4 className="text-white font-bold text-sm">1% Auto-Risk Sizing</h4>
                  <p className="text-slate-400 text-xs">
                    One-click auto-sizer calculates exact shares to purchase based on your stop-loss distance, ensuring you never risk more than 1%.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-indigo-400">Contextual Mentorship</div>
                  <h4 className="text-white font-bold text-sm">Plain-English AI Coach</h4>
                  <p className="text-slate-400 text-xs">
                    Deterministic coaching cards translating technical price action into clear market structure guidelines.
                  </p>
                </div>
              </>
            )}

            {activeTier === 'active' && (
              <>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-blue-400">Multi-Timeframe</div>
                  <h4 className="text-white font-bold text-sm">VWAP & Bollinger Bands</h4>
                  <p className="text-slate-400 text-xs">
                    1m, 5m, 15m, and 1D candlestick charts with volume profiles, RSI(14), and dual-market watchlists.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Execution Agility</div>
                  <h4 className="text-white font-bold text-sm">Bracket OCO Orders</h4>
                  <p className="text-slate-400 text-xs">
                    One-Cancels-the-Other state machine automatically links Take-Profit and Stop-Loss orders with sub-second cancellations.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-indigo-400">Performance Tracking</div>
                  <h4 className="text-white font-bold text-sm">Automated Trade Journal</h4>
                  <p className="text-slate-400 text-xs">
                    Comprehensive log calculating R-multiples, win expectancy, and MTM profit/loss across every trade.
                  </p>
                </div>
              </>
            )}

            {activeTier === 'pro' && (
              <>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-blue-400">Market Microstructure</div>
                  <h4 className="text-white font-bold text-sm">20-Depth Level 2 DOM</h4>
                  <p className="text-slate-400 text-xs">
                    Real-time order book ladder with bid/ask depth volume bars, spread analytics, and instant fill triggers.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Options Analytics</div>
                  <h4 className="text-white font-bold text-sm">Black-Scholes Greeks</h4>
                  <p className="text-slate-400 text-xs">
                    Live computation of Delta, Gamma, Theta, Vega, and IV via Newton-Raphson across strikes and 0-DTE to 30D expiries.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-indigo-400">Quantitative Strategy</div>
                  <h4 className="text-white font-bold text-sm">Vectorized Backtester</h4>
                  <p className="text-slate-400 text-xs">
                    Backtest EMA cross, RSI mean reversion, and VWAP breakout strategies with Sharpe ratio, max drawdown, and equity curves.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Explore All 3 Tiers in the Live Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Learning Academy Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">TradeSphere Academy</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Structured Learning for Every Stage</h3>
          </div>
          <Link to="/learning" className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mt-2 md:mt-0">
            <span>View Full Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              MODULE 1
            </span>
            <h4 className="text-base font-bold text-white">Pre-Trade Risk Management 101</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Why position sizing is 10x more important than entry timing. Master the 1% risk rule, R-multiples, and account survival mathematics.
            </p>
            <Link to="/learning#risk-basics" className="text-xs text-blue-400 font-semibold hover:underline block pt-2">
              Start Module &rarr;
            </Link>
          </div>

          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              MODULE 2
            </span>
            <h4 className="text-base font-bold text-white">Market Structure & Auction Theory</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Understand VWAP, 20-EMA trend alignment, and Level 2 DOM order book dynamics. Learn how institutional liquidity works.
            </p>
            <Link to="/learning#market-structure" className="text-xs text-indigo-400 font-semibold hover:underline block pt-2">
              Start Module &rarr;
            </Link>
          </div>

          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MODULE 3
            </span>
            <h4 className="text-base font-bold text-white">Options Greeks & Volatility Surface</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Demystify Black-Scholes Delta, Gamma, Theta decay, and Implied Volatility. Transition from gambling to quantitative options trading.
            </p>
            <Link to="/learning#options-mastery" className="text-xs text-emerald-400 font-semibold hover:underline block pt-2">
              Start Module &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 6. High-Impact Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              Start Trading With Complete Discipline Today.
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              No credit card required. No API keys needed. Instant ₹10,00,000 simulated capital with institutional risk guardrails out of the box.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/app"
                className="px-8 py-3.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-sm shadow-lg transition-all hover:scale-105"
              >
                Launch Live Terminal Now
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-blue-950/60 hover:bg-blue-950 text-white border border-white/20 font-bold text-sm transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
