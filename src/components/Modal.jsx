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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className={`relative w-full ${maxWidth} surface-card rounded-xl border border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between h-12 px-4 border-b border-white/10 bg-[#090d16] shrink-0">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

