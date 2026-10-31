'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide public navbar on internal app routes and dedicated trading terminal
  if (pathname?.startsWith('/app') || pathname?.startsWith('/terminal')) {
    return null;
  }

  const navLinks = [
    { name: 'Dashboard', path: '/app/dashboard' },
    { name: 'Terminal', path: '/app/paper-trading' },
    { name: 'Markets', path: '/app/markets' },
    { name: 'Quant Research', path: '/app/quant/multi-agent' },
    { name: 'Wealth MPT', path: '/app/wealth/optimizer' },
    { name: 'Risk Centre', path: '/app/risk' },
    { name: 'Learning', path: '/app/learning/guide' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0D131A] border-b border-[#25313D] text-xs select-none">
      {/* Top Advisory Banner with Visible Simulated Notice */}
      <div className="bg-[#111922] border-b border-[#25313D] px-4 py-1 text-center text-[11px] text-[#8B99A8] font-medium flex items-center justify-center gap-2 font-mono">
        <span className="w-2 h-2 rounded-full bg-[#35C69A] animate-pulse" />
        <span>TradeSphere AI Institutional Workstation: 100% Free &amp; Simulated Market Data (NSE/BSE &amp; US)</span>
        <Link href="/app/paper-trading" className="underline font-semibold text-[#2979FF] hover:text-[#6d9fce] ml-1">
          Launch Terminal &rarr;
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded bg-[#2979FF] flex items-center justify-center font-black text-white text-xs shadow-xs">
              Ω
            </div>
            <div>
              <div className="font-bold text-xs tracking-tight text-[#E7EDF3] flex items-center gap-1.5 font-sans">
                TradeSphere<span className="text-[#2979FF]">AI</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                  INSTITUTIONAL
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-2.5 py-1 rounded font-medium transition-all text-xs ${
                  isActive(link.path)
                    ? 'text-[#E7EDF3] bg-[#151F29] font-semibold border-b border-[#2979FF]'
                    : 'text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#111922]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-2.5 py-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] font-medium hover:bg-[#111922] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/app/paper-trading"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#2979FF] hover:bg-[#1c62db] text-white font-semibold transition-colors shadow-xs"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#111922]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#25313D] bg-[#0D131A] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded text-xs text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#111922]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#25313D] flex flex-col gap-2">
            <Link
              href="/app/paper-trading"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded bg-[#2979FF] text-white font-semibold text-xs"
            >
              Launch Terminal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
