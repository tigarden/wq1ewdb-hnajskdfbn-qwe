import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loadSettings, saveSettings } from '../services/storage';
import { fetchRepoFile, saveRepoFile } from '../services/githubApi';
import { api, getApiUrl, setApiUrl } from '../services/api';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  fetchSupabaseData,
  saveSupabaseData,
} from '../services/supabase';

const SyncContext = createContext(null);

export function SyncProvider({ children, data, onDataUpdated }) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [syncStatus, setSyncStatus] = useState(() => {
    const s = loadSettings();
    return s?.token ? 'synced' : 'idle';
  });
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(() => settings.lastSyncTime);
  const [currentSha, setCurrentSha] = useState(() => settings.lastSha);

  // Backend API state
  const [backendUrl, setBackendUrl] = useState(() => getApiUrl());
  const [backendHealth, setBackendHealth] = useState(() => {
    return getApiUrl() ? null : { status: 'not_configured' };
  });
  const [backendLoading, setBackendLoading] = useState(false);

  // Supabase Cloud state
  const [supabaseConfig, setSupabaseConfig] = useState(() => getSupabaseConfig());
  const [supabaseStatus, setSupabaseStatus] = useState('idle');
  const isPullingRef = useRef(false);

  // Check backend health
  const checkBackend = useCallback(async () => {
    const url = getApiUrl();
    if (!url) {
      setBackendHealth({ status: 'not_configured' });
      return null;
    }
    setBackendLoading(true);
    const res = await api.checkHealth();
    setBackendLoading(false);
    if (res.success) {
      setBackendHealth(res.data);
      return res.data;
    } else {
      setBackendHealth({ status: 'offline', error: res.error });
      return null;
    }
  }, []);

  useEffect(() => {
    if (getApiUrl()) {
      checkBackend();
    }
  }, [checkBackend]);

  const updateBackendUrl = useCallback(
    (newUrl) => {
      const clean = setApiUrl(newUrl);
      setBackendUrl(clean);
      if (clean) {
        checkBackend();
      } else {
        setBackendHealth({ status: 'not_configured' });
      }
    },
    [checkBackend]
  );

  // Sync with FastAPI / PostgreSQL
  const syncToPostgres = useCallback(async () => {
    setBackendLoading(true);
    try {
      const res = await api.importBackup(data);
      setBackendLoading(false);
      await checkBackend();
      return { success: true, message: res.message || 'Данные успешно сохранены в базу' };
    } catch (err) {
      setBackendLoading(false);
      return { success: false, error: err.message };
    }
  }, [data, checkBackend]);

  const pullFromPostgres = useCallback(async () => {
    setBackendLoading(true);
    try {
      const remoteData = await api.exportBackup();
      if (remoteData && (remoteData.clients || remoteData.suppliersList)) {
        isPullingRef.current = true;
        onDataUpdated(remoteData);
        setBackendLoading(false);
        await checkBackend();
        return { success: true };
      }
      setBackendLoading(false);
      return { success: false, error: 'В базе пока нет записей' };
    } catch (err) {
      setBackendLoading(false);
      return { success: false, error: err.message };
    }
  }, [onDataUpdated, checkBackend]);

  // Supabase Cloud sync
  const updateSupabase = useCallback((url, key) => {
    saveSupabaseConfig(url, key);
    setSupabaseConfig({ url, key });
  }, []);

  const syncToSupabase = useCallback(async () => {
    if (!supabaseConfig.url || !supabaseConfig.key) {
      return { success: false, error: 'Настройки Supabase не указаны' };
    }
    setSupabaseStatus('syncing');
    const res = await saveSupabaseData(supabaseConfig.url, supabaseConfig.key, data);
    if (res.success) {
      setSupabaseStatus('synced');
    } else {
      setSupabaseStatus('error');
    }
    return res;
  }, [supabaseConfig, data]);

  const pullFromSupabase = useCallback(async () => {
    if (!supabaseConfig.url || !supabaseConfig.key) {
      return { success: false, error: 'Настройки Supabase не указаны' };
    }
    setSupabaseStatus('syncing');
    const res = await fetchSupabaseData(supabaseConfig.url, supabaseConfig.key);
    if (res.success && res.data) {
      isPullingRef.current = true;
      onDataUpdated(res.data);
      setSupabaseStatus('synced');
      return { success: true, loaded: true };
    } else if (res.success && !res.data) {
      await saveSupabaseData(supabaseConfig.url, supabaseConfig.key, data);
      setSupabaseStatus('synced');
      return { success: true, loaded: false };
    } else {
      setSupabaseStatus('error');
      return { success: false, error: res.error };
    }
  }, [supabaseConfig, data, onDataUpdated]);

  // GitHub Settings & Sync
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const pushToGitHub = useCallback(
    async (commitMsg = 'Автоматическое сохранение') => {
      if (!settings.token) {
        return { success: false, error: 'Токен GitHub не указан' };
      }
      setSyncStatus('syncing');
      setSyncError(null);
      try {
        const res = await saveRepoFile(
          settings.token,
          settings.owner,
          settings.repo,
          settings.path,
          data,
          currentSha,
          commitMsg
        );
        const now = new Date().toISOString();
        setCurrentSha(res.sha);
        setLastSyncTime(now);
        updateSettings({ lastSyncTime: now, lastSha: res.sha });
        setSyncStatus('synced');
        return { success: true };
      } catch (err) {
        setSyncStatus('error');
        setSyncError(err.message);
        return { success: false, error: err.message };
      }
    },
    [settings, data, currentSha, updateSettings]
  );

  const pullFromGitHub = useCallback(async () => {
    if (!settings.token) {
      return { success: false, error: 'Токен GitHub не указан' };
    }
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const res = await fetchRepoFile(
        settings.token,
        settings.owner,
        settings.repo,
        settings.path
      );
      if (res.exists && res.data) {
        isPullingRef.current = true;
        onDataUpdated(res.data);
        const now = new Date().toISOString();
        setCurrentSha(res.sha);
        setLastSyncTime(now);
        updateSettings({ lastSyncTime: now, lastSha: res.sha });
        setSyncStatus('synced');
        return { success: true };
      }
      setSyncStatus('synced');
      return { success: false, error: 'Файл в репозитории пока не создан' };
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [settings, onDataUpdated, updateSettings]);

  // Zero-Touch Auto-Sync: фоновая автосинхронизация при старте и любых изменениях
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Авто-проверка и тихое обновление при открытии приложения
      if (settings?.token) {
        pullFromGitHub().catch(() => {});
      }
      if (supabaseConfig?.url && supabaseConfig?.key) {
        pullFromSupabase().catch(() => {});
      }
      return;
    }

    if (isPullingRef.current) {
      isPullingRef.current = false;
      return;
    }

    if (!settings?.token && (!supabaseConfig?.url || !supabaseConfig?.key)) return;

    setSyncStatus('unsaved');
    const timer = setTimeout(async () => {
      try {
        if (settings?.token) {
          await pushToGitHub('Автоматическое сохранение');
        }
        if (supabaseConfig?.url && supabaseConfig?.key) {
          await syncToSupabase();
        }
        setSyncStatus('synced');
      } catch (e) {
        console.warn('Auto-sync error:', e);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [data, settings?.token, supabaseConfig?.url, supabaseConfig?.key, pushToGitHub, pullFromGitHub, syncToSupabase, pullFromSupabase]);

  const value = {
    settings,
    updateSettings,
    syncStatus,
    syncError,
    lastSyncTime,
    pushToGitHub,
    pullFromGitHub,
    backendUrl,
    updateBackendUrl,
    backendHealth,
    backendLoading,
    checkBackend,
    syncToPostgres,
    pullFromPostgres,
    supabaseConfig,
    updateSupabase,
    syncToSupabase,
    pullFromSupabase,
    supabaseStatus,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
