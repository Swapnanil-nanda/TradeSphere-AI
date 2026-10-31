'use client';

import React, { useState } from 'react';
import { X, Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { WatchlistAlert, apiClient } from '../../lib/api-client';

interface WatchlistAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  alerts: WatchlistAlert[];
  onRefreshAlerts: () => void;
}

export default function WatchlistAlertsModal({
  isOpen,
  onClose,
  defaultSymbol = 'RELIANCE',
  alerts = [],
  onRefreshAlerts
}: WatchlistAlertsModalProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [alertType, setAlertType] = useState<'PRICE_ABOVE' | 'PRICE_BELOW' | 'VOLUME_SPIKE' | 'RSI_OVERBOUGHT' | 'RSI_OVERSOLD'>('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState<string>('3000');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetValue);
    if (isNaN(val) || val <= 0) {
      setError('Please provide a valid positive target value.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiClient.createWatchlistAlert({
        symbol: symbol.toUpperCase().trim(),
        alertType,
        targetValue: val,
        notes: notes.trim() || undefined
      });
      setNotes('');
      onRefreshAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id: string | number) => {
    try {
      await apiClient.deleteWatchlistAlert(id);
      onRefreshAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete alert');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="bg-[#050505] border border-[#141414] rounded-xl max-w-xl w-full p-6 shadow-2xl text-[#F0F3F6] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#141414]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 flex items-center justify-center text-[#2979FF]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">Price & Indicator Alerts</h3>
              <p className="text-[11px] text-[#808a9d]">
                Real-time rule triggers evaluated against active market feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#808a9d] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#ff333a]/10 border border-[#ff333a]/30 rounded-lg text-xs text-[#ff333a] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="bg-[#080808] border border-[#141414] rounded-lg p-4 space-y-3">
          <div className="text-[10px] font-bold text-[#808a9d] uppercase tracking-wider">
            Create New Rule
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-[#808a9d] mb-1">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE"
                className="w-full bg-[#050505] border border-[#1a1a1a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#2979FF]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#808a9d] mb-1">Trigger Condition</label>
              <select
                value={alertType}
                onChange={(e: any) => setAlertType(e.target.value)}
                className="w-full bg-[#050505] border border-[#1a1a1a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2979FF]"
              >
                <option value="PRICE_ABOVE">Price Above (&gt;=)</option>
                <option value="PRICE_BELOW">Price Below (&lt;=)</option>
                <option value="VOLUME_SPIKE">Volume Spike (&gt;=)</option>
                <option value="RSI_OVERBOUGHT">RSI Overbought (&gt;= 70)</option>
                <option value="RSI_OVERSOLD">RSI Oversold (&lt;= 30)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#808a9d] mb-1">Target Threshold</label>
              <input
                type="number"
                step="any"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 3000"
                className="w-full bg-[#050505] border border-[#1a1a1a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#2979FF]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#808a9d] mb-1">Memo / Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Resistance zone breakout test"
              className="w-full bg-[#050505] border border-[#1a1a1a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2979FF]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Add Alert Rule'}</span>
            </button>
          </div>
        </form>

        {/* Existing Alerts List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#808a9d]">
            <span>Active Configured Alerts ({safeAlerts.length})</span>
            <span className="text-[10px] font-mono text-[#00c805]">MONITORED REAL-TIME</span>
          </div>

          {safeAlerts.length === 0 ? (
            <div className="p-4 text-center text-[#808a9d] text-xs bg-[#080808] border border-[#141414] rounded-lg font-mono">
              No active alerts. Add a rule above to monitor price or volume conditions.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#141414]">
              {safeAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="pt-1.5 flex items-center justify-between p-2 rounded bg-[#080808] border border-[#141414] text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white">{alt.symbol}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/20">
                      {alt.alertType.replace('_', ' ')}
                    </span>
                    <span className="text-[#00c805] font-bold">
                      {Number(alt.targetValue ?? 0).toFixed(2)}
                    </span>
                    {alt.notes && (
                      <span className="text-[10px] text-[#808a9d] truncate max-w-[120px] font-sans">
                        ({alt.notes})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-sans">
                      ACTIVE
                    </span>
                    <button
                      onClick={() => handleDeleteAlert(alt.id)}
                      className="text-[#808a9d] hover:text-[#ff333a] p-1 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
