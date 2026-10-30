'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from '../../components/app/AppSidebar';
import AppHeader from '../../components/app/AppHeader';
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
      // ignore SSR or storage exceptions
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#060911] text-slate-100 font-sans">
      {/* Desktop Sidebar */}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full flex flex-col bg-[#090d16] shadow-2xl">
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AppSidebar
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[#070b14] p-3 sm:p-4 md:p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
