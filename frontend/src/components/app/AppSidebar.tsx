'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Terminal, Compass, Eye, ShoppingBag, Briefcase,
  Filter, LineChart, FileText, Newspaper, History,
  Cpu, Sparkles, BookmarkCheck, FileSpreadsheet,
  FlaskConical, PlayCircle, Sliders, FlaskRound,
  PieChart, TrendingUp, Activity, Calculator, Target,
  ShieldAlert, Layers, Percent, BarChart3, AlignVerticalSpaceAround, BookMarked,
  GraduationCap, BookOpen, HelpCircle, CheckSquare,
  ChevronLeft, ChevronRight, Lock, CheckCircle2, X
} from 'lucide-react';
import { apiClient, UserProfile } from '../../lib/api-client';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSlideNav?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  minTier: 'basic' | 'active' | 'pro';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentTier, setCurrentTier] = useState<'basic' | 'active' | 'pro'>('basic');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState(true); // Default ON to prevent beginner cognitive overload
  const [lockedModalItem, setLockedModalItem] = useState<NavItem | null>(null);

  // Sync active tier with apiClient and custom event
  useEffect(() => {
    const profile = apiClient.getUserProfile();
    const userTier = profile.tier || 'basic';
    setCurrentTier(userTier);
    // For Basic tier, automatically default filter to ON to protect beginners
    if (userTier === 'basic') {
      setFilterUnlockedOnly(true);
    } else {
      setFilterUnlockedOnly(false);
    }

    const handleTierChange = (e: any) => {
      if (e.detail?.tier) {
        const nextTier = e.detail.tier;
        setCurrentTier(nextTier);
        if (nextTier === 'basic') {
          setFilterUnlockedOnly(true);
        }
      }
    };

    window.addEventListener('tradesphere_tier_change', handleTierChange);
    return () => window.removeEventListener('tradesphere_tier_change', handleTierChange);
  }, []);

  const handleTierSwitch = (newTier: 'basic' | 'active' | 'pro') => {
    setCurrentTier(newTier);
    apiClient.updateUserPreferences({ tier: newTier });
  };

  const tierRank = (t: 'basic' | 'active' | 'pro'): number => {
    if (t === 'basic') return 1;
    if (t === 'active') return 2;
    return 3;
  };

  const isUnlocked = (itemTier: 'basic' | 'active' | 'pro') => {
    return tierRank(currentTier) >= tierRank(itemTier);
  };

  const navigationSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, minTier: 'basic' }
      ]
    },
    {
      title: 'TRADING',
      items: [
        { name: 'Terminal', path: '/app/paper-trading', icon: Terminal, badge: 'GUIDED', minTier: 'basic' },
        { name: 'Markets', path: '/app/markets', icon: Compass, minTier: 'basic' },
        { name: 'Watchlists', path: '/app/watchlists', icon: Eye, minTier: 'basic' },
        { name: 'Orders', path: '/app/orders', icon: ShoppingBag, minTier: 'basic' },
        { name: 'Positions', path: '/app/portfolio', icon: Briefcase, minTier: 'basic' }
      ]
    },
    {
      title: 'RESEARCH',
      items: [
        { name: 'Fundamental Analysis', path: '/app/research/fundamental', icon: FileText, minTier: 'basic' },
        { name: 'News & Sentiment', path: '/app/research/sentiment', icon: Newspaper, minTier: 'basic' },
        { name: 'Stock Screener', path: '/app/screener', icon: Filter, minTier: 'active' },
        { name: 'Technical Analysis', path: '/app/research/technical', icon: LineChart, minTier: 'active' },
        { name: 'Historical Analogues', path: '/app/research/analogues', icon: History, minTier: 'active' }
      ]
    },
    {
      title: 'STRATEGY LAB',
      items: [
        { name: 'Strategy Builder', path: '/app/strategy-lab/builder', icon: FlaskConical, minTier: 'active' },
        { name: 'Parameter Optimisation', path: '/app/strategy-lab/optimization', icon: Sliders, minTier: 'active' },
        { name: 'Vectorized Backtesting', path: '/app/quant/backtesting', icon: PlayCircle, minTier: 'pro' },
        { name: 'Paper Experiments', path: '/app/strategy-lab/experiments', icon: FlaskRound, minTier: 'pro' }
      ]
    },
    {
      title: 'QUANT INTELLIGENCE',
      items: [
        { name: 'Agent Command Center', path: '/app/quant/multi-agent', icon: Cpu, badge: '7 AGENTS', minTier: 'pro' },
        { name: 'AI Predictions', path: '/app/quant/predictions', icon: Sparkles, minTier: 'pro' },
        { name: 'Saved Research', path: '/app/quant/saved', icon: BookmarkCheck, minTier: 'pro' },
        { name: 'Quant Reports', path: '/app/quant/reports', icon: FileSpreadsheet, badge: 'PDF', minTier: 'pro' }
      ]
    },
    {
      title: 'WEALTH & ASSET',
      items: [
        { name: 'Portfolio Allocation', path: '/app/wealth/portfolio', icon: PieChart, minTier: 'basic' },
        { name: 'Mutual Funds', path: '/app/wealth/mutual-funds', icon: Briefcase, minTier: 'active' },
        { name: 'Step-Up SIP Planner', path: '/app/wealth/sip-planner', icon: Calculator, minTier: 'active' },
        { name: 'Portfolio Optimizer', path: '/app/wealth/optimizer', icon: TrendingUp, badge: 'MPT', minTier: 'pro' },
        { name: 'Efficient Frontier', path: '/app/wealth/frontier', icon: Activity, minTier: 'pro' },
        { name: 'Monte Carlo Scenarios', path: '/app/wealth/scenarios', icon: Target, minTier: 'pro' }
      ]
    },
    {
      title: 'RISK & OPTIONS',
      items: [
        { name: 'Risk Centre', path: '/app/risk', icon: ShieldAlert, minTier: 'basic' },
        { name: 'Trade Journal', path: '/app/risk/journal', icon: BookMarked, minTier: 'active' },
        { name: 'Simulated DOM', path: '/app/risk/depth', icon: AlignVerticalSpaceAround, badge: 'L2', minTier: 'pro' },
        { name: 'Options Chain', path: '/app/risk/options', icon: Layers, minTier: 'pro' },
        { name: 'Black-Scholes Greeks', path: '/app/risk/greeks', icon: Percent, minTier: 'pro' },
        { name: 'Payoff Analysis', path: '/app/risk/payoff', icon: BarChart3, minTier: 'pro' }
      ]
    },
    {
      title: 'LEARNING & ACADEMY',
      items: [
        { name: 'Trader Academy', path: '/app/learning', icon: GraduationCap, minTier: 'basic' },
        { name: 'Guided Curriculum', path: '/app/learning/guide', icon: BookOpen, minTier: 'basic' },
        { name: 'Interactive Quizzes', path: '/app/learning/quizzes', icon: HelpCircle, minTier: 'basic' },
        { name: 'Practical Exercises', path: '/app/learning/strategies', icon: CheckSquare, minTier: 'basic' }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/app/dashboard' && (pathname === '/app' || pathname === '/app/dashboard')) return true;
    if (path === '/app/paper-trading' && (pathname === '/terminal' || pathname === '/app/paper-trading')) return true;
    if (path !== '/app/dashboard' && path !== '/app/paper-trading') {
      return pathname === path || (pathname.startsWith(path) && path !== '/app/research' && path !== '/app/risk' && path !== '/app/learning' && path !== '/app/quant');
    }
    return false;
  };

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (!isUnlocked(item.minTier)) {
      e.preventDefault();
      setLockedModalItem(item);
    }
  };

  const handleUpgradeAndNavigate = (requiredTier: 'basic' | 'active' | 'pro', targetPath: string) => {
    apiClient.updateUserPreferences({ tier: requiredTier });
    setCurrentTier(requiredTier);
    setLockedModalItem(null);
    router.push(targetPath);
  };

  return (
    <aside
      className={`bg-[#000000] border-r border-[#141414] h-full min-h-0 flex flex-col transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* Brand Header */}
        <div className="h-12 px-3 flex items-center justify-between border-b border-[#141414] shrink-0 bg-[#000000]">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded bg-[#2979FF] flex items-center justify-center font-black text-white text-xs shadow-xs">
                Ω
              </div>
              <div className="flex items-center gap-1 font-sans">
                <span className="font-bold text-xs tracking-tight text-[#f0f3f6]">
                  TradeSphere<span className="text-[#2979FF]">OS</span>
                </span>
                <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold border ${
                  currentTier === 'basic' ? 'bg-[#35C69A]/15 text-[#35C69A] border-[#35C69A]/30' :
                  currentTier === 'active' ? 'bg-[#2979FF]/15 text-[#2979FF] border-[#2979FF]/30' :
                  'bg-[#D8AB5E]/15 text-[#D8AB5E] border-[#D8AB5E]/30'
                }`}>
                  {currentTier.toUpperCase()}
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-6 h-6 rounded bg-[#2979FF] flex items-center justify-center font-black text-white text-xs shadow-xs">
                Ω
              </div>
            </Link>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#808a9d] hover:text-[#f0f3f6] hover:bg-[#121212] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Interactive Complexity Tier Selector Bar */}
        <div className="p-2 border-b border-[#141414] bg-[#050505] shrink-0">
          {!collapsed ? (
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between text-[10px] text-[#808a9d] font-mono">
                <span className="font-bold uppercase tracking-wider">Active Tier</span>
                <button
                  onClick={() => setFilterUnlockedOnly(!filterUnlockedOnly)}
                  className={`text-[9px] hover:underline transition-colors ${
                    filterUnlockedOnly ? 'text-[#35C69A] font-bold' : 'text-[#808a9d]'
                  }`}
                  title="Toggle filtering out higher tier tools"
                >
                  {filterUnlockedOnly ? 'Filter: ON' : 'Filter: OFF'}
                </button>
              </div>

              {/* 3 Tier Pills */}
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono font-bold">
                <button
                  onClick={() => handleTierSwitch('basic')}
                  className={`py-1 rounded transition-all text-center border ${
                    currentTier === 'basic'
                      ? 'bg-[#35C69A]/20 text-[#35C69A] border-[#35C69A]/50 shadow-xs'
                      : 'bg-[#0D131A] text-[#808a9d] border-[#1a1a1a] hover:text-white'
                  }`}
                  title="Tier 1: Basic (Guided)"
                >
                  Basic
                </button>
                <button
                  onClick={() => handleTierSwitch('active')}
                  className={`py-1 rounded transition-all text-center border ${
                    currentTier === 'active'
                      ? 'bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/50 shadow-xs'
                      : 'bg-[#0D131A] text-[#808a9d] border-[#1a1a1a] hover:text-white'
                  }`}
                  title="Tier 2: Active Trader"
                >
                  Active
                </button>
                <button
                  onClick={() => handleTierSwitch('pro')}
                  className={`py-1 rounded transition-all text-center border ${
                    currentTier === 'pro'
                      ? 'bg-[#D8AB5E]/20 text-[#D8AB5E] border-[#D8AB5E]/50 shadow-xs'
                      : 'bg-[#0D131A] text-[#808a9d] border-[#1a1a1a] hover:text-white'
                  }`}
                  title="Tier 3: Pro Quant (All Unlocked)"
                >
                  Pro
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                const next = currentTier === 'basic' ? 'active' : currentTier === 'active' ? 'pro' : 'basic';
                handleTierSwitch(next);
              }}
              className="w-full flex items-center justify-center py-1 text-[10px] font-mono font-black rounded bg-[#0D131A] text-[#2979FF] border border-[#1a1a1a]"
              title={`Active Tier: ${currentTier.toUpperCase()}. Click to cycle.`}
            >
              {currentTier.charAt(0).toUpperCase()}
            </button>
          )}
        </div>

        {/* Scrollable Navigation Tree */}
        <div
          tabIndex={0}
          className="flex-1 min-h-0 overflow-y-auto sidebar-scroll custom-scrollbar py-2 space-y-4 pr-1 focus:outline-none"
        >
          {navigationSections.map((section) => {
            // Filter section items if filterUnlockedOnly is enabled
            const visibleItems = filterUnlockedOnly
              ? section.items.filter(item => isUnlocked(item.minTier))
              : section.items;

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="px-2">
                {!collapsed && (
                  <div className="px-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#808a9d] uppercase">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const unlocked = isUnlocked(item.minTier);

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={(e) => handleItemClick(e, item)}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-xs transition-colors group relative ${
                          active
                            ? 'bg-[#121212] text-white font-medium border-l-2 border-[#2979FF]'
                            : unlocked
                            ? 'text-[#808a9d] hover:bg-[#0c0c0c] hover:text-[#f0f3f6]'
                            : 'text-[#808a9d]/50 hover:bg-[#0c0c0c]/50 hover:text-[#808a9d] cursor-pointer'
                        }`}
                        title={collapsed ? `${item.name}${unlocked ? '' : ` (Requires ${item.minTier.toUpperCase()})`}` : undefined}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active
                              ? 'text-[#2979FF]'
                              : unlocked
                              ? 'text-[#808a9d] group-hover:text-[#f0f3f6]'
                              : 'text-[#808a9d]/40'
                          }`}
                        />
                        {!collapsed && (
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span className="truncate">{item.name}</span>
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {!unlocked ? (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-mono px-1 py-0.2 rounded bg-[#EF6468]/15 text-[#EF6468] border border-[#EF6468]/30">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{item.minTier.toUpperCase()}</span>
                                </span>
                              ) : item.badge ? (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#141414] text-[#808a9d] border border-[#1a1a1a]">
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom User Profile Ribbon */}
        <div className="p-2 border-t border-[#141414] bg-[#000000] shrink-0">
          {!collapsed ? (
            <Link
              href="/app/settings"
              className="flex items-center justify-between px-2 py-1.5 rounded bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-[11px] transition-colors group"
            >
              <div className="truncate">
                <div className="font-semibold text-white truncate group-hover:text-[#2979FF] transition-colors">
                  Multi-Tenant Account
                </div>
                <div className="text-[10px] font-mono text-[#00c805] font-semibold">
                  ₹10,00,000.00 SIM
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#141414] text-[#808a9d] border border-[#1a1a1a] group-hover:border-[#2979FF]/40">
                ⚙ SETTINGS
              </span>
            </Link>
          ) : (
            <Link
              href="/app/settings"
              className="flex justify-center py-1 text-[#00c805] text-[10px] font-mono font-bold hover:text-white"
              title="Capital: ₹10,00,000. Click for Settings."
            >
              ₹10L
            </Link>
          )}
        </div>
      </div>

      {/* Interactive Feature Locked Modal Prompt */}
      {lockedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090D12] border border-[#25313D] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-[#E7EDF3] relative">
            <button
              onClick={() => setLockedModalItem(null)}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-[#8B99A8] hover:text-white hover:bg-[#111922] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-[#D8AB5E]">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white font-sans">
                Feature Locked for {currentTier.toUpperCase()}
              </h3>
            </div>

            <p className="text-xs text-[#8B99A8] leading-relaxed">
              <strong>{lockedModalItem.name}</strong> is designed for <strong>Tier {tierRank(lockedModalItem.minTier)} — {lockedModalItem.minTier === 'active' ? 'Active Trader' : 'Pro Quant'}</strong>.
              Would you like to switch tiers now to unlock this feature immediately?
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleUpgradeAndNavigate(lockedModalItem.minTier, lockedModalItem.path)}
                className="w-full py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Switch to {lockedModalItem.minTier.toUpperCase()} &amp; Open Feature</span>
              </button>

              <button
                onClick={() => setLockedModalItem(null)}
                className="w-full py-2 rounded-xl bg-[#0D131A] hover:bg-[#111922] border border-[#25313D] text-[#8B99A8] hover:text-white font-semibold text-xs transition-colors"
              >
                Keep Current {currentTier.toUpperCase()} Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
