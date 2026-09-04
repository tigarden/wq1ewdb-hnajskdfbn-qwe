import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 pt-[env(safe-area-inset-top,0px)]">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className={`relative w-full ${maxWidth} surface-card rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl overflow-hidden z-10 max-h-[88dvh] flex flex-col pb-[max(env(safe-area-inset-bottom,0px),12px)] sm:pb-0 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200`}>
        
        {/* iOS Pull/Grab indicator bar on mobile */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#090d16] shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-white/25" />
        </div>

        <div className="flex items-center justify-between h-14 px-4 sm:px-5 border-b border-white/10 bg-[#090d16] shrink-0">
          <h3 className="text-sm sm:text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Закрыть окно"
            className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-white active:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-slate-200 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

