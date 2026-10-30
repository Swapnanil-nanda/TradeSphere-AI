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
  const maxAllowedRisk = netEquity * 0.01; // 1%
  const riskPctOfEquity = ((totalRisk / netEquity) * 100).toFixed(2);
  const isRiskBreached = totalRisk > maxAllowedRisk;
  const isRrOptimal = parseFloat(rrRatio) >= 1.5;

  // 1% Risk Auto-Sizer Action
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
        message: `Risk Breach: Minimum 1 share risk (₹${riskPerShare.toFixed(2)}) exceeds 1% risk cap (₹${maxAllowedRisk.toFixed(2)}). Select a closer Stop-Loss.`
      });
      return;
    }
    setQuantity(rawQty);
    setFeedback({
      type: 'success',
      message: `Auto-sized to ${rawQty} shares. Total risk capped at ₹${(rawQty * riskPerShare).toFixed(2)} (1.0% of equity).`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const clientOrderId = 'cli_' + Math.random().toString(36).substring(2, 10);
      const result = await apiClient.submitOrder({
        symbol,
        side,
        orderType: mode === 'basic' ? 'BRACKET' : orderType,
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
  const estSlippagePerShare = entryPrice * 0.0005;

  return (
    <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 flex flex-col h-full select-none text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b253b] mb-3">
        <span className="font-extrabold text-white text-xs uppercase tracking-wider">Order Ticket</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            1% RISK GUARD
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            SIMULATED
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1 overflow-y-auto">
        {/* Buy / Sell Switch */}
        <div className="grid grid-cols-2 gap-2 bg-[#070b14] p-1 rounded-xl border border-[#1b253b]">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-2 rounded-lg font-bold transition-all ${
              side === 'BUY' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-2 rounded-lg font-bold transition-all ${
              side === 'SELL' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            SELL / SHORT
          </button>
        </div>

        {/* Order Type */}
        {mode !== 'basic' && (
          <div className="grid grid-cols-3 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#1b253b] text-[11px]">
            {(['MARKET', 'LIMIT', 'BRACKET'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`py-1 rounded-md font-bold transition-all ${
                  orderType === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Limit Price Input when LIMIT order selected */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="block text-slate-400 font-bold mb-1">Limit Price ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              required
              placeholder={ltp.toString()}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full bg-[#070b14] border border-blue-500/50 rounded-xl px-3 py-2 text-blue-300 font-mono font-bold focus:outline-none focus:border-blue-400"
            />
          </div>
        )}

        {/* Quantity & 1% Auto-Sizer */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-slate-400 font-bold">Quantity (Shares):</label>
            <button
              type="button"
              onClick={handleAutoSizer}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
            >
              <Calculator className="w-3 h-3" />
              <span>Auto-Size (1% Risk)</span>
            </button>
          </div>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-white font-mono font-bold"
          />
        </div>

        {/* Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Stop-Loss ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              required
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-rose-400 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Take-Profit ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
            />
          </div>
        </div>

        {/* Pre-Trade Risk Calculator Feedback Card */}
        <div className="bg-[#070b14] border border-[#1b253b] rounded-xl p-3 space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Risk / Reward:</span>
            <span className={isRrOptimal ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              1 : {rrRatio} {isRrOptimal ? '✓' : '(Recommended ≥ 1.5)'}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Calculated Risk:</span>
            <span className={isRiskBreached ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {currencySymbol}{totalRisk.toFixed(2)} ({riskPctOfEquity}% of equity)
            </span>
          </div>
          <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-[#1b253b]/50">
            <span>Est. Value & Fee:</span>
            <span className="text-slate-400">
              {currencySymbol}{estTradeTotal.toFixed(2)} + fee ~{currencySymbol}{estFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500 text-[10px]">
            <span>Est. Slippage (0.05%):</span>
            <span className="text-slate-400">
              ~{currencySymbol}{estSlippagePerShare.toFixed(2)}/sh
            </span>
          </div>
        </div>

        {feedback && (
          <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
            feedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="text-[11px]">{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isRiskBreached}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            isRiskBreached
              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 cursor-not-allowed'
              : side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
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

        <div className="text-center pt-1">
          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
            PAPER TRADING – NO REAL MONEY
          </span>
        </div>
      </form>
    </div>
  );
}
