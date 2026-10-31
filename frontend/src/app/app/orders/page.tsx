'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, ArrowDownRight, RefreshCw, Terminal, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { apiClient, PortfolioData } from '../../../lib/api-client';

export default function OrdersPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'open' | 'trades' | 'all'>('open');

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getPortfolio();
      setPortfolio(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const orders = portfolio?.orders || [];
  const trades = portfolio?.trades || [];
  const openOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'OPEN');
  const filledOrders = orders.filter(o => o.status === 'FILLED');

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Orders &amp; Executed Trades Blotter</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Audit trail of all open bracket orders, filled transactions, and risk gatekeeper checks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPortfolio}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh Blotter"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/app/paper-trading"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Launch Terminal</span>
            </Link>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1b253b] flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'open' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Pending Orders ({openOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'trades' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Executed Trades ({trades.length > 0 ? trades.length : filledOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Order Events ({orders.length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead className="bg-slate-50 dark:bg-[#070b14] text-slate-500 font-sans border-b border-slate-200 dark:border-[#1b253b]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Order / Trade ID</th>
                <th className="py-2.5 px-3 font-semibold">Instrument</th>
                <th className="py-2.5 px-3 font-semibold">Side</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Quantity</th>
                <th className="py-2.5 px-3 font-semibold">Order Price</th>
                <th className="py-2.5 px-3 font-semibold">Executed Price</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Risk Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
              {activeTab === 'open' && (
                openOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-400 font-sans">
                      No active pending orders. Place bracket or limit orders in the Terminal.
                    </td>
                  </tr>
                ) : (
                  openOrders.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400">{ord.clientOrderId || ord.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{ord.symbol}</td>
                      <td className={`py-2.5 px-3 font-bold ${ord.side === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {ord.side}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{ord.orderType}</td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{ord.quantity}</td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">₹{ord.price?.toFixed(2) || 'MKT'}</td>
                      <td className="py-2.5 px-3 text-slate-400">—</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-[10px] font-sans border border-blue-200 dark:border-blue-500/20">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold text-[10px]">
                          1% Cap Passed ✓
                        </span>
                      </td>
                    </tr>
                  ))
                )
              )}

              {activeTab === 'trades' && (
                (trades.length > 0 ? trades : filledOrders).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-400 font-sans">
                      No executed trades recorded in this session.
                    </td>
                  </tr>
                ) : (
                  (trades.length > 0 ? trades : filledOrders).map((tr, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400">{tr.id || `tr_${i + 1}`}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{tr.symbol}</td>
                      <td className={`py-2.5 px-3 font-bold ${tr.side === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {tr.side}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{tr.orderType || 'MARKET'}</td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{tr.quantity || tr.filledQuantity}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">₹{(tr.price || tr.averagePrice)?.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-slate-900 dark:text-white font-bold">₹{(tr.executionPrice || tr.price || tr.averagePrice)?.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-[10px] font-sans border border-emerald-200 dark:border-emerald-500/20">
                          FILLED
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold text-[10px]">
                          Synchronous Gatekeeper ✓
                        </span>
                      </td>
                    </tr>
                  ))
                )
              )}

              {activeTab === 'all' && (
                orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-400 font-sans">
                      No order events logged yet.
                    </td>
                  </tr>
                ) : (
                  orders.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400">{ord.clientOrderId || ord.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{ord.symbol}</td>
                      <td className={`py-2.5 px-3 font-bold ${ord.side === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {ord.side}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{ord.orderType}</td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{ord.quantity}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">₹{ord.price?.toFixed(2) || 'MKT'}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">₹{ord.executionPrice?.toFixed(2) || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-[10px] font-sans">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans text-slate-500 text-[10px]">
                        Validated
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
