import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Smartphone,
  Calendar,
  ShieldAlert,
  Fingerprint,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function LockScreen({ onUnlock }) {
  const {
    isTotpEnabled,
    unlockApp,
    unlockWithPasskey,
    passkeys = [],
    isPasskeyAvailable,
  } = useData();

  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const hasRegisteredKeys = passkeys && passkeys.length > 0;
  const canUsePasskey = hasRegisteredKeys || isPasskeyAvailable;

  // Biometric / Apple Passkey unlock
  const handlePasskeyLogin = async () => {
    setError(null);
    setPasskeyLoading(true);
    try {
      const res = await unlockWithPasskey(rememberMe);
      if (!res.success) {
        setError(res.error || 'Не удалось войти по ключу доступа');
      }
    } catch (err) {
      setError(err.message || 'Ошибка авторизации по ключу доступа');
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Password + 2FA Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanPass = password.trim();
    if (!cleanPass) {
      setError('Введите мастер-пароль доступа');
      return;
    }

    if (isTotpEnabled) {
      const cleanCode = totpCode.trim();
      if (!cleanCode || cleanCode.length !== 6) {
        setError('Введите 6-значный код из Google Authenticator');
        return;
      }
    }

    setLoading(true);
    try {
      const performUnlock = onUnlock || unlockApp;
      const res = await performUnlock({
        password: cleanPass,
        totpCode: isTotpEnabled ? totpCode.trim() : undefined,
        rememberMe,
      });

      if (!res || res.success === false) {
        setError(res?.error || 'Неверный мастер-пароль или 2FA-код');
      }
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/95 backdrop-blur-md animate-in fade-in duration-200 pt-[env(safe-area-inset-top,16px)] pb-[env(safe-area-inset-bottom,16px)]">
      <div className="relative w-full max-w-sm surface-card rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 border border-white/10 z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center shadow-inner">
            {canUsePasskey ? (
              <Fingerprint className="w-6 h-6 text-blue-400 animate-pulse" />
            ) : isTotpEnabled ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <Lock className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              Debet<span className="text-blue-400">.auto</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isTotpEnabled
                ? 'Двухфакторная защита (Пароль + 2FA)'
                : 'Шифрованный доступ AES-256'}
            </p>
          </div>
        </div>

        {/* 7-day indicator & 2FA status */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs mx-auto">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Сессия 7 дней</span>
          </div>
          {isTotpEnabled && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>2FA Активна</span>
            </div>
          )}
        </div>

        {/* Apple Face ID / Touch ID / Passkey Fast Unlock Button */}
        {canUsePasskey && (
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading || loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2.5 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50 border border-blue-400/30"
            >
              <Fingerprint className="w-5 h-5 text-blue-100" />
              <span>
                {passkeyLoading ? 'Считывание Face ID / ключа...' : 'Войти по Face ID / Passkey'}
              </span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-2 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                или паролем
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
          </div>
        )}

        {/* Unified Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Factor 1: Master Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Мастер-пароль (PIN)
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
                autoFocus={!canUsePasskey}
                className="w-full h-11 bg-slate-900 border border-white/15 rounded-xl px-3.5 pr-10 text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 transition-colors placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Factor 2: Google Authenticator (Required if 2FA enabled) */}
          {isTotpEnabled && (
            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-blue-300 flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Код Google Authenticator (2FA)</span>
                </label>
                <span className="text-[10px] text-blue-400/80 font-mono">6 цифр</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                className="w-full h-11 text-center tracking-[0.4em] text-lg bg-slate-900 border border-blue-500/30 rounded-xl text-blue-100 font-mono font-bold focus:outline-hidden focus:border-blue-400 transition-colors placeholder:text-slate-700"
              />
              <p className="text-[10px] text-slate-400 text-center">
                Обязательный второй фактор из приложения на телефоне
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-slate-400 hover:text-slate-200 transition-colors text-xs">
                Запомнить устройство (7 дней)
              </span>
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
            disabled={loading || passkeyLoading}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-1 cursor-pointer border border-white/10"
          >
            <span>
              {loading
                ? 'Проверка...'
                : isTotpEnabled
                ? 'Подтвердить вход (2FA)'
                : 'Войти в систему'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center space-x-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIDO2 Passkeys + 2FA TOTP + AES-256</span>
          </p>
        </div>

      </div>
    </div>
  );
}
