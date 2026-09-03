import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { loadLocalData, saveLocalData, loadSettings, saveSettings } from '../services/storage';
import { fetchRepoFile, saveRepoFile } from '../services/githubApi';
import { encryptData, decryptData } from '../services/crypto';

const DataContext = createContext(null);

const DEFAULT_MASTER_PASSWORD = '010700GkO';
const AUTH_STORAGE_KEY = 'debet_auth_session_v1';
const PASS_HASH_KEY = 'debet_custom_pass_v1';

export function DataProvider({ children }) {
  const [data, setData] = useState(() => loadLocalData());
  const [settings, setSettings] = useState(() => loadSettings());
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(() => settings.lastSyncTime);
  const [currentSha, setCurrentSha] = useState(() => settings.lastSha);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auth State
  const [isUnlocked, setIsUnlocked] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    return saved === 'unlocked';
  });
  const [currentPassword, setCurrentPassword] = useState(() => {
    return localStorage.getItem('debet_enc_pwd') || sessionStorage.getItem('debet_enc_pwd') || DEFAULT_MASTER_PASSWORD;
  });

  const unlockApp = useCallback((enteredPassword, rememberMe = true) => {
    const savedCustomPass = localStorage.getItem(PASS_HASH_KEY) || DEFAULT_MASTER_PASSWORD;
    if (enteredPassword === savedCustomPass) {
      setIsUnlocked(true);
      setCurrentPassword(enteredPassword);
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'unlocked');
        localStorage.setItem('debet_enc_pwd', enteredPassword);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'unlocked');
        sessionStorage.setItem('debet_enc_pwd', enteredPassword);
      }
      return true;
    }
    return false;
  }, []);

  const lockApp = useCallback(() => {
    setIsUnlocked(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('debet_enc_pwd');
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('debet_enc_pwd');
  }, []);

  const changeMasterPassword = useCallback((newPassword) => {
    localStorage.setItem(PASS_HASH_KEY, newPassword);
    setCurrentPassword(newPassword);
  }, []);

  // Update local storage
  const updateData = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveLocalData(next);
      setHasUnsavedChanges(true);
      setSyncStatus('unsaved');
      return next;
    });
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      saveSettings(merged);
      return merged;
    });
  }, []);

  // GitHub Push with AES-256
  const pushToGitHub = useCallback(async (customCommitMsg) => {
    if (!settings.token) {
      setSyncStatus('no_token');
      return { success: false, error: 'Токен GitHub не настроен' };
    }

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      let shaToUse = currentSha;
      try {
        const remote = await fetchRepoFile(settings.token, settings.owner, settings.repo, settings.path);
        if (remote.exists && remote.sha) {
          shaToUse = remote.sha;
        }
      } catch (e) {}

      const payloadToSave = await encryptData(data, currentPassword);

      const res = await saveRepoFile(
        settings.token,
        settings.owner,
        settings.repo,
        settings.path,
        payloadToSave,
        shaToUse,
        customCommitMsg || `Update debet records [${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}]`
      );

      const now = new Date().toISOString();
      setCurrentSha(res.sha);
      setLastSyncTime(now);
      setHasUnsavedChanges(false);
      setSyncStatus('synced');
      updateSettings({ lastSyncTime: now, lastSha: res.sha });

      return { success: true };
    } catch (err) {
      console.error('Error syncing to GitHub:', err);
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [settings, data, currentSha, currentPassword, updateSettings]);

  // GitHub Pull with AES-256
  const pullFromGitHub = useCallback(async () => {
    if (!settings.token) {
      setSyncStatus('no_token');
      return { success: false, error: 'Токен GitHub не настроен' };
    }

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const res = await fetchRepoFile(settings.token, settings.owner, settings.repo, settings.path);
      if (res.exists && res.data) {
        const decrypted = await decryptData(res.data, currentPassword);
        if (decrypted) {
          // Normalize if old format was saved
          const normalized = {
            ...loadLocalData(),
            ...decrypted,
            clients: decrypted.clients || decrypted.suppliers || loadLocalData().clients,
            clientTransactions: decrypted.clientTransactions || decrypted.supplierTransactions?.map(t => ({ ...t, clientId: t.supplierId })) || [],
          };
          setData(normalized);
          saveLocalData(normalized);
        }
        setCurrentSha(res.sha);
        const now = new Date().toISOString();
        setLastSyncTime(now);
        setHasUnsavedChanges(false);
        setSyncStatus('synced');
        updateSettings({ lastSyncTime: now, lastSha: res.sha });
        return { success: true, loaded: true };
      } else {
        await pushToGitHub('Initial encrypted debet data structure');
        return { success: true, created: true };
      }
    } catch (err) {
      console.error('Error pulling from GitHub:', err);
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [settings, currentPassword, pushToGitHub, updateSettings]);

  useEffect(() => {
    if (settings.token && settings.autoSync && isUnlocked) {
      pullFromGitHub();
    } else if (!settings.token) {
      setSyncStatus('no_token');
    }
  }, [isUnlocked]);

  // --- CRUD: Clients (Тотус, Тотус 2, Эрик, Витя...) ---
  const addClient = useCallback((name, initialBalance = 0, notes = '') => {
    const newCli = {
      id: 'cli-' + Date.now(),
      name: name.trim(),
      initialBalance: parseFloat(initialBalance) || 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      clients: [...prev.clients, newCli],
    }));
    return newCli;
  }, [updateData]);

  const updateClient = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, [updateData]);

  const deleteClient = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== id),
      clientTransactions: prev.clientTransactions.filter((t) => t.clientId !== id),
    }));
  }, [updateData]);

  // --- CRUD: Client Transactions (Детали/Заказы и Оплаты) ---
  const addClientTransaction = useCallback(({ clientId, type, article = '', description = '', carName = '', supplierName = '', amount, date, note = '' }) => {
    const newTx = {
      id: 'ctx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      clientId,
      type, // 'item' (деталь) or 'payment' (оплата)
      article: article.trim(),
      description: description.trim(),
      carName: carName.trim(), // Опционально: только для Эрика или Вити
      supplierName: supplierName.trim(), // Опционально: поставщик детали
      amount: parseFloat(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    updateData((prev) => ({
      ...prev,
      clientTransactions: [newTx, ...prev.clientTransactions],
    }));
    return newTx;
  }, [updateData]);

  const updateClientTransaction = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      clientTransactions: prev.clientTransactions.map((t) =>
        t.id === id ? { ...t, ...updates, amount: updates.amount !== undefined ? parseFloat(updates.amount) || 0 : t.amount } : t
      ),
    }));
  }, [updateData]);

  const deleteClientTransaction = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      clientTransactions: prev.clientTransactions.filter((t) => t.id !== id),
    }));
  }, [updateData]);

  // Calculation for Client: Initial + Items - Payments = Current Debt
  const getClientStats = useCallback((clientId) => {
    const client = data.clients.find((c) => c.id === clientId);
    if (!client) return null;

    const txs = (data.clientTransactions || [])
      .filter((t) => t.clientId === clientId)
      .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt) || (a.createdAt > b.createdAt ? 1 : -1));

    let runningDebt = client.initialBalance || 0;
    const timeline = txs.map((tx) => {
      if (tx.type === 'item') {
        runningDebt += tx.amount;
      } else if (tx.type === 'payment') {
        runningDebt -= tx.amount;
      }
      return {
        ...tx,
        runningDebt,
      };
    });

    const totalItems = txs.filter((t) => t.type === 'item').reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = txs.filter((t) => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
    const currentDebt = (client.initialBalance || 0) + totalItems - totalPayments;

    return {
      client,
      initialBalance: client.initialBalance || 0,
      totalItems,
      totalPayments,
      currentDebt,
      timeline: timeline.reverse(), // latest first
      itemsCount: txs.filter((t) => t.type === 'item').length,
      paymentsCount: txs.filter((t) => t.type === 'payment').length,
    };
  }, [data.clients, data.clientTransactions]);

  // --- Suppliers List (Справочник поставщиков для деталей) ---
  const addSupplierToDirectory = useCallback((supplierName) => {
    const name = supplierName.trim();
    if (!name) return;
    updateData((prev) => {
      const list = prev.suppliersList || [];
      if (list.includes(name)) return prev;
      return { ...prev, suppliersList: [...list, name] };
    });
  }, [updateData]);

  // --- CRUD: Other Counterparties («Другие») ---
  const addOtherCounterparty = useCallback(({ name, phone = '', notes = '' }) => {
    const newP = {
      id: 'oth-' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      otherCounterparties: [...(prev.otherCounterparties || []), newP],
    }));
    return newP;
  }, [updateData]);

  const deleteOtherCounterparty = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      otherCounterparties: prev.otherCounterparties.filter((p) => p.id !== id),
      otherTransactions: prev.otherTransactions.filter((t) => t.counterpartyId !== id),
    }));
  }, [updateData]);

  const addOtherTransaction = useCallback(({ counterpartyId, amount, note = '', date }) => {
    const newTx = {
      id: 'otx-' + Date.now(),
      counterpartyId,
      amount: parseFloat(amount) || 0,
      note: note.trim(),
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      otherTransactions: [newTx, ...prev.otherTransactions],
    }));
    return newTx;
  }, [updateData]);

  const deleteOtherTransaction = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      otherTransactions: prev.otherTransactions.filter((t) => t.id !== id),
    }));
  }, [updateData]);

  const getOtherCounterpartyStats = useCallback((counterpartyId) => {
    const p = (data.otherCounterparties || []).find((item) => item.id === counterpartyId);
    if (!p) return null;
    const txs = (data.otherTransactions || []).filter((t) => t.counterpartyId === counterpartyId);
    const balance = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
    return {
      person: p,
      transactions: txs,
      balance,
    };
  }, [data.otherCounterparties, data.otherTransactions]);

  // --- Global Summary Stats ---
  const globalSummary = useMemo(() => {
    let totalClientDebt = 0;
    (data.clients || []).forEach((c) => {
      const stats = getClientStats(c.id);
      if (stats) totalClientDebt += stats.currentDebt;
    });

    let totalOtherBalance = 0;
    (data.otherCounterparties || []).forEach((p) => {
      const stats = getOtherCounterpartyStats(p.id);
      if (stats) totalOtherBalance += stats.balance;
    });

    const grandBalance = totalClientDebt + totalOtherBalance;

    return {
      totalClientDebt,
      totalOtherBalance,
      grandBalance,
      clientsCount: (data.clients || []).length,
      totalItemsCount: (data.clientTransactions || []).filter((t) => t.type === 'item').length,
      totalPaymentsCount: (data.clientTransactions || []).filter((t) => t.type === 'payment').length,
    };
  }, [data, getClientStats, getOtherCounterpartyStats]);

  // --- Export to Excel (.xlsx) ---
  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['Отчет Debet.auto', new Date().toLocaleString('ru-RU')],
      [],
      ['Показатель', 'Сумма (грн)'],
      ['Общий долг клиентов', globalSummary.totalClientDebt],
      ['Взаиморасчеты (Другие)', globalSummary.totalOtherBalance],
      ['Общий сводный баланс', globalSummary.grandBalance],
      [],
      ['Клиент', 'Начальный долг', 'Начислено деталей', 'Оплачено', 'Текущий долг'],
    ];

    data.clients.forEach((c) => {
      const st = getClientStats(c.id);
      summaryData.push([c.name, st.initialBalance, st.totalItems, st.totalPayments, st.currentDebt]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка');

    data.clients.forEach((c) => {
      const st = getClientStats(c.id);
      const rows = [
        ['Клиент:', c.name],
        ['Начало:', st.initialBalance, 'Текущий долг:', st.currentDebt],
        [],
        ['Дата', 'Тип', 'Артикул', 'Наименование', 'Авто', 'Поставщик', 'Начислено (+)', 'Оплата (-)', 'Текущий долг'],
      ];

      const chronological = [...st.timeline].reverse();
      chronological.forEach((t) => {
        rows.push([
          t.date,
          t.type === 'item' ? 'Деталь' : 'Оплата',
          t.article || '',
          t.description || '',
          t.carName || '',
          t.supplierName || '',
          t.type === 'item' ? t.amount : '',
          t.type === 'payment' ? t.amount : '',
          t.runningDebt,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const safeName = c.name.substring(0, 30).replace(/[:\\/?*\[\]]/g, '_');
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });

    const otherRows = [['Контрагент', 'Телефон', 'Баланс (грн)']];
    (data.otherCounterparties || []).forEach((p) => {
      const st = getOtherCounterpartyStats(p.id);
      otherRows.push([p.name, p.phone, st.balance]);
    });
    const wsOther = XLSX.utils.aoa_to_sheet(otherRows);
    XLSX.utils.book_append_sheet(wb, wsOther, 'Другие');

    const fileName = `Debet_Auto_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, [data, globalSummary, getClientStats, getOtherCounterpartyStats]);

  const exportJsonBackup = useCallback(() => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debet_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJsonBackup = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.clients && !parsed.suppliers) {
        throw new Error('Некорректный формат файла резервной копии');
      }
      updateData(parsed);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [updateData]);

  const value = {
    data,
    settings,
    updateSettings,
    syncStatus,
    syncError,
    lastSyncTime,
    hasUnsavedChanges,
    pushToGitHub,
    pullFromGitHub,
    // Security
    isUnlocked,
    unlockApp,
    lockApp,
    changeMasterPassword,
    // Clients
    addClient,
    updateClient,
    deleteClient,
    addClientTransaction,
    updateClientTransaction,
    deleteClientTransaction,
    getClientStats,
    // Suppliers directory
    addSupplierToDirectory,
    // Other Counterparties
    addOtherCounterparty,
    deleteOtherCounterparty,
    addOtherTransaction,
    deleteOtherTransaction,
    getOtherCounterpartyStats,
    // Global Summary & Tools
    globalSummary,
    exportToExcel,
    exportJsonBackup,
    importJsonBackup,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
