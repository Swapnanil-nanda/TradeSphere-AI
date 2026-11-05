'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const ltp = Number(ticker?.ltp ?? 100);
  const currencySymbol = ticker?.currency === 'USD' ? '$' : '₹';
  const entryPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : ltp;

  // Auto-calculate suggested Stop Loss & Take Profit with correct direction
  useEffect(() => {
    if (ltp > 0) {
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

  const netEquity = Number(portfolio?.account?.netLiquidation ?? 1000000);
  const maxAllowedRisk = netEquity * 0.01; // 1.0%
  const riskPctOfEquity = netEquity > 0 ? ((totalRisk / netEquity) * 100).toFixed(2) : '0.00';
  const isRiskBreached = totalRisk > maxAllowedRisk;
  const isRrOptimal = parseFloat(rrRatio) >= 1.5;

  // Directional validity check
  const isDirectionValid = side === 'BUY'
    ? (slNum <= 0 || slNum < entryPrice) && (tpNum <= 0 || tpNum > entryPrice)
    : (slNum <= 0 || slNum > entryPrice) && (tpNum <= 0 || tpNum < entryPrice);

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
    if (!apiClient.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: `Placing ${side} order for ${symbol}` } }));
      return;
    }

    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be at least 1 unit to place an order.' });
      return;
    }

    if (side === 'BUY' && slNum >= entryPrice) {
      setFeedback({ type: 'error', message: `Stop-Loss (${currencySymbol}${slNum}) must be strictly below entry price (${currencySymbol}${entryPrice}) for BUY orders.` });
      return;
    }

    if (side === 'SELL' && slNum <= entryPrice) {
      setFeedback({ type: 'error', message: `Stop-Loss (${currencySymbol}${slNum}) must be strictly above entry price (${currencySymbol}${entryPrice}) for SELL orders.` });
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

      setFeedback({ type: 'success', message: result.message || 'Order placed and filled successfully!' });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Pre-trade risk validation failed.' });
    } finally {
      setLoading(false);
    }
  };

  const estTradeTotal = entryPrice * quantity;

  return (
    <div className="bg-[#050505] border border-[#141414] rounded-lg p-3.5 flex flex-col h-full select-none text-xs text-[#F0F3F6]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#141414] mb-2.5">
        <span className="font-bold text-white text-xs uppercase tracking-wider font-sans">Quick Order Ticket</span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30">
            1% RISK GUARD
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
        {/* Buy / Sell Switch */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#080808] p-0.5 rounded border border-[#141414]">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-1.5 rounded font-bold text-xs transition-all ${
              side === 'BUY' ? 'bg-[#00c805] text-black shadow-xs' : 'text-[#808a9d] hover:text-white'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-1.5 rounded font-bold text-xs transition-all ${
              side === 'SELL' ? 'bg-[#ff333a] text-white shadow-xs' : 'text-[#808a9d] hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Order Type */}
        {mode !== 'basic' && (
          <div className="grid grid-cols-3 gap-1 bg-[#080808] p-0.5 rounded border border-[#141414] text-[11px] font-mono">
            {(['MARKET', 'LIMIT', 'BRACKET'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`py-1 rounded font-semibold transition-all ${
                  orderType === t ? 'bg-[#2979FF] text-white' : 'text-[#808a9d] hover:text-white'
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
            <label className="block text-[#808a9d] font-semibold mb-1 text-[10px]">Limit Price ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              required
              placeholder={ltp.toString()}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#2979FF]"
            />
          </div>
        )}

        {/* Quantity & 1% Auto-Sizer */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[#808a9d] font-semibold text-[10px]">Quantity (Shares):</label>
            <button
              type="button"
              onClick={handleAutoSizer}
              className="text-[10px] text-[#2979FF] font-semibold flex items-center gap-1 hover:underline"
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
            className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#2979FF]"
          />
        </div>

        {/* Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[#ff333a] font-bold mb-1 text-[10px]">Stop-Loss ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              required
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#080808] border border-[#ff333a]/40 rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#ff333a]"
            />
          </div>
          <div>
            <label className="block text-[#00c805] font-bold mb-1 text-[10px]">Take-Profit ({currencySymbol}):</label>
            <input
              type="number"
              step="0.05"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-[#080808] border border-[#00c805]/40 rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00c805]"
            />
          </div>
        </div>

        {/* Pre-Trade Risk Calculator Feedback Card */}
        <div className="bg-[#080808] border border-[#141414] rounded p-2.5 space-y-1 text-[10px] font-mono">
          <div className="flex justify-between text-[#808a9d]">
            <span>Risk / Reward:</span>
            <span className={isRrOptimal ? 'text-[#00c805] font-bold' : 'text-[#D8AB5E]'}>
              1 : {rrRatio} {isRrOptimal ? '✓' : '(Min ≥ 1.5R)'}
            </span>
          </div>
          <div className="flex justify-between text-[#808a9d]">
            <span>Calculated Risk:</span>
            <span className={isRiskBreached ? 'text-[#ff333a] font-bold' : 'text-white'}>
              {currencySymbol}{totalRisk.toFixed(2)} ({riskPctOfEquity}% of equity)
            </span>
          </div>
          <div className="flex justify-between text-[#808a9d] text-[9px] pt-1 border-t border-[#141414]">
            <span>Est. Value:</span>
            <span className="text-white">{currencySymbol}{estTradeTotal.toFixed(2)}</span>
          </div>
        </div>

        {feedback && (
          <div className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${
            feedback.type === 'success'
              ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
              : 'bg-[#ff333a]/10 text-[#ff333a] border border-[#ff333a]/30'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            <span className="leading-snug">{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isRiskBreached || quantity <= 0 || !isDirectionValid}
          className={`w-full py-2 rounded font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
            isRiskBreached || quantity <= 0 || !isDirectionValid
              ? 'bg-[#181818] text-[#808a9d] cursor-not-allowed border border-[#2a2a2a]'
              : side === 'BUY'
              ? 'bg-[#00c805] hover:bg-emerald-600 text-black font-bold'
              : 'bg-[#ff333a] hover:bg-rose-600 text-white font-bold'
          }`}
        >
          {loading ? (
            <span>Validating Risk...</span>
          ) : !isDirectionValid ? (
            <span>Invalid Stop/Target Direction</span>
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
