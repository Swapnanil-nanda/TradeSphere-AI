import React from 'react';

export default function OrderBookDOM({ ticker, onQuickFill }) {
  const bids = ticker?.bids || [];
  const asks = ticker?.asks || [];
  const currencySymbol = ticker?.currency === 'USD' ? '$' : '₹';

  const maxBidQty = Math.max(1, ...bids.map(b => b[1]));
  const maxAskQty = Math.max(1, ...asks.map(a => a[1]));
  const spread = ticker ? Math.round(((ticker.ask || ticker.ltp * 1.0005) - (ticker.bid || ticker.ltp * 0.9995)) * 100) / 100 : 0.05;

  return (
    <div className="h-full flex flex-col bg-[#111922] text-xs font-mono select-none">
      {/* Header */}
      <div className="p-2 border-b border-[#25313D] bg-[#0D131A] flex items-center justify-between font-sans">
        <span className="font-bold text-[10px] text-[#E7EDF3] uppercase tracking-wider font-mono">
          LEVEL 2 DOM (20-DEPTH)
        </span>
        <span className="text-[10px] text-[#8B99A8] font-mono">
          Spread: <b className="text-[#D8AB5E] num-tabular">{currencySymbol}{spread.toFixed(2)}</b>
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 text-[10px] text-[#8B99A8] uppercase py-1 px-2 border-b border-[#25313D] font-mono bg-[#0D131A]">
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
      <div className="flex-1 overflow-y-auto divide-y divide-[#25313D]/25 custom-scrollbar bg-[#111922]">
        {Array.from({ length: 20 }).map((_, idx) => {
          const bid = bids[idx] || [0, 0];
          const ask = asks[idx] || [0, 0];
          const bidBarWidth = `${(bid[1] / maxBidQty) * 100}%`;
          const askBarWidth = `${(ask[1] / maxAskQty) * 100}%`;

          return (
            <div key={idx} className="grid grid-cols-2 text-[11px] h-5.5 relative hover:bg-[#151F29] num-tabular">
              {/* Bid Side */}
              <div
                className="relative flex items-center justify-between px-2 pr-3 cursor-pointer group"
                onClick={() => onQuickFill && onQuickFill('BUY', bid[0])}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#35C69A]/15 pointer-events-none transition-all"
                  style={{ width: bidBarWidth }}
                />
                <span className="text-[#8B99A8] text-[10px]">{bid[1]}</span>
                <span className="text-[#35C69A] font-semibold">{currencySymbol}{bid[0]?.toFixed(2)}</span>
              </div>

              {/* Ask Side */}
              <div
                className="relative flex items-center justify-between px-2 pl-3 cursor-pointer group"
                onClick={() => onQuickFill && onQuickFill('SELL', ask[0])}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#EF6468]/15 pointer-events-none transition-all"
                  style={{ width: askBarWidth }}
                />
                <span className="text-[#EF6468] font-semibold">{currencySymbol}{ask[0]?.toFixed(2)}</span>
                <span className="text-[#8B99A8] text-[10px]">{ask[1]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
