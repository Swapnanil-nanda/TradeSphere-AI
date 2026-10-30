'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Compass, Eye, Filter, BarChart2, BookOpen, 
  ArrowLeftRight, PieChart, ShieldAlert, GraduationCap, Settings, 
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Markets', path: '/app/markets', icon: Compass },
    { name: 'Watchlists', path: '/app/watchlists', icon: Eye },
    { name: 'Screener', path: '/app/screener', icon: Filter },
    { name: 'Charts', path: '/app/charts', icon: BarChart2 },
    { name: 'Research', path: '/app/research', icon: BookOpen },
    { name: 'Paper Trading', path: '/app/paper-trading', icon: ArrowLeftRight },
    { name: 'Portfolio', path: '/app/portfolio', icon: PieChart },
    { name: 'Risk Management', path: '/app/risk', icon: ShieldAlert },
    { name: 'Learning', path: '/app/learning', icon: GraduationCap },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/app/dashboard' && (pathname === '/app' || pathname === '/app/dashboard')) return true;
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`bg-[#090d16] border-r border-[#1b253b] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#1b253b]">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/20">
                Ω
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                  TradeSphere<span className="text-blue-500">AI</span>
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm">
                Ω
              </div>
            </Link>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Simulator Indicator */}
      <div className="p-3 border-t border-[#1b253b] bg-[#070b14]">
        {!collapsed ? (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>24/7 GBM ENGINE</span>
            </div>
            <div className="text-[10px] text-slate-500">Zero-Key Fallback Active</div>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mx-auto" title="24/7 GBM Simulator Active" />
        )}
      </div>
    </aside>
  );
}
