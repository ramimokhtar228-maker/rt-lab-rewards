import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center font-sans" dir="rtl">
          <div className="max-w-md w-full bg-slate-800/90 border border-rose-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center font-bold text-2xl mb-4 border border-rose-500/30">
              RT
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">معامل د. رامي مختار للتحاليل الطبية</h2>
            <p className="text-sm text-slate-300 mb-6">
              نعتذر، حدث خطأ أثناء تحميل المنصة. يرجى الضغط أدناه لتحديث الصفحة والبدء من جديد.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 px-6 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-sm shadow-lg transition"
            >
              إعادة تحميل المنصة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
