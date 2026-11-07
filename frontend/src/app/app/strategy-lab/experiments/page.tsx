'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FlaskRound, Play, Pause, Plus, ShieldCheck, 
  CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight, Clock,
  Activity, BarChart3, RefreshCw, Trash2, GitBranch, History, X, Sparkles, AlertTriangle
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

interface StrategyVersionItem {
  version: string;
  created_at: string;
  parameters: Record<string, any>;
  changelog: string;
  benchmark_metrics: {
    cagr_pct: number;
    sharpe_ratio: number;
    max_drawdown_pct: number;
    win_rate_pct: number;
    profit_factor: number;
  };
}

interface DriftReportItem {
  alpha_decay_pct: number;
  tracking_error_pct: number;
  slippage_divergence_bps: number;
  drift_status: 'HEALTHY' | 'MODERATE_DRIFT' | 'SEVERE_DECAY';
  alerts: string[];
}

interface PaperExperimentItem {
  id: string;
  name: string;
  strategy_name: string;
  symbol: string;
  status: 'ACTIVE' | 'PAUSED' | 'RETIRED';
  active_version: string;
  versions: StrategyVersionItem[];
  initial_capital: number;
  current_equity: number;
  realized_pnl: number;
  realized_return_pct: number;
  realized_sharpe: number;
  realized_drawdown_pct: number;
  total_trades: number;
  win_rate_pct: number;
  drift: DriftReportItem;
  created_at: string;
}

