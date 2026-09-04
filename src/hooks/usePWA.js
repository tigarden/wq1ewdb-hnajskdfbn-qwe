import { useState, useEffect, useCallback } from 'react';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Platform detection
  const userAgent = typeof window !== 'undefined' ? (window.navigator.userAgent || '') : '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window).MSStream;
  const isAndroid = /Android/i.test(userAgent);
  const isMobile = isIOS || isAndroid || /Mobile/i.test(userAgent);
  const isSafari = isIOS && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
  const isChrome = /Chrome|CriOS/i.test(userAgent) && !/Edg/i.test(userAgent);

  // Check standalone mode (already installed & opened from home screen)
  const checkStandalone = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);
    return isStandaloneMode;
  }, []);

  useEffect(() => {
    checkStandalone();

    // Check if dismissed before in localStorage
    try {
      const dismissed = localStorage.getItem('debet_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // ignore storage errors
    }

    // Capture Chrome/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const mql = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      setIsStandalone(e.matches);
    };
    mql.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mql.removeEventListener('change', handleDisplayModeChange);
    };
  }, [checkStandalone]);

  // Trigger native Chrome install dialog
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Install prompt error:', err);
      return false;
    }
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem('debet_pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  }, []);

  const resetDismiss = useCallback(() => {
    setIsDismissed(false);
    try {
      localStorage.removeItem('debet_pwa_banner_dismissed');
    } catch {
      // ignore
    }
  }, []);

  return {
    isStandalone,
    canInstall: Boolean(deferredPrompt),
    promptInstall,
    isIOS,
    isAndroid,
    isMobile,
    isSafari,
    isChrome,
    isDismissed,
    dismissBanner,
    resetDismiss,
  };
}
