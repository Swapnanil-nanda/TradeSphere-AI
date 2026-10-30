import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 select-none text-slate-300 text-xs leading-relaxed">
      <div className="border-b border-[#1b253b] pb-4">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          Statutory & Regulatory Notice
        </span>
        <h1 className="text-3xl font-black text-white mt-3">Mandatory Regulatory Disclaimer</h1>
        <p className="text-slate-400 text-xs mt-1">Last Updated: October 2026</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
        <div className="text-xs text-amber-200/90 leading-relaxed space-y-1">
          <strong className="text-white block font-bold">EDUCATIONAL AND SIMULATION USE ONLY:</strong>
          TradeSphere AI is solely an educational financial research tool and simulated paper-trading platform. 
          TradeSphere AI is <strong>NOT</strong> registered with the Securities and Exchange Board of India (SEBI), the US Securities and Exchange Commission (SEC), or any other financial regulatory authority.
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">1. No Financial or Investment Advice</h2>
        <p>
          None of the content, charts, indicators, options Greeks, algorithmic backtests, AI coaching notes, or simulated order book information provided on TradeSphere AI constitutes financial advice, investment recommendations, endorsements, or solicitations to buy or sell any security, derivative, commodity, or currency.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Synthetic Simulation Data (GBM & ATR)</h2>
        <p>
          All market prices, tick streams, candlestick aggregations, and order book depth displayed on the platform are generated using synthetic mathematical models (including Geometric Brownian Motion with stochastic drift) or delayed historical datasets. They do not represent live executable exchange liquidity. Never base real-money financial decisions on simulated platform data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Zero Real-Money Transactions</h2>
        <p>
          No real monetary transactions, live broker routing, or real client capital custody occur on TradeSphere AI. All orders placed are recorded exclusively within a local browser state or simulated paper ledger with virtual currency (e.g. ₹10,00,000 virtual balance).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">4. Risk of Derivatives & Equities Trading</h2>
        <p>
          Trading in financial markets, especially derivatives (Futures & Options), involves substantial financial risk. According to SEBI studies, 9 out of 10 individual traders in equity F&O segments incur significant net financial losses. Past paper-trading simulation performance does not guarantee future results in live exchange markets.
        </p>
      </section>
    </div>
  );
}
