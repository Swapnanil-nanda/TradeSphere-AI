import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  const displayMessage = message || description || 'No items available at this time.';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#050505] border border-[#141414] rounded-xl select-none">
      <div className="w-12 h-12 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/20 text-[#2979FF] flex items-center justify-center mb-3 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1 font-sans">{title}</h3>
      <p className="text-xs text-[#808a9d] max-w-sm mb-4 leading-relaxed font-sans">{displayMessage}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
