'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, TrendingUp, TrendingDown, ShieldCheck, AlertCircle, 
  RefreshCw, XCircle, ArrowUpRight, DollarSign, Wallet, CheckCircle2,
  Sliders, ChevronRight, Activity, Percent
} from 'lucide-react';
import { apiClient, PortfolioData, Position } from '../../../lib/api-client';

export default function PositionsPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [closingSymbol, setClosingSymbol] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClosePosition = async (sym: string) => {
    if (confirm(`Execute market square-off for ${sym}? This will close the position at current market price.`)) {
      setClosingSymbol(sym);
      try {
        await apiClient.closePosition(sym);
        setNotification(`Position ${sym} closed successfully.`);
        setTimeout(() => setNotification(null), 3500);
        await loadData();
      } catch (err: any) {
        console.error(err);
      } finally {
        setClosingSymbol(null);
      }
    }
  };

  const account = portfolio?.account;
  const positions: Position[] = portfolio?.positions || [];

  const totalUnrealizedPnL = positions.reduce((acc, p) => acc + (p.unrealizedPnL || 0), 0);
  const totalRealizedPnL = account?.realizedPnL || 0;
  const netPnL = totalRealizedPnL + totalUnrealizedPnL;
  const startingCapital = account?.startingCapital || 1000000;
  const currentEquity = account?.netLiquidation || (startingCapital + netPnL);
  const dailyDrawdownPct = Math.max(0, ((startingCapital - currentEquity) / startingCapital) * 100);
  const circuitBreakerPct = account?.circuitBreakerPct || 3.0;

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans">
      {/* Notifications */}
      {notification && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#35C69A]/10 border border-[#35C69A]/30 text-[#35C69A] animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Open Positions & MTM Blotter</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                REAL-TIME MTM
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Live mark-to-market valuations, risk boundaries, and execution controls for active positions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25313D] bg-[#151F29] hover:bg-[#1E2B38] text-[#E7EDF3] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2979FF]' : 'text-[#8B99A8]'}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/app/paper-trading"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            <span>Trade in Terminal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Account Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Net Liquidation */}
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="flex items-center justify-between text-[#8B99A8] mb-1">
            <span className="text-[11px]">Net Liquidation Value</span>
            <Wallet className="w-3.5 h-3.5 text-[#2979FF]" />
          </div>
          <div className="text-base font-bold font-mono text-[#E7EDF3]">
            ₹{currentEquity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 flex items-center gap-1">
            <span>Starting: ₹{startingCapital.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Unrealized PnL */}
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="flex items-center justify-between text-[#8B99A8] mb-1">
            <span className="text-[11px]">Total Unrealized PnL</span>
            {totalUnrealizedPnL >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#35C69A]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#EF6468]" />
            )}
          </div>
          <div className={`text-base font-bold font-mono ${totalUnrealizedPnL >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
            {totalUnrealizedPnL >= 0 ? '+' : ''}₹{totalUnrealizedPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1">
            Realized: <span className={`font-mono ${totalRealizedPnL >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
              {totalRealizedPnL >= 0 ? '+' : ''}₹{totalRealizedPnL.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Available Cash Margin */}
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="flex items-center justify-between text-[#8B99A8] mb-1">
            <span className="text-[11px]">Available Cash</span>
            <DollarSign className="w-3.5 h-3.5 text-[#D8AB5E]" />
          </div>
          <div className="text-base font-bold font-mono text-[#E7EDF3]">
            ₹{(account?.currentCash || currentEquity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1">
            Allocated: ₹{(currentEquity - (account?.currentCash || currentEquity)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Circuit Breaker Status */}
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="flex items-center justify-between text-[#8B99A8] mb-1">
            <span className="text-[11px]">Circuit Breaker Status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#35C69A]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#35C69A]"></span>
            <span className="text-xs font-bold text-[#35C69A] font-mono">NORMAL (ACTIVE)</span>
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1">
            Drawdown: <span className="font-mono text-[#E7EDF3]">{dailyDrawdownPct.toFixed(2)}%</span> / Limit: {circuitBreakerPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-[#111922] rounded-xl border border-[#25313D] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#25313D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#E7EDF3] text-xs">Open Positions</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#151F29] border border-[#25313D] text-[10px] font-mono text-[#8B99A8]">
              {positions.length} Active
            </span>
          </div>
          <span className="text-[11px] text-[#8B99A8]">All orders verified by Pre-Trade Risk Gatekeeper</span>
        </div>

        {positions.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-8 h-8 text-[#8B99A8] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-[#E7EDF3] mb-1">No Open Positions</h3>
            <p className="text-[#8B99A8] text-xs max-w-sm mx-auto mb-4">
              You currently have no active open positions. Place a market or bracket order in the Trading Terminal.
            </p>
            <Link
              href="/app/paper-trading"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2979FF] text-white font-medium hover:bg-blue-600 transition-colors"
            >
              <span>Go to Trading Terminal</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D131A] text-[#8B99A8] border-b border-[#25313D] font-mono text-[11px]">
                <tr>
                  <th className="px-3 py-2.5">SYMBOL</th>
                  <th className="px-3 py-2.5">SIDE</th>
                  <th className="px-3 py-2.5 text-right">NET QTY</th>
                  <th className="px-3 py-2.5 text-right">AVG PRICE</th>
                  <th className="px-3 py-2.5 text-right">LTP</th>
                  <th className="px-3 py-2.5 text-right">CURRENT VALUE</th>
                  <th className="px-3 py-2.5 text-right">UNREALIZED PNL</th>
                  <th className="px-3 py-2.5 text-right">RETURN %</th>
                  <th className="px-3 py-2.5 text-center">RISK STOP-LOSS</th>
                  <th className="px-3 py-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25313D] font-mono">
                {positions.map((pos) => {
                  const pnl = pos.unrealizedPnL || 0;
                  const isPositive = pnl >= 0;
                  const cost = (pos.quantity || 0) * (pos.averagePrice || 0);
                  const retPct = cost > 0 ? (pnl / cost) * 100 : 0;
                  const isClosing = closingSymbol === pos.symbol;

                  return (
                    <tr key={pos.symbol} className="hover:bg-[#151F29]/60 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-[#E7EDF3]">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/app/paper-trading?symbol=${pos.symbol}`} className="hover:text-[#2979FF]">
                            {pos.symbol}
                          </Link>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#090D12] text-[#8B99A8] border border-[#25313D]">
                            NSE
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'BUY'
                            ? 'bg-[#35C69A]/10 text-[#35C69A] border border-[#35C69A]/20'
                            : 'bg-[#EF6468]/10 text-[#EF6468] border border-[#EF6468]/20'
                        }`}>
                          {pos.side}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#E7EDF3]">{pos.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-[#8B99A8]">₹{pos.averagePrice.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right text-[#E7EDF3]">₹{pos.currentPrice.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right text-[#E7EDF3]">
                        ₹{((pos.quantity || 0) * (pos.currentPrice || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-3 py-2.5 text-right font-bold ${isPositive ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                        {isPositive ? '+' : ''}₹{pnl.toFixed(2)}
                      </td>
                      <td className={`px-3 py-2.5 text-right font-bold ${isPositive ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                        {isPositive ? '+' : ''}{retPct.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-[#151F29] border border-[#25313D] text-[10px] text-[#D8AB5E]">
                          1.0% Hard Cap
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleClosePosition(pos.symbol)}
                          disabled={isClosing}
                          className="px-2 py-1 rounded bg-[#EF6468]/15 hover:bg-[#EF6468]/25 text-[#EF6468] border border-[#EF6468]/30 font-sans text-[11px] font-medium transition-colors"
                        >
                          {isClosing ? 'Closing...' : 'Square Off'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pre-Trade Risk Invariant Notice */}
      <div className="p-3.5 rounded-xl bg-[#0D131A] border border-[#25313D] flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#35C69A] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#8B99A8] leading-relaxed">
          <strong className="text-[#E7EDF3]">Pre-Trade Risk Gatekeeper Invariant:</strong> Every executed order enforces a mandatory hard stop-loss and strict 1.0% single-trade max equity risk cap. Position sizing automatically returns 0 units if single-unit exposure breaches risk parameters. Daily drawdown circuit breaker terminates opening privileges at 3.0% session loss.
        </div>
      </div>
    </div>
  );
}
