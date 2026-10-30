'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/app')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Markets', path: '/markets' },
    { name: 'Learning', path: '/learning' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-md border-b border-[#1b253b] text-xs select-none">
      {/* Top Advisory Banner with Visible Simulated Notice */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-blue-900/40 border-b border-blue-500/20 px-4 py-1.5 text-center text-[11px] text-blue-300 font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>TradeSphere AI Paper Trading Environment: 100% Free &amp; Simulated Market Data (NSE/BSE &amp; US)</span>
        <Link href="/terminal" className="underline font-bold text-white hover:text-blue-200 ml-1">
          Launch Terminal &rarr;
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              Ω
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                TradeSphere<span className="text-blue-500">AI</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SIMULATED
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">India-First Market Research &amp; Risk Engine</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all text-xs ${
                  isActive(link.path)
                    ? 'text-white bg-blue-600/20 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white font-semibold transition-all hover:bg-slate-800/60"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-semibold transition-all"
            >
              Register
            </Link>
            <Link
              href="/terminal"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/terminal"
              className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold text-[11px]"
            >
              Terminal
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c121f] border-b border-[#1b253b] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md font-semibold text-sm ${
                isActive(link.path)
                  ? 'text-white bg-blue-600/20 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-md bg-slate-800 text-slate-200 font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-md bg-slate-700 text-white font-semibold"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
