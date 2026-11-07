'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, AlertCircle, Coins, ShieldCheck, ChevronDown, ChevronUp, Zap } from 'lucide-react';
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
  const [productType, setProductType] = useState<'CNC' | 'MIS' | 'NRML'>('CNC');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [showChargesDetails, setShowChargesDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const ltp = Number(ticker?.ltp ?? 100);
  const isUs = ticker?.currency === 'USD';
  const currencySymbol = isUs ? '$' : '₹';
  const entryPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : ltp;

  const slNum = parseFloat(stopLoss) || 0;
  const tpNum = parseFloat(takeProfit) || 0;
  const riskPerShare = slNum > 0 ? Math.abs(entryPrice - slNum) : 0;
  const rewardPerShare = tpNum > 0 ? Math.abs(tpNum - entryPrice) : 0;
  const totalRisk = riskPerShare * quantity;
  const rrRatio = riskPerShare > 0 && rewardPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : null;

  // Real-world Capital & Margin Gatekeeper (Buying Power)
  const availableCash = Number(portfolio?.account?.currentCash ?? 1000000);
  const netEquity = Number(portfolio?.account?.netLiquidation ?? availableCash);
  const estTradeTotal = entryPrice * quantity;

  // Real-world Broker Leverage: MIS gives 5x Intraday Leverage (20% margin requirement)
  const marginMultiplier = productType === 'MIS' ? 0.2 : 1.0;
  const marginRequired = estTradeTotal * marginMultiplier;
  const isCashBreached = side === 'BUY' && marginRequired > availableCash;

  // Real Indian Brokerage & Statutory Taxes Breakdown
  const brokerage = productType === 'MIS' ? Math.min(20, estTradeTotal * 0.0003) : 0;
  const stt = isUs ? 0 : (productType === 'CNC' ? estTradeTotal * 0.001 : (side === 'SELL' ? estTradeTotal * 0.00025 : 0));
  const exchangeTxnFee = isUs ? estTradeTotal * 0.00002 : estTradeTotal * 0.0000345;
  const sebiCharges = estTradeTotal * 0.000001;
  const stampDuty = side === 'BUY' ? (isUs ? 0 : estTradeTotal * 0.00015) : 0;
  const gst = (brokerage + exchangeTxnFee + sebiCharges) * 0.18;
  const totalCharges = brokerage + stt + exchangeTxnFee + sebiCharges + stampDuty + gst;
  const breakevenPerShare = quantity > 0 ? (totalCharges / quantity) : 0;

  // Directional validity check ONLY if Stop-Loss or Take-Profit are populated
  const isDirectionValid = side === 'BUY'
    ? (slNum <= 0 || slNum < entryPrice) && (tpNum <= 0 || tpNum > entryPrice)
    : (slNum <= 0 || slNum > entryPrice) && (tpNum <= 0 || tpNum < entryPrice);

  // Global Hotkeys: 'B' for Buy, 'S' for Sell (when not focused on input)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (e.key === 'b' || e.key === 'B') {
        setSide('BUY');
      } else if (e.key === 's' || e.key === 'S') {
        setSide('SELL');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Real-world Quick Sizing Chips (25%, 50%, 75%, 100% of Available Buying Power)
  const handleQuickSize = (pct: number) => {
    if (entryPrice <= 0) return;
    const allocCash = availableCash * (pct / 100);
    const effectiveCapital = productType === 'MIS' ? allocCash * 5 : allocCash;
    const shares = Math.max(1, Math.floor(effectiveCapital / entryPrice));
    setQuantity(shares);
    setFeedback({
      type: 'success',
      message: `Sized to ${shares} shares (${pct}% of cash | ${productType === 'MIS' ? '5x MIS Leverage' : '1x CNC'})`
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

    if (isCashBreached) {
      setFeedback({
        type: 'error',
        message: `Insufficient Margin: Required (${currencySymbol}${marginRequired.toFixed(2)}) exceeds available cash (${currencySymbol}${availableCash.toFixed(2)}).`
      });
      return;
    }

    if (slNum > 0 && side === 'BUY' && slNum >= entryPrice) {
      setFeedback({ type: 'error', message: `Stop-Loss (${currencySymbol}${slNum}) must be strictly below entry price (${currencySymbol}${entryPrice}) for BUY orders.` });
      return;
    }

    if (slNum > 0 && side === 'SELL' && slNum <= entryPrice) {
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
        productType,
        quantity: parseInt(quantity.toString(), 10),
        limitPrice: orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : undefined,
        stopLoss: slNum > 0 ? slNum : undefined,
        takeProfit: tpNum > 0 ? tpNum : undefined,
        clientOrderId
      } as any);

      setFeedback({ type: 'success', message: result.message || 'Order placed and filled successfully!' });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Order placement failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#050505] border border-[#141414] rounded-lg p-3.5 flex flex-col h-full select-none text-xs text-[#F0F3F6]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#141414] mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white text-xs uppercase tracking-wider font-sans">Quick Order Ticket</span>
          <span className="text-[9px] text-[#808a9d] font-mono">(Keys: B / S)</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30">
            CASH MARGIN GATEKEEPER
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
        {/* Product Type (CNC Delivery vs MIS Intraday 5x vs NRML Derivatives) */}
        <div className="grid grid-cols-3 gap-1 bg-[#080808] p-0.5 rounded border border-[#141414] text-[11px] font-mono">
          {(['CNC', 'MIS', 'NRML'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProductType(p)}
              className={`py-1 rounded font-semibold transition-all ${
                productType === p ? 'bg-[#2979FF] text-white shadow-xs' : 'text-[#808a9d] hover:text-white'
              }`}
              title={p === 'MIS' ? 'Intraday Margin (5x Leverage, Auto Square-Off)' : p === 'CNC' ? 'Cash & Carry (Delivery, 1x Upfront)' : 'Normal Derivatives Margin'}
            >
              {p} {p === 'MIS' ? '(5x)' : ''}
            </button>
          ))}
        </div>

        {/* Buy / Sell Switch */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#080808] p-0.5 rounded border border-[#141414]">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-1.5 rounded font-bold text-xs transition-all ${
              side === 'BUY' ? 'bg-[#00c805] text-black shadow-xs' : 'text-[#808a9d] hover:text-white'
            }`}
          >
            BUY (B)
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-1.5 rounded font-bold text-xs transition-all ${
              side === 'SELL' ? 'bg-[#ff333a] text-white shadow-xs' : 'text-[#808a9d] hover:text-white'
            }`}
          >
            SELL (S)
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

        {/* Quantity & Real Quick Sizing Chips (25%, 50%, 75%, MAX) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[#808a9d] font-semibold text-[10px]">Quantity (Shares):</label>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="text-[#808a9d]">Size:</span>
              <button
                type="button"
                onClick={() => handleQuickSize(25)}
                className="px-1.5 py-0.2 rounded bg-[#111] hover:bg-[#1a1a1a] text-[#808a9d] hover:text-white border border-[#222] transition-colors"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleQuickSize(50)}
                className="px-1.5 py-0.2 rounded bg-[#111] hover:bg-[#1a1a1a] text-[#808a9d] hover:text-white border border-[#222] transition-colors"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleQuickSize(75)}
                className="px-1.5 py-0.2 rounded bg-[#111] hover:bg-[#1a1a1a] text-[#808a9d] hover:text-white border border-[#222] transition-colors"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handleQuickSize(100)}
                className="px-1.5 py-0.2 rounded bg-[#2979FF]/20 hover:bg-[#2979FF]/30 text-[#2979FF] border border-[#2979FF]/40 font-bold transition-colors"
              >
                MAX
              </button>
            </div>
          </div>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#2979FF]"
          />
        </div>

        {/* Optional Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[#808a9d] font-semibold mb-1 text-[10px]">
              Stop-Loss <span className="text-[9px] text-[#637286] font-normal">(Optional)</span>:
            </label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 0.00"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#080808] border border-[#1a1a1a] focus:border-[#ff333a]/60 rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[#808a9d] font-semibold mb-1 text-[10px]">
              Take-Profit <span className="text-[9px] text-[#637286] font-normal">(Optional)</span>:
            </label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 0.00"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-[#080808] border border-[#1a1a1a] focus:border-[#00c805]/60 rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Real Margin & Capital Utilization Card */}
        <div className="bg-[#080808] border border-[#141414] rounded p-2.5 space-y-1.5 text-[10px] font-mono">
          <div className="flex justify-between text-[#808a9d]">
            <span>Est. Order Value:</span>
            <span className="text-white font-bold">
              {currencySymbol}{estTradeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-[#808a9d]">
            <span>Required Margin ({productType}):</span>
            <span className={isCashBreached ? 'text-[#ff333a] font-bold' : 'text-[#2979FF] font-bold'}>
              {currencySymbol}{marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {productType === 'MIS' ? ' (5x)' : ''}
            </span>
          </div>
          <div className="flex justify-between text-[#808a9d]">
            <span>Available Cash:</span>
            <span className="text-[#00c805] font-bold">
              {currencySymbol}{availableCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Interactive Charges & Taxes Accordion */}
          <div className="pt-1.5 border-t border-[#141414]">
            <button
              type="button"
              onClick={() => setShowChargesDetails(!showChargesDetails)}
              className="w-full flex items-center justify-between text-[#808a9d] hover:text-white transition-colors"
            >
              <span>Taxes &amp; Charges: <strong className="text-white">{currencySymbol}{totalCharges.toFixed(2)}</strong></span>
              <span className="flex items-center gap-0.5 text-[9px] text-[#2979FF]">
                {showChargesDetails ? 'Hide' : 'Breakdown'}
                {showChargesDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </button>

            {showChargesDetails && (
              <div className="mt-1.5 pt-1.5 border-t border-[#1a1a1a] space-y-1 text-[#808a9d] text-[9px]">
                <div className="flex justify-between">
                  <span>Brokerage:</span>
                  <span>{currencySymbol}{brokerage.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>STT/CTT:</span>
                  <span>{currencySymbol}{stt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exchange Txn Charges:</span>
                  <span>{currencySymbol}{exchangeTxnFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>{currencySymbol}{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SEBI Turnover + Stamp:</span>
                  <span>{currencySymbol}{(sebiCharges + stampDuty).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-[#141414]">
                  <span>Breakeven Movement:</span>
                  <span className="text-[#D8AB5E]">+{currencySymbol}{breakevenPerShare.toFixed(2)} / share</span>
                </div>
              </div>
            )}
          </div>

          {slNum > 0 && (
            <div className="flex justify-between text-[#808a9d] pt-1 border-t border-[#141414]">
              <span>Stop Loss Risk:</span>
              <span className="text-[#D8AB5E]">
                {currencySymbol}{totalRisk.toFixed(2)} {rrRatio ? `(R:R 1:${rrRatio})` : ''}
              </span>
            </div>
          )}
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
          disabled={loading || isCashBreached || quantity <= 0 || !isDirectionValid}
          className={`w-full py-2 rounded font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
            isCashBreached || quantity <= 0 || !isDirectionValid
              ? 'bg-[#181818] text-[#808a9d] cursor-not-allowed border border-[#2a2a2a]'
              : side === 'BUY'
              ? 'bg-[#00c805] hover:bg-emerald-600 text-black font-bold'
              : 'bg-[#ff333a] hover:bg-rose-600 text-white font-bold'
          }`}
        >
          {loading ? (
            <span>Executing Order...</span>
          ) : !isDirectionValid ? (
            <span>Invalid Stop/Target Price</span>
          ) : isCashBreached ? (
            <span>Insufficient Margin</span>
          ) : (
            <span>Submit {orderType} {productType} {side} Order</span>
          )}
        </button>
      </form>
    </div>
  );
}
