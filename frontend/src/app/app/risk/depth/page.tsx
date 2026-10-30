'use client';

import React, { useState, useEffect } from 'react';
import { AlignVerticalSpaceAround, ShieldCheck, Activity } from 'lucide-react';
import OrderBookDOM from '../../../../components/OrderBookDOM';
import { apiClient, Ticker } from '../../../../lib/api-client';

export default function MarketDepthPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [ticker, setTicker] = useState<any>(null);
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'AAPL', 'NVDA'];

  useEffect(() => {
    apiClient.getTickers().then(list => {
      const found = list.find(t => t.symbol === symbol) || list[0];
      if (found) setTicker(found);
    });
  }, [symbol]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <AlignVerticalSpaceAround className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Level 2 Depth of Market (DOM Ladder)</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                20-depth institutional order book ladder with realistic geometric Brownian distribution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-800 dark:text-slate-200"
            >
              {symbols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* DOM Ladder View */}
      <div className="max-w-xl mx-auto bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs h-[540px] overflow-hidden">
        <OrderBookDOM ticker={ticker} />
      </div>
    </div>
  );
}
