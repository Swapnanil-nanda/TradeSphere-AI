'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from '../../components/app/AppSidebar';
import AppHeader from '../../components/app/AppHeader';
import TopMarketTicker from '../../components/app/TopMarketTicker';
import { X } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090D12] text-[#E7EDF3] font-sans select-none">
      {/* Top Persistent Streaming Market Ticker */}
      <TopMarketTicker />

      {/* Main Workstation Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Collapsible Sidebar */}
        <div className="hidden md:flex flex-col h-full shrink-0">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        </div>

        {/* Mobile Drawer Backdrop & Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-[#090D12]/80 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-60 h-full flex flex-col bg-[#0D131A] border-r border-[#25313D] shadow-2xl">
              <div className="absolute top-2.5 right-2.5 z-20">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <AppSidebar
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Center Main Stage */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <AppHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-[#090D12] p-2.5 sm:p-3 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
