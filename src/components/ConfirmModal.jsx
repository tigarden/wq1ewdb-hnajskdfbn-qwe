import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение действия',
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  variant = 'danger', // 'danger' | 'warning'
  loading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => !loading && onClose()} 
        aria-hidden="true" 
      />
      <div className="relative w-full max-w-md surface-card rounded-2xl border border-white/10 shadow-2xl p-5 sm:p-6 z-10 animate-modal-pop space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger 
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' 
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
            }`}>
              {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                {title}
              </h3>
              {message && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {message}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-md disabled:opacity-50 active:scale-95 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25 border border-rose-500/30'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25 border border-amber-500/30 text-slate-950'
            }`}
          >
            {loading ? 'Выполняется...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
