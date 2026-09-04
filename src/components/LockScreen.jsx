import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, KeyRound, Smartphone, Calendar } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/10">
            {mode === 'totp' ? <Smartphone className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Debet.auto
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'totp'
              ? 'Еженедельное подтверждение входа через Google Authenticator'
              : 'Доступ защищен паролем. Записи доступны только владельцу.'}
          </p>
        </div>

        {/* 7-day indicator badge */}
        <div className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs mx-auto w-fit">
          <Calendar className="w-3.5 h-3.5" />
          <span>Сессия действует 7 дней (1 раз в неделю)</span>
        </div>

        {/* Mode switch if TOTP is enabled */}
        {isTotpEnabled && (
          <div className="flex rounded-xl bg-slate-950/60 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('totp'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'totp'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Authenticator</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('password'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'password'
                  ? 'bg-blue-600 text-white shadow-md'
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                6-значный код из приложения
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Например: 123456"
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                autoFocus
                className="w-full text-center tracking-[0.5em] text-2xl py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
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
                  className="w-full pl-4 pr-11 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-sm border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span>Запомнить авторизацию на 7 дней</span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Проверка...' : 'Войти в систему'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>2FA Защита Google Authenticator + AES-256</span>
          </p>
        </div>

      </div>
    </div>
  );
}
