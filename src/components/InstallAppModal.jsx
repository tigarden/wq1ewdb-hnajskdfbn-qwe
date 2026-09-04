import React, { useState } from 'react';
import { 
  X, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight,
  Monitor
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import Logo from './Logo';

export default function InstallAppModal({ isOpen, onClose }) {
  const { isIOS, isAndroid, isSafari, canInstall, promptInstall, isStandalone } = usePWA();
  
  // Default tab based on current device
  const defaultTab = isIOS || isSafari ? 'safari' : 'chrome';
  const [activePlatform, setActivePlatform] = useState(defaultTab);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
        setInstallSuccess(false);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#0e1320] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto text-slate-100 animate-modal-pop">
        
        {/* Header Banner */}
        <div className="relative px-5 py-4 border-b border-white/10 bg-gradient-to-r from-blue-950/40 via-[#0e1320] to-indigo-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="md" animated={true} />
              <div>
                <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5 font-mono">
                  Debet<span className="text-blue-400">.auto</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    PWA
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Установка приложения на рабочий стол
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          
          {isStandalone ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-200">Приложение уже установлено!</p>
                <p className="text-emerald-400/80 mt-0.5">Вы используете Debet.auto в автономном полноэкранном режиме.</p>
              </div>
            </div>
          ) : null}

          {/* Quick Chrome 1-Click Install Button if supported & triggered */}
          {canInstall && !isStandalone && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-white">Доступна быстрая установка</p>
                  <p className="text-slate-400 text-[11px]">Браузер готов добавить Debet.auto в 1 клик</p>
                </div>
              </div>
              <button
                onClick={handleNativeInstall}
                disabled={installSuccess}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all shrink-0"
              >
                {installSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Установлено</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Установить</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Desktop & Home Screen Icon Preview Showcase */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900/90 to-[#070b14] border border-blue-500/20 flex items-center space-x-3.5 shadow-inner">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-60 blur-md animate-pulse-glow" />
              <img
                src="apple-touch-icon.png"
                alt="Debet.auto Desktop Icon"
                className="relative w-14 h-14 rounded-2xl shadow-2xl border border-white/20 object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-xs sm:text-sm">Иконка приложения</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  HD 512px
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Ярлык премиум-качества для рабочего стола Windows, macOS, iPhone и Android.
              </p>
            </div>
          </div>

          {/* Platform Tab Switcher */}
          <div>
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/5">
              <button
                type="button"
                onClick={() => setActivePlatform('safari')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activePlatform === 'safari'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🍏 Safari (iPhone / iOS)</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('chrome')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activePlatform === 'chrome'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🤖 Chrome (Android / ПК)</span>
              </button>
            </div>
          </div>

          {/* Tab Content: Safari iOS */}
          {activePlatform === 'safari' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-slate-300 font-medium mb-1">
                Инструкция для Safari на iOS:
              </div>

              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <span>Нажмите кнопку «Поделиться»</span>
                    <span className="p-1 rounded bg-slate-800 text-blue-400 border border-slate-700 inline-flex items-center">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                    На нижней панели браузера Safari на iPhone (или вверху справа на iPad).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <span>Выберите пункт «На экран „Домой“»</span>
                    <span className="p-1 rounded bg-slate-800 text-slate-200 border border-slate-700 inline-flex items-center">
                      <PlusSquare className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Прокрутите меню действий чуть ниже до пункта со значком квадрата и плюса.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="flex-1 text-xs">
                  <div className="text-white font-semibold">
                    Нажмите «Добавить»
                  </div>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                    В правом верхнем углу экрана. На рабочем столе появится иконка Debet.auto!
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>При запуске с экрана приложение будет открываться во весь экран без адресной строки Safari.</span>
              </div>
            </div>
          )}

          {/* Tab Content: Google Chrome */}
          {activePlatform === 'chrome' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-slate-300 font-medium mb-1">
                Инструкция для Chrome на Android или ПК:
              </div>

              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <span>Откройте меню браузера Chrome</span>
                    <span className="p-1 rounded bg-slate-800 text-slate-300 border border-slate-700 inline-flex items-center">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Три точки в правом верхнем углу экрана.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <span>Нажмите «Добавить на главный экран»</span>
                  </div>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                    В меню может называться «Установить приложение» или «Добавить на гл. экран».
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="flex-1 text-xs">
                  <div className="text-white font-semibold">
                    Подтвердите установку
                  </div>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Иконка появится в списке приложений и на рабочем столе смартфона.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PWA работает автономно, мгновенно открывается и сохраняет все локальные данные.</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 bg-[#0a0e17] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Версия PWA 1.0 • HTTPS / Standalone
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Понятно
          </button>
        </div>

      </div>
    </div>
  );
}
