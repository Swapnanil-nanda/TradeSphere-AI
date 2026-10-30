'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, Calculator, CheckCircle2 } from 'lucide-react';
import { Ticker, PortfolioData, apiClient } from '../../lib/api-client';

interface OrderFormProps {
  symbol: string;
  ticker?: Ticker;
  portfolio?: PortfolioData;
  mode?: 'basic' | 'active' | 'pro';
  onOrderPlaced?: () => void;
}

export default function OrderForm({
  symbol,
  ticker,
  portfolio,
  mode = 'active',
  onOrderPlaced
}: OrderFormProps) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'BRACKET'>('MARKET');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const ltp = ticker?.ltp || 100;
  const currencySymbol = ticker?.currency === 'USD' ? '$' : '₹';
  const entryPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : ltp;

  // Auto-calculate default suggested Stop Loss & Take Profit
  useEffect(() => {
    if (ltp) {
      const defaultRiskDistance = Math.round((ltp * 0.012) * 10) / 10;
      if (side === 'BUY') {
        const sl = Math.round((ltp - defaultRiskDistance) * 10) / 10;
        const tp = Math.round((ltp + defaultRiskDistance * 2) * 10) / 10;
        setStopLoss(sl.toString());
        setTakeProfit(tp.toString());
      } else {
        const sl = Math.round((ltp + defaultRiskDistance) * 10) / 10;
        const tp = Math.round((ltp - defaultRiskDistance * 2) * 10) / 10;
        setStopLoss(sl.toString());
        setTakeProfit(tp.toString());
      }
    }
  }, [symbol, side, ltp]);

  const slNum = parseFloat(stopLoss) || 0;
  const tpNum = parseFloat(takeProfit) || 0;
  const riskPerShare = Math.abs(entryPrice - slNum);
  const rewardPerShare = Math.abs(tpNum - entryPrice);
  const totalRisk = riskPerShare * quantity;
  const rrRatio = riskPerShare > 0 && rewardPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '0.00';

  const netEquity = portfolio?.account?.netLiquidation || 1000000;
  const maxAllowedRisk = netEquity * 0.01; // 1.0%
  const riskPctOfEquity = ((totalRisk / netEquity) * 100).toFixed(2);
  const isRiskBreached = totalRisk > maxAllowedRisk;
  const isRrOptimal = parseFloat(rrRatio) >= 1.5;

  // 1% Risk Auto-Sizer
  const handleAutoSizer = () => {
    if (riskPerShare <= 0) {
      setFeedback({ type: 'error', message: 'Set a valid Stop-Loss price first before auto-sizing.' });
      return;
    }
    const rawQty = Math.floor(maxAllowedRisk / riskPerShare);
    if (rawQty < 1) {
      setQuantity(0);
      setFeedback({
        type: 'error',
        message: `Risk Breach: Minimum 1 unit risk (${currencySymbol}${riskPerShare.toFixed(2)}) exceeds 1% cap (${currencySymbol}${maxAllowedRisk.toFixed(2)}). Sizing returned 0 units.`
      });
      return;
    }
    setQuantity(rawQty);
    setFeedback({
      type: 'success',
      message: `Auto-sized to ${rawQty} shares. Total risk capped at ${currencySymbol}${(rawQty * riskPerShare).toFixed(2)} (1.0% of equity).`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be at least 1 unit to place an order.' });
      return;
    }
    setLoading(true);
    setFeedback(null);

    try {
      const clientOrderId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const result = await apiClient.submitOrder({
        symbol,
        side,
        orderType,
        quantity: parseInt(quantity.toString(), 10),
        limitPrice: orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : undefined,
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        clientOrderId
      } as any);

      setFeedback({ type: 'success', message: result.message || 'Order placed successfully!' });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to place order.' });
    } finally {
      setLoading(false);
    }
  };

  const estTradeTotal = entryPrice * quantity;
  const estFee = estTradeTotal * 0.0003;

  return (
    <div className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl p-3.5 flex flex-col h-full select-none text-xs shadow-2xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1b253b] mb-2.5">
        <span className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Quick Order Ticket</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            1% RISK GUARD
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
        {/* Buy / Sell Switch */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-[#070b14] p-0.5 rounded-lg border border-slate-200 dark:border-[#1b253b]">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-1.5 rounded-md font-bold text-xs transition-all ${
              side === 'BUY' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-1.5 rounded-md font-bold text-xs transition-all ${
              side === 'SELL' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Order Type */}
        {mode !== 'basic' && (
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-[#070b14] p-0.5 rounded-lg border border-slate-200 dark:border-[#1b253b] text-[11px]">
            {(['MARKET', 'LIMIT', 'BRACKET'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`py-1 rounded-md font-semibold transition-all ${
                  orderType === t ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Limit Price Input */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Limit Price ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              required
              placeholder={ltp.toString()}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Quantity & 1% Auto-Sizer */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-slate-500 font-semibold text-[10px]">Quantity (Shares):</label>
            <button
              type="button"
              onClick={handleAutoSizer}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <Calculator className="w-3 h-3" />
              <span>Auto-Size (1% Risk)</span>
            </button>
          </div>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-2.5 py-1 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-rose-600 dark:text-rose-400 font-bold mb-1 text-[10px]">Stop-Loss ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              required
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-rose-300 dark:border-rose-500/30 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-emerald-600 dark:text-emerald-400 font-bold mb-1 text-[10px]">Take-Profit ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-emerald-300 dark:border-emerald-500/30 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Pre-Trade Risk Calculator Feedback Card */}
        <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg p-2.5 space-y-1 text-[10px] font-mono">
          <div className="flex justify-between text-slate-500">
            <span>Risk / Reward:</span>
            <span className={isRrOptimal ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400'}>
              1 : {rrRatio} {isRrOptimal ? '✓' : '(Min ≥ 1.5R)'}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Calculated Risk:</span>
            <span className={isRiskBreached ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
              {currencySymbol}{totalRisk.toFixed(2)} ({riskPctOfEquity}% of equity)
            </span>
          </div>
          <div className="flex justify-between text-slate-400 text-[9px] pt-1 border-t border-slate-200 dark:border-slate-800">
            <span>Est. Value:</span>
            <span>{currencySymbol}{estTradeTotal.toFixed(2)}</span>
          </div>
        </div>

        {feedback && (
          <div className={`p-2 rounded-md text-[11px] flex items-center gap-1.5 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            <span className="leading-snug">{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isRiskBreached || quantity <= 0}
          className={`w-full py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
            isRiskBreached || quantity <= 0
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              : side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          {loading ? (
            <span>Validating Risk...</span>
          ) : isRiskBreached ? (
            <span>Risk Breached (&gt;1% Equity)</span>
          ) : (
            <span>Submit {orderType} {side} Order</span>
          )}
        </button>
      </form>
    </div>
  );
}
