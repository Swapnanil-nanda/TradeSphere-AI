import React from 'react';

export default function OrderBookDOM({ ticker, onQuickFill }) {
  const bids = ticker?.bids || [];
  const asks = ticker?.asks || [];
  const currencySymbol = ticker?.currency === 'USD' ? '$' : '₹';

  const maxBidQty = Math.max(1, ...bids.map(b => b[1]));
  const maxAskQty = Math.max(1, ...asks.map(a => a[1]));
  const spread = ticker ? Math.round((ticker.ask - ticker.bid) * 100) / 100 : 0.05;

  return (
    <div className="h-full flex flex-col bg-[#0b101c] text-xs font-['JetBrains_Mono'] select-none">
      {/* Header */}
      <div className="p-2 border-b border-[#1b253b] flex items-center justify-between font-sans">
        <span className="font-bold text-[11px] text-slate-300 uppercase tracking-wider">Level 2 DOM (20-Depth)</span>
        <span className="text-[10px] text-slate-400">
          Spread: <b className="text-amber-400">{currencySymbol}{spread.toFixed(2)}</b>
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 text-[10px] text-slate-400 uppercase py-1 px-2 border-b border-[#1b253b] font-sans">
        <div className="flex justify-between pr-2">
          <span>Bid Qty</span>
          <span>Bid Price</span>
        </div>
        <div className="flex justify-between pl-2">
          <span>Ask Price</span>
          <span>Ask Qty</span>
        </div>
      </div>

      {/* Ladder Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1b253b]/20">
        {Array.from({ length: 20 }).map((_, idx) => {
          const bid = bids[idx] || [0, 0];
          const ask = asks[idx] || [0, 0];
          const bidBarWidth = `${(bid[1] / maxBidQty) * 100}%`;
          const askBarWidth = `${(ask[1] / maxAskQty) * 100}%`;

          return (
            <div key={idx} className="grid grid-cols-2 text-[11px] h-6 relative hover:bg-slate-800/40">
              {/* Bid Side */}
              <div
                className="relative flex items-center justify-between px-2 pr-3 cursor-pointer group"
                onClick={() => onQuickFill && onQuickFill('BUY', bid[0])}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none transition-all"
                  style={{ width: bidBarWidth }}
                />
                <span className="text-slate-400 text-[10px]">{bid[1]}</span>
                <span className="text-emerald-400 font-semibold">{currencySymbol}{bid[0]?.toFixed(2)}</span>
              </div>

              {/* Ask Side */}
              <div
                className="relative flex items-center justify-between px-2 pl-3 cursor-pointer group"
                onClick={() => onQuickFill && onQuickFill('SELL', ask[0])}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none transition-all"
                  style={{ width: askBarWidth }}
                />
                <span className="text-rose-400 font-semibold">{currencySymbol}{ask[0]?.toFixed(2)}</span>
                <span className="text-slate-400 text-[10px]">{ask[1]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
