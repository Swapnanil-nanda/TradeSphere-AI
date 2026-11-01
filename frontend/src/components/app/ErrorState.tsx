import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something Went Wrong',
  message = 'Failed to load market data from backend service.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#050505] border border-[#ff333a]/30 rounded-xl select-none">
      <div className="w-12 h-12 rounded-xl bg-[#ff333a]/10 border border-[#ff333a]/20 text-[#ff333a] flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1 font-sans">{title}</h3>
      <p className="text-xs text-[#808a9d] max-w-sm mb-4 leading-relaxed font-sans">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#080808] hover:bg-[#121212] text-[#F0F3F6] border border-[#1a1a1a] font-bold text-xs transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
