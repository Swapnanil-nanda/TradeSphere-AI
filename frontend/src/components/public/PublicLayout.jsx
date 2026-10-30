import React from 'react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