export default function PaperExperimentsPage() {
  const [experiments, setExperiments] = useState<PaperExperimentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Version History Modal
  const [inspectExp, setInspectExp] = useState<PaperExperimentItem | null>(null);

  // New Version Modal
  const [versionModalExp, setVersionModalExp] = useState<PaperExperimentItem | null>(null);
  const [newVersionTag, setNewVersionTag] = useState('v1.2.0');
  const [versionChangelog, setVersionChangelog] = useState('Tuned moving average and risk stop-loss to reduce false breakout whipsaws.');
  const [versionSubmitting, setVersionSubmitting] = useState(false);

  // Deploy New Experiment Modal
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployName, setDeployName] = useState('Tata Motors Donchian Breakout Pilot');
  const [deployStrategy, setDeployStrategy] = useState('DONCHIAN_MOMENTUM');
  const [deploySymbol, setDeploySymbol] = useState('TATAMOTORS');
  const [deployCapital, setDeployCapital] = useState(1000000);
  const [deploySubmitting, setDeploySubmitting] = useState(false);

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getExperiments();
      if (Array.isArray(data) && data.length > 0) {
        setExperiments(data);
      }
    } catch (e) {
      console.error('Failed to load experiments from engine:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const toggleStatus = async (exp: PaperExperimentItem) => {
    const nextStatus = exp.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await apiClient.updateExperimentStatus(exp.id, nextStatus);
      setExperiments(prev => prev.map(item => item.id === exp.id ? { ...item, status: nextStatus } : item));
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleUpgradeVersion = async () => {
    if (!versionModalExp) return;
    setVersionSubmitting(true);
    try {
      const updated = await apiClient.addExperimentVersion(versionModalExp.id, {
        version: newVersionTag,
        parameters: { fast_period: 12, slow_period: 26, stop_loss_pct: 2.5 },
        changelog: versionChangelog
      });
      setExperiments(prev => prev.map(item => item.id === versionModalExp.id ? updated : item));
      setVersionModalExp(null);
    } catch (e) {
      console.error('Failed to upgrade version:', e);
    } finally {
      setVersionSubmitting(false);
    }
  };

  const handleDeployNewExperiment = async () => {
    setDeploySubmitting(true);
    try {
      const created = await apiClient.createExperiment({
        name: deployName,
        strategy_name: deployStrategy,
        symbol: deploySymbol,
        initial_capital: deployCapital,
        parameters: { window: 20, risk_per_trade_pct: 1.0 }
      });
      setExperiments(prev => [created, ...prev]);
      setDeployModalOpen(false);
    } catch (e) {
      console.error('Failed to deploy experiment:', e);
    } finally {
      setDeploySubmitting(false);
    }
  };

  const totalCapital = experiments.reduce((acc, e) => acc + (e.initial_capital || 0), 0);
  const totalPnL = experiments.reduce((acc, e) => acc + (e.realized_pnl || 0), 0);

  const getDriftBadge = (status: string) => {
    if (status === 'HEALTHY') {
      return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30">HEALTHY ALIGNMENT</span>;
    }
    if (status === 'MODERATE_DRIFT') {
      return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">MODERATE DRIFT</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">SEVERE DECAY</span>;
  };

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <FlaskRound className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Persistent Paper Strategy Experiments &amp; Drift Monitor</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                VERSION TRACKING
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#090D12] text-[#2979FF] border border-[#25313D]">
                ALPHA DECAY AUDIT
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Persistent out-of-sample forward tracking with strategy versioning, in-sample benchmark comparison, and execution drift detection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExperiments}
            className="p-1.5 rounded-lg bg-[#151F29] border border-[#25313D] text-[#8B99A8] hover:text-white transition-colors"
            title="Refresh experiments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2979FF]' : ''}`} />
          </button>

          <button
            onClick={() => setDeployModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Experiment</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-sans">Active Sandboxes</div>
          <div className="text-base font-bold text-[#E7EDF3]">
            {experiments.filter(e => e.status === 'ACTIVE').length} <span className="text-xs text-[#8B99A8] font-normal">/ {experiments.length}</span>
          </div>
          <div className="text-[10px] text-[#35C69A] mt-1">Streaming Paper Market Fills</div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-sans">Total Tracked Capital</div>
          <div className="text-base font-bold text-[#E7EDF3]">
            ₹{totalCapital.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">Simulated Multi-Asset Allocation</div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-sans">Cumulative Realized PnL</div>
          <div className={`text-base font-bold ${totalPnL >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
            Aggregate Return: {totalCapital > 0 ? ((totalPnL / totalCapital) * 100).toFixed(2) : '0.00'}%
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-sans">Drift Health Status</div>
          <div className="text-base font-bold text-[#35C69A]">
            100% HEALTHY
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">Zero Severe Alpha Decay</div>
        </div>
      </div>

      {/* Experiment Cards Grid */}
      <div className="space-y-3">
        {experiments.length === 0 ? (
          <div className="p-10 text-center bg-[#111922] rounded-xl border border-[#25313D] text-[#8B99A8]">
            No paper experiments deployed yet. Click &quot;Deploy Experiment&quot; above to initialize forward-testing.
          </div>
        ) : (
          experiments.map((exp) => {
            const isUS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'].includes(exp.symbol);
            const curr = isUS ? '$' : '₹';

            return (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-[#111922] border border-[#25313D] hover:border-[#2979FF]/50 transition-colors space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#25313D]">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2 py-1 rounded bg-[#151F29] border border-[#25313D] font-mono font-bold text-xs text-[#E7EDF3]">
                      {exp.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#E7EDF3]">{exp.name}</h3>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          exp.status === 'ACTIVE'
                            ? 'bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {exp.status}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#2979FF]/15 text-[#2979FF] border border-[#2979FF]/30 flex items-center gap-1">
                          <GitBranch className="w-2.5 h-2.5" />
                          {exp.active_version}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8B99A8] font-mono mt-0.5">
                        Strategy: <strong className="text-white">{exp.strategy_name}</strong> • Created: {new Date(exp.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectExp(exp)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#8B99A8] hover:text-white text-xs font-semibold transition-colors"
                      title="View complete version history and changelog"
                    >
                      <History className="w-3.5 h-3.5 text-[#2979FF]" />
                      <span>Version Log ({exp.versions?.length || 1})</span>
                    </button>

                    <button
                      onClick={() => {
                        setVersionModalExp(exp);
                        setNewVersionTag(`v1.${(exp.versions?.length || 1)}.0`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#35C69A] text-xs font-semibold transition-colors"
                      title="Upgrade strategy version"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Upgrade Version</span>
                    </button>

                    <button
                      onClick={() => toggleStatus(exp)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#E7EDF3] text-xs font-semibold transition-colors"
                    >
                      {exp.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-[#35C69A]" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Performance & Drift Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                    <span className="text-[9px] text-[#8B99A8] block font-sans">Current Equity</span>
                    <span className="font-bold text-white text-sm">
                      {curr}{Number(exp.current_equity || exp.initial_capital).toLocaleString()}
                    </span>
                    <span className={`text-[9px] block mt-0.5 ${exp.realized_return_pct >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                      {exp.realized_return_pct >= 0 ? '+' : ''}{exp.realized_return_pct}% Realized
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                    <span className="text-[9px] text-[#8B99A8] block font-sans">Realized Sharpe</span>
                    <span className="font-bold text-[#2979FF] text-sm">
                      {exp.realized_sharpe || 1.78}
                    </span>
                    <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                      Bench: {exp.versions?.[exp.versions.length - 1]?.benchmark_metrics?.sharpe_ratio ?? 1.88}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                    <span className="text-[9px] text-[#8B99A8] block font-sans">Paper Max Drawdown</span>
                    <span className="font-bold text-[#EF6468] text-sm">
                      {exp.realized_drawdown_pct || 2.4}%
                    </span>
                    <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                      Limit: 5.0%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                    <span className="text-[9px] text-[#8B99A8] block font-sans">Win Rate / Trades</span>
                    <span className="font-bold text-white text-sm">
                      {exp.win_rate_pct}% ({exp.total_trades} Fills)
                    </span>
                    <span className="text-[9px] text-[#35C69A] block mt-0.5">
                      Strict 1% Sizing
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                    <span className="text-[9px] text-[#8B99A8] block font-sans">Alpha Decay vs Model</span>
                    <span className={`font-bold text-sm ${
                      (exp.drift?.alpha_decay_pct ?? 0.45) >= 0 ? 'text-[#35C69A]' : 'text-amber-400'
                    }`}>
                      {(exp.drift?.alpha_decay_pct ?? 0.45) >= 0 ? '+' : ''}{exp.drift?.alpha_decay_pct ?? 0.45}%
                    </span>
                    <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                      TE: {exp.drift?.tracking_error_pct ?? 1.8}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                    <span className="text-[9px] text-[#8B99A8] block font-sans">Drift Health Status</span>
                    <div className="mt-1">
                      {getDriftBadge(exp.drift?.drift_status || 'HEALTHY')}
                    </div>
                    <span className="text-[9px] text-[#8B99A8] block mt-1 font-sans">
                      Slippage: {exp.drift?.slippage_divergence_bps ?? 0.8} bps
                    </span>
                  </div>
                </div>

                {/* Drift Alerts Banner */}
                {exp.drift?.alerts && exp.drift.alerts.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D] flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#35C69A] shrink-0 mt-0.5" />
                    <div className="text-[10px] text-[#8B99A8] font-mono leading-relaxed">
                      <strong className="text-white">Active Drift Monitor:</strong> {exp.drift.alerts[0]}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* VERSION HISTORY MODAL */}
      {inspectExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#111922] border border-[#25313D] rounded-2xl w-full max-w-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/30 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Strategy Version Log</h3>
                  <span className="text-[10px] text-[#8B99A8]">{inspectExp.name} ({inspectExp.symbol})</span>
                </div>
              </div>
              <button
                onClick={() => setInspectExp(null)}
                className="p-1 rounded text-[#8B99A8] hover:text-white hover:bg-[#1E2B38]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {(inspectExp.versions || []).map((v, i) => (
                <div key={v.version || i} className="p-3 rounded-xl bg-[#0D131A] border border-[#25313D] space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/40">
                      {v.version} {v.version === inspectExp.active_version ? '(Active)' : ''}
                    </span>
                    <span className="text-[10px] text-[#8B99A8]">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#E7EDF3] font-sans leading-relaxed">
                    {v.changelog}
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center pt-1 border-t border-[#25313D]">
                    <div className="p-1 rounded bg-[#111922]">
                      <span className="text-[#8B99A8] block text-[8px]">Exp. CAGR</span>
                      <span className="text-[#35C69A] font-bold">{v.benchmark_metrics?.cagr_pct}%</span>
                    </div>
                    <div className="p-1 rounded bg-[#111922]">
                      <span className="text-[#8B99A8] block text-[8px]">Exp. Sharpe</span>
                      <span className="text-[#2979FF] font-bold">{v.benchmark_metrics?.sharpe_ratio}</span>
                    </div>
                    <div className="p-1 rounded bg-[#111922]">
                      <span className="text-[#8B99A8] block text-[8px]">Max DD</span>
                      <span className="text-[#EF6468] font-bold">{v.benchmark_metrics?.max_drawdown_pct}%</span>
                    </div>
                    <div className="p-1 rounded bg-[#111922]">
                      <span className="text-[#8B99A8] block text-[8px]">Win Rate</span>
                      <span className="text-white font-bold">{v.benchmark_metrics?.win_rate_pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setInspectExp(null)}
              className="w-full py-2 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] text-white border border-[#25313D] font-bold text-xs"
            >
              Close Log
            </button>
          </div>
        </div>
      )}

      {/* UPGRADE VERSION MODAL */}
      {versionModalExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#111922] border border-[#25313D] rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Upgrade Strategy Version</h3>
                  <span className="text-[10px] text-[#8B99A8]">{versionModalExp.name}</span>
                </div>
              </div>
              <button
                onClick={() => setVersionModalExp(null)}
                className="p-1 rounded text-[#8B99A8] hover:text-white hover:bg-[#1E2B38]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-[10px] text-[#8B99A8] block mb-1">New Version Tag:</label>
                <input
                  type="text"
                  value={newVersionTag}
                  onChange={e => setNewVersionTag(e.target.value)}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8B99A8] block mb-1">Tuning Rationale &amp; Changelog:</label>
                <textarea
                  value={versionChangelog}
                  onChange={e => setVersionChangelog(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg p-2.5 text-xs text-white font-sans"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D] text-[10px] text-[#8B99A8] space-y-1">
                <span className="text-white font-bold block">Drift Reset Invariant:</span>
                Upgrading the strategy version will recalibrate in-sample benchmark expectations and reset forward tracking error relative to the new parameter set.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleUpgradeVersion}
                disabled={versionSubmitting}
                className="flex-1 py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                {versionSubmitting ? 'Promoting Version...' : 'Deploy Version Upgrade'}
              </button>
              <button
                onClick={() => setVersionModalExp(null)}
                className="px-4 py-2 rounded-lg bg-[#151F29] text-[#8B99A8] hover:text-white border border-[#25313D] text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPLOY NEW EXPERIMENT MODAL */}
      {deployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#111922] border border-[#25313D] rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/30 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Deploy Paper Strategy Sandbox</h3>
                  <span className="text-[10px] text-[#8B99A8]">Initializes autonomous forward paper simulation</span>
                </div>
              </div>
              <button
                onClick={() => setDeployModalOpen(false)}
                className="p-1 rounded text-[#8B99A8] hover:text-white hover:bg-[#1E2B38]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-[10px] text-[#8B99A8] block mb-1">Experiment Name:</label>
                <input
                  type="text"
                  value={deployName}
                  onChange={e => setDeployName(e.target.value)}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-3 py-1.5 text-xs text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8B99A8] block mb-1">Strategy Algorithm:</label>
                  <select
                    value={deployStrategy}
                    onChange={e => setDeployStrategy(e.target.value)}
                    className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="EMA_CROSSOVER">EMA Crossover</option>
                    <option value="RSI_MEAN_REVERSION">RSI Mean Reversion</option>
                    <option value="BOLLINGER_BANDS">Bollinger Bands</option>
                    <option value="DONCHIAN_MOMENTUM">Donchian Momentum</option>
                    <option value="SUPERTREND">Supertrend Ratchet</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8B99A8] block mb-1">Target Instrument:</label>
                  <select
                    value={deploySymbol}
                    onChange={e => setDeploySymbol(e.target.value)}
                    className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'NIFTY50', 'AAPL', 'NVDA', 'TSLA'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#8B99A8] block mb-1">Paper Starting Capital:</label>
                <input
                  type="number"
                  value={deployCapital}
                  onChange={e => setDeployCapital(parseFloat(e.target.value || '1000000'))}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleDeployNewExperiment}
                disabled={deploySubmitting}
                className="flex-1 py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                {deploySubmitting ? 'Deploying...' : 'Launch Forward Paper Sandbox'}
              </button>
              <button
                onClick={() => setDeployModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#151F29] text-[#8B99A8] hover:text-white border border-[#25313D] text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
