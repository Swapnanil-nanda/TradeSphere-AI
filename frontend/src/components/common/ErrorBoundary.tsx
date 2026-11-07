'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary caught crash]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[280px] p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-semibold text-rose-200 mb-1">
            {this.props.fallbackTitle || 'Component Rendering Error'}
          </h3>

          <p className="text-xs text-rose-300/80 max-w-md mb-4">
            {this.state.error?.message || 'An unexpected rendering error occurred in this view.'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium border border-rose-500/30 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>

            <button
              onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              className="px-3 py-1.5 rounded-lg bg-surface-1 hover:bg-surface-2 text-text-secondary text-xs font-medium border border-border flex items-center gap-1 transition-colors"
            >
              {this.state.showDetails ? 'Hide Stack' : 'Diagnostics'}
              {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {this.state.showDetails && (
            <div className="mt-4 p-3 rounded-lg bg-black/60 border border-border text-left w-full max-w-xl overflow-x-auto text-[11px] font-mono text-text-muted">
              <div className="text-rose-400 font-semibold mb-1">Error: {this.state.error?.toString()}</div>
              <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
