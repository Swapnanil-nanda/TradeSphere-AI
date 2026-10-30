import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, Calculator, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../lib/api-client';

export default function OrderTicket({ symbol, ticker, portfolio, mode, onOrderPlaced }) {
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message }

  const ltp = ticker?.ltp || 100;
  const currencySymbol = ticker?.currency === 'USD' ? '$' : '₹';
  const entryPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : ltp;

  // Set default suggested Stop Loss & Take Profit when symbol or side changes
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

  // Compute calculated trade metrics
  const slNum = parseFloat(stopLoss) || 0;
  const tpNum = parseFloat(takeProfit) || 0;
  const riskPerShare = Math.abs(entryPrice - slNum);
  const rewardPerShare = Math.abs(tpNum - entryPrice);
  const totalRisk = riskPerShare * quantity;
  const totalValue = entryPrice * quantity;
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
        message: `Risk Breach: Minimum 1 share risk (${currencySymbol}${riskPerShare.toFixed(2)}) exceeds 1% max risk cap (${currencySymbol}${maxAllowedRisk.toFixed(2)}). Sizing locked at 0 units.`
      });
      return;
    }
    setQuantity(rawQty);
    setFeedback({
      type: 'success',
      message: `Auto-sized to ${rawQty} shares. Total risk capped at ${currencySymbol}${(rawQty * riskPerShare).toFixed(2)} (1.0% of equity).`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be at least 1 unit to submit an order.' });
      return;
    }
    setLoading(true);
    setFeedback(null);

    try {
      const data = await apiClient.submitOrder({
        symbol,
        side,
        orderType: mode === 'basic' ? 'BRACKET' : orderType,
        quantity: parseInt(quantity, 10),
        limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        clientOrderId: 'cli_' + Math.random().toString(36).substring(2, 10)
      });

      setFeedback({ type: 'success', message: data.message || 'Order placed successfully!' });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Pre-trade risk check failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 border-l border-slate-200 dark:border-[#1b253b] bg-white dark:bg-[#0c121f] flex flex-col h-full select-none text-xs transition-colors shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">Order Ticket</span>
          <div className="text-[10px] text-slate-400 font-mono">{symbol} • {currencySymbol}{ltp.toFixed(2)}</div>
        </div>
        <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 text-[10px]">
          1% RISK GUARD
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {/* Buy / Sell Switch */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-[#070b14] p-1 rounded-lg border border-slate-200 dark:border-[#1b253b]">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              side === 'BUY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>BUY</span>
          </button>

          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              side === 'SELL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>SELL</span>
          </button>
        </div>

        {/* Order Type */}
        {mode !== 'basic' && (
          <div>
            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1 block">Order Type</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-[#070b14] p-0.5 rounded border border-slate-200 dark:border-[#1b253b] text-[11px]">
              {['MARKET', 'LIMIT', 'BRACKET'].map(ot => (
                <button
                  key={ot}
                  type="button"
                  onClick={() => setOrderType(ot)}
                  className={`py-1 rounded font-semibold transition-all ${
                    orderType === ot 
                      ? 'bg-blue-600 text-white shadow-2xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {ot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Limit Price Input if LIMIT */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1 block">Limit Price</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-slate-400 font-semibold">{currencySymbol}</span>
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                placeholder={ltp.toFixed(2)}
                className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-md pl-6 pr-3 py-1.5 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Quantity & 1% Risk Auto-Sizer */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Quantity</label>
            <button
              type="button"
              onClick={handleAutoSizer}
              className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20"
            >
              <Calculator className="w-3 h-3" />
              <span>1% Risk Auto-Sizer</span>
            </button>
          </div>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={e => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-md px-3 py-1.5 text-slate-900 dark:text-slate-100 font-mono font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Stop-Loss & Take-Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mb-1 flex items-center gap-1">
              <span>Stop-Loss</span>
              <span className="text-[9px] text-rose-500 font-normal">*Required</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-xs">{currencySymbol}</span>
              <input
                type="number"
                step="0.05"
                value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070b14] border border-rose-300 dark:border-rose-500/30 rounded-md pl-6 pr-2 py-1.5 text-slate-900 dark:text-slate-100 font-mono font-semibold text-xs focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1 block">Take-Profit</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-xs">{currencySymbol}</span>
              <input
                type="number"
                step="0.05"
                value={takeProfit}
                onChange={e => setTakeProfit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070b14] border border-emerald-300 dark:border-emerald-500/30 rounded-md pl-6 pr-2 py-1.5 text-slate-900 dark:text-slate-100 font-mono font-semibold text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Pre-Trade Guardrail Checklist & Metrics Card */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Order Value:</span>
            <span className="font-mono text-slate-800 dark:text-white font-semibold">
              {currencySymbol}{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Capital at Risk:</span>
            <span className={`font-mono font-bold ${isRiskBreached ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {currencySymbol}{totalRisk.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({riskPctOfEquity}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Reward / Risk:</span>
            <span className={`font-mono font-bold ${isRrOptimal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {rrRatio}R {isRrOptimal ? '✓' : '(Target ≥1.5R)'}
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Risk Gatekeeper:</span>
            </span>
            <span className={`text-[10px] font-bold ${isRiskBreached ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isRiskBreached ? 'BREACH (>1% Cap)' : 'PASSED'}
            </span>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-2 rounded-md text-[11px] flex items-start gap-1.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-snug">{feedback.message}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || isRiskBreached || quantity <= 0}
          className={`w-full py-2.5 rounded-lg font-bold text-white text-xs shadow-xs transition-colors flex items-center justify-center gap-2 ${
            isRiskBreached || quantity <= 0
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              : side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          {loading ? (
            <span>Validating Risk...</span>
          ) : (
            <span>{side} {quantity} {symbol} @ {currencySymbol}{entryPrice.toFixed(2)}</span>
          )}
        </button>
      </form>
    </div>
  );
}
