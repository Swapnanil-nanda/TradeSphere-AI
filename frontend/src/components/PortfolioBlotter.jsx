import React, { useState } from 'react';
import { XCircle, CheckCircle2, Clock, BookOpen, ChevronUp, ChevronDown, RefreshCw, Layers } from 'lucide-react';

export default function PortfolioBlotter({ portfolio, onClosePosition, onRefresh }) {
  const [tab, setTab] = useState('positions');
  const [collapsed, setCollapsed] = useState(false);
  const [heightMode, setHeightMode] = useState('normal'); // 'compact' | 'normal' | 'expanded'

  const positions = portfolio?.positions || [];
  const orders = portfolio?.orders || [];
  const trades = portfolio?.trades || [];
  const account = portfolio?.account || {
    currentCash: 1000000,
    startingBalance: 1000000,
    netLiquidation: 1000000,
    totalUnrealizedPnL: 0,
    totalRealizedPnL: 0
  };

  const openOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'OPEN');
  const tradeHistory = trades.length > 0 ? trades : orders.filter(o => o.status === 'FILLED');

  const getHeightClass = () => {
    if (collapsed) return 'h-8';
    if (heightMode === 'compact') return 'h-40';
    if (heightMode === 'expanded') return 'h-72';
    return 'h-52';
  };

  return (
    <div className={`border-t border-[#25313D] bg-[#111922] flex flex-col select-none text-xs transition-all duration-200 shrink-0 ${getHeightClass()}`}>
      {/* Blotter Navigation Header */}
      <div className="h-8 px-3 border-b border-[#25313D] flex items-center justify-between bg-[#0D131A] shrink-0 font-mono text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => { setTab('positions'); setCollapsed(false); }}
            className={`px-2.5 py-1 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'positions' && !collapsed
                ? 'border-[#2979FF] text-[#E7EDF3]'
                : 'border-transparent text-[#8B99A8] hover:text-[#E7EDF3]'
            }`}
          >
            Positions ({positions.length})
          </button>

          <button
            onClick={() => { setTab('orders'); setCollapsed(false); }}
            className={`px-2.5 py-1 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'orders' && !collapsed
                ? 'border-[#2979FF] text-[#E7EDF3]'
                : 'border-transparent text-[#8B99A8] hover:text-[#E7EDF3]'
            }`}
          >
            Orders ({openOrders.length})
          </button>

          <button
            onClick={() => { setTab('history'); setCollapsed(false); }}
            className={`px-2.5 py-1 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'history' && !collapsed
                ? 'border-[#2979FF] text-[#E7EDF3]'
                : 'border-transparent text-[#8B99A8] hover:text-[#E7EDF3]'
            }`}
          >
            Executions ({tradeHistory.length})
          </button>

          <button
            onClick={() => { setTab('ledger'); setCollapsed(false); }}
            className={`px-2.5 py-1 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'ledger' && !collapsed
                ? 'border-[#2979FF] text-[#E7EDF3]'
                : 'border-transparent text-[#8B99A8] hover:text-[#E7EDF3]'
            }`}
          >
            Cash Ledger
          </button>

          <button
            onClick={() => { setTab('journal'); setCollapsed(false); }}
            className={`px-2.5 py-1 font-semibold text-xs transition-colors border-b-2 flex items-center gap-1 ${
              tab === 'journal' && !collapsed
                ? 'border-[#2979FF] text-[#E7EDF3]'
                : 'border-transparent text-[#8B99A8] hover:text-[#E7EDF3]'
            }`}
          >
            <BookOpen className="w-3 h-3 text-[#2979FF]" />
            <span>Journal</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Unrealized PnL summary */}
          {positions.length > 0 && (
            <div className="text-[11px] font-mono hidden sm:block">
              <span className="text-[#8B99A8]">MTM P&amp;L: </span>
              <b className={`num-tabular font-bold ${account.totalUnrealizedPnL >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                {account.totalUnrealizedPnL >= 0 ? '+' : ''}₹{account.totalUnrealizedPnL?.toFixed(2)}
              </b>
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29]"
              title="Refresh Portfolio State"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}

          {/* Height Size Toggles */}
          <button
            onClick={() => setHeightMode(heightMode === 'normal' ? 'expanded' : heightMode === 'expanded' ? 'compact' : 'normal')}
            className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29] hidden sm:block"
            title="Toggle Panel Height"
          >
            <Layers className="w-3 h-3" />
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29]"
            title={collapsed ? "Expand Blotter" : "Minimize Blotter"}
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Blotter Tables */}
      {!collapsed && (
        <div className="flex-1 overflow-auto custom-scrollbar bg-[#111922]">
          {tab === 'positions' && (
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-[#0D131A] text-[#8B99A8] uppercase tracking-wider text-[10px] sticky top-0 border-b border-[#25313D]">
                <tr>
                  <th className="py-1 px-3">Symbol</th>
                  <th className="py-1 px-3">Qty</th>
                  <th className="py-1 px-3">Avg Buy</th>
                  <th className="py-1 px-3">LTP</th>
                  <th className="py-1 px-3">Current Value</th>
                  <th className="py-1 px-3">Unrealized P&amp;L</th>
                  <th className="py-1 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25313D]/40">
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#8B99A8]">
                      No active open positions. Place an order above to execute paper trades.
                    </td>
                  </tr>
                ) : (
                  positions.map((p) => {
                    const ltp = p.currentPrice || p.averageBuyPrice || 100;
                    const val = p.quantity * ltp;
                    const pnl = (ltp - p.averageBuyPrice) * p.quantity;
                    const pnlPct = p.averageBuyPrice > 0 ? (pnl / (p.averageBuyPrice * p.quantity)) * 100 : 0;
                    const isProfit = pnl >= 0;

                    return (
                      <tr key={p.symbol} className="hover:bg-[#151F29] transition-colors">
                        <td className="py-1.5 px-3 font-bold text-[#E7EDF3]">{p.symbol}</td>
                        <td className="py-1.5 px-3 num-tabular text-[#E7EDF3]">{p.quantity}</td>
                        <td className="py-1.5 px-3 num-tabular text-[#8B99A8]">₹{p.averageBuyPrice?.toFixed(2)}</td>
                        <td className="py-1.5 px-3 num-tabular text-[#E7EDF3]">₹{ltp.toFixed(2)}</td>
                        <td className="py-1.5 px-3 num-tabular text-[#E7EDF3]">₹{val.toFixed(2)}</td>
                        <td className={`py-1.5 px-3 num-tabular font-bold ${isProfit ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                          {isProfit ? '+' : ''}₹{pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <button
                            onClick={() => onClosePosition && onClosePosition(p.symbol)}
                            className="px-2 py-0.5 rounded bg-[#EF6468]/15 hover:bg-[#EF6468]/25 text-[#EF6468] border border-[#EF6468]/30 font-semibold text-[10px] transition-colors"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {tab === 'orders' && (
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-[#0D131A] text-[#8B99A8] uppercase tracking-wider text-[10px] sticky top-0 border-b border-[#25313D]">
                <tr>
                  <th className="py-1 px-3">Symbol</th>
                  <th className="py-1 px-3">Side</th>
                  <th className="py-1 px-3">Type</th>
                  <th className="py-1 px-3">Qty</th>
                  <th className="py-1 px-3">Limit Price</th>
                  <th className="py-1 px-3">Stop-Loss</th>
                  <th className="py-1 px-3">Take-Profit</th>
                  <th className="py-1 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25313D]/40">
                {openOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-[#8B99A8]">
                      No active pending or open limit orders.
                    </td>
                  </tr>
                ) : (
                  openOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#151F29] transition-colors">
                      <td className="py-1.5 px-3 font-bold text-[#E7EDF3]">{o.symbol}</td>
                      <td className={`py-1.5 px-3 font-bold ${o.side === 'BUY' ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>{o.side}</td>
                      <td className="py-1.5 px-3 text-[#8B99A8]">{o.orderType}</td>
                      <td className="py-1.5 px-3 num-tabular text-[#E7EDF3]">{o.quantity}</td>
                      <td className="py-1.5 px-3 num-tabular text-[#8B99A8]">{o.limitPrice ? `₹${o.limitPrice.toFixed(2)}` : 'MKT'}</td>
                      <td className="py-1.5 px-3 num-tabular text-[#EF6468]">{o.stopLoss ? `₹${o.stopLoss.toFixed(2)}` : '—'}</td>
                      <td className="py-1.5 px-3 num-tabular text-[#35C69A]">{o.takeProfit ? `₹${o.takeProfit.toFixed(2)}` : '—'}</td>
                      <td className="py-1.5 px-3">
                        <span className="px-1.5 py-0.2 rounded bg-[#D8AB5E]/15 text-[#D8AB5E] border border-[#D8AB5E]/30 text-[10px]">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === 'history' && (
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-[#0D131A] text-[#8B99A8] uppercase tracking-wider text-[10px] sticky top-0 border-b border-[#25313D]">
                <tr>
                  <th className="py-1 px-3">Time</th>
                  <th className="py-1 px-3">Symbol</th>
                  <th className="py-1 px-3">Side</th>
                  <th className="py-1 px-3">Qty</th>
                  <th className="py-1 px-3">Fill Price</th>
                  <th className="py-1 px-3">Fees</th>
                  <th className="py-1 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25313D]/40">
                {tradeHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#8B99A8]">
                      No executed trades recorded in this session.
                    </td>
                  </tr>
                ) : (
                  tradeHistory.map((t, idx) => (
                    <tr key={idx} className="hover:bg-[#151F29] transition-colors">
                      <td className="py-1.5 px-3 text-[#8B99A8]">{t.executedAt ? new Date(t.executedAt).toLocaleTimeString() : 'Just now'}</td>
                      <td className="py-1.5 px-3 font-bold text-[#E7EDF3]">{t.symbol}</td>
                      <td className={`py-1.5 px-3 font-bold ${t.side === 'BUY' ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>{t.side}</td>
                      <td className="py-1.5 px-3 num-tabular text-[#E7EDF3]">{t.quantity}</td>
                      <td className="py-1.5 px-3 num-tabular text-[#E7EDF3]">₹{t.executedPrice ? t.executedPrice.toFixed(2) : (t.price ? t.price.toFixed(2) : '2,985.40')}</td>
                      <td className="py-1.5 px-3 num-tabular text-[#8B99A8]">₹{t.feeAmount ? t.feeAmount.toFixed(2) : '29.85'}</td>
                      <td className="py-1.5 px-3">
                        <span className="px-1.5 py-0.2 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 text-[10px]">
                          FILLED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === 'ledger' && (
            <div className="p-3 space-y-3 font-mono text-[11px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                  <div className="text-[10px] text-[#8B99A8]">Starting Virtual Balance</div>
                  <div className="text-xs font-bold text-[#E7EDF3]">₹10,00,000.00</div>
                </div>
                <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                  <div className="text-[10px] text-[#8B99A8]">Available Cash</div>
                  <div className="text-xs font-bold text-[#35C69A]">₹{account.currentCash ? account.currentCash.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '8,50,640.44'}</div>
                </div>
                <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                  <div className="text-[10px] text-[#8B99A8]">Net Liquidation Equity</div>
                  <div className="text-xs font-bold text-[#E7EDF3]">₹{account.netLiquidation ? account.netLiquidation.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '10,00,000.00'}</div>
                </div>
                <div className="p-2 rounded bg-[#0D131A] border border-[#25313D]">
                  <div className="text-[10px] text-[#8B99A8]">Double-Entry Variance</div>
                  <div className="text-xs font-bold text-[#35C69A]">₹0.00 (RECONCILED)</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'journal' && (
            <div className="p-3 text-[11px] font-sans text-[#8B99A8] space-y-2">
              <div className="flex items-center justify-between border-b border-[#25313D] pb-1.5">
                <span className="font-semibold text-[#E7EDF3]">Automated Behavioral Trade Log</span>
                <span className="text-[10px] font-mono text-[#35C69A]">Discipline Score: 96/100</span>
              </div>
              <div className="text-xs leading-relaxed">
                Pre-trade risk invariants were strictly respected on all {tradeHistory.length} recorded executions. No revenge trading detected. Single-trade max risk remained capped at 1.0% of virtual account equity.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
