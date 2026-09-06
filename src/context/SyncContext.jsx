import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loadSettings, saveSettings } from '../services/storage';
import { fetchRepoFile, saveRepoFile } from '../services/githubApi';
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

  // Supabase Cloud state
  const [supabaseConfig, setSupabaseConfig] = useState(() => getSupabaseConfig());
  const [supabaseStatus, setSupabaseStatus] = useState('idle');
  const isPullingRef = useRef(false);

  // Supabase Cloud sync
  const updateSupabase = useCallback((url, key) => {
    saveSupabaseConfig(url, key);
    setSupabaseConfig({ url, key });
  }, []);

  const syncToSupabase = useCallback(async () => {
    const cfg = supabaseConfigRef.current;
    if (!cfg.url || !cfg.key) {
      return { success: false, error: 'Настройки Supabase не указаны' };
    }
    setSupabaseStatus('syncing');
    const res = await saveSupabaseData(cfg.url, cfg.key, dataRef.current);
    if (res.success) {
      setSupabaseStatus('synced');
    } else {
      setSupabaseStatus('error');
    }
    return res;
  }, []);

  const pullFromSupabase = useCallback(async () => {
    const cfg = supabaseConfigRef.current;
    if (!cfg.url || !cfg.key) {
      return { success: false, error: 'Настройки Supabase не указаны' };
    }
    setSupabaseStatus('syncing');
    const res = await fetchSupabaseData(cfg.url, cfg.key);
    if (res.success && res.data) {
      isPullingRef.current = true;
      onDataUpdated(res.data);
      setSupabaseStatus('synced');
      return { success: true, loaded: true };
    } else if (res.success && !res.data) {
      await saveSupabaseData(cfg.url, cfg.key, dataRef.current);
      setSupabaseStatus('synced');
      return { success: true, loaded: false };
    } else {
      setSupabaseStatus('error');
      return { success: false, error: res.error };
    }
  }, [onDataUpdated]);

  // GitHub Settings & Sync
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const dataRef = useRef(data);
  dataRef.current = data;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const currentShaRef = useRef(currentSha);
  currentShaRef.current = currentSha;

  const supabaseConfigRef = useRef(supabaseConfig);
  supabaseConfigRef.current = supabaseConfig;

  const lastSyncedDataRef = useRef('');

  const pushToGitHub = useCallback(
    async (commitMsg = 'Автоматическое сохранение [skip ci]') => {
      const currentSettings = settingsRef.current;
      const currentData = dataRef.current;
      if (!currentSettings?.token) {
        return { success: false, error: 'Токен GitHub не указан' };
      }
      setSyncStatus('syncing');
      setSyncError(null);
      try {
        const msgWithSkipCi = commitMsg.includes('[skip ci]') || commitMsg.includes('[ci skip]')
          ? commitMsg
          : `${commitMsg} [skip ci]`;

        const res = await saveRepoFile(
          currentSettings.token,
          currentSettings.owner,
          currentSettings.repo,
          currentSettings.path,
          currentData,
          currentShaRef.current,
          msgWithSkipCi
        );
        const now = new Date().toISOString();
        setCurrentSha(res.sha);
        setLastSyncTime(now);
        lastSyncedDataRef.current = JSON.stringify(currentData);
        updateSettings({ lastSyncTime: now, lastSha: res.sha });
        setSyncStatus('synced');
        return { success: true };
      } catch (err) {
        setSyncStatus('error');
        setSyncError(err.message);
        return { success: false, error: err.message };
      }
    },
    [updateSettings]
  );

  const pullFromGitHub = useCallback(
    async (silent = false) => {
      const currentSettings = settingsRef.current;
      if (!currentSettings?.token) {
        return { success: false, error: 'Токен GitHub не указан' };
      }
      if (!silent) {
        setSyncStatus('syncing');
      }
      setSyncError(null);
      try {
        const res = await fetchRepoFile(
          currentSettings.token,
          currentSettings.owner,
          currentSettings.repo,
          currentSettings.path
        );
        if (res.exists && res.data) {
          isPullingRef.current = true;
          lastSyncedDataRef.current = JSON.stringify(res.data);
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
        if (!silent) {
          setSyncStatus('error');
          setSyncError(err.message);
        }
        return { success: false, error: err.message };
      }
    },
    [onDataUpdated, updateSettings]
  );

  // Initial quiet load from cloud on mount
  useEffect(() => {
    lastSyncedDataRef.current = JSON.stringify(dataRef.current);
    if (settingsRef.current?.token) {
      pullFromGitHub(true).catch(() => {});
    }
    if (supabaseConfigRef.current?.url && supabaseConfigRef.current?.key) {
      pullFromSupabase().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Event-driven auto-save: triggers ONLY on genuine data changes
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isPullingRef.current) {
      isPullingRef.current = false;
      return;
    }

    const currentDataStr = JSON.stringify(data);
    if (!lastSyncedDataRef.current) {
      lastSyncedDataRef.current = currentDataStr;
      return;
    }

    if (currentDataStr === lastSyncedDataRef.current) {
      return;
    }

    const canSyncGitHub = Boolean(settings?.token && settings?.autoSync !== false);
    const canSyncSupabase = Boolean(supabaseConfig?.url && supabaseConfig?.key);

    if (!canSyncGitHub && !canSyncSupabase) {
      return;
    }

    // Set unsaved indicator calmly
    setSyncStatus('unsaved');

    // Debounce save by 2.5 seconds
    const timer = setTimeout(async () => {
      try {
        if (canSyncSupabase) {
          await syncToSupabase();
        }
        if (canSyncGitHub) {
          await pushToGitHub('Автоматическое сохранение [skip ci]');
        }
        lastSyncedDataRef.current = JSON.stringify(dataRef.current);
      } catch (e) {
        console.warn('Auto-sync error:', e);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [data, settings?.token, settings?.autoSync, supabaseConfig?.url, supabaseConfig?.key, pushToGitHub, syncToSupabase]);

  const value = {
    settings,
    updateSettings,
    syncStatus,
    syncError,
    lastSyncTime,
    pushToGitHub,
    pullFromGitHub,
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
