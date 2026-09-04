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

        const success = onUnlock(cleanPass, rememberMe);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/95 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md card-emboss rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 border border-slate-800/90 z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/10">
            {mode === 'totp' ? <Smartphone className="w-8 h-8 text-blue-400" /> : <Lock className="w-8 h-8 text-emerald-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              Debet<span className="text-blue-400">.auto</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'totp'
                ? 'Еженедельное подтверждение входа через Google Authenticator'
                : 'Шифрованный доступ AES-256. Введите пароль для входа.'}
            </p>
          </div>
        </div>

        {/* 7-day indicator badge */}
        <div className="flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-xs mx-auto w-fit font-mono">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Сессия действует 7 дней (раз в неделю)</span>
        </div>

        {/* Mode switch if TOTP is enabled */}
        {isTotpEnabled && (
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800/80">
            <button
              type="button"
              onClick={() => { setMode('totp'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                mode === 'totp'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google 2FA</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('password'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                mode === 'password'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Мастер-пароль</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'totp' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                6-значный код из Google Authenticator
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
                className="w-full text-center tracking-[0.5em] text-2xl sm:text-3xl py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 font-mono font-bold focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                  className="w-full pl-4 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2.5 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-md border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-400 hover:text-slate-200 transition-colors">Запомнить устройство на 7 дней</span>
            </label>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs text-center font-semibold flex items-center justify-center space-x-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-3"
          >
            <span>{loading ? 'Проверка ключа...' : 'Войти в систему'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/70 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Двухфакторная защита 2FA + AES-256 локальное шифрование</span>
          </p>
        </div>

      </div>
    </div>
  );
}

