import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  verifyMasterPassword,
  updateMasterPassword,
  createSecureSession,
  validateSecureSession,
  clearSecureSession,
  getStoredTotpSecret,
  setStoredTotpSecret,
  isStoredTotpEnabled,
} from '../services/secureStorage';
import { generateTotpSecret, verifyTotpCode, getOtpAuthUrl } from '../services/totp';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isTotpEnabled, setIsTotpEnabled] = useState(() => isStoredTotpEnabled());
  const [authError, setAuthError] = useState(null);

  // Check existing secure session on initial mount
  useEffect(() => {
    let mounted = true;
    async function initSession() {
      try {
        const valid = await validateSecureSession();
        if (mounted) {
          setIsUnlocked(valid);
        }
      } catch (err) {
        if (mounted) setIsUnlocked(false);
      } finally {
        if (mounted) setIsCheckingSession(false);
      }
    }
    initSession();
    return () => {
      mounted = false;
    };
  }, []);

  // Unlock with Master Password (PIN)
  const unlockWithPassword = useCallback(async (enteredPassword, rememberMe = true) => {
    setAuthError(null);
    try {
      const valid = await verifyMasterPassword(enteredPassword);
      if (valid) {
        await createSecureSession(rememberMe);
        setIsUnlocked(true);

        // Also authenticate with backend if configured
        try {
          await api.login(enteredPassword, null, rememberMe ? 7 : 1);
        } catch (e) {
          // Backend offline or not configured is fine, local auth succeeds
        }
        return true;
      }
      setAuthError('Неверный пароль доступа');
      return false;
    } catch (err) {
      setAuthError(err.message || 'Ошибка проверки пароля');
      return false;
    }
  }, []);

  // Unlock with Google Authenticator (TOTP)
  const unlockWithTotp = useCallback(async (code, rememberMe = true) => {
    setAuthError(null);
    try {
      const secret = getStoredTotpSecret();
      if (!secret) {
        setAuthError('2FA не настроена');
        return false;
      }

      const valid = await verifyTotpCode(secret, code);
      if (valid) {
        await createSecureSession(rememberMe);
        setIsUnlocked(true);

        // Also attempt backend auth
        try {
          await api.login(null, code, rememberMe ? 7 : 1);
        } catch (e) {
          // Offline fallback
        }
        return true;
      }
      setAuthError('Неверный или устаревший 6-значный код');
      return false;
    } catch (err) {
      setAuthError(err.message || 'Ошибка проверки кода');
      return false;
    }
  }, []);

  // Setup / Enable 2FA Google Authenticator
  const getTotpSetupData = useCallback(() => {
    const existingSecret = getStoredTotpSecret();
    const secret = existingSecret || generateTotpSecret(32);
    const otpauthUrl = getOtpAuthUrl(secret, 'master@debet.auto', 'Debet.auto');
    return { secret, otpauthUrl };
  }, []);

  const enableTotp = useCallback(async (secret, code) => {
    const valid = await verifyTotpCode(secret, code);
    if (!valid) {
      return { success: false, error: 'Неверный 6-значный проверочный код из приложения' };
    }
    setStoredTotpSecret(secret);
    setIsTotpEnabled(true);

    // Sync to backend if connected
    try {
      await api.enableTotp(secret, code);
    } catch (e) {
      // Offline fallback
    }

    return { success: true };
  }, []);

  const disableTotp = useCallback(async () => {
    setStoredTotpSecret(null);
    setIsTotpEnabled(false);

    try {
      await api.disableTotp();
    } catch (e) {
      // Offline fallback
    }

    return { success: true };
  }, []);

  // Lock Application
  const lockApp = useCallback(() => {
    clearSecureSession();
    setIsUnlocked(false);
  }, []);

  // Change Master Password
  const changeMasterPassword = useCallback(async (oldPassword, newPassword) => {
    const valid = await verifyMasterPassword(oldPassword);
    if (!valid) {
      return { success: false, error: 'Текущий пароль указан неверно' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Новый пароль должен содержать не менее 4 символов' };
    }

    await updateMasterPassword(newPassword);

    // Sync to backend if connected
    try {
      await api.changePassword(oldPassword, newPassword);
    } catch (e) {
      // Offline fallback
    }

    return { success: true };
  }, []);

  const value = {
    isUnlocked,
    isCheckingSession,
    isTotpEnabled,
    authError,
    unlockWithPassword,
    unlockWithTotp,
    lockApp,
    changeMasterPassword,
    getTotpSetupData,
    enableTotp,
    disableTotp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
