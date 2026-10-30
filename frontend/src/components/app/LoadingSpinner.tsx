import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-xs">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="font-medium tracking-wide">{message}</span>
    </div>
  );
}
