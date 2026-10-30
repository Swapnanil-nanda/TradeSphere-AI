import React, { useState } from 'react';
import { XCircle, CheckCircle2, Clock, BookOpen, AlertCircle } from 'lucide-react';

export default function PortfolioBlotter({ portfolio, onClosePosition }) {
  const [tab, setTab] = useState('positions');

  const positions = portfolio?.positions || [];
  const orders = portfolio?.orders || [];
  const trades = portfolio?.trades || [];

  return (
    <div className="h-48 border-t border-[#1b253b] bg-[#0c121f] flex flex-col select-none text-xs">
      {/* Blotter Navigation Header */}
      <div className="h-9 px-4 border-b border-[#1b253b] flex items-center justify-between bg-[#090d16]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('positions')}
            className={`px-3 py-1.5 font-bold transition-all border-b-2 ${
              tab === 'positions'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Positions ({positions.length})
          </button>

          <button
            onClick={() => setTab('orders')}
            className={`px-3 py-1.5 font-bold transition-all border-b-2 ${
              tab === 'orders'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Orders Audit ({orders.length})
          </button>

          <button
            onClick={() => setTab('journal')}
            className={`px-3 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              tab === 'journal'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Trade Journal ({trades.length})</span>
          </button>
        </div>

        {/* Live Unrealized PnL summary */}
        {positions.length > 0 && (
          <div className="text-[11px] font-['JetBrains_Mono']">
            Total MTM PnL:{' '}
            <b className={portfolio.account.totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {portfolio.account.totalUnrealizedPnL >= 0 ? '+' : ''}₹{portfolio.account.totalUnrealizedPnL?.toFixed(2)}
            </b>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* 1. POSITIONS TAB */}
        {tab === 'positions' && (
          positions.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No open positions. Submit an order from the Smart Order Ticket.
            </div>
          ) : (
            <table className="w-full text-left font-['JetBrains_Mono'] text-[11px]">
              <thead className="text-[10px] text-slate-400 uppercase bg-[#070b14] border-b border-[#1b253b] font-sans">
                <tr>
                  <th className="py-1.5 px-3">Symbol</th>
                  <th className="py-1.5 px-3">Side</th>
                  <th className="py-1.5 px-3">Qty</th>
                  <th className="py-1.5 px-3">Avg Entry</th>
                  <th className="py-1.5 px-3">LTP</th>
                  <th className="py-1.5 px-3">Stop Loss</th>
                  <th className="py-1.5 px-3">Take Profit</th>
                  <th className="py-1.5 px-3">Unrealized P&L</th>
                  <th className="py-1.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b253b]/30">
                {positions.map(pos => {
                  const isProfit = pos.unrealizedPnL >= 0;
                  return (
                    <tr key={pos.symbol} className="hover:bg-slate-800/30">
                      <td className="py-1.5 px-3 font-bold text-white font-sans">{pos.symbol}</td>
                      <td className="py-1.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-white">{pos.quantity}</td>
                      <td className="py-1.5 px-3 text-slate-300">₹{pos.avgPrice?.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-white">₹{pos.currentPrice?.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-rose-400">₹{pos.stopLoss || 'N/A'}</td>
                      <td className="py-1.5 px-3 text-emerald-400">₹{pos.takeProfit || 'N/A'}</td>
                      <td className={`py-1.5 px-3 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}₹{pos.unrealizedPnL?.toFixed(2)} ({pos.unrealizedPnLPct}%)
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <button
                          onClick={() => onClosePosition(pos.symbol)}
                          className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-sans font-semibold text-[10px] transition-all"
                        >
                          Close Market
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {/* 2. ORDERS AUDIT TAB */}
        {tab === 'orders' && (
          orders.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No orders submitted in this session.
            </div>
          ) : (
            <table className="w-full text-left font-['JetBrains_Mono'] text-[11px]">
              <thead className="text-[10px] text-slate-400 uppercase bg-[#070b14] border-b border-[#1b253b] font-sans">
                <tr>
                  <th className="py-1.5 px-3">Order ID</th>
                  <th className="py-1.5 px-3">Time</th>
                  <th className="py-1.5 px-3">Symbol</th>
                  <th className="py-1.5 px-3">Side</th>
                  <th className="py-1.5 px-3">Type</th>
                  <th className="py-1.5 px-3">Qty</th>
                  <th className="py-1.5 px-3">Fill Price</th>
                  <th className="py-1.5 px-3">Risk (₹)</th>
                  <th className="py-1.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b253b]/30">
                {orders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-800/30">
                    <td className="py-1.5 px-3 text-slate-400">{ord.id}</td>
                    <td className="py-1.5 px-3 text-slate-400">{new Date(ord.timestamp).toLocaleTimeString()}</td>
                    <td className="py-1.5 px-3 font-bold text-white font-sans">{ord.symbol}</td>
                    <td className="py-1.5 px-3">
                      <span className={`px-1 rounded text-[9px] font-bold ${ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-300">{ord.orderType}</td>
                    <td className="py-1.5 px-3 text-white">{ord.quantity}</td>
                    <td className="py-1.5 px-3 text-white">₹{ord.executionPrice?.toFixed(2)}</td>
                    <td className="py-1.5 px-3 text-slate-300">₹{ord.riskAmount?.toFixed(2)}</td>
                    <td className="py-1.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* 3. TRADE JOURNAL TAB */}
        {tab === 'journal' && (
          trades.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No trades completed yet. Exited positions will record here with R-multiples.
            </div>
          ) : (
            <table className="w-full text-left font-['JetBrains_Mono'] text-[11px]">
              <thead className="text-[10px] text-slate-400 uppercase bg-[#070b14] border-b border-[#1b253b] font-sans">
                <tr>
                  <th className="py-1.5 px-3">Execution ID</th>
                  <th className="py-1.5 px-3">Symbol</th>
                  <th className="py-1.5 px-3">Action</th>
                  <th className="py-1.5 px-3">Qty</th>
                  <th className="py-1.5 px-3">Entry / Exit</th>
                  <th className="py-1.5 px-3">Realized PnL</th>
                  <th className="py-1.5 px-3">R-Multiple</th>
                  <th className="py-1.5 px-3">Reason / Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b253b]/30">
                {trades.map(trd => (
                  <tr key={trd.id} className="hover:bg-slate-800/30">
                    <td className="py-1.5 px-3 text-slate-400">{trd.id}</td>
                    <td className="py-1.5 px-3 font-bold text-white font-sans">{trd.symbol}</td>
                    <td className="py-1.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        trd.action === 'ENTRY' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {trd.action}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-white">{trd.quantity}</td>
                    <td className="py-1.5 px-3 text-slate-300">
                      {trd.action === 'ENTRY' ? `₹${trd.price?.toFixed(2)}` : `₹${trd.entryPrice?.toFixed(2)} → ₹${trd.exitPrice?.toFixed(2)}`}
                    </td>
                    <td className="py-1.5 px-3 font-bold">
                      {trd.realizedPnL !== undefined ? (
                        <span className={trd.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {trd.realizedPnL >= 0 ? '+' : ''}₹{trd.realizedPnL?.toFixed(2)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-1.5 px-3 font-bold text-cyan-400">
                      {trd.rMultiple ? `${trd.rMultiple}R` : '—'}
                    </td>
                    <td className="py-1.5 px-3 text-slate-400 font-sans text-[10px]">
                      {trd.exitReason || 'New position opened'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
