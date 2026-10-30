import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#090d16] border border-[#1b253b] rounded-2xl select-none">
      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
