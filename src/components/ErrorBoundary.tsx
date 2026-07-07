import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  page?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary] Caught in "${this.props.page ?? "App"}":`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-red-200/60 dark:border-red-900/40 rounded-3xl shadow-xl p-8 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              {this.props.page && (
                <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-widest">
                  {this.props.page}
                </p>
              )}
            </div>
            {this.state.error && (
              <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-4 py-3 text-left font-mono leading-relaxed break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-blue to-indigo-600 dark:from-primary-green dark:to-teal-500 text-white text-xs font-bold rounded-xl shadow hover:opacity-90 active:scale-95 transition-all duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-600">
              If this keeps happening, try refreshing the page.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
