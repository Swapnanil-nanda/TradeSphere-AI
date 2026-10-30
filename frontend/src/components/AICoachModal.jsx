import React, { useState, useEffect } from 'react';
import { Bot, X, ShieldAlert, CheckCircle, Target, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AICoachModal({ symbol, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/coach?symbol=${symbol}`)
      .then(res => res.json())
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl max-w-lg w-full p-5 shadow-2xl relative text-xs text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              AI Risk Coach & Market Structure Auditor
            </h2>
            <div className="text-[11px] text-slate-400">Contextual evaluation for {symbol}</div>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Analyzing chart patterns & behavioral journal...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Market Regime Badge */}
            <div className="p-3 rounded-lg bg-[#080d1a] border border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Market Regime</span>
                <span className="font-extrabold text-white text-sm">{data?.trendStrength}</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                data?.bias === 'BULLISH'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : data?.bias === 'BEARISH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {data?.bias}
              </span>
            </div>

            {/* Plain English Summary */}
            <div className="p-3 rounded-lg bg-[#080d1a] border border-[#1e293b]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1 block">Technical Insight</span>
              <p className="text-slate-300 leading-relaxed font-sans">{data?.plainEnglishSummary}</p>
            </div>

            {/* Key Levels & Suggested ATR Stop Distance */}
            <div className="grid grid-cols-3 gap-2 text-center font-['JetBrains_Mono']">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-emerald-400 uppercase font-sans block">Major Support</span>
                <span className="font-bold text-slate-200">₹{data?.keyLevels?.support}</span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-cyan-400 uppercase font-sans block">Suggested ATR Stop</span>
                <span className="font-bold text-slate-200">±₹{data?.suggestedStopDistance}</span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-rose-400 uppercase font-sans block">Major Resistance</span>
                <span className="font-bold text-slate-200">₹{data?.keyLevels?.resistance}</span>
              </div>
            </div>

            {/* Behavioral Journal Audit */}
            <div className="p-3 rounded-lg bg-[#080d1a] border border-[#1e293b]">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Behavioral Audit (Recent Trades)</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                {data?.audit?.behavioralVerdict}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-['JetBrains_Mono'] pt-2 border-t border-slate-800/80">
                <span>Closed Trades: <b className="text-white">{data?.audit?.totalClosedTrades}</b></span>
                <span>Win Rate: <b className="text-emerald-400">{data?.audit?.winRate}</b></span>
                <span>Avg Expectancy: <b className="text-cyan-400">{data?.audit?.avgRMultiple}</b></span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
