'use client';

import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Activity } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface ModeSelectorProps {
  currentMode?: 'basic' | 'active' | 'pro';
  onModeChange?: (mode: 'basic' | 'active' | 'pro') => void;
}

export default function ModeSelector({ currentMode = 'active', onModeChange }: ModeSelectorProps) {
  const [mode, setMode] = useState<'basic' | 'active' | 'pro'>(currentMode);

  useEffect(() => {
    const user = apiClient.getUserProfile();
    if (user.tier) setMode(user.tier);
  }, []);

  const handleSelect = (m: 'basic' | 'active' | 'pro') => {
    setMode(m);
    apiClient.updateUserPreferences({ tier: m });
    if (onModeChange) onModeChange(m);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#070b14] p-0.5 rounded-lg border border-slate-200 dark:border-[#1b253b] text-xs select-none">
      <button
        onClick={() => handleSelect('basic')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
          mode === 'basic'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Tier 1: Guided 20-EMA trend guide, 1% auto-risk sizing, plain-English coach"
      >
        Basic
      </button>

      <button
        onClick={() => handleSelect('active')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
          mode === 'active'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Tier 2: Multi-timeframe candlesticks, VWAP, Bracket OCO orders, trade journal"
      >
        Active
      </button>

      <button
        onClick={() => handleSelect('pro')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
          mode === 'pro'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Tier 3: 20-depth DOM ladder, Black-Scholes Greeks, vectorized backtester"
      >
        Pro Quant
      </button>
    </div>
  );
}
