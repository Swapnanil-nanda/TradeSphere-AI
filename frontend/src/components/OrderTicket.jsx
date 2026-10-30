import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, Calculator, CheckCircle2 } from 'lucide-react';

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

  // Set default suggested Stop Loss & Take Profit when symbol changes
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
  }, [symbol, side]);

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
    const safeQty = Math.max(1, Math.floor(maxAllowedRisk / riskPerShare));
    setQuantity(safeQty);
    setFeedback({
      type: 'success',
      message: `Auto-sized to ${safeQty} shares. Total risk capped at ₹${(safeQty * riskPerShare).toFixed(2)} (1.0% of equity).`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          side,
          orderType: mode === 'basic' ? 'BRACKET' : orderType,
          quantity: parseInt(quantity, 10),
          limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
          stopLoss: parseFloat(stopLoss),
          takeProfit: parseFloat(takeProfit)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute order');
      }

      setFeedback({ type: 'success', message: data.message });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 border-l border-[#1b253b] bg-[#0c121f] flex flex-col h-full select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-[#1b253b] flex items-center justify-between">
        <span className="font-bold text-slate-300 uppercase tracking-wider">Smart Order Ticket</span>
        <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
          1% RISK GUARD
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-3 flex-1 overflow-y-auto space-y-3.5">
        {/* Buy / Sell Switch */}
        <div className="grid grid-cols-2 gap-2 bg-[#070b14] p-1 rounded-lg border border-[#1b253b]">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-2 rounded-md font-bold flex items-center justify-center gap-1 transition-all ${
              side === 'BUY'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>BUY / LONG</span>
          </button>

          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-2 rounded-md font-bold flex items-center justify-center gap-1 transition-all ${
              side === 'SELL'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>SELL / SHORT</span>
          </button>
        </div>

        {/* Order Type (Hidden in Basic mode, default BRACKET) */}
        {mode !== 'basic' && (
          <div>
            <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Order Type</label>
            <div className="grid grid-cols-3 gap-1 bg-[#070b14] p-0.5 rounded border border-[#1b253b] text-[11px]">
              {['MARKET', 'LIMIT', 'BRACKET'].map(ot => (
                <button
                  key={ot}
                  type="button"
                  onClick={() => setOrderType(ot)}
                  className={`py-1 rounded font-semibold transition-all ${
                    orderType === ot ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
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
            <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Limit Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 font-bold">{currencySymbol}</span>
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                placeholder={ltp.toFixed(2)}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-md pl-7 pr-3 py-1.5 text-slate-100 font-['JetBrains_Mono'] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Quantity & 1% Risk Auto-Sizer */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-slate-400 font-semibold">Quantity</label>
            <button
              type="button"
              onClick={handleAutoSizer}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
            >
              <Calculator className="w-3 h-3" />
              <span>1% Risk Auto-Sizer</span>
            </button>
          </div>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-[#070b14] border border-[#1b253b] rounded-md px-3 py-1.5 text-slate-100 font-['JetBrains_Mono'] font-bold focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Stop-Loss & Take-Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-rose-400 font-bold mb-1 flex items-center gap-1">
              <span>Stop-Loss</span>
              <span className="text-[9px] text-rose-500 font-normal">(Required)</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-500">{currencySymbol}</span>
              <input
                type="number"
                step="0.05"
                value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                className="w-full bg-[#070b14] border border-rose-500/30 rounded-md pl-6 pr-2 py-1.5 text-slate-100 font-['JetBrains_Mono'] font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-emerald-400 font-bold mb-1 block">Take-Profit</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-500">{currencySymbol}</span>
              <input
                type="number"
                step="0.05"
                value={takeProfit}
                onChange={e => setTakeProfit(e.target.value)}
                className="w-full bg-[#070b14] border border-emerald-500/30 rounded-md pl-6 pr-2 py-1.5 text-slate-100 font-['JetBrains_Mono'] font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Pre-Trade Guardrail Checklist & Metrics Card */}
        <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Order Value:</span>
            <span className="font-['JetBrains_Mono'] text-white font-semibold">
              {currencySymbol}{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Capital at Risk:</span>
            <span className={`font-['JetBrains_Mono'] font-bold ${isRiskBreached ? 'text-rose-400' : 'text-slate-200'}`}>
              {currencySymbol}{totalRisk.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({riskPctOfEquity}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Reward / Risk:</span>
            <span className={`font-['JetBrains_Mono'] font-bold ${isRrOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
              {rrRatio}R {isRrOptimal ? '✓' : '(Target ≥1.5R)'}
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Risk Gatekeeper:</span>
            </span>
            <span className={`text-[10px] font-bold ${isRiskBreached ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isRiskBreached ? 'FAIL (>1% Risk)' : 'PASSED'}
            </span>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-2.5 rounded-md text-[11px] flex items-start gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>{feedback.message}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || isRiskBreached}
          className={`w-full py-2.5 rounded-lg font-bold text-white text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
            isRiskBreached
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
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
