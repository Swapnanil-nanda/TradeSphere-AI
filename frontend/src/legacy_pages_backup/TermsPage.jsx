import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 select-none text-slate-300 text-xs leading-relaxed">
      <div className="border-b border-[#1b253b] pb-4">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
          Platform Agreement
        </span>
        <h1 className="text-3xl font-black text-white mt-3">Terms of Service</h1>
        <p className="text-slate-400 text-xs mt-1">Last Updated: October 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing or utilizing the TradeSphere AI web application, simulated market feeds, or learning curriculum, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service and our Regulatory Disclaimer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Scope of Service & Non-Commercial Use</h2>
        <p>
          TradeSphere AI is provided free of charge for non-commercial educational, analytical, and research purposes. You agree not to attempt to reverse engineer, abuse, or use automated scrapers to degrade service availability for fellow learners.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Limitation of Liability</h2>
        <p>
          Under no circumstances shall the creators, maintainers, or open-source contributors of TradeSphere AI be liable for any direct, indirect, incidental, or consequential damages resulting from any reliance on simulated market data, calculation errors, or trading decisions made outside the sandbox.
        </p>
      </section>
    </div>
  );
}
