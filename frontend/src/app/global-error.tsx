'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090D12] text-[#E7EDF3] flex items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md w-full bg-[#0D131A] border border-[#25313D] rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">TradeSphere Client Synchronization</h2>
          <p className="text-xs text-[#8B99A8] mb-6 leading-relaxed">
            A dynamic asset chunk or background state sync was interrupted. Reloading will fetch the latest version.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold text-xs transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#E7EDF3] font-semibold text-xs transition-colors"
            >
              Reload Workstation
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
