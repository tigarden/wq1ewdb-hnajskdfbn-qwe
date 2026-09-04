import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import InstallAppModal from '../InstallAppModal';

export default function AppSettings() {
  const { 
    isStandalone, 
    canInstall, 
    promptInstall, 
    isIOS, 
    isAndroid, 
    isSafari, 
    isChrome,
    isDismissed,
    resetDismiss 
  } = usePWA();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleResetBanner = () => {
    resetDismiss();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Мобильное приложение (PWA)</h3>
            <p className="text-xs text-slate-400">
              Установка Debet.auto на главный экран смартфонов iPhone и Android
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-sm bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs inline-flex items-center space-x-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Инструкция</span>
        </button>
      </div>

      {/* Current Status Card */}
      <div className="p-5 rounded-2xl bg-[#0e1320] border border-white/10 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          Текущий статус установки
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mode */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Режим отображения</span>
              <span className="text-xs font-bold text-white">
                {isStandalone ? 'Полноэкранное приложение (PWA)' : 'Вкладка браузера'}
              </span>
            </div>
            {isStandalone ? (
              <span className="h-6 px-2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>На экране</span>
              </span>
            ) : (
              <span className="h-6 px-2 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Браузер</span>
              </span>
            )}
          </div>

          {/* Platform */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Определенная платформа</span>
              <span className="text-xs font-bold text-white">
                {isIOS
                  ? isSafari
                    ? 'Apple Safari (iOS)'
                    : 'Apple iOS'
                  : isAndroid
                  ? 'Google Android'
                  : 'Десктоп / Другое'}
              </span>
            </div>
            <span className="h-6 px-2 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 inline-flex items-center">
              {isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-2.5">
          {canInstall && !isStandalone ? (
            <button
              onClick={promptInstall}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-2 shadow-md shadow-blue-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Установить приложение в 1 клик</span>
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center space-x-2 shadow-xs transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>Как добавить на экран смартфона</span>
            </button>
          )}

          {isDismissed && (
            <button
              onClick={handleResetBanner}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetDone ? 'Баннер включен!' : 'Вернуть плавающий баннер'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Benefits / Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h5 className="text-xs font-bold text-white">Запуск в 1 касание</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Иконка Debet.auto на рабочем столе телефона рядом с другими вашими приложениями.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <h5 className="text-xs font-bold text-white">Полноэкранный режим</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Без рамок, вкладок и адресной строки браузера — максимальное полезное пространство.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h5 className="text-xs font-bold text-white">Безопасность и оффлайн</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Данные сохраняются в защищенном локальном хранилище и синхронизируются с облаком.
          </p>
        </div>
      </div>

      {/* Modal */}
      <InstallAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
