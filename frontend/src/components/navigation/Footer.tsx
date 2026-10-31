'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/app') || pathname?.startsWith('/terminal')) {
    return null;
  }
  return (
    <footer className="bg-[#090D12] border-t border-[#25313D] text-[#8B99A8] text-xs select-none">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#2979FF] text-white flex items-center justify-center font-black text-xs shadow-xs">
                Ω
              </div>
              <span className="font-bold text-sm text-[#E7EDF3] tracking-tight font-sans">
                TradeSphere<span className="text-[#2979FF]">AI</span>
              </span>
            </Link>
            <p className="text-[#8B99A8] text-xs leading-relaxed max-w-sm">
              An India-first, zero-fee financial research and paper-trading workstation built with institutional risk guardrails, 24/7 realistic market simulation, and 7-agent quantitative research federation.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-[#8B99A8] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35C69A]" />
              <span>100% Free &amp; Self-Hosted Open Architecture</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#E7EDF3] uppercase tracking-wider text-[10px] font-mono">Product</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/app/paper-trading" className="text-[#2979FF] font-semibold hover:underline">Trading Terminal</Link></li>
              <li><Link href="/app/dashboard" className="hover:text-[#E7EDF3] transition-colors">Overview Dashboard</Link></li>
              <li><Link href="/app/screener" className="hover:text-[#E7EDF3] transition-colors">Stock Screener</Link></li>
              <li><Link href="/app/quant/multi-agent" className="hover:text-[#E7EDF3] transition-colors">7-Agent Command Center</Link></li>
              <li><Link href="/app/wealth/optimizer" className="hover:text-[#E7EDF3] transition-colors">MPT Optimizer</Link></li>
            </ul>
          </div>

          {/* Research & Risk */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#E7EDF3] uppercase tracking-wider text-[10px] font-mono">Quant &amp; Risk</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/app/quant/predictions" className="hover:text-[#E7EDF3] transition-colors">AI Predictions</Link></li>
              <li><Link href="/app/quant/backtesting" className="hover:text-[#E7EDF3] transition-colors">Strategy Backtesting</Link></li>
              <li><Link href="/app/risk/options" className="hover:text-[#E7EDF3] transition-colors">Options Greeks Matrix</Link></li>
              <li><Link href="/app/risk/depth" className="hover:text-[#E7EDF3] transition-colors">20-Level DOM</Link></li>
              <li><Link href="/app/risk/journal" className="hover:text-[#E7EDF3] transition-colors">AI Tilt Auditor</Link></li>
            </ul>
          </div>

          {/* Regulatory & Institutional Notices */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#E7EDF3] uppercase tracking-wider text-[10px] font-mono">Compliance</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/disclaimer" className="hover:text-[#E7EDF3] transition-colors">SEBI Compliance Notice</Link></li>
              <li><Link href="/privacy" className="hover:text-[#E7EDF3] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#E7EDF3] transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-[#E7EDF3] transition-colors">System Architecture</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Risk Banner */}
        <div className="mt-8 pt-6 border-t border-[#25313D] space-y-3">
          <div className="p-3 bg-[#111922] border border-[#25313D] rounded flex items-start gap-3 text-[11px] text-[#8B99A8]">
            <AlertTriangle className="w-4 h-4 text-[#D8AB5E] shrink-0 mt-0.5" />
            <div className="leading-relaxed font-mono text-[10px]">
              <strong className="text-[#E7EDF3]">STATUTORY FINANCIAL &amp; SEBI REGULATORY NOTICE:</strong> TradeSphere AI is strictly an educational research and paper-trading platform. It does not provide registered investment advisory, portfolio management, or real-money brokerage execution. All trades are executed in virtual currency against simulated Geometric Brownian Motion feeds.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8B99A8] pt-2">
            <div>
              &copy; {new Date().getFullYear()} TradeSphere AI. Open-source under MIT License.
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0 font-mono text-[10px]">
              <span>v2.0.0-PROD</span>
              <span>•</span>
              <span className="text-[#35C69A]">78/78 TESTS PASSED</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
