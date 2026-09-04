import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import Logo from './Logo';

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
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] md:bottom-5 left-3 right-3 md:left-auto md:right-5 z-40 md:max-w-md animate-slide-up pointer-events-auto"
    >
      <div className="p-3 bg-[#0d1322]/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-2.5">
        
        {/* App Icon */}
        <Logo size="sm" animated={true} />

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
          className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1 shrink-0 shadow-xs transition-colors active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Установить</span>
        </button>

        {/* Dismiss Button */}
        <button
          onClick={dismissBanner}
          title="Скрыть"
          aria-label="Скрыть баннер установки"
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 flex items-center justify-center transition-colors shrink-0 active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </aside>
  );
}
