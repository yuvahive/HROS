import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-hd-bg flex items-center justify-center p-6">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-70" />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-hd-muted text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full premium-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('hivedesk_gas_url');
                  localStorage.removeItem('hivedesk_user');
                  window.location.reload();
                }}
                className="w-full border border-hd-border text-hd-muted font-medium py-3 rounded-xl hover:bg-hd-hover transition-colors"
              >
                Reset & Reconfigure
              </button>
            </div>
            <details className="mt-6 text-left">
              <summary className="text-xs text-hd-muted cursor-pointer hover:text-hd-muted">Error details</summary>
              <pre className="mt-2 text-[11px] text-hd-muted bg-hd-raised p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                {this.state.error?.stack || this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

