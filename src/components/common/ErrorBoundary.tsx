import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Something went wrong</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                An unexpected system error occurred in the Cancer Aware Bharat application. Our diagnostic system has logged this incident.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-red-300 font-mono text-left overflow-x-auto max-h-28">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-white font-bold text-xs hover:bg-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500">
              Cancer Aware Bharat • Clinical Platform Support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
