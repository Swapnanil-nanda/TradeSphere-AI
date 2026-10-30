import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ExternalLink, Heart } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-[#070b14] border-t border-[#1b253b] text-slate-400 text-xs select-none">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm">
                Ω
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                TradeSphere<span className="text-blue-500">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An India-first, zero-fee financial research and paper-trading terminal built with institutional risk guardrails, 24/7 realistic market simulation, and contextual AI coaching.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
              <span>Engineered with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for retail traders & finance students</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-1.5">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/markets" className="hover:text-white transition-colors">Markets Overview</Link></li>
              <li><Link to="/app" className="hover:text-white text-blue-400 font-semibold transition-colors">Launch Terminal</Link></li>
              <li><Link to="/features#risk-gatekeeper" className="hover:text-white transition-colors">1% Risk Engine</Link></li>
              <li><Link to="/features#options-greeks" className="hover:text-white transition-colors">Black-Scholes Greeks</Link></li>
            </ul>
          </div>

          {/* Learn & Research */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Academy & Tools</h4>
            <ul className="space-y-1.5">
              <li><Link to="/learning" className="hover:text-white transition-colors">Learning Academy</Link></li>
              <li><Link to="/learning#risk-basics" className="hover:text-white transition-colors">Risk Management 101</Link></li>
              <li><Link to="/learning#options-mastery" className="hover:text-white transition-colors">Options Greeks Guide</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Methodology</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Feedback & Support</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Legal & Trust</h4>
            <ul className="space-y-1.5">
              <li><Link to="/disclaimer" className="hover:text-white transition-colors">Regulatory Disclaimer</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer#paper-trading" className="hover:text-white transition-colors">Simulation Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Safety Notice (Non-Negotiable Mandatory Banner) */}
        <div className="mt-10 pt-6 border-t border-[#1b253b] bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-400">
              <strong className="text-slate-200">Mandatory Statutory & Simulation Disclaimer: </strong>
              TradeSphere AI is strictly an educational research platform, financial analytics sandbox, and simulated paper-trading terminal. 
              TradeSphere AI is <strong>NOT</strong> a SEBI-registered Research Analyst, Investment Advisor, or licensed brokerage. 
              No actual financial transactions or live market orders occur on this platform. All price quotes, order books, options Greeks, and portfolio valuations are generated via synthetic simulation (Geometric Brownian Motion) or historical market feeds for pedagogical and testing purposes only. 
              Past simulated performance is not indicative of future market returns. Capital at risk in live markets can be substantial.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-[#1b253b]/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div>
            &copy; {new Date().getFullYear()} TradeSphere AI. All rights reserved. 100% Free & Self-Hosted.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine: Online (GBM Simulator active)
            </span>
            <Link to="/disclaimer" className="hover:text-slate-300 underline">Compliance</Link>
            <Link to="/privacy" className="hover:text-slate-300 underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
