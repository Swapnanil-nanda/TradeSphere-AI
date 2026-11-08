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
    if (!apiClient.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradesphere_auth_required', {
          detail: { action: `Placing ${side} order for ${symbol}` }
        }));
      }
      setFeedback({ type: 'error', message: 'Authentication required: Please sign in or create an account to submit orders.' });
      return;
    }
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

      setFeedback({ type: 'success', message: data.message || 'Order executed successfully!' });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Pre-trade risk check failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111922] border-l border-[#25313D] text-xs select-none">
      {/* Header */}
      <div className="h-10 px-3 border-b border-[#25313D] bg-[#0D131A] flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-xs text-[#E7EDF3]">ORDER TICKET</span>
          <span className="text-[10px] text-[#8B99A8]">• {symbol}</span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-[#35C69A] bg-[#151F29] border border-[#25313D] px-1.5 py-0.2 rounded">
          {currencySymbol}{ltp.toFixed(2)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* Buy / Sell Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-[#0D131A] rounded border border-[#25313D]">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-1.5 rounded font-bold text-xs transition-all flex items-center justify-center gap-1 ${
              side === 'BUY'
                ? 'bg-[#35C69A] text-[#090D12] shadow-2xs'
                : 'text-[#8B99A8] hover:text-[#E7EDF3]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>BUY</span>
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-1.5 rounded font-bold text-xs transition-all flex items-center justify-center gap-1 ${
              side === 'SELL'
                ? 'bg-[#EF6468] text-white shadow-2xs'
                : 'text-[#8B99A8] hover:text-[#E7EDF3]'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>SELL</span>
          </button>
        </div>

        {/* Order Type Toggle (Market, Limit, Bracket) */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase font-bold text-[#8B99A8]">Order Type</label>
          <div className="grid grid-cols-3 gap-1 bg-[#0D131A] p-0.5 rounded border border-[#25313D] text-[10px] font-mono">
            {['MARKET', 'LIMIT', 'BRACKET'].map((ot) => (
              <button
                key={ot}
                type="button"
                onClick={() => setOrderType(ot)}
                className={`py-1 rounded font-semibold transition-all ${
                  orderType === ot
                    ? 'bg-[#2979FF] text-white shadow-2xs'
                    : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                }`}
              >
                {ot}
              </button>
            ))}
          </div>
        </div>

        {/* Limit Price Input if Limit Order */}
        {orderType === 'LIMIT' && (
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase font-bold text-[#8B99A8]">Limit Price ({currencySymbol})</label>
            <input
              type="number"
              step="0.05"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={ltp.toString()}
              className="w-full bg-[#0D131A] border border-[#25313D] rounded px-2.5 py-1.5 text-xs font-mono text-[#E7EDF3] focus:outline-hidden focus:border-[#2979FF]"
            />
          </div>
        )}

        {/* Quantity Input + 1% Risk Auto-Sizer */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase font-bold text-[#8B99A8]">Quantity</label>
            <button
              type="button"
              onClick={handleAutoSizer}
              className="text-[10px] font-mono text-[#2979FF] hover:text-[#6d9fce] flex items-center gap-1 font-semibold"
              title="Calculate exact quantity to cap risk at 1.0% of equity"
            >
              <Calculator className="w-3 h-3" />
              <span>1% Risk Auto-Sizer</span>
            </button>
          </div>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-[#0D131A] border border-[#25313D] rounded px-2.5 py-1.5 text-xs font-mono text-[#E7EDF3] focus:outline-hidden focus:border-[#2979FF]"
          />
        </div>

        {/* Stop Loss & Take Profit (Mandatory Rule A) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase font-bold text-[#EF6468]">Stop Loss</label>
              <span className="text-[9px] font-mono text-[#EF6468]">MANDATORY</span>
            </div>
            <input
              type="number"
              step="0.05"
              required
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#0D131A] border border-[#25313D] focus:border-[#EF6468] rounded px-2 py-1.5 text-xs font-mono text-[#E7EDF3] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase font-bold text-[#35C69A]">Take Profit</label>
              <span className="text-[9px] font-mono text-[#35C69A]">TARGET</span>
            </div>
            <input
              type="number"
              step="0.05"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-[#0D131A] border border-[#25313D] focus:border-[#35C69A] rounded px-2 py-1.5 text-xs font-mono text-[#E7EDF3] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Synchronous Risk Gatekeeper Preview */}
        <div className="p-2.5 rounded bg-[#0D131A] border border-[#25313D] space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-[#8B99A8] border-b border-[#25313D] pb-1">
            <span className="text-[10px] uppercase font-bold text-[#E7EDF3] flex items-center gap-1 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2979FF]" />
              PRE-TRADE RISK PREVIEW
            </span>
            <span className="text-[9px] text-[#8B99A8]">RULE A GATE</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#8B99A8]">Order Value:</span>
            <span className="text-[#E7EDF3] num-tabular">{currencySymbol}{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#8B99A8]">Trade Risk:</span>
            <span className={`num-tabular font-bold ${isRiskBreached ? 'text-[#EF6468]' : 'text-[#35C69A]'}`}>
              {currencySymbol}{totalRisk.toFixed(2)} ({riskPctOfEquity}% of equity)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#8B99A8]">Reward:Risk (R:R):</span>
            <span className={`num-tabular font-semibold ${isRrOptimal ? 'text-[#35C69A]' : 'text-[#D8AB5E]'}`}>
              {rrRatio}R {isRrOptimal ? '✓' : '(Min 1.5R)'}
            </span>
          </div>

          <div className="flex justify-between border-t border-[#25313D] pt-1">
            <span className="text-[#8B99A8]">1% Account Risk Cap:</span>
            <span className="text-[#E7EDF3] num-tabular">{currencySymbol}{maxAllowedRisk.toFixed(2)}</span>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-2 rounded border text-[11px] font-mono flex items-start gap-1.5 ${
            feedback.type === 'success'
              ? 'bg-[#35C69A]/10 border-[#35C69A]/30 text-[#35C69A]'
              : 'bg-[#EF6468]/10 border-[#EF6468]/30 text-[#EF6468]'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
            <span className="leading-tight">{feedback.message}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || isRiskBreached || quantity <= 0}
          className={`w-full py-2.5 rounded font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 ${
            side === 'BUY'
              ? 'bg-[#35C69A] hover:bg-[#279d79] text-[#090D12] disabled:opacity-50'
              : 'bg-[#EF6468] hover:bg-[#d43f43] text-white disabled:opacity-50'
          }`}
        >
          {loading ? (
            <span>Validating Risk...</span>
          ) : (
            <span>
              {side} {quantity} {symbol} @ {orderType === 'LIMIT' ? `${currencySymbol}${limitPrice || ltp}` : 'MKT'}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
