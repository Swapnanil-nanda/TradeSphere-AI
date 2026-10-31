'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[TradeSphere ErrorBoundary Caught Exception]:', error);
    // If it is a chunk load error caused by a background deployment, reload the page
    if (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Failed to fetch dynamically imported module')
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none bg-[#090D12] text-[#E7EDF3]">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-extrabold text-white mb-2">
        Workstation State Sync Notice
      </h2>
      <p className="text-xs text-[#8B99A8] max-w-md mb-6 leading-relaxed">
        The trading workstation encountered a client synchronization hiccup or stale asset chunk from an updated deployment.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2979FF] hover:bg-blue-600 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-500/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry State</span>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#E7EDF3] font-semibold text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Page</span>
        </button>

        <Link
          href="/app/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#E7EDF3] font-semibold text-xs transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Overview Dashboard</span>
        </Link>
      </div>

      {error && (
        <details className="mt-6 text-left max-w-lg w-full bg-[#0D131A] border border-[#25313D] rounded-xl p-3 text-[11px] font-mono text-[#8B99A8]">
          <summary className="cursor-pointer text-amber-400 font-sans font-semibold hover:text-amber-300">
            Diagnostic Details
          </summary>
          <div className="mt-2 text-rose-400 font-bold break-all">
            {error.name}: {error.message}
          </div>
          {error.digest && (
            <div className="text-[#8B99A8] mt-1">Digest: {error.digest}</div>
          )}
          {error.stack && (
            <pre className="mt-2 text-[10px] text-slate-500 overflow-x-auto max-h-36 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </details>
      )}
    </div>
  );
}
