import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSession = () => {
    if (window.confirm('Очистить временные данные сессии и перезагрузить приложение? Ваши сохраненные данные останутся нетронутыми.')) {
      sessionStorage.clear();
      localStorage.removeItem('debet_sec_session_v2');
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080b12] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full surface-card rounded-2xl p-6 border border-rose-500/20 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Произошла непредвиденная ошибка</h2>
              <p className="text-xs text-slate-400">
                Интерфейс столкнулся с исключением при отображении. Вы можете обновить страницу или сбросить сессию.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-slate-950 border border-white/10 text-left">
                <p className="text-xs font-mono text-rose-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full btn-md btn-primary font-bold flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Обновить страницу</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetSession}
                className="w-full btn-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Сбросить сессию</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
