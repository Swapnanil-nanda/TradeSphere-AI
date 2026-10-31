'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Check, ChevronDown } from 'lucide-react';

export interface WorkspacePreset {
  id: string;
  name: string;
  description: string;
  targetPath: string;
}

export const WORKSPACE_PRESETS: WorkspacePreset[] = [
  { id: 'trading-desk', name: 'Trading Desk', description: '3-column terminal with DOM & ticket', targetPath: '/terminal' },
  { id: 'quant-lab', name: 'Quant Command Lab', description: '7-agent research & backtester', targetPath: '/app/quant/multi-agent' },
  { id: 'wealth-mpt', name: 'Wealth & MPT Studio', description: 'Portfolio optimizer & frontier', targetPath: '/app/wealth/optimizer' },
  { id: 'options-risk', name: 'Options & Risk Matrix', description: 'Options chain, Greeks & DOM', targetPath: '/app/risk/options' },
  { id: 'strategy-lab', name: 'Strategy Lab', description: 'Algorithmic strategy backtester', targetPath: '/app/quant/backtesting' },
  { id: 'research-grid', name: 'Research Grid', description: 'Technical & fundamental research', targetPath: '/app/research/technical' },
];

export default function WorkspaceSelector() {
  const [selectedId, setSelectedId] = useState<string>('trading-desk');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tradesphere_workspace_preset');
      if (saved && WORKSPACE_PRESETS.some(p => p.id === saved)) {
        setSelectedId(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelect = (preset: WorkspacePreset) => {
    setSelectedId(preset.id);
    try {
      localStorage.setItem('tradesphere_workspace_preset', preset.id);
    } catch {
      // ignore
    }
    setIsOpen(false);
    router.push(preset.targetPath);
  };

  const currentPreset = WORKSPACE_PRESETS.find(p => p.id === selectedId) || WORKSPACE_PRESETS[0];

  return (
    <div className="relative select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111922] hover:bg-[#151F29] border border-[#25313D] text-[#E7EDF3] text-xs font-medium transition-all"
        title="Switch Workspace Preset"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-[#2979FF]" />
        <span className="font-semibold">{currentPreset.name}</span>
        <ChevronDown className="w-3 h-3 text-[#8B99A8]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-64 bg-[#111922] border border-[#25313D] rounded-md shadow-2xl z-50 py-1 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#25313D] bg-[#0D131A] text-[10px] uppercase font-bold tracking-wider text-[#8B99A8]">
              WORKSPACE PRESETS
            </div>
            {WORKSPACE_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedId;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset)}
                  className={`w-full text-left px-3 py-2 flex items-start justify-between text-xs transition-colors ${
                    isSelected ? 'bg-[#151F29] text-[#E7EDF3]' : 'text-[#8B99A8] hover:bg-[#151F29] hover:text-[#E7EDF3]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#E7EDF3] flex items-center gap-1.5">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-[#8B99A8]">{preset.description}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#35C69A] shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
