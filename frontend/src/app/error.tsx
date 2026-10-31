'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none bg-[#000000] text-[#F0F3F6]">
      <div className="w-12 h-12 rounded-xl bg-[#D8AB5E]/10 border border-[#D8AB5E]/30 flex items-center justify-center text-[#D8AB5E] mb-4 shadow-xl">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-black text-white mb-2 font-sans tracking-tight">
        Workstation State Sync Notice
      </h2>
      <p className="text-xs text-[#808a9d] max-w-md mb-6 leading-relaxed">
        The trading workstation encountered a client synchronization hiccup or stale asset chunk from an updated deployment.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry State</span>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] text-[#F0F3F6] font-semibold text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Page</span>
        </button>

        <Link
          href="/app/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] text-[#808a9d] hover:text-white font-semibold text-xs transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Overview Dashboard</span>
        </Link>
      </div>

      {error && (
        <details open className="mt-6 text-left max-w-lg w-full bg-[#050505] border border-[#141414] rounded-lg p-3 text-[11px] font-mono text-[#808a9d]">
          <summary className="cursor-pointer text-[#D8AB5E] font-sans font-bold hover:text-amber-300">
            Diagnostic Details
          </summary>
          <div className="mt-2 text-[#ff333a] font-bold break-all">
            {error.name}: {error.message}
          </div>
          {error.digest && (
            <div className="text-[#808a9d] mt-1">Digest: {error.digest}</div>
          )}
          {error.stack && (
            <pre className="mt-2 text-[10px] text-[#808a9d] overflow-x-auto max-h-36 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </details>
      )}
    </div>
  );
}
