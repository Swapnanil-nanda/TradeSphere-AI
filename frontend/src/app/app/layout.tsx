'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from '../../components/app/AppSidebar';
import AppHeader from '../../components/app/AppHeader';
import TopMarketTicker from '../../components/app/TopMarketTicker';
import SlideNavigationPanel from '../../components/app/SlideNavigationPanel';
import OnboardingModal from '../../components/app/OnboardingModal';
import DemoBanner from '../../components/app/DemoBanner';
import AuthRequiredModal from '../../components/app/AuthRequiredModal';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [slideNavOpen, setSlideNavOpen] = useState(false);

  // Read collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tradesphere_sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('tradesphere_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#000000] text-[#F0F3F6] font-sans select-none">
      {/* Top Persistent Streaming Market Ticker */}
      <TopMarketTicker />

      {/* Guest Demo Notice Banner */}
      <DemoBanner />

      {/* Auth Barrier Interceptor Modal */}
      <AuthRequiredModal />

      {/* Trader Onboarding & Tier Allocation Survey (Opens on first login/entry) */}
      <OnboardingModal />

      {/* Main Workstation Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Collapsible Sidebar */}
        <div className="hidden md:flex flex-col h-full shrink-0 min-h-0">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onOpenSlideNav={() => setSlideNavOpen(true)}
          />
        </div>

        {/* Global Slide-In Left-Hand Panel (Choose Every Site) */}
        <SlideNavigationPanel
          isOpen={slideNavOpen}
          onClose={() => setSlideNavOpen(false)}
        />

        {/* Center Main Stage */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <AppHeader
            onToggleMobileMenu={() => setSlideNavOpen(true)}
            onOpenSlideNav={() => setSlideNavOpen(true)}
          />
          <main className="flex-1 overflow-y-auto bg-[#000000] p-2.5 sm:p-3 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
