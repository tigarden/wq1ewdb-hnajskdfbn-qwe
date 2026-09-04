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
  getStoredPasskeys,
  addStoredPasskey,
  removeStoredPasskey,
} from '../services/secureStorage';
import { generateTotpSecret, verifyTotpCode, getOtpAuthUrl } from '../services/totp';
import {
  registerPasskeyCredential,
  authenticateWithPasskey,
  isPasskeySupported,
} from '../services/passkey';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isTotpEnabled, setIsTotpEnabled] = useState(() => isStoredTotpEnabled());
  const [passkeys, setPasskeys] = useState(() => getStoredPasskeys());
  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check WebAuthn / Passkey platform support
  useEffect(() => {
    let mounted = true;
    isPasskeySupported().then((supported) => {
      if (mounted) setIsPasskeyAvailable(supported);
    });
    return () => {
      mounted = false;
    };
  }, []);

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

  // Unified Unlock: Enforces BOTH factors when 2FA is active
  const unlockApp = useCallback(async ({ password, totpCode, rememberMe = true }) => {
    setAuthError(null);
    try {
      // Factor 1: Master Password
      if (!password || !password.trim()) {
        const msg = 'Введите мастер-пароль';
        setAuthError(msg);
        return { success: false, error: msg };
      }

      const validPassword = await verifyMasterPassword(password.trim());
      if (!validPassword) {
        const msg = 'Неверный мастер-пароль';
        setAuthError(msg);
        return { success: false, error: msg };
      }

      // Factor 2: Google Authenticator (TOTP) if enabled
      if (isTotpEnabled) {
        const cleanCode = (totpCode || '').trim();
        if (!cleanCode || cleanCode.length !== 6) {
          const msg = 'Введите 6-значный проверочный код Google Authenticator';
          setAuthError(msg);
          return { success: false, error: msg };
        }

        const secret = getStoredTotpSecret();
        if (!secret) {
          const msg = 'Секрет 2FA не найден';
          setAuthError(msg);
          return { success: false, error: msg };
        }

        const validTotp = await verifyTotpCode(secret, cleanCode);
        if (!validTotp) {
          const msg = 'Неверный или устаревший 6-значный код Authenticator';
          setAuthError(msg);
          return { success: false, error: msg };
        }
      }

      // Session creation
      await createSecureSession(rememberMe);
      setIsUnlocked(true);
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Ошибка авторизации';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, [isTotpEnabled]);

  // Backward-compatible unlock with password wrapper
  const unlockWithPassword = useCallback(async (enteredPassword, rememberMe = true) => {
    const res = await unlockApp({ password: enteredPassword, rememberMe });
    return res.success;
  }, [unlockApp]);

  // Biometric / Apple Passkey unlock (Face ID, Touch ID, Windows Hello)
  const unlockWithPasskey = useCallback(async (rememberMe = true) => {
    setAuthError(null);
    try {
      const stored = getStoredPasskeys();
      const res = await authenticateWithPasskey(stored);
      if (res && res.success) {
        await createSecureSession(rememberMe);
        setIsUnlocked(true);
        return { success: true };
      }
      return { success: false, error: 'Не удалось подтвердить ключ доступа' };
    } catch (err) {
      const msg = err.message || 'Ошибка авторизации по ключу доступа';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // Passkey Registration
  const registerPasskey = useCallback(async (accountName) => {
    try {
      const cred = await registerPasskeyCredential(accountName);
      const updated = addStoredPasskey(cred);
      setPasskeys([...updated]);
      return { success: true, credential: cred };
    } catch (err) {
      return { success: false, error: err.message || 'Ошибка регистрации ключа доступа' };
    }
  }, []);

  // Delete Passkey
  const deletePasskey = useCallback(async (id) => {
    const updated = removeStoredPasskey(id);
    setPasskeys([...updated]);
    return { success: true };
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
    return { success: true };
  }, []);

  const disableTotp = useCallback(async () => {
    setStoredTotpSecret(null);
    setIsTotpEnabled(false);
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
    return { success: true };
  }, []);

  const value = {
    isUnlocked,
    isCheckingSession,
    isTotpEnabled,
    authError,
    unlockApp,
    unlockWithPassword,
    unlockWithPasskey,
    passkeys,
    isPasskeyAvailable,
    registerPasskey,
    deletePasskey,
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
