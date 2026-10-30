import React, { useState } from 'react';
import { XCircle, CheckCircle2, Clock, BookOpen, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

export default function PortfolioBlotter({ portfolio, onClosePosition, onRefresh }) {
  const [tab, setTab] = useState('positions');
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <div className={`border-t border-slate-200 dark:border-[#1b253b] bg-white dark:bg-[#0c121f] flex flex-col select-none text-xs transition-all duration-200 shrink-0 ${
      collapsed ? 'h-9' : 'h-52'
    }`}>
      {/* Blotter Navigation Header */}
      <div className="h-9 px-3 border-b border-slate-200 dark:border-[#1b253b] flex items-center justify-between bg-slate-50 dark:bg-[#090d16]">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => { setTab('positions'); setCollapsed(false); }}
            className={`px-3 py-1.5 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'positions' && !collapsed
                ? 'border-blue-600 text-blue-600 dark:text-white dark:border-blue-500'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Positions ({positions.length})
          </button>

          <button
            onClick={() => { setTab('orders'); setCollapsed(false); }}
            className={`px-3 py-1.5 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'orders' && !collapsed
                ? 'border-blue-600 text-blue-600 dark:text-white dark:border-blue-500'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Open Orders ({openOrders.length})
          </button>

          <button
            onClick={() => { setTab('history'); setCollapsed(false); }}
            className={`px-3 py-1.5 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'history' && !collapsed
                ? 'border-blue-600 text-blue-600 dark:text-white dark:border-blue-500'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Trade History ({tradeHistory.length})
          </button>

          <button
            onClick={() => { setTab('journal'); setCollapsed(false); }}
            className={`px-3 py-1.5 font-semibold text-xs transition-colors border-b-2 flex items-center gap-1 ${
              tab === 'journal' && !collapsed
                ? 'border-blue-600 text-blue-600 dark:text-white dark:border-blue-500'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Journal</span>
          </button>

          <button
            onClick={() => { setTab('ledger'); setCollapsed(false); }}
            className={`px-3 py-1.5 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'ledger' && !collapsed
                ? 'border-blue-600 text-blue-600 dark:text-white dark:border-blue-500'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Cash Ledger
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Unrealized PnL summary */}
          {positions.length > 0 && (
            <div className="text-[11px] font-mono tabular-nums hidden sm:block">
              MTM P&amp;L:{' '}
              <b className={account.totalUnrealizedPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {account.totalUnrealizedPnL >= 0 ? '+' : ''}₹{account.totalUnrealizedPnL?.toFixed(2)}
              </b>
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Refresh Blotter"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title={collapsed ? 'Expand Blotter' : 'Collapse Blotter'}
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Blotter Content Table */}
      {!collapsed && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* TAB 1: POSITIONS */}
          {tab === 'positions' && (
            positions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No active open positions. Place an order to execute a trade.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-50 dark:bg-[#090d16] text-slate-500 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-[#1b253b]">
                  <tr>
                    <th className="py-1.5 px-3 font-semibold">Instrument</th>
                    <th className="py-1.5 px-3 font-semibold">Qty</th>
                    <th className="py-1.5 px-3 font-semibold">Avg Price</th>
                    <th className="py-1.5 px-3 font-semibold">LTP</th>
                    <th className="py-1.5 px-3 font-semibold">Unrealized P&amp;L</th>
                    <th className="py-1.5 px-3 font-semibold">Hard Stop</th>
                    <th className="py-1.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
                  {positions.map((pos) => {
                    const isProfit = (pos.unrealizedPnL || 0) >= 0;
                    return (
                      <tr key={pos.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono">
                        <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{pos.symbol}</td>
                        <td className={`py-1.5 px-3 font-bold ${pos.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                        </td>
                        <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300">₹{pos.avgPrice?.toFixed(2)}</td>
                        <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300">₹{pos.currentPrice?.toFixed(2)}</td>
                        <td className={`py-1.5 px-3 font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isProfit ? '+' : ''}₹{pos.unrealizedPnL?.toFixed(2)} ({pos.unrealizedPnLPct?.toFixed(2)}%)
                        </td>
                        <td className="py-1.5 px-3 text-rose-600 dark:text-rose-400">
                          {pos.stopLoss ? `₹${pos.stopLoss.toFixed(2)}` : 'Mandatory'}
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <button
                            onClick={() => onClosePosition && onClosePosition(pos.symbol)}
                            className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-[10px] font-sans font-semibold transition-colors"
                          >
                            Close Position
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {/* TAB 2: OPEN ORDERS */}
          {tab === 'orders' && (
            openOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No active pending orders. All orders are filled or settled.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-50 dark:bg-[#090d16] text-slate-500 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-[#1b253b]">
                  <tr>
                    <th className="py-1.5 px-3 font-semibold">Order ID</th>
                    <th className="py-1.5 px-3 font-semibold">Instrument</th>
                    <th className="py-1.5 px-3 font-semibold">Side</th>
                    <th className="py-1.5 px-3 font-semibold">Type</th>
                    <th className="py-1.5 px-3 font-semibold">Qty</th>
                    <th className="py-1.5 px-3 font-semibold">Price</th>
                    <th className="py-1.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40 font-mono">
                  {openOrders.map((ord) => (
                    <tr key={ord.id || ord.clientOrderId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1.5 px-3 text-slate-500">{ord.clientOrderId || ord.id}</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-white">{ord.symbol}</td>
                      <td className={`py-1.5 px-3 font-bold ${ord.side === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {ord.side}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400 font-sans">{ord.orderType || 'MARKET'}</td>
                      <td className="py-1.5 px-3 text-slate-800 dark:text-slate-200">{ord.quantity}</td>
                      <td className="py-1.5 px-3 text-slate-800 dark:text-slate-200">₹{ord.price?.toFixed(2) || 'MKT'}</td>
                      <td className="py-1.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[10px] font-sans font-semibold">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* TAB 3: TRADE HISTORY */}
          {tab === 'history' && (
            tradeHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No trade executions recorded in this session.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-50 dark:bg-[#090d16] text-slate-500 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-[#1b253b]">
                  <tr>
                    <th className="py-1.5 px-3 font-semibold">Time</th>
                    <th className="py-1.5 px-3 font-semibold">Instrument</th>
                    <th className="py-1.5 px-3 font-semibold">Side</th>
                    <th className="py-1.5 px-3 font-semibold">Filled Qty</th>
                    <th className="py-1.5 px-3 font-semibold">Execution Price</th>
                    <th className="py-1.5 px-3 font-semibold">Realized P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40 font-mono">
                  {tradeHistory.map((tr, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1.5 px-3 text-slate-500">{tr.executedAt ? new Date(tr.executedAt).toLocaleTimeString() : 'Just now'}</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-white">{tr.symbol}</td>
                      <td className={`py-1.5 px-3 font-bold ${tr.side === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {tr.side}
                      </td>
                      <td className="py-1.5 px-3">{tr.quantity || tr.filledQuantity}</td>
                      <td className="py-1.5 px-3 text-slate-800 dark:text-slate-200">₹{(tr.price || tr.averagePrice)?.toFixed(2)}</td>
                      <td className={`py-1.5 px-3 font-bold ${(tr.realizedPnL || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {(tr.realizedPnL || 0) >= 0 ? '+' : ''}₹{(tr.realizedPnL || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* TAB 4: JOURNAL */}
          {tab === 'journal' && (
            <div className="p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Automated Post-Trade Reflection &amp; Behavioral Review</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Journal Entries: {trades.length}</span>
              </div>
              {trades.length === 0 ? (
                <div className="py-4 text-center text-slate-400">
                  Execute trades with Stop-Loss to log automated journal entries and risk discipline scores.
                </div>
              ) : (
                trades.map((tr, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {tr.symbol} • {tr.side} {tr.quantity} units @ ₹{tr.price?.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Hard Stop: ₹{tr.stopLoss?.toFixed(2) || 'Enforced'} | Target: ₹{tr.takeProfit?.toFixed(2) || '2.0R'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-500/20">
                      Discipline: 100% (1% Risk Cap)
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: CASH LEDGER */}
          {tab === 'ledger' && (
            <div className="p-3 text-xs space-y-2 font-mono">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Starting Virtual Cash</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">₹{account.startingBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Available Liquid Cash</div>
                  <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">₹{account.currentCash?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Realized P&amp;L</div>
                  <div className={`font-bold text-sm ${account.totalRealizedPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {account.totalRealizedPnL >= 0 ? '+' : ''}₹{account.totalRealizedPnL?.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Net Liquidation Value</div>
                  <div className="font-bold text-sm text-blue-600 dark:text-blue-400">₹{account.netLiquidation?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
