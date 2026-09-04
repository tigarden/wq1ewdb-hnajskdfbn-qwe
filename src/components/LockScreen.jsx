import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, KeyRound, Smartphone, Calendar, ShieldAlert } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function LockScreen({ onUnlock }) {
  const { isTotpEnabled, verifyTotp } = useData();
  const [mode, setMode] = useState(isTotpEnabled ? 'totp' : 'password');
  const [totpCode, setTotpCode] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'totp') {
        const cleanCode = totpCode.trim();
        if (!cleanCode || cleanCode.length !== 6) {
          setError('Введите 6-значный код из приложения Google Authenticator');
          setLoading(false);
          return;
        }

        const valid = await verifyTotp(cleanCode, rememberMe);
        if (!valid) {
          setError('Неверный или устаревший код Google Authenticator. Дождитесь обновления кода в приложении.');
        }
      } else {
        const cleanPass = password.trim();
        if (!cleanPass) {
          setError('Введите пароль доступа');
          setLoading(false);
          return;
        }

        const success = await onUnlock(cleanPass, rememberMe);
        if (!success) {
          setError('Неверный пароль доступа');
        }
      }
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/95 backdrop-blur-md animate-in fade-in duration-200 pt-[max(env(safe-area-inset-top,0px),54px)] pb-[max(env(safe-area-inset-bottom,0px),24px)]">
      <div className="relative w-full max-w-sm surface-card rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 border border-white/10 z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2.5">
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-blue-400 mx-auto flex items-center justify-center shadow-inner">
            {mode === 'totp' ? <Smartphone className="w-5 h-5 text-blue-400" /> : <Lock className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              Debet<span className="text-blue-400">.auto</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'totp'
                ? 'Еженедельный код Google Authenticator'
                : 'Шифрованный доступ AES-256'}
            </p>
          </div>
        </div>

        {/* 7-day indicator badge */}
        <div className="flex items-center justify-center space-x-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs mx-auto w-fit font-mono">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Сессия действует 7 дней</span>
        </div>

        {/* Mode switch if TOTP is enabled */}
        {isTotpEnabled && (
          <div className="flex h-10 rounded-xl bg-slate-900 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('totp'); setError(null); }}
              className={`flex-1 h-8 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
                mode === 'totp'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google 2FA</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('password'); setError(null); }}
              className={`flex-1 h-8 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
                mode === 'password'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Мастер-пароль</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'totp' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                6-значный код из Authenticator
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                autoFocus
                className="w-full h-12 text-center tracking-[0.4em] text-xl bg-slate-900 border border-white/15 rounded-xl text-slate-100 font-mono font-bold focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Пароль доступа (PIN)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                  className="w-full h-12 bg-slate-900 border border-white/15 rounded-xl px-3.5 pr-10 text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-slate-400 hover:text-slate-200 transition-colors text-xs">Запомнить устройство (7 дней)</span>
            </label>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs text-center font-medium flex items-center justify-center space-x-1.5 animate-in fade-in">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            <span>{loading ? 'Проверка ключа...' : 'Войти в систему'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center space-x-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>2FA защита + AES-256 шифрование</span>
          </p>
        </div>

      </div>
    </div>
  );
}

