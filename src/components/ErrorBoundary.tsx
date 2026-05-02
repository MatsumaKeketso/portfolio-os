import React, { Component, ReactNode } from 'react';
import * as Icons from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex items-center justify-center bg-os-ink-950 p-6">
          <div className="max-w-md w-full">
            <div className="bg-os-ink-950 rounded border border-white/[0.08] shadow-os-window p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/[0.15] border border-red-500/30 rounded-full flex items-center justify-center">
                  <Icons.AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Something went wrong
              </h2>

              {/* Description */}
              <p className="text-white/60 text-sm text-center mb-4">
                An unexpected error occurred. Don't worry, your data is safe.
              </p>

              <div className="h-px bg-white/[0.07] mb-4" />

              {/* Error details */}
              {this.state.error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Icons.Code className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-red-300 font-mono break-all">
                        {this.state.error.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-os-ink-800 hover:bg-os-ink-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Icons.RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <Icons.RotateCcw className="w-4 h-4" />
                  Reload
                </button>
              </div>

              {/* Help text */}
              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Icons.Info className="w-4 h-4" />
                  <p>If this persists, try clearing your browser cache</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
