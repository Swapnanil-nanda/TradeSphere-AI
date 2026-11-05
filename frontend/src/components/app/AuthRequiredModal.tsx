'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Lock, X, CheckCircle2, UserCheck } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import GoogleSignInButton from '../auth/GoogleSignInButton';

export default function AuthRequiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState('TradeSphere Workstation Feature');
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleAuthRequired = (e: any) => {
      if (e.detail?.action) {
        setActionTitle(e.detail.action);
      }
      setIsOpen(true);
    };

    window.addEventListener('tradesphere_auth_required', handleAuthRequired);
    return () => window.removeEventListener('tradesphere_auth_required', handleAuthRequired);
  }, []);

  if (!isOpen) return null;

  const handleGoogleQuickSignIn = async () => {
    try {
      setGoogleLoading(true);
      const res = await apiClient.googleLogin({
        email: 'trader.' + Math.random().toString(36).substring(2, 7) + '@gmail.com',
        fullName: 'Google Trader'
      });
      if (res) {
        setIsOpen(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-[#090D12] border border-[#25313D] w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-5 text-[#F0F3F6]">
        
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8B99A8] hover:text-white hover:bg-[#151F29] transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF]/15 border border-[#2979FF]/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#2979FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">Authentication Required</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SECURITY
              </span>
            </div>
            <p className="text-xs text-[#8B99A8] mt-1 leading-relaxed">
              Sign in or create a free account to execute:
            </p>
            <div className="inline-block mt-1 font-bold text-xs text-[#2979FF] bg-[#2979FF]/10 px-2 py-0.5 rounded border border-[#2979FF]/20 font-mono">
              {actionTitle}
            </div>
          </div>
        </div>

        {/* Value Props */}
        <div className="bg-[#0D131A] border border-[#25313D] rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#8B99A8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#35C69A] shrink-0" />
            <span>Dedicated multi-tenant ₹10,00,000 paper trading capital</span>
          </div>
          <div className="flex items-center gap-2 text-[#8B99A8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#35C69A] shrink-0" />
            <span>Pre-Trade Risk Gatekeeper with 1% loss cap &amp; drawdown lock</span>
          </div>
          <div className="flex items-center gap-2 text-[#8B99A8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#35C69A] shrink-0" />
            <span>Isolated custom watchlists, trade journals &amp; saved screens</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Google Sign In */}
          <div className="w-full">
            <GoogleSignInButton
              text="continue_with"
              onSuccess={() => {
                setIsOpen(false);
                window.location.reload();
              }}
            />
          </div>

          {/* Email Login */}
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/login');
            }}
            className="w-full py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In with Email</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss / Guest Demo Mode */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 rounded-xl bg-transparent hover:bg-[#151F29] text-[#8B99A8] hover:text-white font-semibold text-xs transition-colors"
          >
            Continue in Guest Demo Mode (Read-Only)
          </button>
        </div>

      </div>
    </div>
  );
}
