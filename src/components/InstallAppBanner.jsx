import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function InstallAppBanner({ onOpenModal }) {
  const { isStandalone, isDismissed, dismissBanner, canInstall, promptInstall, isIOS } = usePWA();

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (canInstall) {
      const installed = await promptInstall();
      if (!installed) {
        onOpenModal();
      }
    } else {
      onOpenModal();
    }
  };

  return (
    <aside
      aria-label="Установка приложения"
      className="fixed bottom-14 md:bottom-5 left-2 right-2 md:left-auto md:right-5 z-40 md:max-w-md animate-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="p-3 bg-[#0d1322]/95 backdrop-blur-md border border-blue-500/30 rounded-xl shadow-2xl shadow-black/60 flex items-center justify-between gap-2.5">
        
        {/* App Icon */}
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-black text-xs shrink-0 shadow-xs">
          D
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1">
            <span>Debet.auto на рабочий стол</span>
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {isIOS ? 'Быстрый запуск из Safari без рамок' : 'Установка PWA на главный экран'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleInstallClick}
          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1 shrink-0 shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Установить</span>
        </button>

        {/* Dismiss Button */}
        <button
          onClick={dismissBanner}
          title="Скрыть"
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </aside>
  );
}
