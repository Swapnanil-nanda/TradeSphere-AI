import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — TradeSphere AI',
  description: 'Local-first privacy policy and data governance rules for TradeSphere AI.'
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 select-none text-slate-300 text-xs leading-relaxed">
      <div className="border-b border-[#1b253b] pb-4">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
          Data Governance &amp; Privacy
        </span>
        <h1 className="text-3xl font-black text-white mt-3">Privacy Policy</h1>
        <p className="text-slate-400 text-xs mt-1">Last Updated: October 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Local-First &amp; Zero-Monetization Pledge</h2>
        <p>
          TradeSphere AI is built with a local-first privacy ethos. We do not sell, rent, monetize, or broker your personal data, paper-trading logs, or strategy backtests to high-frequency trading firms, brokers, or third-party marketing networks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Information We Store</h2>
        <p>
          For local usage, preferences such as active symbol, layout tier (Basic/Active/Pro), and paper trading portfolio state are stored locally within your browser or your self-hosted backend instance. For optional accounts, only minimal authentication identifiers (e.g., username/email and cryptographically hashed passwords) are stored.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Cookies and Telemetry</h2>
        <p>
          We use strictly necessary session cookies to maintain your login status and user state. We do not use intrusive cross-site tracking cookies or third-party advertising tracking scripts.
        </p>
      </section>
    </div>
  );
}
