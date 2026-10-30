'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../lib/theme';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Hide public navbar on internal app routes and dedicated trading terminal
  if (pathname?.startsWith('/app') || pathname?.startsWith('/terminal')) {
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1b253b] text-xs select-none transition-colors">
      {/* Top Advisory Banner with Visible Simulated Notice */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/30 px-4 py-1 text-center text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>TradeSphere AI Paper Trading Environment: 100% Free &amp; Simulated Market Data (NSE/BSE &amp; US)</span>
        <Link href="/terminal" className="underline font-semibold text-blue-800 dark:text-blue-200 hover:text-blue-900 ml-1">
          Launch Terminal &rarr;
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-sm">
              Ω
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                TradeSphere<span className="text-blue-600 dark:text-blue-500">AI</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  SIMULATED
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
                className={`px-3 py-1.5 rounded font-medium transition-all text-xs ${
                  isActive(link.path)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <Link
              href="/login"
              className="px-3 py-1.5 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              Register
            </Link>
            <Link
              href="/terminal"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
            >
              <span>Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <Link
              href="/terminal"
              className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-[11px]"
            >
              Terminal
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0c121f] border-b border-slate-200 dark:border-[#1b253b] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded text-xs font-medium ${
                isActive(link.path)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <Link
              href="/login"
              className="flex-1 text-center py-2 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/terminal"
              className="flex-1 text-center py-2 rounded bg-blue-600 text-white text-xs font-semibold"
            >
              Terminal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
