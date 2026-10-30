import React, { useState, useEffect } from 'react';
import { Bot, X, ShieldAlert, CheckCircle, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { apiClient } from '../lib/api-client';

export default function AICoachModal({ symbol, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getRiskMetrics(symbol)
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [symbol]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl max-w-lg w-full p-5 shadow-xl relative text-xs text-slate-700 dark:text-slate-200 transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4 text-blue-100" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Risk Coach &amp; Market Structure Auditor
            </h2>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Contextual evaluation for {symbol}</div>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Analyzing chart patterns &amp; behavioral journal...
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Market Regime Badge */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Market Regime</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{data?.trendStrength || 'MODERATE'}</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                data?.bias === 'BULLISH'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : data?.bias === 'BEARISH'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
              }`}>
                {data?.bias || 'NEUTRAL'}
              </span>
            </div>

            {/* Plain English Summary */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-[#1e293b]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase mb-1 block">Technical Insight</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{data?.plainEnglishSummary}</p>
            </div>

            {/* Key Levels & Suggested ATR Stop Distance */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-sans font-semibold block">Major Support</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{data?.keyLevels?.support}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] text-blue-700 dark:text-blue-400 uppercase font-sans font-semibold block">Suggested ATR Stop</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">±₹{data?.suggestedStopDistance}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] text-rose-700 dark:text-rose-400 uppercase font-sans font-semibold block">Major Resistance</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{data?.keyLevels?.resistance}</span>
              </div>
            </div>

            {/* Behavioral Journal Audit */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-[#1e293b]">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Behavioral Audit (Recent Trades)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans text-[11px] leading-relaxed">
                {data?.audit?.behavioralVerdict || 'No behavioral anomalies detected. Continue respecting hard Stop-Loss rules.'}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span>Closed Trades: <b className="text-slate-900 dark:text-white">{data?.audit?.totalClosedTrades || 0}</b></span>
                <span>Win Rate: <b className="text-emerald-700 dark:text-emerald-400">{data?.audit?.winRate || '0.0%'}</b></span>
                <span>Avg Expectancy: <b className="text-blue-700 dark:text-blue-400">{data?.audit?.avgRMultiple || '0.0R'}</b></span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-xs"
          >
            Acknowledge &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
