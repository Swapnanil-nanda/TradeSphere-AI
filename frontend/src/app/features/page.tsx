import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  ShieldCheck, ArrowRight, Zap, BarChart2, Layers, Bot, 
  Lock, RefreshCw, Cpu, Activity, CheckCircle 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Features — TradeSphere AI',
  description: 'Deep-dive into TradeSphere AI pre-trade risk gatekeeper, 3% daily circuit breaker, 24/7 GBM tick simulator, simulated 20-level order books, and Black-Scholes Greeks.'
};

export default function FeaturesPage() {
  const features = [
    {
      id: 'risk-gatekeeper',
      icon: ShieldCheck,
      title: 'Pre-Trade Risk Gatekeeper (Synchronous)',
      tagline: 'Never blow an account again.',
      description: 'The core invariant of TradeSphere AI. Every single market or limit order passes through synchronous pre-trade validation before execution. If the trade risks more than 1.0% of your account equity, it is rejected with the maximum safe quantity calculated automatically.',
      points: [
        'Mandatory Stop-Loss rule: Open-ended risk is strictly prohibited.',
        '1% equity risk cap with automatic share sizing.',
        'Minimum 1.5:1 recommended Risk-to-Reward ratio verification.',
        'Instant rejection feedback explaining exact risk breach numbers.'
      ]
    },
    {
      id: 'circuit-breaker',
      icon: Lock,
      title: '3.0% Daily Drawdown Circuit Breaker',
      tagline: 'Eliminate revenge trading completely.',
      description: 'The system continuously monitors unrealized mark-to-market (MTM) and realized intraday profit/loss. When the daily drawdown hits 3.0% of starting equity, all opening order submissions are locked for the remainder of the session.',
      points: [
        'Real-time MTM portfolio valuation updated on every tick.',
        'Immediate visual warning when drawdown reaches 2.0%.',
        'Automatic order lock at 3.0% preventing emotional escalation.',
        'Positions can still be closed or hedged to protect remaining capital.'
      ]
    },
    {
      id: 'market-simulator',
      icon: Cpu,
      title: '24/7 Geometric Brownian Motion Market Simulator',
      tagline: 'Realistic continuous simulation without API keys.',
      description: 'A realistic mathematical stochastic engine running 24/7. Generates sub-second ticks using Geometric Brownian Motion (GBM) with drift and volatility parameters calibrated for both Indian (NSE) and US (NASDAQ) equities.',
      points: [
        '10 dual-market instruments (Reliance, Nifty 50, TCS, Apple, Nvidia, etc.).',
        'Realistic bid/ask spread and trade volume dynamics.',
        'Runs offline, on weekends, and during holidays without paid exchange subscriptions.',
        'Zero API key dependencies for immediate local and web testing.'
      ]
    },
    {
      id: 'level2-dom',
      icon: Layers,
      title: 'Simulated 20-Level Order Book Ladder',
      tagline: 'Institutional market microstructure visualization.',
      description: 'Inspect order book depth with 20 levels of real-time bids and asks. See where liquidity rests, spot bid/ask imbalances, and place limit orders directly from the ladder.',
      points: [
        '20 levels of continuous depth with proportional volume bars.',
        'Live spread and aggregate volume calculation.',
        'Interactive quick-order trigger from order book ladder prices.',
        'High-frequency transient DOM updates (~120ms streaming ticks) without whole-page React lag.'
      ]
    },
    {
      id: 'options-greeks',
      icon: BarChart2,
      title: 'Black-Scholes Options Greeks & Volatility Surface',
      tagline: 'Educational options analytics with closed-form European Black-Scholes Greeks and model disclosures.',
      description: 'Real-time computation of theoretical option prices and all primary first-order and second-order Greeks using the Black-Scholes-Merton model across calls and puts.',
      points: [
        'Delta (Δ), Gamma (Γ), Theta (Θ), and Vega (ν) calculated across all strikes.',
        'Implied Volatility (IV) calculated iteratively via Newton-Raphson.',
        'Expiry selectors for 0-DTE, 7-Day, 14-Day, and 30-Day options contracts.',
        'At-The-Money (ATM) and In-The-Money (ITM) strike highlighting.'
      ]
    },
    {
      id: 'backtester',
      icon: RefreshCw,
      title: 'Vectorized Quantitative Strategy Backtester',
      tagline: 'Verify edge over historical and simulated candles.',
      description: 'Fast, vectorized backtesting engine to evaluate algorithmic strategies before taking live or paper risk. Test EMA crossovers, RSI mean reversion, and VWAP breakout strategies.',
      points: [
        'Calculates Sharpe Ratio, Sortino Ratio, Maximum Drawdown %, and Win Rate %.',
        'Interactive Canvas Equity Curve rendering.',
        'Audits trade logs with entry/exit timestamps and R-multiples.',
        'Customizable fast/slow moving average periods.'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 select-none">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
          Platform Architecture &amp; Capabilities
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Everything You Need For Serious Trading Practice.
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Built without compromises. From student-friendly 1% risk calculators to quantitative 20-level DOM ladders and options Greeks.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="space-y-12">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          const isEven = index % 2 === 0;
          return (
            <div 
              key={feat.id} 
              id={feat.id}
              className="bg-[#0c121f] border border-[#1b253b] rounded-3xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-blue-500/30 transition-all"
            >
              <div className={`lg:col-span-7 space-y-4 ${isEven ? '' : 'lg:order-2'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{feat.tagline}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{feat.title}</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{feat.description}</p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {feat.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`lg:col-span-5 ${isEven ? '' : 'lg:order-1'}`}>
                <div className="bg-[#070b14] border border-[#1b253b] rounded-2xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-white font-bold text-sm">Interactive Sandbox Verified</div>
                  <p className="text-[11px] text-slate-500">
                    Accessible in Tier 2 &amp; Tier 3 modes inside the live terminal.
                  </p>
                  <Link
                    href="/app/paper-trading"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                  >
                    <span>Launch in Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8 border-t border-[#1b253b]">
        <h3 className="text-xl font-bold text-white mb-2">Ready to test these tools yourself?</h3>
        <p className="text-slate-400 text-xs mb-6">Open the free paper trading terminal with ₹10,00,000 starting equity.</p>
        <Link
          href="/app/paper-trading"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all inline-flex items-center gap-2"
        >
          <span>Open Paper Terminal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
